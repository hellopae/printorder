import type { DraftQuotation, Quotation, QuotationConditions } from './types';
import { QUOTATIONS } from './quotations';
import { newId, quotationItemToDraft } from './costEngine';

/* ---------- เก็บใบเสนอราคาที่สร้างใหม่ใน browser ---------- */

const KEY = 'orderassist_drafts_v1';

export const defaultConditions = (vatEnabled: boolean): QuotationConditions => ({
  creditChecked: false, creditDays: '30',
  vatNoteChecked: !vatEnabled,
  depositChecked: false, depositPct: '',
  confirmChecked: true, confirmDays: '30',
});

/** เติมค่า default ให้ draft เก่าที่บันทึกก่อนมี field ใหม่ */
export function normalizeDraft(d: DraftQuotation): DraftQuotation {
  return {
    ...d,
    conditions: d.conditions ?? defaultConditions(d.vatEnabled),
    note: d.note ?? '',
    confirmDate: d.confirmDate ?? '',
  };
}

export function loadDrafts(): DraftQuotation[] {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(d) ? d.map(normalizeDraft) : [];
  } catch { return []; }
}

export function saveDraft(draft: DraftQuotation): DraftQuotation[] {
  const list = loadDrafts().filter(d => d.id !== draft.id);
  list.unshift({ ...draft, updatedAt: new Date().toISOString() });
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)));
  return list;
}

export function deleteDraft(id: string): DraftQuotation[] {
  const list = loadDrafts().filter(d => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

/* ---------- สร้าง draft ---------- */

const todayISO = () => new Date().toISOString().slice(0, 10);

/** เลขที่ใบถัดไป: เลขสูงสุดในใบเก่า 1,666 ใบ + ใบที่สร้างเอง + 1 */
export function nextQuoteNo(): string {
  let max = 0;
  for (const q of QUOTATIONS) {
    const n = parseInt(q.quote_no || '', 10);
    if (!isNaN(n) && n > max) max = n;
  }
  for (const d of loadDrafts()) {
    const n = parseInt(d.quoteNo, 10);
    if (!isNaN(n) && n > max) max = n;
  }
  return String(max + 1);
}

export function draftFromQuotation(q: Quotation): DraftQuotation {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    customer: q.customer || '',
    address: '',
    date: todayISO(),
    quoteNo: nextQuoteNo(),
    salesperson: 'นายกิตติ์ธเนศ ฤทธิพรพลิษฐ์',
    salesTel: '095-6529929',
    vatEnabled: q.vat != null && q.vat > 0,
    items: q.items.map(quotationItemToDraft),
    conditions: defaultConditions(q.vat != null && q.vat > 0),
    note: '',
    confirmDate: '',
    sourceFile: q.file,
    sourceLabel: `#${q.quote_no || '—'} · ${q.customer || ''}`,
  };
}

export function emptyDraft(): DraftQuotation {
  const now = new Date().toISOString();
  return {
    id: newId(),
    createdAt: now,
    updatedAt: now,
    customer: '',
    address: '',
    date: todayISO(),
    quoteNo: nextQuoteNo(),
    salesperson: 'นายกิตติ์ธเนศ ฤทธิพรพลิษฐ์',
    salesTel: '095-6529929',
    vatEnabled: true,
    items: [{
      id: newId(), description: '', qtyNum: 100, qtyUnit: 'ชิ้น',
      steps: [
        { id: newId(), name: 'เพลท + เตรียมงาน', unit: 'fixed', price: 0 },
        { id: newId(), name: 'กระดาษ', unit: 'per_unit', price: 0 },
        { id: newId(), name: 'ค่าพิมพ์ + หมึก', unit: 'per_unit', price: 0 },
      ],
      specs: [],
    }],
    conditions: defaultConditions(true),
    note: '',
    confirmDate: '',
    sourceFile: null,
    sourceLabel: null,
  };
}

/* ---------- ยอดรวมของ draft ---------- */

export function draftTotals(d: DraftQuotation) {
  const subtotal = d.items.reduce((s, it) => s + it.steps.reduce((a, x) => a + x.price, 0), 0);
  const vat = d.vatEnabled ? Math.round(subtotal * 7) / 100 : 0;
  return { subtotal, vat, grand: subtotal + vat };
}
