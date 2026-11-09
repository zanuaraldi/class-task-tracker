import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, TaskStatsData, TaskStatus } from '@class-task-tracker/shared';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthCard } from './components/auth';
import { Sidebar, HeroHeader } from './components/layout';
import { StatCards, UpcomingTasksCard, WeeklyActivityCard } from './components/dashboard';
import { TaskList, TaskFilterPills, TaskDetailModal } from './components/tasks';
import { api, ApiError } from './services/api';

function MainApp() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeNav, setActiveNav] = useState<'home' | 'tasks'>('home');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState<TaskStatsData | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState<TaskStatus>('all');
  const [dueStatusFilter, setDueStatusFilter] = useState<'all' | 'due_soon' | 'overdue'>('all');

  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchInput]);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.tasks.getStats();
      setStats(data);
    } catch {
      // ignore stats error
    }
  }, [isAuthenticated]);

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingTasks(true);
    setTasksError(null);

    try {
      const result = await api.tasks.getAll({
        page,
        limit: 5,
        search: debouncedSearch || undefined,
        status: statusFilter,
        dueStatus: dueStatusFilter,
      });

      setTasks(result.items);
      setTotalPages(result.pagination.totalPages);
      setTotalCount(result.pagination.total);
    } catch (err) {
      if (err instanceof ApiError) {
        setTasksError(err.message);
      } else {
        setTasksError('Tidak dapat memuat daftar tugas.');
      }
    } finally {
      setIsLoadingTasks(false);
    }
  }, [isAuthenticated, page, debouncedSearch, statusFilter, dueStatusFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleToggleComplete = async (task: Task) => {
    setTogglingId(task.id);
    try {
      if (task.isCompleted) {
        await api.tasks.uncomplete(task.id);
      } else {
        await api.tasks.complete(task.id);
      }

      await Promise.all([fetchTasks(), fetchStats()]);

      if (detailTask && detailTask.id === task.id) {
        setDetailTask((prev) =>
          prev
            ? {
                ...prev,
                isCompleted: !prev.isCompleted,
                completedAt: !prev.isCompleted ? new Date() : null,
              }
            : null
        );
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Gagal memperbarui status tugas.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleOpenDetail = (task: Task) => {
    setDetailTask(task);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setDetailTask(null);
  };

  const handleNavChange = (nav: 'home' | 'tasks') => {
    setActiveNav(nav);
    if (nav === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById('tasks-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isAuthLoading) {
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

  const isTeacher = user.role === 'teacher';

  return (
    <div className="frame">
      <div className="app">
        <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />

        <main>
          <HeroHeader
            stats={stats}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onBellClick={() => {
              const el = document.getElementById('soon');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <div className="grid">
            <div className="l">
              <StatCards stats={stats} />

              <article className="card" id="tasks-section">
                <div className="card-h">
                  <div>
                    <h2>Daftar Tugas</h2>
                    <p className="muted">
                      {isTeacher
                        ? 'Tugas yang Anda buat, beserta progres siswa.'
                        : 'Tugas untuk kelasmu, urut dari tenggat terdekat.'}
                    </p>
                  </div>

                  <div className="h-r">
                    <TaskFilterPills
                      status={statusFilter}
                      dueStatus={dueStatusFilter}
                      onStatusChange={(newStatus) => {
                        setStatusFilter(newStatus);
                        setPage(1);
                      }}
                      onDueStatusChange={(newDue) => {
                        setDueStatusFilter(newDue);
                        setPage(1);
                      }}
                    />
                  </div>
                </div>

                <TaskList
                  tasks={tasks}
                  isLoading={isLoadingTasks}
                  error={tasksError}
                  page={page}
                  totalPages={totalPages}
                  total={totalCount}
                  onPageChange={setPage}
                  onRetry={fetchTasks}
                  onToggleComplete={handleToggleComplete}
                  onOpenDetail={handleOpenDetail}
                  togglingId={togglingId}
                />
              </article>
            </div>

            <div className="r">
              <UpcomingTasksCard tasks={stats?.soon || []} />
              <WeeklyActivityCard week={stats?.week} />
            </div>
          </div>
        </main>
      </div>

      <TaskDetailModal
        task={detailTask}
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        onToggleComplete={handleToggleComplete}
        isToggling={detailTask ? togglingId === detailTask.id : false}
      />
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
