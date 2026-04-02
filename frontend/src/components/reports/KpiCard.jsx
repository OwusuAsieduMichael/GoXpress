const KpiCard = ({ label, value, hint = "", tone = "default" }) => (
  <article className={`stat-card ${tone}`}>
    <p className="stat-title">{label}</p>
    <h3>{value}</h3>
    {hint ? <p className="kpi-hint">{hint}</p> : null}
  </article>
);

export default KpiCard;
