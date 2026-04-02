import { api } from "./api.js";

export const inventoryService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/inventory", { params });
    return data.inventory;
  },
  adjust: async (payload) => {
    const { data } = await api.post("/inventory/adjust", payload);
    return data.adjustment;
  },
  getAdjustments: async () => {
    const { data } = await api.get("/inventory/adjustments");
    return data.adjustments;
  }
};
