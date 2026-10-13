
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/lib/store';
import { OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Search,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingCart,
  X,
} from 'lucide-react';

type SortField = 'orderNumber' | 'orderDate' | 'total';

export default function OrderListPage() {
  const { orders } = useStore();
  const searchParams = useSearchParams();
  const isNewlyCreated = searchParams?.get('created') === 'true';

  const [showCreatedBanner, setShowCreatedBanner] = useState(isNewlyCreated);

  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('orderNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const tabs: (OrderStatus | 'All')[] = [
    'All',
    'Unpaid',
    'Partial',
    'Paid',
    'Overdue',
    'Draft',
    'Cancelled',
  ];

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        return activeTab === 'All' || order.status === activeTab;
      })
      .filter((order) => {
        if (!query) return true;

        return (
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.paymentType.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        let comparison = 0;

        if (sortField === 'total') {
          comparison = a.total - b.total;
        } else if (sortField === 'orderDate') {
          comparison =
            new Date(a.orderDate).getTime() -
            new Date(b.orderDate).getTime();
        } else {
          comparison = a.orderNumber.localeCompare(b.orderNumber, undefined, {
            numeric: true,
          });
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [orders, activeTab, search, sortField, sortDirection]);

  const totalOrders = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalOrders / rowsPerPage));

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const startItem = totalOrders === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalOrders);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((previous) =>
        previous === 'asc' ? 'desc' : 'asc'
      );
    } else {
      setSortField(field);
      setSortDirection(field === 'orderNumber' ? 'desc' : 'asc');
    }

    setCurrentPage(1);
  };

  const handleTabChange = (tab: OrderStatus | 'All') => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, '...', totalPages] as (number | string)[];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        '...',
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as (number | string)[];
    }

    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ] as (number | string)[];
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Order List
        </h1>

        {/* Order Created Notification Banner matching Figma 03.20 */}
        {showCreatedBanner && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-[#0F1E36] text-white rounded-lg shadow-md animate-in fade-in duration-200">
            <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span className="text-xs font-semibold">Order Created</span>
            <button
              type="button"
              onClick={() => setShowCreatedBanner(false)}
              className="text-white/70 hover:text-white ml-2 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Order list container */}
      <section className="overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
        {/* Search and add order */}
        <div className="flex min-h-[49px] flex-wrap items-center gap-2.5 border-b border-[#EDF0F5] px-3 py-2.5 sm:px-3">
          <div className="relative w-full sm:w-[192px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#263650]" />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search Order"
              aria-label="Search orders"
              className="h-[29px] w-full rounded-lg border border-[#E5EAF2] bg-white pl-3 pr-8 text-[11px] text-[#25324A] outline-none transition placeholder:text-[#9AA8BC] focus:border-[#102348] focus:ring-1 focus:ring-[#102348]/10"
            />
          </div>

          <Link
            href="/orders/create"
            className="inline-flex h-[29px] items-center justify-center gap-1.5 rounded-lg bg-[#0B1F44] px-3 text-[11px] font-medium text-white transition hover:bg-[#173363] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F44] focus-visible:ring-offset-2"
          >
            <Plus className="h-3 w-3" />
            Add Order
          </Link>
        </div>

        {/* Status tabs */}
        <div className="border-b border-[#EDF0F5] px-2 sm:px-3">
          <div
            className="flex items-center gap-1 overflow-x-auto py-1.5"
            role="tablist"
            aria-label="Filter orders by status"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab)}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition ${
                    isActive
                      ? 'bg-[#E9EDF4] text-[#102348]'
                      : 'bg-transparent text-[#293751] hover:bg-[#F4F6FA]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="h-[31px] border-b border-[#EDF0F5] bg-[#F7F9FC] text-[10px] font-medium text-[#263650]">
                <th className="px-3 font-medium sm:px-3">
                  <button
                    type="button"
                    onClick={() => handleSort('orderNumber')}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-[#0B1F44]"
                  >
                    Order No.
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>

                <th className="px-3 font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('orderDate')}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-[#0B1F44]"
                  >
                    Order Date
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>

                <th className="px-3 font-medium">Customer</th>
                <th className="px-3 font-medium">Payment Type</th>

                <th className="px-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={() => handleSort('total')}
                    className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap hover:text-[#0B1F44]"
                  >
                    Total
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>

                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EDF0F5]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <ShoppingCart className="mx-auto mb-2 h-7 w-7 text-[#B0BAC9]" />
                    <p className="text-sm font-medium text-[#263650]">
                      No orders found
                    </p>
                    <p className="mt-1 text-xs text-[#8794A8]">
                      Try another search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="h-[33px] transition-colors hover:bg-[#F8FAFD]"
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-[10px] font-medium text-[#15243D]">
                      <Link
                        href={`/orders/${order.id}`}
                        className="rounded-sm hover:text-[#315DA8] hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[10px] text-[#3C4A61]">
                      {formatDate(order.orderDate)}
                    </td>

                    <td className="max-w-[180px] px-3 py-2 text-[10px] text-[#3C4A61]">
                      <Link
                        href={`/customers/${order.customerId}`}
                        className="block truncate hover:text-[#315DA8] hover:underline"
                        title={order.customerName}
                      >
                        {order.customerName || '-'}
                      </Link>
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-[10px] text-[#3C4A61]">
                      {order.paymentType}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2 text-right text-[10px] font-medium tabular-nums text-[#27354B]">
                      {formatCurrency(order.total)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-2">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col gap-3 border-t border-[#EDF0F5] bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#53627A]">
            <label htmlFor="rows-per-page" className="sr-only">
              Rows per page
            </label>

            <div className="relative">
              <select
                id="rows-per-page"
                value={rowsPerPage}
                onChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="h-[23px] appearance-none rounded-md border border-[#E2E8F0] bg-white py-0 pl-2 pr-6 text-[10px] text-[#24344F] outline-none focus:border-[#102348]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#33445F]" />
            </div>

            <span>
              {startItem} - {endItem} of {totalOrders}
            </span>
          </div>

          <nav
            className="flex items-center justify-end gap-0.5"
            aria-label="Order list pagination"
          >
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="flex h-[23px] w-[24px] items-center justify-center rounded-l-md border border-[#E2E8F0] text-[#53627A] transition hover:bg-[#F4F6FA] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>

            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-[23px] min-w-[24px] items-center justify-center border-y border-[#E2E8F0] px-1 text-[10px] text-[#53627A]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                  onClick={() => setCurrentPage(page as number)}
                  className={`flex h-[23px] min-w-[24px] items-center justify-center border-y border-r border-[#E2E8F0] px-1.5 text-[10px] transition ${
                    currentPage === page
                      ? 'border-[#0B1F44] bg-[#0B1F44] font-semibold text-white'
                      : 'bg-white text-[#263650] hover:bg-[#F1F4F8]'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="flex h-[23px] w-[24px] items-center justify-center rounded-r-md border border-[#E2E8F0] text-[#53627A] transition hover:bg-[#F4F6FA] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </nav>
        </div>
      </section>
    </div>
  );
}
