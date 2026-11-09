# 🚀 @class-task-tracker/backend

Layanan RESTful API untuk aplikasi **Class Task Tracker**, dibangun menggunakan runtime [Bun](https://bun.sh), framework [Hono](https://hono.dev), basis data [PostgreSQL](https://www.postgresql.org), dan [Drizzle ORM](https://orm.drizzle.team).

---

## 🛠️ Perintah Kerja (Scripts)

Dari direktori root atau dari folder `backend/`:

```bash
bun run dev          # Menjalankan server Hono dalam mode development (watch mode)
bun run build        # Build bundle JavaScript produksi ke dist/index.js
bun run start        # Menjalankan bundle produksi dari dist/index.js
bun run db:init      # Memastikan database PostgreSQL 'schooltech-test' tersedia
bun run db:push      # Push skema Drizzle langsung ke basis data PostgreSQL
bun run db:seed      # Mengisi basis data dengan data demo guru, siswa, kelas, & tugas
bun run test         # Menjalankan seluruh skenario integration test otomatis (30 passing)
```

---

## 📂 Struktur Modul

- `src/db/`: Koneksi PostgreSQL, skema tabel Drizzle (`users`, `classes`, `tasks`, `task_completions`), migrasi, dan seeder.
- `src/middlewares/`: JWT authentication guard, role-based authorization (`isTeacher`, `isStudent`), global Zod error handler, CORS, dan `secureHeaders`.
- `src/modules/`: Modul fungsional (`auth`, `classes`, `tasks`) dengan pola arsitektur Controller-Service-Route-Validator.
- `src/utils/`: Standardized response envelope, password hashing, JWT signing/verification.

Untuk panduan lengkap dan dokumentasi API, silakan merujuk ke [`README.md`](../README.md) utama repositori.
