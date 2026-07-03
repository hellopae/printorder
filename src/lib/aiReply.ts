import type { Order } from './types';
import { PAPER_PRICES, calcPrice } from './pricing';
import { fmt, fmtI } from './theme';

export const EMPTY_ORDER: Order = { type: null, qty: null, paper: null, finishing: null };

export function parseOrder(text: string, current: Order): Order {
  const t = text.toLowerCase();
  const next = { ...current };

  // qty
  const qtyMatch = text.match(/(\d[\d,]*)\s*(ชุด|ใบ|แผ่น|ชิ้น|เล่ม)/);
  if (qtyMatch) next.qty = parseInt(qtyMatch[1].replace(/,/g, ''));

  // paper
  for (const p of Object.keys(PAPER_PRICES)) {
    if (text.includes(p)) { next.paper = p; break; }
  }
  // rough paper detect
  if (!next.paper) {
    if (t.includes('อาร์ตมัน') && t.includes('150')) next.paper = 'อาร์ตมัน 150 แกรม';
    else if (t.includes('อาร์ตมัน')) next.paper = 'อาร์ตมัน 130 แกรม';
    else if (t.includes('อาร์ตด้าน') && t.includes('150')) next.paper = 'อาร์ตด้าน 150 แกรม';
    else if (t.includes('อาร์ตด้าน')) next.paper = 'อาร์ตด้าน 130 แกรม';
  }

  // finishing
  if (t.includes('matt') || t.includes('เคลือบด้าน')) next.finishing = 'Matt Laminate (เคลือบด้าน)';
  else if (t.includes('gloss') || t.includes('เคลือบมัน')) next.finishing = 'Gloss Laminate (เคลือบมัน)';
  else if (t.includes('ปั๊ม') || t.includes('ฟอยล์')) next.finishing = 'ปั๊มนูน / ฟอยล์';
  else if (t.includes('ไม่ต้องการ') || t.includes('ไม่ต้อง')) next.finishing = 'ไม่ต้องการ Finishing';

  // job type
  if (t.includes('โบรชัวร์') || t.includes('แผ่นพับ')) {
    if (t.includes('a4') || t.includes('เอสี่')) {
      next.type = 'โบรชัวร์ A4';
      if (t.includes('3 ตอน') || t.includes('พับสาม')) next.type = 'โบรชัวร์ A4 พับ 3 ตอน';
    } else {
      next.type = next.type || 'โบรชัวร์ / แผ่นพับ';
    }
  }
  if (t.includes('นามบัตร')) next.type = 'นามบัตร';
  if (t.includes('ปกหนังสือ') || t.includes('ปก')) next.type = next.type || 'ปกหนังสือ / รายงาน';
  if (t.includes('โปสเตอร์') || t.includes('แบนเนอร์')) next.type = 'โปสเตอร์ / แบนเนอร์';
  if (t.includes('แบบฟอร์ม')) next.type = 'แบบฟอร์ม';

  return next;
}

export type AiReply = {
  next: Order;
  text: string;
  chips?: string[];
  showSpec?: boolean;
};

export function getAiReply(text: string, order: Order): AiReply {
  const t = text.toLowerCase();
  const next = parseOrder(text, order);
  const price = calcPrice(next);

  if (t.includes('ยืนยัน') || t.includes('confirm') || t.includes('ออกใบ')) {
    return {
      next,
      text: `✅ ยืนยันแล้วครับ! กำลังสร้างใบเสนอราคา\n\nทีมงานจะติดต่อกลับเพื่อยืนยันราคาจริงภายใน 1 ชั่วโมงครับ`,
      chips: ['ดูใบเสนอราคา', 'สั่งงานอื่นเพิ่ม', 'ติดต่อทีมงาน'],
    };
  }
  if (t.includes('เร่ง')) {
    const rush = price ? price.finalPrice * 1.3 : null;
    return {
      next,
      text: `สำหรับงานเร่ง (ส่งภายใน 2–3 วันทำการ) มีค่าบริการเพิ่ม 30% ครับ${rush ? `\n\nราคาใหม่: <strong>฿${fmt(rush)}</strong> (รวม VAT 7%)` : ''}\n\nยืนยันงานเร่งไหมครับ?`,
      chips: ['ยืนยันงานเร่ง', 'ใช้ระยะเวลาปกติ'],
    };
  }
  if (t.includes('แก้ไข') || t.includes('เปลี่ยน')) {
    return {
      next,
      text: 'ได้เลยครับ ต้องการแก้ไขส่วนไหนครับ?',
      chips: ['เปลี่ยนจำนวน', 'เปลี่ยนกระดาษ', 'เปลี่ยน Finishing', 'เปลี่ยนขนาด'],
    };
  }

  // Finishing chosen → show spec + price
  if (next.finishing && next.finishing !== order.finishing && next.qty) {
    return {
      next,
      text: 'ดีมากครับ! สรุปรายละเอียดงานและราคาเบื้องต้น ดังนี้ครับ',
      showSpec: true,
      chips: ['ยืนยันออกใบเสนอราคา', 'แก้ไขรายละเอียด', 'ต้องการเร่งงาน'],
    };
  }

  // Paper chosen → ask finishing
  if (next.paper && next.paper !== order.paper) {
    return {
      next,
      text: 'เข้าใจแล้วครับ ต้องการ Finishing ด้วยไหมครับ?',
      chips: ['เคลือบมัน (Gloss)', 'เคลือบด้าน (Matt)', 'ปั๊มนูน / ฟอยล์', 'ไม่ต้องการ Finishing'],
    };
  }

  // Qty chosen → ask paper
  if (next.qty && next.qty !== order.qty) {
    return {
      next,
      text: `รับทราบ ${fmtI(next.qty)} ชุดครับ ต้องการกระดาษประเภทไหนครับ?`,
      chips: ['อาร์ตมัน 130 แกรม', 'อาร์ตมัน 150 แกรม', 'อาร์ตด้าน 130 แกรม', 'อาร์ตด้าน 150 แกรม'],
    };
  }

  // Type chosen → ask qty
  if (next.type && next.type !== order.type) {
    return {
      next,
      text: `${next.type} รับทราบครับ 👍\n\nขอทราบจำนวนที่ต้องการพิมพ์ครับ?`,
      chips: next.type.includes('นามบัตร')
        ? ['100 ใบ', '500 ใบ', '1,000 ใบ', 'กำหนดเอง']
        : ['500 ชุด', '1,000 ชุด', '2,000 ชุด', '5,000 ชุด', 'กำหนดเอง'],
    };
  }

  // Default welcome/generic
  return {
    next,
    text: 'รับทราบครับ มีอะไรให้ช่วยเพิ่มเติมไหมครับ?',
    chips: ['ยืนยันออกใบเสนอราคา', 'แก้ไขรายละเอียด', 'ติดต่อทีมงาน'],
  };
}
