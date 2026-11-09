import { Hono } from 'hono';
import api from './api';

const routes = new Hono();

routes.route('/api', api);

export default routes;
