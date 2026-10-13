'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddCustomerModal, EditCustomerModal, DeleteCustomerDialog } from '@/components/modals/CustomerModals';
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

export default function CustomerListPage() {
  const { customers, orders, addCustomer, updateCustomer, deleteCustomer } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Dynamic customer total transaction calculation from confirmed orders
  const customerListWithComputedTransactions = useMemo(() => {
    return customers.map((c) => {
      const custOrders = orders.filter(
        (o) => o.customerId === c.id && o.status !== 'Draft' && o.status !== 'Cancelled'
      );
      const computedTotal = custOrders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...c,
        totalTransaction: computedTotal || c.totalTransaction,
      };
    });
  }, [customers, orders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: customerListWithComputedTransactions.length,
      Active: customerListWithComputedTransactions.filter((c) => c.status === 'Active').length,
      Inactive: customerListWithComputedTransactions.filter((c) => c.status === 'Inactive').length,
    };
  }, [customerListWithComputedTransactions]);

  // Filter & Search
  const filteredCustomers = useMemo(() => {
    return customerListWithComputedTransactions
      .filter((c) => {
        if (activeTab === 'All') return true;
        return c.status === activeTab;
      })
      .filter((c) => {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [customerListWithComputedTransactions, activeTab, search, sortOrder]);

  // Pagination
  const total = filteredCustomers.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCustomers.slice(start, start + rowsPerPage);
  }, [filteredCustomers, currentPage, rowsPerPage]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page Heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Customer List
        </h1>
      </div>

      {/* Customer List Container */}
      <section className="overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
        {/* Search and Add Customer Bar */}
        <div className="flex min-h-[49px] flex-wrap items-center gap-2.5 border-b border-[#EDF0F5] px-3 py-2.5 sm:px-3">
          <div className="relative w-full sm:w-[192px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#263650]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Customer"
              className="h-[29px] w-full rounded-lg border border-[#E5EAF2] bg-white pl-3 pr-8 text-[11px] text-[#25324A] outline-none transition placeholder:text-[#9AA8BC] focus:border-[#102348] focus:ring-1 focus:ring-[#102348]/10"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-[29px] items-center justify-center gap-1.5 rounded-lg bg-[#0B1F44] px-3 text-[11px] font-medium text-white transition hover:bg-[#173363] cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Customer
          </button>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-[#EDF0F5] px-2 sm:px-3">
          <div className="flex items-center gap-1 overflow-x-auto py-1.5">
            {(['All', 'Active', 'Inactive'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E9EDF4] text-[#102348]'
                      : 'bg-transparent text-[#293751] hover:bg-[#F4F6FA]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="h-[31px] border-b border-[#EDF0F5] bg-[#F7F9FC] text-[10px] font-medium text-[#263650]">
                <th className="px-3 font-medium">
                  <div
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-[#0B1F44]"
                  >
                    <span>Name</span>
                    <span className="text-[10px]">⌵</span>
                  </div>
                </th>
                <th className="px-3 font-medium">Address</th>
                <th className="px-3 font-medium">Phone Number</th>
                <th className="px-3 font-medium">Email Address</th>
                <th className="px-3 font-medium">Total Transaction</th>
                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F5] text-[11px] text-[#25324A]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No customers found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                paginated.map((cust) => (
                  <tr key={cust.id} className="h-[38px] hover:bg-[#F8FAFC] transition">
                    <td className="px-3">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="font-normal text-[#25324A] hover:text-[#0B1F44] hover:underline"
                      >
                        {cust.name}
                      </Link>
                    </td>
                    <td className="px-3 text-[#25324A]">
                      {cust.address || '—'}
                    </td>
                    <td className="px-3 text-[#25324A]">
                      {cust.phone || '0912 345 6789'}
                    </td>
                    <td className="px-3 text-[#25324A]">
                      {cust.email || 'sample@email.com'}
                    </td>
                    <td className="px-3 text-[#25324A]">
                      10
                    </td>
                    <td className="px-3">
                      <StatusBadge status={cust.status} />
                    </td>
                  </tr>
                ))
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
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC]"
            >
              &lt;
            </button>
            <button
              type="button"
              className="flex h-[25px] w-[25px] items-center justify-center rounded bg-[#0B1F44] text-[11px] font-medium text-white"
            >
              {currentPage}
            </button>
            {totalPages > 1 && (
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[11px] text-[#25324A] hover:bg-[#F8FAFC]"
              >
                2
              </button>
            )}
            {totalPages > 2 && (
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[11px] text-[#25324A] hover:bg-[#F8FAFC]"
              >
                3
              </button>
            )}
            {totalPages > 3 && <span className="px-1 text-[#9AA8BC]">...</span>}
            {totalPages > 3 && (
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[11px] text-[#25324A] hover:bg-[#F8FAFC]"
              >
                {totalPages}
              </button>
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC]"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCustomer={addCustomer}
      />

      <EditCustomerModal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onUpdateCustomer={(id, updates) => updateCustomer(id, updates)}
      />

      {deletingCustomer && (
        <DeleteCustomerDialog
          isOpen={!!deletingCustomer}
          onClose={() => setDeletingCustomer(null)}
          customerName={deletingCustomer.name}
          onConfirmDelete={() => deleteCustomer(deletingCustomer.id)}
        />
      )}
    </div>
  );
}
