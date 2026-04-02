import { useCallback, useEffect, useMemo, useState } from "react";
import KpiCard from "../components/reports/KpiCard.jsx";
import SalesChart from "../components/reports/SalesChart.jsx";
import ReportTable from "../components/reports/ReportTable.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { currency, dateTime } from "../utils/format.js";

const formatDayLabel = (value) =>
  new Date(value).toLocaleDateString("en-GH", {
    month: "short",
    day: "numeric"
  });

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [trendPoints, setTrendPoints] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboard = useCallback(async (background = false) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const [summaryData, trendData, topProductsData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getSalesTrend({ preset: "weekly" }),
        dashboardService.getTopProducts({ preset: "weekly", limit: 5 })
      ]);

      setSummary(summaryData);
      setTrendPoints(trendData.points ?? []);
      setTopProducts(topProductsData.products ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    const interval = window.setInterval(() => {
      fetchDashboard(true);
    }, 60000);

    return () => window.clearInterval(interval);
  }, [fetchDashboard]);

  const chartData = useMemo(
    () =>
      trendPoints.map((point) => ({
        label: formatDayLabel(point.day),
        revenue: point.revenue,
        transactions: point.transactions
      })),
    [trendPoints]
  );

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  const kpis = summary?.kpis ?? {};

  return (
    <section className="stack">
      <header className="page-head">
        <h1>Dashboard</h1>
        <div className="actions-row">
          {lastUpdated ? (
            <span className="muted-text">Last updated: {dateTime(lastUpdated.toISOString())}</span>
          ) : null}
          <button
            type="button"
            className="ghost-btn"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <KpiCard
          label="Total Sales Today"
          value={currency(kpis.totalSalesToday)}
          hint="Revenue closed today"
          tone="success"
        />
        <KpiCard
          label="Total Revenue"
          value={currency(kpis.totalRevenue)}
          hint="All-time gross revenue"
          tone="warning"
        />
        <KpiCard
          label="Number of Transactions"
          value={kpis.totalTransactions ?? 0}
          hint={`Today: ${kpis.transactionsToday ?? 0}`}
        />
        <KpiCard
          label="Low Stock Products"
          value={kpis.lowStockCount ?? 0}
          hint="Needs restock attention"
          tone="danger"
        />
      </div>

      <div className="charts-grid">
        <SalesChart title="Sales Overview (Last 7 Days)" data={chartData} xKey="label" />

        <ReportTable
          title="Top Selling Products"
          columns={[
            { key: "name", label: "Product" },
            { key: "unitsSold", label: "Units Sold" },
            { key: "revenue", label: "Revenue", render: (row) => currency(row.revenue) }
          ]}
          rows={topProducts}
          emptyText="No product sales in this period."
        />
      </div>

      <div className="reports-two-col">
        <ReportTable
          title="Low Stock Alert"
          columns={[
            { key: "name", label: "Product" },
            { key: "sku", label: "SKU" },
            { key: "stockQuantity", label: "Stock" },
            { key: "lowStockThreshold", label: "Threshold" },
            {
              key: "status",
              label: "Status",
              render: () => <span className="status-chip danger">Low</span>
            }
          ]}
          rows={summary?.lowStockProducts ?? []}
          emptyText="No low stock products right now."
        />

        <ReportTable
          title="Recent Transactions"
          columns={[
            { key: "id", label: "Transaction ID" },
            { key: "totalAmount", label: "Amount", render: (row) => currency(row.totalAmount) },
            { key: "paymentMethod", label: "Payment" },
            { key: "createdAt", label: "Date/Time", render: (row) => dateTime(row.createdAt) }
          ]}
          rows={summary?.recentTransactions ?? []}
          emptyText="No recent transactions yet."
        />
      </div>
    </section>
  );
};

export default DashboardPage;
