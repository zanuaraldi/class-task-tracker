import type { Context, Next } from 'hono';
import type { UserRole } from '@class-task-tracker/shared';
import { errorResponse } from '../utils/response';
import type { JwtUserPayload } from '../utils/jwt';

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user') as JwtUserPayload | undefined;
    if (!user) {
      return c.json(errorResponse('Belum terautentikasi'), 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        errorResponse(
          `Akses ditolak. Fitur ini hanya dapat diakses oleh: ${allowedRoles.join(', ')}.`
        ),
        403
      );
    }

    await next();
  };
};

export const isTeacher = requireRole(['teacher']);
export const isStudent = requireRole(['student']);
