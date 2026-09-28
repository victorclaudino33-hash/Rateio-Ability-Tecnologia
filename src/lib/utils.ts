export function brl(v: number): string {
  return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function getMesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}

export function verificarRateio(
  ativos: Array<{ pct: number; qtd: number; dept: string }>,
  valorTotal: number,
  colabs: Array<{ re: string }>
) {
  const erros: string[] = []
  const avisos: string[] = []
  const infos:  string[] = []

  const tp = ativos.reduce((s, r) => s + r.pct, 0)
  if (Math.abs(tp - 100) < 0.05) infos.push(`✔ Percentuais = 100% (${tp.toFixed(2)}%)`)
  else if (tp > 100) erros.push(`✖ Percentuais = ${tp.toFixed(2)}% — ultrapassam 100% em ${(tp-100).toFixed(2)}%`)
  else erros.push(`✖ Percentuais = ${tp.toFixed(2)}% — faltam ${(100-tp).toFixed(2)}%`)

  const semAtivos = ativos.filter(r => r.qtd === 0)
  if (semAtivos.length) avisos.push(`⚠ ${semAtivos.length} centro(s) sem colaboradores: ${semAtivos.map(r=>r.dept).join(', ')}`)
  else infos.push('✔ Todos os centros têm colaboradores')

  const zerados = ativos.filter(r => r.pct === 0)
  if (zerados.length) avisos.push(`⚠ ${zerados.length} centro(s) com % = 0 (R$ 0,00): ${zerados.map(r=>r.dept).join(', ')}`)
  else infos.push('✔ Nenhum centro zerado')

  if (colabs.length) {
    const reMap: Record<string, number> = {}
    colabs.forEach(c => { if (c.re) reMap[c.re] = (reMap[c.re]||0) + 1 })
    const dups = Object.entries(reMap).filter(([,v]) => v > 1)
    if (dups.length) avisos.push(`⚠ ${dups.length} matrícula(s) duplicada(s): ${dups.slice(0,5).map(([k])=>k).join(', ')}${dups.length>5?'...':''}`)
    else infos.push('✔ Nenhuma matrícula duplicada')
  }

  if (!valorTotal || valorTotal <= 0) erros.push('✖ Valor total não informado')
  else infos.push(`✔ Valor total: ${brl(valorTotal)}`)

  return { erros, avisos, infos }
}
