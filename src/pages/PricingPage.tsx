import { useState } from 'react';
import type { Order } from '../lib/types';
import { T, fmt, fmtI } from '../lib/theme';
import { calcPrice } from '../lib/pricing';
import { EditNum, PRow, StepHeader } from '../components/pricing';

export function PricingPage({ order }: { order: Order }) {
  const seed = calcPrice(order);

  const [piecesPerSheet, setPiecesPerSheet] = useState(seed?.piecesPerSheet || 2);
  const [wastePercent, setWastePercent] = useState(seed?.wastePercent || 5);
  const [paperPricePerReem, setPaperPricePerReem] = useState(seed?.paperPricePerReem || 580);
  const [plateCount, setPlateCount] = useState(seed?.plateCount || 8);
  const [platePriceEach, setPlatePriceEach] = useState(seed?.platePriceEach || 120);
  const [setupFee, setSetupFee] = useState(seed?.setupFee || 400);
  const [printCostPer1000, setPrintCostPer1000] = useState(seed?.printCostPer1000 || 280);
  const [inkCost, setInkCost] = useState(seed?.inkCost || 350);
  const [laminatePPS, setLaminatePPS] = useState(seed?.laminatePricePerSheet ?? 1.2);
  const [foldCostPer1000, setFoldCostPer1000] = useState(seed?.foldCostPer1000 || 180);
  const [cuttingCost, setCuttingCost] = useState(seed?.cuttingCost || 150);
  const [packagingCost, setPackagingCost] = useState(seed?.packagingCost || 200);
  const [designCost, setDesignCost] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [markupPercent, setMarkupPercent] = useState(30);
  const [vatIncluded, setVatIncluded] = useState(true);

  const qty = order.qty || 1000;

  const sheets = Math.ceil((qty / piecesPerSheet) * (1 + wastePercent / 100));
  const setupSheets = 50;
  const totalSheets = sheets + setupSheets;
  const reems = totalSheets / 500;
  const paperCost = reems * paperPricePerReem;
  const plateCost = plateCount * platePriceEach;
  const prePressCost = plateCost + setupFee;
  const printCost = (totalSheets / 1000) * printCostPer1000;
  const totalPrint = printCost + inkCost;
  const laminateCost = totalSheets * laminatePPS;
  const foldCost = (qty / 1000) * foldCostPer1000;
  const laborCost = foldCost + cuttingCost + packagingCost;
  const otherTotal = designCost + deliveryCost + otherCost;
  const subtotal = paperCost + prePressCost + totalPrint + laminateCost + laborCost + otherTotal;
  const profit = subtotal * (markupPercent / 100);
  const priceBeforeVat = subtotal + profit;
  const vat = vatIncluded ? priceBeforeVat * 0.07 : 0;
  const finalPrice = priceBeforeVat + vat;
  const ppp = finalPrice / qty;

  const costBars = [
    { val: paperCost, color: '#1D4ED8' }, { val: prePressCost, color: '#7C3AED' },
    { val: totalPrint, color: '#0891B2' }, { val: laminateCost, color: '#059669' },
    { val: laborCost, color: '#D97706' }, { val: otherTotal, color: '#94A3B8' },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#F0F4FF' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px 60px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

        {/* LEFT */}
        <div>
          {/* Order info */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slate200}`, overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ background: T.blue700, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#93C5FD', letterSpacing: '.06em', marginBottom: 2 }}>ORDER</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>TPR-2026-089</div>
              </div>
              <div style={{ padding: '4px 12px', background: 'rgba(255,255,255,.18)', borderRadius: 20, fontSize: 11, fontWeight: 600, color: 'white' }}>ดูต้นฉบับใน PrintCal →</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
              {([
                ['ประเภทงาน', order.type || '—'],
                ['จำนวนพิมพ์', `${fmtI(qty)} ชุด`],
                ['กระดาษ', order.paper || 'อาร์ตมัน 130 แกรม'],
                ['Finishing', order.finishing || '—'],
                ['สี', '4 สี CMYK ทั้ง 2 หน้า'],
                ['ขนาด', 'A4 (210 × 297 มม.)'],
              ] as [string, string][]).map(([k, v], i) => (
                <div key={k} style={{ padding: '10px 16px', borderRight: i % 3 !== 2 ? `1px solid ${T.slate100}` : 'none', borderBottom: i < 3 ? `1px solid ${T.slate100}` : 'none' }}>
                  <div style={{ fontSize: 10, color: T.slate400, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.slate900 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 1 */}
          <div className="step-card">
            <StepHeader num={1} icon="📄" title="ต้นทุนกระดาษ" subtitle="คำนวณจากจำนวนชิ้นต่อแผ่น × จำนวน × ราคาต่อรีม" total={paperCost} color="#1D4ED8" />
            <PRow label="จำนวนชิ้นต่อแผ่น" formula={`${piecesPerSheet} ชิ้น/แผ่น`}>
              <EditNum value={piecesPerSheet} onChange={setPiecesPerSheet} unit="ชิ้น/แผ่น" color="#1D4ED8" />
            </PRow>
            <PRow label="แผ่นพิมพ์สุทธิ" formula={`⌈${fmtI(qty)} ÷ ${piecesPerSheet}⌉ = ${fmtI(Math.ceil(qty / piecesPerSheet))} แผ่น`} muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{fmtI(Math.ceil(qty / piecesPerSheet))} แผ่น</span>
            </PRow>
            <PRow label="Waste setup" formula="แผ่นตั้งสีเครื่องพิมพ์ (คงที่)" muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{setupSheets} แผ่น</span>
            </PRow>
            <PRow label="Waste %" formula={`+${wastePercent}% กระดาษเสีย`}>
              <EditNum value={wastePercent} onChange={setWastePercent} unit="%" color={T.slate600} />
            </PRow>
            <PRow label="แผ่นพิมพ์รวม" highlight>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1D4ED8' }}>{fmtI(totalSheets)} แผ่น</span>
            </PRow>
            <PRow label="จำนวนรีม" muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{reems.toFixed(2)} รีม</span>
            </PRow>
            <PRow label="ราคากระดาษ / รีม" formula={order.paper || 'อาร์ตมัน 130g'}>
              <EditNum value={paperPricePerReem} onChange={setPaperPricePerReem} prefix="฿" unit="/ รีม" color="#1D4ED8" />
            </PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: '#EFF6FF' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.slate500 }}>{reems.toFixed(2)} รีม × ฿{fmt(paperPricePerReem)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1D4ED8' }}>฿{fmt(paperCost)}</div>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* STEP 2 */}
          <div className="step-card">
            <StepHeader num={2} icon="⚙️" title="เพลท + ค่าเปิดเครื่อง" subtitle="จำนวนเพลท × ราคา + ค่า Setup เครื่องพิมพ์" total={prePressCost} color="#7C3AED" />
            <PRow label="จำนวนเพลท" formula="4 สี (CMYK) × 2 ด้าน">
              <EditNum value={plateCount} onChange={setPlateCount} unit="เพลท" color="#7C3AED" />
            </PRow>
            <PRow label="ราคา / เพลท">
              <EditNum value={platePriceEach} onChange={setPlatePriceEach} prefix="฿" unit="/ เพลท" color="#7C3AED" />
            </PRow>
            <PRow label="รวมค่าเพลท" formula={`${plateCount} × ฿${fmt(platePriceEach)}`} muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>฿{fmt(plateCost)}</span>
            </PRow>
            <PRow label="ค่าเปิดเครื่อง (Setup)">
              <EditNum value={setupFee} onChange={setSetupFee} prefix="฿" color="#7C3AED" />
            </PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: '#F5F3FF' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.slate500 }}>฿{fmt(plateCost)} + ฿{fmt(setupFee)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#7C3AED' }}>฿{fmt(prePressCost)}</div>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* STEP 3 */}
          <div className="step-card">
            <StepHeader num={3} icon="🖨️" title="ค่าพิมพ์ + หมึก" subtitle="คิดตาม 1,000 แผ่น + ค่าหมึกรวม" total={totalPrint} color="#0891B2" />
            <PRow label="แผ่นพิมพ์จริง" muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{fmtI(totalSheets)} แผ่น</span>
            </PRow>
            <PRow label="ค่าพิมพ์ / 1,000 แผ่น" formula="Offset 4 สี — ราคาโรงงาน">
              <EditNum value={printCostPer1000} onChange={setPrintCostPer1000} prefix="฿" unit="/ 1k แผ่น" color="#0891B2" />
            </PRow>
            <PRow label="ค่าพิมพ์รวม" formula={`${fmtI(totalSheets)} ÷ 1,000 × ฿${fmt(printCostPer1000)}`} muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>฿{fmt(printCost)}</span>
            </PRow>
            <PRow label="ค่าหมึกพิมพ์ (CMYK)" formula="รวม 4 สี ทั้ง 2 ด้าน">
              <EditNum value={inkCost} onChange={setInkCost} prefix="฿" color="#0891B2" />
            </PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: '#ECFEFF' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.slate500 }}>฿{fmt(printCost)} + ฿{fmt(inkCost)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0891B2' }}>฿{fmt(totalPrint)}</div>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* STEP 4 */}
          <div className="step-card">
            <StepHeader num={4} icon="✨" title="Post-press / Finishing" subtitle={order.finishing || 'เลือก Finishing ใน Chat'} total={laminateCost} color="#059669" />
            <PRow label="ประเภท Finishing" muted>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.slate700 }}>{order.finishing || '—'}</span>
            </PRow>
            <PRow label="ราคาเคลือบ / แผ่น" formula="ราคาโรงงาน">
              <EditNum value={laminatePPS} onChange={setLaminatePPS} prefix="฿" unit="/ แผ่น" color="#059669" />
            </PRow>
            <PRow label="จำนวนแผ่น" muted>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.slate700 }}>{fmtI(totalSheets)} แผ่น</span>
            </PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: '#F0FDF4' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.slate500 }}>{fmtI(totalSheets)} แผ่น × ฿{fmt(laminatePPS)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#059669' }}>฿{fmt(laminateCost)}</div>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* STEP 5 */}
          <div className="step-card">
            <StepHeader num={5} icon="👷" title="ค่าแรงงาน" subtitle="ตัด / พับ / บรรจุ" total={laborCost} color="#D97706" />
            <PRow label="ค่าพับ (Folding)" formula={`${qty / 1000} พัน × ฿${fmt(foldCostPer1000)}/1k`}>
              <EditNum value={foldCostPer1000} onChange={setFoldCostPer1000} prefix="฿" unit="/ 1k ชิ้น" color="#D97706" />
            </PRow>
            <PRow label="ค่าตัดกระดาษ">
              <EditNum value={cuttingCost} onChange={setCuttingCost} prefix="฿" color="#D97706" />
            </PRow>
            <PRow label="ค่าบรรจุ / แพ็ค">
              <EditNum value={packagingCost} onChange={setPackagingCost} prefix="฿" color="#D97706" />
            </PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: '#FFFBEB' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: T.slate500 }}>฿{fmt(foldCost)} + ฿{fmt(cuttingCost)} + ฿{fmt(packagingCost)}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>฿{fmt(laborCost)}</div>
              </div>
            </div>
          </div>

          <div className="connector">↓</div>

          {/* STEP 6 */}
          <div className="step-card">
            <StepHeader num={6} icon="💼" title="ค่าใช้จ่ายอื่นๆ" subtitle="ออกแบบ / ขนส่ง / อื่นๆ" total={otherTotal} color="#64748B" />
            <PRow label="ค่าออกแบบ / Pre-press"><EditNum value={designCost} onChange={setDesignCost} prefix="฿" color={T.slate600} /></PRow>
            <PRow label="ค่าขนส่ง / ส่งของ"><EditNum value={deliveryCost} onChange={setDeliveryCost} prefix="฿" color={T.slate600} /></PRow>
            <PRow label="ค่าใช้จ่ายอื่นๆ"><EditNum value={otherCost} onChange={setOtherCost} prefix="฿" color={T.slate600} /></PRow>
            <div style={{ padding: '10px 20px 14px', display: 'flex', justifyContent: 'flex-end', background: T.slate50 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.slate600 }}>฿{fmt(otherTotal)}</div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: 'sticky', top: 78 }}>
          {/* Cost summary */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slate200}`, overflow: 'hidden', marginBottom: 16, boxShadow: '0 2px 12px rgba(29,78,216,.07)' }}>
            <div style={{ background: T.blueGrad, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: '#93C5FD', letterSpacing: '.08em', marginBottom: 4 }}>สรุปต้นทุน</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>฿{fmt(subtotal)}</div>
              <div style={{ fontSize: 12, color: '#BAE6FD', marginTop: 2 }}>ต้นทุนรวมทั้งหมด (ก่อน Markup)</div>
            </div>
            <div style={{ padding: '4px 0' }}>
              {[
                { label: '📄 กระดาษ', val: paperCost, color: '#1D4ED8' },
                { label: '⚙️ เพลท + Setup', val: prePressCost, color: '#7C3AED' },
                { label: '🖨️ ค่าพิมพ์+หมึก', val: totalPrint, color: '#0891B2' },
                { label: '✨ Finishing', val: laminateCost, color: '#059669' },
                { label: '👷 ค่าแรงงาน', val: laborCost, color: '#D97706' },
                { label: '💼 อื่นๆ', val: otherTotal, color: '#64748B' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 20px', borderBottom: `1px solid ${T.slate100}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }}></div>
                    <span style={{ fontSize: 12, color: T.slate700 }}>{label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color }}>฿{fmt(val)}</span>
                    <span style={{ fontSize: 10, color: T.slate400, display: 'block' }}>{subtotal > 0 ? ((val / subtotal) * 100).toFixed(1) : '0.0'}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 20px 6px' }}>
              <div style={{ height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex', gap: 1 }}>
                {costBars.map(({ val, color }, i) => (
                  <div key={i} style={{ flex: subtotal > 0 ? val / subtotal : 1 / 6, background: color, height: '100%', minWidth: 2 }}></div>
                ))}
              </div>
            </div>
            <div style={{ height: 8 }}></div>
          </div>

          {/* Markup + VAT */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slate200}`, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.slate100}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.slate400, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>ตั้งราคาขาย</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: T.slate700 }}>Markup / กำไร</span>
                <EditNum value={markupPercent} onChange={setMarkupPercent} unit="%" color={T.green600} />
              </div>
              <div style={{ background: T.slate100, borderRadius: 6, height: 4, marginBottom: 12 }}>
                <div style={{ background: T.green600, height: '100%', borderRadius: 6, width: `${Math.min(markupPercent, 100)}%`, transition: 'width .3s' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: T.slate700 }}>บวก VAT 7%</span>
                <button onClick={() => setVatIncluded(v => !v)} style={{ width: 42, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: vatIncluded ? T.blue600 : T.slate300, position: 'relative', transition: 'background .2s' }}>
                  <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 2, left: vatIncluded ? 22 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }}></div>
                </button>
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {([
                { label: 'ต้นทุนรวม', val: subtotal, muted: true, color: undefined as string | undefined, bold: false },
                { label: `กำไร (${markupPercent}%)`, val: profit, color: T.green600 as string | undefined, muted: true, bold: false },
                { label: 'ราคาก่อน VAT', val: priceBeforeVat, bold: true, muted: false, color: undefined },
                ...(vatIncluded ? [{ label: 'VAT 7%', val: vat, muted: true, bold: false, color: undefined as string | undefined }] : []),
              ]).map(({ label, val, color, muted, bold }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 20px', fontSize: 13, fontWeight: bold ? 700 : 500, borderTop: bold ? `1px solid ${T.slate200}` : 'none', marginTop: bold ? 4 : 0 }}>
                  <span style={{ color: muted && !bold ? T.slate500 : T.slate800 }}>{label}</span>
                  <span style={{ color: color || (bold ? T.slate900 : T.slate600) }}>฿{fmt(val)}</span>
                </div>
              ))}
            </div>
            <div style={{ margin: '0 16px 16px', background: T.blue700, borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 11, color: '#93C5FD' }}>ราคาขายสุทธิ</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: 'white', lineHeight: 1.1 }}>฿{fmt(finalPrice)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: '#93C5FD' }}>ราคาต่อชิ้น</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>฿{fmt(ppp)}</div>
                  <div style={{ fontSize: 10, color: '#60A5FA' }}>/ ชุด</div>
                </div>
              </div>
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.2)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#93C5FD' }}>Margin จริง</span>
                <span style={{ color: 'white', fontWeight: 700 }}>{finalPrice > 0 ? ((profit / finalPrice) * 100).toFixed(1) : '0.0'}%</span>
              </div>
            </div>
          </div>

          {/* Tool links */}
          <div style={{ background: T.white, borderRadius: 16, border: `1px solid ${T.slate200}`, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.slate400, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>เครื่องมือต้นทุน</div>
            {[
              { href: 'https://hellopae.github.io/PrintCost/', icon: '📊', name: 'PrintCost Dashboard', sub: 'ติดตามราคาวัตถุดิบแบบ real-time' },
              { href: 'https://hellopae.github.io/PrintCal/', icon: '🖨️', name: 'Smart Print Calculator', sub: 'คำนวณราคางานพิมพ์ละเอียด' },
            ].map(({ href, icon, name, sub }) => (
              <a key={name} href={href} target="_blank" rel="noopener"
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.slate200}`, textDecoration: 'none', marginBottom: 8, background: T.slate50, transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue400; e.currentTarget.style.background = T.blue50; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.slate200; e.currentTarget.style.background = T.slate50; }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.slate900 }}>{name}</div>
                  <div style={{ fontSize: 11, color: T.slate500 }}>{sub}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: T.slate400, fontSize: 14 }}>→</span>
              </a>
            ))}
            <div style={{ marginTop: 4, padding: '10px 12px', background: T.blue50, borderRadius: 10, border: `1px dashed ${T.blue100}` }}>
              <div style={{ fontSize: 11, color: T.blue700, fontWeight: 600 }}>💡 เคล็ดลับ</div>
              <div style={{ fontSize: 11, color: T.slate600, marginTop: 3, lineHeight: 1.5 }}>คลิกที่ตัวเลข ✏️ ใดก็ได้เพื่อแก้ไขต้นทุนตามราคาจริงจากโรงงาน ระบบจะคำนวณราคาขายใหม่อัตโนมัติ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
