import type { Context } from 'hono';
import { ClassesService } from './classes.service';
import { successResponse, errorResponse } from '../../utils/response';

export class ClassesController {
  static async getAll(c: Context) {
    const data = await ClassesService.getAll();
    return c.json(successResponse(data, 'Daftar kelas berhasil dimuat.'));
  }

  static async getById(c: Context) {
    const id = Number(c.req.param('id'));
    if (isNaN(id) || id <= 0) {
      return c.json(errorResponse('ID kelas tidak valid.'), 400);
    }

    const data = await ClassesService.getById(id);
    return c.json(successResponse(data, 'Detail kelas berhasil dimuat.'));
  }
}
