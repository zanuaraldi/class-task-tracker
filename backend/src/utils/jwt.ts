import { sign, verify } from 'hono/jwt';
import type { UserRole } from '@class-task-tracker/shared';

export interface JwtUserPayload {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  classId?: number | null;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'schooltech_dev_secret_key_2026';

export const signJwt = async (
  payload: Omit<JwtUserPayload, 'exp'>,
  expiresInSeconds = 7 * 24 * 60 * 60
): Promise<string> => {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  return sign({ ...payload, exp }, JWT_SECRET);
};

export const verifyJwt = async (token: string): Promise<JwtUserPayload> => {
  const payload = await verify(token, JWT_SECRET);
  return payload as unknown as JwtUserPayload;
};
