import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface DataTableColumn<T> {
  accessorKey?: string;
  id?: string;
  header?: string | ReactNode;
  cell?: (props: { row: { original: T } }) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ columns, data, isLoading, emptyMessage }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {emptyMessage || 'No data available.'}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={column.id || column.accessorKey || index}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => (
              <TableCell key={column.id || column.accessorKey || colIndex}>
                {column.cell 
                  ? column.cell({ row: { original: row } })
                  : column.accessorKey 
                    ? String((row as Record<string, unknown>)[column.accessorKey] ?? '')
                    : null
                }
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
