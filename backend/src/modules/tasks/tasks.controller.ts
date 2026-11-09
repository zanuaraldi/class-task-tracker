import type { Context } from 'hono';
import { TasksService } from './tasks.service';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from './tasks.validator';
import { successResponse, errorResponse } from '../../utils/response';
import type { JwtUserPayload } from '../../utils/jwt';

export class TasksController {
  static async createTask(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const body = await c.req.json();
    const validatedData = createTaskSchema.parse(body);

    const task = await TasksService.createTask(validatedData, user.id);
    return c.json(successResponse(task, 'Tugas berhasil dibuat.'), 201);
  }

  static async getTasks(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const query = c.req.query();
    const validatedQuery = taskQuerySchema.parse(query);

    const result = await TasksService.getTasks(validatedQuery, user);
    return c.json(successResponse(result, 'Daftar tugas berhasil dimuat.'));
  }

  static async getUpcomingTasks(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const tasks = await TasksService.getUpcomingTasks(user);
    return c.json(successResponse(tasks, 'Daftar tugas mendekati tenggat waktu berhasil dimuat.'));
  }

  static async getTaskStats(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const stats = await TasksService.getTaskStats(user);
    return c.json(successResponse(stats, 'Statistik tugas berhasil dimuat.'));
  }

  static async getTaskById(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    const task = await TasksService.getTaskById(id, user);
    return c.json(successResponse(task, 'Detail tugas berhasil dimuat.'));
  }

  static async updateTask(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    const body = await c.req.json();
    const validatedData = updateTaskSchema.parse(body);

    const updated = await TasksService.updateTask(id, validatedData, user.id);
    return c.json(successResponse(updated, 'Tugas berhasil diperbarui.'));
  }

  static async deleteTask(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    await TasksService.deleteTask(id, user.id);
    return c.json(successResponse(null, 'Tugas berhasil dihapus.'));
  }

  static async completeTask(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    const result = await TasksService.completeTask(id, user);
    return c.json(successResponse(result, 'Tugas berhasil ditandai selesai.'));
  }

  static async uncompleteTask(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    await TasksService.uncompleteTask(id, user);
    return c.json(successResponse(null, 'Status tugas berhasil diubah menjadi belum selesai.'));
  }

  static async getTaskCompletions(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID tugas tidak valid.'), 400);
    }

    const result = await TasksService.getTaskCompletions(id, user.id);
    return c.json(successResponse(result, 'Data progres siswa berhasil dimuat.'));
  }
}
