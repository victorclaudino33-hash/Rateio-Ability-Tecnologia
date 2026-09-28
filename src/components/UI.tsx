import React from 'react'

/* ── Badge situação ─────────────────────────────────────────────────────── */
const sitColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  F: 'bg-yellow-100 text-yellow-800',
  D: 'bg-red-100 text-red-800',
}
export function BadgeSit({ sit }: { sit: string }) {
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold font-mono ${sitColors[sit] ?? 'bg-gray-100 text-gray-600'}`}>
      {sit}
    </span>
  )
}

/* ── Badge código ───────────────────────────────────────────────────────── */
export function BadgeCod({ cod }: { cod: string }) {
  return (
    <span className="inline-block bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 text-[10px] font-bold font-mono">
      {cod}
    </span>
  )
}

/* ── Botão primário ─────────────────────────────────────────────────────── */
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'red' | 'navy' | 'green' | 'ghost'
  size?: 'sm' | 'md'
}
export function Btn({ variant = 'red', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 font-bold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'
  const sz   = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
  const col  = variant === 'red'   ? 'bg-ability-red text-white hover:bg-red-800'
             : variant === 'navy'  ? 'bg-ability-navy text-white hover:bg-blue-950'
             : variant === 'green' ? 'bg-green-700 text-white hover:bg-green-800'
             : 'border border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
  return <button className={`${base} ${sz} ${col} ${className}`} {...props}>{children}</button>
}

/* ── Card ───────────────────────────────────────────────────────────────── */
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 mb-4 ${className}`}>
      {children}
    </div>
  )
}

/* ── Card title ─────────────────────────────────────────────────────────── */
export function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3 pb-2.5 border-b border-gray-100">
      {children}
    </div>
  )
}

/* ── Stat box ───────────────────────────────────────────────────────────── */
export function StatBox({ value, label, color = '' }: { value: string; label: string; color?: string }) {
  return (
    <div className="flex-1 min-w-[110px] bg-white border border-gray-200 rounded-xl p-4 text-center">
      <div className={`text-2xl font-black leading-tight ${color}`}>{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">{label}</div>
    </div>
  )
}

/* ── Empty state ────────────────────────────────────────────────────────── */
export function Empty({ icon = '🔍', msg }: { icon?: string; msg: string }) {
  return (
    <div className="text-center py-10 text-gray-300">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm">{msg}</p>
    </div>
  )
}

/* ── Toast ──────────────────────────────────────────────────────────────── */
export function Toast({ msg, type }: { msg: string; type: 'ok' | 'err' | 'info' }) {
  const colors = { ok: 'border-l-green-500', err: 'border-l-red-500', info: 'border-l-blue-400' }
  return (
    <div className={`fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl border-l-4 shadow-xl z-50 ${colors[type]} animate-bounce-in`}>
      {msg}
    </div>
  )
}

/* ── Drawer ─────────────────────────────────────────────────────────────── */
export function Drawer({
  open, onClose, title, subtitle, children,
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white w-full max-h-[80vh] rounded-t-2xl p-6 overflow-y-auto animate-slide-up">
        <div className="flex justify-between items-start mb-4">
          <div>
            {subtitle && <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{subtitle}</div>}
            <h3 className="text-sm font-black">{title}</h3>
          </div>
          <button onClick={onClose} className="bg-gray-100 rounded-full w-7 h-7 text-base">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ── Table wrapper ──────────────────────────────────────────────────────── */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  )
}

export function Thead({ children }: { children: React.ReactNode }) {
  return <thead><tr className="bg-ability-dark text-white">{children}</tr></thead>
}

export function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th className={`px-3 py-2.5 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

export function Td({ children, right, green }: { children: React.ReactNode; right?: boolean; green?: boolean }) {
  return (
    <td className={`px-3 py-2.5 ${right ? 'text-right' : ''} ${green ? 'text-green-700 font-bold' : ''}`}>
      {children}
    </td>
  )
}

export function Tfoot({ children }: { children: React.ReactNode }) {
  return <tfoot><tr className="bg-ability-red text-white font-black text-xs">{children}</tr></tfoot>
}

export function Tfd({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`px-3 py-3 ${right ? 'text-right' : ''}`}>{children}</td>
}

