import { ReactNode } from 'react';

export interface TableColumn<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage: string;
  loadingRowCount?: number;
  onRowClick?: (item: T) => void;
  getRowKey: (item: T) => string | number;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage,
  loadingRowCount = 10,
  onRowClick,
  getRowKey,
}: DataTableProps<T>) {
  const renderCell = (column: TableColumn<T>, item: T) => {
    if (column.render) {
      return column.render(item);
    }
    if (column.accessor) {
      const value = item[column.accessor];
      return String(value ?? '-');
    }
    return '-';
  };

  return (
    <div className="relative overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className={column.className}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>*:nth-child(odd)]:bg-primary-50">
          {isLoading ? (
            Array.from({ length: loadingRowCount }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {columns.map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                className="h-32 text-center text-gray-500"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={getRowKey(item)}
                className={onRowClick ? 'cursor-pointer hover:bg-base-200' : ''}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.className}>
                    {renderCell(column, item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
