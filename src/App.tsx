import { useState } from 'react';
import type { DraftQuotation, Page, Quotation } from './lib/types';
import { draftFromQuotation, emptyDraft } from './lib/drafts';
import { Header } from './components/Header';
import { QuotationsPage } from './pages/QuotationsPage';
import { EditorPage } from './pages/EditorPage';

export default function App() {
  const [page, setPage] = useState<Page>('quotations');
  const [draft, setDraft] = useState<DraftQuotation | null>(null);

  const openFromQuotation = (q: Quotation) => { setDraft(draftFromQuotation(q)); setPage('editor'); };
  const openDraft = (d: DraftQuotation) => { setDraft(d); setPage('editor'); };
  const openBlank = () => { setDraft(emptyDraft()); setPage('editor'); };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} className="app-chrome">
      <Header page={page} onNav={setPage} onNewBlank={openBlank} editorActive={draft != null} />
      {page === 'quotations' && <QuotationsPage onUseAsTemplate={openFromQuotation} onOpenDraft={openDraft} />}
      {page === 'editor' && draft && (
        <EditorPage
          key={draft.id}
          initial={draft}
          onBack={() => setPage('quotations')}
        />
      )}
      {page === 'editor' && !draft && <QuotationsPage onUseAsTemplate={openFromQuotation} onOpenDraft={openDraft} />}
    </div>
  );
}
