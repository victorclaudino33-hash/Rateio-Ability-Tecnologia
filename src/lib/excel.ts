import * as XLSX from 'xlsx'
import type { Colaborador, CentroCusto } from '../types'

export function parseXlsx(file: File): Promise<Colaborador[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target!.result, { type: 'array', cellDates: true })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
        if (!json.length) throw new Error('Planilha vazia.')

        const ch  = Object.keys(json[0])
        const cD  = ch.find(k => k.replace(/\s/g, '').toUpperCase().includes('DEPTSETOR') || k.toUpperCase().includes('DEPT'))
        const cN  = ch.find(k => k.toLowerCase().includes('nome_setor') || k.toLowerCase().includes('nome setor'))
        const cS  = ch.find(k => k.trim().toUpperCase() === 'SIT' || k.toLowerCase().includes('situac'))
        const cC  = ch.find(k => k.trim().toUpperCase() === 'NOME')
        const cR  = ch.find(k => k.trim().toUpperCase() === 'RE')
        const cG  = ch.find(k => k.trim().toUpperCase() === 'CARGO')

        if (!cD || !cS) throw new Error('Colunas obrigatórias não encontradas (DEPT SETOR, SIT).')

        const colabs: Colaborador[] = json
          .map(r => ({
            dept:  String(r[cD!] ?? '').trim(),
            nome:  cN ? String(r[cN] ?? '').trim() : '',
            sit:   String(r[cS!] ?? '').trim().toUpperCase(),
            colab: cC ? String(r[cC] ?? '').trim() : '',
            re:    cR ? String(r[cR] ?? '').trim() : '',
            cargo: cG ? String(r[cG] ?? '').trim() : '',
          }))
          .filter(r => r.dept)

        resolve(colabs)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'))
    reader.readAsArrayBuffer(file)
  })
}

/** Agrupa colaboradores por departamento */
export function agruparPorDept(colabs: Colaborador[], sits: string[]): CentroCusto[] {
  const mapa: Record<string, CentroCusto> = {}
  const filtrados = colabs.filter(c => sits.includes(c.sit))

  filtrados.forEach(c => {
    if (!mapa[c.dept]) mapa[c.dept] = { dept: c.dept, nome: c.nome, qtd: 0, colabs: [] }
    mapa[c.dept].qtd++
    mapa[c.dept].colabs.push(c)
    if (!mapa[c.dept].nome && c.nome) mapa[c.dept].nome = c.nome
  })

  return Object.values(mapa).sort(
    (a, b) => Number(a.dept) - Number(b.dept) || a.dept.localeCompare(b.dept)
  )
}

/** Exporta no modelo Ability (RATEIO_MAST) */
export function exportarModeloAbility(
  linhas: Array<{ dept: string; nome: string; valor: number }>,
  desc = 'Rateio',
  mes  = ''
) {
  const COR_H = 'FF0E2841', COR_B = 'FFFFFFFF', COR_C = 'FFF2F2F2'
  const COR_T = 'FF1A1A1A', COR_W = 'FFFFFFFF'

  const hSty = (bold: boolean, sz: number) => ({
    font:  { name: 'Aptos Narrow', bold, sz, color: { rgb: COR_W } },
    fill:  { patternType: 'solid', fgColor: { rgb: COR_H } },
    border: { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} },
    alignment: { horizontal: 'left', vertical: 'center' },
  })
  const dStyA = (alt: boolean) => ({
    font:      { name: 'Arial', sz: 10, color: { rgb: COR_T } },
    fill:      { patternType: 'solid', fgColor: { rgb: alt ? COR_C : COR_B } },
    border:    { top:{style:'thin',color:{rgb:'FFD0D0D0'}}, bottom:{style:'thin',color:{rgb:'FFD0D0D0'}}, left:{style:'thin',color:{rgb:'FFD0D0D0'}}, right:{style:'thin',color:{rgb:'FFD0D0D0'}} },
    alignment: { horizontal: 'center', vertical: 'center' },
    numFmt:    '0',
  })
  const dStyB = (alt: boolean) => ({
    ...dStyA(alt), alignment: { horizontal: 'right', vertical: 'center' }, numFmt: '#,##0.00',
  })
  const tSty = (col: 'A' | 'B') => ({
    font:      { name: 'Aptos Narrow', bold: true, sz: 11, color: { rgb: COR_W } },
    fill:      { patternType: 'solid', fgColor: { rgb: COR_H } },
    border:    { top:{style:'thin'}, bottom:{style:'thin'}, left:{style:'thin'}, right:{style:'thin'} },
    alignment: { horizontal: col === 'A' ? 'left' : 'right', vertical: 'center' },
    numFmt:    col === 'A' ? '@' : '#,##0.00',
  })

  const data: (string | number)[][] = [
    ['RATEIO DE CUSTOS — ABILITY', ''],
    [`${desc}${mes ? ' | ' + mes : ''}`, ''],
    ['Centro de custo', 'Valor'],
    ...linhas.map(r => [Number(r.dept) || r.dept, r.valor]),
    ['TOTAL GERAL', linhas.reduce((s, r) => s + r.valor, 0)],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  ws['!cols']   = [{ wch: 18 }, { wch: 18 }]
  ws['!merges'] = [{ s:{r:0,c:0}, e:{r:0,c:1} }, { s:{r:1,c:0}, e:{r:1,c:1} }]

  const ss = (r: number, c: number, s: unknown) => {
    const addr = XLSX.utils.encode_cell({ r, c })
    if (!ws[addr]) (ws as XLSX.WorkSheet)[addr] = { v: '', t: 's' }
    ;(ws as XLSX.WorkSheet)[addr].s = s
  }

  ss(0,0,hSty(true,12)); ss(0,1,hSty(true,12))
  ss(1,0,hSty(false,10)); ss(1,1,hSty(false,10))
  ss(2,0,hSty(true,11)); ss(2,1,hSty(true,11))

  linhas.forEach((_, i) => {
    ss(3+i, 0, dStyA(i%2===1)); ss(3+i, 1, dStyB(i%2===1))
    const addr = XLSX.utils.encode_cell({ r:3+i, c:1 })
    if ((ws as XLSX.WorkSheet)[addr]) (ws as XLSX.WorkSheet)[addr].t = 'n'
  })

  const tr = 3 + linhas.length
  ss(tr, 0, tSty('A')); ss(tr, 1, tSty('B'))
  const atb = XLSX.utils.encode_cell({ r: tr, c: 1 })
  if ((ws as XLSX.WorkSheet)[atb]) (ws as XLSX.WorkSheet)[atb].t = 'n'

  ws['!rows'] = [{ hpt:16 }, { hpt:12 }, { hpt:14 }, ...linhas.map(() => ({ hpt:13 })), { hpt:14 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  XLSX.writeFile(wb, `${desc.replace(/[^a-zA-Z0-9]/g,'_')}${mes?'_'+mes:''}_MAST.xlsx`, { cellStyles: true })
}

export function exportarCSVGenerico(rows: string[][], filename: string) {
  const blob = new Blob([rows.map(r => r.join(';')).join('\n')], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}
