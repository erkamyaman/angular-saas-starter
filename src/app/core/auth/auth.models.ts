export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  permissions?: Record<string, boolean>;
  [key: string]: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  [key: string]: unknown;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  user: User;
}
