import { useState, useEffect, useCallback } from 'react';
import type { TaskStatsData } from '@class-task-tracker/shared';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthCard } from './components/auth';
import { Sidebar, HeroHeader } from './components/layout';
import { StatCards, UpcomingTasksCard, WeeklyActivityCard } from './components/dashboard';
import { api } from './services/api';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeNav, setActiveNav] = useState<'home' | 'tasks'>('home');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<TaskStatsData | null>(null);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.tasks.getStats();
      setStats(data);
    } catch {
      // ignore stats error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <div className="frame" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="state">
          <span className="spin" />
          Memuat sesi aplikasi...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="frame">
        <AuthCard />
      </div>
    );
  }

  return (
    <div className="frame">
      <div className="app">
        <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

        <main>
          <HeroHeader
            stats={stats}
            searchValue={search}
            onSearchChange={setSearch}
            onBellClick={() => {
              const el = document.getElementById('soon');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <div className="grid">
            <div className="l">
              <StatCards stats={stats} />

              <article className="card" id="tasks">
                <div className="card-h">
                  <div>
                    <h2>Daftar Tugas</h2>
                    <p className="muted">
                      {user.role === 'teacher'
                        ? 'Tugas yang Anda buat, beserta progres siswa.'
                        : 'Tugas untuk kelasmu, urut dari tenggat terdekat.'}
                    </p>
                  </div>
                </div>

                <div className="state">
                  Kerangka dashboard Fase 3 aktif. Siap untuk modul daftar tugas Fase 4.
                </div>
              </article>
            </div>

            <div className="r">
              <UpcomingTasksCard tasks={stats?.soon || []} />
              <WeeklyActivityCard week={stats?.week} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
