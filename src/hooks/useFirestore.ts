import { useState, useCallback } from 'react'
import {
  collection, doc, setDoc, getDocs, deleteDoc,
  query, orderBy, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { RateioSalvo, LinhaRateio } from '../types'

export function useFirestore() {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)

  const salvar = useCallback(async (payload: {
    desc: string; mes: string; valorTotal: number
    linhas: LinhaRateio[]
  }): Promise<boolean> => {
    setLoading(true)
    try {
      const id = `${payload.mes}_${Date.now()}`
      await setDoc(doc(collection(db, 'rateios'), id), {
        ...payload,
        id,
        totalColabs: payload.linhas.reduce((s, r) => s + r.qtd, 0),
        totalValor:  payload.linhas.reduce((s, r) => s + r.valorCC, 0),
        criadoEm:    serverTimestamp(),
      })
      setConnected(true)
      return true
    } catch {
      setConnected(false)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const listar = useCallback(async (): Promise<RateioSalvo[]> => {
    setLoading(true)
    try {
      const snap = await getDocs(query(collection(db, 'rateios'), orderBy('criadoEm', 'desc')))
      setConnected(true)
      return snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          criadoEm: data.criadoEm instanceof Timestamp
            ? data.criadoEm.toDate()
            : new Date(),
        } as RateioSalvo
      })
    } catch {
      setConnected(false)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const excluir = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(collection(db, 'rateios'), id))
      return true
    } catch {
      return false
    }
  }, [])

  return { salvar, listar, excluir, loading, connected }
}
