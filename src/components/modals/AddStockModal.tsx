'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { X, PackagePlus } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onAddStock: (productId: string, quantity: number) => void;
}

export function AddStockModal({
  isOpen,
  onClose,
  product,
  onAddStock,
}: AddStockModalProps) {
  const [quantity, setQuantity] = useState<string>('10');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }
    onAddStock(product.id, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Stock</h3>
              <p className="text-xs text-slate-500">Replenish product inventory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold">
                  IMG
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                    {product.sku}
                  </span>
                  <span>•</span>
                  <span>{product.categoryName}</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Quantity to Add <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-medium text-slate-500">
                Current stock: <strong className="text-slate-900">{product.stockOnHand}</strong>
              </span>
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError(null);
              }}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              placeholder="Enter units to add"
              autoFocus
              required
            />
            <p className="text-xs text-slate-400 mt-1">
              New stock will be:{' '}
              <strong className="text-slate-700">
                {product.stockOnHand + (parseInt(quantity, 10) || 0)}
              </strong>
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              Add Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
