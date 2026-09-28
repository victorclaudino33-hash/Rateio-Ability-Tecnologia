import React, { useState, useEffect } from 'react'
import { Btn, Card, CardTitle, StatBox, TableWrap, Thead, Th, Td, Tfoot, Tfd, BadgeCod, BadgeSit, Drawer } from '../components/UI'
import { exportarModeloAbility, exportarCSVGenerico } from '../lib/excel'
import { verificarRateio, brl, getMesAtual } from '../lib/utils'
import { useFirestore } from '../hooks/useFirestore'
import type { Colaborador, CentroCusto, CentroGerenciar, LinhaRateio } from '../types'

interface Props {
  colabs: Colaborador[]
  centros: CentroCusto[]
  onSaved: () => void
}

export default function Gerenciar({ colabs, centros, onSaved }: Props) {
  const [desc,        setDesc]        = useState('')
  const [valorTotal,  setValorTotal]  = useState('')
  const [mes,         setMes]         = useState(getMesAtual)
  const [gerCentros,  setGerCentros]  = useState<CentroGerenciar[]>([])
  const [resultados,  setResultados]  = useState<LinhaRateio[]>([])
  const [verif,       setVerif]       = useState<{erros:string[];avisos:string[];infos:string[]} | null>(null)
  const [drawer,      setDrawer]      = useState<LinhaRateio | null>(null)
  const [drawerQ,     setDrawerQ]     = useState('')
  const [toast,       setToast]       = useState('')
  const { salvar } = useFirestore()

  // Sincroniza quando chegam novos centros
  useEffect(() => {
    if (!centros.length) return
    const tq = centros.reduce((s,c) => s+c.qtd, 0)
    setGerCentros(centros.map(c => ({
      ...c, ativo: true,
      pct: tq > 0 ? parseFloat((c.qtd/tq*100).toFixed(4)) : 0,
    })))
  }, [centros])

  const totalPct = gerCentros.filter(r=>r.ativo).reduce((s,r)=>s+r.pct, 0)

  const toggleAtivo = (i: number, v: boolean) => {
    const next = [...gerCentros]; next[i].ativo = v; setGerCentros(next); recalcProp(next)
  }
  const editPct = (i: number, v: string) => {
    const next = [...gerCentros]; next[i].pct = parseFloat(v)||0; setGerCentros([...next])
  }
  const todos = (v: boolean) => { const next = gerCentros.map(r=>({...r,ativo:v})); setGerCentros(next); recalcProp(next) }
  const igualar = () => {
    const at = gerCentros.filter(r=>r.ativo).length; if(!at) return
    const p = parseFloat((100/at).toFixed(4))
    setGerCentros(gerCentros.map(r => r.ativo ? {...r,pct:p} : r))
  }
  const recalcProp = (list: CentroGerenciar[]) => {
    const at = list.filter(r=>r.ativo), tq = at.reduce((s,r)=>s+r.qtd,0)
    setGerCentros(list.map(r => r.ativo ? {...r, pct: tq>0?parseFloat((r.qtd/tq*100).toFixed(4)):0} : {...r,pct:0}))
  }
  const proporcional = () => recalcProp(gerCentros)

  const calcular = () => {
    const vt = parseFloat(valorTotal)||0
    const ativos = gerCentros.filter(r=>r.ativo)
    const v = verificarRateio(ativos, vt, colabs)
    setVerif(v)
    if (v.erros.length) return
    if (v.avisos.length && !confirm(`${v.avisos.length} aviso(s):\n\n${v.avisos.join('\n')}\n\nContinuar?`)) return
    const linhas: LinhaRateio[] = ativos.map(r => {
      const vCC = parseFloat((vt*(r.pct/100)).toFixed(2))
      return { dept:r.dept, nome:r.nome, qtd:r.qtd, pct:r.pct, valorCC:vCC, valorColab:r.qtd>0?parseFloat((vCC/r.qtd).toFixed(2)):0 }
    })
    setResultados(linhas)
    setTimeout(() => document.getElementById('ger-resultado')?.scrollIntoView({behavior:'smooth',block:'start'}), 100)
  }

  const handleSalvar = async () => {
    const ok = await salvar({ desc: desc||'Rateio sem nome', mes, valorTotal: parseFloat(valorTotal)||0, linhas: resultados })
    setToast(ok ? '✔ Salvo no histórico!' : '✖ Erro ao salvar.')
    if (ok) { onSaved(); setTimeout(() => setToast(''), 3000) }
  }

  const drawerCC = drawer ? centros.find(c=>c.dept===drawer.dept) : null
  const drawerColabs = (drawerCC?.colabs ?? []).filter(c =>
    (c.colab||'').toLowerCase().includes(drawerQ.toLowerCase()) || (c.re||'').toLowerCase().includes(drawerQ.toLowerCase())
  )

  const pctColor = Math.abs(totalPct-100)<0.05 ? 'text-green-700' : totalPct>100 ? 'text-ability-red' : 'text-amber-600'

  return (
    <div>
      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-xl border-l-4 border-l-green-500 shadow-xl z-50">{toast}</div>}

      {/* IDENTIFICAÇÃO */}
      <Card>
        <CardTitle>1. Identificação</CardTitle>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Descrição</span>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Ex: Exames Ocupacionais — Ago/2025" className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ability-red" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Valor total (R$)</span>
            <input type="number" value={valorTotal} onChange={e=>setValorTotal(e.target.value)} placeholder="0,00" className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40 focus:outline-none focus:border-ability-red" />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Mês</span>
            <input type="month" value={mes} onChange={e=>setMes(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ability-red" />
          </label>
        </div>
      </Card>

      {/* CENTROS */}
      <Card>
        <CardTitle>2. Centros de custo</CardTitle>
        {!gerCentros.length ? (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm">
            ⚠️ Carregue e calcule a planilha na aba <strong>Upload</strong> primeiro.
          </div>
        ) : (
          <>
            {/* ações */}
            <div className="flex flex-wrap gap-2 mb-3 items-center">
              <Btn variant="ghost" size="sm" onClick={() => todos(true)}>✔ Todos</Btn>
              <Btn variant="ghost" size="sm" onClick={() => todos(false)}>✕ Nenhum</Btn>
              <Btn variant="ghost" size="sm" onClick={igualar}>= Igualar %</Btn>
              <Btn variant="ghost" size="sm" onClick={proporcional}>⚖️ Proporcional</Btn>
              <span className={`ml-auto text-sm font-black ${pctColor}`}>Total: {totalPct.toFixed(2)}%</span>
            </div>

            {/* barra */}
            <div className="h-1.5 bg-gray-100 rounded-full mb-3">
              <div
                className={`h-1.5 rounded-full transition-all ${Math.abs(totalPct-100)<0.05?'bg-green-500':totalPct>100?'bg-ability-red':'bg-amber-400'}`}
                style={{ width: `${Math.min(totalPct,100)}%` }}
              />
            </div>

            {/* alerta */}
            {Math.abs(totalPct-100)>=0.05 && (
              <div className={`text-xs font-semibold px-3 py-2 rounded-lg mb-3 ${totalPct>100?'bg-red-50 text-ability-red border border-red-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                {totalPct>100 ? `⚠ Ultrapassa 100% em ${(totalPct-100).toFixed(2)}%` : `⚠ Faltam ${(100-totalPct).toFixed(2)}% para fechar 100%`}
              </div>
            )}

            {/* cabeçalho */}
            <div className="grid grid-cols-[28px_80px_1fr_80px_80px] gap-2 px-2.5 mb-1">
              {['','Cód.','Nome','Qtd.','%'].map((h,i)=><span key={i} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</span>)}
            </div>

            {/* lista */}
            <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto">
              {gerCentros.map((c, i) => (
                <div key={c.dept} className={`grid grid-cols-[28px_80px_1fr_80px_80px] gap-2 items-center border rounded-lg px-2.5 py-1.5 ${c.ativo?'border-gray-200 bg-white':'border-gray-100 bg-gray-50 opacity-40'}`}>
                  <input type="checkbox" checked={c.ativo} onChange={e=>toggleAtivo(i,e.target.checked)} className="accent-ability-red w-4 h-4" />
                  <span className="font-mono text-[10px] font-bold bg-gray-100 rounded px-1.5 py-0.5 text-center truncate">{c.dept}</span>
                  <div>
                    <div className="text-xs font-semibold truncate">{c.nome||'—'}</div>
                    <div className="h-0.5 bg-gray-100 rounded mt-1">
                      <div className="h-0.5 bg-ability-red rounded" style={{width:`${Math.min(c.pct,100)}%`}} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 text-center">{c.qtd.toLocaleString('pt-BR')}</span>
                  <input
                    type="number" value={c.pct.toFixed(2)} min="0" max="100" step="0.01"
                    disabled={!c.ativo}
                    onChange={e=>editPct(i,e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-xs font-bold text-right text-ability-navy w-full focus:outline-none focus:border-ability-red disabled:bg-gray-100 disabled:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* VERIFICAÇÕES */}
      {verif && (
        <div className={`p-4 rounded-xl mb-4 border ${verif.erros.length?'bg-red-50 border-red-200':verif.avisos.length?'bg-amber-50 border-amber-200':'bg-green-50 border-green-200'}`}>
          {[...verif.erros.map(e=>({t:e,c:'text-ability-red'})),...verif.avisos.map(a=>({t:a,c:'text-amber-700'})),...verif.infos.map(i=>({t:i,c:'text-green-700'}))].map((v,i)=>(
            <div key={i} className={`text-xs py-1 border-b border-black/5 last:border-0 ${v.c}`}>{v.t}</div>
          ))}
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Btn onClick={calcular} className="px-8 py-3">🎛️ Verificar e calcular</Btn>
      </div>

      {/* RESULTADO */}
      {resultados.length > 0 && (
        <div id="ger-resultado">
          <div className="flex flex-wrap gap-3 mb-4">
            <StatBox value={String(resultados.length)} label="Centros" />
            <StatBox value={resultados.reduce((s,r)=>s+r.qtd,0).toLocaleString('pt-BR')} label="Colaboradores" />
            <StatBox value={brl(parseFloat(valorTotal)||0)} label="Total rateado" color="text-ability-red" />
            <StatBox value={brl(resultados.reduce((s,r)=>s+r.valorCC,0))} label="Distribuído" color="text-green-700" />
          </div>
          <Card className="!p-5">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
              <div className="font-black text-sm">{desc || 'Rateio'}{mes ? ` — ${mes}` : ''}</div>
              <div className="flex gap-2 flex-wrap">
                <Btn variant="navy" size="sm" onClick={()=>exportarModeloAbility(resultados.map(r=>({dept:r.dept,nome:r.nome,valor:r.valorCC})),desc,mes)}>📥 Modelo Ability</Btn>
                <Btn variant="ghost" size="sm" onClick={()=>exportarCSVGenerico([['Cód.','Setor','Qtd.','%','Valor (R$)','R$/Colab'],...resultados.map(r=>[r.dept,r.nome,String(r.qtd),r.pct.toFixed(2),r.valorCC.toFixed(2).replace('.',','),r.valorColab.toFixed(2).replace('.',',')])],`${desc||'rateio'}.csv`)}>⬇ CSV</Btn>
                <Btn variant="green" size="sm" onClick={handleSalvar}>💾 Salvar</Btn>
              </div>
            </div>
            <TableWrap>
              <Thead>
                <Th>Cód.</Th><Th>Nome</Th><Th right>Qtd.</Th><Th right>%</Th><Th right>Valor (R$)</Th><Th right>R$/Colab</Th><Th></Th>
              </Thead>
              <tbody>
                {resultados.map((r,i)=>(
                  <tr key={r.dept} onClick={()=>{setDrawer(r);setDrawerQ('')}} className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${i%2===1?'bg-gray-50/50':''}`}>
                    <Td><BadgeCod cod={r.dept}/></Td>
                    <Td>{r.nome||'—'}</Td>
                    <Td right>{r.qtd.toLocaleString('pt-BR')}</Td>
                    <Td right><strong>{r.pct.toFixed(2)}%</strong></Td>
                    <Td right green>{brl(r.valorCC)}</Td>
                    <Td right><span className="text-gray-400">{brl(r.valorColab)}</span></Td>
                    <td className="px-3 py-2"><button className="bg-gray-900 text-white text-[10px] font-bold px-2.5 py-1 rounded">Ver</button></td>
                  </tr>
                ))}
              </tbody>
              <Tfoot>
                <Tfd>TOTAL GERAL</Tfd><Tfd></Tfd>
                <Tfd right>{resultados.reduce((s,r)=>s+r.qtd,0).toLocaleString('pt-BR')}</Tfd>
                <Tfd right>{resultados.reduce((s,r)=>s+r.pct,0).toFixed(2)}%</Tfd>
                <Tfd right>{brl(resultados.reduce((s,r)=>s+r.valorCC,0))}</Tfd>
                <Tfd></Tfd><Tfd></Tfd>
              </Tfoot>
            </TableWrap>
          </Card>
        </div>
      )}

      {/* DRAWER colaboradores */}
      {drawer && (
        <Drawer open={!!drawer} onClose={()=>setDrawer(null)} title={`${drawer.dept} — ${drawer.nome||'Setor'}`} subtitle="Detalhe por colaborador">
          <div className="flex gap-3 mb-4 flex-wrap">
            <StatBox value={String(drawer.qtd)} label="Colaboradores" />
            <StatBox value={brl(drawer.valorCC)} label="Total centro" color="text-ability-red" />
            <StatBox value={brl(drawer.valorColab)} label="Por colaborador" color="text-green-700" />
          </div>
          <input type="text" placeholder="Filtrar..." value={drawerQ} onChange={e=>setDrawerQ(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs mb-3 focus:outline-none" />
          <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
            {drawerColabs.length ? drawerColabs.map((c,i)=>(
              <div key={i} className="flex justify-between items-center border border-gray-100 rounded-lg px-3 py-2.5">
                <div>
                  <div className="font-bold text-sm">{c.colab||'—'}</div>
                  <div className="text-[11px] text-gray-400">{c.re?`Mat. ${c.re} · `:''}{c.cargo} <BadgeSit sit={c.sit}/></div>
                </div>
                <span className="font-black text-green-700 text-sm">{brl(drawer.valorColab)}</span>
              </div>
            )) : <div className="text-center text-gray-300 py-6 text-sm">Nenhum colaborador encontrado.</div>}
          </div>
        </Drawer>
      )}
    </div>
  )
}
