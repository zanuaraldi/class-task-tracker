import type { Task } from './task.entity';
import type { User } from './user.entity';

export interface TaskCompletion {
  id: number;
  taskId: number;
  studentId: number;
  completedAt: string | Date;
  task?: Task | null;
  student?: User | null;
}

export interface StudentCompletionStatus {
  id: number;
  name: string;
  email: string;
  isCompleted: boolean;
  completedAt?: string | Date | null;
}
