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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Customer Details
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
          >
            <Power className="w-3.5 h-3.5" />
            {customer.status === 'Active' ? 'Set Inactive' : 'Set Active'}
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Information
          </button>
        </div>
      </div>

      {/* Main Content Grid: Customer Info (Left) & Order List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Customer Information Card (1 col) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <h2 className="text-xs font-bold text-slate-900">
            Customer Information
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-slate-400 font-medium">Customer Name</p>
              <p className="text-slate-900 font-bold mt-0.5">{customer.name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Address</p>
              <p className="text-slate-900 font-bold mt-0.5">{customer.address || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Phone Number</p>
              <p className="text-slate-900 font-bold mt-0.5">{customer.phone || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">E-mail Address</p>
              <p className="text-slate-900 font-normal mt-0.5">{customer.email || '—'}</p>
            </div>
          </div>
        </div>

        {/* Order List Table Card (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-900">Order List</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F9FC] text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-medium">
                    <div className="inline-flex items-center gap-1 cursor-pointer">
                      <span>Order No.</span>
                      <span className="text-[10px]">⌵</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 font-medium">Order Date</th>
                  <th className="py-2.5 px-4 font-medium">Payment Type</th>
                  <th className="py-2.5 px-4 font-medium text-right">Total</th>
                  <th className="py-2.5 px-4 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No orders found for this customer.
                    </td>
                  </tr>
                ) : (
                  customerOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono text-slate-800">
                        <Link href={`/orders/${o.id}`} className="hover:underline hover:text-blue-600">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(o.orderDate)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {o.paymentType}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">
                        {o.total.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">
                        {o.balance.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
