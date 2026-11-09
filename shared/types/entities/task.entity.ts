import type { Class } from './class.entity';
import type { User } from './user.entity';

export interface TaskCompletionStats {
  completedCount: number;
  totalStudents: number;
}

export interface Task {
  id: number;
  classId: number;
  teacherId: number;
  title: string;
  description?: string | null;
  dueDate?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  class?: Class | null;
  teacher?: User | null;
  isCompleted?: boolean;
  completedAt?: string | Date | null;
  isOverdue?: boolean;
  isDueSoon?: boolean;
  completionStats?: TaskCompletionStats;
}
