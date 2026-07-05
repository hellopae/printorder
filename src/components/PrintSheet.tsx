import type { DraftQuotation } from '../lib/types';
import { T } from '../lib/theme';
import { itemAmount, itemUnitPrice, thaiBahtText } from '../lib/costEngine';

/* =====================================================================
   ใบเสนอราคา layout ตามฟอร์มจริงของ TANAPAT (อ้างอิงใบเก่า เช่น #1309)
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

export function PrintSheet({ draft, totals, onClose }: {
  draft: DraftQuotation;
  totals: { subtotal: number; vat: number; grand: number };
  onClose: () => void;
}) {
  const addrLines = draft.address.split('\n').filter(Boolean);
  return (
    <div className="print-outer" style={{ flex: 1, overflowY: 'auto', background: '#5B6474', padding: '24px 0 60px' }}>
      {/* แถบเครื่องมือ (ไม่ถูกพิมพ์) */}
      <div className="no-print" style={{ maxWidth: 794, margin: '0 auto 14px', display: 'flex', gap: 10, padding: '0 4px' }}>
        <button onClick={onClose} style={{
          padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,.9)', color: T.slate800, fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
        }}>← กลับไปแก้ไข</button>
        <button onClick={() => window.print()} style={{
          padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', marginLeft: 'auto',
          background: T.blueGrad, color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(0,0,0,.25)',
        }}>🖨️ พิมพ์ / บันทึก PDF</button>
      </div>

      {/* กระดาษ A4 */}
      <div className="print-sheet" style={{
        width: 794, minHeight: 1123, margin: '0 auto', background: 'white', color: B,
        padding: '36px 42px', fontFamily: "'Sarabun','Sukhumvit Set',system-ui,sans-serif", fontSize: 13.5,
        boxShadow: '0 8px 40px rgba(0,0,0,.4)', position: 'relative',
      }}>
        {/* ===== หัวบริษัท ===== */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', borderBottom: `3px double ${B}`, paddingBottom: 10 }}>
          <div style={{
            width: 74, height: 74, border: `2.5px solid #1a3f7a`, borderRadius: 10, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#1a3f7a',
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>ธพ</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>TANAPAT</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              บริษัท ธนะพัฒน์พริ้นติ้งแอนด์พับลิเคชั่น จำกัด
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#B91C1C' }}>TANAPAT PRINTING &amp; PUBLICATION CO., LTD.</span>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#1a3f7a', color: 'white', padding: '2px 10px', borderRadius: 3 }}>
                บริการงานพิมพ์ รวดเร็ว คุ้มค่าการลงทุน
              </span>
            </div>
            <div style={{ fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>
              125,127,129 ซ.ประชาอุทิศ 27 แยก 6 ถ.ประชาอุทิศ แขวง/เขตราษฎร์บูรณะ กรุงเทพฯ 10140<br />
              TEL : (662) 428 5497, 872 5543 , FAX : (662) 872 5622 · e-mail: 01tanapat@gmail.com
            </div>
          </div>
        </div>

        {/* ===== ชื่อเอกสาร ===== */}
        <div style={{ textAlign: 'center', fontSize: 19, fontWeight: 800, margin: '14px 0 12px', letterSpacing: 1 }}>
          ใบเสนอราคา / QUOTATION
        </div>

        {/* ===== กล่องลูกค้า + วันที่/เลขที่/ผู้เสนอขาย ===== */}
        <div style={{ display: 'flex', gap: 0 }}>
          <div style={{ flex: 1.25, border: `1.5px solid ${B}`, padding: '6px 10px', minHeight: 86 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>เรียน :&nbsp;</span>
              <span>{draft.customer || ' '}</span>
            </div>
            {addrLines.map((l, i) => <div key={i} style={{ paddingLeft: 42 }}>{l}</div>)}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', borderTop: `1.5px solid ${B}`, borderRight: `1.5px solid ${B}` }}>
              <div style={{ flex: 1.2, padding: '6px 10px', display: 'flex', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>วันที่ :</span>
                <span style={{ borderBottom: `1px solid ${B}`, flex: 1, textAlign: 'center' }}>{fmtDateTh(draft.date)}</span>
              </div>
              <div style={{ flex: 0.8, padding: '6px 10px', display: 'flex', gap: 6 }}>
                <span style={{ fontWeight: 700 }}>เลขที่ :</span>
                <span style={{ borderBottom: `1px solid ${B}`, flex: 1, textAlign: 'center' }}>{draft.quoteNo}</span>
              </div>
            </div>
            <div style={{ flex: 1, border: `1.5px solid ${B}`, borderLeft: 'none', padding: '6px 10px' }}>
              <div><span style={{ fontWeight: 700 }}>ผู้เสนอขาย :</span> {draft.salesperson}</div>
              <div>Tel : {draft.salesTel}</div>
            </div>
          </div>
        </div>

        {/* ===== ตารางรายการ ===== */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
          <thead>
            <tr>
              {[['ลำดับ', 'No.', 52], ['รายการ', 'Descriptions', undefined], ['จำนวน', 'Quantity', 82], ['ราคา/หน่วย', 'Unit/Price', 92], ['จำนวนเงิน(บาท)', 'Amount(Baht)', 110]].map(([th, en, w]) => (
                <th key={th as string} style={{ border: `1.5px solid ${B}`, padding: '5px 6px', width: w as number | undefined, fontWeight: 700, fontSize: 12.5 }}>
                  {th}<br /><span style={{ fontWeight: 500, fontSize: 11 }}>{en}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {draft.items.map((it, i) => {
              const amount = itemAmount(it);
              const unitP = itemUnitPrice(it);
              return (
                <tr key={it.id}>
                  <td style={{ border: `1.5px solid ${B}`, borderBottom: 'none', borderTop: i === 0 ? undefined : 'none', padding: '10px 6px', textAlign: 'center', verticalAlign: 'top', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ border: `1.5px solid ${B}`, borderBottom: 'none', borderTop: i === 0 ? undefined : 'none', padding: '10px 12px', verticalAlign: 'top' }}>
                    <div style={{ fontWeight: 700 }}>{it.description}</div>
                    {it.specs.filter(Boolean).map((s, j) => (
                      <div key={j} style={{ fontSize: 12.5, paddingLeft: 8, lineHeight: 1.8 }}>- {s}</div>
                    ))}
                  </td>
                  <td style={{ border: `1.5px solid ${B}`, borderBottom: 'none', borderTop: i === 0 ? undefined : 'none', padding: '10px 6px', textAlign: 'center', verticalAlign: 'top' }}>
                    {it.qtyNum.toLocaleString('th-TH')} {it.qtyUnit}
                  </td>
                  <td style={{ border: `1.5px solid ${B}`, borderBottom: 'none', borderTop: i === 0 ? undefined : 'none', padding: '10px 8px', textAlign: 'right', verticalAlign: 'top' }}>
                    {money(unitP)} บาท
                  </td>
                  <td style={{ border: `1.5px solid ${B}`, borderBottom: 'none', borderTop: i === 0 ? undefined : 'none', padding: '10px 8px', textAlign: 'right', verticalAlign: 'top', fontWeight: 600 }}>
                    {money(amount)} บาท
                  </td>
                </tr>
              );
            })}
            {/* แถวยืดความสูงให้ฟอร์มดูเต็ม */}
            <tr>
              {[0, 1, 2, 3, 4].map(c => (
                <td key={c} style={{ border: `1.5px solid ${B}`, borderTop: 'none', height: draft.items.length > 2 ? 40 : 140 }} />
              ))}
            </tr>
          </tbody>
        </table>

        {/* ===== เงื่อนไข + ยอดรวม ===== */}
        <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
          <div style={{ flex: 1.3, fontSize: 12, lineHeight: 2 }}>
            {[
              'เงื่อนไขการชำระเงินนับจากวันที่ของบิลส่งของไม่เกิน..................วัน',
              draft.vatEnabled ? 'ราคาที่เสนอมานี้รวมภาษีมูลค่าเพิ่ม' : 'ราคาที่เสนอมานี้ไม่รวมภาษีมูลค่าเพิ่ม',
              '(ขอเก็บมัดจำล่วงหน้า..................%)',
              'ยืนยันราคา 30 วัน',
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 13, height: 13, border: `1.5px solid ${B}`, display: 'inline-block', flexShrink: 0 }} />
                <span>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {([
              ['รวมเป็นเงิน / Total', totals.subtotal, false],
              ...(draft.vatEnabled ? [['ภาษีมูลค่าเพิ่ม / Vat 7%', totals.vat, false] as [string, number, boolean]] : []),
              ['รวมเป็นเงินทั้งหมด / Grand Total', totals.grand, true],
            ] as [string, number, boolean][]).map(([label, v, strong]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'stretch', marginBottom: 4 }}>
                <div style={{ flex: 1, padding: '4px 8px', fontSize: 12.5, fontWeight: strong ? 700 : 500, display: 'flex', alignItems: 'center' }}>{label}</div>
                <div style={{ width: 130, border: `1.5px solid ${B}`, padding: '4px 8px', textAlign: 'right', fontWeight: strong ? 800 : 600, background: strong ? '#f5f5f5' : 'white' }}>
                  {money(v)} บาท
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== ตัวอักษรไทย ===== */}
        <div style={{ textAlign: 'center', margin: '10px 0 4px', fontSize: 13 }}>
          (............<b>{thaiBahtText(totals.grand)}</b>............)
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>จำนวนเงินรวมทั้งสิ้น (ตัวอักษร)</div>
        </div>
        <div style={{ fontSize: 10, textAlign: 'right', color: '#444' }}>
          *บริษัทขอสงวนสิทธิ์ที่จะเปลี่ยนแปลงราคาสินค้าโดยไม่แจ้งล่วงหน้าตามภาวะตลาด
        </div>

        {/* ===== ช่องเซ็น ===== */}
        <div style={{ display: 'flex', border: `1.5px solid ${B}`, marginTop: 8 }}>
          <div style={{ flex: 1, borderRight: `1.5px solid ${B}`, padding: '8px 12px', minHeight: 110 }}>
            <div style={{ fontSize: 12, fontWeight: 700, textDecoration: 'underline' }}>ลูกค้ายืนยันการสั่งซื้อ Fax: 02-8725622</div>
            <div style={{ marginTop: 46, fontSize: 12, display: 'flex', gap: 6 }}>
              <span style={{ fontWeight: 700 }}>วันที่</span>
              <span style={{ flex: 1, borderBottom: `1px solid ${B}` }} />
            </div>
          </div>
          <div style={{ flex: 1, padding: '8px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 700, textDecoration: 'underline', textAlign: 'left' }}>บริษัท ธนะพัฒน์ฯ</div>
            <div style={{ marginTop: 40, fontSize: 12.5 }}>({draft.salesperson.replace(/^นาย|^นาง(สาว)?/, '')})</div>
            <div style={{ fontSize: 12 }}>ขอแสดงความนับถืออย่างสูง</div>
          </div>
        </div>
      </div>
    </div>
  );
}
