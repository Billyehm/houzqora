'use client';

/*
 * Pagination: Previous, page numbers, Next, and a page status line.
 * Only rendered when there is more than one page.
 */
export default function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="btn-press rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-velvet disabled:opacity-50"
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          className={`btn-press rounded-full px-4 py-2 text-sm font-bold ${
            n === page ? 'bg-velvet text-white' : 'border border-line bg-white text-velvet'
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        className="btn-press rounded-full border border-line bg-white px-4 py-2 text-sm font-bold text-velvet disabled:opacity-50"
      >
        Next
      </button>
      <span className="text-sm font-extrabold text-velvet">
        Page {page} of {totalPages}
      </span>
    </div>
  );
}
