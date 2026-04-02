import { api } from "./api.js";

export const productsService = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/products", { params });
    return data.products;
  },
  create: async (payload) => {
    const { data } = await api.post("/products", payload);
    return data.product;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/products/${id}`, payload);
    return data.product;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
  getCategories: async () => {
    const { data } = await api.get("/products/categories/list");
    return data.categories;
  },
  createCategory: async (payload) => {
    const { data } = await api.post("/products/categories", payload);
    return data.category;
  },
  updateCategory: async (id, payload) => {
    const { data } = await api.put(`/products/categories/${id}`, payload);
    return data.category;
  },
  deleteCategory: async (id) => {
    const { data } = await api.delete(`/products/categories/${id}`);
    return data;
  }
};
