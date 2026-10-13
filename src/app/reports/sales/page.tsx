'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Download,
  Printer,
  Filter,
} from 'lucide-react';

export default function SalesReportPage() {
  const { orders, customers, addToast } = useStore();

  // Filters
  const [datePreset, setDatePreset] = useState<'This Month' | 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'Last Month' | 'All Time'>('This Month');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatus !== 'ALL' && o.status !== selectedStatus) {
        return false;
      }

      // Customer filter
      if (selectedCustomerId !== 'ALL' && o.customerId !== selectedCustomerId) {
        return false;
      }

      // Exclude cancelled and draft unless explicitly selected
      if (selectedStatus === 'ALL' && (o.status === 'Cancelled' || o.status === 'Draft')) {
        return false;
      }

      return true;
    });
  }, [orders, selectedStatus, selectedCustomerId]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalCost = filteredOrders.reduce((sum, o) => {
      const orderCost = o.items.reduce((iSum, i) => iSum + i.cost * i.quantity, 0);
      return sum + orderCost;
    }, 0);
    const totalNetSales = totalSales - totalCost;
    const avgOrderValue = filteredOrders.length > 0 ? totalSales / filteredOrders.length : 0;

    return {
      totalSales,
      totalCost,
      totalNetSales,
      avgOrderValue,
      count: filteredOrders.length,
    };
  }, [filteredOrders]);

  // Print
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Sales Invoice',
      'Order Date',
      'Customer',
      'Payment Type',
      'Sales Amount',
      'Cost',
      'Net Sales',
      'Status',
    ];

    const rows = filteredOrders.map((o) => {
      const cost = o.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
      const net = o.total - cost;
      return [
        `"#${o.orderNumber}"`,
        o.orderDate,
        `"${o.customerName}"`,
        o.paymentType,
        o.total.toFixed(2),
        cost.toFixed(2),
        net.toFixed(2),
        o.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `sales-report-${datePreset.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast('Report Exported', 'Sales Report CSV downloaded successfully.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0 print:space-y-4">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sales Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Reports › Sales Report — Revenue, margin, and payment reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-300 text-xs font-semibold shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <h2 className="text-2xl font-bold">SALES REPORT</h2>
        <p className="text-xs text-slate-500">
          Dev Activity · Period: {datePreset} · Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Filter Bar (hidden in print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Filter Parameters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Date Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date Preset
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="This Month">This Month (Oct 2026)</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last Month">Last Month</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          {/* Customer Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Customer
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Confirmed Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Sales
          </span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(summary.totalSales)}</p>
          <p className="text-[11px] text-slate-400">{summary.count} filtered orders</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Cost of Goods
          </span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(summary.totalCost)}</p>
          <p className="text-[11px] text-slate-400">Inventory cost</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Net Sales (Margin)
          </span>
          <p className="text-xl font-extrabold text-emerald-600">{formatCurrency(summary.totalNetSales)}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {summary.totalSales > 0 ? ((summary.totalNetSales / summary.totalSales) * 100).toFixed(1) : 0}% net profit
          </p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Avg Order Value
          </span>
          <p className="text-xl font-extrabold text-slate-900">{formatCurrency(summary.avgOrderValue)}</p>
          <p className="text-[11px] text-slate-400">Per invoice</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Sales Invoice</th>
                <th className="py-3 px-5">Order Date</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Payment Type</th>
                <th className="py-3 px-5 text-right">Sales Amount</th>
                <th className="py-3 px-5 text-right">Cost</th>
                <th className="py-3 px-5 text-right">Net Sales</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales invoices match the selected parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const cost = o.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
                  const net = o.total - cost;

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5 font-mono font-bold text-xs text-slate-900">
                        <Link href={`/orders/${o.id}`} className="hover:underline hover:text-blue-600">
                          #{o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600">
                        {formatDate(o.orderDate)}
                      </td>
                      <td className="py-3 px-5 font-medium text-xs text-slate-900">
                        {o.customerName}
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600 font-medium">
                        {o.paymentType}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-xs text-slate-900">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="py-3 px-5 text-right text-xs text-slate-600">
                        {formatCurrency(cost)}
                      </td>
                      <td className="py-3 px-5 text-right font-bold text-xs text-emerald-600">
                        {formatCurrency(net)}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
