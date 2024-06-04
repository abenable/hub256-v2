import { Router } from 'express';
import { authRouter } from '../routes/auth.js';
import { userRouter } from '../routes/user.js';
import { blogRouter } from '../routes/blog.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/blog', blogRouter);

export default router;