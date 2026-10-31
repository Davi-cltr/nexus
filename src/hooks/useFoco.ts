import { useEffect, type RefObject } from 'react'

const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

/** mantém o Tab dentro de um painel aberto e devolve o foco ao fechar */
export function useFoco(ref: RefObject<HTMLElement | null>, ativo: boolean, prender = true) {
  useEffect(() => {
    if (!ativo) return
    const anterior = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => {
      const el = ref.current
      if (!prender || e.key !== 'Tab' || !el) return
      const f = [...el.querySelectorAll<HTMLElement>(FOCAVEIS)].filter((x) => x.offsetParent !== null)
      if (!f.length) return
      const first = f[0]
      const last = f[f.length - 1]
      if (!el.contains(document.activeElement)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (anterior && document.contains(anterior) && anterior !== document.body) anterior.focus({ preventScroll: true })
    }
  }, [ref, ativo, prender])
}
