import type { Task } from '@class-task-tracker/shared';

interface UpcomingTasksCardProps {
  tasks: Task[];
}

function formatDate(val: string | Date | null | undefined): string {
  if (!val) return 'Tanpa tenggat';
  const d = new Date(val);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getDaysRemaining(val: string | Date | null | undefined): number {
  if (!val) return 999;
  const target = new Date(val).setHours(0, 0, 0, 0);
  const now = new Date().setHours(0, 0, 0, 0);
  return Math.round((target - now) / (1000 * 60 * 60 * 24));
}

export function UpcomingTasksCard({ tasks }: UpcomingTasksCardProps) {
  return (
    <article className="card" id="soon">
      <div className="card-h">
        <h2>Tenggat Terdekat</h2>
      </div>

      <ul className="soon">
        {tasks.length > 0 ? (
          tasks.map((task) => {
            const diffDays = getDaysRemaining(task.dueDate);
            const badgeLabel =
              diffDays === 0
                ? 'Hari ini'
                : diffDays < 0
                ? 'Terlewat'
                : `H-${diffDays}`;

            return (
              <li key={task.id}>
                <div>
                  <b>{task.title}</b>
                  <small>
                    {task.class?.name || `Kelas ${task.classId}`} · {formatDate(task.dueDate)}
                  </small>
                </div>
                <span className={`chip ${diffDays <= 0 ? 'late' : 'warn'}`}>
                  <i />
                  {badgeLabel}
                </span>
              </li>
            );
          })
        ) : (
          <li className="muted" style={{ padding: '12px 0' }}>
            Tidak ada tugas yang mendekati tenggat.
          </li>
        )}
      </ul>
    </article>
  );
}
