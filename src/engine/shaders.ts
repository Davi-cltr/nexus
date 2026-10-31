// Shaders do Nexus. Tudo é aditivo (brilho soma com brilho), sem pós-processamento.

const fog = /* glsl */ `
uniform float uFogNear;
uniform float uFogFar;
float fogAt(float depth) { return 1.0 - smoothstep(uFogNear, uFogFar, depth); }
`

/** poeira das galáxias e estrelas de fundo */
export const dustVertex = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
attribute float aGal;
uniform float uTime;
uniform float uPixelRatio;
uniform float uScale;
uniform float uGalAlpha[10];
uniform float uMaxSize;
uniform vec2 uMouse;      // cursor em coordenadas de tela normalizadas (-1..1)
uniform float uMouseOn;   // 0 no toque, 1 com mouse
uniform float uLens;      // força da lente
uniform vec2 uResolution;
varying vec3 vColor;
varying float vAlpha;
${fog}
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec4 clip = projectionMatrix * mv;
  float depth = -mv.z;
  // lente gravitacional: as partículas perto do cursor se afastam e acendem
  float lens = 0.0;
  if (clip.w > 0.01 && uMouseOn > 0.001) {
    vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
    vec2 ndc = clip.xy / clip.w;
    vec2 dd = (ndc - uMouse) * aspect;
    float dist = length(dd);
    lens = uMouseOn * smoothstep(0.34, 0.0, dist);
    ndc += (dd / max(dist, 1e-4)) / aspect * lens * lens * uLens;
    clip.xy = ndc * clip.w;
  }
  gl_Position = clip;
  float tw = 0.72 + 0.28 * sin(uTime * (0.5 + aSeed * 1.8) + aSeed * 50.0);
  gl_PointSize = clamp(aSize * uPixelRatio * uScale / depth, 0.0, uMaxSize * uPixelRatio) * (1.0 + lens * 0.6);
  vAlpha = tw * fogAt(depth) * uGalAlpha[int(aGal + 0.5)] * smoothstep(1.5, 9.0, depth) * (1.0 + lens * 1.8);
  vColor = mix(aColor, vec3(1.0), lens * 0.35);
}
`

export const dustFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  float a = exp(-d * 3.2) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(vColor, a);
}
`

/**
 * Núcleos das galáxias e nuvens de gás. São quadrados voltados para a câmera
 * (e não pontos), para não sumirem de repente quando o centro sai da tela.
 */
export const glowVertex = /* glsl */ `
attribute vec3 iPos;
attribute vec3 iColor;
attribute float iSize;
attribute float iAlpha;
attribute float iCore;
attribute float iGal;
uniform float uGalAlpha[10];
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vCore;
${fog}
void main() {
  vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
  float depth = -mv.z;
  mv.xy += position.xy * iSize;
  gl_Position = projectionMatrix * mv;
  vUv = position.xy * 2.0;
  // perto demais da câmera, a nuvem some em vez de virar uma mancha na tela
  float near = iCore > 0.5 ? smoothstep(iSize * 0.7, iSize * 2.4, depth) : smoothstep(iSize * 0.35, iSize * 1.2, depth);
  vAlpha = iAlpha * fogAt(depth) * near * uGalAlpha[int(iGal + 0.5)];
  vColor = iColor;
  vCore = iCore;
}
`

export const glowFragment = /* glsl */ `
varying vec2 vUv;
varying vec3 vColor;
varying float vAlpha;
varying float vCore;
void main() {
  float d = dot(vUv, vUv);
  if (d > 1.0) discard;
  float edge = 1.0 - d;
  float hot = vCore * exp(-d * 70.0) * 0.75;
  float body = exp(-d * (vCore > 0.5 ? 9.0 : 3.2)) * edge;
  float a = (body * 0.85 + hot) * vAlpha;
  if (a < 0.002) discard;
  gl_FragColor = vec4(mix(vColor, vec3(1.0), min(1.0, hot * 1.4)), a);
}
`

/** céu: manchas de cor muito suaves e uma faixa leitosa; segue a câmera */
export const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const skyFragment = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uTint;
uniform float uTintAmt;
varying vec3 vDir;
float blob(vec3 d, vec3 axis, float k) { return pow(0.5 + 0.5 * dot(d, axis), k); }
void main() {
  vec3 d = normalize(vDir);
  vec3 col = uBase;
  col += vec3(0.10, 0.15, 0.42) * blob(d, normalize(vec3(0.6, 0.3, -0.7)), 6.0) * 0.16;
  col += vec3(0.32, 0.12, 0.42) * blob(d, normalize(vec3(-0.7, -0.2, 0.5)), 5.0) * 0.13;
  col += vec3(0.06, 0.30, 0.36) * blob(d, normalize(vec3(0.1, -0.8, 0.4)), 7.0) * 0.10;
  vec3 bn = normalize(vec3(0.25, 1.0, 0.18));
  float band = exp(-pow(dot(d, bn), 2.0) * 24.0);
  float wav = 0.55 + 0.45 * sin(d.x * 7.0 + d.z * 5.0) * sin(d.y * 9.0 - d.x * 4.0);
  col += vec3(0.42, 0.40, 0.52) * band * wav * 0.06;
  col += uTint * uTintAmt * (0.6 + 0.4 * d.y);
  // pontilhado mínimo para o degradê não formar faixas
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

/** estrelas-ideia: núcleo, halo, anel de seleção e anel de nascimento */
export const nodeVertex = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
attribute float aPresence;
attribute float aEmph;
attribute float aDim;
attribute float aBirth;
uniform float uPixelRatio;
uniform float uScale;
uniform float uTime;
varying vec3 vColor;
varying float vAlpha;
varying float vEmph;
varying float vBirth;
varying float vK;
${fog}
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = -mv.z;
  float p = aPresence;
  // aparece com um leve exagero (easeOutBack)
  float pop = p <= 0.0 ? 0.0 : 1.0 + 2.7 * pow(p - 1.0, 3.0) + 1.7 * pow(p - 1.0, 2.0);
  float base = aSize * (1.0 + aEmph * 0.45) * uScale / depth;
  base = clamp(base, 5.0 + aEmph * 4.0, 26.0 + aEmph * 12.0);
  float pulse = aEmph > 1.5 ? 1.0 + 0.08 * sin(uTime * 3.0) : 1.0;
  vK = 1.0 + aBirth * 2.4;
  gl_PointSize = min(base * pop * pulse * vK, 220.0) * uPixelRatio;
  vColor = aColor;
  vAlpha = aDim * fogAt(depth) * min(1.0, p * 1.5);
  vEmph = aEmph;
  vBirth = aBirth;
}
`

export const nodeFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vEmph;
varying float vBirth;
varying float vK;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  float dc = d * vK;
  float core = smoothstep(0.32, 0.04, dc);
  float halo = exp(-dc * dc * 4.0) * 0.7;
  float ring = vEmph > 0.5 ? smoothstep(0.07, 0.0, abs(dc - 0.8)) * (vEmph > 1.5 ? 1.0 : 0.6) : 0.0;
  float birth = vBirth > 0.001 ? smoothstep(0.06, 0.0, abs(d - vBirth)) * (1.0 - vBirth) : 0.0;
  vec3 col = vColor * (halo + ring + birth) + mix(vColor, vec3(1.0), 0.75) * core;
  float a = (halo + core + ring + birth) * vAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, min(a, 1.0));
}
`

/**
 * Conexões: fitas com largura em pixels, voltadas para a câmera.
 * Os pulsos correm da causa para a consequência (ou no sentido do caminho).
 */
export const edgeVertex = /* glsl */ `
attribute vec3 aPrev;
attribute vec3 aNext;
attribute float aSide;
attribute float aT;
attribute float aLen;
attribute vec3 aColor;
attribute float aAlpha;
attribute float aWidth;
attribute float aFlow;
attribute float aSpeed;
attribute float aReveal;
uniform vec2 uResolution;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vAlpha;
varying float vSide;
varying float vDist;
varying float vFlow;
varying float vSpeed;
varying float vT;
varying float vReveal;
${fog}
void main() {
  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 cur = mvp * vec4(position, 1.0);
  vec4 prv = mvp * vec4(aPrev, 1.0);
  vec4 nxt = mvp * vec4(aNext, 1.0);
  float ok = step(0.01, cur.w) * step(0.01, prv.w) * step(0.01, nxt.w);
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 sc = cur.xy / max(cur.w, 0.01) * aspect;
  vec2 sp = prv.xy / max(prv.w, 0.01) * aspect;
  vec2 sn = nxt.xy / max(nxt.w, 0.01) * aspect;
  vec2 d1 = sn - sc;
  vec2 d0 = sc - sp;
  vec2 dir = length(d1) > 1e-6 ? normalize(d1) : vec2(1.0, 0.0);
  if (length(d0) > 1e-6 && length(d1) > 1e-6) dir = normalize(normalize(d0) + normalize(d1));
  else if (length(d0) > 1e-6) dir = normalize(d0);
  vec2 nrm = vec2(-dir.y, dir.x);
  nrm.x /= aspect.x;
  float w = aWidth * uPixelRatio;
  cur.xy += nrm * aSide * (w / uResolution.y) * cur.w;
  gl_Position = cur;
  float depth = cur.w;
  vColor = aColor;
  vAlpha = aAlpha * fogAt(depth) * ok;
  vSide = aSide;
  vDist = aT * aLen;
  vT = aT;
  vFlow = aFlow;
  vSpeed = aSpeed;
  vReveal = aReveal;
}
`

export const edgeFragment = /* glsl */ `
uniform float uTime;
uniform float uSpacing;
varying vec3 vColor;
varying float vAlpha;
varying float vSide;
varying float vDist;
varying float vFlow;
varying float vSpeed;
varying float vT;
varying float vReveal;
void main() {
  float t = vFlow >= 0.0 ? vT : 1.0 - vT;
  if (t > vReveal) discard;
  float soft = 1.0 - abs(vSide);
  soft = soft * soft * (3.0 - 2.0 * soft);
  float along = vFlow >= 0.0 ? vDist : -vDist;
  float ph = fract(along / uSpacing - uTime * vSpeed * 0.35);
  float pulse = smoothstep(0.0, 0.05, ph) * smoothstep(0.2, 0.05, ph);
  // ponta acesa enquanto a conexão está sendo desenhada
  float head = vReveal < 0.999 ? smoothstep(0.08, 0.0, vReveal - t) : 0.0;
  vec3 col = vColor * (0.6 + pulse * 1.5) + vec3(1.0) * head * 0.6;
  float a = vAlpha * soft * (0.5 + pulse * 0.9 + head);
  if (a < 0.003) discard;
  gl_FragColor = vec4(col, min(a, 1.0));
}
`
