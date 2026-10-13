'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { Category } from '@/lib/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AddCategoryModal, CategoryDetailsModal } from '@/components/modals/CategoryModals';
import {
  Search,
  Plus,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Edit,
} from 'lucide-react';

export default function CategoryListPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();

  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Filter & Search
  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'asc') return a.name.localeCompare(b.name);
        return b.name.localeCompare(a.name);
      });
  }, [categories, search, sortOrder]);

  const total = filteredCategories.length;
  const totalPages = Math.ceil(total / rowsPerPage) || 1;
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, currentPage, rowsPerPage]);

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Page Heading */}
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#172033]">
          Category List
        </h1>
      </div>

      {/* Category List Container */}
      <section className="overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
        {/* Search and Add Category Bar */}
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
              placeholder="Search Category"
              className="h-[29px] w-full rounded-lg border border-[#E5EAF2] bg-white pl-3 pr-8 text-[11px] text-[#25324A] outline-none transition placeholder:text-[#9AA8BC] focus:border-[#102348] focus:ring-1 focus:ring-[#102348]/10"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-[29px] items-center justify-center gap-1.5 rounded-lg bg-[#0B1F44] px-3 text-[11px] font-medium text-white transition hover:bg-[#173363] cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            Add Category
          </button>
        </div>

        {/* Category Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-left">
            <thead>
              <tr className="h-[31px] border-b border-[#EDF0F5] bg-[#F7F9FC] text-[10px] font-medium text-[#263650]">
                <th className="px-3 font-medium">
                  <div
                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="inline-flex items-center gap-1 cursor-pointer select-none hover:text-[#0B1F44]"
                  >
                    <span>Category</span>
                    <span className="text-[10px]">⌵</span>
                  </div>
                </th>
                <th className="px-3 font-medium text-right sm:text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF0F5] text-[11px] text-[#25324A]">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-8 text-center text-slate-400">
                    No categories found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                paginated.map((cat) => {
                  return (
                    <tr
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className="h-[40px] hover:bg-[#F9FBFC] transition cursor-pointer"
                    >
                      <td className="px-3 py-2 text-[#25324A]">
                        {cat.name}
                      </td>
                      <td className="px-3 py-2 text-right sm:text-left">
                        <StatusBadge status={cat.status} />
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
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCategory={addCategory}
      />

      <CategoryDetailsModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        productCount={selectedCategory ? getProductCountForCategory(selectedCategory.id) : 0}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
      />
    </div>
  );
}
