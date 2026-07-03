import type { Page } from '../lib/types';
import { T } from '../lib/theme';

const NAV: { label: string; page: Page }[] = [
  { label: 'Orders', page: 'chat' },
  { label: 'Quotations', page: 'quotations' },
];

export function Header({ page, onNav, onToggleSidebar, orderLabel }: {
  page: Page;
  onNav: (p: Page) => void;
  onToggleSidebar: () => void;
  orderLabel: string;
}) {
  return (
    <header style={{
      height: 58, flexShrink: 0, background: T.blueGrad,
      display: 'flex', alignItems: 'center', padding: '0 20px',
      justifyContent: 'space-between', boxShadow: '0 2px 16px rgba(15,45,107,.25)',
      position: page === 'pricing' ? 'sticky' : 'relative', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {page === 'pricing' ? (
          <>
            <button onClick={() => onNav('chat')} style={{
              background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)',
              borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 14,
            }}>←</button>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.25)' }}></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>วิธีคำนวณราคา</div>
              <div style={{ fontSize: 10, color: '#93C5FD', letterSpacing: '.06em' }}>{orderLabel}</div>
            </div>
          </>
        ) : (
          <>
            <button onClick={onToggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: .75, padding: 4 }}>
              <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M8 6h8M8 10h8M8 14h5" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>ธนะพัฒน์พริ้นติ้ง</div>
                <div style={{ fontSize: 10, color: '#93C5FD', letterSpacing: '.06em' }}>AI ORDER ASSISTANT</div>
              </div>
            </div>
          </>
        )}
      </div>

      {page !== 'pricing' && (
        <nav style={{ display: 'flex', gap: 2 }}>
          {NAV.map(({ label, page: p }) => {
            const active = p === page;
            return (
              <button key={label} onClick={() => onNav(p)} style={{
                background: active ? 'rgba(255,255,255,.18)' : 'none', border: 'none', cursor: 'pointer',
                color: active ? 'white' : '#93C5FD', padding: '6px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit', letterSpacing: '.03em', transition: 'all .15s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; }}
              >{label}</button>
            );
          })}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: page === 'pricing' ? 8 : 14 }}>
        {page === 'pricing' ? (
          <>
            <a href="https://hellopae.github.io/PrintCost/" target="_blank" rel="noopener" style={{ padding: '6px 14px', background: 'rgba(255,255,255,.15)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', gap: 6 }}>📊 PrintCost</a>
            <a href="https://hellopae.github.io/PrintCal/" target="_blank" rel="noopener" style={{ padding: '6px 14px', background: 'rgba(255,255,255,.15)', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'white', textDecoration: 'none', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', gap: 6 }}>🖨️ PrintCal</a>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#BAE6FD' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px rgba(74,222,128,.5)', animation: 'pulse 2s infinite' }}></div>
              AI Online
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer' }}>K</div>
          </>
        )}
      </div>
    </header>
  );
}
