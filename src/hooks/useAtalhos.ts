import { useEffect } from 'react'
import { store } from '@/state/store'
import {
  abrirBusca,
  encerrarPercurso,
  fecharGalaxia,
  fecharPainel,
  getEngine,
  limparConexao,
  passo,
  selecionar,
  visaoGeral,
  vizinhaNaGalaxia,
} from '@/state/actions'

/** atalhos de teclado: / busca, Esc volta um nível, setas navegam */
export function useAtalhos() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = store.get()
      if (s.entrada !== 'dentro') return
      const alvo = e.target as HTMLElement | null
      const tag = alvo?.tagName
      const digitando = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || !!alvo?.isContentEditable

      if ((e.key === '/' && !digitando) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        abrirBusca('buscar')
        return
      }
      if (e.key === 'Escape') {
        if (s.painel !== 'nenhum') fecharPainel()
        else if (s.percurso) encerrarPercurso()
        else if (s.selecionada) selecionar(null)
        else if (s.galaxiaAberta) fecharGalaxia()
        else if (s.caminho) limparConexao()
        return
      }
      if (digitando || e.altKey || e.ctrlKey || e.metaKey || s.painel !== 'nenhum') return
      if (alvo?.closest('[role="tablist"],[role="listbox"],[role="slider"]')) return

      const u = getEngine()
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight': {
          const d = e.key === 'ArrowLeft' ? -1 : 1
          e.preventDefault()
          if (s.percurso) passo(d)
          else if (s.selecionada) {
            const v = vizinhaNaGalaxia(s.selecionada, d)
            if (v && v !== s.selecionada) selecionar(v, 'teclado')
          } else u?.nudge(d * 0.035, 0)
          return
        }
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault()
          u?.nudge(0, e.key === 'ArrowUp' ? -0.025 : 0.025)
          return
        case '+':
        case '=':
          u?.zoomBy(0.8)
          return
        case '-':
        case '_':
          u?.zoomBy(1.25)
          return
        case 'Home':
          e.preventDefault()
          visaoGeral()
          return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
