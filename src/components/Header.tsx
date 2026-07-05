import type { Page } from '../lib/types';
import { T } from '../lib/theme';
import { PRINTCAL_URL, PRINTCOST_URL } from '../lib/costEngine';

const linkStyle: React.CSSProperties = {
  padding: '6px 12px', background: 'rgba(255,255,255,.13)', borderRadius: 8,
  fontSize: 12, fontWeight: 600, color: 'white', textDecoration: 'none',
  border: '1px solid rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', gap: 5,
};

export function Header({ page, onNav, onNewBlank, editorActive }: {
  page: Page;
  onNav: (p: Page) => void;
  onNewBlank: () => void;
  editorActive: boolean;
}) {
  const NAV: { label: string; page: Page; show: boolean }[] = [
    { label: '📋 ใบเสนอราคา', page: 'quotations', show: true },
    { label: '✏️ ใบที่กำลังทำ', page: 'editor', show: editorActive },
  ];
  return (
    <header style={{
      height: 58, flexShrink: 0, background: T.blueGrad,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      justifyContent: 'space-between', boxShadow: '0 2px 16px rgba(15,45,107,.25)', zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 10h8M8 14h5" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>ธนะพัฒน์พริ้นติ้ง</div>
          <div style={{ fontSize: 10, color: '#93C5FD', letterSpacing: '.06em' }}>QUOTATION ASSISTANT</div>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: 2 }}>
        {NAV.filter(n => n.show).map(({ label, page: p }) => {
          const active = p === page;
          return (
            <button key={label} onClick={() => onNav(p)} style={{
              background: active ? 'rgba(255,255,255,.18)' : 'none', border: 'none', cursor: 'pointer',
              color: active ? 'white' : '#93C5FD', padding: '6px 14px', borderRadius: 8,
              fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '.02em', transition: 'all .15s',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
            >{label}</button>
          );
        })}
        <button onClick={onNewBlank} style={{
          background: 'none', border: '1px dashed rgba(255,255,255,.35)', cursor: 'pointer',
          color: '#BAE6FD', padding: '6px 14px', borderRadius: 8, marginLeft: 6,
          fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
        >+ ใบเปล่า</button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <a href={PRINTCOST_URL} target="_blank" rel="noopener" style={linkStyle}>📊 PrintCost</a>
        <a href={PRINTCAL_URL} target="_blank" rel="noopener" style={linkStyle}>🖨️ PrintCal</a>
      </div>
    </header>
  );
}
