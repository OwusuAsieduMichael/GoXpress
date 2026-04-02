import { api } from "./api.js";

export const salesService = {
  create: async (payload) => {
    const { data } = await api.post("/sales", payload);
    return data.sale;
  },
  getAll: async (params = {}) => {
    const { data } = await api.get("/sales", { params });
    return data.sales;
  }
};
