import type { TaskStatus } from '../../constants';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  classId: number;
  dueDate?: string | Date | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  classId?: number;
  dueDate?: string | Date | null;
}

export interface TaskFilterParams {
  search?: string;
  status?: TaskStatus;
  dueStatus?: 'all' | 'due_soon' | 'overdue';
  classId?: number;
  page?: number;
  limit?: number;
}
