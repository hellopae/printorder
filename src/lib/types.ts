export type OrderStatus = 'new' | 'pending' | 'done' | 'confirmed';

export type OrderListItem = {
  id: string;
  preview: string;
  status: OrderStatus;
  time: string;
};

export type Order = {
  type: string | null;
  qty: number | null;
  paper: string | null;
  finishing: string | null;
};

export type Message = {
  id: string;
  role: 'ai' | 'user';
  time: string;
  text: string;
  chips?: string[];
  showSpec?: boolean;
};

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

export type Page = 'chat' | 'pricing' | 'quotations';
