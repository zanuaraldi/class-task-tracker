import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import db from '../../db/connection';
import { users, classes } from '../../db/schema';
import { hashPassword, verifyPassword } from '../../utils/hash';
import { signJwt } from '../../utils/jwt';
import type { RegisterInput, LoginInput, User } from '@class-task-tracker/shared';

export class AuthService {
  static async register(input: RegisterInput): Promise<{ token: string; user: User }> {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (existingUser) {
      throw new HTTPException(400, {
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    if (input.classId) {
      const existingClass = await db.query.classes.findFirst({
        where: eq(classes.id, input.classId),
      });

      if (!existingClass) {
        throw new HTTPException(400, {
          message: 'Kelas yang dipilih tidak ditemukan.',
        });
      }
    }

    const hashedPassword = await hashPassword(input.password);

    const [createdUser] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        classId: input.role === 'student' ? input.classId || null : null,
      })
      .returning();

    const userWithClass = await db.query.users.findFirst({
      where: eq(users.id, createdUser.id),
      with: {
        enrolledClass: true,
      },
    });

    const userSafe: User = {
      id: userWithClass!.id,
      name: userWithClass!.name,
      email: userWithClass!.email,
      role: userWithClass!.role as User['role'],
      classId: userWithClass!.classId,
      createdAt: userWithClass!.createdAt,
      updatedAt: userWithClass!.updatedAt,
      enrolledClass: userWithClass!.enrolledClass
        ? {
            id: userWithClass!.enrolledClass.id,
            name: userWithClass!.enrolledClass.name,
            teacherId: userWithClass!.enrolledClass.teacherId,
            createdAt: userWithClass!.enrolledClass.createdAt,
            updatedAt: userWithClass!.enrolledClass.updatedAt,
          }
        : null,
    };

    const token = await signJwt({
      id: userSafe.id,
      name: userSafe.name,
      email: userSafe.email,
      role: userSafe.role,
      classId: userSafe.classId,
    });

    return { token, user: userSafe };
  }

  static async login(input: LoginInput): Promise<{ token: string; user: User }> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, input.email),
      with: {
        enrolledClass: true,
      },
    });

    if (!user) {
      throw new HTTPException(401, {
        message: 'Kombinasi email atau password tidak cocok.',
      });
    }

    const isPasswordValid = await verifyPassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new HTTPException(401, {
        message: 'Kombinasi email atau password tidak cocok.',
      });
    }

    const userSafe: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as User['role'],
      classId: user.classId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      enrolledClass: user.enrolledClass
        ? {
            id: user.enrolledClass.id,
            name: user.enrolledClass.name,
            teacherId: user.enrolledClass.teacherId,
            createdAt: user.enrolledClass.createdAt,
            updatedAt: user.enrolledClass.updatedAt,
          }
        : null,
    };

    const token = await signJwt({
      id: userSafe.id,
      name: userSafe.name,
      email: userSafe.email,
      role: userSafe.role,
      classId: userSafe.classId,
    });

    return { token, user: userSafe };
  }

  static async getProfile(userId: number): Promise<User> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        enrolledClass: true,
      },
    });

    if (!user) {
      throw new HTTPException(404, {
        message: 'Pengguna tidak ditemukan.',
      });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as User['role'],
      classId: user.classId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      enrolledClass: user.enrolledClass
        ? {
            id: user.enrolledClass.id,
            name: user.enrolledClass.name,
            teacherId: user.enrolledClass.teacherId,
            createdAt: user.enrolledClass.createdAt,
            updatedAt: user.enrolledClass.updatedAt,
          }
        : null,
    };
  }
}
