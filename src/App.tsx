import { useEffect, useRef } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useStore } from '@/state/store'
import { abrirPainel, lerHash } from '@/state/actions'
import { corDaRegiao } from '@/lib/utils'
import { useAtalhos } from '@/hooks/useAtalhos'
import { useEspaco } from '@/hooks/useEspaco'
import { UniverseView } from '@/components/UniverseView'
import { Intro } from '@/components/Intro'
import { TopBar } from '@/components/TopBar'
import { GalaxyBar } from '@/components/GalaxyBar'
import { Timeline } from '@/components/Timeline'
import { DetailPanel } from '@/components/DetailPanel'
import { SearchPanel } from '@/components/SearchPanel'
import { ToursMenu, TourPanel } from '@/components/Tours'
import { Letterbox } from '@/components/Letterbox'
import { ListMode } from '@/components/ListMode'
import { Toasts } from '@/components/Toasts'
import { MobileMenu } from '@/components/MobileMenu'
import { Seguro } from '@/components/Seguro'

export default function App() {
  const entrada = useStore((s) => s.entrada)
  const movel = useStore((s) => s.movel)
  const semWebgl = useStore((s) => s.semWebgl)
  const fala = useStore((s) => s.fala)
  const cor = useStore(corDaRegiao)
  const emPercurso = useStore((s) => !!s.percurso)
  const detalhe = useStore((s) => !!(s.selecionada || s.galaxiaAberta))
  useAtalhos()

  // a interface inteira assume a cor da região explorada
  useEffect(() => {
    document.documentElement.style.setProperty('--acc', cor)
  }, [cor])

  useEffect(() => {
    const f = () => lerHash()
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  useEffect(() => {
    if (semWebgl) lerHash()
  }, [semWebgl])

  const dentro = entrada === 'dentro' && !semWebgl
  const mostrarDock = !emPercurso && !(movel && detalhe)
  // a linha do tempo ocupa a parte de baixo: a câmera enquadra o que fica acima dela
  const dockRef = useRef<HTMLDivElement>(null)
  useEspaco(dockRef, 'dock', 'bottom', dentro && mostrarDock, 6)

  return (
    <MotionConfig reducedMotion="user">
      {entrada === 'dentro' && <h1 className="sr-only">Nexus, o universo das ideias que mudaram o mundo</h1>}
      {entrada === 'dentro' && !semWebgl && (
        <button
          type="button"
          className="sr-only z-[70] rounded-full bg-white px-4 py-2 text-[14px] font-medium text-black focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          onClick={() => abrirPainel('lista')}
        >
          Ver todas as ideias em lista
        </button>
      )}

      {!semWebgl && <UniverseView />}

      <AnimatePresence>
        {dentro && (
          <motion.div key="interface" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1, delay: 0.1 }}>
            <Seguro nome="barra">
              <TopBar />
              {!movel && <GalaxyBar />}
            </Seguro>
            <AnimatePresence>
              {mostrarDock && (
                <motion.div
                  key="dock"
                  ref={dockRef}
                  className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 pb-[max(12px,env(safe-area-inset-bottom))] md:pb-5"
                  style={{ paddingLeft: movel ? 0 : 'calc(var(--pl) + 20px)', paddingRight: movel ? 0 : 'calc(var(--pr) + 20px)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  {movel && (
                    <div className="w-full">
                      <GalaxyBar />
                    </div>
                  )}
                  <div className={movel ? 'w-full px-3' : 'w-full max-w-[880px]'}>
                    <Seguro nome="linha do tempo">
                      <Timeline compacta={movel} />
                    </Seguro>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <Seguro nome="letterbox">
        <Letterbox />
      </Seguro>
      <Seguro nome="detalhe">
        <DetailPanel />
      </Seguro>
      <Seguro nome="viagem">
        <TourPanel />
      </Seguro>
      <Seguro nome="busca">
        <SearchPanel />
      </Seguro>
      <Seguro nome="viagens">
        <ToursMenu />
      </Seguro>
      <Seguro nome="menu">
        <MobileMenu />
      </Seguro>
      <Seguro nome="lista">
        <ListMode />
      </Seguro>
      <Seguro nome="avisos">
        <Toasts />
      </Seguro>
      <Seguro nome="abertura">
        <Intro />
      </Seguro>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {fala}
      </div>
    </MotionConfig>
  )
}
