export interface User {
  id: string;
  fullName: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  timeFormat: '12-hour' | '24-hour';
  timeZoneId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdatePreferencesRequest {
  theme: 'light' | 'dark' | 'system';
  dateFormat: string;
  timeFormat: '12-hour' | '24-hour';
  timeZoneId: string;
}
