// Som sintetizado com Web Audio: nenhum arquivo é baixado.
// Cada galáxia tem um acorde; o fundo desliza de um acorde para outro conforme a região.
import type { GalaxiaId } from '@/data/ideias'

const A2 = 110
const ACORDES: Record<GalaxiaId | 'geral', number[]> = {
  geral: [0, 7, 12, 16],
  matematica: [0, 7, 14, 19],
  fisica: [2, 9, 14, 17],
  cosmos: [-2, 5, 12, 17],
  vida: [3, 10, 15, 19],
  saude: [5, 12, 16, 21],
  energia: [7, 14, 19, 23],
  comunicacao: [8, 15, 20, 24],
  computacao: [10, 17, 22, 26],
  sociedade: [4, 11, 16, 23],
}
const hz = (semi: number) => A2 * Math.pow(2, semi / 12)

class Som {
  ctx: AudioContext | null = null
  master!: GainNode
  bus!: GainNode
  verb!: ConvolverNode
  padFilter!: BiquadFilterNode
  voices: { a: OscillatorNode; b: OscillatorNode }[] = []
  noise!: AudioBuffer
  regiao: GalaxiaId | 'geral' = 'geral'
  ligado = false
  ultimoBlip = 0

  private iniciar() {
    if (this.ctx) return true
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return false
    const ctx = new AC()
    this.ctx = ctx
    this.master = ctx.createGain()
    this.master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -18
    comp.ratio.value = 3
    this.master.connect(comp).connect(ctx.destination)

    // reverberação gerada na hora (ruído com decaimento)
    this.verb = ctx.createConvolver()
    const len = Math.floor(ctx.sampleRate * 3.2)
    const ir = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
    }
    this.verb.buffer = ir
    const wet = ctx.createGain()
    wet.gain.value = 0.42
    this.verb.connect(wet).connect(this.master)
    this.bus = ctx.createGain()
    this.bus.connect(this.master)
    this.bus.connect(this.verb)

    // ruído para os sopros dos voos
    this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const nd = this.noise.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1

    // fundo: quatro vozes, cada uma com dois osciladores levemente desafinados
    this.padFilter = ctx.createBiquadFilter()
    this.padFilter.type = 'lowpass'
    this.padFilter.frequency.value = 820
    this.padFilter.Q.value = 0.6
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.06
    lfoGain.gain.value = 260
    lfo.connect(lfoGain).connect(this.padFilter.frequency)
    lfo.start()
    const padGain = ctx.createGain()
    padGain.gain.value = 0.05
    this.padFilter.connect(padGain).connect(this.bus)
    const notas = ACORDES.geral
    for (const semi of notas) {
      const a = ctx.createOscillator()
      const b = ctx.createOscillator()
      a.type = 'sawtooth'
      b.type = 'triangle'
      a.frequency.value = hz(semi)
      b.frequency.value = hz(semi)
      a.detune.value = -7
      b.detune.value = 6
      const g = ctx.createGain()
      g.gain.value = 0.22
      a.connect(g)
      b.connect(g)
      g.connect(this.padFilter)
      a.start()
      b.start()
      this.voices.push({ a, b })
    }
    return true
  }

  alternar(on: boolean) {
    if (on && !this.iniciar()) return false
    if (!this.ctx) return false
    this.ligado = on
    const t = this.ctx.currentTime
    if (on) void this.ctx.resume()
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setTargetAtTime(on ? 0.85 : 0, t, on ? 0.6 : 0.15)
    return on
  }

  regiaoAtual(id: GalaxiaId | null) {
    this.regiao = id ?? 'geral'
    if (!this.ctx) return
    const notas = ACORDES[this.regiao]
    const t = this.ctx.currentTime
    this.voices.forEach((v, i) => {
      v.a.frequency.setTargetAtTime(hz(notas[i]), t, 0.9)
      v.b.frequency.setTargetAtTime(hz(notas[i]), t, 0.9)
    })
    this.padFilter.frequency.setTargetAtTime(id ? 1100 : 820, t, 1.2)
  }

  private tom(freq: number, dur: number, vol: number, tipo: OscillatorType = 'sine', atraso = 0) {
    if (!this.ctx || !this.ligado) return
    const ctx = this.ctx
    const t = ctx.currentTime + atraso
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = tipo
    o.frequency.value = freq
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(g).connect(this.bus)
    o.start(t)
    o.stop(t + dur + 0.05)
  }

  /** nota do acorde da região, algumas oitavas acima */
  private nota(grau: number, oitava = 2) {
    const notas = ACORDES[this.regiao]
    return hz(notas[grau % notas.length] + 12 * oitava)
  }

  passar(galaxia?: GalaxiaId) {
    const agora = performance.now()
    if (agora - this.ultimoBlip < 70) return
    this.ultimoBlip = agora
    const notas = ACORDES[galaxia ?? this.regiao]
    this.tom(hz(notas[2] + 24), 0.18, 0.035, 'sine')
  }

  escolher() {
    this.tom(this.nota(0, 2), 0.5, 0.06, 'triangle')
    this.tom(this.nota(2, 2), 0.6, 0.05, 'sine', 0.07)
    this.tom(this.nota(3, 2), 0.9, 0.04, 'sine', 0.14)
  }

  nascer() {
    const agora = performance.now()
    if (agora - this.ultimoBlip < 45) return
    this.ultimoBlip = agora
    this.tom(this.nota(Math.floor(Math.random() * 4), 3), 0.35, 0.025, 'sine')
  }

  /** sino de FM para cada passo de uma viagem */
  sino() {
    if (!this.ctx || !this.ligado) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const f = this.nota(0, 3)
    const car = ctx.createOscillator()
    const mod = ctx.createOscillator()
    const mg = ctx.createGain()
    const g = ctx.createGain()
    car.frequency.value = f
    mod.frequency.value = f * 1.4
    mg.gain.setValueAtTime(f * 2.2, t)
    mg.gain.exponentialRampToValueAtTime(1, t + 1.6)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.06, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)
    mod.connect(mg).connect(car.frequency)
    car.connect(g).connect(this.bus)
    car.start(t)
    mod.start(t)
    car.stop(t + 2.3)
    mod.stop(t + 2.3)
  }

  /** sopro filtrado que acompanha um voo de câmera */
  voo(dur: number) {
    if (!this.ctx || !this.ligado || dur < 0.3) return
    const ctx = this.ctx
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 1.4
    bp.frequency.setValueAtTime(260, t)
    bp.frequency.exponentialRampToValueAtTime(2200, t + dur * 0.5)
    bp.frequency.exponentialRampToValueAtTime(320, t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.09, t + dur * 0.45)
    g.gain.linearRampToValueAtTime(0, t + dur)
    src.connect(bp).connect(g).connect(this.bus)
    src.start(t)
    src.stop(t + dur + 0.1)
  }
}

export const som = new Som()
