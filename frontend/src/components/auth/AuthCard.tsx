import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthCard() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  return (
    <section className="auth">
      <div className="auth-card">
        <h1>
          CLASS TASK
          <br />
          TRACKER
        </h1>
        <p className="sub">Guru membuat tugas, siswa menandai selesai.</p>

        <div className="tabs">
          <button
            type="button"
            className={activeTab === 'login' ? 'on' : ''}
            onClick={() => setActiveTab('login')}
          >
            Masuk
          </button>
          <button
            type="button"
            className={activeTab === 'register' ? 'on' : ''}
            onClick={() => setActiveTab('register')}
          >
            Daftar
          </button>
        </div>

        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
      </div>
    </section>
  );
}
