import { create } from "zustand";

import api from "../services/api";

const useAuthStore = create((set) => ({
  user: null,

  loading: false,

  initialized: false,

  register: async (userData) => {
    set({
      loading: true,
    });

    try {
      const response = await api.post(
        "/auth/register",
        userData
      );

      set({
        user: response.data.user,
        loading: false,
        initialized: true,
      });

      return {
        success: true,
        user: response.data.user,
        message:
          response.data.message ||
          "Registration successful.",
      };
    } catch (error) {
      set({
        loading: false,
        initialized: true,
      });

      return {
        success: false,

        message:
          error.response?.data?.message ||
          "Registration failed.",

        errors:
          error.response?.data?.errors || [],
      };
    }
  },

  login: async (credentials) => {
    set({
      loading: true,
    });

    try {
      const response = await api.post(
        "/auth/login",
        credentials
      );

      set({
        user: response.data.user,
        loading: false,
        initialized: true,
      });

      return {
        success: true,
        user: response.data.user,
        message:
          response.data.message ||
          "Login successful.",
      };
    } catch (error) {
      set({
        user: null,
        loading: false,
        initialized: true,
      });

      return {
        success: false,

        message:
          error.response?.data?.message ||
          "Login failed.",
      };
    }
  },

  logout: async () => {
    set({
      loading: true,
    });

    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error(
        "Logout error:",
        error.response?.data?.message ||
          error.message
      );
    } finally {
      set({
        user: null,
        loading: false,
        initialized: true,
      });
    }
  },

  fetchCurrentUser: async () => {
    try {
      set({
        loading: true,
      });

      const response = await api.get(
        "/auth/me"
      );

      set({
        user: response.data.user,
        loading: false,
        initialized: true,
      });

      return {
        success: true,
        user: response.data.user,
      };
    } catch (error) {
      set({
        user: null,
        loading: false,
        initialized: true,
      });

      return {
        success: false,
        user: null,
      };
    }
  },
}));

export default useAuthStore;