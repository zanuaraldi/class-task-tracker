import type { TaskStatsData } from '@class-task-tracker/shared';
import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

interface HeroHeaderProps {
  stats: TaskStatsData | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBellClick?: () => void;
}

export function HeroHeader({
  stats,
  searchValue,
  onSearchChange,
  onBellClick,
}: HeroHeaderProps) {
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';

  const completion = stats?.completion || 0;
  const pending = stats?.pending || 0;
  const dueSoon = stats?.dueSoon ?? stats?.due_soon ?? 0;
  const total = stats?.total || 0;

  const weekData = stats?.week || [
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
    { done: 0, pending: 0 },
  ];

  const maxWeek = Math.max(1, ...weekData.map((w) => w.done + w.pending));
  const polylinePoints = weekData
    .map(
      (w, i) =>
        `${((i * 100) / 6).toFixed(0)},${(
          28 -
          ((w.done + w.pending) / maxWeek) * 24
        ).toFixed(1)}`
    )
    .join(' ');

  const strokeDashoffset = 326.7 * (1 - Math.min(100, Math.max(0, completion)) / 100);

  return (
    <header className="hero">
      <div className="hero-top">
        <span className="crumb">Dashboard Utama</span>
        <div className="top-r">
          <input
            id="search"
            type="search"
            placeholder="Cari judul tugas…"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Cari tugas"
          />
          <button
            type="button"
            className="bell"
            onClick={onBellClick}
            title={dueSoon > 0 ? `${dueSoon} tugas mendekati tenggat` : 'Tidak ada tenggat mendesak'}
          >
            <Icon name="bell" size={18} />
            {dueSoon > 0 && <i />}
          </button>
        </div>
      </div>

      <div className="hero-body">
        <div className="hero-l">
          <h1>
            CLASS TASK
            <br />
            TRACKER
          </h1>
          <p id="hello">
            {isTeacher
              ? `Halo, ${user?.name || 'Guru'}. Buat dan pantau progres tugas kelas Anda.`
              : `Halo, ${user?.name || 'Siswa'}. Lihat tugas kelasmu dan tandai yang sudah selesai.`}
          </p>

          <div className="minis">
            <div className="mini">
              <span>{isTeacher ? 'Belum Dikerjakan' : 'Tugas Aktif'}</span>
              <b>{pending}</b>
              <div className="bar">
                <i style={{ width: `${completion}%` }} />
              </div>
              <span className="go">
                <Icon name="arrow" size={14} />
              </span>
            </div>

            <div className="mini">
              <span>Tenggat ≤ 2 hari</span>
              <b>{dueSoon}</b>
              <svg viewBox="0 0 100 30" width="100%" height="30" preserveAspectRatio="none">
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#9fd12b"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="go">
                <Icon name="arrow" size={14} />
              </span>
            </div>
          </div>
        </div>

        <div className="hero-art" id="ring">
          <svg viewBox="0 0 180 180" width="190" height="190">
            <ellipse cx="90" cy="160" rx="62" ry="10" fill="rgba(0,0,0,.12)" />
            <circle cx="90" cy="84" r="64" fill="rgba(255,255,255,.55)" />
            <circle cx="90" cy="84" r="52" fill="none" stroke="#dfe3dc" strokeWidth="12" />
            <circle
              cx="90"
              cy="84"
              r="52"
              fill="none"
              stroke="#9fd12b"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="326.7"
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 90 84)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <text x="90" y="90" textAnchor="middle" fontSize="30" fontWeight="700" fill="#1d1d1d">
              {completion}%
            </text>
            <text x="90" y="108" textAnchor="middle" fontSize="10" fill="#777">
              selesai
            </text>
          </svg>
        </div>

        <div className="hero-stat" id="hstat">
          <div>
            <b>
              {total}
              <small> tugas</small>
            </b>
            <span>TOTAL TUGAS</span>
          </div>
          <div>
            <b>
              {completion}
              <small>%</small>
            </b>
            <span>{isTeacher ? 'PENYELESAIAN SELESAI' : 'TUGAS SELESAI'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
