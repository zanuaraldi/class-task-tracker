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

export interface TaskWeekDayActivity {
  done: number;
  pending: number;
}

export interface TaskStatsData {
  total: number;
  done: number;
  pending: number;
  completion: number;
  dueSoon: number;
  due_soon: number;
  week: TaskWeekDayActivity[];
  soon: any[];
}
