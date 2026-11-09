import type { TaskStatus } from '@class-task-tracker/shared';

interface TaskFilterPillsProps {
  status: TaskStatus;
  dueStatus: 'all' | 'due_soon' | 'overdue';
  onStatusChange: (status: TaskStatus) => void;
  onDueStatusChange: (dueStatus: 'all' | 'due_soon' | 'overdue') => void;
}

export function TaskFilterPills({
  status,
  dueStatus,
  onStatusChange,
  onDueStatusChange,
}: TaskFilterPillsProps) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <div className="pills">
        <button
          type="button"
          className={status === 'all' ? 'on' : ''}
          onClick={() => onStatusChange('all')}
        >
          Semua
        </button>
        <button
          type="button"
          className={status === 'pending' ? 'on' : ''}
          onClick={() => onStatusChange('pending')}
        >
          Belum
        </button>
        <button
          type="button"
          className={status === 'completed' ? 'on' : ''}
          onClick={() => onStatusChange('completed')}
        >
          Selesai
        </button>
      </div>

      <div className="pills">
        <button
          type="button"
          className={dueStatus === 'all' ? 'on' : ''}
          onClick={() => onDueStatusChange('all')}
          title="Semua tenggat"
        >
          Semua Waktu
        </button>
        <button
          type="button"
          className={dueStatus === 'due_soon' ? 'on' : ''}
          onClick={() => onDueStatusChange(dueStatus === 'due_soon' ? 'all' : 'due_soon')}
          title="Tugas mendekati tenggat (H-2)"
        >
          ⚡ Segera
        </button>
        <button
          type="button"
          className={dueStatus === 'overdue' ? 'on' : ''}
          onClick={() => onDueStatusChange(dueStatus === 'overdue' ? 'all' : 'overdue')}
          title="Tugas melewati tenggat waktu"
        >
          ⚠️ Terlewat
        </button>
      </div>
    </div>
  );
}
