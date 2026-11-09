# 📦 @class-task-tracker/shared

Paket pustaka bersama (*Shared Package*) untuk aplikasi **Class Task Tracker**, bertindak sebagai *Single Source of Truth* (SSOT) kontrak data antara backend dan frontend.

---

## 📑 Struktur Isi

- `constants/`: Konstanta peran (`USER_ROLES = ['teacher', 'student']`) dan status tugas (`TASK_STATUS = ['all', 'completed', 'pending']`).
- `types/entities/`: Interface TypeScript entitas basis data (`User`, `Class`, `Task`, `TaskCompletion`).
- `types/dtos/`: Data Transfer Objects (DTO) untuk validasi request payload dan struktur standardized response.
- `utils/`: Utilitas pemformatan tanggal Indonesia (`formatDate`, `formatDateTime`) dan komputasi tenggat waktu (`isOverdue`, `isDueSoon`).

Paket ini diimpor oleh `@class-task-tracker/backend` dan `@class-task-tracker/frontend` via Bun Workspaces (`workspace:*`).
