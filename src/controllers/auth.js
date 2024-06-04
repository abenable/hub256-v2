import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { promisify } from 'util';
import { UserModel } from '../models/users.js';
import { ApiError } from './error.js';
import { sendMail } from '../utils/email.js';
import { signToken } from '../utils/util.js';
import logger from '../utils/logger.js';

// Middleware to protect routes - checks if the user is authenticated
export const protect = async (req, res, next) => {
  try {
    logger.info('Protect middleware invoked');
    let token;
    // Check if the authorization header contains a Bearer token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies) {
      // If no Bearer token, check for token in cookies
      token = req.cookies.jwt;
    }

    if (!token) {
      // If no token found, return unauthorized error
      return next(
        new ApiError(
          401,
          'You are not logged in. Please log in to get access...'
        )
      );
    }

    // Verify the JWT token
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_PRIVATE_KEY
    );

    // Find the user based on the decoded ID from the token
    const currUser = await UserModel.findById(decoded.id).select('+password');
    if (!currUser) {
      // If user not found, return unauthorized error
      return next(new ApiError(401, 'Token no longer exists...'));
    }

    // Check if user changed their password after the token was issued
    if (currUser.changedPassAfter(decoded.iat)) {
      return next(new ApiError(401, 'Password changed. Log in again...'));
    }

    // Attach the current user to the request object
    req.user = currUser;
    next();
  } catch (error) {
    logger.error(`Protect middleware error: ${error}`);
    next(new ApiError(500, error.message));
  }
};

// Middleware to restrict access based on user roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    logger.info(`RestrictTo middleware invoked with roles: ${roles}`);
    if (!roles.includes(req.user.role)) {
      // If user's role is not allowed, return forbidden error
      return next(
        new ApiError(403, 'You are not allowed to access this route.')
      );
    }
    next();
  };
};

// Handler for forgot password request
export const forgotpassword = async (req, res, next) => {
  try {
    logger.info(`Forgot password handler invoked for email: ${req.body.email}`);
    // Get user by email
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return next(new ApiError(404, 'Email doesnt belong to any account..'));
    }

    //Generate reset password token
    const resetToken = user.createpassresetToken();
    await user.save();

    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/auth/resetpassword/${resetToken}`;

    const message = `Forgot your password? Copy and paste this code\n${resetToken} \nReset your password or Submit a patch request with new password to ${resetURL}\nIf you didnt forget password please ignore this email`;

    await sendMail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to your email',
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error}`);
    return next(new ApiError(500, error.message));
  }
};

// Handler for resetting user password
export const resetpassword = async (req, res, next) => {
  try {
    logger.info('Reset password handler invoked');
    const hashedtoken = crypto
      .createHash('sha256')
      .update(req.body.token)
      .digest('hex');
    const user = await UserModel.findOne({ passresettoken: hashedtoken });
    if (!user) {
      return next(new ApiError(400, 'Token invalid or expired'));
    }
    user.password = req.body.password;
    user.passresettoken = undefined;
    await user.save();

    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully....',
      token,
      UserId: user._id,
    });
  } catch (error) {
    logger.error(`Reset password error: ${error}`);
    return next(new ApiError(500, error.message));
  }
};

// Handler for updating user password
export const updatepassword = async (req, res, next) => {
  try {
    logger.info('Update password handler invoked');
    const { oldpassword, newpassword } = req.body;
    const user = await UserModel.findById(req.user.id).select('+password');
    logger.log(req.body);

    if (!(await user.correctPassword(oldpassword, user.password))) {
      return next(
        new ApiError(401, 'Incorrect password. Check it and try again.')
      );
    }

    user.password = newpassword;
    await user.save();

    const access_token = signToken(user._id);

    res
      .status(200)
      .cookie('jwt', access_token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .json({
        message: 'Password successfully updated.',
        access_token,
      });
  } catch (error) {
    logger.log(`Update password error: ${error}`);
    next(new ApiError(500, error.message));
  }
};

// Handler for user registration
export const Register = async (req, res, next) => {
  try {
    logger.info('Register handler invoked');
    const { firstName, lastName, email, password } = req.body;

    const checkemail = await UserModel.findOne({ email });
    if (checkemail) {
      return next(
        new ApiError(401, 'Email already taken. Use a different one.')
      );
    }
    const newUser = new UserModel({
      firstName,
      lastName,
      email,
      password,
    });
    await newUser.save();

    const access_token = signToken(newUser._id);

    res
      .status(201)
      .cookie('jwt', access_token, {
        httpOnly: true,
        secure: true,
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      })
      .json({
        status: 'success',
        message: 'User registered successfully.',
        User: newUser,
        access_token,
      });
    logger.info(
      `User ${newUser.username.toUpperCase()} registered successfully.`
    );
  } catch (error) {
    logger.error(`Register error: ${error}`);
    next(new ApiError(500, error.message));
  }
};

// Handler for admin user registration
export const AdminRegister = async (req, res, next) => {
  try {
    logger.info('Admin register handler invoked');
    const { username, email, password } = req.body;

    const checkemail = await UserModel.findOne({ email });
    if (checkemail) {
      return next(
        new ApiError(401, 'Email already taken. Use a different one.')
      );
    }
    const newAdmin = new UserModel({
      username,
      email,
      role: 'admin',
      password,
    });
    await newAdmin.save();

    const access_token = signToken(newAdmin._id);

    res
      .status(201)
      .cookie('jwt', access_token, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      })
      .json({
        status: 'success',
        message: 'User registered successfully.',
        User: newAdmin,
        access_token,
      });
    logger.info(
      `Admin ${newAdmin.username.toUpperCase()} registered successfully.`
    );
  } catch (error) {
    logger.error(`Admin register error: ${error}`);
    next(new ApiError(500, error.message));
  }
};

// Handler for user login
export const Login = async (req, res, next) => {
  try {
    logger.info('Login handler invoked');
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      return next(new ApiError(401, 'User doesnt exist........'));
    }

    if (!(await user.correctPassword(password, user.password))) {
      return next(
        new ApiError(401, 'Invalid credentials. Check them and try again.')
      );
    }
    //Sign the jwt token for the user..
    const access_token = signToken(user._id);

    user.isAuthenticated = true;
    await user.save();

    res
      .status(200)
      .cookie('jwt', access_token, {
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
      })
      .json({
        status: 'success',
        message: `Logged in as ${user.username.toUpperCase()}`,
        user,
      });
    logger.info(`User ${user.username.toUpperCase()} logged in successfully.`);
  } catch (error) {
    logger.error(`Login error: ${error}`);
    return next(new ApiError(500, error.message));
  }
};

// Handler for user logout
export const Logout = async (req, res, next) => {
  try {
    logger.info('Logout handler invoked');
    res
      .status(200)
      .cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true,
        secure: true,
      })
      .json({ status: 'success', message: 'Logged out successfully.' });
  } catch (error) {
    logger.error(`Logout error: ${error}`);
    return next(new ApiError(500, error.message));
  }
};
