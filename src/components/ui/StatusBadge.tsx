import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: OrderStatus | 'Active' | 'Inactive' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Paid':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Partial':
      badgeStyles = 'bg-slate-900 text-white border-slate-900 shadow-xs';
      dotColor = 'bg-amber-400';
      break;
    case 'Unpaid':
      badgeStyles = 'bg-amber-50 text-amber-700 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case 'Overdue':
      badgeStyles = 'bg-rose-50 text-rose-700 border-rose-200';
      dotColor = 'bg-rose-500';
      break;
    case 'Draft':
      badgeStyles = 'bg-slate-100 text-slate-600 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
    case 'Cancelled':
      badgeStyles = 'bg-zinc-100 text-zinc-500 border-zinc-200 line-through';
      dotColor = 'bg-zinc-400';
      break;
    case 'Active':
      badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case 'Inactive':
      badgeStyles = 'bg-slate-100 text-slate-500 border-slate-200';
      dotColor = 'bg-slate-400';
      break;
    default:
      badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        badgeStyles,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      {status}
    </span>
  );
}
