'use client';

import React, { useState, useMemo, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditCustomerModal, DeleteCustomerDialog } from '@/components/modals/CustomerModals';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Eye,
  Power,
} from 'lucide-react';

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { customers, orders, updateCustomer, deleteCustomer } = useStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const customer = customers.find((c) => c.id === id);

  // Customer's orders
  const customerOrders = useMemo(() => {
    return orders.filter((o) => o.customerId === id);
  }, [orders, id]);

  const totalSpent = useMemo(() => {
    return customerOrders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Draft')
      .reduce((sum, o) => sum + o.total, 0);
  }, [customerOrders]);

  const outstandingBalance = useMemo(() => {
    return customerOrders
      .filter((o) => o.status !== 'Cancelled' && o.status !== 'Draft')
      .reduce((sum, o) => sum + o.balance, 0);
  }, [customerOrders]);

  if (!customer) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Customer Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested customer could not be found.</p>
        <Link
          href="/customers"
          className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Customer List
        </Link>
      </div>
    );
  }

  const handleToggleStatus = () => {
    const nextStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    updateCustomer(customer.id, { status: nextStatus });
  };

  const handleConfirmDelete = () => {
    deleteCustomer(customer.id);
    router.push('/customers');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Information
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              customer.status === 'Active'
                ? 'border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {customer.status === 'Active' ? 'Set Inactive' : 'Set Active'}
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Profile & KPI Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Information (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Customer Information
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">Delivery Address</p>
                <p className="text-slate-600 mt-0.5">{customer.address || 'No address provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 pt-1">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Phone</p>
                <p className="text-slate-600 font-mono">{customer.phone || '—'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-700 pt-1">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Email</p>
                <p className="text-slate-600">{customer.email || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Summary (2 cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Transactions
            </span>
            <p className="text-xl font-bold text-slate-900">{formatCurrency(totalSpent)}</p>
            <p className="text-xs text-slate-400">Lifetime confirmed orders</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Outstanding Balance
            </span>
            <p className="text-xl font-bold text-amber-600">{formatCurrency(outstandingBalance)}</p>
            <p className="text-xs text-slate-400">Pending customer settlement</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <p className="text-xl font-bold text-slate-900">{customerOrders.length}</p>
            <p className="text-xs text-slate-400">In system database</p>
          </div>
        </div>
      </div>

      {/* Customer's Order History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Customer Order History</h2>
          <Link
            href="/orders/create"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            + Create New Order for {customer.name}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-5">Order No.</th>
                <th className="py-3 px-5">Order Date</th>
                <th className="py-3 px-5">Payment Type</th>
                <th className="py-3 px-5 text-right">Total</th>
                <th className="py-3 px-5 text-right">Balance</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right w-16">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No orders recorded for this customer yet.
                  </td>
                </tr>
              ) : (
                customerOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-mono font-bold text-xs text-slate-900">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {formatDate(o.orderDate)}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                      {o.paymentType}
                    </td>
                    <td className="py-3.5 px-5 text-right font-bold text-xs text-slate-900">
                      {formatCurrency(o.total)}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-xs text-slate-700">
                      {formatCurrency(o.balance)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/orders/${o.id}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition inline-block"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        customer={customer}
        onUpdateCustomer={(id, updates) => updateCustomer(id, updates)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteCustomerDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        customerName={customer.name}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
