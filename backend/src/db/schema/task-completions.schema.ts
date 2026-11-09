import { pgTable, serial, timestamp, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks.schema';
import { users } from './users.schema';

export const taskCompletions = pgTable(
  'task_completions',
  {
    id: serial('id').primaryKey(),
    taskId: integer('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
    studentId: integer('student_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    completedAt: timestamp('completed_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('unique_task_student_idx').on(table.taskId, table.studentId),
  ]
);

export const taskCompletionsRelations = relations(taskCompletions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskCompletions.taskId],
    references: [tasks.id],
  }),
  student: one(users, {
    fields: [taskCompletions.studentId],
    references: [users.id],
  }),
}));
