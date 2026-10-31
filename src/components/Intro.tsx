import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Volume2, VolumeX } from 'lucide-react'
import { useStore } from '@/state/store'
import { entrar, getEngine } from '@/state/actions'
import { ARESTAS } from '@/data/graph'
import { GALAXIAS, IDEIAS, VIAGENS } from '@/data/ideias'

const ease = [0.16, 1, 0.3, 1] as const

const NUMEROS = [
  { n: GALAXIAS.length, t: 'galáxias' },
  { n: IDEIAS.length, t: 'ideias' },
  { n: ARESTAS.length, t: 'conexões' },
  { n: VIAGENS.length, t: 'viagens guiadas' },
]

export function Intro() {
  const entrada = useStore((s) => s.entrada)
  const movel = useStore((s) => s.movel)
  const semWebgl = useStore((s) => s.semWebgl)

  // na abertura, o universo fica à direita do texto; ao entrar, desliza para o centro
  useEffect(() => {
    const u = getEngine()
    if (!u) return
    // no celular o texto ocupa a tela toda: os nomes das galáxias só aparecem depois de entrar
    u.setLabelsOn(!(movel && entrada === 'abertura'))
    if (movel) return
    if (entrada === 'abertura') u.setInsets({ right: -window.innerWidth * 0.5 })
    else u.setInsets({})
  }, [entrada, movel])

  const visivel = entrada !== 'dentro' && !semWebgl
  const saindo = entrada === 'entrando'

  return (
    <AnimatePresence>
      {visivel && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-50 flex items-center"
          style={{ pointerEvents: saindo ? 'none' : 'auto' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0"
            animate={{ opacity: saindo ? 0 : 1 }}
            transition={{ duration: 1.4, ease }}
            style={{
              background: movel
                ? 'radial-gradient(120% 80% at 50% 45%, rgb(3 4 11 / 0.5), rgb(3 4 11 / 0.9))'
                : 'linear-gradient(90deg, rgb(3 4 11 / 0.92) 0%, rgb(3 4 11 / 0.72) 34%, rgb(3 4 11 / 0.1) 62%, transparent 100%)',
            }}
          />
          <motion.section
            aria-labelledby="intro-titulo"
            className="relative mx-auto w-full max-w-[1320px] px-6 md:px-[6vw]"
            animate={saindo ? { opacity: 0, y: -24, filter: 'blur(10px)' } : { opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: saindo ? 0.9 : 0.6, ease }}
          >
            <div className={movel ? 'text-center' : 'max-w-[560px]'}>
              <motion.p
                className="text-[14px] font-medium text-ink-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.8, ease }}
              >
                Um mapa vivo das ideias que mudaram o mundo
              </motion.p>
              <h1
                id="intro-titulo"
                className="mt-3 font-display text-[clamp(76px,15vw,184px)] font-[340] leading-[0.86] tracking-[-0.035em] [font-variation-settings:'opsz'_144]"
              >
                {'Nexus'.split('').map((l, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: '0.35em', filter: 'blur(14px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 1.1, ease }}
                  >
                    {l}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                className={`mt-6 text-[17px] leading-relaxed text-ink-2 md:text-[19px] ${movel ? 'mx-auto max-w-[34ch]' : 'max-w-[44ch]'}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.9, ease }}
              >
                {movel
                  ? 'Cada estrela é uma ideia que mudou o mundo. Cada linha mostra o que ela tornou possível.'
                  : 'Cada estrela é uma descoberta, uma invenção ou uma teoria. Cada linha mostra o que uma ideia tornou possível. Voe entre as galáxias, procure o que quiser e descubra o caminho que liga o fogo à inteligência artificial.'}
              </motion.p>

              <motion.div
                className={`mt-9 flex flex-wrap gap-3 ${movel ? 'justify-center' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.9, ease }}
              >
                <button type="button" className="nx-btn nx-btn-primary h-12 px-6 text-[15px]" onClick={() => entrar(true)} autoFocus>
                  <Volume2 size={18} aria-hidden="true" />
                  Entrar com som
                </button>
                <button
                  type="button"
                  className="nx-btn h-12 border-white/15 px-6 text-[15px] text-ink hover:border-white/30"
                  onClick={() => entrar(false)}
                >
                  <VolumeX size={18} aria-hidden="true" />
                  Entrar sem som
                </button>
              </motion.div>

              <motion.dl
                className={`mt-10 grid max-w-[520px] grid-cols-4 gap-4 md:mt-12 [@media(max-height:740px)]:hidden ${movel ? 'mx-auto' : ''}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.25, duration: 1 }}
              >
                {NUMEROS.map((x) => (
                  <div key={x.t} className={`flex flex-col-reverse ${movel ? 'text-center' : ''}`}>
                    <dt className="mt-1.5 text-[12.5px] leading-tight text-ink-3">{x.t}</dt>
                    <dd className="font-display text-[30px] font-[380] leading-none tabular-nums md:text-[36px]">{x.n}</dd>
                  </div>
                ))}
              </motion.dl>
            </div>
          </motion.section>

          <motion.p
            className="absolute inset-x-0 bottom-6 px-6 text-center text-[12.5px] text-ink-3 md:bottom-8 [@media(max-height:600px)]:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: saindo ? 0 : 1 }}
            transition={{ delay: saindo ? 0 : 1.6, duration: 0.8 }}
          >
            {movel
              ? 'Arraste com um dedo para girar. Use dois dedos para aproximar.'
              : 'Arraste para girar, role para aproximar. Pressione / a qualquer momento para buscar.'}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
