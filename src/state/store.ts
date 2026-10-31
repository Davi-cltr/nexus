import { useSyncExternalStore } from 'react'
import type { GalaxiaId } from '@/data/ideias'

export type Painel = 'nenhum' | 'busca' | 'viagens' | 'lista' | 'menu'
export type Aba = 'buscar' | 'conectar'

export interface Percurso {
  tipo: 'viagem' | 'caminho'
  titulo: string
  ids: string[]
  textos?: string[]
  passo: number
  auto: boolean
  /** muda a cada passo: reinicia a barra de progresso do avanço automático */
  marca: number
  /** quanto tempo (ms) até o próximo passo automático; 0 enquanto a câmera voa */
  espera: number
}

export interface Voo {
  titulo: string
  sub: string
  cor: string
}

export interface State {
  entrada: 'abertura' | 'entrando' | 'dentro'
  som: boolean
  selecionada: string | null
  sobre: string | null
  galaxiaAberta: GalaxiaId | null
  galaxiaAtiva: GalaxiaId | null
  previa: GalaxiaId | null
  consulta: string
  acertos: string[]
  aba: Aba
  de: string | null
  ate: string | null
  caminho: string[] | null
  ano: number
  tocando: boolean
  voo: Voo | null
  emVoo: boolean
  percurso: Percurso | null
  painel: Painel
  dica: 0 | 1 | 2
  movel: boolean
  reduzido: boolean
  semWebgl: boolean
  aviso: { texto: string; n: number } | null
  /** texto lido por leitores de tela (região ao vivo) */
  fala: string
}

type Listener = () => void

function createStore<T extends object>(initial: T) {
  let state = initial
  const listeners = new Set<Listener>()
  return {
    get: () => state,
    set(patch: Partial<T> | ((s: T) => Partial<T>)) {
      const p = typeof patch === 'function' ? patch(state) : patch
      let changed = false
      for (const k in p) {
        if (!Object.is(p[k], state[k])) {
          changed = true
          break
        }
      }
      if (!changed) return
      state = { ...state, ...p }
      listeners.forEach((l) => l())
    },
    subscribe(l: Listener) {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
  }
}

const mq = (q: string) => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false)

export const store = createStore<State>({
  entrada: 'abertura',
  som: false,
  selecionada: null,
  sobre: null,
  galaxiaAberta: null,
  galaxiaAtiva: null,
  previa: null,
  consulta: '',
  acertos: [],
  aba: 'buscar',
  de: null,
  ate: null,
  caminho: null,
  ano: 2026,
  tocando: false,
  voo: null,
  emVoo: false,
  percurso: null,
  painel: 'nenhum',
  dica: 0,
  movel: mq('(max-width: 767px), (pointer: coarse) and (max-width: 1024px)'),
  reduzido: mq('(prefers-reduced-motion: reduce)'),
  semWebgl: false,
  aviso: null,
  fala: '',
})

/** o seletor deve devolver um valor guardado no estado (ou um primitivo), nunca um objeto novo */
export function useStore<R>(sel: (s: State) => R): R {
  return useSyncExternalStore(store.subscribe, () => sel(store.get()), () => sel(store.get()))
}
