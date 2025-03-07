export type UserCreateInput = {
  id?: string;
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  passWord: string;
  age?: number | null;
  createdAt?: Date | string;
  twoFactorEnabled?: boolean;
  lastLoggedIn: Date | string;
};
