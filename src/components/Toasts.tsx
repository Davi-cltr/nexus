import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Hand, MousePointerClick, Sparkles } from 'lucide-react'
import { store, useStore } from '@/state/store'
import { avancarDica } from '@/state/actions'

const ease = [0.16, 1, 0.3, 1] as const

/** avisos curtos no topo e dicas de uso logo depois de entrar */
export function Toasts() {
  const aviso = useStore((s) => s.aviso)
  const dica = useStore((s) => s.dica)
  const movel = useStore((s) => s.movel)
  const ocupado = useStore((s) => !!(s.selecionada || s.galaxiaAberta || s.percurso || s.painel !== 'nenhum'))

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => {
      if (store.get().aviso?.n === aviso.n) store.set({ aviso: null })
    }, 3200)
    return () => clearTimeout(t)
  }, [aviso])

  useEffect(() => {
    if (!dica) return
    const t = setTimeout(avancarDica, 7500)
    return () => clearTimeout(t)
  }, [dica])

  const textoDica =
    dica === 1
      ? movel
        ? 'Arraste com um dedo para girar o universo. Use dois dedos para aproximar.'
        : 'Arraste para girar o universo e role para aproximar.'
      : movel
        ? 'Toque numa estrela para abrir a ideia, ou numa galáxia para entrar nela.'
        : 'Clique numa estrela para abrir a ideia. Pressione / para buscar qualquer coisa.'

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-[76px] z-[60] flex justify-center px-4 md:top-[88px]" role="status" aria-live="polite">
        <AnimatePresence>
          {aviso && (
            <motion.p
              key={aviso.n}
              className="nx-glass flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[13.5px] text-ink"
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.35, ease }}
            >
              <Sparkles size={15} className="text-[var(--acc)]" aria-hidden="true" />
              {aviso.texto}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-[150px] z-[12] flex justify-center px-4 md:bottom-[124px]" style={{ paddingRight: 'calc(var(--pr) + 16px)' }}>
        <AnimatePresence mode="wait">
          {dica > 0 && !ocupado && (
            <motion.p
              key={dica}
              className="nx-glass pointer-events-auto flex max-w-[460px] items-center gap-3 rounded-full py-2.5 pr-5 pl-3 text-[13.5px] text-ink-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease }}
              onClick={avancarDica}
            >
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/[0.07] text-[var(--acc)]" aria-hidden="true">
                {dica === 1 ? <Hand size={16} /> : <MousePointerClick size={16} />}
              </span>
              {textoDica}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
