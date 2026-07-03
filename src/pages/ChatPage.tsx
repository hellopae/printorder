import { useCallback, useEffect, useRef, useState } from 'react';
import type { Message, Order, OrderListItem } from '../lib/types';
import { T } from '../lib/theme';
import { EMPTY_ORDER, getAiReply } from '../lib/aiReply';
import { Sidebar } from '../components/Sidebar';
import { RightPanel } from '../components/RightPanel';
import { MessageBubble, SendCtx, TypingIndicator } from '../components/chat';

const INIT_ORDERS: OrderListItem[] = [
  { id: 'TPR-2026-089', preview: 'โบรชัวร์ A4 พับ 3 ตอน', status: 'new', time: '10:42' },
  { id: 'TPR-2026-088', preview: 'นามบัตร บริษัท ABC จำกัด', status: 'pending', time: 'เมื่อวาน' },
  { id: 'TPR-2026-087', preview: 'แบบฟอร์ม A5 ปก+เนื้อใน', status: 'done', time: '22 เม.ย.' },
  { id: 'TPR-2026-086', preview: 'ปฏิทินตั้งโต๊ะ 500 ชุด', status: 'done', time: '20 เม.ย.' },
  { id: 'TPR-2026-085', preview: 'โปสเตอร์ A2 ไวนิล', status: 'done', time: '18 เม.ย.' },
];

const WELCOME_MSG: Message = {
  id: 'w1', role: 'ai', time: '10:42',
  text: 'สวัสดีครับ! ยินดีต้อนรับสู่ <strong>ธนะพัฒน์พริ้นติ้ง</strong> 👋\n\nผมเป็น AI ผู้ช่วยรับออเดอร์ พร้อมช่วยรวบรวมข้อมูลงาน ประเมินราคา และออกใบเสนอราคาได้ทันทีครับ\n\nคุณต้องการพิมพ์งานประเภทไหนครับ?',
  chips: ['โบรชัวร์ / แผ่นพับ', 'นามบัตร', 'ปกหนังสือ / รายงาน', 'โปสเตอร์ / แบนเนอร์', 'แบบฟอร์ม', 'อื่นๆ'],
};

export function ChatPage({ order, onOrderChange, onPricing, sidebarOpen }: {
  order: Order;
  onOrderChange: (o: Order) => void;
  onPricing: () => void;
  sidebarOpen: boolean;
}) {
  const [orders, setOrders] = useState(INIT_ORDERS);
  const [activeId, setActiveId] = useState(INIT_ORDERS[0].id);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = endRef.current?.parentElement;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const now = () => { const d = new Date(); return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'); };

  const sendMessage = useCallback((text?: string) => {
    const t = (text || input).trim();
    if (!t) return;
    setInput('');
    setMessages(m => [...m, { id: Date.now() + 'u', role: 'user' as const, time: now(), text: t }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getAiReply(t, order);
      onOrderChange(reply.next);
      setMessages(m => [...m, { id: Date.now() + 'a', role: 'ai' as const, time: now(), text: reply.text, chips: reply.chips, showSpec: reply.showSpec }]);
    }, 1400 + Math.random() * 600);
  }, [input, order, onOrderChange]);

  const startNew = () => {
    const newId = 'TPR-2026-0' + (90 + orders.length);
    setOrders(o => [{ id: newId, preview: 'คำสั่งพิมพ์ใหม่', status: 'new' as const, time: 'เมื่อกี้' }, ...o]);
    setActiveId(newId);
    setMessages([{ id: 'n1', role: 'ai', time: now(), text: 'สวัสดีครับ! เริ่มคำสั่งพิมพ์ใหม่ได้เลยครับ 🖨️\n\nต้องการพิมพ์งานประเภทไหนครับ?', chips: ['โบรชัวร์ / แผ่นพับ', 'นามบัตร', 'ปกหนังสือ / รายงาน', 'โปสเตอร์', 'แบบฟอร์ม', 'อื่นๆ'] }]);
    onOrderChange(EMPTY_ORDER);
  };

  return (
    <SendCtx.Provider value={sendMessage}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {sidebarOpen && <Sidebar orders={orders} activeId={activeId} onSelect={setActiveId} onNew={startNew} />}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F0F4FF' }}>
          <div style={{ height: 56, flexShrink: 0, padding: '0 24px', background: T.white, borderBottom: `1px solid ${T.slate200}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.slate900 }}>{activeId} — คำสั่งพิมพ์</div>
              <div style={{ fontSize: 11, color: T.slate500, marginTop: 1 }}>AI กำลังรวบรวมข้อมูล</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setMessages([WELCOME_MSG]); onOrderChange(EMPTY_ORDER); }} style={{ padding: '6px 14px', borderRadius: 8, background: T.slate50, border: `1px solid ${T.slate200}`, fontSize: 12, fontWeight: 600, color: T.slate600, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
              <button onClick={onPricing} style={{ padding: '6px 14px', borderRadius: 8, background: '#EFF6FF', border: `1px solid #DBEAFE`, fontSize: 12, fontWeight: 600, color: T.blue700, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 5 }}>📊 ดูต้นทุน</button>
              <button style={{ padding: '6px 14px', borderRadius: 8, background: T.blue700, border: 'none', fontSize: 12, fontWeight: 600, color: T.white, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(29,78,216,.15)' }}>Export PDF</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} order={order} />)}
            {typing && <TypingIndicator />}
            <div ref={endRef}></div>
          </div>

          <div style={{ padding: '14px 24px 18px', background: T.white, borderTop: `1px solid ${T.slate200}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: T.slate50, border: `1.5px solid ${T.slate200}`, borderRadius: 14, padding: '8px 8px 8px 14px', transition: 'border-color .2s' }}
              onFocusCapture={e => e.currentTarget.style.borderColor = T.blue400}
              onBlurCapture={e => e.currentTarget.style.borderColor = T.slate200}>
              <button style={{ width: 36, height: 36, background: 'none', border: 'none', cursor: 'pointer', color: T.slate400, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background = T.slate100; e.currentTarget.style.color = T.blue600; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = T.slate400; }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
              </button>
              <textarea ref={inputRef} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="พิมพ์ข้อความ หรือเลือกตัวเลือกด้านบน..."
                rows={1} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: 'Plus Jakarta Sans,sans-serif', fontSize: 14, color: T.slate900, resize: 'none', maxHeight: 100, lineHeight: 1.5, padding: '5px 0' }} />
              <button onClick={() => sendMessage()} disabled={!input.trim()} style={{ width: 36, height: 36, flexShrink: 0, background: input.trim() ? T.blue700 : T.slate200, border: 'none', borderRadius: 10, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', boxShadow: input.trim() ? '0 2px 8px rgba(29,78,216,.25)' : 'none' }}>
                <svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              </button>
            </div>
            <div style={{ fontSize: 11, color: T.slate400, marginTop: 8, textAlign: 'center' }}>ธนะพัฒน์พริ้นติ้ง · ราคาเบื้องต้นเท่านั้น ยืนยันราคาจริงโดยทีมงาน</div>
          </div>
        </main>
        <RightPanel order={order} onPricing={onPricing} />
      </div>
    </SendCtx.Provider>
  );
}
