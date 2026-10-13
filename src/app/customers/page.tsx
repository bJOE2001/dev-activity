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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer List</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain accounts, billing addresses, and order histories
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Add Customer
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex items-center gap-1">
          {(['All', 'Active', 'Inactive'] as const).map((tab) => {
            const count = tabCounts[tab];
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                {tab}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search Customer by name, email, phone..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-500">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 px-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
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
                    Name
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5">Address</th>
                <th className="py-3 px-5">Phone Number</th>
                <th className="py-3 px-5">Email Address</th>
                <th className="py-3 px-5 text-right">Total Transaction</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another keyword or add a new customer.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-900 text-xs">
                      <Link
                        href={`/customers/${cust.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {cust.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 max-w-[220px] truncate">
                      {cust.address || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 font-mono">
                      {cust.phone || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {cust.email || '—'}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-xs text-slate-900">
                      {formatCurrency(cust.totalTransaction)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={cust.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="View Customer Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingCustomer(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCustomer(cust)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing{' '}
            <strong className="text-slate-800">
              {total > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}
            </strong>{' '}
            –{' '}
            <strong className="text-slate-800">
              {Math.min(currentPage * rowsPerPage, total)}
            </strong>{' '}
            of <strong className="text-slate-800">{total}</strong> customers
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
