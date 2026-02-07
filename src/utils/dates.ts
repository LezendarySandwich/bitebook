function toSQLiteUTC(d: Date): string {
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

export function getStartOfDay(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return toSQLiteUTC(d);
}

export function getEndOfDay(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return toSQLiteUTC(d);
}

export function getStartOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return toSQLiteUTC(d);
}

export function getLastWeekRange(): { start: string; end: string } {
  const now = new Date();
  const startOfThisWeek = new Date(now);
  const day = startOfThisWeek.getDay();
  const diff = startOfThisWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfThisWeek.setDate(diff);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  return {
    start: toSQLiteUTC(startOfLastWeek),
    end: toSQLiteUTC(endOfLastWeek),
  };
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor(
    (today.getTime() - dateDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}
