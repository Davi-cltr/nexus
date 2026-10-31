import { GALAXIAS, IDEIAS, type Galaxia, type GalaxiaId, type Ideia } from './ideias'

export const N = IDEIAS.length
export const BY_ID = new Map<string, Ideia>(IDEIAS.map((i) => [i.id, i]))
export const INDEX = new Map<string, number>(IDEIAS.map((i, k) => [i.id, k]))
export const GAL_BY_ID = new Map<GalaxiaId, Galaxia>(GALAXIAS.map((g) => [g.id, g]))

export interface Aresta {
  a: string // causa
  b: string // consequência
}
export const ARESTAS: Aresta[] = IDEIAS.flatMap((i) => (i.veio ?? []).map((v) => ({ a: v, b: i.id })))

/** de onde veio (causas) e o que gerou (consequências), ordenados por data */
export const VEIO = new Map<string, string[]>()
export const LEVOU = new Map<string, string[]>()
IDEIAS.forEach((i) => {
  VEIO.set(i.id, [])
  LEVOU.set(i.id, [])
})
ARESTAS.forEach(({ a, b }) => {
  VEIO.get(b)!.push(a)
  LEVOU.get(a)!.push(b)
})
const byYear = (x: string, y: string) => BY_ID.get(x)!.ano - BY_ID.get(y)!.ano
VEIO.forEach((l) => l.sort(byYear))
LEVOU.forEach((l) => l.sort(byYear))

export const VIZINHOS = new Map<string, Set<string>>()
IDEIAS.forEach((i) => VIZINHOS.set(i.id, new Set([...VEIO.get(i.id)!, ...LEVOU.get(i.id)!])))
export const GRAU = new Map<string, number>(IDEIAS.map((i) => [i.id, VIZINHOS.get(i.id)!.size]))

/** índice da aresta para um par (em qualquer ordem) */
export const ARESTA_IDX = new Map<string, number>()
ARESTAS.forEach(({ a, b }, k) => {
  ARESTA_IDX.set(`${a}|${b}`, k)
  ARESTA_IDX.set(`${b}|${a}`, k)
})

// ——— busca

export const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

interface Indexado {
  id: string
  titulo: string
  extras: string
  quem: string
  texto: string
  galaxia: string
  ano: number
}
const IDX: Indexado[] = IDEIAS.map((i) => ({
  id: i.id,
  titulo: normalizar(i.t),
  extras: normalizar((i.alias ?? []).join(' ')),
  quem: normalizar(i.quem),
  texto: normalizar(i.txt),
  galaxia: normalizar(GAL_BY_ID.get(i.g)!.nome),
  ano: i.ano,
}))

export interface Resultado {
  id: string
  motivo: string
}

/** busca por título, apelidos, pessoas, galáxia, ano ou texto */
export function buscar(q: string, limite = 8): Resultado[] {
  const n = normalizar(q)
  if (!n) return []
  const termos = n.split(' ')
  const ano = /^-?\d{3,4}$/.test(n) ? Number(n) : null
  const out: { id: string; score: number; motivo: string }[] = []
  for (const it of IDX) {
    let score = 0
    let motivo = ''
    if (it.titulo === n) score += 120
    if (it.titulo.startsWith(n)) score += 60
    if (it.titulo.split(' ').some((w) => w.startsWith(n))) score += 35
    const temPalavra = (campo: string, t: string) => (t.length <= 3 ? campo.split(' ').some((w) => w.startsWith(t)) : campo.includes(t))
    for (const t of termos) {
      if (t.length < 2) continue
      if (temPalavra(it.titulo, t)) score += 14
      if (temPalavra(it.extras, t)) {
        score += 12
        motivo ||= 'termo relacionado'
      }
      if (temPalavra(it.quem, t)) {
        score += 11
        motivo ||= BY_ID.get(it.id)!.quem
      }
      if (it.galaxia.startsWith(t)) score += 4
      if (t.length >= 4 && it.texto.includes(t)) {
        score += 3
        motivo ||= 'citado na descrição'
      }
    }
    if (ano !== null && Math.abs(it.ano - ano) <= 3) {
      score += 40 - Math.abs(it.ano - ano) * 6
      motivo = BY_ID.get(it.id)!.quando
    }
    if (score > 0) out.push({ id: it.id, score: score + (GRAU.get(it.id) ?? 0) * 0.15, motivo })
  }
  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, limite)
    .map(({ id, motivo }) => ({ id, motivo }))
}

// ——— caminho entre duas ideias
// Prefere cadeias de causa e efeito: seguir uma seta custa 1, andar contra ela custa 3.
// Assim, o caminho conta uma história ("levou a") sempre que ela existe.

function menorCusto(de: string, ate: string): string[] | null {
  const dist = new Map<string, number>([[de, 0]])
  const prev = new Map<string, string>()
  const aberto = new Set<string>([de])
  while (aberto.size) {
    let x = ''
    let dx = Infinity
    for (const k of aberto) {
      const d = dist.get(k)!
      if (d < dx || (d === dx && k < x)) {
        dx = d
        x = k
      }
    }
    aberto.delete(x)
    if (x === ate) break
    for (const y of VIZINHOS.get(x)!) {
      const custo = dx + (LEVOU.get(x)!.includes(y) ? 1 : 3)
      if (custo < (dist.get(y) ?? Infinity)) {
        dist.set(y, custo)
        prev.set(y, x)
        aberto.add(y)
      }
    }
  }
  if (!dist.has(ate)) return null
  const out = [ate]
  let c = ate
  while (c !== de) {
    c = prev.get(c)!
    out.push(c)
  }
  return out.reverse()
}

export function caminho(de: string, ate: string): string[] | null {
  if (de === ate) return [de]
  // percorre sempre do mais antigo para o mais novo, e devolve na ordem pedida
  const A = BY_ID.get(de)!
  const B = BY_ID.get(ate)!
  if (A.ano <= B.ano) return menorCusto(de, ate)
  const p = menorCusto(ate, de)
  return p ? p.reverse() : null
}

/** "levou a" quando a conexão segue a seta; "veio de" quando volta */
export function sentido(a: string, b: string): 'levou' | 'veio' {
  return LEVOU.get(a)!.includes(b) ? 'levou' : 'veio'
}

// ——— linha do tempo em escala logarítmica (a era moderna ganha mais espaço)

export const ANO_MIN = -400000
export const ANO_MAX = 2026
const L = (ano: number) => Math.log10(ANO_MAX + 5 - ano)
const L0 = L(ANO_MIN)
const L1 = L(ANO_MAX)
export const anoParaPos = (ano: number) => (L0 - L(Math.min(ANO_MAX, Math.max(ANO_MIN, ano)))) / (L0 - L1)
export const posParaAno = (p: number) => Math.round(ANO_MAX + 5 - Math.pow(10, L0 - p * (L0 - L1)))

const fmtNum = new Intl.NumberFormat('pt-BR')
export function formatarAno(ano: number) {
  if (ano <= -10000) return `${fmtNum.format(Math.round(-ano / 1000))} mil anos atrás`
  if (ano < 0) return `${fmtNum.format(-ano)} a.C.`
  return String(ano)
}

export const ERAS = [
  { nome: 'Pré-história', ano: ANO_MIN },
  { nome: 'Antiguidade', ano: -3200 },
  { nome: 'Idade Média', ano: 476 },
  { nome: 'Era moderna', ano: 1453 },
  { nome: 'Era industrial', ano: 1760 },
  { nome: 'Era digital', ano: 1946 },
]
