import { useState, type FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../services/api';

export function LoginForm() {
  const { login, quickLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quickRole, setQuickRole] = useState<'teacher' | 'student' | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
    } catch (err) {
      if (err instanceof ApiError) {
        if (typeof err.errors === 'object' && !Array.isArray(err.errors)) {
          setFieldErrors(err.errors as Record<string, string>);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Terjadi kesalahan tidak terduga.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: 'teacher' | 'student') => {
    setFieldErrors({});
    setGeneralError('');
    setQuickRole(role);

    try {
      await quickLogin(role);
    } catch (err) {
      if (err instanceof ApiError) {
        setGeneralError(err.message);
      } else {
        setGeneralError('Gagal melakukan quick login demo.');
      }
    } finally {
      setQuickRole(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@sekolah.com"
          disabled={isSubmitting || !!quickRole}
        />
        {fieldErrors.email && <small data-err="email">{fieldErrors.email}</small>}
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isSubmitting || !!quickRole}
        />
        {fieldErrors.password && <small data-err="password">{fieldErrors.password}</small>}
      </label>

      {generalError && <p className="err">{generalError}</p>}

      <button
        type="submit"
        className={`btn lime ${isSubmitting ? 'loading' : ''}`}
        style={{ width: '100%' }}
        disabled={isSubmitting || !!quickRole}
      >
        {isSubmitting ? 'Memproses...' : 'Masuk'}
      </button>

      <div className="quick-demo">
        <p className="hint" style={{ margin: '8px 0 4px' }}>
          Atau gunakan akun demo evaluasi:
        </p>
        <button
          type="button"
          onClick={() => handleQuickLogin('teacher')}
          disabled={isSubmitting || !!quickRole}
        >
          {quickRole === 'teacher' ? 'Memuat akun guru...' : '👨‍🏫 Masuk sebagai Guru Demo'}
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin('student')}
          disabled={isSubmitting || !!quickRole}
        >
          {quickRole === 'student' ? 'Memuat akun siswa...' : '🧑‍🎓 Masuk sebagai Siswa Demo'}
        </button>
      </div>

      <p className="hint">
        Kredensial demo: <b>teacher@example.com</b> atau <b>student1@example.com</b>
        <br />
        Password: <b>password123</b>
      </p>
    </form>
  );
}
