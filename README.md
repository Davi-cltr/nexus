# Nexus

Um universo 3D interativo com as ideias que mudaram o mundo. Cada estrela é uma descoberta, uma invenção ou uma teoria; cada linha mostra o que uma ideia tornou possível. Em vez de abrir uma página comum, o visitante entra num ambiente tridimensional e navega por ele.

**Site:** https://davi-cltr.github.io/nexus/

## O que dá para fazer

- **Explorar o universo.** Nove galáxias (Matemática, Física, Cosmos, Vida, Saúde, Energia, Comunicação, Computação e Sociedade) com 180 ideias e 293 conexões de causa e consequência. Arraste para girar, role ou use dois dedos para aproximar. O universo reage ao cursor: a câmera acompanha o movimento e a poeira estelar se abre em volta dele.
- **Abrir uma ideia.** Clique numa estrela: a câmera voa até ela, as conexões se acendem com pulsos que correm da causa para a consequência, e o painel mostra data, autoria, descrição, de onde a ideia veio e o que ela gerou.
- **Entrar numa galáxia.** Cada galáxia abre um painel com suas ideias em ordem de data, as mais conectadas e as galáxias vizinhas. A interface inteira (cor de destaque, céu, título e som) muda conforme a região explorada.
- **Buscar.** Procure por nome, pessoa, ano ou assunto (por exemplo: "Einstein", "1969", "eletricidade"). Os resultados e as conexões entre eles se acendem no universo, e a câmera os enquadra.
- **Conectar duas ideias.** Escolha duas ideias e veja a corrente de causas e consequências que liga uma à outra (da escrita à internet, do zero à IA generativa). O caminho pode ser percorrido como uma viagem.
- **Viagens guiadas.** Quatro roteiros narrados, com voos de câmera e faixas de cinema: da faísca ao smartphone, do zero à inteligência artificial, do microscópio à vacina de mRNA e do fogo à Lua.
- **Linha do tempo.** Volte a qualquer ano (em escala logarítmica, de 400 mil anos atrás até hoje) ou reproduza a história: as ideias nascem com um anel de luz e as galáxias se acendem à medida que se enchem.
- **Compartilhar.** Cada ideia tem um endereço próprio (por exemplo, `#penicilina`), e cada galáxia também (`#g-computacao`).

## Celular, teclado e acessibilidade

- Versão para celular com painéis em folha inferior, toque para abrir e pinça para aproximar.
- Atalhos: `/` ou `Ctrl+K` busca, `Esc` volta um nível, `←` e `→` passam para a ideia anterior ou seguinte (ou para a parada seguinte de uma viagem), `+` e `-` aproximam, `Home` volta à visão geral.
- **Lista** mostra todo o conteúdo em forma de lista, para navegar pelo teclado ou por leitor de tela. Ela também aparece sozinha se o navegador não conseguir abrir o 3D.
- Respeita a preferência de movimento reduzido do sistema (sem voos, giros ou brilho piscando).
- Som opcional, sintetizado na hora (nenhum arquivo de áudio): cada galáxia tem um acorde próprio.

## Como rodar

```bash
npm install
npm run dev       # servidor de desenvolvimento
npm run validar   # confere o grafo de ideias
npm run build     # versão final em dist/
```

## Tecnologia

React 19, TypeScript, Vite, Tailwind CSS 4, Motion e three.js com shaders próprios (poeira das galáxias, estrelas-ideia, conexões em fita com pulsos, céu). O som usa a Web Audio API. As fontes são Fraunces e Geist.

Estrutura principal:

- `src/data/ideias.ts`: as ideias, galáxias e viagens guiadas.
- `src/data/graph.ts`: conexões, busca e cálculo de caminhos entre ideias.
- `src/engine/`: o universo 3D (posições, shaders, câmera, voos e rótulos).
- `src/state/`: estado da interface e ações.
- `src/components/`: abertura, barra superior, painéis, busca, linha do tempo e viagens.
- `scripts/validar.ts`: verifica se todas as conexões existem, se o grafo é conectado e se nenhuma causa é posterior à sua consequência.

## Sobre os dados

O conteúdo foi escrito para este projeto. As datas de ideias muito antigas são aproximadas e indicadas como tal. As conexões representam influências diretas e conhecidas, não todas as possíveis.

## Publicação

O deploy é feito pelo GitHub Actions a cada envio para a branch `main`. Para ativar, em **Settings > Pages**, escolha **Source: GitHub Actions**.
