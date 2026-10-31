import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDownUp, Play, Search, Waypoints, X } from 'lucide-react'
import { useStore, type Aba } from '@/state/store'
import {
  conectar,
  definirPonta,
  digitar,
  fecharPainel,
  getEngine,
  limparConexao,
  percorrerCaminho,
  selecionar,
  trocarAba,
  trocarPontas,
} from '@/state/actions'
import { BY_ID, GAL_BY_ID, buscar, formatarAno, sentido, type Resultado } from '@/data/graph'
import { useFoco } from '@/hooks/useFoco'
import { useEspaco } from '@/hooks/useEspaco'
import { cn, plural, vars } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const

const SUGESTOES = ['penicilina', 'Einstein', '1969', 'Brasil', 'eletricidade', 'Ada Lovelace']
const EXEMPLOS: [string, string, string][] = [
  ['escrita', 'internet', 'Da escrita à internet'],
  ['zero', 'ia_generativa', 'Do zero à IA generativa'],
  ['fogo', 'lua', 'Do fogo ao pouso na Lua'],
]

function anoCurto(ano: number) {
  return formatarAno(ano).replace(' anos atrás', '')
}

/** destaca no título o trecho que bate com a busca (ignorando acentos) */
function Realcado({ texto, busca }: { texto: string; busca: string }) {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  const q = norm(busca.trim())
  if (q.length < 2) return <>{texto}</>
  const k = norm(texto).indexOf(q)
  if (k < 0) return <>{texto}</>
  return (
    <>
      {texto.slice(0, k)}
      <mark className="rounded-[3px] bg-[color-mix(in_oklab,var(--acc)_28%,transparent)] px-0.5 text-white">{texto.slice(k, k + q.length)}</mark>
      {texto.slice(k + q.length)}
    </>
  )
}

function Opcao({ r, ativa, busca, id, onEscolher, onPassar }: { r: Resultado; ativa: boolean; busca: string; id: string; onEscolher: () => void; onPassar: () => void }) {
  const i = BY_ID.get(r.id)!
  const g = GAL_BY_ID.get(i.g)!
  const mostrarMotivo = r.motivo && r.motivo !== i.quando
  return (
    <li
      id={id}
      role="option"
      aria-selected={ativa}
      onMouseEnter={onPassar}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onEscolher}
      className={cn('flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors', ativa ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]')}
      style={vars({ '--c': g.cor })}
    >
      <span className="nx-dot" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-white">
          <Realcado texto={i.t} busca={busca} />
        </span>
        <span className="mt-0.5 flex items-center gap-2 text-[12.5px] text-ink-3">
          <span className="truncate">{g.titulo}</span>
          {mostrarMotivo && (
            <span className="truncate rounded-full border border-white/10 px-2 py-px text-[11.5px] text-ink-2">
              {r.motivo === 'citado na descrição' ? 'citado no texto' : r.motivo}
            </span>
          )}
        </span>
      </span>
      <span className="flex-none text-[12.5px] tabular-nums text-ink-3">{anoCurto(i.ano)}</span>
    </li>
  )
}

function AbaBuscar() {
  const consulta = useStore((s) => s.consulta)
  const movel = useStore((s) => s.movel)
  const [ativo, setAtivo] = useState(0)
  const res = useMemo(() => buscar(consulta, 8), [consulta])
  const inputRef = useRef<HTMLInputElement>(null)
  const lista = useId()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  // a opção ativa também acende no universo
  useEffect(() => {
    getEngine()?.hoverExterno(res[ativo]?.id ?? null)
  }, [ativo, res])
  useEffect(() => () => getEngine()?.hoverExterno(null), [])

  const mudar = (q: string) => {
    setAtivo(0)
    digitar(q)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAtivo((a) => Math.min(res.length - 1, a + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setAtivo((a) => Math.max(0, a - 1))
    } else if (e.key === 'Enter' && res[ativo]) {
      e.preventDefault()
      selecionar(res[ativo].id, 'busca')
    } else if (e.key === 'Escape' && consulta) {
      e.stopPropagation()
      mudar('')
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-14 flex-none items-center gap-3 border-b border-line px-4">
        <Search size={18} className="flex-none text-ink-3" aria-hidden="true" />
        <input
          ref={inputRef}
          className="nx-input"
          role="combobox"
          aria-expanded={res.length > 0}
          aria-controls={lista}
          aria-autocomplete="list"
          aria-activedescendant={res[ativo] ? `${lista}-${res[ativo].id}` : undefined}
          aria-label="Buscar ideias por nome, pessoa, ano ou assunto"
          placeholder="Uma ideia, uma pessoa, um ano..."
          value={consulta}
          onChange={(e) => mudar(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {consulta && (
          <button
            type="button"
            className="nx-btn nx-btn-icon h-8 w-8 flex-none"
            aria-label="Limpar a busca"
            onClick={() => {
              mudar('')
              inputRef.current?.focus()
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {consulta.trim() ? (
        res.length ? (
          <>
            <p className="flex-none px-5 pt-3 text-[12px] leading-snug text-ink-3" aria-hidden="true">
              {plural(res.length, 'resultado', 'resultados')}. Eles e suas conexões se acendem no universo.
            </p>
            <ul id={lista} role="listbox" aria-label="Resultados" className="nx-scroll min-h-0 flex-1 p-2">
              {res.map((r, k) => (
                <Opcao
                  key={r.id}
                  id={`${lista}-${r.id}`}
                  r={r}
                  ativa={k === ativo}
                  busca={consulta}
                  onPassar={() => setAtivo(k)}
                  onEscolher={() => selecionar(r.id, 'busca')}
                />
              ))}
            </ul>
          </>
        ) : (
          <p className="px-5 py-6 text-[14px] text-ink-2">
            Nada encontrado para “{consulta.trim()}”. Tente o nome de uma ideia, de uma pessoa ou um ano, como 1969.
          </p>
        )
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div>
            <p className="mb-2.5 text-[12.5px] text-ink-3">Experimente</p>
            <ul className="flex flex-wrap gap-2">
              {SUGESTOES.map((s) => (
                <li key={s}>
                  <button type="button" className="nx-chip" onClick={() => mudar(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2.5 text-[12.5px] text-ink-3">Ou descubra como duas ideias se ligam</p>
            <ul className="flex flex-wrap gap-2">
              {EXEMPLOS.map(([a, b, t]) => (
                <li key={t}>
                  <button type="button" className="nx-chip" onClick={() => conectar(a, b)}>
                    <Waypoints size={14} className="text-ink-3" aria-hidden="true" />
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!movel && (
        <p className="flex flex-none flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-5 py-2.5 text-[12px] text-ink-3" aria-hidden="true">
          <span className="flex items-center gap-1.5">
            <kbd className="nx-kbd">↑</kbd>
            <kbd className="nx-kbd">↓</kbd> navegar
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="nx-kbd">Enter</kbd> abrir
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="nx-kbd">Esc</kbd> fechar
          </span>
        </p>
      )}
    </div>
  )
}

/** campo que escolhe uma ideia (com sugestões enquanto se digita) */
function Escolha({ rotulo, valor, onEscolher, foco }: { rotulo: string; valor: string | null; onEscolher: (id: string | null) => void; foco: boolean }) {
  const [q, setQ] = useState('')
  const [ativo, setAtivo] = useState(0)
  const [aberto, setAberto] = useState(false)
  const res = useMemo(() => buscar(q, 6), [q])
  const inputRef = useRef<HTMLInputElement>(null)
  const uid = useId()

  useEffect(() => {
    if (foco && !valor) inputRef.current?.focus()
  }, [foco, valor])

  const escolher = (id: string) => {
    onEscolher(id)
    setQ('')
    setAberto(false)
  }

  if (valor) {
    const i = BY_ID.get(valor)!
    const g = GAL_BY_ID.get(i.g)!
    return (
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-line bg-white/[0.03] pr-1.5 pl-4" style={vars({ '--c': g.cor })}>
        <span className="w-9 flex-none text-[12.5px] text-ink-3">{rotulo}</span>
        <span className="nx-dot" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-[15px] text-white">{i.t}</span>
        <span className="flex-none text-[12px] tabular-nums text-ink-3">{anoCurto(i.ano)}</span>
        <button
          type="button"
          className="nx-btn nx-btn-icon h-8 w-8 flex-none"
          aria-label={`Trocar a ideia de ${rotulo.toLowerCase()}: ${i.t}`}
          onClick={() => {
            onEscolher(null)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    )
  }

  const lista = `${uid}-lista`
  return (
    <div className="relative">
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/14 bg-white/[0.04] px-4 focus-within:border-[color-mix(in_oklab,var(--acc)_60%,transparent)]">
        <label htmlFor={uid} className="w-9 flex-none text-[12.5px] text-ink-3">
          {rotulo}
        </label>
        <input
          id={uid}
          ref={inputRef}
          className="nx-input text-[15px]"
          role="combobox"
          aria-expanded={aberto && res.length > 0}
          aria-controls={lista}
          aria-autocomplete="list"
          aria-activedescendant={aberto && res[ativo] ? `${lista}-${res[ativo].id}` : undefined}
          placeholder="Digite o nome de uma ideia"
          value={q}
          onChange={(e) => {
            setQ(e.target.value)
            setAtivo(0)
            setAberto(true)
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => setTimeout(() => setAberto(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setAtivo((a) => Math.min(res.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setAtivo((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter' && res[ativo]) {
              e.preventDefault()
              escolher(res[ativo].id)
            } else if (e.key === 'Escape' && q) {
              e.stopPropagation()
              setQ('')
            }
          }}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {aberto && q.trim() && (
        <ul id={lista} role="listbox" aria-label={`Ideias para ${rotulo.toLowerCase()}`} className="nx-glass nx-scroll absolute inset-x-0 top-[calc(100%+6px)] z-20 max-h-[300px] p-1.5">
          {res.length ? (
            res.map((r, k) => (
              <Opcao key={r.id} id={`${lista}-${r.id}`} r={r} ativa={k === ativo} busca={q} onPassar={() => setAtivo(k)} onEscolher={() => escolher(r.id)} />
            ))
          ) : (
            <li className="px-3 py-3 text-[13.5px] text-ink-3">Nenhuma ideia com esse nome.</li>
          )}
        </ul>
      )}
    </div>
  )
}

function AbaConectar() {
  const de = useStore((s) => s.de)
  const ate = useStore((s) => s.ate)
  const cam = useStore((s) => s.caminho)

  return (
    <div className="nx-scroll min-h-0 flex-1 p-4">
      <p className="mb-3 px-1 text-[13px] leading-snug text-ink-3">
        Escolha duas ideias e veja a corrente de causas e consequências que liga uma à outra.
      </p>
      <div className="relative flex flex-col gap-2 pr-12">
        <Escolha rotulo="De" valor={de} onEscolher={(id) => definirPonta('de', id)} foco={!de} />
        <Escolha rotulo="Até" valor={ate} onEscolher={(id) => definirPonta('ate', id)} foco={!!de && !ate} />
        <button
          type="button"
          className="nx-btn nx-btn-icon absolute top-1/2 right-0 -translate-y-1/2 border-white/10"
          aria-label="Inverter as duas ideias"
          title="Inverter"
          onClick={trocarPontas}
          disabled={!de && !ate}
        >
          <ArrowDownUp size={16} aria-hidden="true" />
        </button>
      </div>

      {cam ? (
        <div className="mt-5">
          <p className="px-1 text-[12.5px] text-ink-3">
            {plural(cam.length - 1, 'conexão', 'conexões')} entre {BY_ID.get(cam[0])!.t} e {BY_ID.get(cam[cam.length - 1])!.t}
          </p>
          <ol className="mt-3">
            {cam.map((id, k) => {
              const i = BY_ID.get(id)!
              const g = GAL_BY_ID.get(i.g)!
              return (
                <li key={id}>
                  {k > 0 && (
                    <p className="flex items-center gap-2 py-0.5 pl-[19px] text-[12px] text-ink-3">
                      <span className="h-4 w-px bg-white/20" aria-hidden="true" />
                      {sentido(cam[k - 1], id) === 'levou' ? 'levou a' : 'veio de'}
                    </p>
                  )}
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                    style={vars({ '--c': g.cor })}
                    onClick={() => selecionar(id, 'busca')}
                    onMouseEnter={() => getEngine()?.hoverExterno(id)}
                    onMouseLeave={() => getEngine()?.hoverExterno(null)}
                  >
                    <span className="nx-dot" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[15px] text-white">{i.t}</span>
                    <span className="flex-none text-[12px] tabular-nums text-ink-3">{anoCurto(i.ano)}</span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2 px-1">
            <button type="button" className="nx-btn nx-btn-primary" onClick={percorrerCaminho}>
              <Play size={16} aria-hidden="true" />
              Percorrer o caminho
            </button>
            <button type="button" className="nx-btn" onClick={limparConexao}>
              Limpar
            </button>
          </div>
        </div>
      ) : (
        (!de || !ate) && (
          <div className="mt-5 px-1">
            <p className="mb-2.5 text-[12.5px] text-ink-3">Exemplos</p>
            <ul className="flex flex-wrap gap-2">
              {EXEMPLOS.map(([a, b, t]) => (
                <li key={t}>
                  <button type="button" className="nx-chip" onClick={() => conectar(a, b)}>
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  )
}

const ABAS: { id: Aba; nome: string }[] = [
  { id: 'buscar', nome: 'Buscar' },
  { id: 'conectar', nome: 'Conectar' },
]

export function SearchPanel() {
  const painel = useStore((s) => s.painel)
  const aba = useStore((s) => s.aba)
  const movel = useStore((s) => s.movel)
  const aberto = painel === 'busca'
  const ref = useRef<HTMLDivElement>(null)
  // painel lateral, não modal: o universo continua visível e interativo ao lado
  useFoco(ref, aberto, false)
  useEspaco(ref, 'busca', movel ? 'top' : 'left', aberto, movel ? 8 : 24)

  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    const outra = aba === 'buscar' ? 'conectar' : 'buscar'
    trocarAba(outra)
    setTimeout(() => document.getElementById(`aba-btn-${outra}`)?.focus(), 0)
  }

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="busca"
          ref={ref}
          role="dialog"
          aria-modal="false"
          aria-label="Buscar e conectar ideias"
          className={cn(
            'nx-glass fixed z-30 flex flex-col',
            movel ? 'inset-x-3 top-3 max-h-[62dvh]' : 'top-[84px] left-5 max-h-[calc(100dvh_-_190px)] w-[430px]',
          )}
          initial={movel ? { opacity: 0, y: -12 } : { opacity: 0, x: -24 }}
          animate={movel ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }}
          exit={movel ? { opacity: 0, y: -10 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease }}
        >
          <div className="flex flex-none items-center gap-1 border-b border-line p-1.5">
            <div role="tablist" aria-label="Modo da busca" className="flex gap-1">
              {ABAS.map((a) => (
                <button
                  key={a.id}
                  id={`aba-btn-${a.id}`}
                  type="button"
                  role="tab"
                  aria-selected={aba === a.id}
                  aria-controls={`aba-${a.id}`}
                  tabIndex={aba === a.id ? 0 : -1}
                  className={cn('nx-btn h-9', aba === a.id && 'bg-white/[0.08] text-white')}
                  onClick={() => trocarAba(a.id)}
                  onKeyDown={onTabKey}
                >
                  {a.id === 'buscar' ? <Search size={15} aria-hidden="true" /> : <Waypoints size={15} aria-hidden="true" />}
                  {a.nome}
                </button>
              ))}
            </div>
            <button type="button" className="nx-btn nx-btn-icon ml-auto h-9 w-9" aria-label="Fechar a busca" title="Fechar (Esc)" onClick={fecharPainel}>
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          <div role="tabpanel" id={`aba-${aba}`} aria-labelledby={`aba-btn-${aba}`} className="flex min-h-0 flex-1 flex-col">
            {aba === 'buscar' ? <AbaBuscar /> : <AbaConectar />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
