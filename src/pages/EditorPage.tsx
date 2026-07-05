import { useEffect, useMemo, useRef, useState } from 'react';
import type { CostStep, DraftItem, DraftQuotation } from '../lib/types';
import { T, fmt } from '../lib/theme';
import {
  REF_RATES, PRINTCAL_URL, PRINTCOST_URL, newId,
  itemAmount, itemUnitPrice, rescaleForQty, rescaleForUnitPrice,
} from '../lib/costEngine';
import { draftTotals, saveDraft } from '../lib/drafts';
import { PrintSheet } from '../components/PrintSheet';

/* ---------- ช่องกรอกตัวเลข: พิมพ์อิสระ commit ตอน blur/Enter ---------- */
function NumField({ value, onCommit, width = 90, bold, alignLeft }: {
  value: number; onCommit: (n: number) => void; width?: number; bold?: boolean; alignLeft?: boolean;
}) {
  const [txt, setTxt] = useState<string | null>(null);
  const commit = () => {
    if (txt === null) return;
    const n = parseFloat(txt.replace(/,/g, ''));
    if (!isNaN(n) && n >= 0) onCommit(n);
    setTxt(null);
  };
  return (
    <input
      value={txt ?? (Number.isInteger(value) ? String(value) : value.toFixed(2))}
      onChange={e => setTxt(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
      onFocus={e => e.target.select()}
      style={{
        width, padding: '5px 8px', borderRadius: 8, border: `1.5px solid ${T.slate200}`,
        fontSize: 13, fontWeight: bold ? 700 : 500, fontFamily: 'inherit',
        textAlign: alignLeft ? 'left' : 'right', color: T.slate900, outline: 'none', background: T.white,
      }}
    />
  );
}

function TextField({ value, onChange, placeholder, width, small }: {
  value: string; onChange: (s: string) => void; placeholder?: string; width?: number | string; small?: boolean;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: width ?? '100%', padding: small ? '5px 8px' : '8px 10px', borderRadius: 8,
        border: `1.5px solid ${T.slate200}`, fontSize: small ? 12.5 : 13.5, fontFamily: 'inherit',
        color: T.slate900, outline: 'none', background: T.white,
      }} />
  );
}

/* ---------- แถวขั้นตอน + ราคา ---------- */
function StepRow({ step, share, onChange, onRemove }: {
  step: CostStep; share: number;
  onChange: (s: CostStep) => void; onRemove: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px dashed ${T.slate100}` }}>
      <input value={step.name} onChange={e => onChange({ ...step, name: e.target.value })}
        style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', color: T.slate800, fontWeight: 600, background: 'transparent', minWidth: 0 }} />
      <button
        onClick={() => onChange({ ...step, unit: step.unit === 'fixed' ? 'per_unit' : 'fixed' })}
        title={step.unit === 'per_unit' ? 'แปรตามจำนวน — เปลี่ยนจำนวนแล้วราคา scale ตาม (กดเพื่อสลับ)' : 'ค่าคงที่ต่องาน — ไม่เปลี่ยนตามจำนวน (กดเพื่อสลับ)'}
        style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, cursor: 'pointer', whiteSpace: 'nowrap',
          border: 'none', background: step.unit === 'per_unit' ? T.blue50 : '#FEF3C7',
          color: step.unit === 'per_unit' ? T.blue700 : '#B45309',
        }}>
        {step.unit === 'per_unit' ? '↕ ตามจำนวน' : '📌 คงที่'}
      </button>
      <span style={{ fontSize: 10.5, color: T.slate400, width: 34, textAlign: 'right', flexShrink: 0 }}>{share.toFixed(0)}%</span>
      <NumField value={step.price} onCommit={n => onChange({ ...step, price: n })} width={96} />
      <button onClick={onRemove} title="ลบขั้นตอน"
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate300, fontSize: 14, padding: 2 }}
        onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
        onMouseLeave={e => e.currentTarget.style.color = T.slate300}>✕</button>
    </div>
  );
}

/* ---------- การ์ดรายการสินค้า ---------- */
function ItemCard({ item, index, onChange, onRemove, canRemove }: {
  item: DraftItem; index: number;
  onChange: (it: DraftItem) => void; onRemove: () => void; canRemove: boolean;
}) {
  const amount = itemAmount(item);
  const unit = itemUnitPrice(item);
  const [specOpen, setSpecOpen] = useState(true);

  return (
    <div className="step-card" style={{ padding: '16px 18px' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8, background: T.blue50, color: T.blue700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, marginTop: 3,
        }}>{index + 1}</div>
        <div style={{ flex: 1 }}>
          <TextField value={item.description} onChange={s => onChange({ ...item, description: s })} placeholder="ชื่องาน เช่น โบรชัวร์ A4 4 สี" />
        </div>
        {canRemove && (
          <button onClick={onRemove} title="ลบรายการนี้"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate300, fontSize: 15, padding: 4 }}>🗑</button>
        )}
      </div>

      {/* จำนวน + ราคา/หน่วย */}
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12, paddingLeft: 36 }}>
        <div>
          <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>จำนวน <span style={{ color: T.blue600 }}>(แก้แล้วขั้นตอน "ตามจำนวน" scale ให้)</span></div>
          <div style={{ display: 'flex', gap: 6 }}>
            <NumField value={item.qtyNum} onCommit={n => onChange(rescaleForQty(item, n))} width={80} bold />
            <TextField value={item.qtyUnit} onChange={s => onChange({ ...item, qtyUnit: s })} width={64} small />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>ราคา/หน่วย (แก้แล้วขั้นตอน scale ตาม)</div>
          <NumField value={unit} onCommit={n => onChange(rescaleForUnitPrice(item, n))} width={100} bold />
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600 }}>รวมรายการนี้</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.blue700 }}>฿{fmt(amount)}</div>
        </div>
      </div>

      {/* ขั้นตอน */}
      <div style={{ marginLeft: 36, background: T.slate50, borderRadius: 12, padding: '10px 14px' }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: T.slate600, marginBottom: 2 }}>
          🧩 ขั้นตอน + ราคา (รวมกัน = ราคารายการ) — แก้ราคาแต่ละขั้นได้เลย
        </div>
        {item.steps.map(s => (
          <StepRow key={s.id} step={s} share={amount > 0 ? (s.price / amount) * 100 : 0}
            onChange={ns => onChange({ ...item, steps: item.steps.map(x => x.id === ns.id ? ns : x) })}
            onRemove={() => onChange({ ...item, steps: item.steps.filter(x => x.id !== s.id) })} />
        ))}
        <button onClick={() => onChange({ ...item, steps: [...item.steps, { id: newId(), name: 'ขั้นตอนใหม่', unit: 'per_unit', price: 0 }] })}
          style={{ marginTop: 8, border: `1px dashed ${T.slate300}`, background: 'none', cursor: 'pointer', color: T.slate500, fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8, fontFamily: 'inherit' }}>
          + เพิ่มขั้นตอน
        </button>
      </div>

      {/* สเปกงาน (ขึ้นบนใบเสนอราคา) */}
      <div style={{ marginLeft: 36, marginTop: 10 }}>
        <button onClick={() => setSpecOpen(o => !o)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate500, fontSize: 11.5, fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>
          {specOpen ? '▾' : '▸'} รายละเอียดสเปกบนใบเสนอราคา ({item.specs.length} บรรทัด)
        </button>
        {specOpen && (
          <div style={{ marginTop: 6 }}>
            {item.specs.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 5 }}>
                <TextField small value={s} onChange={v => onChange({ ...item, specs: item.specs.map((x, j) => j === i ? v : x) })} />
                <button onClick={() => onChange({ ...item, specs: item.specs.filter((_, j) => j !== i) })}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate300, fontSize: 13 }}>✕</button>
              </div>
            ))}
            <button onClick={() => onChange({ ...item, specs: [...item.specs, ''] })}
              style={{ border: `1px dashed ${T.slate300}`, background: 'none', cursor: 'pointer', color: T.slate500, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, fontFamily: 'inherit' }}>
              + เพิ่มบรรทัดสเปก
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================================
   EDITOR PAGE
   ===================================================================== */
export function EditorPage({ initial, onBack }: {
  initial: DraftQuotation;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<DraftQuotation>(initial);
  const [showPrint, setShowPrint] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const totals = useMemo(() => draftTotals(draft), [draft]);

  // autosave หลังหยุดแก้ 800ms
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const t = setTimeout(() => { saveDraft(draft); setSavedTick(true); setTimeout(() => setSavedTick(false), 1500); }, 800);
    return () => clearTimeout(t);
  }, [draft]);

  const upd = (patch: Partial<DraftQuotation>) => setDraft(d => ({ ...d, ...patch }));
  const updItem = (it: DraftItem) => upd({ items: draft.items.map(x => x.id === it.id ? it : x) });

  if (showPrint) {
    return <PrintSheet draft={draft} totals={totals} onClose={() => setShowPrint(false)} />;
  }

  return (
    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', background: '#F0F4FF' }}>
      {/* ฟอร์มหลัก */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 60px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <button onClick={onBack} style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.blue600, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', padding: 0, marginBottom: 10 }}>
            ← กลับไปหน้าใบเสนอราคา
          </button>

          {draft.sourceLabel && (
            <div style={{ fontSize: 12, color: T.slate500, background: T.blue50, border: `1px solid ${T.blue100}`, borderRadius: 10, padding: '8px 14px', marginBottom: 14 }}>
              📎 ใช้แบบจากใบเก่า {draft.sourceLabel} — ขั้นตอนและราคาแตกมาจากราคาจริงของใบนั้น ปรับแก้ได้ทุกจุด
            </div>
          )}

          {/* ข้อมูลหัวใบ */}
          <div className="step-card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.slate800, marginBottom: 10 }}>ข้อมูลใบเสนอราคา</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 110px', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>ลูกค้า (เรียน)</div>
                <TextField value={draft.customer} onChange={s => upd({ customer: s })} placeholder="ชื่อบริษัท / หน่วยงาน" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>วันที่</div>
                <input type="date" value={draft.date} onChange={e => upd({ date: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.slate200}`, fontSize: 13, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>เลขที่</div>
                <TextField value={draft.quoteNo} onChange={s => upd({ quoteNo: s })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>ที่อยู่ / ผู้ติดต่อ (ขึ้นบรรทัดใหม่ได้)</div>
                <textarea value={draft.address} onChange={e => upd({ address: e.target.value })} rows={2}
                  placeholder={'เช่น 272 ถนนสุขสวัสดิ์ แขวงบางประกอก\nคุณธนวัฒน์ โทร 094-xxx-xxxx'}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${T.slate200}`, fontSize: 12.5, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.slate500, fontWeight: 600, marginBottom: 3 }}>ผู้เสนอขาย / โทร</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <TextField small value={draft.salesperson} onChange={s => upd({ salesperson: s })} />
                  <TextField small width={110} value={draft.salesTel} onChange={s => upd({ salesTel: s })} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: 12.5, color: T.slate700, fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={draft.vatEnabled} onChange={e => upd({ vatEnabled: e.target.checked })} />
                  คิด VAT 7%
                </label>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* รายการสินค้า */}
          {draft.items.map((it, i) => (
            <ItemCard key={it.id} item={it} index={i} canRemove={draft.items.length > 1}
              onChange={updItem}
              onRemove={() => upd({ items: draft.items.filter(x => x.id !== it.id) })} />
          ))}
          <button onClick={() => upd({
            items: [...draft.items, {
              id: newId(), description: '', qtyNum: 100, qtyUnit: 'ชิ้น',
              steps: [{ id: newId(), name: 'ราคาเหมารวม', unit: 'per_unit', price: 0 }], specs: [],
            }],
          })}
            style={{ width: '100%', border: `1.5px dashed ${T.slate300}`, background: 'none', cursor: 'pointer', color: T.slate500, fontSize: 13, fontWeight: 600, padding: '12px', borderRadius: 12, fontFamily: 'inherit' }}>
            + เพิ่มรายการสินค้า
          </button>
        </div>
      </div>

      {/* สรุปด้านขวา */}
      <div style={{ width: 320, flexShrink: 0, background: T.white, borderLeft: `1px solid ${T.slate200}`, overflowY: 'auto', padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.slate800, marginBottom: 8 }}>สรุปราคา</div>
          <div style={{ background: T.slate50, borderRadius: 12, padding: '12px 14px' }}>
            {draft.items.map((it, i) => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: T.slate600, padding: '3px 0' }}>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>{i + 1}. {it.description || '(ไม่มีชื่อ)'}</span>
                <span style={{ fontWeight: 600 }}>฿{fmt(itemAmount(it))}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${T.slate200}`, marginTop: 8, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.slate700, padding: '2px 0' }}>
                <span>รวมเป็นเงิน</span><span style={{ fontWeight: 600 }}>฿{fmt(totals.subtotal)}</span>
              </div>
              {draft.vatEnabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: T.slate700, padding: '2px 0' }}>
                  <span>VAT 7%</span><span style={{ fontWeight: 600 }}>฿{fmt(totals.vat)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, color: T.slate900, padding: '6px 0 0', fontWeight: 800 }}>
                <span>รวมทั้งหมด</span><span style={{ color: T.blue700 }}>฿{fmt(totals.grand)}</span>
              </div>
            </div>
          </div>
        </div>

        <button onClick={() => setShowPrint(true)} style={{
          width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: T.blueGrad, color: 'white', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(29,78,216,.3)',
        }}>🖨️ ดูใบเสนอราคา + พิมพ์</button>

        <div style={{ fontSize: 11, color: savedTick ? T.green600 : T.slate400, textAlign: 'center', minHeight: 15 }}>
          {savedTick ? '✓ บันทึกแล้ว' : 'แก้ไขแล้วบันทึกอัตโนมัติ — เปิดกลับได้จากหน้าใบเสนอราคา'}
        </div>

        {/* ราคากลางอ้างอิง */}
        <div style={{ borderTop: `1px solid ${T.slate100}`, paddingTop: 12 }}>
          <button onClick={() => setRefOpen(o => !o)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: T.slate600, fontSize: 12, fontWeight: 700, padding: 0, fontFamily: 'inherit' }}>
            {refOpen ? '▾' : '▸'} 📖 ราคากลางอ้างอิง (จาก PrintCal)
          </button>
          {refOpen && (
            <div style={{ marginTop: 8 }}>
              {REF_RATES.map(r => (
                <div key={r.name} style={{ fontSize: 11, color: T.slate500, padding: '3px 0', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: T.slate600, flexShrink: 0 }}>{r.name}</span>
                  <span style={{ textAlign: 'right' }}>{r.rate}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <a href={PRINTCAL_URL} target="_blank" rel="noopener" style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 8, background: T.blue50, color: T.blue700, fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>🖨️ เปิด PrintCal</a>
                <a href={PRINTCOST_URL} target="_blank" rel="noopener" style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: 8, background: T.blue50, color: T.blue700, fontSize: 11.5, fontWeight: 700, textDecoration: 'none' }}>📊 เปิด PrintCost</a>
              </div>
              <div style={{ fontSize: 10.5, color: T.slate400, marginTop: 8, lineHeight: 1.5 }}>
                💡 ใช้คำนวณต้นทุนละเอียด (จัด layout กระดาษ, จำนวนแผ่นพิมพ์) แล้วเอาตัวเลขมาใส่ขั้นตอนที่นี่
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
