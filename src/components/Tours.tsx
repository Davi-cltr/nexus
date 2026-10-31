import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Waypoints, X } from 'lucide-react'
import { useStore, type Percurso } from '@/state/store'
import { abrirBusca, alternarAuto, encerrarPercurso, fecharPainel, iniciarViagem, irPasso, passo, selecionar } from '@/state/actions'
import { BY_ID, GAL_BY_ID, formatarAno } from '@/data/graph'
import { VIAGENS } from '@/data/ideias'
import { useEspaco } from '@/hooks/useEspaco'
import { useFoco } from '@/hooks/useFoco'
import { cn, vars } from '@/lib/utils'

const ease = [0.16, 1, 0.3, 1] as const

/** lista de viagens guiadas (menu que abre pelo botão Viagens) */
export function ToursMenu() {
  const painel = useStore((s) => s.painel)
  const movel = useStore((s) => s.movel)
  const aberto = painel === 'viagens'
  const ref = useRef<HTMLDivElement>(null)
  useFoco(ref, aberto)

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="veu"
            className="fixed inset-0 z-[29]"
            style={{ background: movel ? 'rgb(3 4 11 / 0.55)' : 'transparent' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fecharPainel}
            aria-hidden="true"
          />
          <motion.div
            key="viagens"
            ref={ref}
            id="painel-viagens"
            role="dialog"
            aria-modal="true"
            aria-labelledby="viagens-titulo"
            className={cn(
              'nx-glass fixed z-30 flex flex-col',
              movel ? 'inset-x-0 bottom-0 max-h-[78dvh] rounded-b-none' : 'top-[78px] right-5 max-h-[calc(100dvh-110px)] w-[400px]',
            )}
            initial={movel ? { y: '100%' } : { opacity: 0, y: -10 }}
            animate={movel ? { y: 0 } : { opacity: 1, y: 0 }}
            exit={movel ? { y: '100%' } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                <h2 id="viagens-titulo" className="font-display text-[24px] leading-tight [font-variation-settings:'opsz'_48]">
                  Viagens guiadas
                </h2>
                <p className="mt-1 text-[13.5px] leading-snug text-ink-3">A câmera segue uma cadeia de ideias, uma parada de cada vez.</p>
              </div>
              <button type="button" className="nx-btn nx-btn-icon -mt-1 -mr-2 flex-none" aria-label="Fechar" onClick={fecharPainel}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ul className="nx-scroll mt-3 flex-1 space-y-1.5 px-3 pb-2">
              {VIAGENS.map((v, k) => {
                const ideias = v.passos.map((p) => BY_ID.get(p.id)!)
                const primeira = ideias[0]
                const ultima = ideias[ideias.length - 1]
                return (
                  <li key={v.id}>
                    <motion.button
                      type="button"
                      className="group w-full rounded-2xl border border-transparent p-3.5 text-left transition-colors hover:border-line hover:bg-white/[0.04]"
                      onClick={() => iniciarViagem(v.id)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * k, duration: 0.4, ease }}
                    >
                      <span className="block font-display text-[19px] leading-snug text-white [font-variation-settings:'opsz'_36]">{v.titulo}</span>
                      <span className="mt-1 block text-[13.5px] leading-snug text-ink-2">{v.resumo}</span>
                      <span className="mt-3 flex items-center gap-3">
                        <span className="flex items-center" aria-hidden="true">
                          {ideias.map((i, j) => (
                            <span key={i.id} className="flex items-center">
                              {j > 0 && <span className="h-px w-3 bg-white/20" />}
                              <span className="nx-dot h-[7px] w-[7px]" style={vars({ '--c': GAL_BY_ID.get(i.g)!.cor })} />
                            </span>
                          ))}
                        </span>
                        <span className="text-[12px] text-ink-3">
                          {ideias.length} paradas, de {formatarAno(primeira.ano)} a {formatarAno(ultima.ano)}
                        </span>
                      </span>
                    </motion.button>
                  </li>
                )
              })}
            </ul>
            <div className="border-t border-line p-3">
              <button type="button" className="nx-btn w-full justify-center text-ink" onClick={() => abrirBusca('conectar')}>
                <Waypoints size={16} aria-hidden="true" />
                Criar um caminho entre duas ideias
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/** cartão da viagem em andamento: narração, paradas e controles */
export function TourPanel() {
  const p = useStore((s) => s.percurso)
  const movel = useStore((s) => s.movel)
  const ref = useRef<HTMLElement>(null)
  useEspaco(ref, 'viagem', 'bottom', !!p, movel ? 0 : 24)

  return (
    <AnimatePresence>
      {p && (
        <motion.section
          ref={ref}
          key="percurso"
          aria-label={`${p.tipo === 'viagem' ? 'Viagem guiada' : 'Caminho'}: ${p.titulo}`}
          className={cn(
            'nx-glass fixed z-20',
            movel ? 'inset-x-0 bottom-0 rounded-b-none' : 'bottom-5 left-[calc((100vw_-_var(--pr))/2)] w-[min(620px,calc(100vw_-_48px))] -translate-x-1/2',
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease }}
        >
          <CartaoPercurso p={p} />
        </motion.section>
      )}
    </AnimatePresence>
  )
}

/** recebe o percurso por propriedade: durante a animação de saída o estado já é nulo */
function CartaoPercurso({ p }: { p: Percurso }) {
  const id = p.ids[p.passo]
  const ideia = BY_ID.get(id)!
  const g = GAL_BY_ID.get(ideia.g)!
  const ultimo = p.passo === p.ids.length - 1
  const texto = p.textos?.[p.passo] ?? ideia.txt

  return (
    <div className="p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-[12.5px] text-ink-3">
          {p.tipo === 'viagem' ? 'Viagem guiada' : 'Caminho'}: <span className="text-ink-2">{p.titulo}</span>
        </p>
        <button type="button" className="nx-btn nx-btn-icon -my-1 -mr-1 h-8 w-8 flex-none" aria-label="Sair da viagem" title="Sair (Esc)" onClick={encerrarPercurso}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <ol className="mt-3 flex gap-1.5" aria-label="Paradas">
        {p.ids.map((pid, k) => {
          const pi = BY_ID.get(pid)!
          const cor = GAL_BY_ID.get(pi.g)!.cor
          return (
            <li key={`${pid}-${k}`} className="flex-1">
              <button
                type="button"
                className="group block w-full py-1.5"
                aria-label={`Parada ${k + 1}: ${pi.t}`}
                aria-current={k === p.passo ? 'step' : undefined}
                onClick={() => irPasso(k)}
              >
                <span
                  className="block h-1 rounded-full transition-all duration-500 group-hover:h-1.5"
                  style={{ background: k <= p.passo ? cor : 'rgb(255 255 255 / 0.14)', opacity: k === p.passo ? 1 : 0.75, boxShadow: k === p.passo ? `0 0 12px ${cor}` : undefined }}
                />
              </button>
            </li>
          )
        })}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={p.passo + p.titulo}
          className="mt-3"
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease }}
        >
          <p className="text-[12.5px] text-ink-3">
            Parada {p.passo + 1} de {p.ids.length}
          </p>
          <h2 className="mt-1 font-display text-[26px] leading-[1.08] text-white [font-variation-settings:'opsz'_72] md:text-[30px]">{ideia.t}</h2>
          <p className="mt-1 text-[13px] text-ink-2">
            <span style={{ color: `color-mix(in oklab, ${g.cor} 70%, white)` }}>{ideia.quando}</span>, {ideia.quem}
          </p>
          <p className="mt-3 text-[15px] leading-[1.55] text-ink-2" aria-live="polite">
            {texto}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center gap-1.5">
        <button type="button" className="nx-btn nx-btn-icon border-white/10" aria-label="Parada anterior" onClick={() => passo(-1)} disabled={p.passo === 0}>
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        {ultimo ? (
          <button type="button" className="nx-btn border-white/10" onClick={() => irPasso(0)}>
            <RotateCcw size={16} aria-hidden="true" />
            Recomeçar
          </button>
        ) : (
          <button type="button" className="nx-btn border-white/10" aria-pressed={p.auto} onClick={alternarAuto}>
            {p.auto ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            {p.auto ? 'Pausar' : 'Seguir sozinho'}
          </button>
        )}
        <button type="button" className="nx-btn nx-btn-icon border-white/10" aria-label="Próxima parada" onClick={() => passo(1)} disabled={ultimo}>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="nx-btn ml-auto" onClick={() => (ultimo ? encerrarPercurso() : selecionar(id, 'chip'))}>
          {ultimo ? 'Explorar livremente' : 'Ver detalhes'}
        </button>
      </div>

      <div className="mt-3 h-0.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
        {p.auto && p.espera > 0 && !ultimo && (
          <div
            key={p.marca}
            className="h-full origin-left rounded-full"
            style={{ background: 'var(--acc)', animation: `nx-progresso ${p.espera}ms linear forwards` }}
          />
        )}
      </div>
    </div>
  )
}
