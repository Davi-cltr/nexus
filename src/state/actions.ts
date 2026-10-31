// Ações do Nexus: tudo o que o visitante faz passa por aqui
// (estado da interface + câmera do universo + som).
import { store, type Aba, type Percurso, type State } from './store'
import type { Dest, FlightInfo, Universe } from '@/engine/Universe'
import {
  ANO_MAX,
  ANO_MIN,
  ARESTAS,
  BY_ID,
  GAL_BY_ID,
  anoParaPos,
  buscar,
  caminho as acharCaminho,
  posParaAno,
  sentido,
} from '@/data/graph'
import { IDEIAS, VIAGENS, type GalaxiaId } from '@/data/ideias'
import { som } from '@/lib/audio'

let engine: Universe | null = null
export const setEngine = (u: Universe | null) => {
  engine = u
}
export const getEngine = () => engine

// ——— avisos e leitor de tela

let avisoN = 0
export function avisar(texto: string) {
  store.set({ aviso: { texto, n: ++avisoN } })
}
function anunciar(texto: string) {
  // datas como "a.C." já terminam em ponto
  store.set({ fala: texto.replace(/\.\./g, '.') })
}

// ——— endereço (#id) para compartilhar

function escreverHash(h: string | null) {
  try {
    history.replaceState(null, '', h ? `#${h}` : location.pathname + location.search)
  } catch {
    /* alguns ambientes não permitem mudar o endereço */
  }
}

export function lerHash() {
  const h = decodeURIComponent(location.hash.slice(1))
  if (!h) return false
  if (BY_ID.has(h)) {
    selecionar(h, 'link')
    return true
  }
  if (h.startsWith('g-') && GAL_BY_ID.has(h.slice(2) as GalaxiaId)) {
    abrirGalaxia(h.slice(2) as GalaxiaId)
    return true
  }
  return false
}

// ——— painéis que ocupam espaço na tela (a câmera centraliza na área livre)

type Lados = { top?: number; right?: number; bottom?: number; left?: number }
const insets = new Map<string, Lados>()
export function registrarEspaco(chave: string, lados: Lados | null) {
  if (lados) insets.set(chave, lados)
  else insets.delete(chave)
  const t: Required<Lados> = { top: 0, right: 0, bottom: 0, left: 0 }
  insets.forEach((v) => {
    t.top = Math.max(t.top, v.top ?? 0)
    t.right = Math.max(t.right, v.right ?? 0)
    t.bottom = Math.max(t.bottom, v.bottom ?? 0)
    t.left = Math.max(t.left, v.left ?? 0)
  })
  engine?.setInsets(t)
  const root = document.documentElement.style
  root.setProperty('--pr', `${t.right}px`)
  root.setProperty('--pl', `${t.left}px`)
}

// ——— voos de câmera com legenda de cinema

let tokenLegenda = -1
interface Legenda {
  titulo: string
  sub: string
  cor: string
}

function voar(dest: Dest, legenda?: Legenda, opts: { sempre?: boolean; duration?: number } = {}) {
  if (!engine) return null
  const r = engine.flyTo(dest, { duration: opts.duration })
  const longe = r.distance > 45 || dest.kind === 'galaxy' || dest.kind === 'overview' || opts.sempre
  if (legenda && longe && !store.get().reduzido && r.duration > 0.6) {
    tokenLegenda = r.token
    store.set({ voo: legenda })
  }
  som.voo(r.duration)
  return r
}

export function aoVoar(info: FlightInfo) {
  if (info.phase === 'start') {
    store.set({ emVoo: true })
    return
  }
  store.set({ emVoo: false })
  if (info.token === tokenLegenda) {
    const t = info.token
    setTimeout(() => {
      if (tokenLegenda === t) store.set({ voo: null })
    }, info.phase === 'end' ? 650 : 0)
  }
  if (info.phase === 'end') chegou(info)
}

function chegou(info: FlightInfo) {
  const p = store.get().percurso
  if (p && info.dest.kind === 'node' && info.dest.id === p.ids[p.passo]) {
    som.sino()
    agendarProximo()
  }
}

// ——— seleção

type Origem = 'clique' | 'busca' | 'lista' | 'link' | 'chip' | 'teclado'

export function selecionar(id: string | null, origem: Origem = 'clique') {
  const s = store.get()
  if (!id) {
    store.set({ selecionada: null })
    escreverHash(null)
    return
  }
  const idea = BY_ID.get(id)
  if (!idea) return
  const patch: Partial<State> = { selecionada: id, galaxiaAberta: null, previa: null, sobre: null }
  if (idea.ano > s.ano) {
    patch.ano = ANO_MAX
    patch.tocando = false
    avisar('A linha do tempo voltou para hoje para mostrar esta ideia.')
  }
  if (s.percurso) encerrarPercurso()
  if (s.caminho && !s.caminho.includes(id)) patch.caminho = null
  if (s.painel !== 'nenhum') patch.painel = 'nenhum'
  store.set(patch)
  escreverHash(id)
  const g = GAL_BY_ID.get(idea.g)!
  voar({ kind: 'node', id }, { titulo: idea.t, sub: `${idea.quando}, ${g.titulo}`, cor: g.cor })
  som.escolher()
  anunciar(`${idea.t}, ${idea.quando}. ${g.titulo}. ${idea.txt}`)
  if (origem === 'clique' && store.get().dica) store.set({ dica: 0 })
}

/** ideia anterior ou seguinte na mesma galáxia, em ordem de data */
export function vizinhaNaGalaxia(id: string, delta: number) {
  const idea = BY_ID.get(id)!
  const lista = IDEIAS.filter((i) => i.g === idea.g && i.ano <= store.get().ano).sort((a, b) => a.ano - b.ano || a.id.localeCompare(b.id))
  const k = lista.findIndex((i) => i.id === id)
  const alvo = lista[(k + delta + lista.length) % lista.length]
  return alvo?.id ?? null
}

export function abrirGalaxia(id: GalaxiaId) {
  const s = store.get()
  const g = GAL_BY_ID.get(id)!
  if (s.percurso) encerrarPercurso()
  store.set({ galaxiaAberta: id, selecionada: null, previa: null, painel: 'nenhum', caminho: null })
  escreverHash(`g-${id}`)
  voar({ kind: 'galaxy', id }, { titulo: g.titulo, sub: g.frase, cor: g.cor })
  anunciar(`${g.titulo}. ${g.frase}`)
}

export function fecharGalaxia() {
  store.set({ galaxiaAberta: null })
  escreverHash(null)
}

export function visaoGeral() {
  if (store.get().percurso) encerrarPercurso()
  store.set({ selecionada: null, galaxiaAberta: null, previa: null, painel: 'nenhum' })
  escreverHash(null)
  voar({ kind: 'overview' }, { titulo: 'O universo das ideias', sub: `${IDEIAS.length} ideias e ${ARESTAS.length} conexões`, cor: '#c9d0ff' })
  anunciar('Visão geral do universo.')
}

export function previa(id: GalaxiaId | null) {
  store.set({ previa: id })
}

// ——— painéis

export function abrirPainel(p: State['painel']) {
  store.set((s) => ({ painel: s.painel === p ? 'nenhum' : p }))
}

export function abrirBusca(aba: Aba = 'buscar') {
  store.set({ painel: 'busca', aba })
}

export function fecharPainel() {
  store.set({ painel: 'nenhum' })
}

export function trocarAba(aba: Aba) {
  store.set({ aba })
}

// ——— busca

let timerBusca = 0
let ultimoEnquadre = ''
export function digitar(q: string) {
  const r = buscar(q, 8)
  const ids = r.map((x) => x.id)
  const atual = store.get().acertos
  const igual = atual.length === ids.length && atual.every((v, i) => v === ids[i])
  store.set({ consulta: q, acertos: igual ? atual : ids })
  if (q.trim()) anunciar(r.length ? `${r.length} resultados.` : 'Nenhum resultado.')
  // depois de uma pausa, a câmera enquadra os resultados acesos no universo
  clearTimeout(timerBusca)
  timerBusca = window.setTimeout(() => {
    const s = store.get()
    if (s.painel !== 'busca' || s.aba !== 'buscar' || !s.acertos.length || !s.consulta.trim()) return
    const chave = s.acertos.join(',')
    if (chave === ultimoEnquadre) return
    ultimoEnquadre = chave
    if (s.acertos.some((id) => BY_ID.get(id)!.ano > s.ano)) store.set({ ano: ANO_MAX, tocando: false })
    voar({ kind: 'fit', ids: s.acertos })
  }, 700)
}

// ——— conectar duas ideias

export function definirPonta(qual: 'de' | 'ate', id: string | null) {
  store.set(qual === 'de' ? { de: id } : { ate: id })
  calcularCaminho()
}

/** liga duas ideias de uma vez (exemplos prontos) */
export function conectar(de: string, ate: string) {
  store.set({ de, ate, painel: 'busca', aba: 'conectar' })
  calcularCaminho()
}

export function trocarPontas() {
  const { de, ate } = store.get()
  store.set({ de: ate, ate: de })
  calcularCaminho()
}

export function limparConexao() {
  store.set({ de: null, ate: null, caminho: null })
}

export function conectarCom(id: string) {
  store.set({ de: id, ate: null, caminho: null, painel: 'busca', aba: 'conectar' })
}

function calcularCaminho() {
  const { de, ate, ano } = store.get()
  if (!de || !ate || de === ate) {
    store.set({ caminho: null })
    return
  }
  const c = acharCaminho(de, ate)
  if (!c) {
    store.set({ caminho: null })
    avisar('Não encontrei uma ligação entre essas duas ideias.')
    return
  }
  const patch: Partial<State> = { caminho: c, selecionada: null, galaxiaAberta: null }
  if (c.some((id) => BY_ID.get(id)!.ano > ano)) {
    patch.ano = ANO_MAX
    patch.tocando = false
  }
  store.set(patch)
  const A = BY_ID.get(de)!
  const B = BY_ID.get(ate)!
  voar({ kind: 'fit', ids: c }, { titulo: `De ${A.t} a ${B.t}`, sub: `${c.length} ideias, ${c.length - 1} conexões`, cor: '#c9d0ff' }, { sempre: true })
  anunciar(`Caminho de ${A.t} a ${B.t}: ${c.map((id) => BY_ID.get(id)!.t).join(', ')}.`)
}

// ——— viagens guiadas e passeio por um caminho

let timerPasso = 0

export function iniciarViagem(id: string) {
  const v = VIAGENS.find((x) => x.id === id)
  if (!v) return
  const p: Percurso = {
    tipo: 'viagem',
    titulo: v.titulo,
    ids: v.passos.map((x) => x.id),
    textos: v.passos.map((x) => x.texto),
    passo: 0,
    auto: true,
    marca: Date.now(),
    espera: 0,
  }
  store.set({ percurso: p, selecionada: null, galaxiaAberta: null, caminho: null, painel: 'nenhum', ano: ANO_MAX, tocando: false, acertos: [] })
  irParaPasso(0)
}

export function percorrerCaminho() {
  const c = store.get().caminho
  if (!c || c.length < 2) return
  const textos = c.map((id, k) => {
    const cur = BY_ID.get(id)!
    if (k === 0) return `O ponto de partida. ${cur.txt}`
    const prev = BY_ID.get(c[k - 1])!
    const elo = sentido(prev.id, cur.id) === 'levou' ? `${prev.t} levou a ${cur.t}.` : `${cur.t} também está na origem de ${prev.t}.`
    return `${elo} ${cur.txt}`
  })
  const A = BY_ID.get(c[0])!
  const B = BY_ID.get(c[c.length - 1])!
  const p: Percurso = { tipo: 'caminho', titulo: `De ${A.t} a ${B.t}`, ids: c, textos, passo: 0, auto: true, marca: Date.now(), espera: 0 }
  store.set({ percurso: p, selecionada: null, galaxiaAberta: null, painel: 'nenhum', tocando: false })
  irParaPasso(0)
}

function irParaPasso(k: number) {
  const p = store.get().percurso
  if (!p) return
  clearTimeout(timerPasso)
  const n = p.ids.length
  const passo = Math.max(0, Math.min(n - 1, k))
  const id = p.ids[passo]
  const idea = BY_ID.get(id)!
  const g = GAL_BY_ID.get(idea.g)!
  store.set({ percurso: { ...p, passo, marca: Date.now(), espera: 0 } })
  voar({ kind: 'node', id }, { titulo: idea.t, sub: `Passo ${passo + 1} de ${n}, ${idea.quando}`, cor: g.cor }, { sempre: true })
  anunciar(`Passo ${passo + 1} de ${n}: ${idea.t}. ${p.textos?.[passo] ?? ''}`)
}

function agendarProximo() {
  clearTimeout(timerPasso)
  const p = store.get().percurso
  if (!p || !p.auto || p.passo >= p.ids.length - 1) return
  const texto = p.textos?.[p.passo] ?? ''
  const espera = Math.max(4500, texto.length * 50)
  store.set({ percurso: { ...p, marca: Date.now(), espera } })
  timerPasso = window.setTimeout(() => passo(1), espera)
}

export function passo(delta: number) {
  const p = store.get().percurso
  if (!p) return
  const k = p.passo + delta
  if (k < 0 || k >= p.ids.length) return
  irParaPasso(k)
}

export function irPasso(k: number) {
  irParaPasso(k)
}

export function alternarAuto() {
  const p = store.get().percurso
  if (!p) return
  const auto = !p.auto
  store.set({ percurso: { ...p, auto, espera: 0, marca: Date.now() } })
  if (auto) agendarProximo()
  else clearTimeout(timerPasso)
}

export function encerrarPercurso() {
  clearTimeout(timerPasso)
  store.set({ percurso: null })
}

// ——— linha do tempo

// a reprodução passa mais tempo onde há mais ideias (a era moderna é densa)
const TABELA = (() => {
  const S = 512
  const pos = IDEIAS.map((i) => anoParaPos(i.ano)).sort((a, b) => a - b)
  const out = new Float32Array(S + 1)
  let j = 0
  for (let k = 0; k <= S; k++) {
    const x = k / S
    while (j < pos.length && pos[j] <= x) j++
    out[k] = 0.3 * x + 0.7 * (j / pos.length)
  }
  return out
})()
function posNoTempo(t: number) {
  // inverso da tabela por busca binária
  let lo = 0
  let hi = TABELA.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (TABELA[mid] < t) lo = mid
    else hi = mid
  }
  const a = TABELA[lo]
  const b = TABELA[hi]
  const f = b > a ? (t - a) / (b - a) : 0
  return (lo + f) / (TABELA.length - 1)
}
function tempoNaPos(p: number) {
  const x = Math.max(0, Math.min(1, p)) * (TABELA.length - 1)
  const k = Math.min(TABELA.length - 2, Math.floor(x))
  return TABELA[k] + (TABELA[k + 1] - TABELA[k]) * (x - k)
}

let rafAno = 0
export function definirAno(ano: number, deUsuario = true) {
  const a = Math.max(ANO_MIN, Math.min(ANO_MAX, Math.round(ano)))
  if (deUsuario && store.get().tocando) parar()
  const s = store.get()
  const patch: Partial<State> = { ano: a }
  // a ideia aberta some se ainda não existia
  if (s.selecionada && BY_ID.get(s.selecionada)!.ano > a) patch.selecionada = null
  store.set(patch)
}

function parar() {
  cancelAnimationFrame(rafAno)
  store.set({ tocando: false })
}

export function alternarTocar() {
  const s = store.get()
  if (s.tocando) {
    parar()
    return
  }
  let p0 = anoParaPos(s.ano)
  if (p0 >= 0.999) p0 = 0
  if (s.percurso) encerrarPercurso()
  store.set({ tocando: true, selecionada: null, galaxiaAberta: null, caminho: null, painel: 'nenhum', ano: posParaAno(p0) })
  const r = engine?.cam.radius ?? 0
  if (r < 300) voar({ kind: 'overview' })
  const DUR = 36000
  const t0 = tempoNaPos(p0)
  const inicio = performance.now() - t0 * DUR
  let anterior = store.get().ano
  const passoAno = (agora: number) => {
    if (!store.get().tocando) return
    const t = Math.min(1, (agora - inicio) / DUR)
    const ano = t >= 1 ? ANO_MAX : posParaAno(posNoTempo(t))
    if (ano !== anterior) {
      const nascidas = IDEIAS.filter((i) => i.ano > anterior && i.ano <= ano).length
      for (let k = 0; k < Math.min(nascidas, 3); k++) som.nascer()
      anterior = ano
      definirAno(ano, false)
    }
    if (t < 1) rafAno = requestAnimationFrame(passoAno)
    else {
      store.set({ tocando: false })
      anunciar('Linha do tempo completa: 2026.')
    }
  }
  rafAno = requestAnimationFrame(passoAno)
  anunciar('Reproduzindo a linha do tempo.')
}

// ——— som e entrada

export function alternarSom() {
  const on = !store.get().som
  const ok = som.alternar(on)
  store.set({ som: on && ok })
  if (on && ok) som.regiaoAtual(store.get().galaxiaAtiva)
}

export function entrar(comSom: boolean) {
  if (store.get().entrada !== 'abertura') return
  if (comSom) {
    const ok = som.alternar(true)
    store.set({ som: ok })
  }
  store.set({ entrada: 'entrando' })
  engine?.setInsets({})
  const r = engine?.introDive()
  if (r) som.voo(r.duration)
  const ms = (r?.duration ?? 0) * 1000
  window.setTimeout(
    () => {
      store.set({ entrada: 'dentro', dica: 1 })
      if (!lerHash()) anunciar('Você está no universo das ideias. Use a busca ou a lista para explorar.')
    },
    Math.max(200, ms * 0.8),
  )
}

export function avancarDica() {
  const d = store.get().dica
  if (d === 1) store.set({ dica: 2 })
  else if (d === 2) store.set({ dica: 0 })
}

export async function copiarLink() {
  try {
    await navigator.clipboard.writeText(location.href)
    avisar('Link copiado.')
  } catch {
    avisar('Não consegui copiar. O endereço da página já aponta para esta ideia.')
  }
}
