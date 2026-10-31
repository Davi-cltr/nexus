// Posições do universo, sempre iguais (gerador pseudoaleatório com semente).
import * as THREE from 'three'
import { GALAXIAS, IDEIAS, type GalaxiaId } from '@/data/ideias'
import { ARESTAS, BY_ID } from '@/data/graph'

export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const gauss = (r: () => number) => {
  const u = Math.max(1e-9, r())
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r())
}

export interface GalaxyFrame {
  id: GalaxiaId
  index: number
  center: THREE.Vector3
  normal: THREE.Vector3
  basis: THREE.Matrix4 // gira o plano local (y para cima) para o plano da galáxia
  color: THREE.Color
  radius: number
}

export const GALAXY_RADIUS = 30

/** centros das galáxias: força de mola proporcional ao número de conexões entre elas */
function galaxyCenters() {
  const G = GALAXIAS.length
  const gi = new Map(GALAXIAS.map((g, i) => [g.id, i]))
  const w = Array.from({ length: G }, () => new Array(G).fill(0))
  for (const { a, b } of ARESTAS) {
    const x = gi.get(BY_ID.get(a)!.g)!
    const y = gi.get(BY_ID.get(b)!.g)!
    if (x !== y) {
      w[x][y]++
      w[y][x]++
    }
  }
  const r = rng(7)
  const p = GALAXIAS.map((_, i) => {
    const ang = (i / G) * Math.PI * 2
    return new THREE.Vector3(Math.cos(ang) * 130, (r() - 0.5) * 60, Math.sin(ang) * 130)
  })
  const v = p.map(() => new THREE.Vector3())
  const d = new THREE.Vector3()
  for (let it = 0; it < 700; it++) {
    const f = p.map(() => new THREE.Vector3())
    for (let i = 0; i < G; i++)
      for (let j = i + 1; j < G; j++) {
        d.subVectors(p[j], p[i])
        const dist = Math.max(1, d.length())
        d.divideScalar(dist)
        const rep = 26000 / (dist * dist)
        f[i].addScaledVector(d, -rep)
        f[j].addScaledVector(d, rep)
        if (w[i][j]) {
          const alvo = Math.max(92, 165 - w[i][j] * 5)
          const k = 0.012 * (dist - alvo)
          f[i].addScaledVector(d, k)
          f[j].addScaledVector(d, -k)
        }
      }
    for (let i = 0; i < G; i++) {
      f[i].addScaledVector(p[i], -0.004)
      v[i].add(f[i]).multiplyScalar(0.82)
      p[i].add(v[i])
    }
  }
  const c = p.reduce((acc, x) => acc.add(x), new THREE.Vector3()).divideScalar(G)
  return p.map((x) => {
    const y = x.clone().sub(c)
    y.y *= 0.55 // universo mais achatado: fica legível de longe
    return y
  })
}

export function buildFrames(): GalaxyFrame[] {
  const centers = galaxyCenters()
  return GALAXIAS.map((g, i) => {
    const r = rng(101 + i * 17)
    const normal = new THREE.Vector3((r() - 0.5) * 1.1, 1, (r() - 0.5) * 1.1).normalize()
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    const spin = new THREE.Quaternion().setFromAxisAngle(normal, r() * Math.PI * 2)
    const basis = new THREE.Matrix4().makeRotationFromQuaternion(spin.multiply(q))
    return { id: g.id, index: i, center: centers[i], normal, basis, color: new THREE.Color(g.cor), radius: GALAXY_RADIUS }
  })
}

/** cada ideia fica num braço da espiral; quanto mais recente, mais longe do centro */
export function nodePositions(frames: GalaxyFrame[]) {
  const pos = new Map<string, THREE.Vector3>()
  for (const f of frames) {
    const list = IDEIAS.filter((i) => i.g === f.id).sort((a, b) => a.ano - b.ano || a.id.localeCompare(b.id))
    const r = rng(9001 + f.index * 31)
    const n = list.length
    list.forEach((idea, k) => {
      const t = (k + 0.7) / (n + 0.4)
      const arm = k % 2
      const theta = arm * Math.PI + t * 2.25 * Math.PI + (r() - 0.5) * 0.3
      const rad = 4.5 + t * 25 + (r() - 0.5) * 1.6
      const local = new THREE.Vector3(Math.cos(theta) * rad, (r() - 0.5) * 2.2, Math.sin(theta) * rad)
      pos.set(idea.id, local.applyMatrix4(f.basis).add(f.center))
    })
  }
  return pos
}

/** poeira estelar de uma galáxia: dois braços espirais, um núcleo denso e um halo */
export function galaxyDust(f: GalaxyFrame, count: number) {
  const r = rng(555 + f.index * 97)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds = new Float32Array(count)
  const white = new THREE.Color('#fff6ea')
  const tmp = new THREE.Vector3()
  const c = new THREE.Color()
  for (let i = 0; i < count; i++) {
    const kind = r()
    let rad: number, theta: number, h: number
    if (kind < 0.16) {
      // núcleo
      rad = Math.abs(gauss(r)) * 3.2
      theta = r() * Math.PI * 2
      h = gauss(r) * 1.4
    } else if (kind < 0.26) {
      // halo esparso
      rad = 6 + r() * 30
      theta = r() * Math.PI * 2
      h = gauss(r) * 4
    } else {
      const t = Math.pow(r(), 0.85)
      const arm = r() < 0.5 ? 0 : 1
      theta = arm * Math.PI + t * 2.25 * Math.PI + gauss(r) * (0.28 + t * 0.12)
      rad = 1 + t * 29 + gauss(r) * 1.3
      h = gauss(r) * (0.35 + (1 - t) * 1.3)
    }
    tmp.set(Math.cos(theta) * rad, h, Math.sin(theta) * rad).applyMatrix4(f.basis).add(f.center)
    positions.set([tmp.x, tmp.y, tmp.z], i * 3)
    const near = Math.max(0, 1 - rad / 9)
    c.copy(f.color).lerp(white, near * 0.75 + r() * 0.15)
    c.multiplyScalar(0.55 + r() * 0.6)
    colors.set([c.r, c.g, c.b], i * 3)
    sizes[i] = (kind < 0.16 ? 1.6 : 1) * (0.5 + Math.pow(r(), 3) * 2.6)
    seeds[i] = r()
  }
  return { positions, colors, sizes, seeds }
}

export function backgroundStars(count: number) {
  const r = rng(42)
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const seeds = new Float32Array(count)
  const palette = ['#ffffff', '#cfe0ff', '#ffe9d6', '#e9dcff'].map((h) => new THREE.Color(h))
  for (let i = 0; i < count; i++) {
    const u = r() * 2 - 1
    const th = r() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const R = 900 + r() * 700
    positions.set([Math.cos(th) * s * R, u * R, Math.sin(th) * s * R], i * 3)
    const c = palette[Math.floor(r() * palette.length)].clone().multiplyScalar(0.4 + r() * 0.6)
    colors.set([c.r, c.g, c.b], i * 3)
    sizes[i] = 0.6 + Math.pow(r(), 6) * 3
    seeds[i] = r()
  }
  return { positions, colors, sizes, seeds }
}
