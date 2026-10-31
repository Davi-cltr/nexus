// Confere o grafo: ids únicos, conexões existentes, grafo todo ligado e viagens coerentes.
import { IDEIAS, GALAXIAS, VIAGENS } from '../src/data/ideias'

const erros: string[] = []
const ids = new Set<string>()
for (const i of IDEIAS) {
  if (ids.has(i.id)) erros.push(`id repetido: ${i.id}`)
  ids.add(i.id)
  if (!GALAXIAS.some((g) => g.id === i.g)) erros.push(`galáxia inválida em ${i.id}`)
}
const arestas: [string, string][] = []
for (const i of IDEIAS) for (const v of i.veio ?? []) {
  if (!ids.has(v)) erros.push(`${i.id} veio de id inexistente: ${v}`)
  else arestas.push([v, i.id])
}
// componentes
const adj = new Map<string, Set<string>>()
ids.forEach((id) => adj.set(id, new Set()))
for (const [a, b] of arestas) { adj.get(a)!.add(b); adj.get(b)!.add(a) }
const visto = new Set<string>()
const fila = [IDEIAS[0].id]
visto.add(fila[0])
while (fila.length) { const x = fila.shift()!; for (const y of adj.get(x)!) if (!visto.has(y)) { visto.add(y); fila.push(y) } }
const soltos = [...ids].filter((id) => !visto.has(id))
if (soltos.length) erros.push(`ideias fora do grafo principal: ${soltos.join(', ')}`)
for (const id of ids) if (adj.get(id)!.size === 0) erros.push(`ideia sem nenhuma conexão: ${id}`)
// viagens: passos consecutivos precisam estar conectados
for (const v of VIAGENS) {
  v.passos.forEach((p, k) => {
    if (!ids.has(p.id)) erros.push(`viagem ${v.id}: id inexistente ${p.id}`)
    if (k > 0 && !adj.get(v.passos[k - 1].id)?.has(p.id)) erros.push(`viagem ${v.id}: ${v.passos[k - 1].id} e ${p.id} não estão conectados`)
  })
}
// efeito antes da causa (mais de 5 anos) costuma indicar erro
for (const [a, b] of arestas) {
  const A = IDEIAS.find((i) => i.id === a)!, B = IDEIAS.find((i) => i.id === b)!
  if (A.ano > B.ano + 5) erros.push(`causa depois do efeito: ${a} (${A.ano}) -> ${b} (${B.ano})`)
}
const porGal = Object.fromEntries(GALAXIAS.map((g) => [g.nome, IDEIAS.filter((i) => i.g === g.id).length]))
console.log(`ideias: ${ids.size}, conexões: ${arestas.length}`)
console.log(porGal)
if (erros.length) { console.log('ERROS:\n' + erros.join('\n')); process.exit(1) } else console.log('ok, grafo válido')
