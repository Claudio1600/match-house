import { useAuthStore } from "../stores/authStore";
import { authService } from "../services/authService";
import { router } from "expo-router";
import { UserType } from "../types";

export function useAuth() {
  const { user, accessToken, isLoading, setAuth, clearAuth, loadAuth } =
    useAuthStore();

  const login = async (email: string, password: string) => {
    const { user: u, accessToken, refreshToken } = await authService.login({ email, password });
    await setAuth(u, accessToken, refreshToken);
    if (!u.isVerified) {
      router.replace({ pathname: "/(auth)/verify-email", params: { email } });
    } else {
      router.replace("/(tabs)/explore");
    }
  };

  const register = async (
    email: string,
    password: string,
    userType: UserType
  ) => {
    await authService.register({ email, password, userType });
    router.replace({ pathname: "/(auth)/verify-email", params: { email } });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore server errors on logout
    }
    await clearAuth();
    router.replace("/(auth)/welcome");
  };

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    loadAuth,
    login,
    register,
    logout,
  };
}
