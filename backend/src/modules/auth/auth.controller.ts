import type { Context } from 'hono';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from './auth.validator';
import { successResponse } from '../../utils/response';
import type { JwtUserPayload } from '../../utils/jwt';

export class AuthController {
  static async register(c: Context) {
    const body = await c.req.json();
    const validatedData = registerSchema.parse(body);

    const result = await AuthService.register(validatedData);
    return c.json(
      successResponse(result, 'Registrasi berhasil. Selamat datang!'),
      201
    );
  }

  static async login(c: Context) {
    const body = await c.req.json();
    const validatedData = loginSchema.parse(body);

    const result = await AuthService.login(validatedData);
    return c.json(
      successResponse(result, 'Login berhasil.'),
      200
    );
  }

  static async getMe(c: Context) {
    const user = c.get('user') as JwtUserPayload;
    const profile = await AuthService.getProfile(user.id);

    return c.json(
      successResponse(profile, 'Profil berhasil dimuat.'),
      200
    );
  }
}
