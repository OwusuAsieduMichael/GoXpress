import { api } from "./api.js";

export const customersService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/customers", { params });
    return data.customers;
  },
  create: async (payload) => {
    const { data } = await api.post("/customers", payload);
    return data.customer;
  },
  getHistory: async (id) => {
    const { data } = await api.get(`/customers/${id}/history`);
    return data;
  }
};
