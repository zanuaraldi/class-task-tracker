import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthCard } from './components/auth';

function MainApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="frame" style={{ display: 'grid', placeItems: 'center' }}>
        <div className="state">
          <span className="spin"></span>
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
      <div className="auth-card" style={{ margin: '40px auto', textAlign: 'center' }}>
        <h2>Selamat Datang, {user.name}!</h2>
        <p className="sub" style={{ marginTop: '8px' }}>
          Peran: <b>{user.role === 'teacher' ? '👨‍🏫 Guru' : '🧑‍🎓 Siswa'}</b>
          {user.classId ? ` · Kelas ID: ${user.classId}` : ''}
        </p>
        <p className="muted" style={{ marginBottom: '20px' }}>
          Autentikasi Fase 2 berhasil terhubung dengan API backend.
        </p>
        <button
          type="button"
          className="btn ghost"
          onClick={logout}
          style={{ width: '100%' }}
        >
          Keluar (Logout)
        </button>
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
