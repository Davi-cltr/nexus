import { useEffect, type RefObject } from 'react'
import { registrarEspaco } from '@/state/actions'

export type Lado = 'top' | 'right' | 'bottom' | 'left'

/**
 * Informa ao universo quanto espaço um painel ocupa em um dos lados da tela,
 * para a câmera manter o foco no centro da área livre.
 */
export function useEspaco(ref: RefObject<HTMLElement | null>, chave: string, lado: Lado, ativo: boolean, margem = 0) {
  useEffect(() => {
    const el = ref.current
    if (!ativo || !el) {
      registrarEspaco(chave, null)
      return
    }
    const medir = () => {
      // offsetLeft/Top ignoram as animações de entrada (transform): mede a posição final
      const W = window.innerWidth
      const H = window.innerHeight
      const v =
        lado === 'right'
          ? W - el.offsetLeft
          : lado === 'left'
            ? el.offsetLeft + el.offsetWidth
            : lado === 'bottom'
              ? H - el.offsetTop
              : el.offsetTop + el.offsetHeight
      registrarEspaco(chave, { [lado]: Math.max(0, v + margem) })
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener('resize', medir)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
      registrarEspaco(chave, null)
    }
  }, [ref, chave, lado, ativo, margem])
}
