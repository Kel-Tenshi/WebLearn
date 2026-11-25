import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  filteredTotal: number;
  from: number;
  to: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  /** Компактный вид для узких карточек: только диапазон и стрелки. */
  compact?: boolean;
}

function pageNumbers(current: number, count: number): Array<number | 'gap'> {
  if (count <= 7) {
    return Array.from({ length: count }, (_, index) => index + 1);
  }

  const wanted = new Set([1, count, current, current - 1, current + 1]);
  const pages = [...wanted].filter((page) => page >= 1 && page <= count).sort((a, b) => a - b);

  const result: Array<number | 'gap'> = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      result.push('gap');
    }
    result.push(page);
  });
  return result;
}

export const Pagination: React.FC<Props> = ({
  page,
  pageCount,
  pageSize,
  total,
  filteredTotal,
  from,
  to,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  compact = false,
}) => {
  if (total === 0) return null;

  const hasPages = pageCount > 1;

  return (
    <div className={`list-pagination${compact ? ' compact' : ''}`}>
      <span className="list-range">
        {filteredTotal === 0
          ? 'Ничего не найдено'
          : `${from}–${to} из ${filteredTotal}${
              filteredTotal !== total ? ` (всего ${total})` : ''
            }`}
      </span>

      {hasPages && (
        <div className="pager">
          <button
            type="button"
            className="pager-step"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Предыдущая страница"
            title="Предыдущая страница"
          >
            <ChevronLeft size={15} aria-hidden="true" />
          </button>

          {!compact &&
            pageNumbers(page, pageCount).map((item, index) =>
              item === 'gap' ? (
                <span key={`gap-${index}`} className="pager-gap" aria-hidden="true">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  className={`pager-page${item === page ? ' active' : ''}`}
                  onClick={() => onPageChange(item)}
                  aria-label={`Страница ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                >
                  {item}
                </button>
              )
            )}

          <button
            type="button"
            className="pager-step"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Следующая страница"
            title="Следующая страница"
          >
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      )}

      {!compact && (
        <label className="page-size">
          <span>На странице</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Записей на странице"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};
