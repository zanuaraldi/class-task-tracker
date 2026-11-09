import type { UserRole } from '../../constants';
import type { Class } from './class.entity';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  classId?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  enrolledClass?: Class | null;
}
