import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../app';
import { runSeed } from '../../db/seeds/dev.seed';

describe('Tasks & Classes Module Integration Tests', () => {
  let teacherToken: string;
  let student1Token: string;
  let student2Token: string;
  let validClassId: number;
  let classBId: number;
  let createdTaskId: number;
  let taskClassBId: number;

  beforeAll(async () => {
    await runSeed();

    const teacherLogin = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'teacher@example.com',
        password: 'password123',
      }),
    });
    const teacherData = await teacherLogin.json();
    teacherToken = teacherData.data.token;

    const student1Login = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student1@example.com',
        password: 'password123',
      }),
    });
    const student1Data = await student1Login.json();
    student1Token = student1Data.data.token;

    const student2Login = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student2@example.com',
        password: 'password123',
      }),
    });
    const student2Data = await student2Login.json();
    student2Token = student2Data.data.token;

    const classesRes = await app.request('/api/classes', {
      method: 'GET',
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const classesJson = await classesRes.json();
    validClassId = classesJson.data[0].id;
    classBId = classesJson.data[1].id;

    const taskBRes = await app.request('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}`,
      },
      body: JSON.stringify({
        title: 'Tugas Khusus Kelas B',
        description: 'Tugas ini khusus Kelas B.',
        classId: classBId,
      }),
    });
    const taskBJson = await taskBRes.json();
    taskClassBId = taskBJson.data.id;
  });

  describe('GET /api/classes', () => {
    it('harus mengembalikan daftar kelas bagi pengguna terautentikasi (200)', async () => {
      const res = await app.request('/api/classes', {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data.length).toBeGreaterThanOrEqual(2);
      expect(json.data[0].name).toBeDefined();
    });
  });

  describe('POST /api/tasks (Create Task)', () => {
    it('guru berhasil membuat tugas baru (201)', async () => {
      const res = await app.request('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: 'Tugas Uji Otomasi Integration Test',
          description: 'Memastikan seluruh endpoint berjalan dengan baik.',
          classId: validClassId,
          dueDate: '2026-11-25T23:59:00.000Z',
        }),
      });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.id).toBeDefined();
      expect(json.data.title).toBe('Tugas Uji Otomasi Integration Test');
      createdTaskId = json.data.id;
    });

    it('gagal membuat tugas jika judul kurang dari 3 karakter (422)', async () => {
      const res = await app.request('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: 'Ab',
          classId: validClassId,
        }),
      });

      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.errors.title).toBeDefined();
    });

    it('siswa DITOLAK saat mencoba membuat tugas (403 Forbidden)', async () => {
      const res = await app.request('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
        body: JSON.stringify({
          title: 'Tugas Palsu dari Siswa',
          classId: validClassId,
        }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.message).toContain('Akses ditolak');
    });
  });

  describe('GET /api/tasks (List, Search & Filter)', () => {
    it('guru dapat melihat daftar tugas beserta completionStats (200)', async () => {
      const res = await app.request('/api/tasks?page=1&limit=10', {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.items).toBeDefined();
      expect(json.data.pagination).toBeDefined();
      expect(json.data.pagination.page).toBe(1);
      expect(json.data.items[0].completionStats).toBeDefined();
    });

    it('siswa hanya melihat tugas kelasnya dan status penyelesaian pribadinya (200)', async () => {
      const res = await app.request('/api/tasks', {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      const completedTask = json.data.items.find((t: any) => t.isCompleted);
      expect(completedTask).toBeDefined();
    });

    it('fitur pencarian judul (search query) berfungsi dengan benar (200)', async () => {
      const res = await app.request('/api/tasks?search=Aljabar', {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.items.length).toBe(1);
      expect(json.data.items[0].title).toContain('Aljabar');
    });

    it('siswa dapat memfilter tugas dengan status pending / belum selesai (200)', async () => {
      const res = await app.request('/api/tasks?status=pending', {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      const allPending = json.data.items.every((t: any) => !t.isCompleted);
      expect(allPending).toBe(true);
    });

    it('setiap tugas menyertakan indikator status tenggat isOverdue dan isDueSoon (200)', async () => {
      const res = await app.request('/api/tasks', {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.items.length).toBeGreaterThan(0);
      expect(typeof json.data.items[0].isOverdue).toBe('boolean');
      expect(typeof json.data.items[0].isDueSoon).toBe('boolean');
    });

    it('endpoint GET /api/tasks/upcoming berhasil mengembalikan tugas yang mendekati tenggat (200)', async () => {
      const res = await app.request('/api/tasks/upcoming', {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data)).toBe(true);
    });
  });

  describe('POST & DELETE /api/tasks/:id/complete (Student Completion)', () => {
    it('siswa berhasil menandai tugas sebagai selesai (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${student2Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.taskId).toBe(createdTaskId);
      expect(json.data.completedAt).toBeDefined();
    });

    it('aksi menandai selesai bersifat idempoten jika diklik dua kali (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${student2Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('siswa berhasil membatalkan status selesai (untoggle) via DELETE (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/complete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${student2Token}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      const checkRes = await app.request(`/api/tasks/${createdTaskId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${student2Token}` },
      });
      const checkJson = await checkRes.json();
      expect(checkJson.data.isCompleted).toBe(false);

      await app.request(`/api/tasks/${createdTaskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${student2Token}` },
      });
    });

    it('guru DITOLAK saat mencoba menandai tugas sebagai selesai (403 Forbidden)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(403);
    });

    it('siswa DITOLAK saat mencoba menandai selesai tugas dari kelas lain (403 Forbidden)', async () => {
      const res = await app.request(`/api/tasks/${taskClassBId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(403);
    });

    it('siswa DITOLAK saat mencoba membuka detail tugas dari kelas lain (403 Forbidden)', async () => {
      const res = await app.request(`/api/tasks/${taskClassBId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/tasks/:id/completions (Teacher Monitor Progress)', () => {
    it('guru dapat melihat daftar seluruh siswa dan status pengerjaannya (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/completions`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.students).toBeDefined();
      expect(Array.isArray(json.data.students)).toBe(true);

      const s2 = json.data.students.find((s: any) => s.email === 'student2@example.com');
      expect(s2?.isCompleted).toBe(true);
    });

    it('siswa DITOLAK saat mencoba melihat progres siswa lain (403 Forbidden)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}/completions`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${student1Token}` },
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT & DELETE /api/tasks/:id (Update & Delete Task)', () => {
    it('guru berhasil mengubah judul tugas buatannya (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${teacherToken}`,
        },
        body: JSON.stringify({
          title: 'Judul Tugas Setelah Diperbarui',
        }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.title).toBe('Judul Tugas Setelah Diperbarui');
    });

    it('siswa DITOLAK saat mencoba mengedit tugas guru (403 Forbidden)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
        body: JSON.stringify({
          title: 'Hacked by Student',
        }),
      });

      expect(res.status).toBe(403);
    });

    it('guru berhasil menghapus tugas buatannya (200)', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it('mengambil tugas yang sudah dihapus mengembalikan 404 Not Found', async () => {
      const res = await app.request(`/api/tasks/${createdTaskId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${teacherToken}` },
      });

      expect(res.status).toBe(404);
    });
  });
});
