'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import {
  ClipboardList,
  User,
  ShoppingBag,
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FolderTree,
  FileSpreadsheet,
} from 'lucide-react';
import { ToastContainer } from '@/components/ui/ToastContainer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useStore();

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [productGroupOpen, setProductGroupOpen] = useState(false);
  const [reportsGroupOpen, setReportsGroupOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // If on login page, don't show the dashboard shell
  if (pathname === '/login') {
    return (
      <main className="min-h-screen bg-[#F4F6F8]">
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-900 font-sans antialiased">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white text-slate-900 border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0F1E36] flex items-center justify-center font-bold text-white text-xs shadow-xs">
            DA
          </div>
          <span className="font-bold text-base tracking-tight text-[#0F1E36]">Dev Activity</span>
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

      {/* Sidebar Navigation matching Figma exactly */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen ${
          sidebarCollapsed ? 'w-18' : 'w-64'
        } bg-white text-slate-800 border-r border-slate-200/90 flex flex-col transition-all duration-200 ease-in-out shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`h-16 border-b border-slate-100 flex items-center ${
          sidebarCollapsed ? 'px-0 justify-center relative' : 'px-5 justify-between'
        }`}>
          {!sidebarCollapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-3 group min-w-0">
                <div className="w-8 h-8 rounded-[8px] bg-[#0F1E36] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0 select-none">
                  DA
                </div>
                <span className="font-bold text-base text-[#0F1E36] tracking-tight truncate">
                  Dev Activity
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setSidebarCollapsed(true)}
                className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Collapse sidebar"
              >
                <svg
                  className="w-4 h-4 text-slate-500 hover:text-slate-700"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
                  <line x1="5.5" y1="1.5" x2="5.5" y2="14.5" />
                  <path
                    d="M9.5 6L7.5 8L9.5 10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              className="group relative flex items-center justify-center p-1.5 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              title="Expand sidebar"
            >
              <div className="w-8 h-8 rounded-[8px] bg-[#0F1E36] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs select-none">
                DA
              </div>
              <div className="absolute inset-0 bg-[#0F1E36]/90 rounded-[8px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        {/* Navigation Menu */}
        <div className={`flex-1 overflow-y-auto py-5 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-3.5'}`}>
          {/* Dashboard (Filled 4-blocks icon matching Figma) */}
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            title="Dashboard"
            className={`flex items-center rounded-xl text-[14px] transition ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3.5 py-2.5'
            } ${
              isNavActive('/dashboard')
                ? 'bg-[#EEF2F6] text-[#0F1E36] font-bold'
                : 'text-[#0F1E36] hover:bg-slate-50 font-medium'
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0 fill-current text-[#0F1E36]"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
            </svg>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </Link>

          {/* Order List (ClipboardList icon matching Figma) */}
          <Link
            href="/orders"
            onClick={() => setSidebarOpen(false)}
            title="Order List"
            className={`flex items-center rounded-xl text-[14px] transition ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3.5 py-2.5'
            } ${
              isNavActive('/orders')
                ? 'bg-[#EEF2F6] text-[#0F1E36] font-bold'
                : 'text-[#0F1E36] hover:bg-slate-50 font-medium'
            }`}
          >
            <ClipboardList className="w-5 h-5 shrink-0 stroke-[1.8] text-[#0F1E36]" />
            {!sidebarCollapsed && <span>Order List</span>}
          </Link>

          {/* Customer List (User icon matching Figma) */}
          <Link
            href="/customers"
            onClick={() => setSidebarOpen(false)}
            title="Customer List"
            className={`flex items-center rounded-xl text-[14px] transition ${
              sidebarCollapsed ? 'justify-center p-2.5' : 'gap-3.5 px-3.5 py-2.5'
            } ${
              isNavActive('/customers')
                ? 'bg-[#EEF2F6] text-[#0F1E36] font-bold'
                : 'text-[#0F1E36] hover:bg-slate-50 font-medium'
            }`}
          >
            <User className="w-5 h-5 shrink-0 stroke-[1.8] text-[#0F1E36]" />
            {!sidebarCollapsed && <span>Customer List</span>}
          </Link>

          {/* Product Group (ShoppingBag icon matching Figma) */}
          <div>
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setProductGroupOpen(!productGroupOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition cursor-pointer ${
                  pathname.startsWith('/products') || pathname.startsWith('/categories')
                    ? 'bg-[#EEF2F6] text-[#0F1E36] font-bold'
                    : 'text-[#0F1E36] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <ShoppingBag className="w-5 h-5 shrink-0 stroke-[1.8] text-[#0F1E36]" />
                  Product
                </span>
                {productGroupOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#0F1E36] stroke-[2]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#0F1E36] stroke-[2]" />
                )}
              </button>
            ) : (
              <Link
                href="/products"
                title="Product List"
                className={`flex items-center justify-center p-2.5 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition ${
                  pathname.startsWith('/products') || pathname.startsWith('/categories')
                    ? 'bg-[#EEF2F6] text-[#0F1E36]'
                    : ''
                }`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              </Link>
            )}

            {!sidebarCollapsed && productGroupOpen && (
              <div className="space-y-0.5 mt-1">
                <Link
                  href="/products"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center pl-12 pr-3 py-2 rounded-md text-xs font-medium transition ${
                    pathname === '/products'
                      ? 'bg-[#E5EAF2] text-[#0F1E36] font-semibold'
                      : 'text-[#4A5568] hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Product List
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center pl-12 pr-3 py-2 rounded-md text-xs font-medium transition ${
                    pathname === '/categories'
                      ? 'bg-[#E5EAF2] text-[#0F1E36] font-semibold'
                      : 'text-[#4A5568] hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Categories
                </Link>
              </div>
            )}
          </div>

          {/* Reports Group (FileText icon matching Figma) */}
          <div>
            {!sidebarCollapsed ? (
              <button
                type="button"
                onClick={() => setReportsGroupOpen(!reportsGroupOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14px] font-medium transition cursor-pointer ${
                  pathname.startsWith('/reports')
                    ? 'bg-[#EEF2F6] text-[#0F1E36] font-bold'
                    : 'text-[#0F1E36] hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-3.5">
                  <FileText className="w-5 h-5 shrink-0 stroke-[1.8] text-[#0F1E36]" />
                  Reports
                </span>
                {reportsGroupOpen ? (
                  <ChevronDown className="w-4 h-4 text-[#0F1E36] stroke-[2]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[#0F1E36] stroke-[2]" />
                )}
              </button>
            ) : (
              <Link
                href="/reports/sales"
                title="Sales Report"
                className={`flex items-center justify-center p-2.5 rounded-xl text-[#0F1E36] hover:bg-slate-50 transition ${
                  pathname.startsWith('/reports') ? 'bg-[#EEF2F6] text-[#0F1E36]' : ''
                }`}
              >
                <FileText className="w-5 h-5 stroke-[1.8]" />
              </Link>
            )}

            {!sidebarCollapsed && reportsGroupOpen && (
              <div className="space-y-0.5 mt-1">
                <Link
                  href="/reports/sales"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center pl-12 pr-3 py-2 rounded-md text-xs font-medium transition ${
                    pathname === '/reports/sales'
                      ? 'bg-[#E5EAF2] text-[#0F1E36] font-semibold'
                      : 'text-[#4A5568] hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Sales Report
                </Link>
                <Link
                  href="/reports/inventory"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center pl-12 pr-3 py-2 rounded-md text-xs font-medium transition ${
                    pathname === '/reports/inventory'
                      ? 'bg-[#E5EAF2] text-[#0F1E36] font-semibold'
                      : 'text-[#4A5568] hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Inventory Report
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer with User Details & Logout */}
        <div className={`border-t border-slate-200/90 bg-white ${sidebarCollapsed ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-center rounded-xl hover:bg-slate-50 transition ${
            sidebarCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
          }`}>
            <Link
              href="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center group ${sidebarCollapsed ? 'justify-center' : 'gap-2.5 min-w-0 flex-1'}`}
              title={mounted ? `${user.firstName} ${user.lastName}` : 'Profile'}
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 text-[#0F1E36] flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {mounted ? (
                  <>
                    {user.firstName ? user.firstName[0] : ''}
                    {user.lastName ? user.lastName[0] : ''}
                  </>
                ) : (
                  'U'
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0F1E36] truncate leading-tight group-hover:text-blue-600">
                    {mounted ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {mounted ? user.role : 'Staff'}
                  </span>
                </div>
              )}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Page Content */}
        <main className="flex-1 p-5 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
