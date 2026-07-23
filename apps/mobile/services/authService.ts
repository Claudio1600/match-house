import api from "./api";
import { User, UserType, AuthTokens } from "../types";

interface RegisterPayload {
  email: string;
  password: string;
  userType: UserType;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

interface VerifyEmailPayload {
  email: string;
  code: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<void> => {
    await api.post("/auth/verify-email", payload);
  },

  resendVerification: async (email: string): Promise<void> => {
    await api.post("/auth/resend-verification", { email });
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
