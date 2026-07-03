export type UserRole = 'ADMIN' | 'DRIVER' | 'CITIZEN';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type SessionState = {
  user: AuthUser | null;
  expires: string;
};
