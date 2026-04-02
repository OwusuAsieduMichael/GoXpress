import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const ProductPerformanceChart = ({ data = [], title = "Top Products" }) => (
  <div className="panel chart-panel">
    <header className="panel-header">
      <h3>{title}</h3>
    </header>
    {data.length === 0 ? (
      <p className="muted-text">No product chart data for selected filters.</p>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )}
  </div>
);

export default ProductPerformanceChart;
