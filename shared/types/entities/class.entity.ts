import type { User } from './user.entity';

export interface Class {
  id: number;
  name: string;
  teacherId?: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  teacher?: User | null;
  studentsCount?: number;
}
