export const minutes = (value: number): number => value * 60 * 1000;
export const hours = (value: number): number => value * 60 * 60 * 1000;
export const days = (value: number): number => value * 24 * 60 * 60 * 1000;

export function isoNow(now: Date = new Date()): string {
  return now.toISOString();
}

export function dayKey(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isSameDay(a: string | Date, b: string | Date): boolean {
  return dayKey(a) === dayKey(b);
}

export function isYesterday(previous: string | Date, current: string | Date): boolean {
  const prev = new Date(dayKey(previous));
  const curr = new Date(dayKey(current));
  return curr.getTime() - prev.getTime() === days(1);
}

export function startOfWeekKey(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const day = date.getDay() || 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day + 1);
  return dayKey(date);
}

export function formatCountdown(ms: number): string {
  const safe = Math.max(0, ms);
  const totalMinutes = Math.ceil(safe / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
