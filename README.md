# 📋 Class Task Tracker — SchoolTech Indonesia

[![Bun](https://img.shields.io/badge/Bun-1.3+-fbf0df?logo=bun&logoColor=black)](https://bun.sh)
[![Hono](https://img.shields.io/badge/Hono-v4-E36002?logo=hono&logoColor=white)](https://hono.dev)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tests](https://img.shields.io/badge/Tests-31%20Passed-success?logo=checkmarx&logoColor=white)](https://bun.sh)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

Aplikasi **Manajemen Tugas Kelas (Class Task Tracker)** berbasis Fullstack Web monorepo modern, dibuat untuk memenuhi **Tes Praktik & Kompetensi Fullstack Developer Magang — SchoolTech Indonesia**.

Aplikasi ini membantu **Guru** untuk mengelola tugas (buat, edit, hapus, dan pantau progres pengumpulan siswa per kelas secara transparan) serta memudahkan **Siswa** untuk melihat tugas kelasnya, mencari tugas, memfilter status pengerjaan, dan menandai tugas selesai secara **idempoten**.

---

## 📑 Daftar Isi

- [Pilihan Tech Stack & Alasan Pemilihan](#-pilihan-tech-stack--alasan-pemilihan)
- [Keterbukaan Penggunaan Alat AI (AI Disclosure)](#-keterbukaan-penggunaan-alat-ai-ai-disclosure)
- [Nilai Tambah (Value-Add Bonus)](#-nilai-tambah-value-add-bonus)
- [Panduan Menjalankan Aplikasi dari Nol](#-panduan-menjalankan-aplikasi-dari-nol)
  - [Opsi A: Pakai Docker (Paling Praktis)](#-opsi-a-menjalankan-lewat-docker-compose-rekomendasi-cepat)
  - [Opsi B: Setup Lokal Manual via Bun](#-opsi-b-setup-lokal-manual-via-bun-langkah-demi-langkah)
- [Akun Contoh untuk Login (Demo)](#-akun-contoh-untuk-login-demo)
- [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)
- [Dokumentasi API & Pengujian Postman](#-dokumentasi-api--pengujian-postman)
- [Keputusan Desain & Arsitektur yang Diambil](#-keputusan-desain--arsitektur-yang-diambil)
- [Bagian yang Belum Selesai / Rencana Tambahan](#-bagian-yang-belum-selesai--rencana-tambahan)

---

## 🛠️ Pilihan Tech Stack & Alasan Pemilihan

Sesuai ketentuan tes yang membebaskan pemilihan stack, proyek ini memilih kombinasi **modern TypeScript monorepo** yang cepat, ringan, dan aman:

```bash
class-task-tracker/
├── backend/                                                # REST API Service (Bun + Hono + Drizzle ORM + PostgreSQL)
├── frontend/                                               # Web Client SPA (React 19 + Vite + Tailwind CSS v4)
├── shared/                                                 # Package @class-task-tracker/shared (DTO, Interfaces, Types)
├── docker-compose.yml                                      # Orkestrasi Docker database & backend
├── Class_Task_Tracker_API.postman_collection.json          # Dokumentasi & Koleksi Postman API
├── Class_Task_Tracker_Environment.postman_environment.json # Environment Postman (Local)
├── openapi.json                                            # Dokumen Spesifikasi OpenAPI 3.1
└── package.json                                            # Workspace orchestrator
```

### Kenapa Memilih Stack Ini?

1. **Backend: [Bun](https://bun.sh) + [Hono](https://hono.dev) v4**
   - *Kenapa bukan Express/Laravel/Django?* Bun punya waktu booting super cepat (milidetik) dengan *built-in TypeScript runner* dan *test runner* bawaan tanpa perlu setup rumit seperti `ts-node` atau `tsx`.
   - Hono merupakan framework web generasi baru yang sangat ringan (*overhead* mendekati nol), routing berbasis Trie/RegExp yang kencang, dan memiliki *type-safe context* yang sangat nyaman untuk API modern.
2. **Database: [PostgreSQL](https://www.postgresql.org) 17 + [Drizzle ORM](https://orm.drizzle.team)**
   - PostgreSQL dipilih karena kehandalan integritas data relasionalnya (foreign key cascade, indeks komposit unik, dan performa join query).
   - Drizzle ORM dipilih dibanding Prisma/TypeORM karena *zero overhead*, sintaks query yang sangat dekat dengan SQL asli (*type-safe SQL*), serta tidak menghasilkan binary engine berat.
3. **Frontend: [React 19](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS v4](https://tailwindcss.com)**
   - React 19 memberikan performa rendering yang sangat mulus untuk *Single Page Application (SPA)*. Interaksi seperti filter tugas instan, modal form, dan *toggle* status selesai terasa responsif tanpa reload halaman.
   - Tailwind CSS v4 membawa engine baru berbasis CSS murni yang super cepat saat build, memudahkan penyesuaian tema (*Eco System* palet hijau-sage-gelap) dan layout responsif dari mobile (375px) hingga desktop.
4. **Monorepo Shared Package (`@class-task-tracker/shared`)**
   - DTO request/response, interface entitas (`Task`, `User`, `Class`), dan enum didefinisikan satu kali di folder `shared/`. Ini mencegah terjadinya *type drift* atau beda penamaan variabel antara backend dan frontend.

---

## 🤖 Keterbukaan Penggunaan Alat AI (AI Disclosure)

Sesuai instruksi transparansi pada lembar tes kompetensi, berikut rincian jujur mengenai pengerjaan proyek ini:

> *"Backend termasuk db itu saya ngetik sendiri dan untuk pengecekkan alur saya minta bantuan AI untuk ngecek ada bug atau tidaknya. frontend saya meminta bantuan AI untuk menyusun frontendnya. dan setup docker juga."*

Lebih jelasnya, pembagian kerjanya sebagai berikut:

### 1. Yang Saya Rancang, Ketik, dan Kerjakan Sendiri (Effort Utama):
- **Desain & Implementasi Database:** Merancang struktur tabel relasional (`users`, `classes`, `tasks`, `task_completions`), menentukan relasi foreign key dengan `onDelete: cascade`, indexing kolom pencarian, serta merancang constraint unik komposit `UNIQUE(task_id, student_id)` agar penandaan tugas bersifat idempoten.
- **Logika & Koding Backend (REST API):** Mengetik seluruh kode backend Hono dari nol, mulai dari routing endpoint, controller tugas & kelas, query Drizzle ORM, autentikasi stateless JWT, hashing password bcrypt via `Bun.password`, hingga middleware proteksi peran (*RBAC middleware* Guru vs Siswa).
- **Pengujian Otomatis (Automated Tests):** Menulis 31 skenario test menggunakan `bun:test` yang menguji registrasi, proteksi akses, CRUD tugas, query filter & pagination, hingga penanganan *edge cases* seperti mencegah siswa mengedit tugas atau melihat tugas kelas lain.
- **Integrasi Frontend & Logika State:** Menyambungkan *API client*, membenahi *AuthContext*, alur token JWT di localStorage, validasi input form, pembuatan fitur *Quick Login* demo, serta memastikan tampilan responsif di layar mobile (375px) dengan ukuran tombol minimal 44x44px.

### 2. Yang Dibantu Oleh Alat AI (Sebagai Asisten / Second Opinion):
- **Pengecekan Alur & Bug Review:** Menggunakan AI untuk me-review alur logika backend yang sudah saya ketik, terutama untuk memastikan tidak ada celah keamanan (*edge cases*), potensi *race condition*, atau penanganan error yang terlewat.
- **Penyusunan Kerangka Frontend:** Meminta bantuan AI untuk membantu menyusun kerangka komponen React dan memetakan struktur HTML/CSS dari template awal (`template-05`) menjadi potongan komponen React terstruktur (Sidebar, Header, TaskList, Modal).
- **Setup Docker & Format Dokumentasi:** Meminta bantuan AI untuk membuatkan boilerplate dasar `Dockerfile` multi-stage dan `docker-compose.yml`, serta membantu memformat skema JSON untuk OpenAPI 3.1 dan Postman Collection v2.1.

---

## 🌟 Nilai Tambah (Value-Add Bonus)

Semua 4 poin nilai tambah pada petunjuk tes berhasil diimplementasikan:

1. **Automated Integration Test Suite (31 Tests Passed):**  
   Pengujian otomatis menggunakan `bun:test` mencakup flow registrasi email ganda, validasi JWT, proteksi RBAC (siswa dilarang CRUD tugas), isolasi data antar kelas, filter & pencarian tugas, serta idempotensi pengerjaan tugas (`ON CONFLICT DO NOTHING`).
2. **Dokumentasi API Lengkap (Postman Collection v2.1 + OpenAPI 3.1):**  
   - Koleksi Postman ([`Class_Task_Tracker_API.postman_collection.json`](./Class_Task_Tracker_API.postman_collection.json)) dan Environment ([`Class_Task_Tracker_Environment.postman_environment.json`](./Class_Task_Tracker_Environment.postman_environment.json)) sudah disediakan langsung di root proyek, lengkap dengan skrip otomatis *token capture* (`pm.environment.set`). Cukup klik tombol Login sekali, seluruh request tugas berikutnya langsung otomatis terotentikasi.
   - Dokumen spesifikasi [OpenAPI 3.1.0](./openapi.json) siap diimpor ke Swagger UI atau API viewer.
3. **Setup Instan dengan Docker Compose:**  
   Menyediakan `docker-compose.yml` yang siap menjalankan PostgreSQL 17 dan Backend Hono sekaligus secara otomatis (auto-migrate + auto-seed).
4. **Peringatan Tenggat Tugas (Deadline Warning & Upcoming Tasks):**  
   Setiap tugas secara otomatis menghitung flag status `isOverdue` (lewat deadline) dan `isDueSoon` (tenggat <48 jam), didukung endpoint `GET /api/tasks/upcoming` dan `GET /api/tasks/stats`.

---

## 🚀 Panduan Menjalankan Aplikasi dari Nol

Anda bisa memilih menjalankan via **Docker (Paling Cepat)** atau **Lokal Manual via Bun**:

### 🐳 Opsi A: Menjalankan Lewat Docker Compose (Rekomendasi Cepat)

Jika di komputer Anda sudah terpasang Docker Desktop:

```bash
# 1. Jalankan kontainer database PostgreSQL 17 dan Backend Hono
docker compose up -d

# 2. Cek status log (otomatis menjalankan migrasi skema dan seed data)
docker compose logs -f backend
```
*Backend langsung aktif di `http://localhost:3000` lengkap dengan database dan data demo.*

Untuk menjalankan antarmuka frontend:
```bash
bun --cwd frontend dev
```
*Frontend aktif di `http://localhost:5173`.*

---

### 💻 Opsi B: Setup Lokal Manual via Bun (Langkah demi Langkah)

Ikuti langkah-langkah berikut untuk menjalankan langsung di komputer lokal Anda:

#### Prasyarat:
- **[Bun Runtime](https://bun.sh):** v1.1.0 atau lebih baru (`bun --version`).
- **PostgreSQL:** v14 ke atas (sudah aktif di `localhost:5432`).

#### Langkah 1: Clone Repositori
```bash
git clone https://github.com/<username>/class-task-tracker.git
cd class-task-tracker
```

#### Langkah 2: Instalasi Seluruh Dependensi Monorepo
```bash
bun install
```

#### Langkah 3: Konfigurasi Environment Variables
Salin template `.env.example` di folder `backend/` menjadi `.env`:
```bash
cp backend/.env.example backend/.env
```
Sesuaikan kredensial PostgreSQL Anda pada `backend/.env` jika berbeda:
```env
DATABASE_URL=postgres://postgres:password123@localhost:5432/schooltech-test
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173,http://localhost:5174
JWT_SECRET=super_secret_jwt_schooltech_2026_key
```

#### Langkah 4: Inisialisasi Database & Push Skema
Jalankan inisialisasi basis data (otomatis membuat database `schooltech-test` jika belum ada) dan lakukan push skema tabel Drizzle:
```bash
# Inisialisasi database
bun run db:init

# Push skema tabel Drizzle ke PostgreSQL
bun run db:push
```

#### Langkah 5: Jalankan Database Seeder (Data Demo)
Isi database dengan data awal realistis (akun guru, 2 siswa, 2 kelas, dan contoh tugas):
```bash
bun run db:seed
```

#### Langkah 6: Jalankan Automated Test (Opsional namun Disarankan)
Pastikan semua fungsionalitas dan logika bisnis berjalan normal:
```bash
bun test
```
*Hasil: 31 passed, 0 failed (100% lulus).*

#### Langkah 7: Jalankan Backend & Frontend (Terminal Terpisah)
Jalankan backend dan frontend pada **2 jendela terminal terpisah** agar log proses masing-masing service terpantau jelas:

**Terminal 1 — Backend API (Hono):**
```bash
cd backend
bun run dev
```
*(atau dari root proyek: `bun run dev:backend`)*  
Backend aktif di `http://localhost:3000` (Health check: `http://localhost:3000/health`).

**Terminal 2 — Frontend Web (React + Vite):**
```bash
cd frontend
bun run dev
```
*(atau dari root proyek: `bun run dev:frontend`)*  
Frontend aktif di `http://localhost:5173` (atau port otomatis selanjutnya jika 5173 terpakai).

---

## 🔑 Akun Contoh untuk Login (Demo)

Setelah menjalankan seeder (`bun run db:seed`), akun-akun berikut siap digunakan:

| Peran (Role) | Email | Password | Keterangan / Asosiasi Kelas |
|---|---|---|---|
| **👨‍🏫 Guru (Teacher)** | `teacher@example.com` | `password123` | Wali Kelas 10-A, Pembuat Tugas & Pemantau Progres |
| **🧑‍🎓 Siswa 1 (Student)**| `student1@example.com` | `password123` | Anggota Kelas 10-A (1 tugas sudah selesai) |
| **🧑‍🎓 Siswa 2 (Student)**| `student2@example.com` | `password123` | Anggota Kelas 10-A (belum ada tugas selesai) |

> 💡 **Tips Pengujian Frontend:** Pada halaman Login / Register di frontend, sudah disediakan tombol **"Quick Login" 1-klik** untuk Guru, Siswa 1, dan Siswa 2 agar Anda tidak perlu mengetik email & password berulang kali.

---

## 📡 Daftar Endpoint REST API

Base URL Backend: `http://localhost:3000/api`

| Kategori | Method | Endpoint | Hak Akses | Deskripsi & Fitur Utama |
|---|:---:|---|:---:|---|
| **Auth** | `POST` | `/auth/register` | Public | Registrasi akun baru (Guru / Siswa). |
| **Auth** | `POST` | `/auth/login` | Public | Login akun & mendapatkan token JWT. |
| **Auth** | `GET` | `/auth/me` | Authenticated | Ambil profil pengguna yang sedang login. |
| **Classes** | `GET` | `/classes` | Authenticated | Ambil daftar kelas yang tersedia. |
| **Classes** | `GET` | `/classes/:id` | Authenticated | Ambil detail satu kelas beserta wali kelasnya. |
| **Tasks** | `POST` | `/tasks` | **Teacher** | Buat tugas baru (`title`, `description`, `classId`, `dueDate`). |
| **Tasks** | `GET` | `/tasks` | Authenticated | Ambil daftar tugas. Mendukung query `?search=...`, `?status=all\|pending\|completed`, `?dueStatus=all\|due_soon\|overdue`, `?page=1&limit=10`. Menyertakan flag `isDueSoon` dan `isOverdue`. |
| **Tasks** | `GET` | `/tasks/upcoming` | Authenticated | Ambil tugas-tugas yang mendekati tenggat (<48 jam). |
| **Tasks** | `GET` | `/tasks/stats` | Authenticated | Statistik ringkasan (total tugas, persentase selesai, chart mingguan). |
| **Tasks** | `GET` | `/tasks/:id` | Authenticated | Detail tugas. Siswa dilarang mengintip tugas kelas lain. |
| **Tasks** | `PUT` | `/tasks/:id` | **Teacher (Owner)** | Perbarui data tugas. Siswa otomatis ditolak (403 Forbidden). |
| **Tasks** | `DELETE`| `/tasks/:id` | **Teacher (Owner)** | Hapus tugas beserta relasi pengerjaan siswa. |
| **Completion**| `POST` | `/tasks/:id/complete` | **Student** | Tandai tugas selesai. Bersifat **idempoten** (`ON CONFLICT DO NOTHING`). |
| **Completion**| `DELETE`| `/tasks/:id/complete`| **Student** | Batalkan status penyelesaian tugas (*untoggle*). |
| **Progress** | `GET` | `/tasks/:id/completions`| **Teacher** | Pantau daftar siswa di kelas dan status selesai/belum beserta waktu submit. |

---

## 📮 Dokumentasi API & Pengujian Postman

Berkas Postman Collection dan Environment telah disiapkan langsung di **root proyek**:

1. Buka aplikasi **Postman**.
2. Klik tombol **Import** dan pilih kedua berkas berikut dari folder root:
   - [`Class_Task_Tracker_API.postman_collection.json`](./Class_Task_Tracker_API.postman_collection.json)
   - [`Class_Task_Tracker_Environment.postman_environment.json`](./Class_Task_Tracker_Environment.postman_environment.json)
3. Pilih environment **"Class Task Tracker (Local)"** di pojok kanan atas Postman.
4. Buka folder `1. Authentication` lalu jalankan request **"Login sebagai Guru"** atau **"Login sebagai Siswa"**.  
   *Token JWT otomatis tersimpan ke environment*, sehingga seluruh request tugas di folder lainnya bisa langsung dijalankan tanpa repot menyalin token secara manual.

---

## 🏗️ Keputusan Desain & Arsitektur yang Diambil

1. **Monorepo Shared Contracts (`@class-task-tracker/shared`):**  
   Tipe data request, response, dan entitas disatukan dalam satu package. Ketika backend mengubah tipe data DTO, kompilator TypeScript di frontend langsung memberitahu jika ada *mismatch*.
2. **Idempotensi Penyelesaian Tugas (Completion Idempotency):**  
   Di tabel `task_completions`, terdapat constraint komposit unik `UNIQUE(task_id, student_id)`. Endpoint `POST /api/tasks/:id/complete` menggunakan klausa `ON CONFLICT DO NOTHING`. Jika siswa menekan tombol centang beberapa kali (misal karena jaringan lambat), server tetap mengembalikan respons sukses tanpa membuat data ganda atau error database.
3. **Isolasi Akses & Keamanan Berlapis (Defense-in-Depth):**  
   - Validasi skema input runtime menggunakan Zod di layer middleware sebelum masuk ke controller.
   - Hak akses role (`teacher` vs `student`) diverifikasi ketat di middleware. Siswa tidak memiliki izin membuat, mengubah, atau menghapus tugas.
   - Siswa diisolasi pada level SQL query sehingga hanya dapat melihat tugas yang ditujukan untuk `class_id` miliknya.
4. **Relasi Kelas Langsung (Direct Foreign Key):**  
   Siswa diasosiasikan langsung via `class_id` pada tabel `users`. Keputusan ini menjaga query join tetap sederhana, cepat, dan sesuai dengan batasan studi kasus sekolah tanpa perlu tabel perantara (*many-to-many*) yang berlebihan.
5. **Cascade Deletion:**  
   Ketika guru menghapus sebuah tugas, seluruh catatan riwayat pengerjaan siswa pada tugas tersebut otomatis dibersihkan via `ON DELETE CASCADE` di level database PostgreSQL, menjaga database tetap bersih tanpa data yatim (*orphan records*).
6. **Desain UI/UX Ramah Mobile:**  
   Komponen antarmuka mengadopsi tema *Eco System* (aksen lime `#9fd12b`, latar sage, dan frame dark `#1f1f1f`). Seluruh elemen interaktif (tombol, input, checkbox tugas) memiliki area sentuh minimal **44px × 44px** untuk kenyamanan penggunaan di layar smartphone (375px) tanpa adanya *horizontal scroll*.

---

## 🔮 Bagian yang Belum Selesai / Rencana Tambahan

Jika diberikan waktu pengembangan tambahan, fitur-fitur berikut yang akan saya tambahkan:

1. **Lampiran Berkas Tugas (File Upload Attachment):**  
   Menambahkan kemampuan bagi guru untuk melampirkan berkas materi/soal (PDF/DOCX) dan bagi siswa untuk mengunggah bukti pengerjaan tugas (PDF/ZIP/gambar) dengan integrasi cloud storage seperti AWS S3 atau Cloudflare R2.
2. **Notifikasi Real-time (WebSocket / Server-Sent Events):**  
   Pembaruan status secara *live* saat guru menerbitkan tugas baru di kelas atau ketika mendekati batas tenggat waktu (<24 jam) tanpa perlu me-refresh halaman.
3. **Ekspor Rekapitulasi Nilai & Progres (Excel / PDF):**  
   Fitur unduh laporan bagi guru untuk mengekspor data absensi pengumpulan tugas siswa per kelas ke dalam format spreadsheet (.xlsx) atau dokumen cetak (.pdf).
4. **Dukungan Multi-Kelas untuk Guru:**  
   Memungkinkan guru untuk mengajar dan mengelola beberapa kelas sekaligus secara fleksibel dengan filter kelas pada dashboard tugas.

---

*Dikerjakan dengan dedikasi dan komitmen penuh untuk Seleksi Magang Fullstack Developer — SchoolTech Indonesia.*
