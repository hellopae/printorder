import { createContext, useContext } from 'react';
import type { Message, Order } from '../lib/types';
import { T, fmt, fmtI } from '../lib/theme';
import { calcPrice } from '../lib/pricing';

export const SendCtx = createContext<((text: string) => void) | null>(null);

export function ChipButton({ label }: { label: string }) {
  const send = useContext(SendCtx);
  return (
    <button onClick={() => send && send(label)} style={{ background: T.blue50, border: `1px solid ${T.blue100}`, color: T.blue700, padding: '5px 13px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
      onMouseEnter={e => { e.currentTarget.style.background = T.blue700; e.currentTarget.style.color = T.white; e.currentTarget.style.borderColor = T.blue700; }}
      onMouseLeave={e => { e.currentTarget.style.background = T.blue50; e.currentTarget.style.color = T.blue700; e.currentTarget.style.borderColor = T.blue100; }}>
      {label}
    </button>
  );
}

export function SpecCard({ order }: { order: Order }) {
  const price = calcPrice(order);
  const rows: [string, string][] = [
    ['ประเภทงาน', order.type || '—'],
    ['จำนวน', order.qty ? `${fmtI(order.qty)} ชุด` : '—'],
    ['กระดาษ', order.paper || '—'],
    ['Finishing', order.finishing || '—'],
    ['สี', '4 สี (CMYK) ทั้ง 2 หน้า'],
    ['ระยะเวลา', '5–7 วันทำการ'],
  ];
  return (
    <div style={{ marginTop: 12, background: T.white, border: `1px solid ${T.slate200}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: T.blue50, padding: '8px 14px', borderBottom: `1px solid ${T.blue100}` }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: T.blue700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Order Summary</span>
      </div>
      <div style={{ padding: '10px 14px' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${T.slate100}`, fontSize: 13 }}>
            <span style={{ color: T.slate500 }}>{k}</span>
            <span style={{ color: T.slate900, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ margin: '0 14px 14px', background: T.blue700, borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: '#93C5FD' }}>ราคาเบื้องต้น</div>
          <div style={{ fontSize: 10, color: '#60A5FA', marginTop: 1 }}>รวม VAT 7%</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {price
            ? <div style={{ fontSize: 26, fontWeight: 700, color: T.white, lineHeight: 1 }}>฿{fmt(price.finalPrice)}</div>
            : <div style={{ fontSize: 13, color: '#93C5FD' }}>กรุณาระบุข้อมูลให้ครบ</div>
          }
          {price && <div style={{ fontSize: 10, color: '#93C5FD', marginTop: 2 }}>฿{fmt(price.pricePerPiece)} / ชุด</div>}
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({ msg, order }: { msg: Message; order: Order }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', gap: 10, flexDirection: isUser ? 'row-reverse' : 'row', animation: 'fadeSlideUp .25s ease' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: isUser ? T.blue100 : T.blueGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, fontSize: isUser ? 11 : 13, fontWeight: 700, color: isUser ? T.blue700 : T.white, boxShadow: isUser ? 'none' : '0 2px 8px rgba(29,78,216,.25)' }}>
        {isUser ? 'K' : 'T'}
      </div>
      <div style={{ maxWidth: '68%' }}>
        <div style={{ padding: '12px 16px', background: isUser ? T.blue700 : T.white, color: isUser ? T.white : T.slate900, border: `1px solid ${isUser ? T.blue600 : T.slate200}`, borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 14, lineHeight: 1.65, boxShadow: isUser ? '0 2px 12px rgba(29,78,216,.14)' : '0 1px 4px rgba(0,0,0,.03)' }}>
          {msg.text.split('\n').map((line, i, arr) => (
            <span key={i}><span dangerouslySetInnerHTML={{ __html: line }}></span>{i < arr.length - 1 && <br />}</span>
          ))}
          {msg.showSpec && <SpecCard order={order} />}
          {msg.chips && msg.chips.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
              {msg.chips.map(c => <ChipButton key={c} label={c} />)}
            </div>
          )}
        </div>
        <div style={{ fontSize: 10, color: T.slate400, marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>{msg.time}</div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, animation: 'fadeSlideUp .2s ease' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: T.blueGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: T.white, boxShadow: '0 2px 8px rgba(29,78,216,.25)' }}>T</div>
      <div style={{ padding: '14px 18px', background: T.white, border: `1px solid ${T.slate200}`, borderRadius: '16px 16px 16px 4px', boxShadow: '0 1px 4px rgba(0,0,0,.03)', display: 'flex', gap: 5, alignItems: 'center' }}>
        {[0, .2, .4].map(d => (
          <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: T.blue400, animation: `typingBounce .9s ${d}s infinite` }}></div>
        ))}
      </div>
    </div>
  );
}
