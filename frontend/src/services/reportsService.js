import { api } from "./api.js";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

export const reportsService = {
  getSales: async (params = {}) => {
    const { data } = await api.get("/reports/sales", { params: cleanParams(params) });
    return data;
  },
  getProducts: async (params = {}) => {
    const { data } = await api.get("/reports/products", { params: cleanParams(params) });
    return data;
  },
  getTransactions: async (params = {}) => {
    const { data } = await api.get("/reports/transactions", { params: cleanParams(params) });
    return data;
  },
  getInventory: async (params = {}) => {
    const { data } = await api.get("/reports/inventory", { params: cleanParams(params) });
    return data;
  },

  // Backward compatibility helpers used by older screens.
  getSummary: async (params = {}) => {
    const { data } = await api.get("/reports/summary", { params: cleanParams(params) });
    return data;
  },
  getDailySales: async (params = {}) => {
    const { data } = await api.get("/reports/daily-sales", { params: cleanParams(params) });
    return data.days;
  },
  getProductPerformance: async (params = {}) => {
    const { data } = await api.get("/reports/product-performance", {
      params: cleanParams(params)
    });
    return data.products;
  }
};
