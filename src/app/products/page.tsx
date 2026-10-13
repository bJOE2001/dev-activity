'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { AddProductModal, EditProductModal, DeleteProductDialog } from '@/components/modals/ProductModals';
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Package,
  PackagePlus,
  Edit,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function ProductListPage() {
  const router = useRouter();
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    addStock,
    deleteProduct,
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
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

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
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page Heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Product List
        </h1>
      </div>

      {/* Product List Container */}
      <section className="overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
        {/* Search and Add Product Bar */}
        <div className="flex min-h-[49px] flex-wrap items-center gap-2.5 border-b border-[#EDF0F5] px-3 py-2.5 sm:px-3">
          <div className="relative w-full sm:w-[192px]">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#263650]" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Product"
              className="h-[29px] w-full rounded-lg border border-[#E5EAF2] bg-white pl-3 pr-8 text-[11px] text-[#25324A] outline-none transition placeholder:text-[#9AA8BC] focus:border-[#102348] focus:ring-1 focus:ring-[#102348]/10"
            />
          </div>

          <Link
            href="/products/create"
            className="inline-flex h-[29px] items-center justify-center gap-1.5 rounded-lg bg-[#0B1F44] px-3 text-[11px] font-medium text-white transition hover:bg-[#173363] cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Product
          </Link>
        </div>

        {/* Status Tabs */}
        <div className="border-b border-[#EDF0F5] px-2 sm:px-3">
          <div className="flex items-center gap-1 overflow-x-auto py-1.5">
            {(['All', 'Active', 'Inactive'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`shrink-0 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#E9EDF4] text-[#102348]'
                      : 'bg-transparent text-[#293751] hover:bg-[#F4F6FA]'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="h-[31px] border-b border-[#EDF0F5] bg-[#F7F9FC] text-[10px] font-medium text-[#263650]">
                <th className="px-3 font-medium">
                  <div
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-[#0B1F44]"
                  >
                    <span>Product</span>
                    <span className="text-[10px]">⌵</span>
                  </div>
                </th>
                <th className="px-3 font-medium">Category</th>
                <th className="px-3 font-medium">Price</th>
                <th className="px-3 font-medium">Stock on Hand</th>
                <th className="px-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F5] text-[11px] text-[#25324A]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No products found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      onClick={() => router.push(`/products/${p.id}`)}
                      className="h-[48px] hover:bg-[#F9FBFC] transition cursor-pointer"
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-8 h-8 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0 p-0.5"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-normal text-[#25324A] truncate max-w-[280px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-1.5 text-[#55657E]">
                        {p.categoryName}
                      </td>
                      <td className="px-3 py-1.5 text-[#25324A]">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-3 py-1.5 text-[#55657E]">
                        {p.stockOnHand}
                      </td>
                      <td className="px-3 py-1.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 text-[11px] text-[#55657E] border-t border-[#EDF0F5]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="h-[25px] rounded border border-[#E5EAF2] bg-white px-2 pr-6 text-[11px] text-[#25324A] outline-none appearance-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#55657E]">
                ⌵
              </span>
            </div>
            <span>
              {total > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{' '}
              {Math.min(currentPage * rowsPerPage, total)} of {total}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC] cursor-pointer"
            >
              &lt;
            </button>
            {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`flex h-[25px] w-[25px] items-center justify-center rounded text-[11px] font-medium transition cursor-pointer ${
                  currentPage === pg
                    ? 'bg-[#0B1F44] text-white'
                    : 'border border-[#E5EAF2] bg-white text-[#55657E] hover:bg-[#F8FAFC]'
                }`}
              >
                {pg}
              </button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="px-1 text-[#8A99AD]">...</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  className={`flex h-[25px] w-[25px] items-center justify-center rounded text-[11px] font-medium transition cursor-pointer ${
                    currentPage === totalPages
                      ? 'bg-[#0B1F44] text-white'
                      : 'border border-[#E5EAF2] bg-white text-[#55657E] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex h-[25px] w-[25px] items-center justify-center rounded border border-[#E5EAF2] bg-white text-[#55657E] disabled:opacity-40 hover:bg-[#F8FAFC] cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      </section>

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
        onDeleteProduct={(id) => deleteProduct(id)}
      />

      <AddStockModal
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        product={stockModalProduct}
        onAddStock={(id, qty) => addStock(id, qty)}
      />

      <DeleteProductDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        productName={deletingProduct?.name || ''}
        onConfirmDelete={() => {
          if (deletingProduct) {
            deleteProduct(deletingProduct.id);
          }
        }}
      />
    </div>
  );
}
