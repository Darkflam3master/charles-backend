export type UserCreateInput = {
  id?: string;
  userName: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  passWord: string;
  age?: number | null;
  createdAt?: Date | string;
  twoFactorEnabled?: boolean;
  lastLoggedIn?: Date | string | null;
};
