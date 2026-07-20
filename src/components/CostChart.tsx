import { useState } from 'react';
import type { CostStep, DraftItem } from '../lib/types';
import { T, fmt } from '../lib/theme';

/* =====================================================================
   แผนภาพแยกส่วนต้นทุน — แท่งสีสัดส่วน + สีประจำหมวด
   สีหมวดหลักเรียงตาม palette ที่ผ่าน CVD validator (แถบข้างกันแยกสีออก
   แม้ตาบอดสี) — หมวดย่อยที่เจอน้อยใช้โทนเทาไล่น้ำหนัก
   ===================================================================== */

type Group = { key: string; label: string; color: string; match: RegExp | null };

export const COST_GROUPS: Group[] = [
  { key: 'plate',  label: 'เพลท + เตรียมงาน', color: '#2a78d6', match: /เพลท|plate|เตรียม|setup/i },
  { key: 'paper',  label: 'กระดาษ',           color: '#008300', match: /กระดาษ|paper/i },
  { key: 'print',  label: 'ค่าพิมพ์ + หมึก',   color: '#e87ba4', match: /พิมพ์|หมึก|ink|offset/i },
  { key: 'coat',   label: 'เคลือบผิว',        color: '#eda100', match: /เคลือบ|ลามิเนต|laminate|ยูวี|\buv\b|วาร์นิช|varnish/i },
  { key: 'foil',   label: 'ปั๊มฟอยล์ / นูน',   color: '#1baf7a', match: /ฟอยล์|foil|ปั๊ม\s*(ทอง|เงิน|นูน|จม)|emboss|deboss/i },
  { key: 'diecut', label: 'ไดคัท / ปั๊มตัด',   color: '#eb6834', match: /ไดคัท|die\s*cut|ปั๊มรู|เจาะรู|ปรุฉีก|ปั๊มปรุ|ตัดริม/i },
  { key: 'bind',   label: 'เข้าเล่ม / เย็บ',   color: '#4a3aa7', match: /เข้าเล่ม|เย็บ|ไสกาว|มุงหลังคา|สัน|กระดูกงู|สกรู|น็อต/i },
  { key: 'labor',  label: 'ค่าแรงช่าง',       color: '#0d366b', match: /ช่าง|ค่าแรง|แรงงาน|labor/i },
  { key: 'assy',   label: 'งานประกอบ / พับ',  color: '#e34948', match: /หุ้ม|จั่วปัง|ประกอบ|ทากาว|พับ|ปะกล่อง|ห่อ|แพ็ค/i },
  { key: 'number', label: 'ตีเบอร์',           color: '#64748B', match: /ตีเบอร์|เลขลำดับ|running/i },
  { key: 'proof',  label: 'ปรุ๊ฟ / ตัวอย่าง',  color: '#CBD5E1', match: /ปรุ๊ฟ|proof|ตัวอย่าง/i },
  { key: 'ship',   label: 'ขนส่ง',            color: '#94A3B8', match: /ขนส่ง|จัดส่ง|ค่าส่ง/i },
  { key: 'other',  label: 'อื่นๆ',            color: '#B7C0CC', match: null },
];

export function stepGroup(name: string): Group {
  return COST_GROUPS.find(g => g.match?.test(name)) ?? COST_GROUPS[COST_GROUPS.length - 1];
}
export const stepColor = (name: string) => stepGroup(name).color;

/* ---------- แท่งสัดส่วนแนวนอน (มี tooltip ตอน hover) ---------- */
export function StackBar({ parts, height = 18 }: {
  parts: { label: string; color: string; value: number }[];
  height?: number;
}) {
  const [tip, setTip] = useState<{ x: number; label: string; value: number; pct: number } | null>(null);
  const total = parts.reduce((s, p) => s + p.value, 0);
  const shown = parts.filter(p => p.value > 0);
  if (total <= 0 || shown.length === 0) {
    return <div style={{ height, borderRadius: 6, background: T.slate100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: T.slate400 }}>ยังไม่มีราคา</div>;
  }
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 2, height, borderRadius: 6, overflow: 'hidden' }}>
        {shown.map((p, i) => {
          const pct = (p.value / total) * 100;
          return (
            <div key={i}
              onMouseEnter={e => {
                const box = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                const seg = e.currentTarget.getBoundingClientRect();
                setTip({ x: seg.left - box.left + seg.width / 2, label: p.label, value: p.value, pct });
              }}
              onMouseLeave={() => setTip(null)}
              style={{ width: `${pct}%`, minWidth: 3, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pct >= 12 && (
                <span style={{ fontSize: 9.5, fontWeight: 800, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.45)', whiteSpace: 'nowrap' }}>
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
      {tip && (
        <div style={{
          position: 'absolute', bottom: height + 6, left: tip.x, transform: 'translateX(-50%)',
          background: T.slate900, color: '#fff', fontSize: 11, fontWeight: 600, padding: '4px 9px',
          borderRadius: 7, whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 5,
          boxShadow: '0 3px 10px rgba(0,0,0,.25)',
        }}>
          {tip.label} · ฿{fmt(tip.value)} · {tip.pct.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* ---------- สรุปสัดส่วนต้นทุนรวมทั้งใบ (ทุก item รวมกันตามหมวด) ---------- */
export function TotalBreakdown({ items }: { items: DraftItem[] }) {
  const sums = new Map<string, { g: Group; value: number }>();
  items.forEach(it => it.steps.forEach((s: CostStep) => {
    const g = stepGroup(s.name);
    const cur = sums.get(g.key) ?? { g, value: 0 };
    cur.value += s.price;
    sums.set(g.key, cur);
  }));
  const rows = [...sums.values()].filter(r => r.value > 0).sort((a, b) => b.value - a.value);
  const total = rows.reduce((s, r) => s + r.value, 0);
  if (total <= 0) return null;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.slate800, marginBottom: 8 }}>
        📊 ราคานี้ประกอบด้วยอะไรบ้าง
      </div>
      <div style={{ background: T.slate50, borderRadius: 12, padding: '12px 14px' }}>
        <StackBar height={22}
          parts={rows.map(r => ({ label: r.g.label, color: r.g.color, value: r.value }))} />
        <div style={{ marginTop: 10 }}>
          {rows.map(r => (
            <div key={r.g.key} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '3px 0', fontSize: 11.5 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: r.g.color, flexShrink: 0, border: '1px solid rgba(0,0,0,.08)' }} />
              <span style={{ color: T.slate700, fontWeight: 600, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.g.label}</span>
              <span style={{ color: T.slate500, width: 38, textAlign: 'right' }}>{((r.value / total) * 100).toFixed(0)}%</span>
              <span style={{ fontWeight: 700, color: T.slate800, width: 78, textAlign: 'right' }}>฿{fmt(r.value)}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10.5, color: T.slate400, marginTop: 8, lineHeight: 1.5 }}>
          💡 แก้ราคาขั้นตอนในรายการสินค้า แผนภาพนี้จะเปลี่ยนตามทันที — ใช้เทียบกับราคาที่โรงงาน/ร้านกระดาษแจ้งจริงได้เลย
        </div>
      </div>
    </div>
  );
}
