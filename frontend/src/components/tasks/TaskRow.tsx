import type { Task } from '@class-task-tracker/shared';
import { useAuth } from '../../context/AuthContext';
import { formatDate, getDaysRemaining } from '../../utils/date';
import { Icon } from '../ui/Icon';

interface TaskRowProps {
  task: Task;
  onToggleComplete: (task: Task) => Promise<void>;
  onOpenDetail: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onMonitorCompletions?: (task: Task) => void;
  isToggling?: boolean;
}

export function TaskRow({
  task,
  onToggleComplete,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onMonitorCompletions,
  isToggling = false,
}: TaskRowProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const diffDays = getDaysRemaining(task.dueDate);

  const getStatusChip = () => {
    if (task.isCompleted) {
      return { className: 'ok', label: `Selesai · ${formatDate(task.dueDate)}` };
    }
    if (diffDays < 0) {
      return { className: 'late', label: `Lewat tenggat · ${formatDate(task.dueDate)}` };
    }
    if (diffDays <= 2) {
      return {
        className: 'warn',
        label: `${diffDays === 0 ? 'Hari ini' : `H-${diffDays}`} · ${formatDate(task.dueDate)}`,
      };
    }
    return { className: '', label: `Berjalan · ${formatDate(task.dueDate)}` };
  };

  const statusChip = getStatusChip();

  const completedCount = task.completionStats?.completedCount || 0;
  const totalStudents = task.completionStats?.totalStudents || 0;

  return (
    <li className={`row ${task.isCompleted ? 'is-done' : ''}`}>
      {!isTeacher && (
        <button
          type="button"
          className={`tick ${task.isCompleted ? 'on' : ''}`}
          onClick={() => onToggleComplete(task)}
          disabled={isToggling}
          aria-label={task.isCompleted ? 'Batalkan selesai' : 'Tandai selesai'}
          title={task.isCompleted ? 'Klik untuk batalkan selesai' : 'Klik untuk tandai selesai'}
        >
          {task.isCompleted && <Icon name="check" size={14} />}
        </button>
      )}

      <div
        className="rt"
        onClick={() => onOpenDetail(task)}
        style={{ cursor: 'pointer' }}
        title="Klik untuk melihat detail tugas"
      >
        <b>{task.title}</b>
        <p>{task.description ? task.description : 'Tanpa deskripsi rinci'}</p>

        <div className="chips">
          <span className="chip">
            {task.class?.name || `Kelas ${task.classId}`}
          </span>

          <span className={`chip ${statusChip.className}`}>
            <i />
            {statusChip.label}
          </span>

          {isTeacher && (
            <span className="chip">
              <Icon name="users" size={12} />
              {completedCount}/{totalStudents} siswa selesai
            </span>
          )}
        </div>
      </div>

      {isTeacher && (
        <div className="acts">
          {onMonitorCompletions && (
            <button
              type="button"
              onClick={() => onMonitorCompletions(task)}
              title="Pantau progres siswa di kelas ini"
              aria-label="Pantau progres siswa"
            >
              <Icon name="users" size={16} />
            </button>
          )}

          {onEditTask && (
            <button
              type="button"
              onClick={() => onEditTask(task)}
              title="Ubah tugas"
              aria-label="Ubah tugas"
            >
              <Icon name="edit" size={15} />
            </button>
          )}

          {onDeleteTask && (
            <button
              type="button"
              className="danger"
              onClick={() => onDeleteTask(task)}
              title="Hapus tugas"
              aria-label="Hapus tugas"
            >
              <Icon name="trash" size={15} />
            </button>
          )}
        </div>
      )}
    </li>
  );
}
