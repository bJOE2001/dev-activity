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
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Product List</h3>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3.5 border-b border-slate-100 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Products"
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Product Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-700 border-b border-slate-200 font-semibold sticky top-0 z-10">
              <tr>
                <th className="py-2.5 px-3.5 w-10 text-center">
                  <span className="sr-only">Select</span>
                </th>
                <th className="py-2.5 px-3">
                  <div
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-slate-900"
                  >
                    <span>Product Name</span>
                    <span className="text-[10px] text-slate-400">⇅</span>
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Stock on hand</th>
                <th className="py-2.5 px-4 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No products found matching &quot;{search}&quot;.
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
                        isChecked ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-2 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2.5">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-8 h-8 object-cover rounded-md border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-[10px] shrink-0 border border-slate-200">
                              📷
                            </div>
                          )}
                          <span className="font-normal text-slate-800 text-xs truncate max-w-xs">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700 text-xs">
                        {p.stockOnHand}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-800 text-xs">
                        {p.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal pagination row */}
        <div className="px-5 py-2 border-t border-slate-100 flex items-center justify-end text-xs text-slate-500 gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1 font-bold"
          >
            &lt;
          </button>
          <span className="font-semibold text-slate-800">{currentPage}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="text-slate-400 hover:text-slate-700 disabled:opacity-30 px-1 font-bold"
          >
            &gt;
          </button>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="px-2.5 py-1 rounded bg-slate-100 text-[11px] font-medium text-slate-600">
            {selectedIds.length} Selected
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Add
            </button>
          </div>
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {initialAmount > 0 ? 'Discount Details' : 'Add Discount'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Amount
            </label>
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
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            {initialAmount > 0 && onRemoveDiscount ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveDiscount();
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Remove
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Submit
                </button>
              </>
            )}
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
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {initialAmount > 0 ? 'Shipping Details' : 'Add Shipping'}
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Amount
            </label>
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
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Note"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            {initialAmount > 0 && onRemoveShipping ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveShipping();
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Remove
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Submit
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

