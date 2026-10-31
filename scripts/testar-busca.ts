import { buscar, caminho, sentido, BY_ID, anoParaPos, posParaAno } from '../src/data/graph'
for (const q of ['internet', 'einstein', 'dna', '1947', 'ia', 'santos dumont', 'vacina', 'curie', 'eletricidade', 'chatgpt']) {
  console.log(q.padEnd(14), buscar(q, 4).map((r) => BY_ID.get(r.id)!.t + (r.motivo ? ` [${r.motivo}]` : '')).join(' | '))
}
for (const [a, b] of [['escrita', 'internet'], ['zero', 'ia_generativa'], ['fogo', 'lua'], ['roda', 'smartphone'], ['agricultura', 'crispr']]) {
  const p = caminho(a, b)!
  console.log(`${a} → ${b}:`, p.map((x, i) => (i ? (sentido(p[i - 1], x) === 'levou' ? ' → ' : ' ← ') : '') + BY_ID.get(x)!.t).join(''))
}
console.log([-400000, -10000, 0, 1500, 1900, 2000, 2026].map((y) => `${y}:${anoParaPos(y).toFixed(3)}`).join('  '), posParaAno(0.5), posParaAno(0.9))
