import type { Order } from './types';

export const PAPER_PRICES: Record<string, number> = {
  'อาร์ตมัน 130 แกรม': 580,
  'อาร์ตมัน 150 แกรม': 650,
  'อาร์ตด้าน 130 แกรม': 540,
  'อาร์ตด้าน 150 แกรม': 610,
};

export function getPiecesPerSheet(type: string | null): number {
  if (!type) return 2;
  if (type.includes('นามบัตร')) return 8;
  if (type.includes('A5') || type.includes('แบบฟอร์ม')) return 4;
  if (type.includes('A2') || type.includes('โปสเตอร์') || type.includes('แบนเนอร์')) return 1;
  return 2; // A4 brochure, cover, etc.
}

export function getLaminatePerSheet(finishing: string | null): number {
  if (!finishing || finishing.includes('ไม่')) return 0;
  if (finishing.toLowerCase().includes('gloss') || finishing.includes('มัน')) return 1.0;
  if (finishing.toLowerCase().includes('matt') || finishing.includes('ด้าน')) return 1.2;
  if (finishing.includes('ปั๊ม') || finishing.includes('ฟอยล์')) return 2.5;
  return 0;
}

export type PriceBreakdown = {
  paperCost: number; prePressCost: number; printCost: number;
  laminateCost: number; laborCost: number;
  subtotal: number; profit: number; priceBeforeVat: number; vat: number; finalPrice: number;
  pricePerPiece: number;
  totalSheets: number; reems: number; paperPricePerReem: number;
  piecesPerSheet: number; wastePercent: number; setupSheets: number;
  plateCount: number; platePriceEach: number; setupFee: number;
  printCostPer1000: number; inkCost: number;
  laminatePricePerSheet: number;
  foldCostPer1000: number; cuttingCost: number; packagingCost: number;
  markup: number; vatOn: boolean;
};

export function calcPrice(order: Order, markup = 30, vatOn = true): PriceBreakdown | null {
  const qty = order.qty || 0;
  if (qty === 0) return null;

  const piecesPerSheet = getPiecesPerSheet(order.type);
  const wastePercent = 5;
  const sheets = Math.ceil((qty / piecesPerSheet) * (1 + wastePercent / 100));
  const setupSheets = 50;
  const totalSheets = sheets + setupSheets;
  const reems = totalSheets / 500;

  const paperPricePerReem = (order.paper && PAPER_PRICES[order.paper]) || 580;
  const paperCost = reems * paperPricePerReem;

  const plateCount = 8; // 4 colors × 2 sides
  const plateCost = plateCount * 120;
  const setupFee = 400;
  const prePressCost = plateCost + setupFee;

  const printCostPer1000 = 280;
  const inkCost = 350;
  const printCost = (totalSheets / 1000) * printCostPer1000 + inkCost;

  const laminateCost = totalSheets * getLaminatePerSheet(order.finishing);

  const foldCost = (qty / 1000) * 180;
  const cuttingCost = 150;
  const packCost = 200;
  const laborCost = foldCost + cuttingCost + packCost;

  const subtotal = paperCost + prePressCost + printCost + laminateCost + laborCost;
  const profit = subtotal * (markup / 100);
  const priceBeforeVat = subtotal + profit;
  const vat = vatOn ? priceBeforeVat * 0.07 : 0;
  const finalPrice = priceBeforeVat + vat;

  return {
    paperCost, prePressCost, printCost, laminateCost, laborCost,
    subtotal, profit, priceBeforeVat, vat, finalPrice,
    pricePerPiece: finalPrice / qty,
    totalSheets, reems, paperPricePerReem,
    piecesPerSheet, wastePercent, setupSheets,
    plateCount, platePriceEach: 120, setupFee,
    printCostPer1000, inkCost,
    laminatePricePerSheet: getLaminatePerSheet(order.finishing),
    foldCostPer1000: 180, cuttingCost, packagingCost: packCost,
    markup, vatOn,
  };
}
