const ReportTable = ({
  title,
  columns = [],
  rows = [],
  emptyText = "No data available.",
  actions = null,
  pagination = null,
  onPageChange = () => {},
  rowKey = "id"
}) => (
  <article className="panel">
    <header className="panel-header">
      <h2>{title}</h2>
      {actions}
    </header>

    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="empty-cell">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={row[rowKey] ?? `${rowKey}-${index}`}>
                {columns.map((column) => (
                  <td key={`${column.key}-${row[rowKey] ?? index}`}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {pagination ? (
      <footer className="pagination-row">
        <p className="muted-text">
          Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} records)
        </p>
        <div className="actions-row">
          <button
            type="button"
            className="ghost-btn"
            onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <button
            type="button"
            className="ghost-btn"
            onClick={() =>
              onPageChange(Math.min(pagination.totalPages, pagination.page + 1))
            }
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </footer>
    ) : null}
  </article>
);

export default ReportTable;
