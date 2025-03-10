export type UserCreateInput = {
  id?: string;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  password: string;
  age?: number | null;
  createdAt?: Date | string;
  twoFactorEnabled?: boolean;
  lastLoggedIn?: Date | string | null;
  hashedRt?: string;
};
