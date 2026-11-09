import { Hono } from 'hono';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const authRouter = new Hono();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.get('/me', authMiddleware, AuthController.getMe);
authRouter.get('/user', authMiddleware, AuthController.getMe);

export default authRouter;
