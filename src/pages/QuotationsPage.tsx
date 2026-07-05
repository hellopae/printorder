import { useMemo, useState } from 'react';
import type { DraftQuotation, Quotation } from '../lib/types';
import { T, fmt } from '../lib/theme';
import { AGE_BADGE, QUOTATIONS, fmtDate, priceAge, searchQuotations } from '../lib/quotations';
import { deleteDraft, draftTotals, loadDrafts } from '../lib/drafts';

function AgeBadge({ q }: { q: Quotation }) {
  const m = AGE_BADGE[priceAge(q)];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  );
}

function QuotationDetail({ q, onUse }: { q: Quotation; onUse: (q: Quotation) => void }) {
  const age = priceAge(q);
  return (
    <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slate200}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(29,78,216,.07)' }}>
      <div style={{ background: T.blueGrad, padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: '#93C5FD', letterSpacing: '.06em', marginBottom: 2 }}>
              ใบเสนอราคาเลขที่ {q.quote_no || '—'} · {fmtDate(q)}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{q.customer || '(ไม่ระบุลูกค้า)'}</div>
          </div>
          {q.grand_total != null && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: '#93C5FD' }}>รวมทั้งหมด</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>฿{fmt(q.grand_total)}</div>
            </div>
          )}
        </div>
        <button onClick={() => onUse(q)} style={{
          marginTop: 12, width: '100%', padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'white', color: T.blue700, fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: '0 2px 8px rgba(0,0,0,.15)', transition: 'transform .1s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >⚡ ใช้ใบนี้เป็นแบบ — แตกขั้นตอน + ปรับราคา → ออกใบใหม่</button>
      </div>

      {age !== 'current' && (
        <div style={{ padding: '10px 20px', background: AGE_BADGE[age].bg, borderBottom: `1px solid ${T.slate100}`, fontSize: 12, color: AGE_BADGE[age].color, fontWeight: 500 }}>
          ⚠️ {age === 'unknown' ? 'ไม่ทราบวันที่ของใบนี้ โปรดตรวจสอบราคาปัจจุบันก่อนใช้อ้างอิง' : `ใบเสนอราคานี้ออกเมื่อ ${fmtDate(q)} — ต้นทุนวัตถุดิบปัจจุบันอาจปรับขึ้นแล้ว โปรดตรวจสอบก่อนเสนอราคา`}
        </div>
      )}

      <div style={{ padding: '6px 0' }}>
        {q.items.map(it => (
          <div key={it.no} style={{ padding: '12px 20px', borderBottom: `1px solid ${T.slate100}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.slate900 }}>{it.no}. {it.description}</div>
              {it.amount != null && <div style={{ fontSize: 14, fontWeight: 700, color: T.blue700, flexShrink: 0 }}>฿{fmt(it.amount)}</div>}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 3, fontSize: 12, color: T.slate500 }}>
              {it.qty && <span>จำนวน: {it.qty}</span>}
              {it.unit_price != null && <span>ราคา/หน่วย: ฿{fmt(it.unit_price)}</span>}
            </div>
            {it.specs.length > 0 && (
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 12, color: T.slate600, lineHeight: 1.7 }}>
                {it.specs.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 20px 16px', background: T.slate50 }}>
        {([
          ['รวมเป็นเงิน', q.subtotal],
          ['VAT 7%', q.vat],
          ['รวมทั้งหมด', q.grand_total],
        ] as [string, number | null][]).filter(([, v]) => v != null).map(([k, v], i, arr) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: i === arr.length - 1 ? 14 : 12, fontWeight: i === arr.length - 1 ? 700 : 500, color: i === arr.length - 1 ? T.slate900 : T.slate600 }}>
            <span>{k}</span>
            <span>฿{fmt(v as number)}</span>
          </div>
        ))}
        <div style={{ fontSize: 10, color: T.slate400, marginTop: 8, wordBreak: 'break-all' }}>📁 {q.file}</div>
      </div>
    </div>
  );
}

function DraftsSection({ onOpenDraft, drafts, onDelete }: {
  drafts: DraftQuotation[];
  onOpenDraft: (d: DraftQuotation) => void;
  onDelete: (id: string) => void;
}) {
  if (drafts.length === 0) return null;
  return (
    <div style={{ borderBottom: `1px solid ${T.slate100}`, background: '#FEFCE8' }}>
      <div style={{ padding: '10px 16px 4px', fontSize: 11.5, fontWeight: 700, color: '#A16207' }}>
        📝 ใบที่สร้างเอง ({drafts.length}) — เก็บในเครื่องนี้
      </div>
      <div style={{ maxHeight: 180, overflowY: 'auto', padding: '4px 10px 8px' }}>
        {drafts.map(d => {
          const t = draftTotals(d);
          return (
            <div key={d.id} onClick={() => onOpenDraft(d)}
              style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF9C3'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.slate800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  #{d.quoteNo} · {d.customer || '(ยังไม่ระบุลูกค้า)'}
                </div>
                <div style={{ fontSize: 10.5, color: T.slate500 }}>
                  {d.items[0]?.description || '—'} · แก้ล่าสุด {new Date(d.updatedAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: T.blue700 }}>฿{fmt(t.grand)}</span>
                <button onClick={e => { e.stopPropagation(); onDelete(d.id); }}
                  title="ลบใบนี้"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate400, fontSize: 13, padding: 2 }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function QuotationsPage({ onUseAsTemplate, onOpenDraft }: {
  onUseAsTemplate: (q: Quotation) => void;
  onOpenDraft: (d: DraftQuotation) => void;
}) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [drafts, setDrafts] = useState<DraftQuotation[]>(() => loadDrafts());
  const results = useMemo(() => searchQuotations(query), [query]);
  const shown = selected ?? results[0] ?? null;

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: '#F0F4FF' }}>
      {/* List column */}
      <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', background: T.white, borderRight: `1px solid ${T.slate200}` }}>
        <DraftsSection drafts={drafts} onOpenDraft={onOpenDraft}
          onDelete={id => { if (confirm('ลบใบเสนอราคาที่สร้างเองใบนี้?')) setDrafts(deleteDraft(id)); }} />
        <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${T.slate100}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.slate900, marginBottom: 2 }}>ใบเสนอราคาย้อนหลัง</div>
          <div style={{ fontSize: 11, color: T.slate500, marginBottom: 10 }}>{QUOTATIONS.length.toLocaleString('th-TH')} ใบ (2015–2026) · เลือกใบที่ใกล้เคียงงานใหม่ แล้วกด "ใช้เป็นแบบ"</div>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="ค้นหา: ลูกค้า, งาน, กระดาษ เช่น โบรชัวร์ อาร์ตด้าน..."
            style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.slate200}`, outline: 'none', fontSize: 13, fontFamily: 'inherit', background: T.slate50 }}
            onFocus={e => e.currentTarget.style.borderColor = T.blue400}
            onBlur={e => e.currentTarget.style.borderColor = T.slate200}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
          {results.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: T.slate400 }}>ไม่พบใบเสนอราคาที่ตรงกับคำค้น</div>
          )}
          {results.map(q => {
            const active = shown === q;
            return (
              <div key={q.file} onClick={() => setSelected(q)}
                style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 3, background: active ? T.blue50 : 'transparent', border: `1px solid ${active ? T.blue100 : 'transparent'}`, transition: 'all .15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.slate50; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: active ? T.blue700 : T.slate700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {q.customer || '(ไม่ระบุลูกค้า)'}
                  </span>
                  <AgeBadge q={q} />
                </div>
                <div style={{ fontSize: 11, color: T.slate500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {q.items[0]?.description || '—'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: T.slate400 }}>#{q.quote_no || '—'} · {fmtDate(q)}</span>
                  {q.grand_total != null && <span style={{ fontSize: 11, fontWeight: 700, color: T.blue700 }}>฿{fmt(q.grand_total)}</span>}
                </div>
              </div>
            );
          })}
          {results.length >= 60 && (
            <div style={{ padding: '10px 12px', fontSize: 11, color: T.slate400, textAlign: 'center' }}>แสดง 60 รายการแรก — พิมพ์คำค้นเพิ่มเพื่อกรองให้แคบลง</div>
          )}
        </div>
      </div>

      {/* Detail column */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          {shown
            ? <QuotationDetail q={shown} onUse={onUseAsTemplate} />
            : <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: T.slate400 }}>เลือกใบเสนอราคาจากรายการด้านซ้าย</div>
          }
        </div>
      </div>
    </div>
  );
}
