import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

export function formatDateTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'MMM d, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
}

export function formatPassportId(id: string): string {
  // Format: BAT-YYYY-XXXXX
  if (id.startsWith('BAT-')) return id;
  const year = new Date().getFullYear();
  const shortId = id.slice(0, 5).toUpperCase();
  return `BAT-${year}-${shortId}`;
}

export function generatePassportId(): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `BAT-${year}-${random}`;
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: 'slate',
    SUBMITTED: 'blue',
    APPROVED: 'emerald',
    PUBLISHED: 'green',
    REJECTED: 'red',
  };
  return colors[status] ?? 'slate';
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
