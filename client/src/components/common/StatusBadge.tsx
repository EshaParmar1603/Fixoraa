import React from 'react';
import { BookingStatus, PaymentStatus, ComplaintStatus, ComplaintPriority } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus | PaymentStatus | ComplaintStatus | ComplaintPriority | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Booking & Payment positive
      case 'CONFIRMED':
      case 'COMPLETED':
      case 'PAID':
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      // In Progress / In Investigation
      case 'IN_PROGRESS':
      case 'IN_INVESTIGATION':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      // Pending / Warning
      case 'PENDING':
      case 'OPEN':
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      // Negative / Critical
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'HIGH':
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      // Low / Info
      case 'LOW':
      case 'CLOSED':
      case 'REFUNDED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ');
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border transition-colors capitalize ${getBadgeStyle()} ${sizeClasses[size]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
