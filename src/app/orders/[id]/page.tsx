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
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Order #{order.orderNumber}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* More Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreActionsOpen(!moreActionsOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
            >
              <span>More Action</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {moreActionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30">
                <button
                  type="button"
                  onClick={() => {
                    handleDownload();
                    setMoreActionsOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] leading-none shrink-0">
                    ↓
                  </span>
                  <span>Download</span>
                </button>
                {order.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-800 hover:bg-slate-50 flex items-center gap-2 transition"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-[9px] leading-none shrink-0">
                      ✕
                    </span>
                    <span>Cancel Order</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {order.status !== 'Paid' && order.status !== 'Cancelled' && (
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-medium transition shadow-2xs"
            >
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[10px] leading-none">
                +
              </span>
              Add Payment
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Ordered Products & Payment Summary (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Products Card (Collapsible) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div
              onClick={() => setItemsCollapsed(!itemsCollapsed)}
              className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
            >
              <h3 className="text-xs font-bold text-slate-900">
                Ordered Products
              </h3>
              <button type="button" className="text-slate-400 hover:text-slate-600">
                {itemsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {!itemsCollapsed && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-2 font-medium">Products</th>
                      <th className="py-2 px-4 font-medium text-center w-28">Quantity</th>
                      <th className="py-2 px-4 font-medium text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-[10px] shrink-0 border border-slate-200">
                                📷
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-slate-900 text-xs leading-snug">
                                {item.productName}
                              </p>
                              <p className="text-xs text-blue-600 font-normal mt-0.5">
                                {item.unitPrice.toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-normal text-slate-800">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-4 text-right font-normal text-slate-900">
                          {item.lineTotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <h3 className="text-xs font-bold text-slate-900">Payment</h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <div>
                  <span className="font-medium">Subtotal</span>
                  <p className="text-slate-400 text-xs mt-0.5">{order.items.length} items</p>
                </div>
                <span className="font-medium text-slate-900">
                  {order.subtotal.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {order.discount && (
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-slate-700">Discount</span>
                    <p className="text-slate-400 text-xs mt-0.5">{order.discount.note}</p>
                  </div>
                  <span className="font-medium text-slate-900">
                    -{order.discount.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {order.shipping && (
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-slate-700">Shipping</span>
                    <p className="text-slate-400 text-xs mt-0.5">{order.shipping.note}</p>
                  </div>
                  <span className="font-medium text-slate-900">
                    {order.shipping.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="font-medium text-slate-800">Total</span>
                <span className="font-medium text-slate-900">
                  {order.total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {order.paid > 0 && (
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-medium">Paid</span>
                  <span className="font-medium text-slate-900">
                    {order.paid.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between font-bold text-slate-900 pt-1">
                <span>Balance</span>
                <span>
                  {order.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info, Order Information & Logs (1 col) */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Customer Information</h3>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Customer Name</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Address</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.customerAddress || '2444 Lowes Alley'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Phone Number</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.customerPhone || '0912 345 6789'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">E-mail Address</p>
                <p className="text-slate-900 font-normal mt-0.5">{order.customerEmail || 'janice@email.com'}</p>
              </div>
            </div>
          </div>

          {/* Order Information Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
            <h3 className="text-xs font-bold text-slate-900">Order Information</h3>
            <div className="space-y-2.5">
              <div>
                <p className="text-slate-400 font-medium">Order Date</p>
                <p className="text-slate-900 font-bold mt-0.5">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Order Number</p>
                <p className="text-slate-900 font-bold font-mono mt-0.5">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Terms (Days)</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.terms}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Due Date</p>
                <p className="text-slate-900 font-bold mt-0.5">{order.dueDate ? formatDate(order.dueDate) : '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Note</p>
                <p className="text-slate-900 font-normal mt-0.5">{order.note || '-'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium mb-1">Status</p>
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Logs Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900">Logs</h3>

            <div className="space-y-4 pt-1">
              {order.logs.map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-2.5 text-xs relative">
                  <div className="w-3 h-3 rounded-full border-2 border-slate-400 bg-white shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400">{log.timestamp}</p>
                    <p className="text-slate-800 font-medium mt-0.5">{log.action}: {log.details}</p>
                    {log.userName && (
                      <p className="text-[10px] text-slate-400 mt-0.5">By {log.userName}</p>
                    )}
                  </div>
                </div>
              ))}
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
