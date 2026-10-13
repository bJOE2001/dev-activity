'use client';

import React, { useState } from 'react';
import { PaymentMethod } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { X, Upload, Banknote, CreditCard, Building2, Check } from 'lucide-react';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderTotal: number;
  currentBalance: number;
  onAddPayment: (paymentData: {
    method: PaymentMethod;
    amount: number;
    referenceNumber?: string;
    note?: string;
    bankName?: string;
    bankAccountNumber?: string;
    checkNumber?: string;
    checkDate?: string;
    proofOfPayment?: string;
  }) => void;
}

export function AddPaymentModal({
  isOpen,
  onClose,
  orderTotal,
  currentBalance,
  onAddPayment,
}: AddPaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('Cash');
  const [amount, setAmount] = useState<string>(currentBalance > 0 ? currentBalance.toString() : '0');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [note, setNote] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [checkNumber, setCheckNumber] = useState('');
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0.');
      return;
    }

    if (method === 'Check') {
      if (!bankName.trim() || !checkNumber.trim()) {
        setError('Bank Name and Check Number are required for check payments.');
        return;
      }
    }

    if (method === 'Bank Transfer') {
      if (!bankName.trim()) {
        setError('Bank Name is required for bank transfers.');
        return;
      }
    }

    onAddPayment({
      method,
      amount: numAmount,
      referenceNumber: referenceNumber.trim() || undefined,
      note: note.trim() || undefined,
      bankName: bankName.trim() || undefined,
      bankAccountNumber: bankAccountNumber.trim() || undefined,
      checkNumber: checkNumber.trim() || undefined,
      checkDate: checkDate || undefined,
      proofOfPayment: proofFile || undefined,
    });

    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Payment</h3>
            <p className="text-xs text-slate-500">Record a customer payment against this order</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Order balance info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Order Total</p>
              <p className="text-base font-bold text-slate-800">{formatCurrency(orderTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Remaining Balance</p>
              <p className="text-base font-bold text-emerald-600">{formatCurrency(currentBalance)}</p>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Check', 'Bank Transfer'] as PaymentMethod[]).map((tab) => {
                const isActive = method === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setMethod(tab);
                      setError(null);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {tab === 'Cash' && <Banknote className="w-5 h-5 mb-1.5" />}
                    {tab === 'Check' && <CreditCard className="w-5 h-5 mb-1.5" />}
                    {tab === 'Bank Transfer' && <Building2 className="w-5 h-5 mb-1.5" />}
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Amount Paid (₱) <span className="text-rose-500">*</span>
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
                className="w-full h-11 pl-8 pr-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium text-base focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Tab Specific Inputs */}
          {method === 'Cash' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Reference Number / Receipt #
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. CSH-20261013"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Note
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Paid in cash at register"
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {method === 'Check' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. BDO / Metrobank"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bank Account #
                  </label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="e.g. 004-9812-334"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Check Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    placeholder="e.g. CHK-98123"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Check Date
                  </label>
                  <input
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Proof of payment */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Proof of Payment (Photo/Scan)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-600 font-medium">
                    {proofFile ? `Attached: ${proofFile}` : 'Upload check scan or deposit slip'}
                  </span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {method === 'Bank Transfer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. BPI, BDO, UnionBank"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. UBP-987123"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Proof of payment */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  Proof of Payment (Receipt / Transfer Screenshot)
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 transition">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-600 font-medium">
                    {proofFile ? `Attached: ${proofFile}` : 'Upload transfer screenshot or receipt'}
                  </span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
