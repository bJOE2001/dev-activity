'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { X, Search, Check, Tag, Truck, ArrowUpDown } from 'lucide-react';

interface BrowseProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  selectedProductIds: string[];
  onAddProducts: (selectedProducts: Product[]) => void;
}

export function BrowseProductsModal({
  isOpen,
  onClose,
  products,
  selectedProductIds,
  onAddProducts,
}: BrowseProductsModalProps) {
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Initialize selected IDs with already selected products
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedProductIds);
      setSearch('');
      setCurrentPage(1);
    }
  }, [isOpen, selectedProductIds]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => p.status === 'Active')
      .filter((p) => {
        const query = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.categoryName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [products, search, sortOrder]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const selected = products.filter((p) => selectedIds.includes(p.id));
    onAddProducts(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Browse Products</h3>
            <p className="text-xs text-slate-500">Select active items to add to this order</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Sort Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-white">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search product name, SKU or category..."
              className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="h-10 px-3.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </button>
        </div>

        {/* Product Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100 sticky top-0">
              <tr>
                <th className="py-2.5 px-4 w-12 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-2.5 px-4">Product Name</th>
                <th className="py-2.5 px-4 text-right">Stock On Hand</th>
                <th className="py-2.5 px-4 text-right">Unit Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-sm">
                    No products found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isChecked = selectedIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelect(p.id)}
                      className={`cursor-pointer transition hover:bg-slate-50/80 ${
                        isChecked ? 'bg-slate-50/60' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition mx-auto ${
                            isChecked
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-9 h-9 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 text-[10px] font-bold shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                              <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                                {p.sku}
                              </span>
                              <span>•</span>
                              <span>{p.categoryName}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            p.stockOnHand <= p.lowStockAlert
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.stockOnHand} left
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(p.price)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span className="font-bold text-slate-900">{selectedIds.length}</span> Selected
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Prev
              </button>
              <span className="px-2">
                {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs"
          >
            Add Products
          </button>
        </div>
      </div>
    </div>
  );
}

// Discount Modal
interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialNote?: string;
  onSaveDiscount: (amount: number, note: string) => void;
  onRemoveDiscount?: () => void;
}

export function DiscountModal({
  isOpen,
  onClose,
  initialAmount = 0,
  initialNote = '',
  onSaveDiscount,
  onRemoveDiscount,
}: DiscountModalProps) {
  const [amount, setAmount] = useState(initialAmount > 0 ? initialAmount.toString() : '');
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount > 0 ? initialAmount.toString() : '');
      setNote(initialNote);
      setError(null);
    }
  }, [isOpen, initialAmount, initialNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid discount amount greater than 0.');
      return;
    }
    onSaveDiscount(num, note.trim() || 'Discount');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              {initialAmount > 0 ? 'Edit Discount Details' : 'Add Discount'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Discount Amount (₱) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Reason / Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. VIP promo, Special clearance"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {initialAmount > 0 && onRemoveDiscount ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveDiscount();
                  onClose();
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
              >
                Remove Discount
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
              >
                {initialAmount > 0 ? 'Save' : 'Apply Discount'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Shipping Modal
interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAmount?: number;
  initialNote?: string;
  onSaveShipping: (amount: number, note: string) => void;
  onRemoveShipping?: () => void;
}

export function ShippingModal({
  isOpen,
  onClose,
  initialAmount = 0,
  initialNote = '',
  onSaveShipping,
  onRemoveShipping,
}: ShippingModalProps) {
  const [amount, setAmount] = useState(initialAmount > 0 ? initialAmount.toString() : '');
  const [note, setNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setAmount(initialAmount > 0 ? initialAmount.toString() : '');
      setNote(initialNote);
      setError(null);
    }
  }, [isOpen, initialAmount, initialNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid shipping fee greater than 0.');
      return;
    }
    onSaveShipping(num, note.trim() || 'Shipping Fee');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">
              {initialAmount > 0 ? 'Edit Shipping Details' : 'Add Shipping Fee'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Shipping Amount (₱) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₱</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="0.00"
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-base focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Carrier / Delivery Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lalamove, Express courier, Van delivery"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            {initialAmount > 0 && onRemoveShipping ? (
              <button
                type="button"
                onClick={() => {
                  onRemoveShipping();
                  onClose();
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
              >
                Remove Shipping
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
              >
                {initialAmount > 0 ? 'Save' : 'Apply Shipping'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
