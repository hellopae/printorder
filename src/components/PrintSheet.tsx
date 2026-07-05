import type { DraftQuotation } from '../lib/types';
import { T } from '../lib/theme';
import { itemAmount, itemUnitPrice, thaiBahtText } from '../lib/costEngine';
import logo from '../assets/logo.png';

/* =====================================================================
   ใบเสนอราคา layout ตามฟอร์มจริงของ TANAPAT (เทียบกับใบ #1400)
   — ช่องเงื่อนไขติ๊กได้ + พิมพ์จำนวนวัน/% /วันที่ ได้บนหน้าใบเลย
   — พิมพ์ได้ 1 หน้า A4 ด้วย window.print()
   ===================================================================== */

const money = (n: number) =>
  n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const B = '#111'; // เส้นตารางแบบฟอร์ม

function fmtDateTh(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()}-${mon[d.getMonth()]}-${d.getFullYear()}`;
}

/** ช่องติ๊กแบบฟอร์ม — คลิกเพื่อเลือก/เอาออก */
function Tick({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <span onClick={onToggle} title="คลิกเพื่อติ๊ก/เอาออก" style={{
      width: 15, height: 15, border: `1.5px solid ${B}`, display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
      fontSize: 12, fontWeight: 800, lineHeight: 1, userSelect: 'none',
    }}>{on ? '✓' : ''}</span>
  );
}

/** ช่องกรอกสั้นๆ บนฟอร์ม (เลขวัน / % / วันที่) — เส้นประใต้ พิมพ์ออกมาเป็นตัวเลขที่กรอก */
function Fill({ value, onChange, width = 46, align = 'center', placeholder, printLine = false }: {
  value: string; onChange: (s: string) => void; width?: number;
  align?: 'left' | 'center'; placeholder?: string;
  /** true = คงเส้นใต้ไว้ตอนพิมพ์ (เช่น ช่องวันที่ให้ลูกค้าเซ็น) */
  printLine?: boolean;
}) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className={printLine ? 'sheet-fill-line' : 'sheet-fill'}
      style={{
        width, border: 'none', borderBottom: printLine ? `1px solid ${B}` : '1px dotted #555', outline: 'none',
        fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 600, textAlign: align,
        background: 'transparent', padding: '0 2px', color: B,
      }} />
  );
}

export function PrintSheet({ draft, totals, onUpdate, onClose }: {
  draft: DraftQuotation;
  totals: { subtotal: number; vat: number; grand: number };
  onUpdate: (patch: Partial<DraftQuotation>) => void;
  onClose: () => void;
}) {
  const addrLines = draft.address.split('\n').filter(Boolean);
  const c = draft.conditions;
  const setC = (patch: Partial<typeof c>) => onUpdate({ conditions: { ...c, ...patch } });
  const cell: React.CSSProperties = { border: `1.5px solid ${B}`, padding: '10px 8px', verticalAlign: 'top' };

  return (
    <div className="print-outer" style={{ flex: 1, overflowY: 'auto', background: '#5B6474', padding: '24px 0 60px' }}>
      {/* แถบเครื่องมือ (ไม่ถูกพิมพ์) */}
      <div className="no-print" style={{ maxWidth: 794, margin: '0 auto 14px', display: 'flex', alignItems: 'center', gap: 10, padding: '0 4px' }}>
        <button onClick={onClose} style={{
          padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.9)', color: T.slate800, fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
        }}>← กลับไปแก้ไข</button>
        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)' }}>💡 ติ๊กช่องเงื่อนไข / พิมพ์จำนวนวัน–%–วันที่–หมายเหตุ ได้บนใบเลย</span>
        <button onClick={() => window.print()} style={{
          padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', marginLeft: 'auto',
          background: T.blueGrad, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(0,0,0,.25)',
        }}>🖨️ พิมพ์ / บันทึก PDF</button>
      </div>

      {/* กระดาษ A4 */}
      <div className="print-sheet" style={{
        width: 794, minHeight: 1123, margin: '0 auto', background: 'white', color: B,
        padding: '32px 38px', fontFamily: "'Sarabun','Sukhumvit Set',system-ui,sans-serif", fontSize: 13.5,
        boxShadow: '0 8px 40px rgba(0,0,0,.4)', position: 'relative',
      }}>
        {/* ===== หัวบริษัท ===== */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <img src={logo} alt="TANAPAT logo" style={{ width: 78, height: 88, objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 17.5, fontWeight: 800, whiteSpace: 'nowrap' }}>บริษัท ธนะพัฒน์พริ้นติ้งแอนด์พับลิเคชั่น จำกัด</span>
              <span style={{ fontSize: 10.5, color: '#1a3f7a', textDecoration: 'underline' }}>http://www.tanapat.co.th, e-mail: 01tanapat@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 1 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#B91C1C', whiteSpace: 'nowrap' }}>TANAPAT PRINTING &amp; PUBLICATION CO., LTD.</span>
              <span style={{ fontSize: 12, fontWeight: 700, background: '#132a5c', color: 'white', padding: '3px 14px', whiteSpace: 'nowrap' }}>
                บริการงานพิมพ์ รวดเร็ว คุ้มค่าการลงทุน
              </span>
            </div>
            <div style={{ fontSize: 11.5, marginTop: 4, lineHeight: 1.6 }}>
              125,127,129 ซ.ประชาอุทิศ 27 แยก 6 ถ.ประชาอุทิศ แขวง/เขตราษฎร์บูรณะ กรุงเทพฯ 10140<br />
              <b style={{ fontSize: 12.5 }}>TEL : (662) 428 5497, 872 5543 , FAX : (662) 872 5622</b>
            </div>
          </div>
        </div>

        {/* ===== ชื่อเอกสาร ===== */}
        <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 800, margin: '16px 0 14px', letterSpacing: 1 }}>
          ใบเสนอราคา / QUOTATION
        </div>

        {/* ===== ลูกค้า (กล่อง) + วันที่/เลขที่ (ไม่มีกรอบ) + ผู้เสนอขาย (กล่อง) ===== */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1.15, border: `1.5px solid ${B}`, padding: '7px 10px', minHeight: 96 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>เรียน :&nbsp;</span>
              <span>{draft.customer || ' '}</span>
            </div>
            {addrLines.map((l, i) => <div key={i} style={{ lineHeight: 1.7 }}>{l}</div>)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 12, padding: '2px 0' }}>
              <div style={{ flex: 1.15, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>วันที่ :</span>
                <span style={{ borderBottom: `1px solid ${B}`, flex: 1, textAlign: 'center' }}>{fmtDateTh(draft.date)}</span>
              </div>
              <div style={{ flex: 0.85, display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>เลขที่ :</span>
                <span style={{ borderBottom: `1px solid ${B}`, flex: 1, textAlign: 'center' }}>{draft.quoteNo}</span>
              </div>
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${B}`, padding: '6px 10px', display: 'flex', gap: 4, flexDirection: 'column', justifyContent: 'center' }}>
              <div><span style={{ fontWeight: 700 }}>ผู้เสนอขาย :</span> {draft.salesperson}</div>
              <div>Tel : {draft.salesTel}</div>
            </div>
          </div>
        </div>

        {/* ===== ตารางรายการ (มีคอลัมน์แถบแคบท้ายสุดตามฟอร์ม) ===== */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              {[['ลำดับ', 'No.', 52], ['รายการ', 'Descriptions', undefined], ['จำนวน', 'Quantity', 84], ['ราคา/หน่วย', 'Unit/Price', 90], ['จำนวนเงิน(บาท)', 'Amount(Baht)', 112]].map(([th, en, w]) => (
                <th key={th as string} style={{ border: `1.5px solid ${B}`, padding: '5px 6px', width: w as number | undefined, fontWeight: 700, fontSize: 12.5 }}>
                  {th}<br /><span style={{ fontWeight: 500, fontSize: 11 }}>{en}</span>
                </th>
              ))}
              <th style={{ border: `1.5px solid ${B}`, width: 16 }} />
            </tr>
          </thead>
          <tbody>
            {draft.items.map((it, i) => {
              const amount = itemAmount(it);
              const unitP = itemUnitPrice(it);
              const noTop = i === 0 ? {} : { borderTop: 'none' };
              return (
                <tr key={it.id}>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none', textAlign: 'center', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none', padding: '10px 14px' }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{it.description}</div>
                    {it.specs.filter(Boolean).map((s, j) => (
                      <div key={j} style={{ fontSize: 13, paddingLeft: 6, lineHeight: 2 }}>- {s}</div>
                    ))}
                  </td>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none', textAlign: 'center' }}>
                    {it.qtyNum.toLocaleString('th-TH')} {it.qtyUnit}
                  </td>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none', textAlign: 'right' }}>
                    {money(unitP)} บาท
                  </td>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none', textAlign: 'right', fontWeight: 600 }}>
                    {money(amount)} บาท
                  </td>
                  <td style={{ ...cell, ...noTop, borderBottom: 'none' }} />
                </tr>
              );
            })}
            {/* แถวยืดความสูงให้ฟอร์มดูเต็มหน้า */}
            <tr>
              {[0, 1, 2, 3, 4, 5].map(col => (
                <td key={col} style={{ border: `1.5px solid ${B}`, borderTop: 'none', height: draft.items.length > 2 ? 40 : 150 }} />
              ))}
            </tr>
          </tbody>
        </table>

        {/* ===== เงื่อนไข (ติ๊ก + กรอกได้) + ยอดรวม ===== */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <div style={{ flex: 1.35, fontSize: 12.5, display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tick on={c.creditChecked} onToggle={() => setC({ creditChecked: !c.creditChecked })} />
              <span>เงื่อนไขการชำระเงินนับจากวันที่ของบิลส่งของไม่เกิน......</span>
              <Fill value={c.creditDays} onChange={v => setC({ creditDays: v })} width={40} />
              <span>...... วัน</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tick on={c.vatNoteChecked} onToggle={() => setC({ vatNoteChecked: !c.vatNoteChecked })} />
              <span>ราคาที่เสนอมานี้ไม่รวมภาษีมูลค่าเพิ่ม</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tick on={c.depositChecked} onToggle={() => setC({ depositChecked: !c.depositChecked })} />
              <span>(ขอเก็บมัดจำล่วงหน้า</span>
              <Fill value={c.depositPct} onChange={v => setC({ depositPct: v })} width={56} />
              <span>%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tick on={c.confirmChecked} onToggle={() => setC({ confirmChecked: !c.confirmChecked })} />
              <span>ยืนยันราคา</span>
              <Fill value={c.confirmDays} onChange={v => setC({ confirmDays: v })} width={40} />
              <span>วัน</span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {([
              ['รวมเป็นเงิน / Total', totals.subtotal, false],
              ...(draft.vatEnabled ? [['ภาษีมูลค่าเพิ่ม / Vat 7%', totals.vat, false] as [string, number, boolean]] : []),
              ['รวมเป็นเงินทั้งหมด / Grand Total', totals.grand, true],
            ] as [string, number, boolean][]).map(([label, v, strong]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'stretch', marginBottom: 4 }}>
                <div style={{ flex: 1, padding: '4px 8px', fontSize: 12.5, fontWeight: strong ? 700 : 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', textAlign: 'right' }}>{label}</div>
                <div style={{ width: 128, border: `1.5px solid ${B}`, padding: '4px 8px', textAlign: 'right', fontWeight: strong ? 800 : 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {money(v)} บาท
                </div>
                <div style={{ width: 14, border: `1.5px solid ${B}`, borderLeft: 'none' }} />
              </div>
            ))}
          </div>
        </div>

        {/* ===== ตัวอักษรไทย ===== */}
        <div style={{ textAlign: 'center', margin: '8px 0 2px', fontSize: 15 }}>
          (...............<b style={{ letterSpacing: .5 }}>{thaiBahtText(totals.grand)}</b>...............)
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, paddingLeft: 110 }}>จำนวนเงินรวมทั้งสิ้น (ตัวอักษร)</div>
          <div style={{ fontSize: 10, color: '#444' }}>*บริษัทขอสงวนสิทธิ์ที่จะเปลี่ยนแปลงราคาสินค้าโดยไม่แจ้งล่วงหน้าตามภาวะตลาด</div>
        </div>

        {/* ===== กล่องล่าง 3 ช่อง: หมายเหตุ | ลูกค้ายืนยัน | บริษัท ===== */}
        <div style={{ display: 'flex', border: `1.5px solid ${B}`, marginTop: 6 }}>
          <div style={{ flex: 1, borderRight: `1.5px solid ${B}`, padding: '8px 10px', minHeight: 118 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>หมายเหตุ :</div>
            <textarea value={draft.note} onChange={e => onUpdate({ note: e.target.value })}
              placeholder="พิมพ์หมายเหตุได้ที่นี่..."
              className="sheet-fill"
              style={{
                width: '100%', height: 84, border: 'none', outline: 'none', resize: 'none',
                fontFamily: 'inherit', fontSize: 12.5, background: 'transparent', marginTop: 2, color: B, lineHeight: 1.6,
              }} />
          </div>
          <div style={{ flex: 1.1, borderRight: `1.5px solid ${B}`, padding: '8px 12px' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, textDecoration: 'underline' }}>ลูกค้ายืนยันการสั่งซื้อ Fax: 02-8725622</div>
            <div style={{ marginTop: 48, fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700 }}>วันที่</span>
              <Fill value={draft.confirmDate} onChange={v => onUpdate({ confirmDate: v })} width={160} align="center" printLine />
            </div>
          </div>
          <div style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, textDecoration: 'underline', textAlign: 'left' }}>บริษัท ธนะพัฒน์ฯ</div>
            <div style={{ marginTop: 44, fontSize: 12.5 }}>({draft.salesperson.replace(/^นาย|^นาง(สาว)?/, '')})</div>
            <div style={{ fontSize: 12 }}>ขอแสดงความนับถืออย่างสูง</div>
          </div>
        </div>
      </div>
    </div>
  );
}
