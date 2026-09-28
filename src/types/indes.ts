export interface Colaborador {
  dept: string
  nome: string
  sit: 'A' | 'F' | 'D' | string
  colab: string
  re: string
  cargo: string
}

export interface CentroCusto {
  dept: string
  nome: string
  qtd: number
  colabs: Colaborador[]
  valor?: number
}

export interface CentroGerenciar extends CentroCusto {
  ativo: boolean
  pct: number
  valorCC?: number
  valorColab?: number
}

export interface LinhaRateio {
  dept: string
  nome: string
  qtd: number
  pct: number
  valorCC: number
  valorColab: number
}

export interface RateioSalvo {
  id: string
  desc: string
  mes: string
  valorTotal: number
  totalColabs: number
  totalValor: number
  linhas: LinhaRateio[]
  criadoEm: Date
}

export interface ItemCusto {
  id: string
  desc: string
  valor: number
}

export type Sit = 'A' | 'AF' | 'AFD'
export type Tab = 'upload' | 'ger' | 'prop' | 'busca' | 'manual' | 'historico'
