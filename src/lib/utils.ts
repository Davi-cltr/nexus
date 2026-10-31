import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { BY_ID, GAL_BY_ID } from '@/data/graph'
import type { State } from '@/state/store'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const corDe = (id: string) => GAL_BY_ID.get(BY_ID.get(id)!.g)!.cor

/** cor de destaque da interface: segue o que o visitante está olhando */
export function corDaRegiao(s: State) {
  if (s.selecionada) return corDe(s.selecionada)
  if (s.percurso) return corDe(s.percurso.ids[s.percurso.passo])
  if (s.galaxiaAberta) return GAL_BY_ID.get(s.galaxiaAberta)!.cor
  if (s.galaxiaAtiva) return GAL_BY_ID.get(s.galaxiaAtiva)!.cor
  return '#b9c2ff'
}

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

/** variáveis CSS em style={...} sem brigar com os tipos */
export const vars = (o: Record<string, string | number>) => o as unknown as import('react').CSSProperties
