import db from '../connection';
import { users, classes, tasks, taskCompletions } from '../schema';

export async function runSeed() {
  console.log('🌱 Seeding database with demo data...');

  await db.delete(taskCompletions);
  await db.delete(tasks);
  await db.delete(classes);
  await db.delete(users);

  const hashedPassword = await Bun.password.hash('password123', {
    algorithm: 'bcrypt',
    cost: 10,
  });

  const [teacher] = await db
    .insert(users)
    .values({
      name: 'Budi Santoso, S.Pd.',
      email: 'teacher@example.com',
      password: hashedPassword,
      role: 'teacher',
    })
    .returning();

  const [classA, classB] = await db
    .insert(classes)
    .values([
      {
        name: 'Kelas 10-A (Rekayasa Perangkat Lunak)',
        teacherId: teacher.id,
      },
      {
        name: 'Kelas 11-B (Teknik Komputer & Jaringan)',
        teacherId: teacher.id,
      },
    ])
    .returning();

  const [student1, student2] = await db
    .insert(users)
    .values([
      {
        name: 'Aditya Pratama (Siswa 1)',
        email: 'student1@example.com',
        password: hashedPassword,
        role: 'student',
        classId: classA.id,
      },
      {
        name: 'Bella Novita (Siswa 2)',
        email: 'student2@example.com',
        password: hashedPassword,
        role: 'student',
        classId: classA.id,
      },
    ])
    .returning();

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

  const [task1] = await db
    .insert(tasks)
    .values([
      {
        title: 'Tugas 01: Membuat REST API Hono & Drizzle',
        description: 'Implementasikan autentikasi JWT dan endpoint tugas sesuai spesifikasi.',
        classId: classA.id,
        teacherId: teacher.id,
        dueDate: threeDaysLater,
      },
      {
        title: 'Tugas 02: Desain Relasi Database & Constraint',
        description: 'Terapkan foreign key cascade dan unique composite index di PostgreSQL.',
        classId: classA.id,
        teacherId: teacher.id,
        dueDate: fiveDaysLater,
      },
      {
        title: 'Tugas 03: Aljabar Boolean & Logika Proposisi',
        description: 'Selesaikan 10 soal logika matematika diskrit bab 3.',
        classId: classA.id,
        teacherId: teacher.id,
        dueDate: yesterday,
      },
      {
        title: 'Tugas 04: Audit Keamanan Web & OWASP Top 10',
        description: 'Tenggat mendesak (jatuh tempo besok): audit sanitasi input Zod, XSS escaping, dan proteksi role middleware.',
        classId: classA.id,
        teacherId: teacher.id,
        dueDate: tomorrow,
      },
    ])
    .returning();

  await db.insert(taskCompletions).values({
    taskId: task1.id,
    studentId: student1.id,
  });

  console.log('✅ Seeding demo data selesai!');
  console.log('   👨‍🏫 Guru: teacher@example.com / password123');
  console.log('   🧑‍🎓 Siswa 1: student1@example.com / password123');
  console.log('   🧑‍🎓 Siswa 2: student2@example.com / password123');
}

if (import.meta.main) {
  runSeed().finally(() => process.exit(0));
}
