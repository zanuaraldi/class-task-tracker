import type { Task } from '@class-task-tracker/shared';
import { TaskRow } from './TaskRow';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onRetry: () => void;
  onToggleComplete: (task: Task) => Promise<void>;
  onOpenDetail: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onMonitorCompletions?: (task: Task) => void;
  togglingId?: number | null;
}

export function TaskList({
  tasks,
  isLoading,
  error,
  page,
  totalPages,
  total,
  onPageChange,
  onRetry,
  onToggleComplete,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onMonitorCompletions,
  togglingId,
}: TaskListProps) {
  if (isLoading) {
    return (
      <ul className="list">
        <li className="state">
          <span className="spin" />
          Memuat daftar tugas...
        </li>
      </ul>
    );
  }

  if (error) {
    return (
      <ul className="list">
        <li className="state err">
          {error}{' '}
          <button type="button" className="link" onClick={onRetry}>
            Coba lagi
          </button>
        </li>
      </ul>
    );
  }

  if (tasks.length === 0) {
    return (
      <ul className="list">
        <li className="state">
          Tidak ada tugas yang sesuai dengan kriteria filter atau pencarian saat ini.
        </li>
      </ul>
    );
  }

  return (
    <>
      <ul className="list">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onOpenDetail={onOpenDetail}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onMonitorCompletions={onMonitorCompletions}
            isToggling={togglingId === task.id}
          />
        ))}
      </ul>

      <div className="pager">
        <span>
          Hal {page} dari {Math.max(1, totalPages)} · {total} tugas
        </span>
        <div>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Halaman sebelumnya"
            title="Halaman sebelumnya"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Halaman berikutnya"
            title="Halaman berikutnya"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
