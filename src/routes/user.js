import express from 'express';
import axios from 'axios';
import { protect, restrictTo } from '../controllers/auth.js';
import { ApiError } from '../controllers/error.js';
import { SubscriberModel } from '../models/subscribers.js';
import logger from '../utils/logger.js';
import {
  allUsers,
  delUser,
  searchUser,
  updateProfile,
  userProfile,
} from '../controllers/user.js';
import multer from 'multer';

const router = express.Router();
const Token = process.env.CLOUDFLARE_TOKEN;

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


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

router.patch('/profile', protect, upload.single('image'), (req, res) => {
  logger.info('Update user profile request received');
  updateProfile(req, res);
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
    res.status(200).json(emails);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/pageViews', async (req, res, next) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 2);
  const formattedDate = currentDate.toISOString().split('T')[0];

  const data = {
    "query": `query { viewer { zones(filter: {zoneTag: \"cec05905563ee4ccbcb1e2df8185ab04\"}) { httpRequests1dGroups(limit: 1, filter: {date_gt: \"${formattedDate}\"}) { dimensions { date } sum { requests pageViews } } } } }`
  };

  try {
    const response = await axios.post(
      'https://api.cloudflare.com/client/v4/graphql',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Key': Token,
          'X-Auth-EMAIL': 'ableabenaitwe@gmail.com',
        },
      }
    );
    logger.info('response', response.data);
    const pageViews = response.data.data.viewer.zones[0].httpRequests1dGroups[0].sum.pageViews;
    logger.info('pageViews', pageViews);
    res.status(200).json(pageViews);
  } catch (error) {
    logger.error(error.message);
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
