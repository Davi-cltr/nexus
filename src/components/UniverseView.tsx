import { useEffect, useRef } from 'react'
import { Universe } from '@/engine/Universe'
import { store } from '@/state/store'
import { abrirGalaxia, aoVoar, avancarDica, fecharGalaxia, fecharPainel, selecionar, setEngine } from '@/state/actions'
import { BY_ID } from '@/data/graph'
import { som } from '@/lib/audio'

/** o universo 3D: cria o motor uma vez e mantém o destaque em sincronia com o estado */
export function UniverseView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const s0 = store.get()
    let u: Universe
    try {
      u = new Universe(
        canvasRef.current!,
        labelsRef.current!,
        { mobile: s0.movel, reduced: s0.reduzido },
        {
          hover: (id) => {
            store.set({ sobre: id })
            if (id) som.passar(BY_ID.get(id)!.g)
          },
          click: (id) => selecionar(id, 'clique'),
          clickGalaxy: (g) => abrirGalaxia(g),
          clickEmpty: () => {
            const s = store.get()
            if (s.painel !== 'nenhum') fecharPainel()
            else if (s.selecionada) selecionar(null)
            else if (s.galaxiaAberta) fecharGalaxia()
          },
          activeGalaxy: (g) => {
            store.set({ galaxiaAtiva: g })
            som.regiaoAtual(g)
          },
          flight: aoVoar,
          interact: () => {
            if (store.get().dica === 1) avancarDica()
          },
        },
      )
    } catch {
      store.set({ semWebgl: true, entrada: 'dentro' })
      return
    }
    setEngine(u)

    let ultima = ''
    const sincronizar = () => {
      const s = store.get()
      const path = s.percurso?.ids ?? s.caminho
      const hits = s.painel === 'busca' && s.aba === 'buscar' && s.consulta.trim() ? s.acertos : []
      const chave = `${s.selecionada}|${path?.join(',')}|${s.percurso?.passo}|${hits.join(',')}|${s.ano}|${s.previa}`
      if (chave === ultima) return
      ultima = chave
      u.setHighlight({
        selected: s.selecionada,
        hits,
        path,
        pathStep: s.percurso ? s.percurso.passo : null,
        year: s.ano,
        preview: s.previa,
      })
    }
    sincronizar()
    const sair = store.subscribe(sincronizar)
    return () => {
      sair()
      setEngine(null)
      u.dispose()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="nx-canvas" aria-hidden="true" />
      <div ref={labelsRef} className="nx-labels" />
    </>
  )
}
