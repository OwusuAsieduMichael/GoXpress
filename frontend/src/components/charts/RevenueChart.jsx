import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const RevenueChart = ({ data }) => (
  <div className="panel chart-panel">
    <header className="panel-header">
      <h3>Revenue Trend</h3>
    </header>
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="#0e9f6e" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default RevenueChart;
