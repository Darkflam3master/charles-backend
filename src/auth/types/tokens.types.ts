export type Tokens = {
  access_token: string;
  refresh_token: string;
};

export type TokenContent = {
  id: string;
  userName: string;
  email: string;
  twoFactorEnabled: boolean;
  lastLogIn: string;
};
