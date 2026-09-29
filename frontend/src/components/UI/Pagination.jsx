import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
      <span>Showing <span className="font-medium text-slate-700">{start}-{end}</span> of <span className="font-medium text-slate-700">{total}</span></span>
      <div className="flex items-center gap-1">
        <button
          className="btn-ghost px-2 py-1.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 py-1 rounded-md bg-primary-50 text-primary-700 font-medium">{page} / {pages}</span>
        <button
          className="btn-ghost px-2 py-1.5"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
