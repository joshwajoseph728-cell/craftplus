import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return formatDistanceToNowStrict(date, { addSuffix: true });
  } catch (err) {
    return 'recently';
  }
}

export function formatShortRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const distance = formatDistanceToNowStrict(date);
    return distance
      .replace(' seconds', 's')
      .replace(' second', 's')
      .replace(' minutes', 'm')
      .replace(' minute', 'm')
      .replace(' hours', 'h')
      .replace(' hour', 'h')
      .replace(' days', 'd')
      .replace(' day', 'd')
      .replace(' months', 'mo')
      .replace(' month', 'mo')
      .replace(' years', 'y')
      .replace(' year', 'y');
  } catch (err) {
    return 'now';
  }
}

export function formatMessageTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  } catch (err) {
    return '';
  }
}

export function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function extractHashtags(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  if (!matches) return [];
  return Array.from(new Set(matches.map((tag) => tag.slice(1).toLowerCase())));
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
