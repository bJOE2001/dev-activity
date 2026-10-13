'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Customer, Product, OrderItem, PaymentMethod } from '@/lib/types';
import { formatCurrency, addDays } from '@/lib/utils';
import { BrowseProductsModal, DiscountModal, ShippingModal } from '@/components/modals/OrderModals';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddCustomerModal } from '@/components/modals/CustomerModals';
import {
  ArrowLeft,
  Search,
  Plus,
  Tag,
  Truck,
  CreditCard,
  UserCheck,
  Package,
  AlertCircle,
  Edit2,
  X,
} from 'lucide-react';

export default function CreateOrderPage() {
  const router = useRouter();
  const {
    customers,
    products,
    getNextOrderNumber,
    createOrder,
    addCustomer,
    addToast,
  } = useStore();

  // Order Details
  const [orderNumber] = useState(() => getNextOrderNumber());
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [terms, setTerms] = useState<number>(15);
  const [note, setNote] = useState('');

  // Derived Due Date
  const dueDate = useMemo(() => {
    return addDays(orderDate, terms);
  }, [orderDate, terms]);

  // Customer Selection
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Products
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);

  // Discount & Shipping
  const [discount, setDiscount] = useState<{ amount: number; note: string } | null>(null);
  const [shipping, setShipping] = useState<{ amount: number; note: string } | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  // Payment
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<PaymentMethod | 'None'>('None');
  const [payments, setPayments] = useState<any[]>([]);

  // Validation
  const [formError, setFormError] = useState<string | null>(null);

  // Calculations
  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [orderItems]);

  const total = useMemo(() => {
    const disc = discount ? discount.amount : 0;
    const ship = shipping ? shipping.amount : 0;
    return Math.max(0, subtotal - disc + ship);
  }, [subtotal, discount, shipping]);

  const balance = useMemo(() => {
    return Math.max(0, total - paidAmount);
  }, [total, paidAmount]);

  // Add products from Browse Modal
  const handleAddProductsFromModal = (selected: Product[]) => {
    setOrderItems((prev) => {
      const existingMap = new Map(prev.map((i) => [i.productId, i]));
      selected.forEach((p) => {
        if (!existingMap.has(p.id)) {
          existingMap.set(p.id, {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            imageUrl: p.imageUrl,
            unitPrice: p.price,
            cost: p.cost,
            quantity: 1,
            lineTotal: p.price,
          });
        }
      });
      return Array.from(existingMap.values());
    });
  };

  // Update item quantity
  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const qty = newQty;
          return {
            ...item,
            quantity: qty,
            lineTotal: item.unitPrice * qty,
          };
        }
        return item;
      })
    );
  };

  // Remove item
  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Add Payment
  const handleAddPayment = (paymentData: any) => {
    setPayments((prev) => [...prev, paymentData]);
    setPaidAmount((prev) => prev + paymentData.amount);
    setPaymentType(paymentData.method);
    addToast('Payment Added', `Added ₱${paymentData.amount.toFixed(2)} via ${paymentData.method}.`);
  };

  // Customer filtering
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase();
    return customers
      .filter((c) => c.status === 'Active')
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [customers, customerSearch]);

  // Order submission
  const handleSaveOrder = (isDraft: boolean) => {
    setFormError(null);

    if (!selectedCustomer) {
      setFormError('Please select or create a customer for this order.');
      return;
    }

    if (!isDraft && orderItems.length === 0) {
      setFormError('Please add at least one product to submit the order.');
      return;
    }

    createOrder(
      {
        orderNumber,
        orderDate,
        terms,
        dueDate,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerAddress: selectedCustomer.address,
        customerPhone: selectedCustomer.phone,
        customerEmail: selectedCustomer.email,
        items: orderItems,
        subtotal,
        discount,
        shipping,
        total,
        paid: paidAmount,
        balance,
        paymentType,
        payments,
        status: isDraft ? 'Draft' : 'Unpaid', // computeOrderStatus handles this inside store
        note,
      },
      isDraft
    );

    router.push('/orders');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Order</h1>
            <p className="text-xs text-slate-500">
              Order No. <strong className="font-mono text-slate-800">#{orderNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveOrder(true)}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => handleSaveOrder(false)}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs"
          >
            Submit Order
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Info & Products (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Order Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Order Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Terms (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={terms}
                  onChange={(e) => setTerms(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="e.g. 15"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Due Date (computed)
                </label>
                <div className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 flex items-center">
                  {dueDate}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Order Note / Instructions
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional notes for fulfillment or dispatch..."
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Products Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Products ({orderItems.length})
                </h2>
                <p className="text-xs text-slate-400">Add catalog items to this order</p>
              </div>

              <button
                type="button"
                onClick={() => setIsBrowseModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
              >
                <Package className="w-4 h-4" />
                Browse Products
              </button>
            </div>

            {/* Product items list */}
            {orderItems.length === 0 ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 space-y-3">
                <Package className="w-8 h-8 mx-auto opacity-40 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-600">No products added yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click &quot;Browse Products&quot; to pick items.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBrowseModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
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
                          {formatCurrency(item.unitPrice)} each · SKU: {item.sku}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                      {/* Quantity adjuster */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="text-sm font-bold text-slate-900 w-24 text-right">
                        {formatCurrency(item.lineTotal)}
                      </span>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Payment Summary (1 col) */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Customer Information
              </h2>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerDropdownOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 underline"
                >
                  Change
                </button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="text-sm font-bold text-slate-900">{selectedCustomer.name}</p>
                </div>
                <p className="text-xs text-slate-600">{selectedCustomer.address}</p>
                <div className="pt-1 text-xs text-slate-500 space-y-0.5">
                  <p>Phone: {selectedCustomer.phone}</p>
                  <p>Email: {selectedCustomer.email}</p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setCustomerDropdownOpen(true)}
                    placeholder="Search existing customer..."
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {customerDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white rounded-xl border border-slate-200 shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-xs text-slate-400 text-center">
                        No customer found matching &quot;{customerSearch}&quot;
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomerDropdownOpen(false);
                            setCustomerSearch('');
                          }}
                          className="p-3 text-xs hover:bg-slate-50 cursor-pointer transition"
                        >
                          <p className="font-semibold text-slate-900">{cust.name}</p>
                          <p className="text-slate-400 truncate">{cust.email} · {cust.phone}</p>
                        </div>
                      ))
                    )}
                    {/* Create New Customer Option at Bottom */}
                    <div
                      onClick={() => {
                        setCustomerDropdownOpen(false);
                        setIsNewCustomerModalOpen(true);
                      }}
                      className="p-3 text-xs font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-1.5 border-t border-slate-200 bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Customer
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Payment Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({orderItems.length} items)</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Line */}
              {discount ? (
                <div className="flex items-center justify-between text-xs bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-emerald-800 font-medium truncate">
                      Discount · {discount.note}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-emerald-700">
                      −{formatCurrency(discount.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDiscountModalOpen(true)}
                      className="p-1 text-emerald-700 hover:text-emerald-900"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
                >
                  <Tag className="w-3.5 h-3.5" />
                  + Add Discount
                </button>
              )}

              {/* Shipping Line */}
              {shipping ? (
                <div className="flex items-center justify-between text-xs bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/60">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="text-blue-800 font-medium truncate">
                      Shipping · {shipping.note}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-blue-700">
                      +{formatCurrency(shipping.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsShippingModalOpen(true)}
                      className="p-1 text-blue-700 hover:text-blue-900"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(true)}
                  className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
                >
                  <Truck className="w-3.5 h-3.5" />
                  + Add Shipping
                </button>
              )}

              {/* Grand Total */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base">
                <span className="font-bold text-slate-900">Total</span>
                <span className="font-extrabold text-slate-900">{formatCurrency(total)}</span>
              </div>

              {/* Paid & Balance */}
              <div className="pt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Paid ({paymentType !== 'None' ? paymentType : 'Pending'})</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(paidAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Remaining Balance</span>
                  <span className={balance > 0 ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>

              {/* Add Payment Button */}
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full mt-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <CreditCard className="w-4 h-4" />
                + Add Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BrowseProductsModal
        isOpen={isBrowseModalOpen}
        onClose={() => setIsBrowseModalOpen(false)}
        products={products}
        selectedProductIds={orderItems.map((i) => i.productId)}
        onAddProducts={handleAddProductsFromModal}
      />

      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        initialAmount={discount?.amount}
        initialNote={discount?.note}
        onSaveDiscount={(amount, note) => setDiscount({ amount, note })}
        onRemoveDiscount={() => setDiscount(null)}
      />

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        initialAmount={shipping?.amount}
        initialNote={shipping?.note}
        onSaveShipping={(amount, note) => setShipping({ amount, note })}
        onRemoveShipping={() => setShipping(null)}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderTotal={total}
        currentBalance={balance}
        onAddPayment={handleAddPayment}
      />

      <AddCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onAddCustomer={addCustomer}
        onCustomerCreated={(newCust) => setSelectedCustomer(newCust)}
      />
    </div>
  );
}
