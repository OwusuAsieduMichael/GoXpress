import { api } from "./api.js";

export const authService = {
  health: async () => {
    const { data } = await api.get("/health");
    return data;
  },
  signup: async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  logout: async () => {
    const { data } = await api.post("/auth/logout");
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};
