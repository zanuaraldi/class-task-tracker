import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, TaskStatsData, TaskStatus, Class } from '@class-task-tracker/shared';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthCard } from './components/auth';
import { Sidebar, HeroHeader } from './components/layout';
import { StatCards, UpcomingTasksCard, WeeklyActivityCard } from './components/dashboard';
import {
  TaskList,
  TaskFilterPills,
  TaskDetailModal,
  TaskFormModal,
  StudentMonitorModal,
} from './components/tasks';
import { Icon, ToastContainer, type ToastItem } from './components/ui';
import { api, ApiError } from './services/api';

function MainApp() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [activeNav, setActiveNav] = useState<'home' | 'tasks'>('home');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [stats, setStats] = useState<TaskStatsData | null>(null);

  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherClassFilter, setTeacherClassFilter] = useState<number | 'all'>('all');

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

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [isMonitorModalOpen, setIsMonitorModalOpen] = useState(false);
  const [monitorTask, setMonitorTask] = useState<Task | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTeacher = user?.role === 'teacher';

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchClasses() {
      if (!isAuthenticated) return;
      try {
        const data = await api.classes.getAll();
        if (mounted) setClasses(data);
      } catch {
        // ignore classes fetch error
      }
    }
    fetchClasses();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

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
        classId: isTeacher && teacherClassFilter !== 'all' ? teacherClassFilter : undefined,
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
  }, [isAuthenticated, page, debouncedSearch, statusFilter, dueStatusFilter, isTeacher, teacherClassFilter]);

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
        showToast('Status tugas diubah menjadi belum selesai.');
      } else {
        await api.tasks.complete(task.id);
        showToast('Tugas berhasil ditandai selesai! 🎉');
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
      showToast(err instanceof ApiError ? err.message : 'Gagal memperbarui status tugas.', 'error');
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

  const handleCreateNew = () => {
    setTaskToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsFormModalOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    const ok = window.confirm(`Hapus tugas "${task.title}"?\nTindakan ini tidak dapat dibatalkan.`);
    if (!ok) return;

    try {
      await api.tasks.delete(task.id);
      showToast('Tugas berhasil dihapus.');
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Gagal menghapus tugas.', 'error');
    }
  };

  const handleMonitorCompletions = (task: Task) => {
    setMonitorTask(task);
    setIsMonitorModalOpen(true);
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
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

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
                    {isTeacher ? (
                      <>
                        <select
                          value={teacherClassFilter}
                          onChange={(e) => {
                            setTeacherClassFilter(
                              e.target.value === 'all' ? 'all' : Number(e.target.value)
                            );
                            setPage(1);
                          }}
                          style={{
                            width: 'auto',
                            margin: 0,
                            padding: '8px 14px',
                            fontSize: '12px',
                            borderRadius: '999px',
                            border: '1px solid #dcdcdc',
                          }}
                        >
                          <option value="all">Semua Kelas</option>
                          {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          className="btn lime"
                          onClick={handleCreateNew}
                          style={{ padding: '8px 18px', fontSize: '12px' }}
                        >
                          <Icon name="plus" size={14} style={{ marginRight: '6px' }} />
                          Tugas Baru
                        </button>
                      </>
                    ) : (
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
                    )}
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
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteTask}
                  onMonitorCompletions={handleMonitorCompletions}
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

      <TaskFormModal
        isOpen={isFormModalOpen}
        taskToEdit={taskToEdit}
        classes={classes}
        onClose={() => {
          setIsFormModalOpen(false);
          setTaskToEdit(null);
        }}
        onSaved={async () => {
          showToast(taskToEdit ? 'Tugas berhasil diperbarui.' : 'Tugas baru berhasil dibuat.');
          await Promise.all([fetchTasks(), fetchStats()]);
        }}
      />

      <StudentMonitorModal
        taskId={monitorTask?.id || null}
        taskTitle={monitorTask?.title || ''}
        classNameText={monitorTask?.class?.name || `Kelas ${monitorTask?.classId || ''}`}
        isOpen={isMonitorModalOpen}
        onClose={() => {
          setIsMonitorModalOpen(false);
          setMonitorTask(null);
        }}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
