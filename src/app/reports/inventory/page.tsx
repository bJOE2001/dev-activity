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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 print:p-0 print:space-y-4">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Reports › Inventory Report — Stock health, valuation, and revenue potential
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
        <h2 className="text-2xl font-bold">INVENTORY REPORT</h2>
        <p className="text-xs text-slate-500">
          Dev Activity · Stock Valuation & Health Analysis · Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Filters (hidden in print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs print:hidden space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          Inventory Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Active Products
          </span>
          <p className="text-xl font-extrabold text-slate-900">{summary.activeProducts}</p>
          <p className="text-[11px] text-slate-400">In catalog</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Out of Stock
          </span>
          <p className="text-xl font-extrabold text-rose-600">{summary.outOfStock}</p>
          <p className="text-[11px] text-slate-400">Zero units on hand</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Low Stock
          </span>
          <p className="text-xl font-extrabold text-amber-600">{summary.lowStock}</p>
          <p className="text-[11px] text-slate-400">Below alert level</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Inventory Cost
          </span>
          <p className="text-xl font-extrabold text-slate-900">
            {formatCurrency(summary.totalInventoryCost)}
          </p>
          <p className="text-[11px] text-slate-400">Asset valuation</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Forecasted Sales
          </span>
          <p className="text-xl font-extrabold text-emerald-600">
            {formatCurrency(summary.forecastedSales)}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold">
            {summary.forecastedSales > 0
              ? `${(
                  ((summary.forecastedSales - summary.totalInventoryCost) /
                    summary.forecastedSales) *
                  100
                ).toFixed(1)}% potential margin`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Product Name
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5 text-right">Stock On Hand</th>
                <th className="py-3 px-5 text-right">Inventory Cost</th>
                <th className="py-3 px-5 text-right">Forecasted Sales</th>
                <th className="py-3 px-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No products match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const invCost = p.stockOnHand * p.cost;
                  const forecast = p.stockOnHand * p.price;
                  const isLow = p.stockOnHand <= p.lowStockAlert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5">
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{p.name}</p>
                          <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-xs text-slate-600 font-medium">
                        {p.categoryName}
                      </td>
                      <td className="py-3 px-5 text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            p.stockOnHand === 0
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'text-slate-800'
                          }`}
                        >
                          {p.stockOnHand} units
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right text-xs text-slate-700 font-semibold">
                        {formatCurrency(invCost)}
                      </td>
                      <td className="py-3 px-5 text-right text-xs font-bold text-slate-900">
                        {formatCurrency(forecast)}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <StatusBadge status={p.status} />
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
