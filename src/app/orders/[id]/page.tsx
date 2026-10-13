'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  MoreVertical,
  Ban,
  CheckCircle2,
} from 'lucide-react';

export default function ViewOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { orders, addPaymentToOrder, cancelOrder, addToast } = useStore();

  const [itemsCollapsed, setItemsCollapsed] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Order Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The requested order does not exist.</p>
        <Link
          href="/orders"
          className="inline-block mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Return to Order List
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(order, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Order-${order.orderNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Downloaded', `Order #${order.orderNumber} summary downloaded.`);
  };

  const handleCancel = () => {
    if (confirm(`Are you sure you want to cancel Order #${order.orderNumber}? This will restore inventory.`)) {
      cancelOrder(order.id);
      setMoreActionsOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:space-y-4">
      {/* Header Actions (hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Order #{order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Placed on {formatDate(order.orderDate)} · Due on {formatDate(order.dueDate)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {order.status !== 'Paid' && order.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Add Payment
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {/* More Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreActionsOpen(!moreActionsOpen)}
              className="p-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {moreActionsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-30">
                <button
                  type="button"
                  onClick={() => {
                    handleDownload();
                    setMoreActionsOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                {order.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Invoice Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-4">
        <h2 className="text-2xl font-bold">INVOICE #{order.orderNumber}</h2>
        <p className="text-xs text-slate-500">Dev Activity · Ateb Venue Sales System</p>
      </div>

      {/* Main Grid: Details & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Products & Logs (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Products Card (Collapsible) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setItemsCollapsed(!itemsCollapsed)}
              className="p-5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Ordered Products ({order.items.length})
                </h3>
              </div>
              <button type="button" className="text-slate-400 hover:text-slate-600">
                {itemsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {!itemsCollapsed && (
              <div className="divide-y divide-slate-100 p-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCurrency(item.unitPrice)} × {item.quantity} units · SKU: {item.sku}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Timeline / Logs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Order Activity Logs
            </h3>

            <div className="space-y-4 pt-2">
              {order.logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{log.action}</p>
                      <span className="text-[11px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">By {log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Order Meta & Payment Summary (1 col) */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Customer Information
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <Link
                  href={`/customers/${order.customerId}`}
                  className="font-bold text-slate-900 text-sm hover:underline hover:text-blue-600"
                >
                  {order.customerName}
                </Link>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{order.customerAddress || 'No address provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{order.customerPhone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{order.customerEmail || '—'}</span>
              </div>
            </div>
          </div>

          {/* Order Meta Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Order Details
            </h3>
            <div className="divide-y divide-slate-100 space-y-2">
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Order Number</span>
                <span className="font-mono font-bold text-slate-900">#{order.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Order Date</span>
                <span className="font-semibold text-slate-900">{formatDate(order.orderDate)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Terms</span>
                <span className="font-semibold text-slate-900">{order.terms} Days</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Due Date</span>
                <span className="font-semibold text-slate-900">{formatDate(order.dueDate)}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500">Payment Type</span>
                <span className="font-semibold text-slate-900">{order.paymentType}</span>
              </div>
              {order.note && (
                <div className="pt-2">
                  <span className="text-slate-500 block mb-0.5">Note</span>
                  <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    &ldquo;{order.note}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Payment Summary
            </h3>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-slate-600 text-xs">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
              </div>

              {order.discount && (
                <div className="flex items-center justify-between text-xs text-emerald-700">
                  <span>Discount ({order.discount.note})</span>
                  <span className="font-semibold">−{formatCurrency(order.discount.amount)}</span>
                </div>
              )}

              {order.shipping && (
                <div className="flex items-center justify-between text-xs text-blue-700">
                  <span>Shipping ({order.shipping.note})</span>
                  <span className="font-semibold">+{formatCurrency(order.shipping.amount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-base">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-extrabold text-slate-900">{formatCurrency(order.total)}</span>
              </div>

              <div className="pt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Paid ({order.paymentType})</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(order.paid)}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-800">Remaining Balance</span>
                  <span className={order.balance > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                    {formatCurrency(order.balance)}
                  </span>
                </div>
              </div>

              {order.status !== 'Paid' && order.status !== 'Cancelled' && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Add Payment
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderTotal={order.total}
        currentBalance={order.balance}
        onAddPayment={(paymentData) => {
          addPaymentToOrder(order.id, paymentData);
        }}
      />
    </div>
  );
}
