import type { CostStep, DraftItem, QuotationItem, StepUnit } from './types';

/* =====================================================================
   Cost Engine — แตกใบเสนอราคาเก่าเป็น "ขั้นตอน + ราคา" ที่แก้ไขได้
   อัตราอ้างอิงมาจาก PrintCal (hellopae.github.io/PrintCal) และต้นทุนจริง
   จาก PrintCost (hellopae.github.io/PrintCost)
   ===================================================================== */

/** อัตราอ้างอิงจาก PrintCal DEFAULT_COST_DB — แสดงเป็น "ราคากลาง" ข้างขั้นตอน */
export const REF_RATES: { name: string; rate: string }[] = [
  { name: 'เพลท', rate: '฿150/เพลท + Setup ฿500' },
  { name: 'ค่าพิมพ์ offset', rate: '฿350/1,000 แผ่น + หมึก ฿25/สี/1,000 แผ่น' },
  { name: 'กระดาษอาร์ตด้าน 157g', rate: '฿310/รีม (500 แผ่นใหญ่)' },
  { name: 'กระดาษอาร์ตการ์ด 300g', rate: '฿345/รีม' },
  { name: 'เคลือบ PVC 1 หน้า', rate: '฿800/1,000 แผ่น (2 หน้า ฿1,400)' },
  { name: 'เคลือบ UV 1 หน้า', rate: '฿600/1,000 แผ่น' },
  { name: 'ปั๊มทอง/เงิน', rate: '฿2,500–3,000/1,000 ชิ้น' },
  { name: 'ปั๊มนูน/จม', rate: '฿2,000/1,000 ชิ้น' },
  { name: 'ไดคัท', rate: '฿2,000/1,000 ชิ้น' },
  { name: 'เย็บมุงหลังคา', rate: '฿1,500/งาน · ไสกาว ฿2,000 · สันห่วง ฿2,500' },
  { name: 'ค่าแรงช่างพิมพ์', rate: '฿700/วัน · พนักงาน ฿400/วัน' },
];

export const PRINTCAL_URL = 'https://hellopae.github.io/PrintCal/';
export const PRINTCOST_URL = 'https://hellopae.github.io/PrintCost/';

let uid = 0;
export const newId = () => `s${Date.now().toString(36)}${(++uid).toString(36)}`;

/** กติกาตรวจจับขั้นตอนจากข้อความ spec ของใบเก่า
 *  weight = สัดส่วนโดยประมาณของราคาขาย (ปรับตามงานจริงของโรงพิมพ์ offset) */
type Rule = {
  name: string;
  unit: StepUnit;
  weight: number;
  match: RegExp | null;        // null = มีเสมอ
  exclude?: RegExp;            // ถ้าเจอ pattern นี้ ให้ข้าม (เช่น ขนส่งคิดแยก)
};

const RULES: Rule[] = [
  { name: 'เพลท + เตรียมงาน', unit: 'fixed', weight: 12, match: null },
  { name: 'กระดาษ', unit: 'per_unit', weight: 30, match: null },
  { name: 'ค่าพิมพ์ + หมึก', unit: 'per_unit', weight: 26, match: null },
  { name: 'เคลือบผิว', unit: 'per_unit', weight: 9, match: /เคลือบ|ลามิเนต|laminate|ยูวี|\buv\b|วาร์นิช|varnish/i },
  { name: 'ปั๊มฟอยล์ / ปั๊มนูน', unit: 'per_unit', weight: 8, match: /ปั๊ม\s*(ทอง|เงิน|นูน|จม|ฟอยล์)|foil|emboss|deboss/i },
  { name: 'ไดคัท / ปั๊มตัด', unit: 'per_unit', weight: 7, match: /ไดคัท|die\s*cut|ปั๊มรู|เจาะรู|ปรุฉีก|ปั๊มปรุ|บั๊มปรุ|ปั๊?มปรุ|ตัดริม/i },
  { name: 'เข้าเล่ม / เย็บ', unit: 'per_unit', weight: 9, match: /เข้าเล่ม|เย็บ|ไสกาว|มุงหลังคา|สันห่วง|สันเกลียว|กระดูกงู|สกรู|สกู|น็อต/i },
  { name: 'งานประกอบ / หุ้ม / พับ', unit: 'per_unit', weight: 7, match: /หุ้ม|จั่วปัง|ประกอบ|ทากาว|พับ(?!ได้)|ปะกล่อง|ห่อ|แพ็ค/i },
  { name: 'ตีเบอร์ / เลขลำดับ', unit: 'per_unit', weight: 4, match: /ตีเบอร์|เลขลำดับ|running\s*number|เล่มละ\s*\d+\s*ชุด/i },
  { name: 'ตัวอย่าง / ปรุ๊ฟสี', unit: 'fixed', weight: 4, match: /ปรุ๊ฟ|proof|ตัวอย่าง/i },
  { name: 'ค่าขนส่ง', unit: 'fixed', weight: 3, match: /ขนส่ง|จัดส่ง|ค่าส่ง/i, exclude: /คิดแยก|แยกตาม|ตามจริง|ไม่รวม/ },
];

/** ดึงจำนวนตัวเลข + หน่วยจาก string เช่น "50 เล่ม" → {num:50, unit:'เล่ม'} */
export function parseQty(qty: string | null): { num: number; unit: string } {
  if (!qty) return { num: 1, unit: 'ชิ้น' };
  const m = qty.replace(/,/g, '').match(/([\d.]+)\s*(.*)/);
  if (!m) return { num: 1, unit: qty.trim() || 'ชิ้น' };
  return { num: parseFloat(m[1]) || 1, unit: (m[2] || 'ชิ้น').trim() || 'ชิ้น' };
}

/** แตก item ของใบเก่าเป็นขั้นตอน โดยกระจายราคาขายจริงของใบเก่าตามน้ำหนักขั้นตอนที่ตรวจพบ
 *  → ยอดรวมขั้นตอน = ราคาจริงของใบเก่าเสมอ (ไม่ใช่ตัวเลขสมมติ) */
export function specsToSteps(item: QuotationItem): CostStep[] {
  const hay = [item.description, ...item.specs].join(' ');
  const amount = item.amount ?? 0;

  const hit = RULES.filter(r =>
    (r.match === null || r.match.test(hay)) && !(r.exclude && r.exclude.test(hay)));

  const totW = hit.reduce((s, r) => s + r.weight, 0) || 1;
  const steps: CostStep[] = hit.map(r => ({
    id: newId(),
    name: r.name,
    unit: r.unit,
    price: Math.round(amount * r.weight / totW),
  }));
  // ปัดเศษให้ผลรวมเท่าราคาจริงเป๊ะ
  const diff = amount - steps.reduce((s, x) => s + x.price, 0);
  if (steps.length > 0) steps[steps.length - 1].price += diff;
  return steps;
}

export function quotationItemToDraft(item: QuotationItem): DraftItem {
  const q = parseQty(item.qty);
  return {
    id: newId(),
    description: item.description,
    qtyNum: q.num,
    qtyUnit: q.unit,
    steps: specsToSteps(item),
    specs: [...item.specs],
  };
}

/* ---------- คำนวณยอด ---------- */

export const itemAmount = (it: DraftItem) => it.steps.reduce((s, x) => s + x.price, 0);
export const itemUnitPrice = (it: DraftItem) => (it.qtyNum > 0 ? itemAmount(it) / it.qtyNum : 0);

/** เปลี่ยนจำนวน: ขั้นตอน per_unit ถูก scale ตามสัดส่วน, fixed คงเดิม */
export function rescaleForQty(it: DraftItem, newQty: number): DraftItem {
  if (newQty <= 0 || it.qtyNum <= 0) return { ...it, qtyNum: Math.max(newQty, 0) };
  const k = newQty / it.qtyNum;
  return {
    ...it,
    qtyNum: newQty,
    steps: it.steps.map(s => (s.unit === 'per_unit' ? { ...s, price: Math.round(s.price * k * 100) / 100 } : s)),
  };
}

/** ล็อคราคา/หน่วยใหม่: scale ทุกขั้นตอนตามสัดส่วนให้ Σ = ราคาที่ต้องการ */
export function rescaleForUnitPrice(it: DraftItem, unitPrice: number): DraftItem {
  const target = unitPrice * it.qtyNum;
  const cur = itemAmount(it);
  if (cur <= 0) {
    // ไม่มีขั้นตอน/ราคาเดิมเป็นศูนย์ — ใส่เป็นขั้นตอนเดียว
    return { ...it, steps: [{ id: newId(), name: 'ราคาเหมารวม', unit: 'per_unit', price: target }] };
  }
  const k = target / cur;
  const steps = it.steps.map(s => ({ ...s, price: Math.round(s.price * k * 100) / 100 }));
  const diff = Math.round((target - steps.reduce((s, x) => s + x.price, 0)) * 100) / 100;
  if (steps.length) steps[steps.length - 1].price = Math.round((steps[steps.length - 1].price + diff) * 100) / 100;
  return { ...it, steps };
}

/* ---------- จำนวนเงินเป็นตัวอักษรไทย (สำหรับใบเสนอราคา) ---------- */

const TH_NUM = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
const TH_POS = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];

function readMillion(n: number): string {
  let out = '';
  const s = String(Math.floor(n));
  for (let i = 0; i < s.length; i++) {
    const d = +s[i], pos = s.length - i - 1;
    if (d === 0) continue;
    if (pos === 0 && d === 1 && s.length > 1) out += 'เอ็ด';
    else if (pos === 1 && d === 2) out += 'ยี่สิบ';
    else if (pos === 1 && d === 1) out += 'สิบ';
    else out += TH_NUM[d] + TH_POS[pos];
  }
  return out;
}

export function thaiBahtText(amount: number): string {
  const n = Math.round(amount * 100) / 100;
  const baht = Math.floor(n);
  const satang = Math.round((n - baht) * 100);
  let out = '';
  let rest = baht;
  const parts: string[] = [];
  while (rest > 0) { parts.unshift(readMillion(rest % 1000000)); rest = Math.floor(rest / 1000000); }
  out = parts.length ? parts.join('ล้าน') : 'ศูนย์';
  out += 'บาท';
  out += satang > 0 ? readMillion(satang) + 'สตางค์' : 'ถ้วน';
  return out;
}
