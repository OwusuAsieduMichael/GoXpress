import { useCallback, useEffect, useMemo, useState } from "react";
import ProductPerformanceChart from "../components/charts/ProductPerformanceChart.jsx";
import KpiCard from "../components/reports/KpiCard.jsx";
import ReportFilters from "../components/reports/ReportFilters.jsx";
import ReportTable from "../components/reports/ReportTable.jsx";
import SalesChart from "../components/reports/SalesChart.jsx";
import { productsService } from "../services/productsService.js";
import { reportsService } from "../services/reportsService.js";
import { currency, dateTime } from "../utils/format.js";
import { downloadCsv } from "../utils/exportCsv.js";

const defaultFilters = {
  preset: "monthly",
  from: "",
  to: "",
  productId: "",
  categoryId: ""
};

const buildFilterParams = (filters) => {
  const params = { preset: filters.preset };
  if (filters.productId) {
    params.productId = filters.productId;
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters.preset === "custom") {
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
  }
  return params;
};

const ReportsPage = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);

  const [productsPage, setProductsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);

  const [catalogProducts, setCatalogProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [salesReport, setSalesReport] = useState(null);
  const [productReport, setProductReport] = useState(null);
  const [transactionReport, setTransactionReport] = useState(null);
  const [inventoryReport, setInventoryReport] = useState(null);

  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [categoryRows, productRows] = await Promise.all([
          productsService.getCategories(),
          productsService.getAll({ includeInactive: false })
        ]);
        setCategories(categoryRows);
        setCatalogProducts(productRows);
      } catch (err) {
        setError(err.message);
      }
    };

    loadReferenceData();
  }, []);

  const fetchReports = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const baseParams = buildFilterParams(appliedFilters);

      const [salesData, productData, transactionData, inventoryData] = await Promise.all([
        reportsService.getSales(baseParams),
        reportsService.getProducts({ ...baseParams, page: productsPage, pageSize: 8 }),
        reportsService.getTransactions({ ...baseParams, page: transactionsPage, pageSize: 10 }),
        reportsService.getInventory({ ...baseParams, page: inventoryPage, pageSize: 10 })
      ]);

      setSalesReport(salesData);
      setProductReport(productData);
      setTransactionReport(transactionData);
      setInventoryReport(inventoryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  }, [appliedFilters, productsPage, transactionsPage, inventoryPage]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const applyFilters = () => {
    setFilterLoading(true);
    setProductsPage(1);
    setTransactionsPage(1);
    setInventoryPage(1);
    setAppliedFilters({ ...filters });
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
    setAppliedFilters({ ...defaultFilters });
    setProductsPage(1);
    setTransactionsPage(1);
    setInventoryPage(1);
    setFilterLoading(true);
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "preset" && value !== "custom") {
        next.from = "";
        next.to = "";
      }
      return next;
    });
  };

  const trendData = useMemo(
    () =>
      (salesReport?.trend ?? []).map((point) => ({
        label: new Date(point.day).toLocaleDateString("en-GH", {
          month: "short",
          day: "numeric"
        }),
        revenue: point.revenue,
        transactions: point.transactions
      })),
    [salesReport]
  );

  const productChartData = useMemo(
    () =>
      (productReport?.products ?? []).map((row) => ({
        name: row.name,
        revenue: row.revenue
      })),
    [productReport]
  );

  const salesSummary = salesReport?.summary ?? {};

  const exportCashierCsv = () => {
    const rows = (salesReport?.cashierPerformance ?? []).map((row) => [
      row.fullName,
      row.username,
      row.transactions,
      row.revenue
    ]);
    downloadCsv("cashier-performance.csv", ["Cashier", "Username", "Transactions", "Revenue"], rows);
  };

  const exportProductsCsv = () => {
    const rows = (productReport?.products ?? []).map((row) => [
      row.name,
      row.sku,
      row.categoryName || "",
      row.unitsSold,
      row.transactions,
      row.revenue
    ]);
    downloadCsv(
      "product-performance.csv",
      ["Product", "SKU", "Category", "Units Sold", "Transactions", "Revenue"],
      rows
    );
  };

  const exportTransactionsCsv = () => {
    const rows = (transactionReport?.transactions ?? []).map((row) => [
      row.id,
      row.customerName,
      row.cashierName,
      row.itemsPurchased,
      row.itemCount,
      row.totalAmount,
      row.paymentMethod,
      row.createdAt
    ]);
    downloadCsv(
      "transactions-report.csv",
      ["Sale ID", "Customer", "Cashier", "Items", "Quantity", "Total", "Payment", "Date"],
      rows
    );
  };

  const exportInventoryCsv = () => {
    const rows = (inventoryReport?.inventory ?? []).map((row) => [
      row.name,
      row.sku,
      row.categoryName || "",
      row.stockQuantity,
      row.lowStockThreshold,
      row.soldCount,
      row.price,
      row.isLowStock ? "Low" : "Healthy"
    ]);
    downloadCsv(
      "inventory-report.csv",
      ["Product", "SKU", "Category", "Stock", "Threshold", "Sold", "Price", "Status"],
      rows
    );
  };

  if (loading && !salesReport) {
    return <p>Loading reports...</p>;
  }

  return (
    <section className="stack">
      <header className="page-head">
        <h1>Reports</h1>
      </header>

      <ReportFilters
        filters={filters}
        onChange={onFilterChange}
        onApply={applyFilters}
        onReset={resetFilters}
        products={catalogProducts}
        categories={categories}
        loading={filterLoading || loading}
      />

      {error ? <p className="error-text">{error}</p> : null}

      <div className="stats-grid">
        <KpiCard
          label="Total Sales"
          value={salesSummary.totalTransactions ?? 0}
          hint="Transactions in selected period"
        />
        <KpiCard
          label="Total Revenue"
          value={currency(salesSummary.totalRevenue)}
          tone="success"
          hint="Gross revenue in selected period"
        />
        <KpiCard
          label="Average Ticket"
          value={currency(salesSummary.avgTicket)}
          hint={`Discount: ${currency(salesSummary.totalDiscount)}`}
        />
        <KpiCard
          label="Tax Collected"
          value={currency(salesSummary.totalTax)}
          tone="warning"
          hint="Total tax amount"
        />
      </div>

      <div className="charts-grid">
        <SalesChart title="Sales Report Trend" data={trendData} xKey="label" />
        <ProductPerformanceChart data={productChartData} />
      </div>

      <div className="reports-two-col">
        <ReportTable
          title="Cashier Performance"
          actions={
            <button type="button" className="ghost-btn" onClick={exportCashierCsv}>
              Export CSV
            </button>
          }
          columns={[
            { key: "fullName", label: "Cashier" },
            { key: "username", label: "Username" },
            { key: "transactions", label: "Transactions" },
            { key: "revenue", label: "Revenue", render: (row) => currency(row.revenue) }
          ]}
          rows={salesReport?.cashierPerformance ?? []}
          emptyText="No cashier activity for selected period."
        />

        <ReportTable
          title="Payment Breakdown"
          columns={[
            { key: "method", label: "Method" },
            { key: "transactions", label: "Transactions" },
            { key: "amount", label: "Amount", render: (row) => currency(row.amount) }
          ]}
          rows={salesReport?.paymentMethods ?? []}
          emptyText="No payments for selected period."
        />
      </div>

      <ReportTable
        title="Product Performance Report"
        actions={
          <button type="button" className="ghost-btn" onClick={exportProductsCsv}>
            Export CSV
          </button>
        }
        columns={[
          { key: "name", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "categoryName", label: "Category" },
          { key: "unitsSold", label: "Units Sold" },
          { key: "transactions", label: "Transactions" },
          { key: "revenue", label: "Revenue", render: (row) => currency(row.revenue) }
        ]}
        rows={productReport?.products ?? []}
        emptyText="No product performance data."
        pagination={productReport?.pagination}
        onPageChange={setProductsPage}
      />

      <ReportTable
        title="Transaction Report"
        actions={
          <button type="button" className="ghost-btn" onClick={exportTransactionsCsv}>
            Export CSV
          </button>
        }
        columns={[
          { key: "id", label: "Sale ID" },
          { key: "customerName", label: "Customer" },
          { key: "cashierName", label: "Cashier" },
          { key: "itemCount", label: "Items Qty" },
          { key: "totalAmount", label: "Total", render: (row) => currency(row.totalAmount) },
          { key: "paymentMethod", label: "Payment" },
          { key: "createdAt", label: "Date", render: (row) => dateTime(row.createdAt) }
        ]}
        rows={transactionReport?.transactions ?? []}
        emptyText="No transactions found for selected filters."
        pagination={transactionReport?.pagination}
        onPageChange={setTransactionsPage}
      />

      <ReportTable
        title="Inventory Report"
        actions={
          <button type="button" className="ghost-btn" onClick={exportInventoryCsv}>
            Export CSV
          </button>
        }
        columns={[
          { key: "name", label: "Product" },
          { key: "sku", label: "SKU" },
          { key: "categoryName", label: "Category" },
          { key: "stockQuantity", label: "Stock" },
          { key: "lowStockThreshold", label: "Threshold" },
          { key: "soldCount", label: "Sold Count" },
          { key: "price", label: "Price", render: (row) => currency(row.price) },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <span className={`status-chip ${row.isLowStock ? "danger" : "ok"}`}>
                {row.isLowStock ? "Low" : "Healthy"}
              </span>
            )
          }
        ]}
        rows={inventoryReport?.inventory ?? []}
        emptyText="No inventory rows for selected filters."
        pagination={inventoryReport?.pagination}
        onPageChange={setInventoryPage}
      />
    </section>
  );
};

export default ReportsPage;
