'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { AddProductModal, EditProductModal } from '@/components/modals/ProductModals';
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  PackagePlus,
  Edit,
  AlertTriangle,
} from 'lucide-react';

export default function ProductListPage() {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    addStock,
    addCategory,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'price' | 'stockOnHand'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: products.length,
      Active: products.filter((p) => p.status === 'Active').length,
      Inactive: products.filter((p) => p.status === 'Inactive').length,
    };
  }, [products]);

  // Filter & Search
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (activeTab === 'All') return true;
        return p.status === activeTab;
      })
      .filter((p) => {
        const q = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (sortField === 'price' || sortField === 'stockOnHand') {
          return sortDirection === 'asc' ? (Number(valA) - Number(valB)) : (Number(valB) - Number(valA));
        }

        if (sortDirection === 'asc') {
          return String(valA).localeCompare(String(valB));
        } else {
          return String(valB).localeCompare(String(valA));
        }
      });
  }, [products, activeTab, search, sortField, sortDirection]);

  // Pagination
  const total = filteredProducts.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage, rowsPerPage]);

  const handleSort = (field: 'name' | 'price' | 'stockOnHand') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product List</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage product catalog, inventory tracking, and low stock thresholds
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddProductOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Add Product
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
            placeholder="Search Product by name, SKU, or category..."
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
                  onClick={() => handleSort('name')}
                  className="py-3 px-5 cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center gap-1.5">
                    Product
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5">Category</th>
                <th
                  onClick={() => handleSort('price')}
                  className="py-3 px-5 text-right cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Price
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('stockOnHand')}
                  className="py-3 px-5 text-right cursor-pointer hover:text-slate-900 transition select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    Stock on Hand
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-slate-600">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">Try another search or add a new product.</p>
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const isLowStock = p.stockOnHand <= p.lowStockAlert;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-xs truncate max-w-[220px]">
                              {p.name}
                            </p>
                            <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                        {p.categoryName}
                      </td>
                      <td className="py-3.5 px-5 text-right font-bold text-xs text-slate-900">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLowStock && (
                            <span
                              title={`Low stock alert (threshold: ${p.lowStockAlert})`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200"
                            >
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              Low Stock ({p.stockOnHand})
                            </span>
                          )}
                          {!isLowStock && (
                            <span className="text-xs font-semibold text-slate-800">
                              {p.stockOnHand}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-center">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setStockModalProduct(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition"
                            title="Add Stock"
                          >
                            <PackagePlus className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Product Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
            of <strong className="text-slate-800">{total}</strong> products
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
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        categories={categories}
        onAddProduct={addProduct}
        onAddCategoryInline={(catName) => {
          const res = addCategory({ name: catName, status: 'Active' });
          return res.category;
        }}
      />

      <EditProductModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        product={editingProduct}
        categories={categories}
        onUpdateProduct={(id, updates) => updateProduct(id, updates)}
        onOpenAddStock={(prod) => setStockModalProduct(prod)}
      />

      <AddStockModal
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        product={stockModalProduct}
        onAddStock={(id, qty) => addStock(id, qty)}
      />
    </div>
  );
}
