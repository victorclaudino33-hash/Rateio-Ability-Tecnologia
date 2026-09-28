import React, { useCallback, useState } from 'react'
import { Upload as UploadIcon } from 'lucide-react'
import { Btn, Card, CardTitle, StatBox, TableWrap, Thead, Th, Td, Tfoot, Tfd, BadgeCod, Empty, Drawer, BadgeSit } from '../components/UI'
import { parseXlsx, agruparPorDept, exportarModeloAbility, exportarCSVGenerico } from '../lib/excel'
import type { Colaborador, CentroCusto, Sit } from '../types'
import { brl } from '../lib/utils'

interface Props {
  onLoaded: (colabs: Colaborador[], centros: CentroCusto[]) => void
}

export default function Upload({ onLoaded }: Props) {
  const [colabs,    setColabs]    = useState<Colaborador[]>([])
  const [centros,   setCentros]   = useState<CentroCusto[]>([])
  const [fileName,  setFileName]  = useState('')
  const [error,     setError]     = useState('')
  const [sit,       setSit]       = useState<Sit>('A')
  const [valor,     setValor]     = useState('1.28')
  const [mes,       setMes]       = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` })
  const [busca,     setBusca]     = useState('')
  const [dragging,  setDragging]  = useState(false)
  const [drawer,    setDrawer]    = useState<CentroCusto | null>(null)
  const [drawerQ,   setDrawerQ]   = useState('')

  const SITS: Record<Sit, string[]> = { A: ['A'], AF: ['A','F'], AFD: ['A','F','D'] }

  const processar = useCallback(async (file: File) => {
    setError('')
    try {
      const lista = await parseXlsx(file)
      setColabs(lista)
      setFileName(`${file.name} · ${lista.length} registros`)
      const cts = agruparPorDept(lista, SITS[sit])
      setCentros(cts)
      onLoaded(lista, cts)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao ler o arquivo.')
    }
  }, [sit, onLoaded])

  const calcular = () => {
    const v = parseFloat(valor) || 1.28
    const cts = agruparPorDept(colabs, SITS[sit]).map(c => ({ ...c, valor: c.qtd * v }))
    setCentros(cts)
    onLoaded(colabs, cts)
  }

  const filtrados = centros.filter(c =>
    c.dept.toLowerCase().includes(busca.toLowerCase()) ||
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const tq = filtrados.reduce((s, c) => s + c.qtd, 0)
  const tv = filtrados.reduce((s, c) => s + (c.valor ?? 0), 0)

  return (
    <div>
      {/* UPLOAD */}
      <Card>
        <CardTitle>1. Carregar planilha de colaboradores</CardTitle>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processar(f) }}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-ability-red bg-red-50' : 'border-gray-200 hover:border-ability-red hover:bg-red-50'}`}
        >
          <input id="file-input" type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { if (e.target.files?.[0]) processar(e.target.files[0]) }} />
          <UploadIcon className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-500">Arraste o arquivo ou <strong className="text-ability-red">clique para selecionar</strong></p>
          <p className="text-xs text-gray-400 mt-1">Colunas: DEPT SETOR · Nome_setor · SIT · NOME · RE · CARGO</p>
          {fileName && <div className="mt-3 inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 rounded-full px-3 py-1 text-xs font-bold">✔ {fileName}</div>}
        </div>
        {error && <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">{error}</div>}
      </Card>

      {/* CONFIG */}
      <Card>
        <CardTitle>2. Configurar</CardTitle>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Valor/colaborador (R$)</span>
            <input type="number" value={valor} onChange={e => setValor(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-ability-red" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Situações</span>
            <select value={sit} onChange={e => setSit(e.target.value as Sit)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ability-red">
              <option value="A">Somente Ativos (A)</option>
              <option value="AF">Ativos + Férias (A/F)</option>
              <option value="AFD">Todos (A/F/D)</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mês</span>
            <input type="month" value={mes} onChange={e => setMes(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ability-red" />
          </label>
          <Btn onClick={calcular} disabled={!colabs.length}>Calcular rateio</Btn>
        </div>
      </Card>

      {/* RESULTADO */}
      {centros.length > 0 && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <StatBox value={centros.reduce((s,c)=>s+c.qtd,0).toLocaleString('pt-BR')} label="Colaboradores" />
            <StatBox value={String(centros.length)} label="Centros de custo" />
            <StatBox value={brl(centros.reduce((s,c)=>s+(c.valor??0),0))} label="Total" color="text-ability-red" />
          </div>

          <Card className="!p-5">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <input
                type="text" placeholder="Buscar por código ou nome..."
                value={busca} onChange={e => setBusca(e.target.value)}
                className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-gray-400"
              />
              <Btn variant="ghost" size="sm" onClick={() => { /* exportarExcel */ }}>⬇ Excel</Btn>
              <Btn variant="ghost" size="sm" onClick={() => exportarCSVGenerico([['Cód.','Setor','Qtd.','Valor (R$)'], ...centros.map(c=>[c.dept,c.nome,String(c.qtd),(c.valor??0).toFixed(2).replace('.',',')])], 'rateio.csv')}>⬇ CSV</Btn>
              <Btn variant="navy" size="sm" onClick={() => exportarModeloAbility(centros.map(c=>({dept:c.dept,nome:c.nome,valor:c.valor??0})),`Rateio`,mes)}>📥 Modelo Ability</Btn>
            </div>
            <TableWrap>
              <Thead>
                <Th>Cód.</Th><Th>Nome do Setor</Th><Th right>Qtd.</Th><Th right>Valor (R$)</Th><Th></Th>
              </Thead>
              <tbody>
                {filtrados.length ? filtrados.map((c,i) => (
                  <tr key={c.dept} onClick={() => setDrawer(c)} className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${i%2===1?'bg-gray-50/50':''}`}>
                    <Td><BadgeCod cod={c.dept} /></Td>
                    <Td>{c.nome || '—'}</Td>
                    <Td right>{c.qtd.toLocaleString('pt-BR')}</Td>
                    <Td right green>{brl(c.valor ?? 0)}</Td>
                    <td className="px-3 py-2"><button className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-gray-700">Ver</button></td>
                  </tr>
                )) : <tr><td colSpan={5}><Empty msg="Nenhum resultado." /></td></tr>}
              </tbody>
              <Tfoot>
                <Tfd>TOTAL GERAL</Tfd><Tfd></Tfd>
                <Tfd right>{tq.toLocaleString('pt-BR')}</Tfd>
                <Tfd right>{brl(tv)}</Tfd>
                <Tfd></Tfd>
              </Tfoot>
            </TableWrap>
          </Card>
        </>
      )}

      {/* DRAWER */}
      {drawer && (
        <Drawer open={!!drawer} onClose={() => setDrawer(null)} title={`${drawer.dept} — ${drawer.nome}`} subtitle="Centro de Custo">
          <div className="flex gap-3 mb-4 flex-wrap">
            <StatBox value={String(drawer.qtd)} label="Colaboradores" />
            <StatBox value={brl(drawer.valor ?? 0)} label="Valor rateio" color="text-ability-red" />
          </div>
          <input type="text" placeholder="Filtrar colaboradores..." value={drawerQ} onChange={e => setDrawerQ(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none focus:border-gray-400" />
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {drawer.colabs.filter(c => (c.colab||'').toLowerCase().includes(drawerQ.toLowerCase()) || (c.re||'').toLowerCase().includes(drawerQ.toLowerCase())).map((c, i) => (
              <div key={i} className="flex justify-between items-center border border-gray-100 rounded-lg px-3 py-2.5">
                <div>
                  <div className="font-bold text-sm">{c.colab || '—'}</div>
                  <div className="text-[11px] text-gray-400">{c.re ? `Mat. ${c.re} · ` : ''}{c.cargo}</div>
                </div>
                <BadgeSit sit={c.sit} />
              </div>
            ))}
          </div>
        </Drawer>
      )}
    </div>
  )
}
