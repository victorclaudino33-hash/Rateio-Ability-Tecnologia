import React, { useEffect, useState } from 'react'
import { Card, CardTitle, Btn } from '../components/UI'
import { exportarModeloAbility } from '../lib/excel'
import { brl } from '../lib/utils'
import { useFirestore } from '../hooks/useFirestore'
import type { RateioSalvo } from '../types'

interface Props {
  refresh: number
  onReabrir: (r: RateioSalvo) => void
}

export default function Historico({ refresh, onReabrir }: Props) {
  const [lista,    setLista]    = useState<RateioSalvo[]>([])
  const [filtro,   setFiltro]   = useState('')
  const { listar, excluir, loading } = useFirestore()

  useEffect(() => {
    listar().then(setLista)
  }, [refresh, listar])

  const filtrada = filtro ? lista.filter(h => h.mes === filtro) : lista

  const handleExcluir = async (id: string) => {
    if (!confirm('Excluir este rateio do histórico?')) return
    const ok = await excluir(id)
    if (ok) setLista(l => l.filter(h => h.id !== id))
  }

  return (
    <Card>
      <CardTitle>Histórico de rateios salvos</CardTitle>
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <input type="month" value={filtro} onChange={e => setFiltro(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ability-red" />
        <Btn variant="ghost" size="sm" onClick={() => setFiltro('')}>Limpar filtro</Btn>
        <Btn variant="ghost" size="sm" onClick={() => listar().then(setLista)} className="ml-auto">🔄 Atualizar</Btn>
      </div>

      {loading && <div className="text-center text-gray-400 py-8 text-sm">⏳ Carregando...</div>}

      {!loading && !filtrada.length && (
        <div className="text-center text-gray-300 py-12">
          <div className="text-4xl mb-2">📅</div>
          <p className="text-sm">Nenhum rateio salvo ainda.</p>
          <p className="text-xs text-gray-400 mt-1">Calcule e salve na aba Gerenciar Rateio.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtrada.map(h => (
          <div key={h.id} className="flex justify-between items-center border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-colors flex-wrap gap-3">
            <div>
              <div className="font-bold text-sm">{h.desc}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {h.mes || '—'} · {h.totalColabs || 0} colaboradores · {h.linhas?.length || 0} centros ·{' '}
                salvo em {h.criadoEm instanceof Date ? h.criadoEm.toLocaleDateString('pt-BR') : '—'}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-lg font-black text-ability-red">{brl(h.totalValor || 0)}</span>
              <div className="flex gap-2">
                <Btn variant="ghost" size="sm" onClick={() => onReabrir(h)}>↩ Reabrir</Btn>
                <Btn variant="navy" size="sm" onClick={() => exportarModeloAbility(
                  (h.linhas||[]).map(r => ({ dept: r.dept, nome: r.nome, valor: r.valorCC })),
                  h.desc, h.mes
                )}>📥 Modelo</Btn>
                <button onClick={() => handleExcluir(h.id)} className="border border-gray-200 text-gray-400 hover:text-ability-red hover:border-ability-red rounded-lg px-2.5 py-1.5 text-xs transition-colors">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
