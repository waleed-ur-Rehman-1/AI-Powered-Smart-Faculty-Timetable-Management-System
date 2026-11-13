import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import client from "../api/client";

type User = {
  id: string;
  email: string;
  role: string;
  faculty?: { id: string; name: string } | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    const response = await client.post("/auth/login", { email, password });
    const { token, user } = response.data;
    await SecureStore.setItemAsync("authToken", token);
    set({ user, token });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("authToken");
    set({ user: null, token: null });
  },

  loadSession: async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (!token) {
        set({ loading: false });
        return;
      }
      const response = await client.get("/auth/me");
      set({ user: response.data, token, loading: false });
    } catch {
      await SecureStore.deleteItemAsync("authToken");
      set({ user: null, token: null, loading: false });
    }
  },
}));
