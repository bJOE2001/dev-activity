'use client';

import React, { useState } from 'react';
import { Category } from '@/lib/types';
import { X, FolderPlus, Edit, Trash2 } from 'lucide-react';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (data: { name: string; status: 'Active' | 'Inactive' }) => { success: boolean; message?: string };
}

export function AddCategoryModal({ isOpen, onClose, onAddCategory }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = onAddCategory({ name, status });
    if (!result.success) {
      setError(result.message || 'Failed to add category');
      return;
    }
    setName('');
    setStatus('Active');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-1 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Add New Category</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Create a category to group your products.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Video card"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              autoFocus
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Category names must be unique.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Active'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Inactive' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                Inactive
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              Add Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  productCount: number;
  onUpdateCategory: (id: string, updates: Partial<Category>) => { success: boolean; message?: string };
  onDeleteCategory: (id: string) => { success: boolean; message?: string };
}

export function CategoryDetailsModal({
  isOpen,
  onClose,
  category,
  productCount,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryDetailsModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [status, setStatus] = useState<'Active' | 'Inactive'>(category?.status || 'Active');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setStatus(category.status);
      setError(null);
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = onUpdateCategory(category.id, { name, status });
    if (!result.success) {
      setError(result.message || 'Failed to update category');
      return;
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      const result = onDeleteCategory(category.id);
      if (!result.success) {
        setError(result.message || 'Cannot delete category');
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-1 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Category Details</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Edit the name or availability of this category.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Category Name"
              className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {productCount} products use this category
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Active'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Inactive' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                Inactive
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
              >
                Save changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
