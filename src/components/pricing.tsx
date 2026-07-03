import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { T, fmt } from '../lib/theme';

export function EditNum({ value, onChange, unit = '', prefix = '', size = 'md', color }: {
  value: number;
  onChange: (n: number) => void;
  unit?: string;
  prefix?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const commit = () => {
    setEditing(false);
    const num = parseFloat(draft.replace(/,/g, ''));
    if (!isNaN(num) && num >= 0) onChange(num); else setDraft(String(value));
  };
  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.select(); }, [editing]);
  const fs = size === 'lg' ? 22 : size === 'sm' ? 12 : 14, fw = size === 'lg' ? 700 : 600, col = color || T.blue700;
  if (editing) return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3 }}>
      {prefix && <span style={{ fontSize: fs - 2, color: col, fontWeight: fw }}>{prefix}</span>}
      <input ref={inputRef} className="inline-input" style={{ fontSize: fs, width: Math.max(60, draft.length * (fs * 0.6) + 20) }}
        value={draft} onChange={e => setDraft(e.target.value)} onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setEditing(false); setDraft(String(value)); } }} />
      {unit && <span style={{ fontSize: fs - 3, color: T.slate500 }}>{unit}</span>}
    </span>
  );
  return (
    <span className="editable-field" onClick={() => setEditing(true)} title="คลิกเพื่อแก้ไข"
      style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, padding: '1px 4px', cursor: 'text' }}>
      {prefix && <span style={{ fontSize: fs - 2, color: col, fontWeight: fw }}>{prefix}</span>}
      <span style={{ fontSize: fs, fontWeight: fw, color: col }}>{fmt(value)}</span>
      {unit && <span style={{ fontSize: fs - 3, color: T.slate500, marginLeft: 2 }}>{unit}</span>}
      <span style={{ fontSize: 9, color: T.slate400, marginLeft: 2 }}>✏️</span>
    </span>
  );
}

export function PRow({ label, formula, value, children, muted, highlight }: {
  label: string;
  formula?: string;
  value?: number;
  children?: ReactNode;
  muted?: boolean;
  highlight?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '9px 20px', borderBottom: `1px solid ${T.slate100}`, background: highlight ? '#FFFBEB' : 'transparent', gap: 8 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 13, color: muted ? T.slate400 : T.slate700, fontWeight: muted ? 400 : 500 }}>{label}</span>
        {formula && <div style={{ fontSize: 11, color: T.slate400, marginTop: 2, fontFamily: 'monospace' }}>{formula}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        {children || <span style={{ fontSize: 13, fontWeight: 600, color: muted ? T.slate400 : T.slate900 }}>฿{fmt(value ?? 0)}</span>}
      </div>
    </div>
  );
}

export function StepHeader({ num, icon, title, subtitle, total, color = T.blue700 }: {
  num: number;
  icon: string;
  title: string;
  subtitle?: string;
  total?: number;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: `${color}08`, borderBottom: `1px solid ${color}18` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '.08em' }}>STEP {num}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.slate900 }}>{title}</span>
        </div>
        {subtitle && <div style={{ fontSize: 12, color: T.slate500, marginTop: 1 }}>{subtitle}</div>}
      </div>
      {total !== undefined && (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: T.slate400 }}>รวม</div>
          <div style={{ fontSize: 18, fontWeight: 700, color }}>฿{fmt(total)}</div>
        </div>
      )}
    </div>
  );
}
