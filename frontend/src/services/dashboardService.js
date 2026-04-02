import { api } from "./api.js";

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

const shouldFallback = (error) =>
  error?.status === 404 ||
  error?.status === 403 ||
  error?.type === "NOT_FOUND" ||
  error?.type === "FORBIDDEN" ||
  error?.response?.status === 404 ||
  error?.response?.status === 403;

const startOfTodayIso = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
};

const daysFromParams = (params = {}) => {
  const preset = String(params.preset || "").toLowerCase();
  if (preset === "today") return 1;
  if (preset === "weekly") return 7;
  if (preset === "monthly") return 30;

  if (params.from && params.to) {
    const from = new Date(params.from);
    const to = new Date(params.to);
    if (!Number.isNaN(from.getTime()) && !Number.isNaN(to.getTime())) {
      const diffMs = Math.max(24 * 60 * 60 * 1000, to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      return Math.max(1, Math.min(90, diffDays));
    }
  }

  return 7;
};

const groupSalesByDay = (sales = []) => {
  const map = new Map();

  sales.forEach((sale) => {
    const key = new Date(sale.createdAt).toISOString().slice(0, 10);
    const existing = map.get(key) || { revenue: 0, transactions: 0 };
    existing.revenue += Number(sale.totalAmount || 0);
    existing.transactions += 1;
    map.set(key, existing);
  });

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, value]) => ({
      day,
      revenue: Number(value.revenue || 0),
      transactions: Number(value.transactions || 0)
    }));
};

export const dashboardService = {
  getSummary: async (params = {}) => {
    try {
      const { data } = await api.get("/dashboard/summary", { params: cleanParams(params) });
      return data;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }

      const [salesAllRes, salesTodayRes, lowStockProductsRes] = await Promise.all([
        api.get("/sales"),
        api.get("/sales", { params: { dateFrom: startOfTodayIso() } }),
        api.get("/products", { params: { lowStock: true, includeInactive: false } })
      ]);

      const salesAllRows = salesAllRes.data?.sales || [];
      const salesRows = salesTodayRes.data?.sales || [];
      const lowStockRows = lowStockProductsRes.data?.products || [];
      const totalRevenue = salesAllRows.reduce(
        (sum, row) => sum + Number(row.totalAmount || 0),
        0
      );

      return {
        kpis: {
          totalSalesToday: salesRows.reduce((sum, row) => sum + Number(row.totalAmount || 0), 0),
          totalRevenue,
          transactionsToday: salesRows.length,
          totalTransactions: salesAllRows.length,
          lowStockCount: lowStockRows.length
        },
        lowStockProducts: lowStockRows
          .slice(0, 6)
          .map((row) => ({
            id: row.id,
            name: row.name,
            sku: row.sku,
            stockQuantity: row.stockQuantity,
            lowStockThreshold: row.lowStockThreshold
          })),
        recentTransactions: salesRows.slice(0, 8).map((row) => ({
          id: row.id,
          totalAmount: Number(row.totalAmount || 0),
          createdAt: row.createdAt,
          paymentMethod: row.paymentMethod || "unknown"
        }))
      };
    }
  },
  getSalesTrend: async (params = {}) => {
    try {
      const { data } = await api.get("/dashboard/sales-trend", { params: cleanParams(params) });
      return data;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }

      const days = daysFromParams(params);
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      from.setDate(from.getDate() - (days - 1));

      const { data } = await api.get("/sales", {
        params: {
          dateFrom: from.toISOString()
        }
      });

      const points = groupSalesByDay(data.sales || []);

      return {
        range: { preset: params.preset || "weekly", from: null, to: null },
        points
      };
    }
  },
  getTopProducts: async (params = {}) => {
    try {
      const { data } = await api.get("/dashboard/top-products", { params: cleanParams(params) });
      return data;
    } catch (error) {
      if (!shouldFallback(error)) {
        throw error;
      }

      const limit = Number(params.limit || 5);
      const { data } = await api.get("/products", {
        params: { includeInactive: false }
      });

      const products = (data.products || [])
        .slice()
        .sort((a, b) => Number(b.soldCount || 0) - Number(a.soldCount || 0))
        .slice(0, Math.max(1, Math.min(limit, 20)))
        .map((row) => ({
          id: row.id,
          name: row.name,
          sku: row.sku,
          unitsSold: Number(row.soldCount || 0),
          revenue: Number(row.soldCount || 0) * Number(row.price || 0)
        }));

      return {
        range: { preset: params.preset || "weekly", from: null, to: null },
        products
      };
    }
  }
};
