import { pgTable, serial, varchar, timestamp, integer, index, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { classes } from './classes.schema';
import { tasks } from './tasks.schema';
import { taskCompletions } from './task-completions.schema';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 150 }).notNull(),
    email: varchar('email', { length: 150 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('student'),
    classId: integer('class_id').references((): AnyPgColumn => classes.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_users_class_id').on(table.classId),
    index('idx_users_role').on(table.role),
  ]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  enrolledClass: one(classes, {
    fields: [users.classId],
    references: [classes.id],
    relationName: 'classStudents',
  }),
  managedClasses: many(classes, {
    relationName: 'classTeacher',
  }),
  tasksCreated: many(tasks),
  completions: many(taskCompletions),
}));
