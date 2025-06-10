import React from "react";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  id?: string;
  cell?: (props: any) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string | React.ReactNode;
  onRowClick?: (row: T) => void;
  className?: string;
}

function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading,
  emptyText = "No hay registros disponibles",
  onRowClick,
  className = "",
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | string | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      // @ts-ignore
      const aValue = a[sortConfig.key as keyof T];
      // @ts-ignore
      const bValue = b[sortConfig.key as keyof T];

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === "asc"
        ? aValue < bValue
          ? -1
          : 1
        : aValue > bValue
        ? -1
        : 1;
    });
  }, [data, sortConfig]);

  const requestSort = (key: keyof T | string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="overflow-x-auto -mx-px">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, idx) => {
                const isSorted = sortConfig.key === (col.accessorKey || col.id);
                const canSort = col.sortable !== false && (col.accessorKey || col.id);
                
                return (
                  <th
                    key={String(col.id || col.accessorKey || idx)}
                    scope="col"
                    className={`
                      px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                      ${canSort ? "cursor-pointer hover:bg-gray-100 select-none" : ""}
                      ${col.align === "center" ? "text-center" : ""}
                      ${col.align === "right" ? "text-right" : ""}
                    `}
                    onClick={() => canSort && requestSort(col.accessorKey || col.id || "")}
                  >
                    <div className={`flex items-center ${col.align === "center" ? "justify-center" : col.align === "right" ? "justify-end" : ""}`}>
                      <span className="whitespace-nowrap">{col.header}</span>
                      {canSort && isSorted && (
                        <span className="ml-1 flex-shrink-0">
                          {sortConfig.direction === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center">
                  <div className="flex justify-center items-center space-x-2 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className="text-gray-400">
                    {typeof emptyText === "string" ? (
                      <p className="text-sm sm:text-base">{emptyText}</p>
                    ) : (
                      emptyText
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className={`
                    transition-colors duration-100
                    ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
                    ${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                  `}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={String(col.id || col.accessorKey || colIdx)}
                      className={`
                        px-3 sm:px-4 py-2 sm:py-3
                        ${col.align === "center" ? "text-center" : ""}
                        ${col.align === "right" ? "text-right" : ""}
                        text-xs sm:text-sm text-gray-800
                      `}
                    >
                      <div className="truncate max-w-xs">
                        {col.cell
                          ? col.cell({
                              row: { original: row },
                              cell: {
                                getValue: () =>
                                  col.accessorKey ? row[col.accessorKey] : undefined,
                              },
                            })
                          : col.accessorKey
                          ? (row as any)[col.accessorKey]
                          : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;