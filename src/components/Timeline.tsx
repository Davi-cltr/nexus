import { useMemo } from 'react'
import { Pause, Play } from 'lucide-react'
import { useStore } from '@/state/store'
import { alternarTocar, definirAno } from '@/state/actions'
import { ANO_MAX, ANO_MIN, ERAS, anoParaPos, formatarAno, posParaAno } from '@/data/graph'
import { IDEIAS } from '@/data/ideias'
import { cn, plural } from '@/lib/utils'

const BINS = 72
const HIST = (() => {
  const h = new Array<number>(BINS).fill(0)
  IDEIAS.forEach((i) => h[Math.min(BINS - 1, Math.floor(anoParaPos(i.ano) * BINS))]++)
  return h
})()
const MAXH = Math.max(...HIST)

/** linha do tempo em escala logarítmica: a era moderna, mais densa, ganha mais espaço */
export function Timeline({ compacta = false }: { compacta?: boolean }) {
  const ano = useStore((s) => s.ano)
  const tocando = useStore((s) => s.tocando)
  const pos = anoParaPos(ano)
  const visiveis = useMemo(() => IDEIAS.reduce((n, i) => n + (i.ano <= ano ? 1 : 0), 0), [ano])
  const era = [...ERAS].reverse().find((e) => ano >= e.ano)!.nome
  const hoje = ano >= 2026

  return (
    <div className={cn('nx-glass pointer-events-auto flex w-full items-center gap-3', compacta ? 'rounded-2xl p-2' : 'rounded-[20px] p-2.5 pr-4')}>
      <button
        type="button"
        className="nx-btn nx-btn-icon h-11 w-11 flex-none bg-white/[0.06]"
        onClick={alternarTocar}
        aria-label={tocando ? 'Pausar a linha do tempo' : 'Reproduzir a história das ideias'}
        title={tocando ? 'Pausar' : 'Reproduzir a história'}
      >
        {tocando ? <Pause size={18} aria-hidden="true" /> : <Play size={18} className="translate-x-px" aria-hidden="true" />}
      </button>

      <div className="relative min-w-0 flex-1">
        <div className={cn('flex items-end gap-px', compacta ? 'h-3.5' : 'h-6')} aria-hidden="true">
          {HIST.map((c, i) => {
            const lit = (i + 0.5) / BINS <= pos
            return (
              <span
                key={i}
                className="flex-1 rounded-t-[1px] transition-colors duration-300"
                style={{
                  height: c ? `${18 + 82 * Math.pow(c / MAXH, 0.6)}%` : '6%',
                  background: lit ? 'color-mix(in oklab, var(--acc) 85%, white 15%)' : 'rgb(255 255 255 / 0.13)',
                  opacity: c ? (lit ? 0.9 : 1) : 0.5,
                }}
              />
            )
          })}
        </div>
        <div className="relative h-7">
          <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-white/[0.12]" aria-hidden="true">
            <div className="h-full rounded-full" style={{ width: `${pos * 100}%`, background: 'var(--acc)' }} />
          </div>
          {ERAS.slice(1).map((e) => (
            <span
              key={e.nome}
              aria-hidden="true"
              className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-white/30"
              style={{ left: `${anoParaPos(e.ano) * 100}%` }}
            />
          ))}
          <input
            type="range"
            className="nx-range absolute inset-0"
            min={0}
            max={1000}
            step={1}
            value={Math.round(pos * 1000)}
            onChange={(e) => definirAno(posParaAno(Number(e.target.value) / 1000))}
            onKeyDown={(e) => {
              // pelo teclado, o passo acompanha a escala: anos na era moderna, milênios na pré-história
              const passo = ano > 1800 ? 1 : ano > 0 ? 10 : ano > -10000 ? 100 : 10000
              const mapa: Record<string, number> = {
                ArrowLeft: -passo,
                ArrowDown: -passo,
                ArrowRight: passo,
                ArrowUp: passo,
                PageDown: -passo * 10,
                PageUp: passo * 10,
              }
              if (e.key in mapa) {
                e.preventDefault()
                definirAno(ano + mapa[e.key])
              } else if (e.key === 'Home' || e.key === 'End') {
                e.preventDefault()
                definirAno(e.key === 'Home' ? ANO_MIN : ANO_MAX)
              }
            }}
            aria-label="Linha do tempo: mostrar as ideias que já existiam até o ano escolhido"
            aria-valuetext={`${formatarAno(ano)}, ${era}, ${plural(visiveis, 'ideia visível', 'ideias visíveis')}`}
          />
        </div>
      </div>

      <div className={cn('flex-none text-right', compacta ? 'w-[86px]' : 'w-[150px]')} aria-hidden="true">
        <p className={cn('font-display leading-none tabular-nums [font-variation-settings:"opsz"_48]', compacta ? 'text-[16px]' : 'text-[21px]')}>
          {hoje ? 'Hoje' : formatarAno(ano)}
        </p>
        <p className="mt-1 truncate text-[11.5px] text-ink-3">
          {compacta ? plural(visiveis, 'ideia', 'ideias') : `${era}, ${plural(visiveis, 'ideia', 'ideias')}`}
        </p>
      </div>
    </div>
  )
}
