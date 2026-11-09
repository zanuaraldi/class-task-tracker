import db from '../../db/connection';
import { classes } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

export class ClassesService {
  static async getAll() {
    const list = await db.query.classes.findMany({
      with: {
        teacher: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: (cls, { asc }) => [asc(cls.name)],
    });

    return list.map((item) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacherId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      teacher: item.teacher,
      studentsCount: item.students?.length || 0,
    }));
  }

  static async getById(id: number) {
    const cls = await db.query.classes.findFirst({
      where: eq(classes.id, id),
      with: {
        teacher: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        students: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!cls) {
      throw new HTTPException(404, { message: 'Kelas tidak ditemukan.' });
    }

    return {
      id: cls.id,
      name: cls.name,
      teacherId: cls.teacherId,
      createdAt: cls.createdAt,
      updatedAt: cls.updatedAt,
      teacher: cls.teacher,
      studentsCount: cls.students?.length || 0,
      students: cls.students,
    };
  }
}
