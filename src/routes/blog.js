import express from 'express';
import { ApiError } from '../controllers/error.js';
import { BlogModel } from '../models/blogs.js';
import { protect, restrictTo } from '../controllers/auth.js';
import logger from '../utils/logger.js';
import multer from 'multer';
import { s3 } from '../utils/util.js';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post('/post', protect, upload.single('blogImage'), async (req, res, next) => {
  const { title, description, content, category } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: "Missing required fields" })
  }

  const imageName = crypto.randomBytes(16).toString('hex');
  try {
    const blog = await BlogModel.create({
      title,
      category,
      description,
      content,
      image: imageName,
      author: req.user.id,
    });

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: imageName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }))

    logger.info('Blog created successfully:', blog);

    res.status(201).json({
      status: 'success',
      blog,
      message: 'Blog created successfully.',
    });
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});
router.get('/all', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find();
    for (const blog of blogs) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: blog.image
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      blog.image = url
    }
    logger.info('Retrieved all blogs', blogs);
    res.status(200).json(blogs);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({ category: req.params.category });
    for (const blog of blogs) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: blog.image
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      blog.image = url
    }
    logger.info(
      `Retrieved blogs for category "${req.params.category}":`,
      blogs
    );

    res.status(200).json(blogs);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/id/:id', async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      logger.info(`Blog with ID "${req.params.id}" not found.`);
      return res.status(404).json({
        status: 'Failed',
        message: 'Blog not found.',
      });
    }
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: blog.image
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    blog.image = url


    logger.info('Retrieved blog by ID:', blog);

    res.status(200).json(blog);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const blogs = await BlogModel.find({
      $text: { $search: req.params.query },
    });
    for (const blog of blogs) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: blog.image
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      blog.image = url
    }

    logger.info('Retrieved blogs by search query:', blogs);

    res.status(200).json({ blogs });
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.get('/latest', async (req, res) => {
  try {
    const latestPosts = await BlogModel.find()
      .sort({ publishedAt: -1 })
      .limit(3);
    for (const blog of blogs) {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: blog.image
      })
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      blog.image = url
    }

    logger.info('Retrieved latest posts:', latestPosts);

    res.json(latestPosts);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Could not retrieve latest posts.' });
  }
});

router.get('/recommended', async (req, res, next) => {
  try {
    const recommendedPost = await BlogModel.findOne({
      recommendedByEditor: true,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: blog.image
    });
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    blog.image = url

    logger.info('Retrieved recommended post:', recommendedPost);

    res.json(recommendedPost);
  } catch (error) {
    logger.error(error);
    next(new ApiError(500, 'internal server error'));
  }
});

router.delete('/delete/:id', protect, async (req, res, next) => {
  try {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      logger.info(`Blog with ID "${req.params.id}" not found.`);
      res.status(404).json({
        status: 'Failed',
        message: 'Blog not found..',
      });
    }
    if (req.user.id == blog.author.id || req.user.role == 'admin') {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: blog.image
      }))
      const response = await BlogModel.findByIdAndDelete(blog.id);

      logger.info('Deleted blog:', response);

      res.status(200).json({
        status: 'success',
        message: response,
      });
    } else {
      logger.info('User is not allowed to perform this action.');
      return res.status(403).json({
        status: 'Failed',
        message: 'You are not allowed to perform this action.',
      });
    }
  } catch (error) {
    logger.error(error.message);
    next(new ApiError(500, 'Internal server error.'));
  }
});

router.delete('/del-all', protect, restrictTo('admin'), async (req, res) => {
  try {
    const blogs = await BlogModel.deleteMany();

    logger.info('Deleted all blogs:', blogs);

    res.status(200).json({ blogs });
  } catch (error) {
    logger.error(error);
  }
});

router.all('*', (req, res, next) => {
  next(
    new ApiError(404, `Oooops!! Can't find ${req.originalUrl} on this server!`)
  );
});

export { router as blogRouter };
