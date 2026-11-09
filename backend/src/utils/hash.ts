export const hashPassword = async (password: string): Promise<string> => {
  return Bun.password.hash(password, {
    algorithm: 'bcrypt',
    cost: 10,
  });
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  try {
    return await Bun.password.verify(password, hash);
  } catch {
    return false;
  }
};
