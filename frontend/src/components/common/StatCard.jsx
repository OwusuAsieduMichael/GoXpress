const StatCard = ({ title, value, tone = "default" }) => (
  <article className={`stat-card ${tone}`}>
    <p className="stat-title">{title}</p>
    <h3>{value}</h3>
  </article>
);

export default StatCard;
