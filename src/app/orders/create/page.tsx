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
  const [showPaymentAddedBanner, setShowPaymentAddedBanner] = useState(false);

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
    setShowPaymentAddedBanner(true);
    setTimeout(() => {
      setShowPaymentAddedBanner(false);
    }, 4000);
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

    router.push('/orders?created=true');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/orders"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Order</h1>
        </div>

        {/* Top Center Payment Added Notification Box */}
        {showPaymentAddedBanner && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-[#0F1E36] text-white rounded-lg shadow-md animate-in fade-in duration-200">
            <span className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-[10px]">
              ✓
            </span>
            <span className="text-xs font-semibold">Payment Added</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSaveOrder(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            Save as draft
          </button>
          <button
            type="button"
            onClick={() => handleSaveOrder(false)}
            className="px-5 py-2 rounded-lg bg-[#0F1E36] text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs"
          >
            Submit
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Add Products (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            {/* Top Browse Input Bar */}
            <div className="flex items-center justify-between border border-slate-300 rounded-lg px-3 py-2 bg-white">
              <span className="text-sm font-semibold text-slate-800">Add Products</span>
              <button
                type="button"
                onClick={() => setIsBrowseModalOpen(true)}
                className="px-3.5 py-1 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                Browse
              </button>
            </div>

            {/* Product items list / table */}
            {orderItems.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 space-y-2">
                <Package className="w-8 h-8 mx-auto opacity-30 text-slate-500" />
                <p className="text-sm font-medium text-slate-500">No products added yet</p>
                <p className="text-xs text-slate-400">Click &quot;Browse&quot; above to select products from inventory.</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500 font-medium border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-2 font-medium">Products</th>
                      <th className="py-2.5 px-4 font-medium text-center w-32">Quantity</th>
                      <th className="py-2.5 px-4 font-medium text-right w-28">Total</th>
                      <th className="py-2.5 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderItems.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50/50 transition">
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
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item.productId,
                                Math.max(1, parseInt(e.target.value, 10) || 1)
                              )
                            }
                            className="w-16 h-8 px-2 rounded-lg border border-slate-200 text-center text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                          />
                        </td>
                        <td className="py-3 px-4 text-right text-xs font-normal text-slate-900">
                          {item.lineTotal.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.productId)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 3 Stacked Cards (Payment, Customer Information, Order Information) */}
        <div className="space-y-6">
          {/* Card 1: Payment */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Payment</h2>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-700 font-medium">Subtotal</span>
                  <p className="text-xs text-slate-400">{orderItems.length} items</p>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>

              {/* Add / View Discount */}
              {discount ? (
                <div
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="flex items-start justify-between cursor-pointer group"
                >
                  <div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      Discount
                    </span>
                    <p className="text-xs text-slate-400">{discount.note}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    -{discount.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDiscountModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 block transition"
                >
                  Add Discount
                </button>
              )}

              {/* Add / View Shipping */}
              {shipping ? (
                <div
                  onClick={() => setIsShippingModalOpen(true)}
                  className="flex items-start justify-between cursor-pointer group"
                >
                  <div>
                    <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                      Shipping
                    </span>
                    <p className="text-xs text-slate-400">{shipping.note}</p>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {shipping.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsShippingModalOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 block transition"
                >
                  Add Shipping
                </button>
              )}

              {/* Total */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800">Total</span>
                <span className="font-medium text-slate-900">
                  {total.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Paid Row */}
              {paidAmount > 0 && (
                <div className="flex items-start justify-between text-xs pt-1">
                  <div>
                    <span className="font-medium text-blue-600">Paid</span>
                    <p className="text-slate-400 text-xs mt-0.5">{paymentType !== 'None' ? paymentType : 'Cash'}</p>
                  </div>
                  <span className="font-medium text-blue-600">
                    {paidAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {/* Balance Row */}
              {paidAmount > 0 && (
                <div className="flex items-center justify-between text-xs pt-2 font-bold text-slate-900">
                  <span>Balance</span>
                  <span>
                    {balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}

              {/* Add Payment Action */}
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 pt-1 transition"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-blue-600 flex items-center justify-center text-[10px] leading-none">
                  +
                </span>
                Add Payment
              </button>
            </div>
          </div>

          {/* Card 2: Customer Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Customer Information</h2>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerDropdownOpen(true);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  Change
                </button>
              )}
            </div>

            {selectedCustomer ? (
              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-medium">Customer Name</p>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Address</p>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedCustomer.address || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Phone Number</p>
                  <p className="text-slate-900 font-bold mt-0.5">{selectedCustomer.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">E-mail Address</p>
                  <p className="text-slate-900 font-normal mt-0.5">{selectedCustomer.email || '—'}</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Customer
                </label>
                <div className="relative">
                  <div
                    onClick={() => setCustomerDropdownOpen((prev) => !prev)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm flex items-center justify-between cursor-pointer bg-white"
                  >
                    <span className="text-slate-400 text-sm truncate">
                      Search or customer a client
                    </span>
                    <span className="text-slate-400 text-xs">⌵</span>
                  </div>

                  {customerDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-white rounded-xl border border-slate-200 shadow-xl p-3 space-y-3">
                      {/* Top Action: Create New Customer */}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerDropdownOpen(false);
                          setIsNewCustomerModalOpen(true);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 block transition"
                      >
                        Create New Customer
                      </button>

                      {/* Search Input with placeholder 'Seacrh' / 'Search' */}
                      <div className="relative">
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Search"
                          className="w-full h-8 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 placeholder:italic focus:outline-none focus:ring-1 focus:ring-slate-900"
                          autoFocus
                        />
                      </div>

                      {/* Customer List */}
                      <div className="max-h-52 overflow-y-auto space-y-1">
                        {filteredCustomers.length === 0 ? (
                          <div className="py-2 text-xs text-slate-400 text-center">
                            No customer found
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
                              className="py-1.5 px-2 rounded-md text-xs text-slate-800 hover:bg-slate-50 hover:text-slate-950 cursor-pointer transition font-normal"
                            >
                              {cust.name}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Order Information */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Order Information</h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Order Date
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Order Number
                </label>
                <input
                  type="text"
                  disabled
                  value={orderNumber}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm font-mono text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Terms (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  value={terms}
                  onChange={(e) => setTerms(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="0"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Due Date
                </label>
                <div className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 flex items-center">
                  {dueDate || 'MM/DD/YYYY'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Note"
                  rows={3}
                  className="w-full p-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
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
