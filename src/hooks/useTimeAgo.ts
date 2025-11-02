import { useEffect, useState } from 'react';

function formatTimeAgo(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat('vi', { numeric: 'auto' });

  const divisions: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 3600 * 24 * 365],
    ['month', 3600 * 24 * 30],
    ['day', 3600 * 24],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, secondsInUnit] of divisions) {
    if (Math.abs(diffInSeconds) >= secondsInUnit || unit === 'second') {
      const value = Math.round(diffInSeconds / secondsInUnit);
      return rtf.format(value, unit);
    }
  }

  return '';
}

export function useTimeAgo(date: Date | number) {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(date));

  useEffect(() => {
    const update = () => setTimeAgo(formatTimeAgo(date));

    update(); // update immediately on mount
    const interval = setInterval(update, 60 * 1000); // refresh every minute

    return () => clearInterval(interval);
  }, [date]);

  return timeAgo;
}
