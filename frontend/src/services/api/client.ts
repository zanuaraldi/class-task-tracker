import type {
  User,
  Class,
  Task,
  StudentCompletionStatus,
  LoginInput,
  RegisterInput,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
  PaginatedData,
  TaskStatsData,
} from '@class-task-tracker/shared';
import { storage } from '../storage/localStorage';

const rawUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';
const BASE_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string> | any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = storage.getToken();
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, 'Tidak dapat terhubung ke server. Pastikan backend aktif.');
  }

  if (res.status === 204) {
    return {} as T;
  }

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMap: Record<string, string> = {};
    if (Array.isArray(json.errors)) {
      for (const err of json.errors) {
        if (err.path && err.path[0]) {
          errorMap[err.path[0]] = err.message;
        }
      }
    }
    throw new ApiError(
      res.status,
      json.message || 'Terjadi kesalahan pada server.',
      Object.keys(errorMap).length ? errorMap : json.errors
    );
  }

  return (json.data !== undefined ? json.data : json) as T;
}

export const api = {
  auth: {
    login: (body: LoginInput) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    register: (body: RegisterInput) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    me: () => request<{ user: User }>('/auth/me'),
  },

  classes: {
    getAll: () => request<Class[]>('/classes'),
  },

  tasks: {
    getAll: (filter: TaskFilterParams = {}) => {
      const q = new URLSearchParams();
      if (filter.page) q.set('page', String(filter.page));
      if (filter.limit) q.set('limit', String(filter.limit));
      if (filter.search) q.set('search', filter.search.trim());
      if (filter.status && filter.status !== 'all') q.set('status', filter.status);
      if (filter.dueStatus && filter.dueStatus !== 'all') q.set('dueStatus', filter.dueStatus);
      if (filter.classId) q.set('classId', String(filter.classId));

      const queryStr = q.toString();
      return request<PaginatedData<Task>>(`/tasks${queryStr ? `?${queryStr}` : ''}`);
    },

    getById: (id: number) => request<Task>(`/tasks/${id}`),

    getUpcoming: () => request<Task[]>('/tasks/upcoming'),

    getStats: () => request<TaskStatsData>('/tasks/stats'),

    create: (body: CreateTaskInput) =>
      request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    update: (id: number, body: UpdateTaskInput) =>
      request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),

    delete: (id: number) =>
      request<null>(`/tasks/${id}`, {
        method: 'DELETE',
      }),

    complete: (id: number) =>
      request<{ taskId: number; completedAt: string }>(`/tasks/${id}/complete`, {
        method: 'POST',
      }),

    uncomplete: (id: number) =>
      request<null>(`/tasks/${id}/complete`, {
        method: 'DELETE',
      }),

    getCompletions: (id: number) =>
      request<{
        taskId: number;
        title: string;
        class: { id: number; name: string };
        students: StudentCompletionStatus[];
      }>(`/tasks/${id}/completions`),
  },
};
