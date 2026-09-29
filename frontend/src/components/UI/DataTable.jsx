import Pagination from './Pagination';
import Spinner from './Spinner';

// Generic table: columns = [{ header, accessor: (row) => value | node }]
const DataTable = ({ columns, rows, loading, pagination, onPageChange, emptyMessage = 'No records found.' }) => {
  return (
    <div className="card overflow-hidden">
      <div className="table-wrap border-0">
        <table className="dt">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.header}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loading && rows.map((row, idx) => (
              <tr key={row._id || idx}>
                {columns.map((col) => (
                  <td key={col.header}>{col.accessor(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <Spinner />}
        {!loading && rows.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">{emptyMessage}</div>
        )}
      </div>
      {pagination && !loading && rows.length > 0 && (
        <Pagination {...pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default DataTable;
