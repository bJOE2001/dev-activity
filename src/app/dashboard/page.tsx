'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/types';
import { AddStockModal } from '@/components/modals/AddStockModal';
import {
  TrendingUp,
  Download,
  Plus,
  ChevronDown,
  Layers,
  CircleDollarSign,
  ShoppingCart,
  Package,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, orders, products, addStock, addToast } = useStore();

  const [timeView, setTimeView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 1 – Oct 31, 2026');

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  // Confirmed orders (non-draft, non-cancelled) added beyond initial mock data
  const userAddedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== 'Draft' &&
        o.status !== 'Cancelled' &&
        !o.id.startsWith('ord-1') &&
        !o.id.startsWith('ord-2') &&
        !o.id.startsWith('ord-3')
    );
  }, [orders]);

  // Exact metrics matching Figma 02.01 baseline for October 2026
  const metrics = useMemo(() => {
    const baseSales = 250000;
    const baseCost = 50000;
    const baseOrders = 893;

    const addedSales = userAddedOrders.reduce((sum, o) => sum + o.total, 0);
    const addedCost = userAddedOrders.reduce((sum, o) => {
      return sum + o.items.reduce((iSum, i) => iSum + i.cost * i.quantity, 0);
    }, 0);
    const addedOrders = userAddedOrders.length;

    const totalSales = baseSales + addedSales;
    const totalCost = baseCost + addedCost;
    const totalNetSales = totalSales - totalCost;
    const orderCount = baseOrders + addedOrders;

    return { totalSales, totalCost, totalNetSales, orderCount };
  }, [userAddedOrders]);

  // Payment Status Breakdown (Paid 52%, Partial 21%, Unpaid 15%, Overdue 12%)
  const paymentBreakdown = [
    { status: 'Paid', amount: 130000, share: 52, color: '#10B981' },
    { status: 'Partial', amount: 52500, share: 21, color: '#0F1E36' },
    { status: 'Unpaid', amount: 37500, share: 15, color: '#F59E0B' },
    { status: 'Overdue', amount: 30000, share: 12, color: '#EF4444' },
  ];

  // Payment Methods Donut (Cash 58%, Bank Transfer 32%, Check 10%)
  const paymentMethods = [
    { name: 'Cash', amount: 145000, share: 58, color: '#10B981' },
    { name: 'Bank Transfer', amount: 80000, share: 32, color: '#0F1E36' },
    { name: 'Check', amount: 25000, share: 10, color: '#F59E0B' },
  ];

  // Top Selling Products matching Figma 02.01 exactly
  const topSellingProducts = [
    {
      rank: 1,
      name: 'Coca-Cola 1.5L',
      category: 'Beverages',
      qtySold: '1,240',
      price: 85.0,
      totalAmount: 105400.0,
      share: 41,
    },
    {
      rank: 2,
      name: 'Gardenia Classic Loaf',
      category: 'Bakery',
      qtySold: '720',
      price: 72.0,
      totalAmount: 51840.0,
      share: 20,
    },
    {
      rank: 3,
      name: 'Safeguard Bar Soap',
      category: 'Personal Care',
      qtySold: '980',
      price: 48.0,
      totalAmount: 47040.0,
      share: 18,
    },
    {
      rank: 4,
      name: 'Alaska Evap Milk',
      category: 'Dairy',
      qtySold: '860',
      price: 42.0,
      totalAmount: 36120.0,
      share: 14,
    },
    {
      rank: 5,
      name: 'Lucky Me Pancit Canton',
      category: 'Snacks',
      qtySold: '1,120',
      price: 15.0,
      totalAmount: 16800.0,
      share: 7,
    },
  ];

  // Low Stock Products matching Figma 02.01
  const lowStockList = [
    {
      id: 'prod-1',
      sku: 'SKU-10293',
      name: 'Coca-Cola 1.5L',
      min: 24,
      unitsLeft: 2,
      badgeColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'prod-2',
      sku: 'SKU-20481',
      name: 'Lucky Me Pancit C...',
      min: 48,
      unitsLeft: 4,
      badgeColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'prod-3',
      sku: 'SKU-31720',
      name: 'Safeguard Bar Soap',
      min: 36,
      unitsLeft: 6,
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'prod-4',
      sku: 'SKU-40117',
      name: 'Alaska Evap Milk',
      min: 40,
      unitsLeft: 8,
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'prod-5',
      sku: 'SKU-55002',
      name: 'Gardenia Classic L...',
      min: 30,
      unitsLeft: 9,
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  // Top Categories (2 columns matching Figma 02.01)
  const topCategoriesCol1 = [
    { name: 'Beverages', amount: 70400, width: '100%' },
    { name: 'Personal Care', amount: 60800, width: '86%' },
    { name: 'Canned Goods', amount: 55700, width: '79%' },
    { name: 'Frozen Foods', amount: 44600, width: '63%' },
  ];

  const topCategoriesCol2 = [
    { name: 'Snacks', amount: 66200, width: '94%' },
    { name: 'Household', amount: 58100, width: '82%' },
    { name: 'Dairy', amount: 50300, width: '71%' },
    { name: 'Bakery', amount: 41200, width: '58%' },
  ];

  // Export CSV
  const handleExport = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Sales', '₱250,000.00'],
      ['Total Cost', '₱50,000.00'],
      ['Total Net Sales', '₱200,000.00'],
      ['Number of Orders', '893'],
      ['Cash Payments', '₱145,000.00'],
      ['Bank Transfer', '₱80,000.00'],
      ['Check Payments', '₱25,000.00'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dashboard-summary-${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Dashboard Exported', 'CSV summary downloaded.');
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* 02.01 Header with Greeting & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F1E36]">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Good morning, {user.firstName || 'John'} — here&apos;s how your store is performing this month.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period Selector button */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none flex items-center gap-2 pl-3.5 pr-8 py-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition focus:outline-none cursor-pointer"
            >
              <option value="Oct 1 – Oct 31, 2026">Oct 1 – Oct 31, 2026</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          {/* Create Order Button */}
          <Link
            href="/orders/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0F1E36] hover:bg-[#162744] text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + Create Order
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Row (Figma 02.01 exact matching) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
            {formatCurrency(metrics.totalSales)}
          </p>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Cost</span>
          </div>
          <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
            {formatCurrency(metrics.totalCost)}
          </p>
        </div>

        {/* Total Net Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Net Sales</span>
          </div>
          <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
            {formatCurrency(metrics.totalNetSales)}
          </p>
        </div>

        {/* Number of Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Number of Orders</span>
          </div>
          <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
            {metrics.orderCount}
          </p>
        </div>
      </div>

      {/* Row 2: Sales Overview Chart (2 cols) & (Payment Status + Payment Methods) (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sales Overview Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#0F1E36]">Sales Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">Daily revenue, October 2026</p>
            </div>

            {/* Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setTimeView(view)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                    timeView === view
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Smooth Curve Area Chart matching Figma 02.01 */}
          <div className="relative w-full h-[230px] select-none pt-4">
            {/* Floating Tooltip at Thu, Oct 23 Peak */}
            <div
              className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3"
              style={{ left: '74.5%', top: '22%' }}
            >
              <div className="bg-[#0F1E36] text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-800 text-center w-28">
                <p className="text-[10px] text-slate-300">Thu, Oct 23</p>
                <p className="text-xs font-bold text-white mt-0.5">₱74,200.00</p>
                <p className="text-[10px] text-slate-300 mt-0.5">42 orders</p>
              </div>
            </div>

            <svg viewBox="0 0 650 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="figmaChartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F1E36" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#0F1E36" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-axis labels */}
              <text x="0" y="15" fill="#94A3B8" fontSize="10" fontWeight="500">80k</text>
              <line x1="30" y1="12" x2="650" y2="12" stroke="#F1F5F9" strokeWidth="1" />

              <text x="0" y="55" fill="#94A3B8" fontSize="10" fontWeight="500">60k</text>
              <line x1="30" y1="52" x2="650" y2="52" stroke="#F1F5F9" strokeWidth="1" />

              <text x="0" y="95" fill="#94A3B8" fontSize="10" fontWeight="500">40k</text>
              <line x1="30" y1="92" x2="650" y2="92" stroke="#F1F5F9" strokeWidth="1" />

              <text x="0" y="135" fill="#94A3B8" fontSize="10" fontWeight="500">20k</text>
              <line x1="30" y1="132" x2="650" y2="132" stroke="#F1F5F9" strokeWidth="1" />

              <text x="12" y="175" fill="#94A3B8" fontSize="10" fontWeight="500">0</text>
              <line x1="30" y1="172" x2="650" y2="172" stroke="#E2E8F0" strokeWidth="1" />

              {/* Smooth Spline Curve matching Figma */}
              <path
                d="M 35 132 C 80 132, 130 132, 180 131 C 230 130, 270 132, 305 128 C 330 125, 345 105, 360 88 C 385 60, 420 30, 450 20 C 470 14, 480 12, 485 12 C 495 12, 505 50, 520 85 C 530 105, 540 85, 550 82 C 565 80, 575 128, 595 132 C 620 132, 635 131, 650 131 L 650 172 L 35 172 Z"
                fill="url(#figmaChartGrad)"
              />

              <path
                d="M 35 132 C 80 132, 130 132, 180 131 C 230 130, 270 132, 305 128 C 330 125, 345 105, 360 88 C 385 60, 420 30, 450 20 C 470 14, 480 12, 485 12 C 495 12, 505 50, 520 85 C 530 105, 540 85, 550 82 C 565 80, 575 128, 595 132 C 620 132, 635 131, 650 131"
                fill="none"
                stroke="#0F1E36"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Peak indicator dot on Day 23 */}
              <circle
                cx="485"
                cy="12"
                r="4.5"
                fill="#FFFFFF"
                stroke="#0F1E36"
                strokeWidth="2.5"
              />
            </svg>

            {/* X-axis labels matching Figma 02.01 */}
            <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2 pl-7 pr-1">
              <span>1</span>
              <span>4</span>
              <span>7</span>
              <span>10</span>
              <span>13</span>
              <span>16</span>
              <span>19</span>
              <span>22</span>
              <span>25</span>
              <span>28</span>
              <span>31</span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Status & Payment Methods */}
        <div className="space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0F1E36]">Payment Status</h2>
              <span className="text-xs text-slate-400 font-medium">893 orders</span>
            </div>

            {/* Multi-segment Horizontal Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex gap-0.5 bg-slate-100">
              <div className="h-full bg-[#10B981] rounded-l-full" style={{ width: '52%' }} />
              <div className="h-full bg-[#0F1E36]" style={{ width: '21%' }} />
              <div className="h-full bg-[#F59E0B]" style={{ width: '15%' }} />
              <div className="h-full bg-[#EF4444] rounded-r-full" style={{ width: '12%' }} />
            </div>

            {/* Status list */}
            <div className="space-y-2 text-xs">
              {paymentBreakdown.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 font-medium">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0F1E36]">
                      {formatCurrency(item.amount).replace('.00', '')}
                    </span>
                    <span className="text-slate-400 text-[11px] w-8 text-right font-medium">
                      {item.share}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-[#0F1E36]">Payment Methods</h2>

            <div className="flex items-center gap-6">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Cash: 58% (circumference ~ 282.7) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray="164 119"
                    strokeDashoffset="0"
                  />
                  {/* Bank Transfer: 32% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#0F1E36"
                    strokeWidth="12"
                    strokeDasharray="90 193"
                    strokeDashoffset="-164"
                  />
                  {/* Check: 10% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray="28 255"
                    strokeDashoffset="-254"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                  <span className="text-base font-bold text-[#0F1E36] leading-none mt-0.5">
                    ₱250k
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-2 text-xs">
                {paymentMethods.map((m) => (
                  <div key={m.name} className="flex items-start justify-between">
                    <div className="flex items-start gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ backgroundColor: m.color }}
                      />
                      <div>
                        <p className="font-semibold text-slate-800 text-[11px] leading-tight">
                          {m.name}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatCurrency(m.amount).replace('.00', '')}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{m.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products (2 cols) & Low Stock Products (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Top Selling Products Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F1E36]">Top Selling Products</h2>
              <p className="text-xs text-slate-400 mt-0.5">Best performers by revenue this month</p>
            </div>
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 border border-slate-200 rounded-lg px-2.5 py-1">
              <span>Show 5</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase font-semibold text-slate-400 border-b border-slate-100 pb-2">
                  <th className="py-2.5 pr-2 w-6">#</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 pl-3 w-32">Share of Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingProducts.map((p) => (
                  <tr key={p.rank} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 pr-2 text-slate-400 font-medium">{p.rank}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-tight">{p.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">{p.qtySold}</td>
                    <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(p.price)}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-3 pl-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0F1E36] rounded-full"
                            style={{ width: `${p.share}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium w-6 text-right">
                          {p.share}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F1E36]">Low Stock Products</h2>
            <Link
              href="/products"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockList.map((item) => (
              <div
                key={item.sku}
                className="flex items-center justify-between gap-2 p-2 hover:bg-slate-50 rounded-lg transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs text-slate-900 truncate leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.sku} · Min {item.min}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}
                  >
                    {item.unitsLeft} left
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = products.find((p) => p.sku === item.sku) || products[0];
                      setRestockProduct(matched);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Top Categories (Full Width bottom card matching Figma 02.01) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F1E36]">Top Categories</h2>
          <Link
            href="/reports/sales"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            View report
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 pt-1">
          {/* Column 1 */}
          <div className="space-y-3">
            {topCategoriesCol1.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4 text-xs">
                <span className="w-24 text-slate-700 font-medium truncate">{cat.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F1E36] rounded-full"
                    style={{ width: cat.width }}
                  />
                </div>
                <span className="font-bold text-slate-900 w-16 text-right">
                  {formatCurrency(cat.amount).replace('.00', '')}
                </span>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            {topCategoriesCol2.map((cat) => (
              <div key={cat.name} className="flex items-center gap-4 text-xs">
                <span className="w-24 text-slate-700 font-medium truncate">{cat.name}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F1E36] rounded-full"
                    style={{ width: cat.width }}
                  />
                </div>
                <span className="font-bold text-slate-900 w-16 text-right">
                  {formatCurrency(cat.amount).replace('.00', '')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <AddStockModal
          isOpen={true}
          onClose={() => setRestockProduct(null)}
          product={restockProduct}
          onAddStock={(productId, qty) => {
            addStock(productId, qty);
            addToast('Stock Added', `Added ${qty} units to ${restockProduct.name}.`);
            setRestockProduct(null);
          }}
        />
      )}
    </div>
  );
}
