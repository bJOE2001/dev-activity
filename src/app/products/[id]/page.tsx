'use client';

import React, { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { AddStockModal } from '@/components/modals/AddStockModal';
import { ChevronLeft, ChevronDown, Plus } from 'lucide-react';

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const { products, categories, updateProduct, addStock, addToast } = useStore();

  const product = products.find((p) => p.id === id);

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stockOnHand, setStockOnHand] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [imageUrl, setImageUrl] = useState('');

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setSku(product.sku || '');
      setName(product.name || '');
      setCategoryId(product.categoryId || '');
      setStockOnHand(product.stockOnHand ?? 0);
      setLowStockAlert(product.lowStockAlert !== undefined ? String(product.lowStockAlert) : '0');
      setPrice(product.price !== undefined ? product.price.toFixed(2) : '0.00');
      setCost(product.cost !== undefined ? product.cost.toFixed(2) : '0.00');
      setStatus(product.status || 'Active');
      setImageUrl(product.imageUrl || '');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl my-12 p-8 text-center bg-white rounded-xl border border-[#E5EAF2]">
        <h2 className="text-base font-semibold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">The product you are looking for does not exist.</p>
        <Link
          href="/products"
          className="inline-block mt-4 px-4 py-2 bg-[#0F1E36] text-white rounded-lg text-xs font-medium"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSave = () => {
    const numPrice = parseFloat(price) || 0;
    const numCost = parseFloat(cost) || 0;
    const numLowAlert = parseInt(lowStockAlert, 10) || 0;
    const finalCatName = selectedCategory ? selectedCategory.name : product.categoryName;

    updateProduct(product.id, {
      sku: sku.trim(),
      name: name.trim(),
      categoryId: categoryId || product.categoryId,
      categoryName: finalCatName,
      price: numPrice,
      cost: numCost,
      lowStockAlert: numLowAlert,
      imageUrl: imageUrl.trim(),
      status,
    });

    addToast('Product Updated', `Changes to "${name}" were saved.`);
    router.push('/products');
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-5">
      {/* Top Header matching Figma 05.03 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-[20px] font-semibold text-[#172033] hover:text-[#0B1F44] transition"
          >
            <ChevronLeft className="w-5 h-5 text-[#172033]" />
            <span>Product Details</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddStockOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            Add Stock
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 rounded-lg bg-[#0F1E36] text-white text-xs font-medium hover:bg-slate-800 transition cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </div>

      {/* Main Grid: Left Form Card, Right Media & Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Form Card */}
        <div className="lg:col-span-8 bg-white border border-[#E5EAF2] rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              SKU (Stock Keeping Unit)
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="SKU (Stock Keeping Unit)"
              className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Product Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Product Name"
              className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Category
            </label>
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs text-left flex items-center justify-between text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <span className={selectedCategory ? 'text-slate-900' : 'text-slate-400'}>
                {selectedCategory ? selectedCategory.name : product.categoryName || 'Select category'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isCategoryOpen && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategoryId(c.id);
                      setIsCategoryOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 transition ${
                      categoryId === c.id ? 'font-semibold text-[#0F1E36] bg-slate-50' : 'text-slate-700'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Stock on Hand
              </label>
              {/* Disabled/Read-only light blue-gray background in Figma 05.03 */}
              <input
                type="text"
                readOnly
                value={stockOnHand}
                className="w-full h-9 px-3.5 rounded-lg border border-slate-200 bg-[#E9EDF4] text-xs text-slate-800 cursor-not-allowed select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Low Stock Alert
              </label>
              <input
                type="number"
                min="0"
                value={lowStockAlert}
                onChange={(e) => setLowStockAlert(e.target.value)}
                placeholder="10"
                className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="10000.00"
                className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Cost per item
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="5000.00"
                className="w-full h-9 px-3.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Right Card: Media & Status */}
        <div className="lg:col-span-4 bg-white border border-[#E5EAF2] rounded-xl p-5 space-y-5">
          {/* Media box */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Media
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
              {imageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-28 h-28 object-contain rounded-lg border border-slate-200 mb-2 bg-white"
                  />
                  <label className="cursor-pointer text-[11px] text-slate-600 hover:text-slate-900 underline mt-1">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setImageUrl(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1.5 py-4">
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-normal text-slate-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setImageUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Status
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setStatus('Active')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Active'
                    ? 'bg-[#0F1E36] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus('Inactive')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  status === 'Inactive'
                    ? 'bg-[#0F1E36] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        product={product}
        onAddStock={(prodId, qty) => {
          addStock(prodId, qty);
          setStockOnHand((prev) => prev + qty);
        }}
      />
    </div>
  );
}
