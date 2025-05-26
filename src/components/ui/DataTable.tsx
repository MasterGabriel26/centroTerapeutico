// src/components/ui/DataTable.tsx
import React from "react";

export interface Column<T> {  // 👈 Agrega el "export"
  header: string;
  accessorKey?: keyof T;
  id?: string;
  cell?: (props: any) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
}

function DataTable<T extends { id?: string | number }>({ columns, data, loading, emptyText = "Sin registros" }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600 font-semibold">
            {columns.map((col, idx) => (
              <th key={String(col.id || col.accessorKey || idx)} className="px-4 py-2">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                Cargando...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="border-t hover:bg-gray-50">
                {columns.map((col, colIdx) => (
                  <td key={String(col.id || col.accessorKey || colIdx)} className="px-4 py-2">
                    {col.cell
                      ? col.cell({ row: { original: row }, cell: { getValue: () => (col.accessorKey ? row[col.accessorKey] : undefined) } })
                      : col.accessorKey
                      ? (row as any)[col.accessorKey]
                      : null}
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

export default DataTable;
