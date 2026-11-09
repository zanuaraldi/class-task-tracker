import { Hono } from 'hono';
import authRouter from '../modules/auth/auth.route';
import classesRouter from '../modules/classes/classes.route';
import tasksRouter from '../modules/tasks/tasks.route';

const api = new Hono();

api.route('/auth', authRouter);
api.route('/classes', classesRouter);
api.route('/tasks', tasksRouter);

export default api;
