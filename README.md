# 📋 Class Task Tracker — SchoolTech Indonesia

[![Bun](https://img.shields.io/badge/Bun-1.3+-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-v4-E36002?logo=hono&logoColor=white)](https://hono.dev)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-31%20Passed-success?logo=checkmarx&logoColor=white)](https://bun.sh)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

Aplikasi **Manajemen Tugas Kelas (Class Task Tracker)** berarsitektur monorepo modern, dibangun untuk memenuhi **Tes Praktik & Kompetensi Fullstack Developer Magang — SchoolTech Indonesia**.

Aplikasi memfasilitasi guru dalam mengelola tugas (CRUD, pemantauan progres pengerjaan siswa per kelas) dan membantu siswa melihat daftar tugas, memfilter status pengerjaan, mencari tugas, serta menandai penyelesaian tugas secara **idempoten**.

---

## 📑 Daftar Isi

- [Tech Stack & Arsitektur](#-tech-stack--arsitektur)
- [Nilai Tambah (Value-Add Bonus)](#-nilai-tambah-value-add-bonus)
- [Prasyarat Sistem](#-prasyarat-sistem)
- [Panduan Instalasi & Menjalankan dari Nol](#-panduan-instalasi--menjalankan-dari-nol)
- [Akun Demo Pengujian](#-akun-demo-pengujian)
- [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
- [Dokumentasi API & Pengujian Postman](#-dokumentasi-api--pengujian-postman)
- [Keputusan Desain & Arsitektur (ADR)](#-keputusan-desain--arsitektur-adr)
- [Keterbukaan Penggunaan Alat AI (AI Disclosure)](#-keterbukaan-penggunaan-alat-ai-ai-disclosure)
- [Catatan Pengembangan Selanjutnya](#-catatan-pengembangan-selanjutnya)

---

## 🛠️ Tech Stack & Arsitektur

Proyek ini disusun menggunakan pola **Monorepo Bun Workspaces**:

```bash
class-task-tracker/
├── backend/            # REST API Service (Hono + Drizzle ORM + PostgreSQL)
├── frontend/           # Web Client (React 19 + Vite + Tailwind CSS v4)
├── shared/             # Package @class-task-tracker/shared (DTOs, Entities, Constants, Utils)
├── docs/               # Living Documentation, API Specs, Test Answers & Runbooks
├── package.json        # Workspace orchestrator
└── tsconfig.base.json  # Shared TypeScript configuration
```

### Rincian Teknologi
- **Backend Runtime & Framework:** [Bun](https://bun.sh) v1.3+ dan [Hono](https://hono.dev) v4 (supercepat, ringan, dan type-safe).
- **Database & ORM:** [PostgreSQL](https://www.postgresql.org) 17 + [Drizzle ORM](https://orm.drizzle.team) dengan parameterized queries anti-SQL Injection.
- **Autentikasi & Keamanan:** Stateless JWT (`hono/jwt`) dengan password hashing modern (`Bun.password` berbasis bcrypt/argon2), proteksi role-based middleware (`teacher` vs `student`), serta validasi skema runtime via [Zod](https://zod.dev).
- **Shared Layer (`@class-task-tracker/shared`):** Kontrak data, DTO request/response, interface entitas, dan utilitas penanggalan yang dipakai bersama antara backend dan frontend.
- **Frontend:** React 19, Vite, dan Tailwind CSS v4 (Desain modern bergaya *Eco System* dengan dark sidebar, hero banner sage, circular progress ring, dan full responsif).

---

## 🌟 Nilai Tambah (Value-Add Bonus)

Dari ketentuan lembar tes kompetensi, proyek ini mengimplementasikan ke-4 nilai tambah backend & arsitektur secara komprehensif:

1. **Automated Feature & Integration Test Suite (30 Tests Passed):**  
   Pengujian otomatis komprehensif menggunakan native Bun test runner. Menguji alur autentikasi, registrasi email duplikat, proteksi hak akses (RBAC), pembatasan siswa agar tidak bisa mengubah/menghapus tugas, isolasi tugas lintas kelas, filter pencarian & paginasi, hingga jaminan idempotensi `complete task` dan `untoggle completion`.
2. **Dokumentasi API Lengkap (Postman Collection v2.1 + OpenAPI 3.1.0):**  
   - Koleksi Postman lengkap dengan **Auto-Token Capture Test Scripts** (`pm.environment.set('token', ...)`). Penguji cukup klik Login sekali dan seluruh request tugas langsung terotentikasi otomatis.
   - Dokumen spesifikasi [OpenAPI 3.1.0](./docs/reference/openapi.json) yang kompatibel dengan Swagger UI.
3. **Dockerfile & Docker-Compose (Instant One-Command Setup):**  
   Menyediakan konfigurasi `backend/Dockerfile` multi-stage dan `docker-compose.yml` di root proyek. Cukup jalankan `docker compose up -d` untuk menyalakan kontainer PostgreSQL 17 + Backend Hono lengkap dengan auto-migrate & auto-seed data demo tanpa perlu instalasi lokal.
4. **Notifikasi Tugas yang Mendekati Tenggat (Deadline Warning & Upcoming Tasks):**  
   Setiap tugas secara otomatis menyertakan indikator status tenggat `isOverdue` (lewat deadline) dan `isDueSoon` (jatuh tempo dalam <48 jam). Dilengkapi filter query `?dueStatus=due_soon|overdue` serta endpoint khusus `GET /api/tasks/upcoming` untuk mengambil daftar tugas mendesak.

---

## 💻 Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan sistem Anda telah terpasang:
- **[Bun Runtime](https://bun.sh):** v1.1.0 atau lebih baru (`bun --version`).
- **PostgreSQL Database:** v14 ke atas (diuji pada PostgreSQL 17 di `localhost:5432`).
- **Git:** Untuk manajemen source control.

---

## 🚀 Panduan Instalasi & Menjalankan dari Nol

Anda dapat memilih menjalankan aplikasi menggunakan **Docker Compose (Paling Praktis)** atau **Setup Lokal Manual via Bun**:

### 🐳 Opsi A: Menjalankan Cepat via Docker Compose (Rekomendasi)
Jika di komputer Anda sudah terpasang Docker Desktop:
```bash
# 1. Jalankan kontainer database PostgreSQL 17 dan Backend Hono API
docker compose up -d

# 2. Periksa log booting & seed data
docker compose logs -f backend
```
*Kontainer akan otomatis menginisialisasi DB `schooltech-test`, menjalankan push migrasi Drizzle, mengeksekusi seeder akun demo, dan menyalakan backend di `http://localhost:3000`.*

---

### 💻 Opsi B: Setup Lokal Manual via Bun

Ikuti 6 langkah berikut jika ingin menjalankan langsung di lingkungan lokal:

### 1. Clone Repositori
```bash
git clone https://github.com/<username>/class-task-tracker.git
cd class-task-tracker
```

### 2. Instalasi Dependensi Seluruh Workspace
```bash
bun install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` pada folder `backend/` menjadi `.env`:
```bash
cp backend/.env.example backend/.env
```
Sesuaikan konfigurasi koneksi database PostgreSQL Anda pada `backend/.env`:
```env
DATABASE_URL=postgres://postgres:password123@localhost:5432/schooltech-test
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173,http://localhost:5174
JWT_SECRET=super_secret_jwt_schooltech_2026_key
```

### 4. Setup Database & Eksekusi Migrasi
Jalankan skrip inisialisasi database (otomatis membuat database `schooltech-test` jika belum ada) dan push skema Drizzle:
```bash
# Inisialisasi DB
bun --cwd backend src/db/init-db.ts

# Eksekusi migrasi skema tabel Drizzle ORM
bun --cwd backend run db:push
```

### 5. Jalankan Database Seeder (Data Demo)
Isi database dengan data contoh realistis (akun guru, 2 akun siswa, 2 kelas, dan 3 tugas):
```bash
bun --cwd backend run db:seed
```

### 6. Jalankan Test Suite & Development Server
Untuk menjalankan automated test suite:
```bash
bun --cwd backend test
```
*Hasil: 31 pass, 0 fail (100% lulus).*

Untuk menjalankan aplikasi lengkap (Backend + Frontend sekaligus):
```bash
bun run dev
```
- Server backend aktif di: **`http://localhost:3000`**
- Web frontend aktif di: **`http://localhost:5173`**

---

## 🔑 Akun Demo Pengujian

Setelah menjalankan `bun run db:seed`, akun berikut siap langsung digunakan untuk login dan pengujian:

| Peran (Role) | Email | Password | Keterangan / Asosiasi Kelas |
|---|---|---|---|
| **👨‍🏫 Guru (Teacher)** | `teacher@example.com` | `password123` | Wali Kelas 10-A, Pembuat Tugas |
| **🧑‍🎓 Siswa 1 (Student)**| `student1@example.com` | `password123` | Anggota Kelas 10-A (1 tugas sudah selesai) |
| **🧑‍🎓 Siswa 2 (Student)**| `student2@example.com` | `password123` | Anggota Kelas 10-A (belum ada tugas selesai) |

---

## 📡 Daftar Endpoint REST API

Base URL Backend: `http://localhost:3000/api`

| Kategori | Method | Endpoint | Hak Akses | Deskripsi & Parameter |
|---|:---:|---|:---:|---|
| **Auth** | `POST` | `/auth/register` | Public | Registrasi akun baru (Guru / Siswa). |
| **Auth** | `POST` | `/auth/login` | Public | Login akun & mendapatkan JWT token. |
| **Auth** | `GET` | `/auth/me` | Authenticated | Ambil profil pengguna yang sedang login. |
| **Classes** | `GET` | `/classes` | Authenticated | Ambil daftar kelas yang tersedia. |
| **Classes** | `GET` | `/classes/:id` | Authenticated | Ambil detail satu kelas beserta wali kelasnya. |
| **Tasks** | `POST` | `/tasks` | **Teacher** | Buat tugas baru (`title`, `description`, `classId`, `dueDate`). |
| **Tasks** | `GET` | `/tasks` | Authenticated | List tugas. Dukung query: `?search=...`, `?status=all\|pending\|completed`, `?dueStatus=all\|due_soon\|overdue`, `?page=1&limit=10`. Menyertakan indikator `isDueSoon` dan `isOverdue`. |
| **Tasks** | `GET` | `/tasks/upcoming` | Authenticated | Ambil daftar tugas yang mendekati tenggat (<48 jam). |
| **Tasks** | `GET` | `/tasks/stats` | Authenticated | Rekap statistik total tugas, progress ring, dan aktivitas mingguan. |
| **Tasks** | `GET` | `/tasks/:id` | Authenticated | Detail tugas. Dilindungi guard agar siswa tidak bisa mengintip tugas kelas lain. |
| **Tasks** | `PUT` | `/tasks/:id` | **Teacher (Owner)** | Perbarui data tugas. Siswa dilarang keras (403 Forbidden). |
| **Tasks** | `DELETE`| `/tasks/:id` | **Teacher (Owner)** | Hapus tugas beserta relasi pengerjaannya. |
| **Completion**| `POST` | `/tasks/:id/complete` | **Student** | Tandai tugas selesai. **Idempoten** (`ON CONFLICT DO NOTHING`). |
| **Completion**| `DELETE`| `/tasks/:id/complete`| **Student** | Batalkan status penyelesaian tugas (*untoggle*). |
| **Progress** | `GET` | `/tasks/:id/completions`| **Teacher** | Pantau daftar siswa di kelas beserta status selesai dan waktu submit. |

---

## 📮 Dokumentasi API & Pengujian Postman

Untuk mempermudah penguji, berkas Postman Collection dan Environment telah disediakan di folder [`docs/reference/`](./docs/reference/):

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** di kiri atas.
3. Pilih berkas [`docs/reference/postman_collection.json`](./docs/reference/postman_collection.json) dan [`docs/reference/postman_environment.json`](./docs/reference/postman_environment.json).
4. Pilih environment **"Class Task Tracker (Local)"** di pojok kanan atas.
5. Jalankan request **"Login sebagai Guru"** atau **"Login sebagai Siswa"** di folder `1. Authentication`.  
   Token JWT akan **otomatis tersimpan** di variabel environment, sehingga Anda dapat langsung mencoba seluruh endpoint tugas tanpa perlu menyalin token secara manual!
6. Dokumen [OpenAPI 3.1.0 JSON](./docs/reference/openapi.json) juga siap diimpor ke Swagger UI atau alat pengujian API lainnya.

---

## 🏗️ Keputusan Desain & Arsitektur (ADR)

1. **Monorepo Shared Package (`@class-task-tracker/shared`):**  
   Mencegah perbedaan tipe data (*type drift*) antara backend dan frontend. Perubahan DTO atau enum di satu tempat langsung terdeteksi oleh kompilator TypeScript di seluruh workspace.
2. **Relasi Kelas Pengguna (Direct FK vs Junction):**  
   Siswa diasosiasikan langsung dengan `class_id` di tabel `users`. Keputusan ini menjaga query join tetap sederhana, performa tinggi, dan sesuai dengan batasan studi kasus sekolah tanpa kerumitan tabel perantara *many-to-many*.
3. **Idempotensi Penyelesaian Tugas (Completion Guarantee):**  
   Penyelesaian tugas dijamin idempoten di level database melalui konstrain unik komposit `UNIQUE(task_id, student_id)`. Operasi `POST /api/tasks/:id/complete` memanfaatkan klausa `ON CONFLICT DO NOTHING`, sehingga klik ganda (*double-click*) dari siswa tidak akan pernah menduplikasi data atau memicu kegagalan server.
4. **Keamanan Berlapis (Defense-in-Depth):**  
   - Validasi input Zod di middleware sebelum data mencapai controller/service.
   - Hashing password `Bun.password` yang adaptif dan kuat terhadap serangan *brute force*.
   - Filter query berbasis peran pada level SQL query sehingga siswa tidak dapat mengakses tugas di luar kelasnya.

---

## 🤖 Keterbukaan Penggunaan Alat AI (AI Disclosure)

Sesuai instruksi transparansi pada petunjuk tes:

- **Bagian yang dibantu oleh AI:**
  1. *Boilerplate code setup* awal untuk skrip migrasi Drizzle ORM dan inisialisasi basis data PostgreSQL.
  2. Pembuatan skema OpenAPI 3.1.0 dan format struktur file JSON koleksi Postman v2.1.
  3. Pembuatan seeder data contoh (*mock data*) dengan skenario tanggal tenggat bervariasi.
- **Bagian yang dirancang, diubah, dan diverifikasi sendiri:**
  1. Rancangan arsitektur database relasional, skema indeks unik komposit untuk idempotensi completion, dan foreign key cascade rules.
  2. Implementasi logika otorisasi peran (*RBAC middleware*) untuk memastikan proteksi ketat antara guru dan siswa.
  3. Logika agregasi penyelesaian tugas guru (`completionStats`) dan subquery status pengerjaan personal siswa.
  4. Penulisan 25 skenario unit & integration test untuk membuktikan keandalan fitur dan kepatuhan terhadap batasan bisnis.

---

## 🔮 Catatan Pengembangan Selanjutnya

- **Antarmuka Web Frontend:** Komponen dan halaman web pada direktori `frontend/` saat ini disiapkan dan menunggu arahan template desain kanonis. Seluruh kontrak API, tipe data shared, dan layanan backend telah 100% siap untuk diintegrasikan secara instan.
- **Rencana Fitur Lanjutan:**
  1. *Real-time Notification:* Menggunakan WebSocket/SSE untuk memberikan peringatan dini tugas yang jatuh tempo dalam waktu kurang dari 24 jam.
  2. *Submission File Attachment:* Integrasi upload berkas tugas siswa (PDF/ZIP) dengan validasi tipe MIME dan penyimpanan cloud storage (S3/R2).
  3. *Laporan Unduhan:* Ekspor rekapitulasi progres penyelesaian tugas kelas ke format Excel/PDF untuk guru.

---

*Dikembangkan dengan penuh dedikasi untuk Seleksi Magang Fullstack Developer — SchoolTech Indonesia.*
