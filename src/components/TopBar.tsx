import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { List, Menu, Orbit, Route, Search, Volume2, VolumeX } from 'lucide-react'
import { useStore } from '@/state/store'
import { abrirBusca, abrirPainel, alternarSom, visaoGeral } from '@/state/actions'
import { GAL_BY_ID } from '@/data/graph'
import { IDEIAS } from '@/data/ideias'
import { useEspaco } from '@/hooks/useEspaco'
import { Logo } from './Logo'

const ease = [0.16, 1, 0.3, 1] as const

export function TopBar() {
  const ativa = useStore((s) => s.galaxiaAtiva)
  const painel = useStore((s) => s.painel)
  const somOn = useStore((s) => s.som)
  const movel = useStore((s) => s.movel)
  const g = ativa ? GAL_BY_ID.get(ativa)! : null
  const titulo = g ? g.titulo : 'O universo das ideias'
  const frase = g ? g.frase : `${IDEIAS.length} ideias que mudaram o mundo, ligadas pelo que cada uma tornou possível.`
  const ref = useRef<HTMLElement>(null)
  useEspaco(ref, 'topo', 'top', true, -10)

  return (
    <header ref={ref} className="pointer-events-none fixed inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3 md:p-5">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={visaoGeral}
          className="flex flex-none items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-white/5"
          aria-label="Nexus. Voltar para a visão geral"
        >
          <Logo size={movel ? 28 : 30} />
          {!movel && <span className="font-display text-[23px] font-[440] tracking-[-0.01em] [font-variation-settings:'opsz'_72]">Nexus</span>}
        </button>
        {!movel && <span className="h-8 w-px flex-none bg-line" aria-hidden="true" />}
        <div className="relative min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ativa ?? 'geral'}
              initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
              transition={{ duration: 0.45, ease }}
              className="min-w-0"
            >
              <p
                className="truncate font-display text-[16px] leading-tight [font-variation-settings:'opsz'_36] md:text-[18px]"
                style={{ color: g ? `color-mix(in oklab, ${g.cor} 72%, white)` : undefined }}
              >
                {titulo}
              </p>
              <p className="hidden max-w-[48ch] truncate text-[12.5px] leading-snug text-ink-3 md:block">{frase}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <nav aria-label="Ações principais" className="nx-glass pointer-events-auto flex flex-none items-center gap-0.5 rounded-full p-1">
        <button
          type="button"
          className={movel ? 'nx-btn nx-btn-icon' : 'nx-btn'}
          onClick={() => abrirBusca('buscar')}
          aria-expanded={painel === 'busca'}
          aria-keyshortcuts="/"
          aria-label={movel ? 'Buscar' : undefined}
        >
          <Search size={17} aria-hidden="true" />
          {!movel && (
            <>
              Buscar
              <kbd className="nx-kbd" aria-hidden="true">
                /
              </kbd>
            </>
          )}
        </button>
        {movel ? (
          <button
            type="button"
            className="nx-btn nx-btn-icon"
            aria-label="Menu"
            aria-expanded={painel === 'menu' || painel === 'viagens'}
            onClick={() => abrirPainel('menu')}
          >
            <Menu size={18} aria-hidden="true" />
          </button>
        ) : (
          <>
            <button
              type="button"
              className="nx-btn"
              aria-expanded={painel === 'viagens'}
              aria-controls="painel-viagens"
              onClick={() => abrirPainel('viagens')}
            >
              <Route size={17} aria-hidden="true" />
              Viagens
            </button>
            <button type="button" className="nx-btn" aria-expanded={painel === 'lista'} onClick={() => abrirPainel('lista')}>
              <List size={17} aria-hidden="true" />
              Lista
            </button>
            <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              className="nx-btn nx-btn-icon"
              aria-pressed={somOn}
              aria-label={somOn ? 'Desligar o som' : 'Ligar o som'}
              title={somOn ? 'Desligar o som' : 'Ligar o som'}
              onClick={alternarSom}
            >
              {somOn ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}
            </button>
            <button type="button" className="nx-btn nx-btn-icon" aria-label="Visão geral" title="Visão geral" onClick={visaoGeral}>
              <Orbit size={17} aria-hidden="true" />
            </button>
          </>
        )}
      </nav>
    </header>
  )
}
