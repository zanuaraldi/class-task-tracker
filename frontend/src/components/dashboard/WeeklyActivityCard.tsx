import type { TaskWeekDayActivity } from '@class-task-tracker/shared';

interface WeeklyActivityCardProps {
  week: TaskWeekDayActivity[] | undefined;
}

const DAY_LABELS = ['Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb', 'Mg'];

export function WeeklyActivityCard({ week = [] }: WeeklyActivityCardProps) {
  const todayIndex = (new Date().getDay() + 6) % 7;
  const safeWeek = week.length === 7 ? week : Array.from({ length: 7 }, () => ({ done: 0, pending: 0 }));
  const maxVal = Math.max(1, ...safeWeek.map((w) => w.done + w.pending));

  return (
    <article className="card" id="chart">
      <div className="card-h">
        <h2>Aktivitas Minggu Ini</h2>
      </div>

      <div className="legend">
        <span>
          <i style={{ background: 'var(--lime)' }} />
          Selesai
        </span>
        <span>
          <i style={{ background: '#1d1d1d' }} />
          Belum
        </span>
      </div>

      <div className="cols">
        {safeWeek.map((day, idx) => {
          const doneHeight = (day.done / maxVal) * 100;
          const pendingHeight = (day.pending / maxVal) * 100;
          const isToday = idx === todayIndex;

          return (
            <div key={DAY_LABELS[idx]}>
              <div className="track" title={`Selesai: ${day.done}, Belum: ${day.pending}`}>
                <i
                  style={{
                    background: 'var(--lime)',
                    height: `${doneHeight}%`,
                    transition: 'height 0.4s ease',
                  }}
                />
                <i
                  style={{
                    background: '#1d1d1d',
                    height: `${pendingHeight}%`,
                    transition: 'height 0.4s ease',
                  }}
                />
              </div>
              <span className={`d ${isToday ? 'today' : ''}`}>{DAY_LABELS[idx]}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}
