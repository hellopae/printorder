import { useState } from 'react';
import type { Order, Page } from './lib/types';
import { fmtI } from './lib/theme';
import { EMPTY_ORDER } from './lib/aiReply';
import { Header } from './components/Header';
import { ChatPage } from './pages/ChatPage';
import { PricingPage } from './pages/PricingPage';
import { QuotationsPage } from './pages/QuotationsPage';

export default function App() {
  const [page, setPage] = useState<Page>('chat');
  const [sidebar, setSidebar] = useState(true);
  const [order, setOrder] = useState<Order>(EMPTY_ORDER);

  const orderLabel = [order.type, order.qty ? `${fmtI(order.qty)} ชุด` : null].filter(Boolean).join(' · ') || 'ออเดอร์ใหม่';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: page === 'pricing' ? 'auto' : 'hidden' }}>
      <Header page={page} onNav={setPage} onToggleSidebar={() => setSidebar(s => !s)} orderLabel={orderLabel} />
      {page === 'chat' && <ChatPage order={order} onOrderChange={setOrder} onPricing={() => setPage('pricing')} sidebarOpen={sidebar} />}
      {page === 'pricing' && <PricingPage order={order} />}
      {page === 'quotations' && <QuotationsPage />}
    </div>
  );
}
