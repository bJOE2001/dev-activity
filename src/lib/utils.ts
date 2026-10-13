import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-₱${formatted}` : `₱${formatted}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function addDays(dateString: string, days: number): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    d.setDate(d.getDate() + Number(days || 0));
    return d.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

export function computeOrderStatus(
  status: string,
  total: number,
  paid: number,
  dueDate: string
): 'Draft' | 'Unpaid' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled' {
  if (status === 'Draft' || status === 'Cancelled') {
    return status as 'Draft' | 'Cancelled';
  }
  if (paid >= total && total > 0) {
    return 'Paid';
  }
  // Check if overdue
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  if (!isNaN(due.getTime()) && due < now && paid < total) {
    return 'Overdue';
  }
  if (paid > 0) {
    return 'Partial';
  }
  return 'Unpaid';
}
