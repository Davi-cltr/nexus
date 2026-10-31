import { AnimatePresence, motion } from 'motion/react'
import { useStore } from '@/state/store'

const ease = [0.65, 0, 0.35, 1] as const

/** faixas de cinema e legenda durante os voos longos */
export function Letterbox() {
  const voo = useStore((s) => s.voo)
  return (
    <AnimatePresence>
      {voo && (
        <motion.div key="letterbox" className="pointer-events-none fixed inset-0 z-[15]" aria-hidden="true" exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-x-0 top-0 h-[9vh] bg-[#020309]"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.7, ease }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 flex h-[11vh] min-h-[78px] items-center bg-[#020309] px-6 md:px-10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.7, ease }}
          >
            <motion.div
              key={voo.titulo}
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="h-9 w-[2px] rounded-full" style={{ background: voo.cor, boxShadow: `0 0 14px ${voo.cor}` }} />
              <span>
                <span className="block font-display text-[20px] leading-tight text-white [font-variation-settings:'opsz'_48] md:text-[24px]">
                  {voo.titulo}
                </span>
                <span className="mt-0.5 block text-[12.5px] text-ink-3 md:text-[13px]">{voo.sub}</span>
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
