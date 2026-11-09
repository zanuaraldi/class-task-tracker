import { z } from 'zod';
import { TASK_STATUS } from '@class-task-tracker/shared';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'Judul tugas wajib diisi' })
    .min(3, 'Judul tugas minimal 3 karakter')
    .max(200, 'Judul tugas maksimal 200 karakter')
    .trim(),
  description: z.string().trim().optional().nullable(),
  classId: z
    .number({ required_error: 'Kelas tujuan wajib dipilih' })
    .int()
    .positive('ID kelas harus bernilai positif'),
  dueDate: z.coerce.date().optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Judul tugas minimal 3 karakter')
    .max(200, 'Judul tugas maksimal 200 karakter')
    .trim()
    .optional(),
  description: z.string().trim().optional().nullable(),
  classId: z.number().int().positive('ID kelas harus bernilai positif').optional(),
  dueDate: z.coerce.date().optional().nullable(),
});

export const taskQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(TASK_STATUS).optional().default('all'),
  dueStatus: z.enum(['all', 'due_soon', 'overdue']).optional().default('all'),
  classId: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
