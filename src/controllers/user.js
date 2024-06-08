import { ApiError } from './error.js';
import { UserModel } from '../models/users.js';
import logger from '../utils/logger.js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from '../utils/util.js';

export const allUsers = async (req, res) => {
  try {
    logger.info('Fetching all users');
    const users = await UserModel.find();
    for (const user of users) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.image
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.image = url
    }
    logger.info(`Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    logger.error(`An error occurred while fetching users: ${error}`);
    new ApiError(500, 'An error occurred while fetching users.');
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: user.image
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    user.image = url

    logger.info(`Fetched user profile with id ${req.params.id}`);
    res.json(user);
  } catch (error) {
    logger.error(`An error occurred while fetching user profile: ${error}`);
    new ApiError(500, 'An error occurred while fetching user profile.');
  }
};

export const delUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    logger.info(`Deleting user with id ${userId}`);
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      logger.warn(`User with id ${userId} not found`);
      return res.status(404).json({ message: 'User not found.' });
    }
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: deletedUser.image
    }))
    logger.info(`Deleted user with id ${userId}`);
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    logger.error(`An error occurred while deleting the user: ${error}`);
    new ApiError(500, 'An error occurred while deleting the user.');
  }
};

export const searchUser = async (req, res) => {
  try {
    const query = new RegExp(req.query.name);
    logger.info(`Searching for user with name ${req.query.name}`);
    const user = await UserModel.find({
      $or: [
        { username: { $regex: query } },
        { firstName: { $regex: query } },
        { lastName: { $regex: query } },
      ],
    });
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: user.image
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    user.image = url

    if (!user) {
      logger.warn(`User with name ${req.query.name} not found`);
      return res.status(404).json({ message: 'User not found.' });
    }
    logger.info(`Found user with name ${req.query.name}`);
    res.json(user);
  } catch (error) {
    logger.error(`An error occurred while searching for the user: ${error}`);
    new ApiError(500, 'An error occurred while searching for the user.');
  }
};
