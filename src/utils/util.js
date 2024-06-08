import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { S3Client } from '@aws-sdk/client-s3';

export const getDirname = (moduleUrl) => {
  return path.dirname
    (fileURLToPath(moduleUrl));
};

export const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_PRIVATE_KEY);
};

export const limiter = rateLimit({
  max: 150000000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour',
});

export const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKeyId,
    secretAccessKey: awsSecretAccessKey,
  },
  region: awsRegion
});