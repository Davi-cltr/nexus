import * as THREE from 'three'
import { GALAXIAS, IDEIAS, type GalaxiaId } from '@/data/ideias'
import { ARESTAS, ARESTA_IDX, BY_ID, GRAU, INDEX, VIZINHOS } from '@/data/graph'
import { backgroundStars, buildFrames, galaxyDust, nodePositions, rng, type GalaxyFrame } from './layout'
import {
  dustFragment,
  dustVertex,
  edgeFragment,
  edgeVertex,
  glowFragment,
  glowVertex,
  nodeFragment,
  nodeVertex,
  skyFragment,
  skyVertex,
} from './shaders'

export type Dest =
  | { kind: 'node'; id: string }
  | { kind: 'galaxy'; id: GalaxiaId }
  | { kind: 'fit'; ids: string[] }
  | { kind: 'overview' }

export interface FlightInfo {
  phase: 'start' | 'end' | 'cancel'
  dest: Dest
  duration: number
  distance: number
  token: number
}

export interface EngineEvents {
  hover(id: string | null): void
  click(id: string): void
  clickGalaxy(id: GalaxiaId): void
  clickEmpty(): void
  activeGalaxy(id: GalaxiaId | null): void
  flight(info: FlightInfo): void
  interact(): void
}

export interface HighlightInput {
  selected: string | null
  hits: string[]
  path: string[] | null
  pathStep: number | null
  year: number
  preview: GalaxiaId | null
}

interface CamState {
  target: THREE.Vector3
  radius: number
  theta: number
  phi: number
}

interface Flight {
  from: CamState
  to: CamState
  ctrl: THREE.Vector3
  start: number
  dur: number
  bump: number
  dest: Dest
  token: number
  distance: number
}

const K = 28 // pontos por conexão
const FOV = 50
const BASE_BG = new THREE.Color('#03040b')
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const wrapAngle = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
/** fração de aproximação por quadro, independente da taxa de quadros */
const ease = (dt: number, rate: number) => 1 - Math.exp(-dt * rate)

export class Universe {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(FOV, 1, 0.5, 8000)
  frames: GalaxyFrame[]
  framesById = new Map<GalaxiaId, GalaxyFrame>()
  pos: THREE.Vector3[]
  mobile: boolean
  reduced: boolean
  ev: EngineEvents
  canvas: HTMLCanvasElement

  dustMat!: THREE.ShaderMaterial
  starMat!: THREE.ShaderMaterial
  glowMat!: THREE.ShaderMaterial
  nodeMat!: THREE.ShaderMaterial
  edgeMat!: THREE.ShaderMaterial
  skyMat!: THREE.ShaderMaterial
  stars!: THREE.Points
  sky!: THREE.Mesh
  nodeGeo = new THREE.BufferGeometry()
  edgeGeo = new THREE.BufferGeometry()

  // estado dos nós (atual e alvo)
  presence: Float32Array
  presenceT: Float32Array
  dim: Float32Array
  dimT: Float32Array
  emph: Float32Array
  birth: Float32Array
  // estado das conexões
  eAlpha: Float32Array
  eAlphaT: Float32Array
  eWidth: Float32Array
  eWidthT: Float32Array
  eSpeed: Float32Array
  eFlow: Float32Array
  eReveal: Float32Array
  eRevealT: Float32Array
  edgeBase: Float32Array
  galAlpha: number[] = new Array(10).fill(1)
  galAlphaT: number[] = new Array(10).fill(1)
  /** quanto de cada galáxia já existe no ano escolhido (as galáxias "acendem" na linha do tempo) */
  galYear: number[] = new Array(10).fill(1)
  /** clarão quando uma ideia nasce na galáxia */
  galPulse: number[] = new Array(10).fill(0)
  /** valor enviado aos shaders */
  galAlphaU: number[] = new Array(10).fill(1)

  // câmera
  // começa longe e baixo, quase de lado: é o fundo da tela de abertura
  cam: CamState = { target: new THREE.Vector3(), radius: 950, theta: 0.7, phi: 1.36 }
  vel = { theta: 0, phi: 0 }
  flight: Flight | null = null
  token = 0
  lastInteract = 0
  pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false, mouse: true }
  parallax = new THREE.Vector2()
  mouseNdc = new THREE.Vector2()
  mouseOn = 0
  drag: { id: number; x: number; y: number; t: number; moved: number } | null = null
  pinch: { d: number; r: number } | null = null
  touches = new Map<number, { x: number; y: number }>()
  inset = { top: 0, right: 0, bottom: 0, left: 0 }
  insetT = { top: 0, right: 0, bottom: 0, left: 0 }

  // tela
  W = 1
  H = 1
  dpr = 1
  sx: Float32Array
  sy: Float32Array
  sd: Float32Array
  gsx = new Float32Array(10)
  gsy = new Float32Array(10)
  gsd = new Float32Array(10)

  // rótulos
  labelHost: HTMLElement
  labels: HTMLDivElement[] = []
  labelText: string[] = []
  galLabels: HTMLButtonElement[] = []

  hovered: string | null = null
  hi: HighlightInput = { selected: null, hits: [], path: null, pathStep: null, year: 2026, preview: null }
  active: GalaxiaId | null = null
  bg = BASE_BG.clone()
  tint = new THREE.Color('#000000')
  tintT = new THREE.Color('#000000')
  firstYear = true
  clockStart = performance.now()
  last = performance.now()
  raf = 0
  disposed = false
  edgeDirty = true
  nodeDirty = true
  paused = false

  constructor(canvas: HTMLCanvasElement, labelHost: HTMLElement, opts: { mobile: boolean; reduced: boolean }, ev: EngineEvents) {
    this.mobile = opts.mobile
    this.reduced = opts.reduced
    this.ev = ev
    this.canvas = canvas
    this.labelHost = labelHost
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    this.renderer.setClearColor(BASE_BG)

    this.frames = buildFrames()
    this.frames.forEach((f) => this.framesById.set(f.id, f))
    const map = nodePositions(this.frames)
    this.pos = IDEIAS.map((i) => map.get(i.id)!)

    const n = IDEIAS.length
    const E = ARESTAS.length
    this.presence = new Float32Array(n).fill(1)
    this.presenceT = new Float32Array(n).fill(1)
    this.dim = new Float32Array(n).fill(1)
    this.dimT = new Float32Array(n).fill(1)
    this.emph = new Float32Array(n)
    this.birth = new Float32Array(n)
    this.eAlpha = new Float32Array(E)
    this.eAlphaT = new Float32Array(E)
    this.eWidth = new Float32Array(E)
    this.eWidthT = new Float32Array(E)
    this.eSpeed = new Float32Array(E).fill(1)
    this.eFlow = new Float32Array(E).fill(1)
    this.eReveal = new Float32Array(E).fill(1)
    this.eRevealT = new Float32Array(E).fill(1)
    this.edgeBase = new Float32Array(E)
    this.sx = new Float32Array(n)
    this.sy = new Float32Array(n)
    this.sd = new Float32Array(n)

    const shared = {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 1 },
      uFogNear: { value: 400 },
      uFogFar: { value: 1400 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: this.mouseNdc },
      uMouseOn: { value: 0 },
    }

    this.buildSky()
    this.buildStars(shared)
    this.buildDust(shared)
    this.buildGlows(shared)
    this.buildEdges(shared)
    this.buildNodes(shared)
    this.buildLabels()
    this.applyHighlight()
    this.bindInput()
    this.resize()
    this.raf = requestAnimationFrame(this.frame)
  }

  // ——— construção

  private buildSky() {
    this.skyMat = new THREE.ShaderMaterial({
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      uniforms: { uBase: { value: this.bg }, uTint: { value: this.tint }, uTintAmt: { value: 0.05 } },
      side: THREE.BackSide,
      depthTest: false,
      depthWrite: false,
    })
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(3000, 32, 16), this.skyMat)
    this.sky.renderOrder = -10
    this.sky.frustumCulled = false
    this.scene.add(this.sky)
  }

  private buildStars(shared: Record<string, THREE.IUniform>) {
    const st = backgroundStars(this.mobile ? 2600 : 5200)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(st.positions, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(st.colors, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(st.sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(st.seeds, 1))
    g.setAttribute('aGal', new THREE.BufferAttribute(new Float32Array(st.sizes.length).fill(9), 1))
    this.starMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: {
        ...shared,
        uScale: { value: 1 },
        uFogNear: { value: 1e5 },
        uFogFar: { value: 2e5 },
        uGalAlpha: { value: this.galAlphaU },
        uMaxSize: { value: 2.6 },
        uLens: { value: 0.035 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    this.stars = new THREE.Points(g, this.starMat)
    this.stars.frustumCulled = false
    this.stars.renderOrder = -9
    this.scene.add(this.stars)
  }

  private buildDust(shared: Record<string, THREE.IUniform>) {
    const per = this.mobile ? 1150 : 2600
    const P = new Float32Array(per * 9 * 3)
    const C = new Float32Array(per * 9 * 3)
    const S = new Float32Array(per * 9)
    const R = new Float32Array(per * 9)
    const G = new Float32Array(per * 9)
    this.frames.forEach((f, gi) => {
      const d = galaxyDust(f, per)
      P.set(d.positions, gi * per * 3)
      C.set(d.colors, gi * per * 3)
      S.set(d.sizes, gi * per)
      R.set(d.seeds, gi * per)
      G.fill(gi, gi * per, (gi + 1) * per)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(P, 3))
    g.setAttribute('aColor', new THREE.BufferAttribute(C, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(S, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(R, 1))
    g.setAttribute('aGal', new THREE.BufferAttribute(G, 1))
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      uniforms: { ...shared, uGalAlpha: { value: this.galAlphaU }, uMaxSize: { value: 7 }, uLens: { value: 0.06 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const dust = new THREE.Points(g, this.dustMat)
    dust.frustumCulled = false
    this.scene.add(dust)
  }

  /** núcleo + nuvens de gás de cada galáxia, como quadrados voltados para a câmera */
  private buildGlows(shared: Record<string, THREE.IUniform>) {
    const puffs = 7
    const count = this.frames.length * (1 + puffs)
    const iPos = new Float32Array(count * 3)
    const iColor = new Float32Array(count * 3)
    const iSize = new Float32Array(count)
    const iAlpha = new Float32Array(count)
    const iCore = new Float32Array(count)
    const iGal = new Float32Array(count)
    const tmp = new THREE.Vector3()
    const c = new THREE.Color()
    const white = new THREE.Color('#ffffff')
    let k = 0
    this.frames.forEach((f, gi) => {
      iPos.set([f.center.x, f.center.y, f.center.z], k * 3)
      iColor.set([f.color.r, f.color.g, f.color.b], k * 3)
      iSize[k] = 34
      iAlpha[k] = 0.75
      iCore[k] = 1
      iGal[k] = gi
      k++
      const r = rng(777 + gi * 13)
      for (let p = 0; p < puffs; p++) {
        const ang = r() * Math.PI * 2
        const rad = 6 + r() * 20
        tmp.set(Math.cos(ang) * rad, (r() - 0.5) * 3, Math.sin(ang) * rad).applyMatrix4(f.basis).add(f.center)
        iPos.set([tmp.x, tmp.y, tmp.z], k * 3)
        // a cor da nuvem varia um pouco em volta da cor da galáxia
        c.copy(f.color).offsetHSL((r() - 0.5) * 0.08, 0.05, -0.08).lerp(white, r() * 0.12)
        iColor.set([c.r, c.g, c.b], k * 3)
        iSize[k] = 30 + r() * 34
        iAlpha[k] = 0.06 + r() * 0.05
        iCore[k] = 0
        iGal[k] = gi
        k++
      }
    })
    const quad = new THREE.PlaneGeometry(1, 1)
    const g = new THREE.InstancedBufferGeometry()
    g.index = quad.index
    g.setAttribute('position', quad.getAttribute('position'))
    g.setAttribute('iPos', new THREE.InstancedBufferAttribute(iPos, 3))
    g.setAttribute('iColor', new THREE.InstancedBufferAttribute(iColor, 3))
    g.setAttribute('iSize', new THREE.InstancedBufferAttribute(iSize, 1))
    g.setAttribute('iAlpha', new THREE.InstancedBufferAttribute(iAlpha, 1))
    g.setAttribute('iCore', new THREE.InstancedBufferAttribute(iCore, 1))
    g.setAttribute('iGal', new THREE.InstancedBufferAttribute(iGal, 1))
    g.instanceCount = count
    this.glowMat = new THREE.ShaderMaterial({
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      uniforms: { uFogNear: shared.uFogNear, uFogFar: shared.uFogFar, uGalAlpha: { value: this.galAlphaU } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(g, this.glowMat)
    mesh.frustumCulled = false
    this.scene.add(mesh)
  }

  private buildEdges(shared: Record<string, THREE.IUniform>) {
    const E = ARESTAS.length
    const V = E * K * 2
    const position = new Float32Array(V * 3)
    const prev = new Float32Array(V * 3)
    const next = new Float32Array(V * 3)
    const side = new Float32Array(V)
    const tt = new Float32Array(V)
    const len = new Float32Array(V)
    const color = new Float32Array(V * 3)
    const index = new Uint32Array(E * (K - 1) * 6)
    const pts: THREE.Vector3[] = Array.from({ length: K }, () => new THREE.Vector3())
    const ca = new THREE.Color()
    const cb = new THREE.Color()
    const cc = new THREE.Color()
    const up = new THREE.Vector3(0, 1, 0)
    ARESTAS.forEach(({ a, b }, k) => {
      const p0 = this.pos[INDEX.get(a)!]
      const p2 = this.pos[INDEX.get(b)!]
      const ga = BY_ID.get(a)!.g
      const gb = BY_ID.get(b)!.g
      const mid = p0.clone().add(p2).multiplyScalar(0.5)
      const dist = p0.distanceTo(p2)
      const ctrl = mid.clone()
      // dentro da galáxia, a curva sobe acima do disco; entre galáxias, se abre para fora
      if (ga === gb) ctrl.addScaledVector(this.framesById.get(ga)!.normal, dist * 0.22)
      else ctrl.addScaledVector(mid.clone().normalize(), dist * 0.18).addScaledVector(up, dist * 0.12)
      let L = 0
      for (let i = 0; i < K; i++) {
        const t = i / (K - 1)
        const u = 1 - t
        pts[i].set(0, 0, 0).addScaledVector(p0, u * u).addScaledVector(ctrl, 2 * u * t).addScaledVector(p2, t * t)
        if (i) L += pts[i].distanceTo(pts[i - 1])
      }
      ca.copy(this.framesById.get(ga)!.color)
      cb.copy(this.framesById.get(gb)!.color)
      this.edgeBase[k] = ga === gb ? 0.3 : 0.2
      for (let i = 0; i < K; i++) {
        const t = i / (K - 1)
        cc.copy(ca).lerp(cb, t)
        const pp = pts[Math.max(0, i - 1)]
        const pn = pts[Math.min(K - 1, i + 1)]
        for (let s = 0; s < 2; s++) {
          const v = (k * K + i) * 2 + s
          position.set([pts[i].x, pts[i].y, pts[i].z], v * 3)
          prev.set([pp.x, pp.y, pp.z], v * 3)
          next.set([pn.x, pn.y, pn.z], v * 3)
          side[v] = s ? 1 : -1
          tt[v] = t
          len[v] = L
          color.set([cc.r, cc.g, cc.b], v * 3)
        }
      }
      for (let i = 0; i < K - 1; i++) {
        const base = (k * K + i) * 2
        index.set([base, base + 1, base + 2, base + 1, base + 3, base + 2], (k * (K - 1) + i) * 6)
      }
    })
    const g = this.edgeGeo
    g.setAttribute('position', new THREE.BufferAttribute(position, 3))
    g.setAttribute('aPrev', new THREE.BufferAttribute(prev, 3))
    g.setAttribute('aNext', new THREE.BufferAttribute(next, 3))
    g.setAttribute('aSide', new THREE.BufferAttribute(side, 1))
    g.setAttribute('aT', new THREE.BufferAttribute(tt, 1))
    g.setAttribute('aLen', new THREE.BufferAttribute(len, 1))
    g.setAttribute('aColor', new THREE.BufferAttribute(color, 3))
    for (const name of ['aAlpha', 'aWidth', 'aFlow', 'aSpeed', 'aReveal']) {
      const start = name === 'aFlow' || name === 'aSpeed' || name === 'aReveal' ? 1 : 0
      const a = new THREE.BufferAttribute(new Float32Array(V).fill(start), 1)
      a.setUsage(THREE.DynamicDrawUsage)
      g.setAttribute(name, a)
    }
    g.setIndex(new THREE.BufferAttribute(index, 1))
    this.edgeMat = new THREE.ShaderMaterial({
      vertexShader: edgeVertex,
      fragmentShader: edgeFragment,
      uniforms: { ...shared, uSpacing: { value: 9 } },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    })
    const mesh = new THREE.Mesh(g, this.edgeMat)
    mesh.frustumCulled = false
    this.scene.add(mesh)
  }

  private buildNodes(shared: Record<string, THREE.IUniform>) {
    const n = IDEIAS.length
    const np = new Float32Array(n * 3)
    const nc = new Float32Array(n * 3)
    const ns = new Float32Array(n)
    IDEIAS.forEach((idea, i) => {
      const p = this.pos[i]
      np.set([p.x, p.y, p.z], i * 3)
      const c = this.framesById.get(idea.g)!.color
      nc.set([c.r, c.g, c.b], i * 3)
      ns[i] = 1.3 + Math.min(GRAU.get(idea.id)!, 9) * 0.16
    })
    this.nodeGeo.setAttribute('position', new THREE.BufferAttribute(np, 3))
    this.nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(nc, 3))
    this.nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(ns, 1))
    for (const [name, arr] of [
      ['aPresence', this.presence],
      ['aEmph', this.emph],
      ['aDim', this.dim],
      ['aBirth', this.birth],
    ] as const) {
      const a = new THREE.BufferAttribute(arr, 1)
      a.setUsage(THREE.DynamicDrawUsage)
      this.nodeGeo.setAttribute(name, a)
    }
    this.nodeMat = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: { ...shared },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const nodes = new THREE.Points(this.nodeGeo, this.nodeMat)
    nodes.frustumCulled = false
    this.scene.add(nodes)
  }

  private buildLabels() {
    const max = this.mobile ? 10 : 26
    for (let i = 0; i < max; i++) {
      const el = document.createElement('div')
      el.className = 'nx-label'
      el.setAttribute('aria-hidden', 'true')
      el.innerHTML = '<b></b><small></small>'
      el.style.opacity = '0'
      this.labelHost.appendChild(el)
      this.labels.push(el)
      this.labelText.push('')
    }
    for (const f of this.frames) {
      const g = GALAXIAS[f.index]
      const el = document.createElement('button')
      el.type = 'button'
      el.tabIndex = -1
      el.setAttribute('aria-hidden', 'true')
      el.className = 'nx-galaxy-label'
      el.style.setProperty('--c', g.cor)
      el.style.opacity = '0'
      el.textContent = g.nome
      el.addEventListener('click', () => this.ev.clickGalaxy(f.id))
      this.labelHost.appendChild(el)
      this.galLabels.push(el)
    }
  }

  // ——— destaque (seleção, busca, caminho, linha do tempo)

  setHighlight(h: HighlightInput) {
    const yearChanged = h.year !== this.hi.year
    this.hi = h
    if (yearChanged || this.firstYear) this.applyYear()
    this.applyHighlight()
  }

  /** ideias que já existem no ano escolhido aparecem com um anel de nascimento */
  private applyYear() {
    const y = this.hi.year
    const total = new Array(10).fill(0)
    const vivos = new Array(10).fill(0)
    IDEIAS.forEach((idea, i) => {
      const g = this.framesById.get(idea.g)!.index
      const vis = idea.ano <= y ? 1 : 0
      total[g]++
      vivos[g] += vis
      if (vis && this.presenceT[i] === 0 && !this.firstYear && !this.reduced) {
        this.presence[i] = 0.001
        this.birth[i] = 0.001
        this.galPulse[g] = 1
      }
      this.presenceT[i] = vis
    })
    for (let g = 0; g < 9; g++) this.galYear[g] = y >= 2026 ? 1 : 0.1 + 0.9 * Math.pow(vivos[g] / Math.max(1, total[g]), 0.8)
    ARESTAS.forEach(({ a, b }, k) => {
      const vis = this.presenceT[INDEX.get(a)!] && this.presenceT[INDEX.get(b)!] ? 1 : 0
      if (vis && this.eRevealT[k] === 0 && !this.reduced) this.eReveal[k] = 0
      this.eRevealT[k] = vis
    })
    if (this.firstYear) {
      this.presence.set(this.presenceT)
      this.eReveal.set(this.eRevealT)
    }
    this.firstYear = false
    this.nodeDirty = this.edgeDirty = true
  }

  private applyHighlight() {
    const { selected, hits, path, pathStep, preview } = this.hi
    const hov = this.hovered
    const n = IDEIAS.length
    const E = ARESTAS.length
    const baseW = this.mobile ? 1.3 : 1.6
    this.emph.fill(0)
    const galInvolved = new Set<GalaxiaId>()

    if (path && path.length) {
      const onPath = new Set(path)
      for (let i = 0; i < n; i++) this.dimT[i] = onPath.has(IDEIAS[i].id) ? 1 : 0.1
      path.forEach((id, k) => {
        const i = INDEX.get(id)!
        this.emph[i] = pathStep === null || k === pathStep ? 2 : 1
        galInvolved.add(BY_ID.get(id)!.g)
      })
      this.eAlphaT.fill(0.025)
      this.eWidthT.fill(baseW)
      this.eSpeed.fill(1)
      this.eFlow.fill(1)
      for (let k = 1; k < path.length; k++) {
        const e = ARESTA_IDX.get(`${path[k - 1]}|${path[k]}`)
        if (e === undefined) continue
        const done = pathStep === null || k <= pathStep
        this.eAlphaT[e] = done ? 1 : 0.35
        this.eWidthT[e] = baseW * (done ? 2.4 : 1.6)
        this.eSpeed[e] = 2.4
        // o pulso corre no sentido do caminho, mesmo quando ele volta contra a seta
        this.eFlow[e] = ARESTAS[e].a === path[k - 1] ? 1 : -1
      }
    } else if (selected) {
      const s = INDEX.get(selected)!
      const viz = VIZINHOS.get(selected)!
      for (let i = 0; i < n; i++) this.dimT[i] = i === s ? 1 : viz.has(IDEIAS[i].id) ? 0.95 : 0.16
      this.emph[s] = 2
      galInvolved.add(BY_ID.get(selected)!.g)
      viz.forEach((v) => galInvolved.add(BY_ID.get(v)!.g))
      for (let k = 0; k < E; k++) {
        const { a, b } = ARESTAS[k]
        const inc = a === selected || b === selected
        this.eAlphaT[k] = inc ? 0.95 : 0.04
        this.eWidthT[k] = inc ? baseW * 1.9 : baseW
        this.eSpeed[k] = inc ? 1.8 : 1
        this.eFlow[k] = 1
      }
    } else if (hits.length) {
      const set = new Set(hits)
      const near = new Set<string>()
      hits.forEach((h) => VIZINHOS.get(h)!.forEach((v) => near.add(v)))
      for (let i = 0; i < n; i++) {
        const id = IDEIAS[i].id
        this.dimT[i] = set.has(id) ? 1 : near.has(id) ? 0.5 : 0.1
        if (set.has(id)) {
          this.emph[i] = 1
          galInvolved.add(IDEIAS[i].g)
        }
      }
      for (let k = 0; k < E; k++) {
        const { a, b } = ARESTAS[k]
        const both = set.has(a) && set.has(b)
        const one = set.has(a) || set.has(b)
        this.eAlphaT[k] = both ? 0.95 : one ? 0.45 : 0.03
        this.eWidthT[k] = both ? baseW * 2 : one ? baseW * 1.3 : baseW
        this.eSpeed[k] = both ? 2 : 1
        this.eFlow[k] = 1
      }
    } else {
      this.dimT.fill(1)
      for (let k = 0; k < E; k++) {
        this.eAlphaT[k] = this.edgeBase[k]
        this.eWidthT[k] = baseW
        this.eSpeed[k] = 1
        this.eFlow[k] = 1
      }
    }

    // o cursor fica por cima de tudo: acende o nó e as conexões dele
    if (hov) {
      const h = INDEX.get(hov)!
      this.emph[h] = Math.max(this.emph[h], 1)
      this.dimT[h] = 1
      if (!path) {
        for (const v of VIZINHOS.get(hov)!) {
          const j = INDEX.get(v)!
          this.dimT[j] = Math.max(this.dimT[j], 0.85)
        }
        for (let k = 0; k < E; k++) {
          const { a, b } = ARESTAS[k]
          if (a === hov || b === hov) {
            this.eAlphaT[k] = Math.max(this.eAlphaT[k], 0.85)
            this.eWidthT[k] = Math.max(this.eWidthT[k], baseW * 1.7)
            this.eSpeed[k] = Math.max(this.eSpeed[k], 1.6)
          }
        }
      }
    }

    if (!galInvolved.size && preview) galInvolved.add(preview)
    const focus = galInvolved.size > 0
    for (let g = 0; g < 9; g++) this.galAlphaT[g] = (!focus || galInvolved.has(this.frames[g].id) ? 1 : 0.4) * this.galYear[g]

    this.nodeDirty = this.edgeDirty = true
    ;(this.nodeGeo.getAttribute('aEmph') as THREE.BufferAttribute).needsUpdate = true
    const wFlow = this.edgeGeo.getAttribute('aFlow') as THREE.BufferAttribute
    const wSpeed = this.edgeGeo.getAttribute('aSpeed') as THREE.BufferAttribute
    const F = wFlow.array as Float32Array
    const S = wSpeed.array as Float32Array
    for (let k = 0; k < E; k++) {
      const o = k * K * 2
      F.fill(this.eFlow[k], o, o + K * 2)
      S.fill(this.eSpeed[k], o, o + K * 2)
    }
    wFlow.needsUpdate = true
    wSpeed.needsUpdate = true
  }

  // ——— câmera e voos

  private dirFromAngles(theta: number, phi: number, out = new THREE.Vector3()) {
    return out.set(Math.sin(phi) * Math.sin(theta), Math.cos(phi), Math.sin(phi) * Math.cos(theta))
  }

  private anglesFromDir(d: THREE.Vector3) {
    const v = d.clone().normalize()
    return { theta: Math.atan2(v.x, v.z), phi: THREE.MathUtils.clamp(Math.acos(THREE.MathUtils.clamp(v.y, -1, 1)), 0.25, Math.PI - 0.25) }
  }

  /** menor meio-ângulo de visão (vertical ou horizontal), descontando os painéis */
  private halfView() {
    const v = THREE.MathUtils.degToRad(FOV / 2)
    const t = this.insetT
    const usableW = Math.min(this.W, Math.max(200, this.W - Math.max(0, t.right) - t.left))
    const usableH = Math.min(this.H, Math.max(200, this.H - t.bottom - t.top))
    const h = Math.atan(Math.tan(v) * (usableW / this.H))
    const vv = Math.atan(Math.tan(v) * (usableH / this.H))
    return Math.min(vv, h)
  }

  destFor(dest: Dest): CamState {
    if (dest.kind === 'overview') {
      let R = 0
      for (const f of this.frames) R = Math.max(R, f.center.length() + 36)
      return { target: new THREE.Vector3(0, 0, 0), radius: (R / Math.sin(this.halfView())) * 0.95, theta: this.cam.theta, phi: 1.04 }
    }
    if (dest.kind === 'galaxy') {
      const f = this.framesById.get(dest.id)!
      const dir = f.normal.clone().multiplyScalar(0.85).add(f.center.clone().normalize().multiplyScalar(0.55))
      const radius = Math.max(70, 40 / Math.sin(this.halfView()))
      return { target: f.center.clone(), radius, ...this.anglesFromDir(dir) }
    }
    if (dest.kind === 'fit') {
      const pts = dest.ids.map((id) => this.pos[INDEX.get(id)!])
      const c = pts.reduce((acc, p) => acc.add(p), new THREE.Vector3()).divideScalar(Math.max(1, pts.length))
      let R = 6
      for (const p of pts) R = Math.max(R, p.distanceTo(c) + 7)
      const radius = THREE.MathUtils.clamp((R / Math.sin(this.halfView())) * 1.04, 26, 1000)
      return { target: c, radius, theta: this.cam.theta, phi: THREE.MathUtils.clamp(this.cam.phi, 0.75, 1.2) }
    }
    const i = INDEX.get(dest.id)!
    const p = this.pos[i]
    const f = this.framesById.get(IDEIAS[i].g)!
    const out = p.clone().sub(f.center)
    if (out.lengthSq() < 1) out.copy(f.normal)
    const current = this.dirFromAngles(this.cam.theta, this.cam.phi)
    const dir = f.normal.clone().multiplyScalar(0.95).add(out.normalize().multiplyScalar(0.55)).add(current.multiplyScalar(0.35))
    return { target: p.clone(), radius: this.mobile ? 38 : 31, ...this.anglesFromDir(dir) }
  }

  flyTo(dest: Dest, opts: { duration?: number; spin?: number } = {}) {
    const to = this.destFor(dest)
    const from: CamState = { target: this.cam.target.clone(), radius: this.cam.radius, theta: this.cam.theta, phi: this.cam.phi }
    const distance = from.target.distanceTo(to.target)
    let dur = opts.duration ?? THREE.MathUtils.clamp(1.0 + distance / 150 + Math.abs(Math.log(to.radius / from.radius)) * 0.25, 1.1, 3.2)
    if (this.reduced) dur = 0.01
    const ctrl = from.target.clone().add(to.target).multiplyScalar(0.5).add(new THREE.Vector3(0, Math.min(distance * 0.3, 90), 0))
    to.theta = from.theta + wrapAngle(to.theta - from.theta) + (opts.spin ?? 0)
    const token = ++this.token
    if (this.flight) this.ev.flight({ phase: 'cancel', dest: this.flight.dest, duration: 0, distance: 0, token: this.flight.token })
    this.flight = {
      from,
      to,
      ctrl,
      start: performance.now(),
      dur: dur * 1000,
      bump: distance > 25 ? Math.min(distance * 0.55, 170) : 0,
      dest,
      token,
      distance,
    }
    this.vel.theta = this.vel.phi = 0
    this.ev.flight({ phase: 'start', dest, duration: dur, distance, token })
    return { duration: dur, distance, token }
  }

  /** chegada cinematográfica: começa muito longe e mergulha até a visão geral */
  introDive() {
    return this.flyTo({ kind: 'overview' }, { duration: this.reduced ? 0.01 : 4.2, spin: this.reduced ? 0 : 1.1 })
  }

  private stepFlight(now: number) {
    const f = this.flight
    if (!f) return
    const t = Math.min(1, (now - f.start) / f.dur)
    const e = easeInOut(t)
    const u = 1 - e
    this.cam.target.set(0, 0, 0).addScaledVector(f.from.target, u * u).addScaledVector(f.ctrl, 2 * u * e).addScaledVector(f.to.target, e * e)
    this.cam.radius = Math.exp(THREE.MathUtils.lerp(Math.log(f.from.radius), Math.log(f.to.radius), e)) + Math.sin(Math.PI * e) * f.bump
    this.cam.theta = THREE.MathUtils.lerp(f.from.theta, f.to.theta, e)
    this.cam.phi = THREE.MathUtils.lerp(f.from.phi, f.to.phi, e)
    this.camera.fov = FOV + Math.sin(Math.PI * e) * (f.bump ? 9 : 0)
    if (t >= 1) {
      this.flight = null
      this.ev.flight({ phase: 'end', dest: f.dest, duration: 0, distance: f.distance, token: f.token })
    }
  }

  private applyCamera() {
    const off = this.dirFromAngles(this.cam.theta, this.cam.phi).multiplyScalar(this.cam.radius)
    this.camera.position.copy(this.cam.target).add(off)
    this.camera.up.set(0, 1, 0)
    this.camera.lookAt(this.cam.target)
    if (!this.reduced) {
      // paralaxe: a câmera acompanha de leve o cursor
      const amp = this.cam.radius * 0.05
      this.camera.updateMatrix()
      const right = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 0)
      const up = new THREE.Vector3().setFromMatrixColumn(this.camera.matrix, 1)
      this.camera.position.addScaledVector(right, this.parallax.x * amp).addScaledVector(up, -this.parallax.y * amp)
      this.camera.lookAt(this.cam.target)
    }
  }

  /** espaço ocupado por painéis: o alvo da câmera fica no centro da área livre */
  setInsets(i: { top?: number; right?: number; bottom?: number; left?: number }) {
    this.insetT.top = i.top ?? 0
    this.insetT.right = i.right ?? 0
    this.insetT.bottom = i.bottom ?? 0
    this.insetT.left = i.left ?? 0
  }

  /** teclado: girar e aproximar sem mouse */
  nudge(dTheta: number, dPhi: number) {
    this.vel.theta += dTheta
    this.vel.phi += dPhi
    this.interacted()
  }

  zoomBy(f: number) {
    this.cam.radius = THREE.MathUtils.clamp(this.cam.radius * f, 6, 1400)
    this.interacted()
  }

  // ——— entrada (mouse, toque, roda)

  private bindInput() {
    const c = this.canvas
    c.addEventListener('pointerdown', this.onDown)
    window.addEventListener('pointermove', this.onMove, { passive: true })
    window.addEventListener('pointerup', this.onUp)
    window.addEventListener('pointercancel', this.onUp)
    c.addEventListener('wheel', this.onWheel, { passive: false })
    c.addEventListener('pointerleave', this.onLeave)
    window.addEventListener('resize', this.resize)
    document.addEventListener('visibilitychange', this.onVisibility)
  }

  private onVisibility = () => {
    this.paused = document.hidden
    if (!this.paused) {
      this.last = performance.now()
      cancelAnimationFrame(this.raf)
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private onLeave = () => {
    if (this.drag) return
    this.pointer.inside = false
    this.setHovered(null)
  }

  private local(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    this.canvas.setPointerCapture?.(e.pointerId)
    this.pointer.mouse = e.pointerType === 'mouse'
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.touches.size === 2) {
      const [a, b] = [...this.touches.values()]
      this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), r: this.cam.radius }
      this.drag = null
      return
    }
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }
    this.canvas.style.cursor = 'grabbing'
  }

  private onMove = (e: PointerEvent) => {
    const p = this.local(e)
    this.pointer.x = p.x
    this.pointer.y = p.y
    this.pointer.mouse = e.pointerType === 'mouse'
    this.pointer.inside = p.x >= 0 && p.y >= 0 && p.x <= p.w && p.y <= p.h && (e.target === this.canvas || !!this.drag)
    this.pointer.nx = (p.x / p.w) * 2 - 1
    this.pointer.ny = (p.y / p.h) * 2 - 1
    if (this.touches.has(e.pointerId)) this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (this.pinch && this.touches.size === 2) {
      const [a, b] = [...this.touches.values()]
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      this.cam.radius = THREE.MathUtils.clamp((this.pinch.r * this.pinch.d) / Math.max(20, d), 6, 1400)
      this.interacted()
      return
    }
    const d = this.drag
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      d.x = e.clientX
      d.y = e.clientY
      d.moved += Math.abs(dx) + Math.abs(dy)
      if (d.moved > 5) {
        const k = 0.0052
        this.cam.theta -= dx * k
        this.cam.phi = THREE.MathUtils.clamp(this.cam.phi - dy * k, 0.12, Math.PI - 0.12)
        this.vel.theta = -dx * k
        this.vel.phi = -dy * k
        this.interacted()
      }
    }
  }

  private onUp = (e: PointerEvent) => {
    this.touches.delete(e.pointerId)
    if (this.pinch && this.touches.size < 2) {
      this.pinch = null
      // o dedo que sobrou continua girando, sem virar um toque
      const rest = [...this.touches.entries()][0]
      if (rest) this.drag = { id: rest[0], x: rest[1].x, y: rest[1].y, t: 0, moved: 999 }
      return
    }
    const d = this.drag
    if (!d || d.id !== e.pointerId) return
    this.drag = null
    this.canvas.style.cursor = this.hovered ? 'pointer' : 'grab'
    const quick = performance.now() - d.t < 600
    if (d.moved > 8 || !quick) return
    const p = this.local(e)
    if (p.x < 0 || p.y < 0 || p.x > p.w || p.y > p.h) return
    const touch = e.pointerType !== 'mouse'
    const id = this.pick(p.x, p.y, touch ? 30 : 18)
    if (id) return this.ev.click(id)
    const g = this.pickGalaxy(p.x, p.y)
    if (g) return this.ev.clickGalaxy(g)
    this.ev.clickEmpty()
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY
    this.cam.radius = THREE.MathUtils.clamp(this.cam.radius * Math.exp(THREE.MathUtils.clamp(delta, -120, 120) * 0.0011), 6, 1400)
    this.interacted()
  }

  private interacted() {
    this.lastInteract = performance.now()
    const f = this.flight
    if (f) {
      this.flight = null
      this.ev.flight({ phase: 'cancel', dest: f.dest, duration: 0, distance: f.distance, token: f.token })
    }
    this.ev.interact()
  }

  /** nó mais próximo do ponto na tela */
  pick(x: number, y: number, radius: number) {
    let best: string | null = null
    let bd = radius * radius
    for (let i = 0; i < IDEIAS.length; i++) {
      if (this.sd[i] <= 0 || this.presence[i] < 0.5 || this.dim[i] < 0.08) continue
      const dx = this.sx[i] - x
      const dy = this.sy[i] - y
      const d = dx * dx + dy * dy
      if (d < bd) {
        bd = d
        best = IDEIAS[i].id
      }
    }
    return best
  }

  private pickGalaxy(x: number, y: number): GalaxiaId | null {
    if (this.cam.radius < 140) return null
    let best: GalaxiaId | null = null
    let bd = 70 * 70
    for (let g = 0; g < this.frames.length; g++) {
      if (this.gsd[g] <= 0) continue
      const d = (this.gsx[g] - x) ** 2 + (this.gsy[g] - y) ** 2
      if (d < bd) {
        bd = d
        best = this.frames[g].id
      }
    }
    return best
  }

  private setHovered(id: string | null) {
    if (id === this.hovered) return
    this.hovered = id
    if (!this.drag) this.canvas.style.cursor = id ? 'pointer' : 'grab'
    this.ev.hover(id)
    this.applyHighlight()
  }

  labelsOn = true
  setLabelsOn(v: boolean) {
    this.labelsOn = v
  }

  /** a interface acende uma ideia (por exemplo, com o cursor sobre um botão do painel) */
  hoverExterno(id: string | null) {
    if (this.pointer.inside && this.pointer.mouse && !id) return
    this.setHovered(id)
  }

  /** posição atual de uma ideia na tela (para a interface ancorar coisas nela) */
  screenOf(id: string) {
    const i = INDEX.get(id)
    if (i === undefined || this.sd[i] <= 0) return null
    return { x: this.sx[i], y: this.sy[i] }
  }

  // ——— laço principal

  resize = () => {
    const c = this.canvas
    this.W = c.clientWidth || window.innerWidth
    this.H = c.clientHeight || window.innerHeight
    this.dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.5 : 2)
    this.renderer.setPixelRatio(this.dpr)
    this.renderer.setSize(this.W, this.H, false)
    this.camera.aspect = this.W / this.H
    this.updateProjection()
    for (const m of [this.dustMat, this.nodeMat, this.edgeMat, this.starMat]) m.uniforms.uPixelRatio.value = this.dpr
    ;(this.edgeMat.uniforms.uResolution.value as THREE.Vector2).set(this.W * this.dpr, this.H * this.dpr)
  }

  private updateProjection() {
    const ix = (this.inset.right - this.inset.left) / 2
    const iy = (this.inset.bottom - this.inset.top) / 2
    if (Math.abs(ix) > 0.5 || Math.abs(iy) > 0.5) this.camera.setViewOffset(this.W, this.H, ix, iy, this.W, this.H)
    else this.camera.clearViewOffset()
    this.camera.updateProjectionMatrix()
    const scale = this.H / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    for (const m of [this.dustMat, this.nodeMat, this.edgeMat]) m.uniforms.uScale.value = scale
    this.starMat.uniforms.uScale.value = scale * 0.6
  }

  private frame = (now: number) => {
    if (this.disposed || this.paused) return
    this.raf = requestAnimationFrame(this.frame)
    const dt = Math.min((now - this.last) / 1000, 0.05)
    this.last = now
    const time = this.reduced ? 0 : (now - this.clockStart) / 1000
    this.dustMat.uniforms.uTime.value = time

    // câmera
    this.stepFlight(now)
    if (!this.flight) {
      if (!this.drag) {
        // inércia medida em quadros de 60 Hz, para girar igual em qualquer aparelho
        const f = dt * 60
        this.cam.theta += this.vel.theta * f
        this.cam.phi = THREE.MathUtils.clamp(this.cam.phi + this.vel.phi * f, 0.12, Math.PI - 0.12)
        const amort = Math.pow(0.92, f)
        this.vel.theta *= amort
        this.vel.phi *= amort
      }
      const idle = now - this.lastInteract > 6000
      if (idle && !this.reduced && !this.drag && !this.hi.path) this.cam.theta += dt * (this.cam.radius > 200 ? 0.022 : 0.012)
      if (Math.abs(this.camera.fov - FOV) > 0.01) this.camera.fov += (FOV - this.camera.fov) * ease(dt, 7)
      else this.camera.fov = FOV
    }
    const k = this.reduced ? 1 : ease(dt, 5)
    this.inset.top += (this.insetT.top - this.inset.top) * k
    this.inset.right += (this.insetT.right - this.inset.right) * k
    this.inset.bottom += (this.insetT.bottom - this.inset.bottom) * k
    this.inset.left += (this.insetT.left - this.inset.left) * k
    this.updateProjection()

    const px = this.pointer.inside && this.pointer.mouse ? this.pointer.nx : 0
    const py = this.pointer.inside && this.pointer.mouse ? this.pointer.ny : 0
    const kp = ease(dt, 2.4)
    this.parallax.x += (px - this.parallax.x) * kp
    this.parallax.y += (py - this.parallax.y) * kp
    this.applyCamera()
    this.sky.position.copy(this.camera.position)
    this.stars.position.copy(this.camera.position)

    // lente do cursor
    const lensOn = this.pointer.inside && this.pointer.mouse && !this.drag && !this.flight && !this.reduced ? 1 : 0
    this.mouseOn += (lensOn - this.mouseOn) * ease(dt, 5)
    const mx = this.pointer.nx
    const my = -this.pointer.ny
    const km = ease(dt, 12)
    this.mouseNdc.x += (mx - this.mouseNdc.x) * km
    this.mouseNdc.y += (my - this.mouseNdc.y) * km
    this.dustMat.uniforms.uMouseOn.value = this.mouseOn

    const r = this.cam.radius
    this.dustMat.uniforms.uFogNear.value = r * 1.25 + 60
    this.dustMat.uniforms.uFogFar.value = r * 3.4 + 420

    // a galáxia em foco tinge o céu e muda a interface
    let near: GalaxiaId | null = null
    if (r < 175) {
      let bd = 48 * 48
      for (const f of this.frames) {
        const d = f.center.distanceToSquared(this.cam.target)
        if (d < bd) {
          bd = d
          near = f.id
        }
      }
    }
    if (near !== this.active) {
      this.active = near
      this.ev.activeGalaxy(near)
      this.tintT.set(near ? this.framesById.get(near)!.color : '#000000')
    }
    this.tint.lerp(this.tintT, ease(dt, 2))

    this.animateNodes(dt)
    this.animateEdges(dt)
    const decai = Math.exp(-dt * 2.2)
    const kg = this.reduced ? 1 : ease(dt, 3.5)
    for (let g = 0; g < 10; g++) {
      this.galAlpha[g] += (this.galAlphaT[g] - this.galAlpha[g]) * kg
      this.galPulse[g] *= decai
      this.galAlphaU[g] = this.galAlpha[g] * (1 + this.galPulse[g] * 0.9)
    }

    this.project()
    if (!this.drag && !this.pinch && this.pointer.inside && this.pointer.mouse && !this.flight) {
      this.setHovered(this.pick(this.pointer.x, this.pointer.y, 16))
    } else if (this.flight && this.hovered) this.setHovered(null)
    this.layoutLabels()
    this.renderer.render(this.scene, this.camera)
  }

  private animateNodes(dt: number) {
    if (!this.nodeDirty) return
    let moving = false
    const kp = this.reduced ? 1 : Math.min(1, dt * 3.2)
    const kd = this.reduced ? 1 : Math.min(1, dt * 6)
    for (let i = 0; i < IDEIAS.length; i++) {
      const p = this.presence[i]
      const pt = this.presenceT[i]
      if (Math.abs(pt - p) > 0.002) {
        this.presence[i] = pt > p ? Math.min(pt, p + kp * 0.9) : Math.max(pt, p - kp * 1.6)
        moving = true
      } else this.presence[i] = pt
      if (this.birth[i] > 0) {
        this.birth[i] += dt * 0.9
        if (this.birth[i] >= 1) this.birth[i] = 0
        moving = true
      }
      const d = this.dim[i]
      const dtg = this.dimT[i]
      if (Math.abs(dtg - d) > 0.002) {
        this.dim[i] = d + (dtg - d) * kd
        moving = true
      } else this.dim[i] = dtg
    }
    for (const n of ['aPresence', 'aDim', 'aBirth']) (this.nodeGeo.getAttribute(n) as THREE.BufferAttribute).needsUpdate = true
    this.nodeDirty = moving
  }

  private animateEdges(dt: number) {
    if (!this.edgeDirty) return
    const E = ARESTAS.length
    const aA = this.edgeGeo.getAttribute('aAlpha') as THREE.BufferAttribute
    const aW = this.edgeGeo.getAttribute('aWidth') as THREE.BufferAttribute
    const aR = this.edgeGeo.getAttribute('aReveal') as THREE.BufferAttribute
    const A = aA.array as Float32Array
    const Wd = aW.array as Float32Array
    const Rv = aR.array as Float32Array
    const k = this.reduced ? 1 : Math.min(1, dt * 5)
    let moving = false
    for (let e = 0; e < E; e++) {
      let ch = false
      const a = this.eAlpha[e]
      const at = this.eAlphaT[e]
      if (a !== at) {
        this.eAlpha[e] = Math.abs(at - a) > 0.002 ? a + (at - a) * k : at
        ch = true
      }
      const w = this.eWidth[e]
      const wt = this.eWidthT[e]
      if (w !== wt) {
        this.eWidth[e] = Math.abs(wt - w) > 0.01 ? w + (wt - w) * k : wt
        ch = true
      }
      const rv = this.eReveal[e]
      const rt = this.eRevealT[e]
      if (rv !== rt) {
        this.eReveal[e] = this.reduced ? rt : rt > rv ? Math.min(rt, rv + dt * 1.1) : Math.max(rt, rv - dt * 3)
        ch = true
      }
      if (ch) {
        moving = true
        const o = e * K * 2
        A.fill(this.eAlpha[e], o, o + K * 2)
        Wd.fill(this.eWidth[e], o, o + K * 2)
        Rv.fill(this.eReveal[e], o, o + K * 2)
      }
    }
    aA.needsUpdate = aW.needsUpdate = aR.needsUpdate = true
    this.edgeDirty = moving
  }

  private v = new THREE.Vector3()
  private vz = new THREE.Vector3()
  private project() {
    const cam = this.camera
    cam.updateMatrixWorld()
    for (let i = 0; i < IDEIAS.length; i++) {
      this.vz.copy(this.pos[i]).applyMatrix4(cam.matrixWorldInverse)
      if (this.vz.z > -0.5) {
        this.sd[i] = -1
        continue
      }
      this.v.copy(this.pos[i]).project(cam)
      this.sx[i] = (this.v.x * 0.5 + 0.5) * this.W
      this.sy[i] = (-this.v.y * 0.5 + 0.5) * this.H
      this.sd[i] = -this.vz.z
    }
    for (let g = 0; g < this.frames.length; g++) {
      const f = this.frames[g]
      this.vz.copy(f.center).applyMatrix4(cam.matrixWorldInverse)
      if (this.vz.z > -1) {
        this.gsd[g] = -1
        continue
      }
      this.v.copy(f.center).project(cam)
      this.gsx[g] = (this.v.x * 0.5 + 0.5) * this.W
      this.gsy[g] = (-this.v.y * 0.5 + 0.5) * this.H
      this.gsd[g] = -this.vz.z
    }
  }

  private rects: number[] = []
  private collides(x: number, y: number, w: number, h: number) {
    const r = this.rects
    for (let k = 0; k < r.length; k += 4) if (x < r[k + 2] && x + w > r[k] && y < r[k + 3] && y + h > r[k + 1]) return true
    return false
  }
  private boosted = new Map<string, number>()
  private cand: { i: number; score: number }[] = []
  private layoutLabels() {
    const r = this.cam.radius
    const { selected, hits, path } = this.hi
    const boosted = this.boosted
    boosted.clear()
    if (path) path.forEach((id) => boosted.set(id, 1e5))
    hits.forEach((id) => boosted.set(id, Math.max(boosted.get(id) ?? 0, 5e4)))
    if (selected) {
      boosted.set(selected, 1e6)
      VIZINHOS.get(selected)!.forEach((v) => boosted.set(v, Math.max(boosted.get(v) ?? 0, 2e4)))
    }
    if (this.hovered) boosted.set(this.hovered, 2e6)
    const far = r > 230
    const cand = this.cand
    cand.length = 0
    for (let i = 0; i < IDEIAS.length; i++) {
      if (this.sd[i] <= 0 || this.presence[i] < 0.6) continue
      const x = this.sx[i]
      const y = this.sy[i]
      if (x < -40 || y < -20 || x > this.W + 40 || y > this.H + 20) continue
      const b = boosted.get(IDEIAS[i].id) ?? 0
      if (far && b === 0) continue
      if (this.dim[i] < 0.3 && b === 0) continue
      cand.push({ i, score: b + ((GRAU.get(IDEIAS[i].id)! + 3) * 400) / this.sd[i] })
    }
    cand.sort((a, b) => b.score - a.score)
    this.rects.length = 0
    let used = 0
    for (const c of cand) {
      if (used >= this.labels.length) break
      const idea = IDEIAS[c.i]
      const b = boosted.get(idea.id) ?? 0
      const strong = b >= 2e4
      const w = idea.t.length * 7.2 + (strong ? idea.quando.length * 6 + 26 : 20)
      const h = 22
      const off = b >= 1e6 ? 22 : 10
      const y = this.sy[c.i] - h / 2
      let x = this.sx[c.i] + off
      if (this.collides(x, y, w, h)) {
        const esquerda = this.sx[c.i] - off - w
        if (!this.collides(esquerda, y, w, h)) x = esquerda
        else if (b < 1e6) continue
      }
      this.rects.push(x, y, x + w, y + h)
      const el = this.labels[used]
      if (this.labelText[used] !== idea.id) {
        this.labelText[used] = idea.id
        ;(el.children[0] as HTMLElement).textContent = idea.t
        ;(el.children[1] as HTMLElement).textContent = idea.quando
        el.style.setProperty('--c', GALAXIAS[this.framesById.get(idea.g)!.index].cor)
      }
      el.dataset.strong = strong ? '1' : '0'
      el.dataset.hover = idea.id === this.hovered ? '1' : '0'
      el.style.opacity = String(Math.min(1, this.dim[c.i] * 1.2) * Math.min(1, this.presence[c.i]))
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      used++
    }
    for (let k = used; k < this.labels.length; k++) {
      if (this.labels[k].style.opacity !== '0') this.labels[k].style.opacity = '0'
    }
    // nomes das galáxias aparecem de longe
    const ga = this.labelsOn ? THREE.MathUtils.clamp((r - 120) / 90, 0, 1) : 0
    for (let g = 0; g < this.galLabels.length; g++) {
      const el = this.galLabels[g]
      const vis = this.gsd[g] > 0 && ga > 0.01
      const op = vis ? (ga * (0.35 + 0.65 * this.galAlpha[g])).toFixed(3) : '0'
      if (el.style.opacity !== op) el.style.opacity = op
      el.style.pointerEvents = vis && ga > 0.5 ? 'auto' : 'none'
      if (vis) el.style.transform = `translate3d(${this.gsx[g].toFixed(1)}px, ${(this.gsy[g] + 30).toFixed(1)}px, 0) translateX(-50%)`
    }
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerup', this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
    window.removeEventListener('resize', this.resize)
    document.removeEventListener('visibilitychange', this.onVisibility)
    this.canvas.removeEventListener('pointerdown', this.onDown)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.canvas.removeEventListener('pointerleave', this.onLeave)
    this.labels.forEach((l) => l.remove())
    this.galLabels.forEach((l) => l.remove())
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      ;(m.material as THREE.Material | undefined)?.dispose?.()
    })
    this.renderer.dispose()
  }
}
