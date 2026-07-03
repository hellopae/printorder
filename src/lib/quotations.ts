import type { Quotation } from './types';
import raw from '../data/quotations.json';

export const QUOTATIONS: Quotation[] = (raw as { quotations: Quotation[] }).quotations;

export type PriceAge = 'current' | 'older' | 'old' | 'unknown';

export function monthsSince(iso: string | null): number | null {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (isNaN(then)) return null;
  return (Date.now() - then) / (1000 * 60 * 60 * 24 * 30.44);
}

/** ใบเสนอราคาเก่า ราคาปัจจุบันอาจปรับขึ้นแล้ว — จัดช่วงอายุเพื่อติดป้ายเตือน */
export function priceAge(q: Quotation): PriceAge {
  const m = monthsSince(q.date);
  if (m === null) return 'unknown';
  if (m <= 12) return 'current';
  if (m <= 36) return 'older';
  return 'old';
}

export const AGE_BADGE: Record<PriceAge, { label: string; bg: string; color: string }> = {
  current: { label: 'ราคาปีนี้', bg: '#F0FDF4', color: '#15803D' },
  older: { label: 'ใบเก่า — ราคาอาจปรับขึ้น', bg: '#FFFBEB', color: '#B45309' },
  old: { label: 'เก่ามาก — ใช้อ้างอิงเท่านั้น', bg: '#FEF2F2', color: '#B91C1C' },
  unknown: { label: 'ไม่ทราบวันที่', bg: '#F1F5F9', color: '#64748B' },
};

export function searchQuotations(query: string, limit = 60): Quotation[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return QUOTATIONS.slice(0, limit);
  const out: Quotation[] = [];
  for (const q of QUOTATIONS) {
    const hay = [
      q.customer || '', q.quote_no || '', q.file,
      ...q.items.flatMap(it => [it.description, ...it.specs]),
    ].join(' ').toLowerCase();
    if (terms.every(t => hay.includes(t))) {
      out.push(q);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function fmtDate(q: Quotation): string {
  if (!q.date) return '—';
  const d = new Date(q.date);
  const s = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  return q.date_estimated ? `~${s}` : s;
}
