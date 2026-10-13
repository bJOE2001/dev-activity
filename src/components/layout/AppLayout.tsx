'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  FolderTree,
  BarChart3,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Plus,
  Boxes,
  SlidersHorizontal,
} from 'lucide-react';
import { ToastContainer } from '@/components/ui/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productGroupOpen, setProductGroupOpen] = useState(true);
  const [reportsGroupOpen, setReportsGroupOpen] = useState(true);

  // If on login page, don't show the dashboard shell
  if (pathname === '/login') {
    return (
      <main className="min-h-screen bg-slate-50">
        {children}
        <ToastContainer />
      </main>
    );
  }

  // Redirect to login if unauthenticated
  if (!isAuthenticated && typeof window !== 'undefined') {
    router.replace('/login');
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isNavActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/dashboard' || pathname === '/')) return true;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
            DA
          </div>
          <span className="font-bold text-base tracking-tight">Dev Activity</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-950 text-slate-200 border-r border-slate-900 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-extrabold text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-tight">Dev Activity</h1>
              <p className="text-[11px] font-medium text-slate-400">Sales & Inventory</p>
            </div>
          </Link>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
            v1.0
          </span>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/dashboard')
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/orders')
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            Order List
          </Link>

          {/* Customers */}
          <Link
            href="/customers"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/customers')
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Customer List
          </Link>

          {/* Product Group (Collapsible) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setProductGroupOpen(!productGroupOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5" />
                Product
              </span>
              {productGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {productGroupOpen && (
              <div className="ml-3 pl-3 border-l border-slate-800 space-y-1 mt-1">
                <Link
                  href="/products"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/products'
                      ? 'bg-blue-600/90 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Package className="w-4 h-4 shrink-0" />
                  Product List
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/categories'
                      ? 'bg-blue-600/90 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FolderTree className="w-4 h-4 shrink-0" />
                  Categories
                </Link>
              </div>
            )}
          </div>

          {/* Reports Group (Collapsible) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setReportsGroupOpen(!reportsGroupOpen)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition"
            >
              <span className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5" />
                Reports
              </span>
              {reportsGroupOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {reportsGroupOpen && (
              <div className="ml-3 pl-3 border-l border-slate-800 space-y-1 mt-1">
                <Link
                  href="/reports/sales"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/reports/sales'
                      ? 'bg-blue-600/90 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 shrink-0" />
                  Sales Report
                </Link>
                <Link
                  href="/reports/inventory"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname === '/reports/inventory'
                      ? 'bg-blue-600/90 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 shrink-0" />
                  Inventory Report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer with User Details & Logout */}
        <div className="p-3 border-t border-slate-900 bg-slate-950/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
            <Link
              href="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90 transition group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold text-xs shrink-0 group-hover:border-blue-400">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {user.role}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-1 shrink-0 ml-1">
              <Link
                href="/profile"
                title="Manage Profile"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Dev Activity System
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Ateb Venue · Oct 2026
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/orders/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              + Create Order
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-2 pl-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition"
            >
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-700">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <span className="font-semibold">{user.firstName}</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
