'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { OrderStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Eye,
} from 'lucide-react';

export default function OrderListPage() {
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'orderNumber' | 'orderDate' | 'total'>('orderNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: orders.length,
      Unpaid: orders.filter((o) => o.status === 'Unpaid').length,
      Partial: orders.filter((o) => o.status === 'Partial').length,
      Paid: orders.filter((o) => o.status === 'Paid').length,
      Overdue: orders.filter((o) => o.status === 'Overdue').length,
      Draft: orders.filter((o) => o.status === 'Draft').length,
      Cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    };
  }, [orders]);

  // Filter & Search
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (activeTab === 'All') return true;
        return o.status === activeTab;
      })
      .filter((o) => {
        const q = search.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.paymentType.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (sortField === 'total') {
          return sortDirection === 'asc' ? (a.total - b.total) : (b.total - a.total);
        }

        if (sortDirection === 'asc') {
          return String(valA).localeCompare(String(valB));
        } else {
          return String(valB).localeCompare(String(valA));
        }
      });
  }, [orders, activeTab, search, sortField, sortDirection]);

  // Pagination
  const totalOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalOrders / rowsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const handleSort = (field: 'orderNumber' | 'orderDate' | 'total') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const tabs: (OrderStatus | 'All')[] = [
    'All',
    'Unpaid',
    'Partial',
    'Paid',
    'Overdue',
    'Draft',
    'Cancelled',
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Order List</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage, filter, and track order fulfillment and settlement
          </p>
        </div>

        <Link
          href="/orders/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          + Add Order
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const count = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Order (Order No. / Customer Name)..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('orderNumber')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Order No.
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('orderDate')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Order Date
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Payment Type</th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3 px-5 text-right cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Total
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No orders found</p>
                    <p className="text-xs text-slate-400 mt-1">Try refining your search query or tab filter.</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition group"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-xs text-slate-900">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:text-blue-600 underline-offset-2 hover:underline"
                      >
                        #{order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="min-w-0">
                        <Link
                          href={`/customers/${order.customerId}`}
                          className="font-semibold text-slate-900 text-xs hover:text-blue-600 truncate block"
                        >
                          {order.customerName}
                        </Link>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {order.customerEmail || order.customerPhone}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                      {order.paymentType}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-xs text-slate-900">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition inline-block"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {totalOrders > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </strong>{' '}
            –{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * rowsPerPage, totalOrders)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalOrders}</strong> orders
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
