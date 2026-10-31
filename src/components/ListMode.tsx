import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search, X } from 'lucide-react'
import { useStore } from '@/state/store'
import { fecharPainel, selecionar } from '@/state/actions'
import { GRAU, LEVOU, VEIO, normalizar } from '@/data/graph'
import { GALAXIAS, IDEIAS, type GalaxiaId } from '@/data/ideias'
import { useFoco } from '@/hooks/useFoco'
import { cn, plural, vars } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const
const INDICE = IDEIAS.map((i) => ({ id: i.id, chave: normalizar(`${i.t} ${i.quem} ${i.quando} ${(i.alias ?? []).join(' ')}`) }))

/**
 * Todas as ideias em lista: o mesmo conteúdo do universo, fácil de percorrer
 * pelo teclado ou por leitor de tela (e a versão usada quando não há 3D).
 */
export function ListMode() {
  const painel = useStore((s) => s.painel)
  const semWebgl = useStore((s) => s.semWebgl)
  const sel = useStore((s) => s.selecionada)
  const aberto = painel === 'lista' || (semWebgl && !sel)
  const ref = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [gal, setGal] = useState<GalaxiaId | 'todas'>('todas')
  useFoco(ref, aberto)

  const grupos = useMemo(() => {
    const n = normalizar(q)
    const ok = new Set(INDICE.filter((x) => !n || n.split(' ').every((t) => x.chave.includes(t))).map((x) => x.id))
    return GALAXIAS.filter((g) => gal === 'todas' || g.id === gal)
      .map((g) => ({
        g,
        ideias: IDEIAS.filter((i) => i.g === g.id && ok.has(i.id)).sort((a, b) => a.ano - b.ano || a.id.localeCompare(b.id)),
      }))
      .filter((x) => x.ideias.length)
  }, [q, gal])
  const total = grupos.reduce((n, x) => n + x.ideias.length, 0)

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          key="lista"
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lista-titulo"
          className="fixed inset-0 z-40 flex flex-col bg-[rgb(3_4_11/0.82)] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease }}
        >
          <div className="mx-auto flex w-full max-w-[1180px] min-h-0 flex-1 flex-col px-4 pt-5 md:px-8 md:pt-8">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="lista-titulo" className="font-display text-[34px] leading-none [font-variation-settings:'opsz'_96] md:text-[44px]">
                  Todas as ideias
                </h2>
                <p className="mt-2 max-w-[60ch] text-[14px] text-ink-3">
                  {semWebgl
                    ? 'Seu navegador não abriu o modo 3D. Aqui está o mesmo universo, em forma de lista.'
                    : 'O mesmo universo em forma de lista, para percorrer pelo teclado ou por leitor de tela.'}
                </p>
              </div>
              {!semWebgl && (
                <button type="button" className="nx-btn nx-btn-icon nx-glass" aria-label="Fechar a lista" onClick={fecharPainel}>
                  <X size={18} aria-hidden="true" />
                </button>
              )}
            </header>

            <div className="mt-6 flex flex-col gap-3">
              <label className="nx-glass flex h-12 w-full max-w-[560px] items-center gap-3 rounded-full px-4">
                <Search size={17} className="text-ink-3" aria-hidden="true" />
                <span className="sr-only">Filtrar ideias</span>
                <input className="nx-input text-[15px]" placeholder="Filtrar por nome, pessoa ou data" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
              </label>
              <div role="group" aria-label="Galáxia" className="nx-scroll -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0">
                <button type="button" className={cn('nx-chip flex-none', gal === 'todas' && 'bg-white/10')} aria-pressed={gal === 'todas'} onClick={() => setGal('todas')}>
                  Todas
                </button>
                {GALAXIAS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    className={cn('nx-chip flex-none', gal === g.id && 'bg-white/10')}
                    style={vars({ '--c': g.cor })}
                    aria-pressed={gal === g.id}
                    onClick={() => setGal(gal === g.id ? 'todas' : g.id)}
                  >
                    <span className="nx-dot" aria-hidden="true" />
                    {g.nome}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[12.5px] text-ink-3" aria-live="polite">
              {plural(total, 'ideia', 'ideias')}
            </p>

            <div className="nx-scroll -mx-2 mt-2 min-h-0 flex-1 px-2 pb-10">
              {grupos.map(({ g, ideias }) => (
                <section key={g.id} aria-labelledby={`lista-${g.id}`} className="mt-6 first:mt-2">
                  <h3 id={`lista-${g.id}`} className="flex items-baseline gap-3" style={vars({ '--c': g.cor })}>
                    <span className="nx-dot translate-y-[-2px]" aria-hidden="true" />
                    <span className="font-display text-[22px] [font-variation-settings:'opsz'_48]" style={{ color: `color-mix(in oklab, ${g.cor} 75%, white)` }}>
                      {g.titulo}
                    </span>
                    <span className="hidden text-[13px] text-ink-3 md:inline">{g.frase}</span>
                  </h3>
                  <ul className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
                    {ideias.map((i) => (
                      <li key={i.id}>
                        <button
                          type="button"
                          className="group flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                          onClick={() => selecionar(i.id, 'lista')}
                          aria-label={`${i.t}, ${i.quando}. Veio de ${VEIO.get(i.id)!.length}, levou a ${LEVOU.get(i.id)!.length}.`}
                        >
                          <span className="w-[86px] flex-none text-[12px] tabular-nums text-ink-3">{i.quando.replace(/^c\. /, '')}</span>
                          <span className="min-w-0">
                            <span className="block truncate text-[14.5px] text-ink group-hover:text-white">{i.t}</span>
                            <span className="block truncate text-[12px] text-ink-3">
                              {i.quem}
                              {GRAU.get(i.id)! >= 6 ? `, ${GRAU.get(i.id)} conexões` : ''}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {!total && <p className="mt-10 text-center text-[15px] text-ink-2">Nenhuma ideia com esse filtro.</p>}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
