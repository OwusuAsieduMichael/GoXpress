const presetOptions = [
  { value: "today", label: "Today" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "custom", label: "Custom" }
];

const ReportFilters = ({
  filters,
  onChange,
  onApply,
  onReset,
  categories = [],
  products = [],
  loading = false
}) => (
  <article className="panel report-filters">
    <header className="panel-header">
      <h2>Filters</h2>
      <div className="report-filter-actions">
        <button type="button" className="ghost-btn" onClick={onReset} disabled={loading}>
          Reset
        </button>
        <button type="button" className="primary-btn" onClick={onApply} disabled={loading}>
          {loading ? "Applying..." : "Apply Filters"}
        </button>
      </div>
    </header>

    <div className="grid report-filter-grid">
      <label>
        Date Range
        <select
          value={filters.preset}
          onChange={(event) => onChange("preset", event.target.value)}
        >
          {presetOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Category
        <select
          value={filters.categoryId}
          onChange={(event) => onChange("categoryId", event.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        Product
        <select
          value={filters.productId}
          onChange={(event) => onChange("productId", event.target.value)}
        >
          <option value="">All Products</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </label>

      <label className={filters.preset === "custom" ? "" : "disabled-field"}>
        From
        <input
          type="date"
          value={filters.from}
          onChange={(event) => onChange("from", event.target.value)}
          disabled={filters.preset !== "custom"}
        />
      </label>

      <label className={filters.preset === "custom" ? "" : "disabled-field"}>
        To
        <input
          type="date"
          value={filters.to}
          onChange={(event) => onChange("to", event.target.value)}
          disabled={filters.preset !== "custom"}
        />
      </label>
    </div>
  </article>
);

export default ReportFilters;
