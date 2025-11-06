import type { ReactNode } from 'react';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeaderCell({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
}

export function TableRow({
  children,
  className = '',
  onClick,
}: TableRowProps) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer' : ''} hover:bg-gray-50 ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  className = '',
}: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>
  );
}

