import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  total,
  isLoading,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-4">
      <div className="flex flex-1 items-center gap-2 text-sm text-gray-600">
        {isLoading ? (
          <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />
        ) : (
          <span className="font-medium">
            {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, total)} / ${total}`}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="btn btn-primary btn-sm"
          disabled={isLoading || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <MdChevronLeft size={24} />
        </button>
        <button
          className="btn btn-primary btn-sm"
          disabled={isLoading || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <MdChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
