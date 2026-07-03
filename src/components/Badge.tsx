import type { OrderStatus } from '../lib/types';
import { T } from '../lib/theme';

const MAP: Record<OrderStatus, { label: string; bg: string; color: string; dot: string }> = {
  new: { label: 'ใหม่', bg: T.blue50, color: T.blue700, dot: T.blue500 },
  pending: { label: 'รอดำเนินการ', bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  done: { label: 'เสร็จแล้ว', bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
  confirmed: { label: 'ยืนยันแล้ว', bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
};

export function Badge({ status }: { status: OrderStatus }) {
  const m = MAP[status] || MAP.new;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: m.bg, color: m.color, letterSpacing: '.02em' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.dot, display: 'inline-block' }}></span>
      {m.label}
    </span>
  );
}
