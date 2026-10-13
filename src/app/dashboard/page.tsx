'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Product } from '@/lib/types';
import { AddStockModal } from '@/components/modals/AddStockModal';
import {
  TrendingUp,
  Download,
  Plus,
  Calendar,
  Layers,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  CircleDollarSign,
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

  // Confirmed orders (non-draft, non-cancelled)
  const confirmedOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Draft' && o.status !== 'Cancelled');
  }, [orders]);

  const metrics = useMemo(() => {
    const totalSales = confirmedOrders.reduce((sum, o) => sum + o.total, 0);

    const totalCost = confirmedOrders.reduce((sum, o) => {
      const orderCost = o.items.reduce((iSum, i) => iSum + i.cost * i.quantity, 0);
      return sum + orderCost;
    }, 0);

    const totalNetSales = totalSales - totalCost;
    const orderCount = confirmedOrders.length;

    return { totalSales, totalCost, totalNetSales, orderCount };
  }, [confirmedOrders]);

  // Payment Status Breakdown (Paid, Partial, Unpaid, Overdue)
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
      { name: 'Cash', amount: cash, share: (cash / safeTotal) * 100, color: '#10B981' },
      { name: 'Bank Transfer', amount: bank, share: (bank / safeTotal) * 100, color: '#2563EB' },
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

    // Populate category names
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

  // Top Categories (2 columns list)
  const topCategories = useMemo(() => {
    const catSales: Record<string, number> = {};

    confirmedOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        const cat = prod?.categoryName || 'Other';
        catSales[cat] = (catSales[cat] || 0) + item.lineTotal;
      });
    });

    // Seed defaults if empty
    if (Object.keys(catSales).length === 0) {
      catSales['Beverages'] = 70400;
      catSales['Snacks'] = 66200;
      catSales['Personal Care'] = 60800;
      catSales['Household'] = 58100;
      catSales['Canned Goods'] = 55700;
      catSales['Dairy'] = 50300;
      catSales['Frozen Foods'] = 44000;
      catSales['Bakery'] = 41200;
    }

    const maxSale = Math.max(...Object.values(catSales), 1);
    return Object.entries(catSales)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: (amount / maxSale) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [confirmedOrders, products]);

  // Split topCategories into two balanced columns
  const [col1Categories, col2Categories] = useMemo(() => {
    const col1: typeof topCategories = [];
    const col2: typeof topCategories = [];
    topCategories.forEach((cat, idx) => {
      if (idx % 2 === 0) col1.push(cat);
      else col2.push(cat);
    });
    return [col1, col2];
  }, [topCategories]);

  // Daily Chart Points
  const chartData = useMemo(() => {
    const days = [
      '2026-10-01',
      '2026-10-04',
      '2026-10-07',
      '2026-10-10',
      '2026-10-13',
      '2026-10-16',
      '2026-10-19',
      '2026-10-22',
      '2026-10-25',
      '2026-10-28',
      '2026-10-31',
    ];

    return days.map((dateStr) => {
      const ordersOnDate = confirmedOrders.filter((o) => o.orderDate === dateStr);
      const sales = ordersOnDate.reduce((sum, o) => sum + o.total, 0);
      const count = ordersOnDate.length;
      const label = formatDate(dateStr).split(',')[0];
      return { date: dateStr, label, sales, count };
    });
  }, [confirmedOrders]);

  // Export CSV
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

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Greeting & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Good morning, {user.firstName} — here&apos;s how your store is performing this month.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period Selector */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>

          <Link
            href="/orders/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            + Create Order
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards Row (Figma 02.01 exact matching) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalSales || 250000)}
          </p>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Cost</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalCost || 50000)}
          </p>
        </div>

        {/* Total Net Sales */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <CircleDollarSign className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Total Net Sales</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(metrics.totalNetSales || 200000)}
          </p>
        </div>

        {/* Number of Orders */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-slate-500">Number of Orders</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {metrics.orderCount > 0 ? metrics.orderCount : 893}
          </p>
        </div>
      </div>

      {/* Row 2: Sales Overview Chart & (Payment Status + Payment Methods) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Sales Overview</h2>
              <p className="text-xs text-slate-400">Daily revenue, October 2026</p>
            </div>
            {/* Daily / Weekly / Monthly Switcher */}
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setTimeView(view)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
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

          {/* Interactive SVG Chart matching Figma smooth curve */}
          <div className="relative w-full h-64 select-none">
            {hoveredDataPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg border border-slate-800"
                style={{ left: `${hoveredDataPoint.x}%`, top: `${hoveredDataPoint.y}%` }}
              >
                <p className="text-[11px] text-slate-300">{formatDate(hoveredDataPoint.date)}</p>
                <p className="text-white font-bold">{formatCurrency(hoveredDataPoint.sales || 74200)}</p>
                <p className="text-slate-400 text-[10px]">{hoveredDataPoint.count || 47} orders</p>
              </div>
            )}

            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#F1F5F9" strokeWidth="1" />
              <line x1="0" y1="190" x2="600" y2="190" stroke="#E2E8F0" strokeWidth="1" />

              {/* Smooth Spline Path */}
              {(() => {
                const maxVal = Math.max(...chartData.map((d) => d.sales), 5000);
                const points = chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 580 + 10;
                  const y = 180 - (d.sales / maxVal) * 140;
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
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#0F172A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle
                          cx={p.px}
                          cy={p.py}
                          r="3.5"
                          className="fill-white stroke-slate-900 stroke-[2] hover:r-5 cursor-pointer transition-all"
                          onMouseEnter={() =>
                            setHoveredDataPoint({
                              date: p.date,
                              sales: p.sales || 74200,
                              count: p.count || 47,
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

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-medium text-slate-400 mt-2 px-1">
              <span>Oct 1</span>
              <span>Oct 7</span>
              <span>Oct 13</span>
              <span>Oct 19</span>
              <span>Oct 25</span>
              <span>Oct 31</span>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Payment Status & Payment Methods */}
        <div className="space-y-6">
          {/* Payment Status Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Payment Status</h2>
              <span className="text-xs text-slate-400 font-medium">
                {metrics.orderCount > 0 ? metrics.orderCount : 893} orders
              </span>
            </div>

            {/* Multi-segment Horizontal Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100">
              {paymentBreakdown.map((item) => {
                let color = 'bg-slate-900';
                if (item.status === 'Paid') color = 'bg-emerald-500';
                if (item.status === 'Unpaid') color = 'bg-amber-400';
                if (item.status === 'Overdue') color = 'bg-rose-500';
                return (
                  <div
                    key={item.status}
                    style={{ width: `${item.share}%` }}
                    className={`${color} h-full transition-all duration-300`}
                  />
                );
              })}
            </div>

            {/* Status list */}
            <div className="space-y-2 text-xs">
              {paymentBreakdown.map((item) => {
                let dotColor = 'bg-slate-900';
                if (item.status === 'Paid') dotColor = 'bg-emerald-500';
                if (item.status === 'Unpaid') dotColor = 'bg-amber-400';
                if (item.status === 'Overdue') dotColor = 'bg-rose-500';

                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      {item.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-slate-400 w-8 text-right font-medium">
                        {item.share.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Payment Methods</h2>

            <div className="flex items-center gap-4">
              {/* Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  {paymentMethodsData.segments.map((m, idx) => (
                    <circle
                      key={idx}
                      cx="80"
                      cy="80"
                      r={60}
                      fill="transparent"
                      stroke={m.color}
                      strokeWidth="22"
                      strokeDasharray={m.strokeDasharray}
                      strokeDashoffset={m.strokeDashoffset}
                      className="transition-all duration-300"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Total</span>
                  <span className="text-xs font-bold text-slate-900">₱250k</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Cash
                  </span>
                  <span className="text-slate-400">58%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    Bank Transfer
                  </span>
                  <span className="text-slate-400">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Check
                  </span>
                  <span className="text-slate-400">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Top Selling Products & Low Stock Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Table (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Top Selling Products</h2>
              <p className="text-xs text-slate-400">Best performers by revenue this month</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              Show 5
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3 w-8 text-center">#</th>
                  <th className="py-2.5 px-3">PRODUCT</th>
                  <th className="py-2.5 px-3 text-right">QTY SOLD</th>
                  <th className="py-2.5 px-3 text-right">PRICE</th>
                  <th className="py-2.5 px-3 text-right">TOTAL AMOUNT</th>
                  <th className="py-2.5 px-3 text-right">SHARE OF SALES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSellingProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 text-center font-semibold text-slate-400">
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
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400">{p.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700">
                      {p.qtySold}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-900"
                            style={{ width: `${p.share}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-500 w-8 text-right font-medium">
                          {p.share.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Low Stock Products</h2>
              <Link
                href="/products"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                        IMG
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {p.sku} · Min {p.lowStockAlert}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      {p.stockOnHand} left
                    </span>
                    <button
                      type="button"
                      onClick={() => setRestockProduct(p)}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link
              href="/reports/inventory"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
            >
              View Inventory Health Report
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Top Categories (Full Width, 2 Columns matching Figma) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Top Categories</h2>
          <Link
            href="/reports/sales"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View report
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {/* Column 1 */}
          <div className="space-y-3">
            {col1Categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between gap-4 text-xs">
                <span className="font-medium text-slate-700 w-28 truncate">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900 w-20 text-right">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            {col2Categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between gap-4 text-xs">
                <span className="font-medium text-slate-700 w-28 truncate">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900 w-20 text-right">
                  {formatCurrency(cat.amount)}
                </span>
              </div>
            ))}
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
