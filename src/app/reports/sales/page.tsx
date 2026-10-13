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

  // Customer and Status filters
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Active Date Filter Range state
  const [selectedRangePreset, setSelectedRangePreset] = useState<string>('All Time');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Calendar view navigation (Year and Month of the left calendar)
  const [viewYear, setViewYear] = useState<number>(2026);
  const [viewMonth, setViewMonth] = useState<number>(9); // 0-indexed: 9 = October

  // Temporary selection while inside the popover
  const [tempStart, setTempStart] = useState<string | null>(null);
  const [tempEnd, setTempEnd] = useState<string | null>(null);

  // Filtered orders with active date range
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

      // Date range filter
      if (startDate) {
        if (o.orderDate < startDate) return false;
      }
      if (endDate) {
        if (o.orderDate > endDate) return false;
      }

      // Exclude cancelled and draft unless explicitly selected
      if (selectedStatus === 'ALL' && (o.status === 'Cancelled' || o.status === 'Draft')) {
        return false;
      }

      return true;
    });
  }, [orders, selectedStatus, selectedCustomerId, startDate, endDate]);

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
    link.setAttribute('download', `sales-report-${selectedRangePreset.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast('Report Exported', 'Sales Report CSV downloaded successfully.');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const total = filteredOrders.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  // Date Range Popover state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Open Popover helper
  const handleOpenPopover = () => {
    setTempStart(startDate);
    setTempEnd(endDate);
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  // Helper to format ISO date YYYY-MM-DD
  const toISODate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format MM/DD/YYYY
  const toDisplayDate = (isoStr: string) => {
    const [y, m, d] = isoStr.split('-');
    return `${m}/${d}/${y}`;
  };

  const dateDisplay = useMemo(() => {
    if (startDate && endDate) {
      return `${toDisplayDate(startDate)} - ${toDisplayDate(endDate)}`;
    }
    if (startDate) {
      return `${toDisplayDate(startDate)} - Select end`;
    }
    return 'MM/DD/YYYY - MM/DD/YYYY';
  }, [startDate, endDate]);

  // Month navigation
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Calendar month generator helper
  const getMonthDays = (year: number, month: number) => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading days from prev month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dateStr: toISODate(prevDate),
        dayNum: d,
        isCurrentMonth: false,
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const curDate = new Date(year, month, i);
      days.push({
        dateStr: toISODate(curDate),
        dayNum: i,
        isCurrentMonth: true,
      });
    }

    // Trailing days to fill 42 cells (6 rows) or minimum 35 cells (5 rows)
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dateStr: toISODate(nextDate),
        dayNum: i,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  // Left month: viewYear, viewMonth
  // Right month: next month after viewMonth
  const leftMonthName = new Date(viewYear, viewMonth, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  const rightDate = new Date(viewYear, viewMonth + 1, 1);
  const rightMonthName = rightDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const leftDays = useMemo(() => getMonthDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const rightDays = useMemo(() => getMonthDays(rightDate.getFullYear(), rightDate.getMonth()), [rightDate]);

  // Click handler for day cell
  const handleSelectDay = (dateStr: string) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(dateStr);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      setSelectedRangePreset('Custom Range');
    }
  };

  // Preset quick selection handler
  const handleApplyPreset = (preset: string) => {
    setSelectedRangePreset(preset);
    const now = new Date(2026, 9, 13); // Oct 13, 2026
    let s: string | null = null;
    let e: string | null = null;

    if (preset === 'Today') {
      s = toISODate(now);
      e = toISODate(now);
    } else if (preset === 'Yesterday') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      s = toISODate(y);
      e = toISODate(y);
    } else if (preset === 'Last 7 Days') {
      const past7 = new Date(now);
      past7.setDate(past7.getDate() - 6);
      s = toISODate(past7);
      e = toISODate(now);
    } else if (preset === 'Last 30 Days') {
      const past30 = new Date(now);
      past30.setDate(past30.getDate() - 29);
      s = toISODate(past30);
      e = toISODate(now);
    } else if (preset === 'This Month') {
      s = '2026-10-01';
      e = '2026-10-31';
    } else if (preset === 'Last Month') {
      s = '2026-09-01';
      e = '2026-09-30';
    } else if (preset === 'All Time') {
      s = null;
      e = null;
    }

    setTempStart(s);
    setTempEnd(e);
  };

  // Check if a day is in range
  const isSelectedStart = (dateStr: string) => tempStart === dateStr;
  const isSelectedEnd = (dateStr: string) => tempEnd === dateStr;
  const isInRange = (dateStr: string) => {
    if (tempStart && tempEnd) {
      return dateStr > tempStart && dateStr < tempEnd;
    }
    if (tempStart && !tempEnd && hoverDate) {
      const minD = tempStart < hoverDate ? tempStart : hoverDate;
      const maxD = tempStart < hoverDate ? hoverDate : tempStart;
      return dateStr > minD && dateStr < maxD;
    }
    return false;
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page Heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Sales Report
        </h1>
      </div>

      {/* Sales Report Filter Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF2] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-800">Sales Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Picker Range Dropdown */}
          <div className="relative">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Date
            </label>
            <button
              type="button"
              onClick={handleOpenPopover}
              className="w-full h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-left text-slate-700 flex items-center justify-between outline-none cursor-pointer focus:ring-1 focus:ring-slate-900"
            >
              <span>{dateDisplay}</span>
              <span className="text-xs text-slate-400">⌵</span>
            </button>

            {/* Figma 07.02 Date Range Picker Popover */}
            {isDatePickerOpen && (
              <div className="absolute z-30 left-0 mt-1 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-[620px] max-w-[95vw] flex flex-col md:flex-row gap-4 animate-in fade-in duration-150">
                {/* Two Month Calendars */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 px-1">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Previous Month"
                    >
                      ←
                    </button>
                    <div className="flex items-center justify-around flex-1">
                      <span>{leftMonthName}</span>
                      <span>{rightMonthName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                      title="Next Month"
                    >
                      →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Month Calendar */}
                    <div>
                      <div className="grid grid-cols-7 text-[10px] text-center font-medium text-slate-400 mb-1">
                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                      <div className="grid grid-cols-7 text-[10px] text-center gap-y-1 text-slate-700">
                        {leftDays.map((d, idx) => {
                          const isStart = isSelectedStart(d.dateStr);
                          const isEnd = isSelectedEnd(d.dateStr);
                          const inR = isInRange(d.dateStr);

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDay(d.dateStr)}
                              onMouseEnter={() => setHoverDate(d.dateStr)}
                              className={`h-7 w-full flex items-center justify-center transition text-[11px] cursor-pointer ${
                                !d.isCurrentMonth ? 'text-slate-300' : 'text-slate-800'
                              } ${
                                isStart || isEnd
                                  ? 'bg-[#0F1E36] text-white font-bold rounded'
                                  : inR
                                  ? 'bg-slate-100 text-slate-900 font-medium'
                                  : 'hover:bg-slate-100 rounded'
                              }`}
                            >
                              {d.dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Month Calendar */}
                    <div>
                      <div className="grid grid-cols-7 text-[10px] text-center font-medium text-slate-400 mb-1">
                        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                      <div className="grid grid-cols-7 text-[10px] text-center gap-y-1 text-slate-700">
                        {rightDays.map((d, idx) => {
                          const isStart = isSelectedStart(d.dateStr);
                          const isEnd = isSelectedEnd(d.dateStr);
                          const inR = isInRange(d.dateStr);

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectDay(d.dateStr)}
                              onMouseEnter={() => setHoverDate(d.dateStr)}
                              className={`h-7 w-full flex items-center justify-center transition text-[11px] cursor-pointer ${
                                !d.isCurrentMonth ? 'text-slate-300' : 'text-slate-800'
                              } ${
                                isStart || isEnd
                                  ? 'bg-[#0F1E36] text-white font-bold rounded'
                                  : inR
                                  ? 'bg-slate-100 text-slate-900 font-medium'
                                  : 'hover:bg-slate-100 rounded'
                              }`}
                            >
                              {d.dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Presets & Apply buttons */}
                <div className="w-full md:w-36 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-3 flex flex-col justify-between">
                  <div className="space-y-1">
                    {[
                      'Today',
                      'Yesterday',
                      'Last 7 Days',
                      'Last 30 Days',
                      'This Month',
                      'Last Month',
                      'All Time',
                      'Custom Range',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className={`w-full text-left px-2.5 py-1 text-[11px] rounded transition cursor-pointer ${
                          selectedRangePreset === preset
                            ? 'bg-[#0F1E36] text-white font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="flex-1 py-1 text-center rounded border border-slate-200 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStartDate(tempStart);
                        setEndDate(tempEnd || tempStart);
                        setIsDatePickerOpen(false);
                      }}
                      className="flex-1 py-1 text-center rounded bg-[#0F1E36] text-white text-[10px] font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Customer
            </label>
            <div className="relative">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">ALL</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ⌵
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Status
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">ALL</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Overdue">Overdue</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ⌵
              </span>
            </div>
          </div>
        </div>

        <div>
          <button
            type="button"
            className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Action Buttons: Print and Export CSV */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5EAF2] rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-slate-600" />
          <span>Print</span>
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5EAF2] rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Table Container */}
      <section className="overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left">
            <thead>
              <tr className="h-[31px] border-b border-[#EDF0F5] bg-[#F7F9FC] text-[10px] font-medium text-[#263650]">
                <th className="px-3 font-medium">
                  <div
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-[#0B1F44]"
                  >
                    <span>Sales Invoice</span>
                    <span className="text-[10px]">⌵</span>
                  </div>
                </th>
                <th className="px-3 font-medium">Order Date</th>
                <th className="px-3 font-medium">Payment type</th>
                <th className="px-3 font-medium">Sales Amount</th>
                <th className="px-3 font-medium">Cost</th>
                <th className="px-3 font-medium">Net Sales</th>
                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F5] text-[11px] text-[#25324A]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No sales invoices match the selected parameters.
                  </td>
                </tr>
              ) : (
                paginated.map((o) => {
                  const cost = o.items.reduce((sum, i) => sum + i.cost * i.quantity, 0);
                  const net = o.total - cost;

                  return (
                    <tr
                      key={o.id}
                      className="h-[40px] hover:bg-[#F9FBFC] transition"
                    >
                      <td className="px-3 py-2 text-[#25324A]">
                        {o.orderNumber}
                      </td>
                      <td className="px-3 py-2 text-[#55657E]">
                        {formatDate(o.orderDate)}
                      </td>
                      <td className="px-3 py-2 text-[#55657E]">
                        {o.paymentType}
                      </td>
                      <td className="px-3 py-2 text-[#25324A]">
                        {formatCurrency(o.total)}
                      </td>
                      <td className="px-3 py-2 text-[#25324A]">
                        {formatCurrency(cost)}
                      </td>
                      <td className="px-3 py-2 text-[#25324A]">
                        {formatCurrency(net)}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 text-[11px] text-[#55657E] border-t border-[#EDF0F5]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-[25px] rounded border border-[#E5EAF2] bg-white px-2 pr-6 text-[11px] text-[#25324A] outline-none appearance-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#55657E]">
                ⌵
              </span>
            </div>
            <span>
              {total > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * rowsPerPage, total)} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC] cursor-pointer"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`flex h-[25px] w-[25px] items-center justify-center rounded text-[11px] font-medium transition cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#0B1F44] text-white'
                    : 'border border-[#E5EAF2] bg-white text-[#55657E] hover:bg-[#F8FAFC]'
                }`}
              >
                {pg}
              </button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="px-1 text-[#8A99AD]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`flex h-[25px] w-[25px] items-center justify-center rounded text-[11px] font-medium transition cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-[#0B1F44] text-white'
                      : 'border border-[#E5EAF2] bg-white text-[#55657E] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC] cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
