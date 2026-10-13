'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/lib/types';
import { AddStockModal } from '@/components/modals/AddStockModal';
import {
  Boxes,
  Download,
  Plus,
  ChevronDown,
  ShoppingCart,
  Package,
} from 'lucide-react';

interface SalesChartPoint {
  date: string;
  sales: number;
  orders: number;
  svgX: number;
  svgY: number;
  leftPercent: number;
  topPercent: number;
}

const dailySalesPoints: SalesChartPoint[] = [
  { date: 'Thu, Oct 1', sales: 20400, orders: 12, svgX: 35, svgY: 132, leftPercent: 5.4, topPercent: 68 },
  { date: 'Sun, Oct 4', sales: 20100, orders: 11, svgX: 96, svgY: 132, leftPercent: 14.8, topPercent: 68 },
  { date: 'Wed, Oct 7', sales: 20800, orders: 13, svgX: 158, svgY: 132, leftPercent: 24.3, topPercent: 68 },
  { date: 'Sat, Oct 10', sales: 21500, orders: 14, svgX: 219, svgY: 131, leftPercent: 33.7, topPercent: 68 },
  { date: 'Tue, Oct 13', sales: 20900, orders: 12, svgX: 280, svgY: 132, leftPercent: 43.1, topPercent: 68 },
  { date: 'Fri, Oct 16', sales: 65400, orders: 38, svgX: 345, svgY: 55, leftPercent: 53.1, topPercent: 37 },
  { date: 'Sat, Oct 17', sales: 69800, orders: 40, svgX: 368, svgY: 35, leftPercent: 56.6, topPercent: 28 },
  { date: 'Tue, Oct 20', sales: 44200, orders: 26, svgX: 425, svgY: 95, leftPercent: 65.4, topPercent: 52 },
  { date: 'Thu, Oct 23', sales: 74200, orders: 42, svgX: 486, svgY: 14, leftPercent: 74.8, topPercent: 19 },
  { date: 'Sun, Oct 26', sales: 20500, orders: 12, svgX: 545, svgY: 132, leftPercent: 83.8, topPercent: 68 },
  { date: 'Tue, Oct 28', sales: 21200, orders: 13, svgX: 588, svgY: 132, leftPercent: 90.5, topPercent: 68 },
  { date: 'Fri, Oct 31', sales: 21900, orders: 14, svgX: 650, svgY: 132, leftPercent: 97.0, topPercent: 68 },
];

const weeklySalesPoints: SalesChartPoint[] = [
  { date: 'Week 1 (Oct 1–7)', sales: 48200, orders: 172, svgX: 110, svgY: 130, leftPercent: 17, topPercent: 67 },
  { date: 'Week 2 (Oct 8–14)', sales: 52400, orders: 185, svgX: 260, svgY: 120, leftPercent: 40, topPercent: 62 },
  { date: 'Week 3 (Oct 15–21)', sales: 78600, orders: 260, svgX: 440, svgY: 50, leftPercent: 68, topPercent: 35 },
  { date: 'Week 4 (Oct 22–31)', sales: 70800, orders: 276, svgX: 580, svgY: 75, leftPercent: 89, topPercent: 45 },
];

const monthlySalesPoints: SalesChartPoint[] = [
  { date: 'August 2026', sales: 195000, orders: 680, svgX: 150, svgY: 100, leftPercent: 23, topPercent: 55 },
  { date: 'September 2026', sales: 210000, orders: 740, svgX: 380, svgY: 60, leftPercent: 58, topPercent: 38 },
  { date: 'October 2026', sales: 250000, orders: 893, svgX: 600, svgY: 20, leftPercent: 92, topPercent: 22 },
];

export default function DashboardPage() {
  const { user, orders, products, addStock, addToast } = useStore();

  const [timeView, setTimeView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 1 – Oct 31, 2026');
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState<SalesChartPoint | null>(null);

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  // Confirmed orders (non-draft, non-cancelled) added by user in this session (beyond initial mock data)
  const userAddedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.status !== 'Draft' &&
        o.status !== 'Cancelled' &&
        !o.id.startsWith('ord-00000') &&
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
    { name: 'Cash', amount: 145000, share: 58, color: '#0F1E36' },
    { name: 'Bank Transfer', amount: 80000, share: 32, color: '#10B981' },
    { name: 'Check', amount: 25000, share: 10, color: '#8A99AD' },
  ];

  // Top Selling Products matching Figma 02.01 exactly
  const topSellingProducts = [
    {
      rank: 1,
      name: 'Organic Wildflower Honey 350ml',
      category: 'Pantry & Essentials',
      qtySold: '14',
      price: 450.0,
      totalAmount: 6300.0,
      share: 35,
    },
    {
      rank: 2,
      name: 'Artisan Cold Brew Coffee 330ml',
      category: 'Beverages',
      qtySold: '25',
      price: 140.0,
      totalAmount: 3500.0,
      share: 19,
    },
    {
      rank: 3,
      name: 'Butter Croissant (Box of 4)',
      category: 'Bakery & Pastries',
      qtySold: '10',
      price: 260.0,
      totalAmount: 2600.0,
      share: 15,
    },
    {
      rank: 4,
      name: 'Salted Caramel Macarons',
      category: 'Snacks & Confectionery',
      qtySold: '7',
      price: 320.0,
      totalAmount: 2240.0,
      share: 12,
    },
    {
      rank: 5,
      name: 'Matcha Green Tea Latte 500ml',
      category: 'Beverages',
      qtySold: '10',
      price: 180.0,
      totalAmount: 1800.0,
      share: 10,
    },
  ];

  // Low Stock Products matching earlier items
  const lowStockList = [
    {
      id: 'prod-2',
      sku: 'BEV-002',
      name: 'Matcha Green Tea Latte...',
      min: 12,
      unitsLeft: 0,
      badgeColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'prod-4',
      sku: 'BAK-002',
      name: 'Sourdough Country Loaf...',
      min: 10,
      unitsLeft: 4,
      badgeColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'prod-7',
      sku: 'DAI-001',
      name: 'Imported Gouda Cheese...',
      min: 10,
      unitsLeft: 0,
      badgeColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      id: 'prod-3',
      sku: 'BAK-001',
      name: 'Butter Croissant (Box of 4)',
      min: 10,
      unitsLeft: 5,
      badgeColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'prod-5',
      sku: 'SNK-001',
      name: 'Salted Caramel Macarons...',
      min: 8,
      unitsLeft: 6,
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
            Create Order
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Row (Figma 02.01 exact matching) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            {/* Custom SVG: 3 pill bars + diagonal curved arrow matching Figma */}
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 14C7 11 11 6 19 5" />
                <path d="M15 5h4v4" />
                <rect x="5" y="16" width="2.5" height="5" rx="1.2" fill="currentColor" stroke="none" />
                <rect x="10.5" y="13" width="2.5" height="8" rx="1.2" fill="currentColor" stroke="none" />
                <rect x="16" y="9" width="2.5" height="12" rx="1.2" fill="currentColor" stroke="none" />
              </svg>
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
            {/* Boxes icon (3 isometric cubes arranged in triangle matching Figma) */}
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <Boxes className="w-4 h-4 text-white" />
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
            {/* Custom SVG: Stack of Banknotes / paper cash bills matching Figma */}
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <svg
                className="w-4.5 h-4.5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="11" rx="2" />
                <circle cx="12" cy="9.5" r="2" />
                <path d="M6 9.5h.01M18 9.5h.01" />
                <path d="M5 18h14" />
                <path d="M3 21h18" />
              </svg>
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
            {/* Shopping Cart matching Figma */}
            <div className="w-8 h-8 rounded-lg bg-[#0F1E36] text-white flex items-center justify-center shrink-0">
              <ShoppingCart className="w-4 h-4 text-white stroke-[2]" />
            </div>
            <span className="text-xs font-medium text-slate-500">Number of Orders</span>
          </div>
          <p className="text-2xl font-bold text-[#0F1E36] tracking-tight">
            {metrics.orderCount}
          </p>
        </div>
      </div>

      {/* Row 2: Sales Overview Chart (2 cols) & (Payment Status + Payment Methods) (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Sales Overview Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#0F1E36]">Sales Overview</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {timeView === 'Daily'
                  ? 'Daily revenue, October 2026'
                  : timeView === 'Weekly'
                  ? 'Weekly revenue, October 2026'
                  : 'Monthly revenue, 2026'}
              </p>
            </div>

            {/* Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => {
                    setTimeView(view);
                    setHoveredSalesPoint(null);
                  }}
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
          <div className="relative w-full flex-1 min-h-[230px] flex flex-col justify-between select-none pt-4">
            {/* Floating Tooltip - only rendered when hovered */}
            {hoveredSalesPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 transition-all duration-75 ease-out"
                style={{
                  left: `${hoveredSalesPoint.leftPercent}%`,
                  top: `${hoveredSalesPoint.topPercent}%`,
                }}
              >
                <div className="bg-[#0F1E36] text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-800 text-center w-28">
                  <p className="text-[10px] text-slate-300">{hoveredSalesPoint.date}</p>
                  <p className="text-xs font-bold text-white mt-0.5">{formatCurrency(hoveredSalesPoint.sales)}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{hoveredSalesPoint.orders} orders</p>
                </div>
              </div>
            )}

            <svg
              viewBox="0 0 650 180"
              className="w-full h-full overflow-visible cursor-crosshair"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const svgX = (mouseX / rect.width) * 650;
                const points =
                  timeView === 'Weekly'
                    ? weeklySalesPoints
                    : timeView === 'Monthly'
                    ? monthlySalesPoints
                    : dailySalesPoints;
                let closest = points[0];
                let minDiff = Math.abs(closest.svgX - svgX);
                for (const pt of points) {
                  const diff = Math.abs(pt.svgX - svgX);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closest = pt;
                  }
                }
                setHoveredSalesPoint(closest);
              }}
              onMouseLeave={() => setHoveredSalesPoint(null)}
            >
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

              {/* Smooth Spline Curve matching Figma based on timeView */}
              {timeView === 'Weekly' ? (
                <>
                  <path
                    d="M 35 140 C 120 135, 180 130, 260 120 C 340 105, 380 60, 440 50 C 500 42, 530 65, 580 75 C 610 82, 630 85, 650 85 L 650 172 L 35 172 Z"
                    fill="url(#figmaChartGrad)"
                  />
                  <path
                    d="M 35 140 C 120 135, 180 130, 260 120 C 340 105, 380 60, 440 50 C 500 42, 530 65, 580 75 C 610 82, 630 85, 650 85"
                    fill="none"
                    stroke="#0F1E36"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : timeView === 'Monthly' ? (
                <>
                  <path
                    d="M 35 110 C 160 100, 260 90, 380 60 C 470 38, 540 25, 600 20 C 625 18, 640 16, 650 15 L 650 172 L 35 172 Z"
                    fill="url(#figmaChartGrad)"
                  />
                  <path
                    d="M 35 110 C 160 100, 260 90, 380 60 C 470 38, 540 25, 600 20 C 625 18, 640 16, 650 15"
                    fill="none"
                    stroke="#0F1E36"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M 35 132 L 280 132 C 300 132, 320 110, 335 70 C 348 38, 360 35, 370 40 C 385 48, 400 85, 420 95 C 438 104, 452 75, 470 30 C 478 14, 483 12, 486 12 C 492 12, 498 30, 508 65 C 520 105, 532 132, 548 132 L 650 132 L 650 172 L 35 172 Z"
                    fill="url(#figmaChartGrad)"
                  />
                  <path
                    d="M 35 132 L 280 132 C 300 132, 320 110, 335 70 C 348 38, 360 35, 370 40 C 385 48, 400 85, 420 95 C 438 104, 452 75, 470 30 C 478 14, 483 12, 486 12 C 492 12, 498 30, 508 65 C 520 105, 532 132, 548 132 L 650 132"
                    fill="none"
                    stroke="#0F1E36"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {/* Active hover dot & guideline, or peak dot when not hovered */}
              {hoveredSalesPoint ? (
                <>
                  <line
                    x1={hoveredSalesPoint.svgX}
                    y1={hoveredSalesPoint.svgY}
                    x2={hoveredSalesPoint.svgX}
                    y2="172"
                    stroke="#CBD5E1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={hoveredSalesPoint.svgX}
                    cy={hoveredSalesPoint.svgY}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke="#0F1E36"
                    strokeWidth="2.5"
                  />
                </>
              ) : timeView === 'Daily' ? (
                /* Peak indicator dot on Day 23 */
                <circle
                  cx="486"
                  cy="12"
                  r="4.5"
                  fill="#FFFFFF"
                  stroke="#0F1E36"
                  strokeWidth="2.5"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredSalesPoint(dailySalesPoints.find((p) => p.date === 'Thu, Oct 23') || null)
                  }
                />
              ) : null}
            </svg>

            {/* X-axis labels matching Figma 02.01 */}
            {timeView === 'Weekly' ? (
              <div className="flex justify-around text-[11px] font-medium text-slate-400 mt-2 pl-7 pr-1">
                <span>Week 1 (Oct 1–7)</span>
                <span>Week 2 (Oct 8–14)</span>
                <span>Week 3 (Oct 15–21)</span>
                <span>Week 4 (Oct 22–31)</span>
              </div>
            ) : timeView === 'Monthly' ? (
              <div className="flex justify-around text-[11px] font-medium text-slate-400 mt-2 pl-7 pr-1">
                <span>August 2026</span>
                <span>September 2026</span>
                <span>October 2026</span>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Right Column: Payment Status & Payment Methods */}
        <div className="flex flex-col justify-between gap-6 h-full">
          {/* Payment Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 flex-1 flex flex-col justify-between">
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
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 flex-1 flex flex-col justify-between">
            <h2 className="text-sm font-bold text-[#0F1E36]">Payment Methods</h2>

            <div className="flex items-center gap-6">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {/* Cash: 58% (Dark Navy #0F1E36) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#0F1E36"
                    strokeWidth="11"
                    strokeDasharray="142 109"
                    strokeDashoffset="-2"
                  />
                  {/* Bank Transfer: 32% (Green #10B981) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="11"
                    strokeDasharray="77 174"
                    strokeDashoffset="-148"
                  />
                  {/* Check: 10% (Slate/Gray #8A99AD) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8A99AD"
                    strokeWidth="11"
                    strokeDasharray="22 229"
                    strokeDashoffset="-228"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                  <span className="text-[10px] text-slate-400 font-medium">Total</span>
                  <span className="text-sm font-bold text-[#0F1E36] leading-none mt-0.5">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Top Selling Products Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 h-full flex flex-col justify-between">
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
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 h-full flex flex-col justify-between">
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
