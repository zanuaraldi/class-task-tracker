import { pgTable, serial, varchar, timestamp, integer, type AnyPgColumn } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { tasks } from './tasks.schema';

export const classes = pgTable('classes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  teacherId: integer('teacher_id').references((): AnyPgColumn => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
    relationName: 'classTeacher',
  }),
  students: many(users, {
    relationName: 'classStudents',
  }),
  tasks: many(tasks),
}));
