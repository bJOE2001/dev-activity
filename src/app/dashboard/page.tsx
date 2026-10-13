'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Product } from '@/lib/types';
import { AddStockModal } from '@/components/modals/AddStockModal';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, orders, products, addStock, addToast } = useStore();

  const [timeView, setTimeView] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [selectedPeriod, setSelectedPeriod] = useState('Oct 1 – Oct 31, 2026');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{
    date: string;
    sales: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);

  // Compute metrics from non-cancelled, non-draft orders
  const confirmedOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Draft' && o.status !== 'Cancelled');
  }, [orders]);

  const metrics = useMemo(() => {
    const totalSales = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

    // Compute cost from items
    const totalCost = confirmedOrders.reduce((sum, o) => {
      const orderCost = o.items.reduce((iSum, i) => iSum + i.cost * i.quantity, 0);
      return sum + orderCost;
    }, 0);

    const totalNetSales = totalSales - totalCost;
    const orderCount = confirmedOrders.length;

    return { totalSales, totalCost, totalNetSales, orderCount };
  }, [confirmedOrders]);

  // Payment Status Breakdown
  const paymentBreakdown = useMemo(() => {
    const statuses = ['Paid', 'Partial', 'Unpaid', 'Overdue'] as const;
    const totalRevenue = metrics.totalSales || 1;

    return statuses.map((st) => {
      const matched = confirmedOrders.filter((o) => o.status === st);
      const amount = matched.reduce((sum, o) => sum + o.total, 0);
      const count = matched.length;
      const share = (amount / totalRevenue) * 100;
      return {
        status: st,
        count,
        amount,
        share: Math.min(100, Math.max(0, share)),
      };
    });
  }, [confirmedOrders, metrics.totalSales]);

  // Payment Methods Distribution (Cash, Bank Transfer, Check)
  const paymentMethodsData = useMemo(() => {
    let cash = 0;
    let bank = 0;
    let check = 0;

    confirmedOrders.forEach((o) => {
      o.payments.forEach((p) => {
        if (p.method === 'Cash') cash += p.amount;
        else if (p.method === 'Bank Transfer') bank += p.amount;
        else if (p.method === 'Check') check += p.amount;
      });
    });

    const totalCollected = cash + bank + check;
    const safeTotal = totalCollected || 1;

    const rawMethods = [
      { name: 'Bank Transfer', amount: bank, share: (bank / safeTotal) * 100, color: '#2563EB' },
      { name: 'Cash', amount: cash, share: (cash / safeTotal) * 100, color: '#10B981' },
      { name: 'Check', amount: check, share: (check / safeTotal) * 100, color: '#F59E0B' },
    ];

    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let accumulated = 0;
    const segments = rawMethods.map((m) => {
      const percent = m.amount / safeTotal;
      const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
      const strokeDashoffset = -circumference * accumulated;
      accumulated += percent;
      return {
        ...m,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return {
      totalCollected,
      methods: rawMethods,
      segments,
    };
  }, [confirmedOrders]);

  // Top Selling Products (Top 5)
  const topSellingProducts = useMemo(() => {
    const productStats: Record<
      string,
      {
        id: string;
        name: string;
        categoryName: string;
        imageUrl: string;
        qtySold: number;
        price: number;
        totalAmount: number;
      }
    > = {};

    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productStats[item.productId]) {
          productStats[item.productId] = {
            id: item.productId,
            name: item.productName,
            categoryName: 'General',
            imageUrl: item.imageUrl,
            qtySold: 0,
            price: item.unitPrice,
            totalAmount: 0,
          };
        }
        productStats[item.productId].qtySold += item.quantity;
        productStats[item.productId].totalAmount += item.lineTotal;
      });
    });

    // Match category names from current products catalog
    Object.keys(productStats).forEach((prodId) => {
      const p = products.find((prod) => prod.id === prodId);
      if (p) {
        productStats[prodId].categoryName = p.categoryName;
      }
    });

    const totalRevenue = metrics.totalSales || 1;
    return Object.values(productStats)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5)
      .map((item, idx) => ({
        rank: idx + 1,
        ...item,
        share: (item.totalAmount / totalRevenue) * 100,
      }));
  }, [confirmedOrders, products, metrics.totalSales]);

  // Low Stock Products
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stockOnHand <= p.lowStockAlert);
  }, [products]);

  // Top Categories Bar Chart
  const topCategories = useMemo(() => {
    const catSales: Record<string, number> = {};

    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.categoryName || 'Other';
        catSales[cat] = (catSales[cat] || 0) + item.lineTotal;
      });
    });

    const maxSale = Math.max(...Object.values(catSales), 1);
    return Object.entries(catSales)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / maxSale) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [confirmedOrders, products]);

  // Daily Revenue Chart Points (Oct 1 to Oct 15)
  const chartData = useMemo(() => {
    // Generate dates for October 2026
    const days = [
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
      '2026-10-12',
      '2026-10-13',
    ];

    return days.map((dateStr) => {
      const ordersOnDate = confirmedOrders.filter((o) => o.orderDate === dateStr);
      const sales = ordersOnDate.reduce((sum, o) => sum + o.total, 0);
      const count = ordersOnDate.length;
      const label = formatDate(dateStr).split(',')[0];
      return { date: dateStr, label, sales, count };
    });
  }, [confirmedOrders]);

  // CSV Export for Dashboard
  const handleExport = () => {
    const headers = ['Order Number', 'Date', 'Customer', 'Status', 'Payment Type', 'Total'];
    const rows = confirmedOrders.map((o) => [
      o.orderNumber,
      o.orderDate,
      `"${o.customerName}"`,
      o.status,
      o.paymentType,
      o.total.toFixed(2),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales-summary-${selectedPeriod.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Dashboard Exported', 'CSV summary downloaded.');
  };

  return (
    <div className="space-y-7 max-w-7xl mx-auto">
      {/* Header with Greeting & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Good morning, {user.firstName} —
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            here&apos;s how your store is performing this month.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="Oct 1 – Oct 31, 2026">Oct 1 – Oct 31, 2026</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <Link
            href="/orders/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Order
          </Link>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Sales
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(metrics.totalSales)}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +14.2% from last month
            </p>
          </div>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Cost
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(metrics.totalCost)}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Estimated inventory cost
            </p>
          </div>
        </div>

        {/* Total Net Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Net Sales
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-600">
              {formatCurrency(metrics.totalNetSales)}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              Gross profit margin: {metrics.totalSales > 0 ? ((metrics.totalNetSales / metrics.totalSales) * 100).toFixed(1) : '0'}%
            </p>
          </div>
        </div>

        {/* Number of Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Number of Orders
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              {metrics.orderCount}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Processed this period
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Sales Overview & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Sales Overview</h2>
              <p className="text-xs text-slate-500">Daily revenue and order velocity</p>
            </div>
            {/* Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setTimeView(view)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    timeView === view
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative w-full h-64 select-none">
            {hoveredDataPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800"
                style={{ left: `${hoveredDataPoint.x}%`, top: `${hoveredDataPoint.y}%` }}
              >
                <p className="font-semibold">{formatDate(hoveredDataPoint.date)}</p>
                <p className="text-emerald-400 font-bold">{formatCurrency(hoveredDataPoint.sales)}</p>
                <p className="text-slate-300 text-[10px]">{hoveredDataPoint.count} orders</p>
              </div>
            )}

            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="#E2E8F0" strokeWidth="1" />

              {/* Generate path from chartData */}
              {(() => {
                const maxVal = Math.max(...chartData.map((d) => d.sales), 5000);
                const points = chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 580 + 10;
                  const y = 180 - (d.sales / maxVal) * 150;
                  return { ...d, px: x, py: y, xPct: (x / 600) * 100, yPct: (y / 200) * 100 };
                });

                const pathD = points.reduce(
                  (acc, p, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${p.px} ${p.py}`,
                  ''
                );
                const areaD = `${pathD} L ${points[points.length - 1].px} 190 L ${points[0].px} 190 Z`;

                return (
                  <>
                    <path d={areaD} fill="url(#salesGrad)" />
                    <path d={pathD} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r="4"
                          className="fill-white stroke-blue-600 stroke-[2.5] hover:r-6 cursor-pointer transition-all"
                          onMouseEnter={() =>
                            setHoveredDataPoint({
                              date: p.date,
                              sales: p.sales,
                              count: p.count,
                              x: p.xPct,
                              y: p.yPct,
                            })
                          }
                          onMouseLeave={() => setHoveredDataPoint(null)}
                        />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-2 px-1">
              <span>Oct 1</span>
              <span>Oct 4</span>
              <span>Oct 7</span>
              <span>Oct 10</span>
              <span>Oct 13</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Donut Chart (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Payment Methods</h2>
            <p className="text-xs text-slate-500">Distribution for selected period</p>
          </div>

          {/* Donut Chart with period total in center */}
          <div className="relative flex items-center justify-center my-4">
            <svg viewBox="0 0 160 160" className="w-44 h-44 -rotate-90">
              {paymentMethodsData.segments.map((m, idx) => (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r={60}
                  fill="transparent"
                  stroke={m.color}
                  strokeWidth="20"
                  strokeDasharray={m.strokeDasharray}
                  strokeDashoffset={m.strokeDashoffset}
                  className="transition-all duration-300"
                />
              ))}
            </svg>

            {/* Period Total in Centre */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Collected
              </span>
              <span className="text-sm font-extrabold text-slate-900 leading-tight">
                {formatCurrency(paymentMethodsData.totalCollected)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            {paymentMethodsData.methods.map((m) => (
              <div key={m.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="font-medium text-slate-700">{m.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-900">{formatCurrency(m.amount)}</span>
                  <span className="text-slate-400 ml-1.5 text-[11px]">({m.share.toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Payment Status Breakdown & Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Payment Status Breakdown</h2>
              <p className="text-xs text-slate-500">
                Total Orders: <strong className="text-slate-900">{metrics.orderCount}</strong>
              </p>
            </div>
            <Link
              href="/orders"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Orders
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {paymentBreakdown.map((item) => {
              let barColor = 'bg-slate-900';
              if (item.status === 'Paid') barColor = 'bg-emerald-500';
              if (item.status === 'Unpaid') barColor = 'bg-amber-500';
              if (item.status === 'Overdue') barColor = 'bg-rose-500';

              return (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 font-semibold">{item.status}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">{item.count} orders</span>
                      <span className="font-bold text-slate-900">{formatCurrency(item.amount)}</span>
                      <span className="text-slate-400 text-[11px]">({item.share.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Categories Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Categories</h2>
              <p className="text-xs text-slate-500">Sales volume per product category</p>
            </div>
            <Link
              href="/reports/sales"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View report
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {topCategories.slice(0, 4).map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate">{cat.name}</span>
                  <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>Real-time inventory categories</span>
            <Link href="/categories" className="text-slate-600 hover:text-slate-900 font-medium">
              Manage Categories →
            </Link>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products & Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Selling Products</h2>
              <p className="text-xs text-slate-500">Best performers by revenue this month (Top 5)</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              Show 5
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-right">Qty Sold</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  topSellingProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-3 text-center text-xs font-bold text-slate-400">
                        {p.rank}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] font-bold">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{p.categoryName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-semibold text-slate-700">
                        {p.qtySold}
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-600">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3 px-3 text-right text-xs font-bold text-slate-900">
                        {formatCurrency(p.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right text-xs text-slate-500 font-medium">
                        {p.share.toFixed(1)}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products Alert Widget (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Low Stock Alert</h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Products at or below low stock alert threshold
            </p>

            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                  All inventory healthy. No low stock alerts!
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono bg-white px-1 py-0.2 rounded border border-rose-200/60 text-slate-700">
                          {p.sku}
                        </span>
                        <span>•</span>
                        <span>Min: {p.lowStockAlert}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 mb-1">
                        {p.stockOnHand} left
                      </span>
                      <div>
                        <button
                          type="button"
                          onClick={() => setRestockProduct(p)}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 underline block ml-auto"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link
              href="/reports/inventory"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              Full Inventory Health Report
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Restock Modal */}
      {restockProduct && (
        <AddStockModal
          isOpen={!!restockProduct}
          onClose={() => setRestockProduct(null)}
          product={restockProduct}
          onAddStock={(productId, qty) => addStock(productId, qty)}
        />
      )}
    </div>
  );
}
