import { useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Link2, Waypoints, X } from 'lucide-react'
import { useStore } from '@/state/store'
import {
  abrirGalaxia,
  conectarCom,
  copiarLink,
  fecharGalaxia,
  getEngine,
  selecionar,
  vizinhaNaGalaxia,
} from '@/state/actions'
import { ARESTAS, BY_ID, GAL_BY_ID, GRAU, LEVOU, VEIO, formatarAno } from '@/data/graph'
import { GALAXIAS, IDEIAS, type GalaxiaId } from '@/data/ideias'
import { useEspaco } from '@/hooks/useEspaco'
import { plural, vars } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const

/** acende a ideia no universo enquanto o cursor está sobre um botão que a representa */
const realce = (id: string) => ({
  onMouseEnter: () => getEngine()?.hoverExterno(id),
  onMouseLeave: () => getEngine()?.hoverExterno(null),
  onFocus: () => getEngine()?.hoverExterno(id),
  onBlur: () => getEngine()?.hoverExterno(null),
})

function IdeiaChip({ id, origem = 'chip' }: { id: string; origem?: 'chip' }) {
  const i = BY_ID.get(id)!
  const g = GAL_BY_ID.get(i.g)!
  return (
    <button type="button" className="nx-chip" style={vars({ '--c': g.cor })} onClick={() => selecionar(id, origem)} {...realce(id)}>
      <span className="nx-dot" aria-hidden="true" />
      <span className="truncate">{i.t}</span>
      <span className="flex-none text-[11.5px] tabular-nums text-ink-3">{i.ano < -9999 ? formatarAno(i.ano).replace(' anos atrás', '') : formatarAno(i.ano)}</span>
    </button>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h3 className="mb-3 text-[12.5px] font-medium text-ink-3">{titulo}</h3>
      {children}
    </section>
  )
}

function IdeiaView({ id }: { id: string }) {
  const ideia = BY_ID.get(id)!
  const g = GAL_BY_ID.get(ideia.g)!
  const veio = VEIO.get(id)!
  const levou = LEVOU.get(id)!
  const ano = useStore((s) => s.ano)
  const levouVisivel = levou.filter((x) => BY_ID.get(x)!.ano <= ano)
  const ant = vizinhaNaGalaxia(id, -1)
  const prox = vizinhaNaGalaxia(id, 1)

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="nx-chip" style={vars({ '--c': g.cor })} onClick={() => abrirGalaxia(g.id)}>
          <span className="nx-dot" aria-hidden="true" />
          {g.titulo}
        </button>
      </div>
      <h2 id="painel-titulo" className="mt-5 font-display text-[34px] leading-[1.02] font-[400] tracking-[-0.015em] text-white [font-variation-settings:'opsz'_96] md:text-[38px]">
        {ideia.t}
      </h2>
      <p className="mt-3 text-[14px] leading-snug text-ink-2">
        <span className="font-medium tabular-nums" style={{ color: `color-mix(in oklab, ${g.cor} 70%, white)` }}>
          {ideia.quando}
        </span>
        <br />
        {ideia.quem}
      </p>
      <p className="mt-5 text-[15.5px] leading-[1.6] text-ink-2">{ideia.txt}</p>

      <Secao titulo={veio.length ? `Veio de ${plural(veio.length, 'ideia', 'ideias')}` : 'Veio de'}>
        {veio.length ? (
          <ul className="flex flex-wrap gap-2">
            {veio.map((v) => (
              <li key={v} className="max-w-full">
                <IdeiaChip id={v} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13.5px] text-ink-3">É um dos pontos de partida deste mapa.</p>
        )}
      </Secao>

      <Secao titulo={levouVisivel.length ? `Levou a ${plural(levouVisivel.length, 'ideia', 'ideias')}` : 'Levou a'}>
        {levouVisivel.length ? (
          <ul className="flex flex-wrap gap-2">
            {levouVisivel.map((v) => (
              <li key={v} className="max-w-full">
                <IdeiaChip id={v} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13.5px] text-ink-3">
            {levou.length ? 'O que veio depois ainda não existe no ano escolhido.' : 'Ainda não levou a outra ideia deste mapa.'}
          </p>
        )}
      </Secao>

      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="nx-btn border-white/12 bg-white/[0.04] text-ink" onClick={() => conectarCom(id)}>
          <Waypoints size={16} aria-hidden="true" />
          Conectar a outra ideia
        </button>
        <button type="button" className="nx-btn" onClick={copiarLink}>
          <Link2 size={16} aria-hidden="true" />
          Copiar link
        </button>
      </div>

      {ant && prox && ant !== id && (
        <nav aria-label={`Outras ideias da ${g.titulo}`} className="mt-8 grid grid-cols-2 gap-2 border-t border-line pt-5">
          <button type="button" className="group rounded-xl p-2 text-left transition-colors hover:bg-white/[0.04]" onClick={() => selecionar(ant, 'chip')} {...realce(ant)}>
            <span className="flex items-center gap-1 text-[12px] text-ink-3">
              <ChevronLeft size={14} aria-hidden="true" /> Anterior
            </span>
            <span className="mt-1 block truncate text-[13.5px] text-ink-2 group-hover:text-white">{BY_ID.get(ant)!.t}</span>
          </button>
          <button type="button" className="group rounded-xl p-2 text-right transition-colors hover:bg-white/[0.04]" onClick={() => selecionar(prox, 'chip')} {...realce(prox)}>
            <span className="flex items-center justify-end gap-1 text-[12px] text-ink-3">
              Próxima <ChevronRight size={14} aria-hidden="true" />
            </span>
            <span className="mt-1 block truncate text-[13.5px] text-ink-2 group-hover:text-white">{BY_ID.get(prox)!.t}</span>
          </button>
        </nav>
      )}
    </>
  )
}

function GalaxiaView({ id }: { id: GalaxiaId }) {
  const g = GAL_BY_ID.get(id)!
  const dados = useMemo(() => {
    const ideias = IDEIAS.filter((i) => i.g === id).sort((a, b) => a.ano - b.ano || a.id.localeCompare(b.id))
    const vizinhas = new Map<GalaxiaId, number>()
    let cruzadas = 0
    for (const { a, b } of ARESTAS) {
      const ga = BY_ID.get(a)!.g
      const gb = BY_ID.get(b)!.g
      if (ga === gb || (ga !== id && gb !== id)) continue
      cruzadas++
      const outra = ga === id ? gb : ga
      vizinhas.set(outra, (vizinhas.get(outra) ?? 0) + 1)
    }
    const top = [...ideias].sort((a, b) => GRAU.get(b.id)! - GRAU.get(a.id)!).slice(0, 4)
    const viz = [...vizinhas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
    return { ideias, cruzadas, top, viz }
  }, [id])
  const ano = useStore((s) => s.ano)

  return (
    <>
      <span className="nx-dot block h-3 w-3" style={vars({ '--c': g.cor })} aria-hidden="true" />
      <h2 id="painel-titulo" className="mt-5 font-display text-[34px] leading-[1.02] font-[400] tracking-[-0.015em] text-white [font-variation-settings:'opsz'_96] md:text-[38px]">
        {g.titulo}
      </h2>
      <p className="mt-3 text-[15.5px] leading-[1.55] text-ink-2">{g.frase}</p>

      <dl className="mt-6 grid grid-cols-3 gap-3">
        {[
          { t: 'ideias', n: String(dados.ideias.length) },
          { t: 'a mais antiga', n: formatarAno(dados.ideias[0].ano).replace(' anos atrás', '') },
          { t: 'ligações com outras galáxias', n: String(dados.cruzadas) },
        ].map((x) => (
          <div key={x.t} className="flex flex-col-reverse rounded-2xl border border-line bg-white/[0.025] p-3">
            <dt className="mt-1 text-[11.5px] leading-tight text-ink-3">{x.t}</dt>
            <dd className="font-display text-[20px] leading-none whitespace-nowrap tabular-nums [font-variation-settings:'opsz'_48]">{x.n}</dd>
          </div>
        ))}
      </dl>

      <Secao titulo="Mais conectadas">
        <ul className="flex flex-wrap gap-2">
          {dados.top.map((i) => (
            <li key={i.id} className="max-w-full">
              <IdeiaChip id={i.id} />
            </li>
          ))}
        </ul>
      </Secao>

      <Secao titulo="Em ordem de data">
        <ol className="relative ml-1 border-l border-line">
          {dados.ideias.map((i) => {
            const existe = i.ano <= ano
            return (
              <li key={i.id}>
                <button
                  type="button"
                  className="group -ml-px flex w-full items-baseline gap-3 rounded-r-xl border-l border-transparent py-1.5 pr-2 pl-4 text-left transition-colors hover:border-[var(--c)] hover:bg-white/[0.035]"
                  style={vars({ '--c': g.cor })}
                  onClick={() => selecionar(i.id, 'chip')}
                  {...realce(i.id)}
                >
                  <span className="w-[74px] flex-none text-[11.5px] tabular-nums text-ink-3">{i.quando.replace(/^c\. /, '')}</span>
                  <span className={existe ? 'text-[14px] text-ink-2 group-hover:text-white' : 'text-[14px] text-ink-3 line-through decoration-white/20'}>
                    {i.t}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </Secao>

      <Secao titulo="Galáxias vizinhas">
        <ul className="flex flex-wrap gap-2">
          {dados.viz.map(([gid, n]) => {
            const o = GALAXIAS.find((x) => x.id === gid)!
            return (
              <li key={gid}>
                <button type="button" className="nx-chip" style={vars({ '--c': o.cor })} onClick={() => abrirGalaxia(gid)}>
                  <span className="nx-dot" aria-hidden="true" />
                  {o.nome}
                  <span className="text-[11.5px] tabular-nums text-ink-3">{plural(n, 'ligação', 'ligações')}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Secao>
    </>
  )
}

/** painel lateral (ou folha inferior no celular) com a ideia ou galáxia aberta */
export function DetailPanel() {
  const sel = useStore((s) => s.selecionada)
  const gal = useStore((s) => s.galaxiaAberta)
  const percurso = useStore((s) => s.percurso)
  const movel = useStore((s) => s.movel)
  const ref = useRef<HTMLElement>(null)
  const aberto = !!(sel || gal) && !percurso
  useEspaco(ref, 'detalhe', movel ? 'bottom' : 'right', aberto, movel ? 0 : 20)
  const chave = sel ?? gal ?? ''
  const fechar = () => (sel ? selecionar(null) : fecharGalaxia())

  return (
    <AnimatePresence>
      {aberto && (
        <motion.aside
          ref={ref}
          key="painel"
          aria-labelledby="painel-titulo"
          className={
            movel
              ? 'nx-glass fixed inset-x-0 bottom-0 z-20 flex max-h-[62dvh] flex-col rounded-t-[22px] rounded-b-none border-b-0'
              : 'nx-glass fixed top-[84px] right-5 bottom-5 z-20 flex w-[400px] flex-col'
          }
          initial={movel ? { y: '100%' } : { x: 40, opacity: 0 }}
          animate={movel ? { y: 0 } : { x: 0, opacity: 1 }}
          exit={movel ? { y: '100%' } : { x: 40, opacity: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          {movel && <div className="mx-auto mt-2.5 h-1 w-10 flex-none rounded-full bg-white/20" aria-hidden="true" />}
          <button
            type="button"
            className="nx-btn nx-btn-icon absolute top-3 right-3 z-10"
            onClick={fechar}
            aria-label={sel ? 'Fechar a ideia' : 'Fechar a galáxia'}
            title="Fechar (Esc)"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <div className="nx-scroll min-h-0 flex-1 px-6 pt-6 pb-8 md:px-7 md:pt-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={chave}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.32, ease }}
              >
                {sel ? <IdeiaView id={sel} /> : gal ? <GalaxiaView id={gal} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
