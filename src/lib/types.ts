export type QuotationItem = {
  no: number;
  description: string;
  qty: string | null;
  unit_price: number | null;
  amount: number | null;
  specs: string[];
};

export type Quotation = {
  file: string;
  customer: string | null;
  date: string | null;
  date_estimated: boolean;
  quote_no: string | null;
  items: QuotationItem[];
  subtotal: number | null;
  vat: number | null;
  grand_total: number | null;
};

/* ---------- ใบเสนอราคาที่สร้างใหม่ (Draft) ---------- */

/** ขั้นตอนงานพร้อมราคา — price คือราคารวมของขั้นตอนนี้ ณ จำนวนปัจจุบันของ item
 *  per_unit = ขั้นตอนที่แปรตามจำนวน (กระดาษ พิมพ์ เคลือบ ฯลฯ) จะถูก scale เมื่อแก้จำนวน
 *  fixed = ค่าคงที่ต่องาน (เพลท ปรุ๊ฟ ขนส่ง) ไม่เปลี่ยนตามจำนวน */
export type StepUnit = 'per_unit' | 'fixed';
export type CostStep = { id: string; name: string; unit: StepUnit; price: number };

export type DraftItem = {
  id: string;
  description: string;
  qtyNum: number;
  qtyUnit: string;
  steps: CostStep[];
  specs: string[];
};

export type DraftQuotation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  customer: string;
  address: string;      // หลายบรรทัดคั่นด้วย \n
  date: string;         // ISO yyyy-mm-dd
  quoteNo: string;
  salesperson: string;
  salesTel: string;
  vatEnabled: boolean;
  items: DraftItem[];
  sourceFile: string | null;   // ใบเก่าที่ใช้เป็นแบบ
  sourceLabel: string | null;
};

export type Page = 'quotations' | 'editor';
