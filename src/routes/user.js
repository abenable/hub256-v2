import express from 'express';
import { protect, restrictTo } from '../controllers/auth.js';
import { ApiError } from '../controllers/error.js';
import { SubscriberModel } from '../models/subscribers.js';
import logger from '../utils/logger.js';
import {
  allUsers,
  delUser,
  searchUser,
  userProfile,
} from '../controllers/user.js';

const router = express.Router();

router.delete(
  '/delete/:userId',
  protect,
  restrictTo('admin'),
  (req, res, next) => {
    logger.info('Delete user request received');
    delUser(req, res, next);
  }
);

router.get('/search', protect, restrictTo('admin'), (req, res, next) => {
  logger.info('Search user request received');
  searchUser(req, res, next);
});

router.get('', protect, restrictTo('admin'), (req, res, next) => {
  logger.info('Get all users request received');
  allUsers(req, res, next);
});

router.get('/profile/:id', protect, (req, res, next) => {
  logger.info('Get user profile request received');
  userProfile(req, res, next);
});

router.post('/subscribe', async (req, res, next) => {
  try {
    const subscriber = await SubscriberModel.findOne({ email: req.body.email });
    if (subscriber) {
      return next(new ApiError(401, 'Email has already subscribed..'));
    }
    await SubscriberModel.create({
      email: req.body.email,
      subscribedAt: Date.now(),
    });

    logger.info('Subscription successful');
    res.status(200).json({
      status: 'success',
      message: 'Subscription successful',
    });
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.patch('/unsubscribe', async (req, res, next) => {
  try {
    const subscriber = await SubscriberModel.findOne({ email: req.body.email });
    if (!subscriber) {
      return next(new ApiError(404, 'Email not found'));
    }
    subscriber.active = false;
    await subscriber.save();
    logger.info('Unsubscribed successfully');
    res.status(200).json({
      status: 'success',
      message: 'Unsubscribed successfully',
    });
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/subscribers', async (req, res, next) => {
  try {
    const subscribers = await SubscriberModel.find({ active: true });
    const emails = subscribers.map((item) => item.email);
    logger.info('Retrieved subscribers');
    res.status(200).json(emails);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.all('*', (req, res, next) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

export { router as userRouter };
