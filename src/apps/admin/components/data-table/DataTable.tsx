// DataTable Component
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Download } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  toolbar?: ReactNode;
  onExport?: () => void;
  rowKey?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  searchable = true,
  searchPlaceholder = '搜索...',
  searchValue = '',
  onSearchChange,
  pagination,
  onRowClick,
  emptyTitle = '暂无数据',
  emptyDescription,
  emptyIcon,
  toolbar,
  onExport,
  rowKey,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const search = searchValue !== undefined ? searchValue : internalSearch;
  const handleSearch = (v: string) => {
    if (onSearchChange) onSearchChange(v);
    else setInternalSearch(v);
  };

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {(searchable || toolbar || onExport) && (
        <div className="flex items-center gap-3 flex-wrap">
          {searchable && (
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 bg-[var(--admin-card)] border border-[var(--admin-border)] rounded-lg text-sm text-white placeholder:text-zinc-600 outline-none focus:border-emerald-500/40 transition-colors"
              />
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {toolbar}
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--admin-card)] border border-[var(--admin-border)] text-zinc-300 hover:text-white hover:border-emerald-500/30 transition-colors text-xs font-medium"
              >
                <Download size={14} />
                导出
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-[var(--admin-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/[0.02] border-b border-[var(--admin-border)]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      'px-4 py-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest',
                      col.align === 'right' && 'text-right',
                      col.align === 'center' && 'text-center',
                      (!col.align || col.align === 'left') && 'text-left'
                    )}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--admin-border)]/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="admin-skeleton h-4 w-full max-w-[200px]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-0">
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      description={emptyDescription}
                    />
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={rowKey ? rowKey(row) : index}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      'border-b border-[var(--admin-border)]/40 transition-colors',
                      onRowClick && 'cursor-pointer hover:bg-white/[0.02]'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm text-zinc-300',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render ? col.render(row, index) : (row as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
          <div className="text-xs text-zinc-500">
            显示 {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} 条
            ，共 <span className="text-white font-medium">{pagination.total.toLocaleString()}</span> 条
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(1)}
              className="p-1.5 rounded-md bg-[var(--admin-card)] border border-[var(--admin-border)] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-md bg-[var(--admin-card)] border border-[var(--admin-border)] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="px-3 py-1.5 text-xs text-white">
              第 {pagination.page} / {totalPages} 页
            </div>
            <button
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-md bg-[var(--admin-card)] border border-[var(--admin-border)] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
            <button
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(totalPages)}
              className="p-1.5 rounded-md bg-[var(--admin-card)] border border-[var(--admin-border)] text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}