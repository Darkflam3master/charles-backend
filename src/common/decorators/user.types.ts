export type UserRequest = {
  id: string;
  refreshToken?: string; // Add other expected user properties
  [key: string]: unknown; // Allow dynamic properties
};
