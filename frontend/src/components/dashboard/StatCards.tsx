import type { TaskStatsData } from '@class-task-tracker/shared';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

interface StatCardsProps {
  stats: TaskStatsData | null;
}

export function StatCards({ stats }: StatCardsProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const total = stats?.total || 0;
  const done = stats?.done || 0;
  const completion = stats?.completion || 0;
  const dueSoon = stats?.dueSoon ?? stats?.due_soon ?? 0;

  return (
    <section className="stats">
      <div className="stat">
        <div className="ico">
          <Icon name="task" size={20} />
        </div>
        <div>
          <b>{total}</b>
          <p>Total Tugas</p>
        </div>
      </div>

      <div className="stat">
        <div className="ico">
          <Icon name="check" size={20} />
        </div>
        <div>
          <b>{done}</b>
          <span className="badge">{completion}%</span>
          <p>{isTeacher ? 'Pengumpulan Selesai' : 'Tugas Selesai'}</p>
        </div>
      </div>

      <div className="stat">
        <div className="ico">
          <Icon name="clock" size={20} />
        </div>
        <div>
          <b>{dueSoon}</b>
          {dueSoon > 0 && <span className="badge red">H-2</span>}
          <p>Segera Tenggat</p>
        </div>
      </div>
    </section>
  );
}
