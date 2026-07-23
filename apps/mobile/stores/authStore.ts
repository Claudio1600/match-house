import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { User } from "../types";

const ACCESS_TOKEN_KEY = "mh_access_token";
const REFRESH_TOKEN_KEY = "mh_refresh_token";
const USER_KEY = "mh_user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (
    user: User,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user, accessToken, isLoading: false });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    set({ user: null, accessToken: null, isLoading: false });
  },

  loadAuth: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, accessToken: token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: (user) => {
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    set({ user });
  },
}));
