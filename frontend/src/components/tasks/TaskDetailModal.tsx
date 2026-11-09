import type { Task } from '@class-task-tracker/shared';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatDateTime, getDaysRemaining } from '../../utils/date';
import { Icon } from '../ui/Icon';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleComplete?: (task: Task) => Promise<void>;
  isToggling?: boolean;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onToggleComplete,
  isToggling = false,
}: TaskDetailModalProps) {
  const { user } = useAuth();
  if (!isOpen || !task) return null;

  const isStudent = user?.role === 'student';
  const diffDays = getDaysRemaining(task.dueDate);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', lineHeight: '1.3' }}>
              {task.title}
            </h2>
            <p className="muted" style={{ marginTop: '4px' }}>
              {task.class?.name || `Kelas ${task.classId}`}
              {task.teacher?.name ? ` · Guru: ${task.teacher.name}` : ''}
            </p>
          </div>
          <button
            type="button"
            className="acts"
            onClick={onClose}
            title="Tutup dialog"
            style={{ border: 'none', background: 'none' }}
          >
            <span style={{ fontSize: '24px', cursor: 'pointer', lineHeight: '1' }}>&times;</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '14px 0 16px' }}>
          <span className="chip">
            <Icon name="clock" size={12} />
            Tenggat: {formatDate(task.dueDate)}
          </span>

          {task.isCompleted ? (
            <span className="chip ok">
              <i />
              Selesai {task.completedAt ? `· ${formatDateTime(task.completedAt)}` : ''}
            </span>
          ) : diffDays < 0 ? (
            <span className="chip late">
              <i />
              Terlewat ({Math.abs(diffDays)} hari lalu)
            </span>
          ) : diffDays <= 2 ? (
            <span className="chip warn">
              <i />
              Segera ({diffDays === 0 ? 'Hari ini' : `H-${diffDays}`})
            </span>
          ) : (
            <span className="chip">
              <i />
              Berjalan
            </span>
          )}
        </div>

        <div style={{ margin: '14px 0' }}>
          <label style={{ fontWeight: '600', color: '#333', fontSize: '13px' }}>
            Deskripsi / Instruksi Tugas:
          </label>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              background: '#f8f8f8',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid #ebebeb',
              marginTop: '6px',
              fontSize: '13px',
              maxHeight: '260px',
              overflowY: 'auto',
            }}
          >
            {task.description ? task.description : 'Tidak ada catatan atau instruksi tambahan.'}
          </div>
        </div>

        <div className="dlg-f" style={{ marginTop: '20px' }}>
          <button type="button" className="btn ghost" onClick={onClose}>
            Tutup
          </button>

          {isStudent && onToggleComplete && (
            <button
              type="button"
              className={`btn lime ${isToggling ? 'loading' : ''}`}
              onClick={() => onToggleComplete(task)}
              disabled={isToggling}
            >
              {task.isCompleted ? 'Batalkan Selesai' : 'Tandai Selesai'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
