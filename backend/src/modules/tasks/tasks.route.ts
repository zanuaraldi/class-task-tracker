import { Hono } from 'hono';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { isTeacher, isStudent } from '../../middlewares/role.middleware';

const tasksRouter = new Hono();

tasksRouter.use('*', authMiddleware);

tasksRouter.get('/', TasksController.getTasks);
tasksRouter.get('/upcoming', TasksController.getUpcomingTasks);
tasksRouter.post('/', isTeacher, TasksController.createTask);
tasksRouter.get('/:id', TasksController.getTaskById);
tasksRouter.put('/:id', isTeacher, TasksController.updateTask);
tasksRouter.delete('/:id', isTeacher, TasksController.deleteTask);
tasksRouter.post('/:id/complete', isStudent, TasksController.completeTask);
tasksRouter.delete('/:id/complete', isStudent, TasksController.uncompleteTask);
tasksRouter.get('/:id/completions', isTeacher, TasksController.getTaskCompletions);

export default tasksRouter;
