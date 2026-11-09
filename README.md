# 📚 Dokumentasi Struktur Proyek

## 🛠️ Tech Stack

### Frontend
- **React** - Library UI
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utility-first

### Backend
- **Hono** - Lightweight web framework
- **Drizzle ORM** - Type-safe ORM
- **Bun** - JavaScript runtime & package manager
- **PostgreSQL** - Relational database

---

## 📁 Struktur Proyek

### Root Level
```bash
root-project/
├── frontend/               # React + Vite (client)
├── backend/                # Hono + Drizzle (API)
├── shared/                 # Shared types, constants & utilities
├── package.json            # Root workspace config
├── bun.lockb              # Bun lock file
├── tsconfig.base.json      # Base TypeScript config
├── .gitignore
├── .env.example           # Template environment variables
├── docker-compose.yml     # Docker setup (optional)
└── README.md
```
    💡 Catatan:
    Jika menggunakan monorepo dengan `bun` workspaces, setiap folder (`frontend/` & `backend/`) tetap memiliki `package.json` sendiri.
    Install dependency dilakukan di folder masing-masing, bukan di root.

---

## 🔧 Backend Structure

### Folder Layout
```bash
backend/
├── src/
│   ├── modules/                  # Fitur utama sistem (Modular Feature Folder)
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.route.ts
│   │   │   ├── auth.validator.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── auth.test.ts
│   │   ├── siswa/
│   │   │   ├── siswa.controller.ts
│   │   │   ├── siswa.service.ts
│   │   │   ├── siswa.route.ts
│   │   │   ├── siswa.validator.ts
│   │   │   ├── siswa.dto.ts
│   │   │   └── siswa.test.ts
│   │   ├── kelas/
│   │   ├── kegiatan/
│   │   ├── pembayaran/
│   │   └── laporan/
│   │
│   ├── db/                      # Database configuration & schema
│   │   ├── schema/              # Pendefinisian Schema Drizzle
│   │   │   ├── siswa.schema.ts
│   │   │   ├── kelas.schema.ts
│   │   │   └── index.ts
│   │   ├── migrations/          # Database migrations
│   │   ├── seeds/               # Seed data
│   │   │   └── dev.seed.ts
│   │   ├── connection.ts        # DB connection pool
│   │   └── index.ts
│   │
│   ├── middlewares/             # Global middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logger.middleware.ts
│   │   ├── validation.middleware.ts # (Optional)
│   │   ├── cors.middleware.ts # (Optional)
│   │   └── rate-limit.middleware.ts # (Optional)
│   │
│   ├── utils/                   # Helper functions
│   │   ├── response.ts          # Standardized API responses
│   │   ├── formatter.ts         # Data formatting utilities
│   │   ├── hash.ts              # Password hashing
│   │   ├── jwt.ts               # JWT token utilities
│   │   ├── pagination.ts        # Pagination helper
│   │   └── env.ts               # Environment variable parser
│   │
│   ├── routes/                  # Route aggregation
│   │   ├── index.ts             # Main router
│   │   └── api.ts               # API versioning (v1, v2)
│   │
│   ├── config/                  # Configuration files
│   │   ├── app.config.ts        # App-level config
│   │   ├── db.config.ts         # Database config
│   │   └── env.config.ts        # Environment config
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── api-response.ts
│   │   ├── request.ts
│   │   ├── user.ts
│   │   ├── pagination.ts
│   │   └── index.ts
│   │
│   ├── constants/               # Application constants
│   │   ├── roles.ts
│   │   ├── status.ts
│   │   └── errors.ts
│   │
│   └── server.ts                # Application entry point
│
├── tests/                       # Integration & E2E tests
│   ├── integration/
│   └── e2e/
│
├── .env
├── .env.example
├── tsconfig.json
├── drizzle.config.ts
└── package.json
```

### 📘 Penjelasan Komponen Backend

#### 🧩 `modules/` - Feature Modules
Setiap modul merepresentasikan satu domain bisnis dengan struktur lengkap:

| File              | Tanggung Jawab                                              | Contoh                                    |
| ----------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `*.controller.ts` | Handle HTTP request/response, validasi input                | Parse body, call service, return response |
| `*.service.ts`    | Business logic, orchestrate data operations                 | CRUD operations, business rules           |
| `*.route.ts`      | Define endpoints & middleware chain                         | `/api/siswa`, apply auth middleware       |
| `*.validator.ts`  | Input validation schemas (Zod)                              | Validate create/update payloads           |
| `*.dto.ts`        | Data Transfer Objects (input/output typing)                 | CreateSiswaDTO, SiswaResponseDTO          |
| `*.test.ts`       | Unit tests untuk modul                                      | Test service logic, controller responses  |

**Contoh `siswa.dto.ts`:**
```typescript
// Input DTOs
export interface CreateSiswaDTO {
  nama: string;
  nis: string;
  tanggalLahir: Date;
  kelasId: number;
  jenisKelamin: 'L' | 'P';
}

export interface UpdateSiswaDTO extends Partial<CreateSiswaDTO> {
  id: number;
}

// Output DTOs
export interface SiswaResponseDTO {
  id: number;
  nama: string;
  nis: string;
  kelas: {
    id: number;
    nama: string;
  };
  createdAt: Date;
}
```

**Contoh `siswa.validator.ts`:**
```typescript
import { z } from 'zod';

export const createSiswaSchema = z.object({
  nama: z.string().min(3).max(100),
  nis: z.string().length(10),
  tanggalLahir: z.coerce.date(),
  kelasId: z.number().positive(),
  jenisKelamin: z.enum(['L', 'P']),
});

export const updateSiswaSchema = createSiswaSchema.partial().extend({
  id: z.number().positive(),
});
```

#### 🗃️ `db/` - Database Layer
Struktur terorganisir untuk manajemen database:

**`schema/`** - Definisi tabel Drizzle ORM per domain
```typescript
// db/schema/siswa.schema.ts
import { pgTable, serial, varchar, date, integer } from 'drizzle-orm/pg-core';

export const siswa = pgTable('siswa', {
  id: serial('id').primaryKey(),
  nama: varchar('nama', { length: 100 }).notNull(),
  nis: varchar('nis', { length: 10 }).notNull().unique(),
  tanggalLahir: date('tanggal_lahir').notNull(),
  kelasId: integer('kelas_id').references(() => kelas.id),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**`migrations/`** - Version control untuk database schema

**`seeds/`** - Data awal untuk development/testing

**`connection.ts`** - Database connection pool setup

#### 🧱 `middlewares/` - Global Middlewares
Middleware yang diterapkan secara global atau per-route:

```typescript
// auth.middleware.ts
export const authMiddleware = async (c: Context, next: Next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const payload = await verifyJWT(token);
    c.set('user', payload);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};

// error.middleware.ts
export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err);
  
  if (err instanceof ValidationError) {
    return c.json({ error: err.message, details: err.errors }, 400);
  }
  
  return c.json({ error: 'Internal Server Error' }, 500);
};
```

#### 🧰 `utils/` - Utility Functions
Helper functions untuk operasi umum:

```typescript
// response.ts - Standardized API responses
export const successResponse = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
});

export const errorResponse = (message: string, errors?: any) => ({
  success: false,
  message,
  errors,
});

// pagination.ts
export const paginate = (page: number, limit: number) => ({
  offset: (page - 1) * limit,
  limit,
});
```

#### 🚀 `server.ts` - Entry Point
```typescript
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app = new Hono();

// Global middlewares
app.use('*', logger());
app.use('*', cors());

// Routes
app.route('/api/v1', routes);

// Error handler
app.onError(errorHandler);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

---

## 🎨 Frontend Structure

### Folder Layout
```bash
frontend/
├── src/
│   ├── assets/               # Gambar, ikon, font, dll
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── components/           # Komponen UI reusable (Button, UI, Forms, Layout, Modal, Table, Input)
│   │   ├── ui/               # Base components (Button, Input, Modal)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   └── index.ts
│   │   ├── forms/            # Form-related components
│   │   │   ├── FormInput.tsx
│   │   │   ├── FormSelect.tsx
│   │   │   └── FormDatePicker.tsx
│   │   └── layout/           # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   │
│   ├── features/             # Modular features (sinkron dengan backend)
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   └── types.ts
│   │   ├── siswa/
│   │   │   ├── components/
│   │   │   │   ├── SiswaTable.tsx
│   │   │   │   ├── SiswaForm.tsx
│   │   │   │   └── SiswaCard.tsx
│   │   │   ├── pages/
│   │   │   │   ├── SiswaListPage.tsx
│   │   │   │   ├── SiswaDetailPage.tsx
│   │   │   │   └── SiswaCreatePage.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSiswa.ts
│   │   │   │   └── useSiswaQuery.ts
│   │   │   ├── api/
│   │   │   │   └── siswaApi.ts
│   │   │   └── types.ts
│   │   ├── pembayaran/
│   │   ├── kegiatan/
│   │   └── laporan/
│   │
│   ├── layouts/               # Layout utama (AdminLayout, AuthLayout, dll)
│   │   ├── RootLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── index.ts
│   │
│   ├── pages/                # Halaman umum (Login, Dashboard, NotFound)
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NotFoundPage.tsx
│   │   └── ErrorPage.tsx
│   │
│   ├── hooks/                # Custom React hooks (useAuth, useFetch, dsb)
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   │
│   ├── routes/               # Routing global (react-router)
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   │
│   ├── services/             # API client (fetch/axios wrapper)
│   │   ├── api/
│   │   │   ├── client.ts     # Axios/Fetch wrapper
│   │   │   ├── interceptors.ts
│   │   │   └── endpoints.ts
│   │   └── storage/
│   │       └── localStorage.ts
│   │
│   ├── stores/               # State management (Zustand/Redux)
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── index.ts
│   │
│   ├── utils/                # Helper seperti format tanggal, konversi data
│   │   ├── format.ts         # Date, currency, number formatting
│   │   ├── validation.ts     # Frontend validation helpers
│   │   ├── cn.ts             # Tailwind class merger
│   │   └── index.ts
│   │
│   ├── types/                # TypeScript interfaces (frontend-only)
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   │
│   ├── constants/            # Konstanta global (role, baseURL, dsb)
│   │   ├── routes.ts
│   │   ├── roles.ts
│   │   ├── status.ts
│   │   └── index.ts
│   │
│   ├── styles/               # Global styles
│   │   ├── globals.css
│   │   └── tailwind.css
│   │
│   ├── lib/                  # Third-party library configs
│   │   ├── react-query.ts
│   │   └── axios.ts
│   │
│   ├── App.tsx               # Root React component
│   ├── main.tsx              # Entry point (Vite)
│   └── vite-env.d.ts         # Vite type definitions
│
├── public/                   # Static files
│   ├── favicon.ico
│   └── robots.txt
│
├── .env
├── .env.example
├── index.html
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

### 📘 Penjelasan Komponen Frontend

#### 🧩 `features/` - Feature Modules
Mengikuti prinsip feature-based architecture untuk skalabilitas:

**Struktur per Feature:**
```
feature/
├── components/     # UI components khusus feature
├── pages/          # Page components
├── hooks/          # Custom hooks untuk feature
├── api/            # API calls
└── types.ts        # Type definitions
```

**Contoh `features/siswa/api/siswaApi.ts`:**
```typescript
import { apiClient } from '@/services/api/client';
import type { Siswa, CreateSiswaDTO } from '@/types';

export const siswaApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get<Siswa[]>('/siswa', { params }),
  
  getById: (id: number) =>
    apiClient.get<Siswa>(`/siswa/${id}`),
  
  create: (data: CreateSiswaDTO) =>
    apiClient.post<Siswa>('/siswa', data),
  
  update: (id: number, data: Partial<CreateSiswaDTO>) =>
    apiClient.put<Siswa>(`/siswa/${id}`, data),
  
  delete: (id: number) =>
    apiClient.delete(`/siswa/${id}`),
};
```

**Contoh `features/siswa/hooks/useSiswa.ts`:**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { siswaApi } from '../api/siswaApi';

export const useSiswa = (id?: number) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['siswa', id],
    queryFn: () => id ? siswaApi.getById(id) : siswaApi.getAll(),
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: siswaApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siswa'] });
    },
  });

  return {
    siswa: data,
    isLoading,
    createSiswa: createMutation.mutate,
  };
};
```

#### 🧱 `layouts/` - Layout Components
Template untuk struktur halaman:

```typescript
// DashboardLayout.tsx
import { Header, Sidebar } from '@/components/layout';
import { Outlet } from 'react-router-dom';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
```

#### ⚙️ `services/api/client.ts` - API Client
Wrapper untuk HTTP requests dengan interceptors:

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### 📦 `stores/` - State Management
Global state menggunakan Zustand:

```typescript
// auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## 🔗 Shared Module

### Folder Layout
```bash
shared/
├── types/                    # Shared type definitions
│   ├── entities/
│   │   ├── siswa.ts
│   │   ├── kelas.ts
│   │   ├── kegiatan.ts
│   │   └── pembayaran.ts
│   ├── dtos/
│   │   └── api-response.ts
│   └── index.ts
│
├── constants/                # Shared constants
│   ├── roles.ts
│   ├── status.ts
│   └── index.ts
│
├── utils/                    # Shared utilities
│   ├── format.ts
│   ├── validation.ts
│   └── index.ts
│
└── package.json
```

### 📘 Keuntungan Shared Module

1. **Type Safety** - Frontend & backend menggunakan type yang sama
2. **Single Source of Truth** - Tidak ada duplikasi definisi
3. **Easier Refactoring** - Perubahan type hanya di satu tempat

**Contoh `shared/types/entities/siswa.ts`:**
```typescript
export interface Siswa {
  id: number;
  nama: string;
  nis: string;
  tanggalLahir: Date;
  kelasId: number;
  jenisKelamin: 'L' | 'P';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSiswaInput {
  nama: string;
  nis: string;
  tanggalLahir: Date;
  kelasId: number;
  jenisKelamin: 'L' | 'P';
}
```

**Usage di Backend:**
```typescript
import type { Siswa, CreateSiswaInput } from '@shared/types';
```

**Usage di Frontend:**
```typescript
import type { Siswa, CreateSiswaInput } from '@shared/types';
```

---

## 🎯 Best Practices

### 1. Naming Conventions
- **Files**: kebab-case (`siswa.service.ts`)
- **Components**: PascalCase (`SiswaForm.tsx`)
- **Functions/Variables**: camelCase (`getSiswaById`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`SiswaResponseDTO`)

### 2. Code Organization
- **One responsibility per file**
- **Export dari index.ts** untuk cleaner imports
- **Group related files** dalam folder yang sama
- **Separate business logic** dari UI logic

### 3. Type Safety
- **Avoid `any` type** - gunakan `unknown` atau specific types
- **Use strict TypeScript** config
- **Define DTOs** untuk input/output
- **Share types** antara frontend & backend

### 4. Error Handling
- **Consistent error format** di API responses
- **Proper HTTP status codes**
- **User-friendly error messages** di frontend
- **Log errors** untuk debugging

### 5. Testing
- **Unit tests** untuk service layer
- **Integration tests** untuk API endpoints
- **Component tests** untuk UI
- **E2E tests** untuk critical flows

### 6. Security
- **Validate all inputs** (frontend & backend)
- **Use prepared statements** (SQL injection prevention)
- **Implement rate limiting**
- **Secure JWT tokens**
- **Hash passwords** dengan bcrypt/argon2
- **CORS configuration** yang tepat

### 7. Performance
- **Implement pagination** untuk list data
- **Use database indexing**
- **Lazy load components**
- **Optimize bundle size**
- **Cache responses** where appropriate

---

## 📊 Architecture Summary

| Layer    | Struktur                                                | Prinsip                                   |
| -------- | ------------------------------------------------------- | ----------------------------------------- |
| Root     | `frontend/`, `backend/`, `shared/`                      | Monorepo Workspaces                       |
| Backend  | `modules`, `middlewares`, `db`, `utils`, `config`       | Clean Architecture & Layered Architecture |
| Frontend | `features`, `components`, `layouts`, `services`, `stores` | Feature-Based & Component Architecture    |
| Shared   | `types`, `constants`, `utils`                           | DRY Principle & Type Safety               |

### Design Principles
- **Separation of Concerns** - Setiap layer punya tanggung jawab jelas
- **Modularity** - Feature-based untuk mudah maintain & scale
- **Type Safety** - TypeScript di semua layer
- **Reusability** - Shared code untuk frontend & backend
- **Testability** - Struktur yang mudah untuk testing
- **Scalability** - Mudah menambah fitur baru

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Bun >= 1.0
- PostgreSQL >= 14

### Installation
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
bun install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run database migrations
cd backend
bun run db:migrate

# Seed database (optional)
bun run db:seed

# Start development servers
bun run dev
```

### Available Scripts
```bash
# Development
bun run dev              # Start both frontend & backend
bun run dev:frontend     # Start frontend only
bun run dev:backend      # Start backend only

# Build
bun run build            # Build both
bun run build:frontend   # Build frontend
bun run build:backend    # Build backend

# Testing
bun run test             # Run all tests
bun run test:unit        # Run unit tests
bun run test:e2e         # Run E2E tests

# Database
bun run db:migrate       # Run migrations
bun run db:seed          # Seed database
bun run db:studio        # Open Drizzle Studio
```

---

## 📝 Workflow Development

1. **Mulai dari Backend**
   - Buat schema database
   - Buat migration
   - Implement service layer
   - Buat controller & routes
   - Test dengan API client (Postman/Thunder Client)

2. **Lanjut ke Frontend**
   - Buat API service
   - Buat custom hooks
   - Develop UI components
   - Integrate dengan backend
   - Add form validation

3. **Testing & Refinement**
   - Unit tests
   - Integration tests
   - UI/UX improvements
   - Performance optimization

---

## 📚 Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)