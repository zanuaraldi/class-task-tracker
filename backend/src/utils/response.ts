import type { ApiResponse } from '@class-task-tracker/shared';

export const successResponse = <T>(
  data?: T,
  message = 'Success'
): ApiResponse<T> => ({
  success: true,
  message,
  data,
});

export const errorResponse = (
  message: string,
  errors?: Record<string, string[]> | any
): ApiResponse => ({
  success: false,
  message,
  errors,
});
