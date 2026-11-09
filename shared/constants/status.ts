export const TASK_STATUS = ['all', 'completed', 'pending'] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  all: 'Semua Status',
  completed: 'Sudah Selesai',
  pending: 'Perlu Dikerjakan',
};
