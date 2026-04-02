import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const SalesChart = ({
  title = "Sales Trend",
  data = [],
  xKey = "label",
  lines = [
    { key: "revenue", name: "Revenue", color: "#ff8d2f" },
    { key: "transactions", name: "Transactions", color: "#1f2a44" }
  ],
  height = 280
}) => (
  <article className="panel chart-panel">
    <header className="panel-header">
      <h3>{title}</h3>
    </header>
    {data.length === 0 ? (
      <p className="muted-text">No chart data for selected filters.</p>
    ) : (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )}
  </article>
);

export default SalesChart;
