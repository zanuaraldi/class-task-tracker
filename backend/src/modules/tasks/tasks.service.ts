import { eq, and, ilike, sql, count, desc, inArray } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import db from '../../db/connection';
import { tasks, taskCompletions, classes, users } from '../../db/schema';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
  Task,
  StudentCompletionStatus,
  PaginatedData,
} from '@class-task-tracker/shared';
import { isDueSoon, isOverdue } from '@class-task-tracker/shared';
import type { JwtUserPayload } from '../../utils/jwt';

export class TasksService {
  static async createTask(input: CreateTaskInput, teacherId: number): Promise<Task> {
    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, input.classId),
    });

    if (!cls) {
      throw new HTTPException(400, { message: 'Kelas tujuan tidak ditemukan.' });
    }

    const [createdTask] = await db
      .insert(tasks)
      .values({
        title: input.title,
        description: input.description || null,
        classId: input.classId,
        teacherId,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      })
      .returning();

    const taskWithRel = await db.query.tasks.findFirst({
      where: eq(tasks.id, createdTask.id),
      with: {
        class: true,
        teacher: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    return taskWithRel as unknown as Task;
  }

  static async getTasks(
    filter: TaskFilterParams,
    user: JwtUserPayload
  ): Promise<PaginatedData<Task>> {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (user.role === 'student') {
      if (!user.classId) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }
      conditions.push(eq(tasks.classId, user.classId));
    } else if (user.role === 'teacher') {
      conditions.push(eq(tasks.teacherId, user.id));

      if (filter.classId) {
        conditions.push(eq(tasks.classId, filter.classId));
      }
    }

    if (filter.search && filter.search.trim()) {
      conditions.push(ilike(tasks.title, `%${filter.search.trim()}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(whereClause);

    const totalRaw = totalResult?.count || 0;

    const taskRows = await db.query.tasks.findMany({
      where: whereClause,
      with: {
        class: true,
        teacher: {
          columns: { id: true, name: true, email: true },
        },
        completions: true,
      },
      orderBy: [desc(tasks.createdAt)],
    });

    const classIds = [...new Set(taskRows.map((t) => t.classId))];
    const studentCountMap = new Map<number, number>();

    if (classIds.length > 0) {
      const studentCounts = await db
        .select({
          classId: users.classId,
          count: count(),
        })
        .from(users)
        .where(
          and(
            eq(users.role, 'student'),
            inArray(users.classId, classIds)
          )
        )
        .groupBy(users.classId);

      for (const row of studentCounts) {
        if (row.classId) {
          studentCountMap.set(row.classId, row.count);
        }
      }
    }

    let mappedTasks: Task[] = taskRows.map((t) => {
      const studentCompletion =
        user.role === 'student'
          ? t.completions.find((c) => c.studentId === user.id)
          : undefined;

      const isCompleted = !!studentCompletion;
      const completedAt = studentCompletion?.completedAt || null;

      const totalStudents = studentCountMap.get(t.classId) || 0;
      const completedCount = t.completions.length;

      return {
        id: t.id,
        classId: t.classId,
        teacherId: t.teacherId,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        class: t.class,
        teacher: t.teacher as any,
        isCompleted,
        completedAt,
        isOverdue: isOverdue(t.dueDate),
        isDueSoon: isDueSoon(t.dueDate, 48),
        completionStats: {
          completedCount,
          totalStudents,
        },
      };
    });

    if (user.role === 'student' && filter.status && filter.status !== 'all') {
      if (filter.status === 'completed') {
        mappedTasks = mappedTasks.filter((t) => t.isCompleted);
      } else if (filter.status === 'pending') {
        mappedTasks = mappedTasks.filter((t) => !t.isCompleted);
      }
    }

    if (filter.dueStatus && filter.dueStatus !== 'all') {
      if (filter.dueStatus === 'due_soon') {
        mappedTasks = mappedTasks.filter((t) => t.isDueSoon);
      } else if (filter.dueStatus === 'overdue') {
        mappedTasks = mappedTasks.filter((t) => t.isOverdue);
      }
    }

    const totalFiltered = mappedTasks.length;
    const paginatedItems = mappedTasks.slice(offset, offset + limit);

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages: Math.ceil(totalFiltered / limit) || 1,
      },
    };
  }

  static async getTaskById(taskId: number, user: JwtUserPayload): Promise<Task> {
    const taskItem = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        class: true,
        teacher: {
          columns: { id: true, name: true, email: true },
        },
        completions: true,
      },
    });

    if (!taskItem) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (user.role === 'student' && taskItem.classId !== user.classId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Tugas ini tidak ditujukan untuk kelas Anda.',
      });
    }

    const studentCompletion =
      user.role === 'student'
        ? taskItem.completions.find((c) => c.studentId === user.id)
        : undefined;

    const [totalStudentsRow] = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role, 'student'), eq(users.classId, taskItem.classId)));

    return {
      id: taskItem.id,
      classId: taskItem.classId,
      teacherId: taskItem.teacherId,
      title: taskItem.title,
      description: taskItem.description,
      dueDate: taskItem.dueDate,
      createdAt: taskItem.createdAt,
      updatedAt: taskItem.updatedAt,
      class: taskItem.class,
      teacher: taskItem.teacher as any,
      isCompleted: !!studentCompletion,
      completedAt: studentCompletion?.completedAt || null,
      isOverdue: isOverdue(taskItem.dueDate),
      isDueSoon: isDueSoon(taskItem.dueDate, 48),
      completionStats: {
        completedCount: taskItem.completions.length,
        totalStudents: totalStudentsRow?.count || 0,
      },
    };
  }

  static async updateTask(
    taskId: number,
    input: UpdateTaskInput,
    teacherId: number
  ): Promise<Task> {
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existingTask) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (existingTask.teacherId !== teacherId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Anda hanya dapat mengubah tugas yang Anda buat.',
      });
    }

    if (input.classId) {
      const cls = await db.query.classes.findFirst({
        where: eq(classes.id, input.classId),
      });
      if (!cls) {
        throw new HTTPException(400, { message: 'Kelas tujuan tidak ditemukan.' });
      }
    }

    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (input.title !== undefined) updatePayload.title = input.title;
    if (input.description !== undefined) updatePayload.description = input.description;
    if (input.classId !== undefined) updatePayload.classId = input.classId;
    if (input.dueDate !== undefined) {
      updatePayload.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updatePayload)
      .where(eq(tasks.id, taskId))
      .returning();

    const result = await db.query.tasks.findFirst({
      where: eq(tasks.id, updatedTask.id),
      with: {
        class: true,
        teacher: {
          columns: { id: true, name: true, email: true },
        },
      },
    });

    return result as unknown as Task;
  }

  static async deleteTask(taskId: number, teacherId: number): Promise<void> {
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existingTask) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (existingTask.teacherId !== teacherId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Anda hanya dapat menghapus tugas yang Anda buat.',
      });
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  static async completeTask(
    taskId: number,
    user: JwtUserPayload
  ): Promise<{ taskId: number; completedAt: Date }> {
    const taskItem = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!taskItem) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (taskItem.classId !== user.classId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Tugas ini bukan untuk kelas Anda.',
      });
    }

    await db
      .insert(taskCompletions)
      .values({
        taskId,
        studentId: user.id,
      })
      .onConflictDoNothing();

    const completion = await db.query.taskCompletions.findFirst({
      where: and(
        eq(taskCompletions.taskId, taskId),
        eq(taskCompletions.studentId, user.id)
      ),
    });

    return {
      taskId,
      completedAt: completion!.completedAt,
    };
  }

  static async uncompleteTask(taskId: number, user: JwtUserPayload): Promise<void> {
    const taskItem = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!taskItem) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (taskItem.classId !== user.classId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Tugas ini bukan untuk kelas Anda.',
      });
    }

    await db
      .delete(taskCompletions)
      .where(
        and(
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.studentId, user.id)
        )
      );
  }

  static async getUpcomingTasks(user: JwtUserPayload): Promise<Task[]> {
    const filterParams: TaskFilterParams = {
      page: 1,
      limit: 50,
      dueStatus: 'due_soon',
      status: user.role === 'student' ? 'pending' : 'all',
    };

    const result = await this.getTasks(filterParams, user);
    return result.items;
  }

  static async getTaskCompletions(
    taskId: number,
    teacherId: number
  ): Promise<{
    taskId: number;
    title: string;
    class: { id: number; name: string };
    students: StudentCompletionStatus[];
  }> {
    const taskItem = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
      with: {
        class: true,
        completions: true,
      },
    });

    if (!taskItem) {
      throw new HTTPException(404, { message: 'Tugas tidak ditemukan.' });
    }

    if (taskItem.teacherId !== teacherId) {
      throw new HTTPException(403, {
        message: 'Akses ditolak. Anda bukan pembuat tugas ini.',
      });
    }

    const classStudents = await db.query.users.findMany({
      where: and(eq(users.role, 'student'), eq(users.classId, taskItem.classId)),
      orderBy: (u, { asc }) => [asc(u.name)],
    });

    const completionMap = new Map<number, Date>();
    for (const c of taskItem.completions) {
      completionMap.set(c.studentId, c.completedAt);
    }

    const studentsStatus: StudentCompletionStatus[] = classStudents.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      isCompleted: completionMap.has(s.id),
      completedAt: completionMap.get(s.id) || null,
    }));

    return {
      taskId: taskItem.id,
      title: taskItem.title,
      class: {
        id: taskItem.class.id,
        name: taskItem.class.name,
      },
      students: studentsStatus,
    };
  }

  static async getTaskStats(user: JwtUserPayload) {
    const filterParams: TaskFilterParams = {
      page: 1,
      limit: 100,
      status: 'all',
      dueStatus: 'all',
    };

    const taskResult = await this.getTasks(filterParams, user);
    const allTasks = taskResult.items;

    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);
    monday.setHours(0, 0, 0, 0);

    let total = allTasks.length;
    let done = 0;
    let pending = 0;
    let completion = 0;
    let dueSoon = 0;
    const soon = allTasks.filter((t) => t.isDueSoon && (user.role === 'teacher' || !t.isCompleted)).slice(0, 4);

    if (user.role === 'teacher') {
      let totalExpected = 0;
      for (const t of allTasks) {
        const completedCount = t.completionStats?.completedCount || 0;
        const totalStudents = t.completionStats?.totalStudents || 0;
        done += completedCount;
        totalExpected += totalStudents;
        if (t.isDueSoon) dueSoon++;
      }
      pending = Math.max(0, totalExpected - done);
      completion = totalExpected > 0 ? Math.round((done / totalExpected) * 100) : 0;
    } else {
      done = allTasks.filter((t) => t.isCompleted).length;
      pending = Math.max(0, total - done);
      completion = total > 0 ? Math.round((done / total) * 100) : 0;
      dueSoon = allTasks.filter((t) => t.isDueSoon && !t.isCompleted).length;
    }

    const week = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      let dayDone = 0;
      let dayPending = 0;

      for (const t of allTasks) {
        if (t.dueDate) {
          const d = new Date(t.dueDate);
          if (d >= dayStart && d <= dayEnd) {
            if (user.role === 'teacher') {
              const comp = t.completionStats?.completedCount || 0;
              const tot = t.completionStats?.totalStudents || 0;
              dayDone += comp;
              dayPending += Math.max(0, tot - comp);
            } else {
              if (t.isCompleted) dayDone++;
              else dayPending++;
            }
          }
        }
      }

      return { done: dayDone, pending: dayPending };
    });

    return {
      total,
      done,
      pending,
      completion,
      dueSoon,
      due_soon: dueSoon,
      week,
      soon,
    };
  }
}
