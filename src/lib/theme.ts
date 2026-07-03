export const T = {
  blue700: '#1D4ED8', blue600: '#2563EB', blue500: '#3B82F6', blue400: '#60A5FA',
  blue100: '#DBEAFE', blue50: '#EFF6FF',
  blueGrad: 'linear-gradient(135deg,#0F2D6B 0%,#1D4ED8 100%)',
  slate900: '#0F172A', slate800: '#1E293B', slate700: '#334155', slate600: '#475569',
  slate500: '#64748B', slate400: '#94A3B8', slate300: '#CBD5E1',
  slate200: '#E2E8F0', slate100: '#F1F5F9', slate50: '#F8FAFF', white: '#FFFFFF',
  green600: '#16A34A', green: '#10B981',
} as const;

export const fmt = (n: number) =>
  Number(n).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtI = (n: number) => Number(n).toLocaleString('th-TH');
