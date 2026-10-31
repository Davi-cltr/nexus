import { Component, type ReactNode } from 'react'

/**
 * Se uma parte da interface falhar, só ela some (e volta na próxima mudança),
 * em vez de derrubar o universo inteiro.
 */
export class Seguro extends Component<{ children: ReactNode; nome: string }, { erro: boolean }> {
  state = { erro: false }
  static getDerivedStateFromError() {
    return { erro: true }
  }
  componentDidCatch(e: unknown) {
    console.error(`[nexus] falha em ${this.props.nome}:`, e)
    setTimeout(() => this.setState({ erro: false }), 1500)
  }
  render() {
    return this.state.erro ? null : this.props.children
  }
}
