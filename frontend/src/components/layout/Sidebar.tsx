import { useAuth } from '../../context/AuthContext';
import { Icon } from '../ui/Icon';

interface SidebarProps {
  activeNav: 'home' | 'tasks';
  onNavChange: (nav: 'home' | 'tasks') => void;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const { user, logout } = useAuth();
  const initial = user?.name ? user.name[0].toUpperCase() : 'U';
  const roleLabel = user?.role === 'teacher' ? 'Guru' : 'Siswa';

  return (
    <aside className="side">
      <div className="logo" title="Class Task Tracker">
        <Icon name="check" size={22} />
      </div>

      <nav>
        <button
          type="button"
          className={activeNav === 'home' ? 'on' : ''}
          onClick={() => onNavChange('home')}
          title="Dashboard"
        >
          <Icon name="home" size={20} />
        </button>
        <button
          type="button"
          className={activeNav === 'tasks' ? 'on' : ''}
          onClick={() => onNavChange('tasks')}
          title="Daftar Tugas"
        >
          <Icon name="list" size={20} />
        </button>
      </nav>

      <div className="grow" />

      <button
        type="button"
        id="logout"
        onClick={logout}
        title="Keluar (Logout)"
      >
        <Icon name="logout" size={20} />
      </button>

      <div className="avatar" title={`${user?.name || ''} (${roleLabel})`}>
        {initial}
      </div>
    </aside>
  );
}
