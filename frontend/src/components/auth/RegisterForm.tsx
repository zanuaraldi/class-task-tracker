import { useState, useEffect, type FormEvent } from 'react';
import type { Class, UserRole } from '@class-task-tracker/shared';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../services/api';

export function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [classId, setClassId] = useState<string>('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchClasses() {
      try {
        const data = await api.classes.getAll();
        if (mounted) {
          setClasses(data);
          if (data.length > 0) {
            setClassId(String(data[0].id));
          }
        }
      } catch {
        // ignore classes fetch error
      }
    }
    fetchClasses();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');
    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        classId: role === 'student' ? Number(classId) || undefined : undefined,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        if (typeof err.errors === 'object' && !Array.isArray(err.errors)) {
          setFieldErrors(err.errors as Record<string, string>);
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Gagal membuat akun baru.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Nama Lengkap
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama siswa atau guru"
          disabled={isSubmitting}
        />
        {fieldErrors.name && <small data-err="name">{fieldErrors.name}</small>}
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@sekolah.com"
          disabled={isSubmitting}
        />
        {fieldErrors.email && <small data-err="email">{fieldErrors.email}</small>}
      </label>

      <label>
        Password (min. 6 karakter)
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          disabled={isSubmitting}
        />
        {fieldErrors.password && <small data-err="password">{fieldErrors.password}</small>}
      </label>

      <label>
        Peran
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={isSubmitting}
        >
          <option value="student">Siswa</option>
          <option value="teacher">Guru</option>
        </select>
        {fieldErrors.role && <small data-err="role">{fieldErrors.role}</small>}
      </label>

      {role === 'student' && (
        <label>
          Kelas
          <select
            name="classId"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            disabled={isSubmitting}
          >
            {classes.length === 0 ? (
              <option value="">Memuat daftar kelas...</option>
            ) : (
              classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))
            )}
          </select>
          {fieldErrors.classId && <small data-err="classId">{fieldErrors.classId}</small>}
        </label>
      )}

      {generalError && <p className="err">{generalError}</p>}

      <button
        type="submit"
        className={`btn lime ${isSubmitting ? 'loading' : ''}`}
        style={{ width: '100%', marginTop: '6px' }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Membuat Akun...' : 'Buat Akun'}
      </button>
    </form>
  );
}
