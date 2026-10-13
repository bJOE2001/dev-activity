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
  PanelLeftClose,
  PanelLeft,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white text-xs shadow-xs">
            DA
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">Dev Activity</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Clean White matching Figma) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } bg-white text-slate-800 border-r border-slate-200/90 flex flex-col transition-all duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              DA
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-sm text-slate-900 tracking-tight truncate">
                Dev Activity
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Dashboard */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            title="Dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/dashboard')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Orders */}
          <Link
            href="/orders"
            onClick={() => setSidebarOpen(false)}
            title="Order List"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/orders')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Order List</span>}
          </Link>

          {/* Customers */}
          <Link
            href="/customers"
            onClick={() => setSidebarOpen(false)}
            title="Customer List"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isNavActive('/customers')
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            {!sidebarCollapsed && <span>Customer List</span>}
          </Link>

          {/* Product Group (Collapsible) */}
          <div className="pt-2">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setProductGroupOpen(!productGroupOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Package className="w-4 h-4 text-slate-500" />
                  Product
                </span>
                {productGroupOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            ) : (
              <Link
                href="/products"
                title="Product List"
                className={`flex items-center justify-center p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 ${
                  pathname.startsWith('/products') ? 'bg-slate-100 text-slate-900' : ''
                }`}
              >
                <Package className="w-4 h-4" />
              </Link>
            )}

            {!sidebarCollapsed && productGroupOpen && (
              <div className="ml-3 pl-3 border-l border-slate-200 space-y-0.5 mt-1">
                <Link
                  href="/products"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    pathname === '/products'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  Product List
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    pathname === '/categories'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5 shrink-0" />
                  Categories
                </Link>
              </div>
            )}
          </div>

          {/* Reports Group (Collapsible) */}
          <div className="pt-2">
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setReportsGroupOpen(!reportsGroupOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                <span className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-slate-500" />
                  Reports
                </span>
                {reportsGroupOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            ) : (
              <Link
                href="/reports/sales"
                title="Sales Report"
                className={`flex items-center justify-center p-2.5 rounded-xl text-slate-600 hover:bg-slate-50 ${
                  pathname.startsWith('/reports') ? 'bg-slate-100 text-slate-900' : ''
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </Link>
            )}

            {!sidebarCollapsed && reportsGroupOpen && (
              <div className="ml-3 pl-3 border-l border-slate-200 space-y-0.5 mt-1">
                <Link
                  href="/reports/sales"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    pathname === '/reports/sales'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  Sales Report
                </Link>
                <Link
                  href="/reports/inventory"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    pathname === '/reports/inventory'
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  Inventory Report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer with User Details & Logout (Figma matching) */}
        <div className="p-3 border-t border-slate-200/90 bg-white">
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
            <Link
              href="/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-blue-600">
                    {user.firstName} {user.lastName}
                  </p>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {user.role}
                  </span>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar for Desktop */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 hidden md:flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
              Dev Activity
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-medium">
              Sales & Inventory Management
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/orders/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-2xs"
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
              <span className="font-semibold text-xs">{user.firstName}</span>
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
