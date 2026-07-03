import type { OrderListItem } from '../lib/types';
import { T } from '../lib/theme';
import { Badge } from './Badge';

export function Sidebar({ orders, activeId, onSelect, onNew }: {
  orders: OrderListItem[];
  activeId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <aside style={{ width: 260, flexShrink: 0, background: T.white, borderRight: `1px solid ${T.slate200}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${T.slate100}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.blueGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 10h8M8 14h5" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.slate900, lineHeight: 1.2 }}>ธนะพัฒน์</div>
            <div style={{ fontSize: 10, color: T.slate500, letterSpacing: '.08em' }}>PRINTING CO., LTD.</div>
          </div>
        </div>
        <button onClick={onNew} style={{ width: '100%', padding: '9px 14px', background: T.blueGrad, color: T.white, border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 2px 8px rgba(29,78,216,.19)', transition: 'opacity .2s', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '.88'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Order
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.slate500, letterSpacing: '.1em', textTransform: 'uppercase', padding: '0 6px 8px' }}>Recent Orders</div>
        {orders.map(o => (
          <div key={o.id} onClick={() => onSelect(o.id)}
            style={{ padding: '10px 10px', borderRadius: 10, cursor: 'pointer', marginBottom: 3, background: o.id === activeId ? T.blue50 : 'transparent', border: `1px solid ${o.id === activeId ? T.blue100 : 'transparent'}`, transition: 'all .15s' }}
            onMouseEnter={e => { if (o.id !== activeId) e.currentTarget.style.background = T.slate50; }}
            onMouseLeave={e => { if (o.id !== activeId) e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: o.id === activeId ? T.blue700 : T.slate700 }}>{o.id}</span>
              <Badge status={o.status} />
            </div>
            <div style={{ fontSize: 11, color: T.slate500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.preview}</div>
            <div style={{ fontSize: 10, color: T.slate300, marginTop: 3 }}>{o.time}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.slate100}` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.slate500, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 10 }}>เดือนนี้</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[{ n: '24', l: 'Orders' }, { n: '89%', l: 'On-time' }].map(s => (
            <div key={s.l} style={{ background: T.slate50, borderRadius: 10, padding: '10px 12px', border: `1px solid ${T.slate100}` }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.blue700, lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 10, color: T.slate500, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
