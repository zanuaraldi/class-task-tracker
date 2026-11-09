import { Hono } from 'hono';
import { ClassesController } from './classes.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const classesRouter = new Hono();

classesRouter.use('*', authMiddleware);

classesRouter.get('/', ClassesController.getAll);
classesRouter.get('/:id', ClassesController.getById);

export default classesRouter;
