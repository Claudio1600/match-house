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
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  message: string;
  user: Pick<User, "id" | "email" | "userType" | "isVerified">;
}

interface VerifyEmailPayload {
  email: string;
  otp: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data } = await api.post<RegisterResponse>("/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  verifyEmail: async (payload: VerifyEmailPayload): Promise<void> => {
    await api.post("/auth/verify-email", { email: payload.email, otp: payload.otp });
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
