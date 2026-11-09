import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../app';
import { runSeed } from '../../db/seeds/dev.seed';

describe('Auth Module Integration Tests', () => {
  beforeAll(async () => {
    await runSeed();
  });

  describe('POST /api/auth/login', () => {
    it('harus berhasil login dengan kredensial guru yang valid', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teacher@example.com',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
      expect(json.data.user.role).toBe('teacher');
      expect(json.data.user.email).toBe('teacher@example.com');
      expect((json.data.user as any).password).toBeUndefined();
    });

    it('harus menolak login dengan password yang salah (401)', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teacher@example.com',
          password: 'wrongpassword',
        }),
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain('Kombinasi email atau password tidak cocok');
    });

    it('harus menolak login dengan format email tidak valid (422)', async () => {
      const res = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/register', () => {
    it('harus berhasil mendaftarkan siswa baru (201)', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Calon Siswa Baru',
          email: 'siswa.baru@example.com',
          password: 'password123',
          role: 'student',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.token).toBeDefined();
      expect(json.data.user.name).toBe('Calon Siswa Baru');
      expect(json.data.user.role).toBe('student');
    });

    it('harus menolak registrasi dengan email yang sudah ada (400)', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Duplikat Siswa',
          email: 'teacher@example.com',
          password: 'password123',
          role: 'student',
        }),
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain('Email sudah terdaftar');
    });

    it('harus menolak registrasi jika password kurang dari 6 karakter (422)', async () => {
      const res = await app.request('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Short Password',
          email: 'short@example.com',
          password: '123',
          role: 'student',
        }),
      });

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.errors.password).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    it('harus menolak request tanpa Bearer token (401)', async () => {
      const res = await app.request('/api/auth/me', {
        method: 'GET',
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });

    it('harus mengembalikan profil pengguna jika menyertakan token yang valid (200)', async () => {
      const loginRes = await app.request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'student1@example.com',
          password: 'password123',
        }),
      });
      const loginJson = await loginRes.json();
      const token = loginJson.data.token;

      const meRes = await app.request('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      expect(meRes.status).toBe(200);
      const meJson = await meRes.json();
      expect(meJson.success).toBe(true);
      expect(meJson.data.email).toBe('student1@example.com');
      expect(meJson.data.role).toBe('student');
      expect(meJson.data.enrolledClass).toBeDefined();
    });
  });
});
