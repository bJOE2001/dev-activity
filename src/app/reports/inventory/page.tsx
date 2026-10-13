'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Filter,
  Download,
  Printer,
  ArrowUpDown,
} from 'lucide-react';

export default function InventoryReportPage() {
  const { products, categories, addToast } = useStore();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategoryId !== 'ALL' && p.categoryId !== selectedCategoryId) return false;
        if (selectedStatus !== 'ALL' && p.status !== selectedStatus) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [products, selectedCategoryId, selectedStatus, sortOrder]);

  // Aggregate Metrics
  const summary = useMemo(() => {
    const activeProducts = filteredProducts.filter((p) => p.status === 'Active').length;
    const outOfStock = filteredProducts.filter((p) => p.stockOnHand === 0).length;
    const lowStock = filteredProducts.filter(
      (p) => p.stockOnHand > 0 && p.stockOnHand <= p.lowStockAlert
    ).length;

    const totalInventoryCost = filteredProducts.reduce(
      (sum, p) => sum + p.stockOnHand * p.cost,
      0
    );

    const forecastedSales = filteredProducts.reduce(
      (sum, p) => sum + p.stockOnHand * p.price,
      0
    );

    return {
      activeProducts,
      outOfStock,
      lowStock,
      totalInventoryCost,
      forecastedSales,
    };
  }, [filteredProducts]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Product SKU',
      'Product Name',
      'Category',
      'Stock On Hand',
      'Unit Cost',
      'Unit Price',
      'Total Inventory Cost',
      'Forecasted Sales',
      'Status',
    ];

    const rows = filteredProducts.map((p) => {
      const invCost = p.stockOnHand * p.cost;
      const forecast = p.stockOnHand * p.price;
      return [
        p.sku,
        `"${p.name}"`,
        `"${p.categoryName}"`,
        p.stockOnHand,
        p.cost.toFixed(2),
        p.price.toFixed(2),
        invCost.toFixed(2),
        forecast.toFixed(2),
        p.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    addToast('Report Exported', 'Inventory Report CSV downloaded successfully.');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage, rowsPerPage]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page Heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Inventory Report
        </h1>
      </div>

      {/* Inventory Filter Card */}
      <div className="bg-white rounded-xl border border-[#E5EAF2] p-5 space-y-4">
        <h2 className="text-xs font-semibold text-slate-800">Inventory Filter</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Category
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full h-9 px-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-slate-900"
              >
                <option value="ALL">ALL</option>
                {categories.map((c) => (
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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

      {/* 5 KPI Metric Cards matching Figma 07.03 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active Products */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-normal text-slate-500 block">
              Active Products
            </span>
            <span className="text-[18px] font-bold text-slate-900 mt-0.5 block">
              {summary.activeProducts.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
            <span className="text-xs">📦</span>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-normal text-slate-500 block">
              Out of Stock
            </span>
            <span className="text-[18px] font-bold text-slate-900 mt-0.5 block">
              {summary.outOfStock.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
            <span className="text-xs">⊘</span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-normal text-slate-500 block">
              Low Stock
            </span>
            <span className="text-[18px] font-bold text-slate-900 mt-0.5 block">
              {summary.lowStock.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
            <span className="text-xs">⚠️</span>
          </div>
        </div>

        {/* Total Inventory Cost */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-normal text-slate-500 block">
              Total Inventory Cost
            </span>
            <span className="text-[16px] font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(summary.totalInventoryCost)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
            <span className="text-xs">📑</span>
          </div>
        </div>

        {/* Forecasted Sales */}
        <div className="bg-white p-3.5 rounded-xl border border-[#E5EAF2] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-normal text-slate-500 block">
              Forecasted Sales
            </span>
            <span className="text-[16px] font-bold text-slate-900 mt-0.5 block">
              {formatCurrency(summary.forecastedSales)}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
            <span className="text-xs">📈</span>
          </div>
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
                    <span>Product Name</span>
                    <span className="text-[10px]">⌵</span>
                  </div>
                </th>
                <th className="px-3 font-medium">Category</th>
                <th className="px-3 font-medium">Stock On Hand</th>
                <th className="px-3 font-medium">Inventory Cost</th>
                <th className="px-3 font-medium">Forecasted Sales</th>
                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F5] text-[11px] text-[#25324A]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const invCost = p.stockOnHand * p.cost;
                  const forecast = p.stockOnHand * p.price;

                  return (
                    <tr
                      key={p.id}
                      className="h-[40px] hover:bg-[#F9FBFC] transition"
                    >
                      <td className="px-3 py-2 text-[#25324A]">
                        {p.name}
                      </td>
                      <td className="px-3 py-2 text-[#55657E]">
                        {p.categoryName}
                      </td>
                      <td className="px-3 py-2 text-[#55657E]">
                        {p.stockOnHand.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-[#25324A]">
                        {formatCurrency(invCost)}
                      </td>
                      <td className="px-3 py-2 text-[#25324A]">
                        {formatCurrency(forecast)}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={p.status} />
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
