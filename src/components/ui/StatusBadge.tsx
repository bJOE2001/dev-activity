import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: OrderStatus | 'Active' | 'Inactive' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let textColor = 'text-slate-700';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case 'Paid':
    case 'Active':
      textColor = 'text-slate-800';
      dotColor = 'bg-[#10B981]';
      break;
    case 'Partial':
      textColor = 'text-slate-800';
      dotColor = 'bg-[#0F1E36]';
      break;
    case 'Unpaid':
      textColor = 'text-slate-800';
      dotColor = 'bg-[#F59E0B]';
      break;
    case 'Overdue':
      textColor = 'text-slate-800';
      dotColor = 'bg-[#EF4444]';
      break;
    case 'Draft':
    case 'Inactive':
      textColor = 'text-slate-600';
      dotColor = 'bg-[#94A3B8]';
      break;
    case 'Cancelled':
      textColor = 'text-slate-400 line-through';
      dotColor = 'bg-slate-400';
      break;
    default:
      textColor = 'text-slate-700';
      dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-medium',
        textColor,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', dotColor)} />
      {status}
    </span>
  );
}
