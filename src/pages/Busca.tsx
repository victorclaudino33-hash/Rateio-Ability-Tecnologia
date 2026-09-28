import React, { useState } from 'react'
import { Card, CardTitle, BadgeSit } from '../components/UI'
import { brl } from '../lib/utils'
import type { Colaborador } from '../types'

interface Props { colabs: Colaborador[]; valorUnit: number }

export default function Busca({ colabs, valorUnit }: Props) {
  const [q, setQ] = useState('')

  const resultados = q.length >= 2
    ? colabs.filter(c =>
        (c.colab||'').toLowerCase().includes(q.toLowerCase()) ||
        (c.re||'').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 50)
    : []

  return (
    <Card>
      <CardTitle>Buscar colaborador por nome ou matrícula</CardTitle>
      <p className="text-xs text-gray-500 mb-4">Mostra o centro de custo, cargo, situação e valor no rateio.</p>
      <input
        type="text" value={q} onChange={e => setQ(e.target.value)}
        placeholder="Digite o nome ou matrícula..."
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ability-red mb-2"
        autoFocus
      />
      {q.length >= 2 && (
        <div className="text-xs text-gray-400 mb-3">{resultados.length} resultado(s)</div>
      )}
      {q.length >= 2 && !resultados.length && (
        <div className="text-center text-gray-300 py-10">
          <div className="text-3xl mb-2">😕</div>
          <p className="text-sm">Nenhum resultado para <strong>"{q}"</strong></p>
        </div>
      )}
      <div className="flex flex-col gap-3">
        {resultados.map((c, i) => (
          <div key={i} className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-3 bg-white flex-wrap gap-3">
            <div>
              <div className="font-black text-sm">{c.colab || '—'}</div>
              <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                {c.re && <span>Mat. {c.re}</span>}
                {c.re && c.cargo && <span>·</span>}
                {c.cargo && <span>{c.cargo}</span>}
                <BadgeSit sit={c.sit} />
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xl font-black text-ability-red">{c.dept}</div>
              <div className="text-xs text-gray-400">{c.nome || '—'}</div>
              <div className="text-xs font-bold text-green-700 mt-0.5">{brl(valorUnit)}</div>
            </div>
          </div>
        ))}
      </div>
      {!colabs.length && (
        <div className="text-center text-gray-300 py-10">
          <div className="text-3xl mb-2">🔍</div>
          <p className="text-sm">Carregue a planilha na aba <strong>Upload</strong> primeiro.</p>
        </div>
      )}
    </Card>
  )
}
