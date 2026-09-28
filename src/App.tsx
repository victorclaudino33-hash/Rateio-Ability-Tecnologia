import React, { useState, useCallback } from 'react'
import Upload    from './pages/Upload'
import Gerenciar from './pages/Gerenciar'
import Historico from './pages/Historico'
import Busca     from './pages/Busca'
import type { Colaborador, CentroCusto, RateioSalvo, Tab } from './types'

const TABS: { id: Tab; label: string }[] = [
  { id: 'upload',    label: '📂 Upload' },
  { id: 'ger',       label: '🎛️ Gerenciar Rateio' },
  { id: 'busca',     label: '🔍 Buscar Colaborador' },
  { id: 'historico', label: '📅 Histórico' },
]

export default function App() {
  const [tab,        setTab]        = useState<Tab>('upload')
  const [colabs,     setColabs]     = useState<Colaborador[]>([])
  const [centros,    setCentros]    = useState<CentroCusto[]>([])
  const [histKey,    setHistKey]    = useState(0)
  const [valorUnit]                 = useState(1.28)

  const handleLoaded = useCallback((c: Colaborador[], cts: CentroCusto[]) => {
    setColabs(c)
    setCentros(cts)
  }, [])

  const handleReabrir = (r: RateioSalvo) => {
    // Quando reabre do histórico, vai para aba Gerenciar
    // O componente Gerenciar vai receber os dados via props futuras
    console.log('Reabrir', r)
    setTab('ger')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-ability-dark text-white px-7 py-4 flex items-center gap-4 sticky top-0 z-40 shadow-lg">
        <div className="w-1 h-8 bg-ability-red rounded-full flex-shrink-0" />
        <div>
          <h1 className="text-base font-bold leading-tight">Rateio de Custos</h1>
          <span className="text-xs text-gray-400">Ability — Segurança do Trabalho</span>
        </div>
        {colabs.length > 0 && (
          <div className="ml-auto flex items-center gap-1.5 bg-green-900/40 border border-green-700/40 text-green-400 rounded-full px-3 py-1 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            {colabs.length.toLocaleString('pt-BR')} colaboradores
          </div>
        )}
      </header>

      {/* TABS */}
      <div className="bg-ability-dark border-t border-white/10 overflow-x-auto">
        <div className="flex px-7 min-w-max">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-xs font-semibold border-b-[3px] transition-colors whitespace-nowrap ${
                tab === t.id
                  ? 'text-white border-ability-red'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-4 py-6 pb-16">
        {tab === 'upload'    && <Upload    onLoaded={handleLoaded} />}
        {tab === 'ger'       && <Gerenciar colabs={colabs} centros={centros} onSaved={() => setHistKey(k => k+1)} />}
        {tab === 'busca'     && <Busca     colabs={colabs} valorUnit={valorUnit} />}
        {tab === 'historico' && <Historico refresh={histKey} onReabrir={handleReabrir} />}
      </main>
    </div>
  )
}
