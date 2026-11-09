import type { UserRole } from '../../constants';
import type { User } from '../entities';
import type { ApiResponse } from './api-response';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  classId?: number | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export type AuthResponse = ApiResponse<AuthData>;
