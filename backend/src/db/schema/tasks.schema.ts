import { pgTable, serial, varchar, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classes } from './classes.schema';
import { users } from './users.schema';
import { taskCompletions } from './task-completions.schema';

export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),
    classId: integer('class_id').references(() => classes.id, { onDelete: 'cascade' }).notNull(),
    teacherId: integer('teacher_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    dueDate: timestamp('due_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_tasks_class_id').on(table.classId),
    index('idx_tasks_teacher_id').on(table.teacherId),
    index('idx_tasks_due_date').on(table.dueDate),
  ]
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  class: one(classes, {
    fields: [tasks.classId],
    references: [classes.id],
  }),
  teacher: one(users, {
    fields: [tasks.teacherId],
    references: [users.id],
  }),
  completions: many(taskCompletions),
}));
