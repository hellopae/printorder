import type { Order } from '../lib/types';
import { T, fmt, fmtI } from '../lib/theme';
import { calcPrice } from '../lib/pricing';

export function RightPanel({ order, onPricing }: { order: Order; onPricing: () => void }) {
  const price = calcPrice(order);
  const steps = [
    { label: 'ประเภทงาน', done: !!order.type, active: false },
    { label: 'จำนวน', done: !!order.qty, active: false },
    { label: 'กระดาษ & Finishing', done: !!(order.paper && order.finishing), active: false },
    { label: 'ยืนยันราคา', done: false, active: !!(order.type && order.qty && order.paper && order.finishing) },
    { label: 'ออกใบเสนอราคา', done: false, active: false },
    { label: 'แจ้งทีมงาน', done: false, active: false },
  ];
  return (
    <aside style={{ width: 272, flexShrink: 0, background: T.white, borderLeft: `1px solid ${T.slate200}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <div style={{ padding: '20px 18px 16px', borderBottom: `1px solid ${T.slate100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Order Summary</div>
        <div style={{ background: T.blue700, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#93C5FD', marginBottom: 2 }}>ราคาเบื้องต้น (incl. VAT)</div>
          {price
            ? <>
              <div style={{ fontSize: 28, fontWeight: 700, color: T.white, lineHeight: 1.1 }}>฿{fmt(price.finalPrice)}</div>
              <div style={{ fontSize: 11, color: '#93C5FD', marginTop: 4 }}>฿{fmt(price.pricePerPiece)} / ชุด</div>
            </>
            : <div style={{ fontSize: 14, color: '#93C5FD', paddingTop: 4 }}>ระบุข้อมูลเพื่อดูราคา</div>
          }
        </div>
        {([
          ['ประเภท', order.type || '—'],
          ['จำนวน', order.qty ? `${fmtI(order.qty)} ชุด` : '—'],
          ['กระดาษ', order.paper || '—'],
          ['Finishing', order.finishing || '—'],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.slate100}`, fontSize: 12 }}>
            <span style={{ color: T.slate500 }}>{k}</span>
            <span style={{ color: v === '—' ? T.slate400 : T.slate900, fontWeight: v === '—' ? 400 : 600, fontSize: v.length > 15 ? 10 : 12 }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 18px', borderBottom: `1px solid ${T.slate100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 14 }}>Progress</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: s.done ? '#F0FDF4' : s.active ? T.blue50 : T.slate50, border: `1.5px solid ${s.done ? '#22C55E' : s.active ? T.blue500 : T.slate200}`, color: s.done ? T.green : s.active ? T.blue600 : T.slate400 }}>
                {s.done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 12, fontWeight: s.active ? 600 : 400, color: s.done ? T.green : s.active ? T.blue700 : T.slate400 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 18px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.slate400, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Export</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { icon: '📄', label: 'ออกใบเสนอราคา PDF', primary: true, action: undefined as (() => void) | undefined },
            { icon: '📊', label: 'ดูต้นทุนละเอียด', primary: false, action: onPricing },
            { icon: '📧', label: 'ส่ง Email ลูกค้า', primary: false, action: undefined },
            { icon: '💬', label: 'แจ้งทีมงาน LINE', primary: false, action: undefined },
          ].map(({ icon, label, primary, action }) => (
            <button key={label} onClick={action} style={{ width: '100%', padding: '9px 12px', background: primary ? T.blue700 : T.slate50, color: primary ? T.white : T.slate700, border: `1px solid ${primary ? T.blue700 : T.slate200}`, borderRadius: 9, fontSize: 12, fontWeight: primary ? 600 : 500, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', boxShadow: primary ? '0 2px 8px rgba(29,78,216,.15)' : 'none', transition: 'all .15s' }}
              onMouseEnter={e => { if (!primary) { e.currentTarget.style.borderColor = T.blue400; e.currentTarget.style.color = T.blue700; } }}
              onMouseLeave={e => { if (!primary) { e.currentTarget.style.borderColor = T.slate200; e.currentTarget.style.color = T.slate700; } }}>
              <span style={{ fontSize: 14 }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
