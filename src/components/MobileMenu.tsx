import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { List, Orbit, Route, Volume2, VolumeX, Waypoints, X } from 'lucide-react'
import { store, useStore } from '@/state/store'
import { abrirBusca, abrirPainel, alternarSom, fecharPainel, visaoGeral } from '@/state/actions'
import { useFoco } from '@/hooks/useFoco'

const ease = [0.16, 1, 0.3, 1] as const

/** menu do celular: os mesmos atalhos da barra do computador */
export function MobileMenu() {
  const painel = useStore((s) => s.painel)
  const somOn = useStore((s) => s.som)
  const aberto = painel === 'menu'
  const ref = useRef<HTMLDivElement>(null)
  useFoco(ref, aberto)

  const itens = [
    { icone: Route, nome: 'Viagens guiadas', acao: () => store.set({ painel: 'viagens' }) },
    { icone: Waypoints, nome: 'Conectar duas ideias', acao: () => abrirBusca('conectar') },
    { icone: List, nome: 'Todas as ideias em lista', acao: () => abrirPainel('lista') },
    { icone: Orbit, nome: 'Visão geral do universo', acao: visaoGeral },
    { icone: somOn ? VolumeX : Volume2, nome: somOn ? 'Desligar o som' : 'Ligar o som', acao: alternarSom },
  ]

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="veu"
            className="fixed inset-0 z-[29] bg-[rgb(3_4_11/0.55)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fecharPainel}
            aria-hidden="true"
          />
          <motion.div
            key="menu"
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="nx-glass fixed inset-x-0 bottom-0 z-30 rounded-b-none px-3 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="flex items-center justify-between px-2 pb-1">
              <p className="font-display text-[20px] [font-variation-settings:'opsz'_36]">Explorar</p>
              <button type="button" className="nx-btn nx-btn-icon" aria-label="Fechar o menu" onClick={fecharPainel}>
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <ul>
              {itens.map(({ icone: Icone, nome, acao }) => (
                <li key={nome}>
                  <button type="button" className="flex h-14 w-full items-center gap-4 rounded-2xl px-3 text-left text-[16px] text-ink active:bg-white/[0.06]" onClick={acao}>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.06] text-[var(--acc)]">
                      <Icone size={18} aria-hidden="true" />
                    </span>
                    {nome}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
