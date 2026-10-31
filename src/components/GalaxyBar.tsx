import { useMemo } from 'react'
import { useStore } from '@/state/store'
import { abrirGalaxia, previa } from '@/state/actions'
import { GALAXIAS, IDEIAS, type GalaxiaId } from '@/data/ideias'
import { cn, vars } from '@/lib/utils'

function contar(ano: number) {
  const c = {} as Record<GalaxiaId, number>
  GALAXIAS.forEach((g) => (c[g.id] = 0))
  IDEIAS.forEach((i) => {
    if (i.ano <= ano) c[i.g]++
  })
  return c
}

/** as nove galáxias: atalhos para voar até cada área */
export function GalaxyBar() {
  const ativa = useStore((s) => s.galaxiaAtiva)
  const aberta = useStore((s) => s.galaxiaAberta)
  const movel = useStore((s) => s.movel)
  const ano = useStore((s) => s.ano)
  const contagem = useMemo(() => contar(ano), [ano])
  const buscando = useStore((s) => s.painel === 'busca')

  if (movel) {
    return (
      <nav aria-label="Galáxias" className="pointer-events-auto">
        <ul className="nx-scroll flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
          {GALAXIAS.map((g) => {
            const on = ativa === g.id || aberta === g.id
            return (
              <li key={g.id} className="flex-none">
                <button
                  type="button"
                  className={cn('nx-chip nx-glass h-9 rounded-full', on && 'text-white')}
                  style={vars({ '--c': g.cor, borderColor: on ? `color-mix(in oklab, ${g.cor} 55%, transparent)` : '' })}
                  aria-current={on ? 'location' : undefined}
                  onClick={() => abrirGalaxia(g.id)}
                >
                  <span className="nx-dot" aria-hidden="true" />
                  {g.nome}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <nav
      aria-label="Galáxias"
      inert={buscando}
      className={cn(
        'pointer-events-auto fixed top-1/2 left-3 z-10 -translate-y-1/2 transition-opacity duration-300',
        buscando && 'pointer-events-none opacity-0',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-16 -left-3 w-[260px]"
        style={{ background: 'radial-gradient(60% 50% at 0% 50%, rgb(3 4 11 / 0.72), transparent)' }}
      />
      <ul className="relative flex flex-col [text-shadow:0_0_10px_rgb(3_4_11),0_0_3px_rgb(3_4_11)]">
        {GALAXIAS.map((g) => {
          const on = ativa === g.id || aberta === g.id
          return (
            <li key={g.id}>
              <button
                type="button"
                className={cn(
                  'group flex w-full items-center gap-3 rounded-full py-[7px] pr-3.5 pl-2.5 text-left text-[13px] text-ink-3 transition-colors hover:bg-white/[0.05] hover:text-white',
                  on && 'text-white',
                )}
                style={vars({ '--c': g.cor })}
                aria-current={on ? 'location' : undefined}
                aria-label={`${g.titulo}, ${contagem[g.id]} ideias`}
                onClick={() => abrirGalaxia(g.id)}
                onMouseEnter={() => previa(g.id)}
                onMouseLeave={() => previa(null)}
                onFocus={() => previa(g.id)}
                onBlur={() => previa(null)}
              >
                <span
                  className={cn('nx-dot transition-transform duration-300 group-hover:scale-[1.4]', on ? 'scale-[1.5]' : 'opacity-80')}
                  aria-hidden="true"
                />
                <span className="font-medium">{g.nome}</span>
                <span className="ml-auto pl-2 text-[11px] tabular-nums text-ink-3 opacity-70" aria-hidden="true">
                  {contagem[g.id]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
