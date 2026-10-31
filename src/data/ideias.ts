// O grafo do Nexus: ideias que mudaram o mundo e as conexões entre elas.
// "veio" lista as ideias que levaram a esta (a conexão é desenhada da causa para a consequência).
// Datas aproximadas quando indicado; "ano" serve para ordenar e para a linha do tempo.

export type GalaxiaId =
  | 'matematica'
  | 'fisica'
  | 'cosmos'
  | 'vida'
  | 'saude'
  | 'energia'
  | 'comunicacao'
  | 'computacao'
  | 'sociedade'

export interface Galaxia {
  id: GalaxiaId
  nome: string
  titulo: string
  cor: string
  frase: string
}

export const GALAXIAS: Galaxia[] = [
  { id: 'matematica', nome: 'Matemática', titulo: 'Galáxia da Matemática', cor: '#9BA8FF', frase: 'A linguagem que as outras ideias usam para se explicar.' },
  { id: 'fisica', nome: 'Física', titulo: 'Galáxia da Física', cor: '#6CC6FF', frase: 'Como a matéria, a luz e a energia se comportam.' },
  { id: 'cosmos', nome: 'Cosmos', titulo: 'Galáxia do Cosmos', cor: '#D49BFF', frase: 'O céu deixou de ser teto e virou destino.' },
  { id: 'vida', nome: 'Vida', titulo: 'Galáxia da Vida', cor: '#6FE0A8', frase: 'Da primeira célula vista ao microscópio ao código genético.' },
  { id: 'saude', nome: 'Saúde', titulo: 'Galáxia da Saúde', cor: '#FF8A80', frase: 'Ideias que fizeram a gente viver mais, e com menos dor.' },
  { id: 'energia', nome: 'Energia', titulo: 'Galáxia da Energia', cor: '#FFB547', frase: 'Fogo, vapor, eletricidade e o que veio depois.' },
  { id: 'comunicacao', nome: 'Comunicação', titulo: 'Galáxia da Comunicação', cor: '#FF8CC6', frase: 'Do barro riscado à rede que liga o planeta.' },
  { id: 'computacao', nome: 'Computação', titulo: 'Galáxia da Computação', cor: '#5FE6D8', frase: 'Máquinas que seguem instruções e, agora, aprendem.' },
  { id: 'sociedade', nome: 'Sociedade', titulo: 'Galáxia da Sociedade', cor: '#D7E36A', frase: 'Os combinados que organizam a vida em grupo.' },
]

export interface Ideia {
  id: string
  t: string
  g: GalaxiaId
  ano: number
  quando: string
  quem: string
  txt: string
  veio?: string[]
  alias?: string[]
}

export const IDEIAS: Ideia[] = [
  // ——— Sociedade
  { id: 'agricultura', t: 'Agricultura', g: 'sociedade', ano: -10000, quando: 'c. 10.000 a.C.', quem: 'Crescente Fértil, no Oriente Médio', txt: 'Plantar e criar animais permitiu ficar num lugar só. Com comida guardada, as aldeias cresceram e o trabalho se dividiu.', alias: ['plantação', 'neolítico'] },
  { id: 'cidades', t: 'Primeiras cidades', g: 'sociedade', ano: -3500, quando: 'c. 3500 a.C.', quem: 'Mesopotâmia', txt: 'Uruk e outras cidades da Mesopotâmia reuniram milhares de pessoas, templos, mercados e administração.', veio: ['agricultura'], alias: ['urbanização', 'Uruk'] },
  { id: 'roda', t: 'Roda', g: 'sociedade', ano: -3500, quando: 'c. 3500 a.C.', quem: 'Mesopotâmia e arredores', txt: 'Primeiro como torno de oleiro, depois em carroças. A roda com eixo mudou o transporte de cargas por milênios.', veio: ['agricultura'] },
  { id: 'leis', t: 'Leis escritas', g: 'sociedade', ano: -1754, quando: 'c. 1754 a.C.', quem: 'Código de Hamurábi, Babilônia', txt: 'Regras gravadas em pedra, iguais para quem as lesse. É um dos códigos de leis mais antigos que conhecemos.', veio: ['escrita', 'cidades'], alias: ['Hamurábi', 'direito'] },
  { id: 'moeda', t: 'Moeda', g: 'sociedade', ano: -600, quando: 'c. 600 a.C.', quem: 'Lídia, na atual Turquia', txt: 'Pedaços de metal com peso e marca garantidos facilitaram as trocas entre desconhecidos.', veio: ['cidades', 'numeracao'], alias: ['dinheiro'] },
  { id: 'democracia', t: 'Democracia', g: 'sociedade', ano: -508, quando: '508 a.C.', quem: 'Atenas', txt: 'Cidadãos votando as decisões da cidade. Excluía mulheres, estrangeiros e escravizados, mas plantou uma ideia que voltaria séculos depois.', veio: ['cidades', 'leis'], alias: ['voto', 'Atenas'] },
  { id: 'universidade', t: 'Universidade', g: 'sociedade', ano: 1088, quando: '1088', quem: 'Bolonha, Itália', txt: 'Uma comunidade de mestres e estudantes com autonomia para ensinar e debater. A de Bolonha é a mais antiga em funcionamento no Ocidente.', veio: ['escrita', 'logica'] },
  { id: 'relogio', t: 'Relógio mecânico', g: 'sociedade', ano: 1300, quando: 'c. 1300', quem: 'Europa', txt: 'Torres com relógios passaram a marcar horas iguais para a cidade inteira. O tempo virou um combinado coletivo.', veio: ['calendario'], alias: ['horas'] },
  { id: 'navegacoes', t: 'Navegação oceânica', g: 'sociedade', ano: 1488, quando: 'séc. XV', quem: 'Portugal e Espanha', txt: 'Bússola, caravelas e cartas náuticas levaram navegadores a cruzar oceanos. Em 1500, a frota de Cabral chegou ao litoral do Brasil.', veio: ['bussola'], alias: ['grandes navegações', 'Cabral', 'caravela'] },
  { id: 'metodo', t: 'Método científico', g: 'sociedade', ano: 1620, quando: '1620', quem: 'Francis Bacon, Galileu e outros', txt: 'Observar, testar e corrigir. A ideia de que o conhecimento vem de experimentos que qualquer pessoa pode repetir.', veio: ['prensa', 'universidade', 'logica'], alias: ['ciência', 'experimento'] },
  { id: 'enciclopedia', t: 'Enciclopédia', g: 'sociedade', ano: 1751, quando: '1751', quem: 'Diderot e d’Alembert, França', txt: 'Reunir todo o saber disponível em volumes acessíveis. Virou símbolo do Iluminismo e da confiança no conhecimento compartilhado.', veio: ['prensa', 'metodo'], alias: ['Iluminismo'] },
  { id: 'sufragio', t: 'Voto das mulheres', g: 'sociedade', ano: 1893, quando: '1893', quem: 'Nova Zelândia', txt: 'O primeiro país a garantir o voto das mulheres em eleições nacionais. No Brasil, o direito veio em 1932.', veio: ['democracia'], alias: ['sufrágio feminino'] },
  { id: 'direitos', t: 'Direitos humanos', g: 'sociedade', ano: 1948, quando: '1948', quem: 'Declaração Universal, ONU', txt: 'Direitos que valem para todas as pessoas, em qualquer país, pelo simples fato de serem humanas.', veio: ['enciclopedia', 'democracia'], alias: ['ONU', 'Declaração Universal'] },
  { id: 'container', t: 'Contêiner', g: 'sociedade', ano: 1956, quando: '1956', quem: 'Malcom McLean, Estados Unidos', txt: 'Uma caixa de tamanho padrão que passa do navio ao caminhão sem ser aberta. Barateou o comércio no mundo inteiro.', veio: ['navegacoes', 'automovel'], alias: ['comércio', 'porto'] },
  { id: 'revolucao_verde', t: 'Revolução Verde', g: 'sociedade', ano: 1960, quando: 'anos 1960', quem: 'Norman Borlaug e outros', txt: 'Sementes melhoradas, adubo e irrigação multiplicaram as colheitas e evitaram fomes em vários países.', veio: ['fertilizante', 'mendel'], alias: ['Borlaug'] },

  // ——— Energia
  { id: 'fogo', t: 'Fogo controlado', g: 'energia', ano: -400000, quando: 'há centenas de milhares de anos', quem: 'Ancestrais humanos', txt: 'Dominar o fogo trouxe calor, proteção e comida cozida, mais fácil de digerir. Foi a primeira grande tecnologia da nossa linhagem.', alias: ['pré-história'] },
  { id: 'bronze', t: 'Metalurgia do bronze', g: 'energia', ano: -3300, quando: 'c. 3300 a.C.', quem: 'Oriente Médio', txt: 'Misturar cobre e estanho deu um metal mais duro para ferramentas e objetos. Começava a Idade do Bronze.', veio: ['fogo'], alias: ['metal', 'Idade do Bronze'] },
  { id: 'ferro', t: 'Ferro', g: 'energia', ano: -1200, quando: 'c. 1200 a.C.', quem: 'Anatólia e Oriente Médio', txt: 'Mais abundante que o cobre, o ferro trabalhado deixou ferramentas e arados ao alcance de muito mais gente.', veio: ['bronze'], alias: ['Idade do Ferro'] },
  { id: 'moinho_agua', t: 'Moinho d’água', g: 'energia', ano: -250, quando: 'séc. III a.C.', quem: 'Mundo grego', txt: 'A força da correnteza girando mós para moer grãos: uma das primeiras máquinas a substituir músculos.', veio: ['roda', 'agricultura'] },
  { id: 'polvora', t: 'Pólvora', g: 'energia', ano: 850, quando: 'séc. IX', quem: 'China', txt: 'Mistura de salitre, enxofre e carvão descoberta por alquimistas chineses. Virou fogos de artifício, armas e, mais tarde, foguetes.', veio: ['fogo'] },
  { id: 'moinho_vento', t: 'Moinho de vento', g: 'energia', ano: 900, quando: 'séc. IX', quem: 'Pérsia', txt: 'Velas giradas pelo vento para moer grãos e bombear água.', veio: ['moinho_agua'], alias: ['vento'] },
  { id: 'vapor', t: 'Máquina a vapor', g: 'energia', ano: 1712, quando: '1712', quem: 'Thomas Newcomen; James Watt aperfeiçoa em 1769', txt: 'Calor virando movimento. Primeiro bombeou água das minas; melhorada, moveu fábricas, trens e navios.', veio: ['ferro', 'fogo'], alias: ['Watt', 'Revolução Industrial', 'trem'] },
  { id: 'fabrica', t: 'Fábrica mecanizada', g: 'energia', ano: 1785, quando: '1785', quem: 'Edmund Cartwright e outros, Inglaterra', txt: 'Teares movidos a máquina concentraram a produção em fábricas. É o coração da Revolução Industrial.', veio: ['vapor', 'moinho_agua'], alias: ['tear', 'indústria'] },
  { id: 'pilha', t: 'Pilha elétrica', g: 'energia', ano: 1800, quando: '1800', quem: 'Alessandro Volta', txt: 'A primeira fonte de corrente elétrica contínua: discos de metal e papel molhado empilhados.', veio: ['metodo'], alias: ['eletricidade', 'bateria', 'Volta'] },
  { id: 'dinamo', t: 'Dínamo', g: 'energia', ano: 1866, quando: '1866', quem: 'Werner von Siemens', txt: 'Uma máquina que transforma giro em eletricidade em grande quantidade. É assim que quase toda a energia elétrica ainda é produzida.', veio: ['inducao'], alias: ['gerador'] },
  { id: 'motor', t: 'Motor a combustão', g: 'energia', ano: 1876, quando: '1876', quem: 'Nikolaus Otto', txt: 'Pequenas explosões de combustível dentro de cilindros. Leve e potente, moveu carros, aviões e máquinas agrícolas.', veio: ['vapor', 'termodinamica'], alias: ['gasolina', 'motor'] },
  { id: 'lampada', t: 'Lâmpada elétrica', g: 'energia', ano: 1879, quando: '1879', quem: 'Thomas Edison e Joseph Swan', txt: 'Luz sem chama, durável e barata o bastante para entrar nas casas.', veio: ['dinamo', 'pilha'], alias: ['luz', 'Edison'] },
  { id: 'rede_eletrica', t: 'Rede elétrica', g: 'energia', ano: 1882, quando: '1882', quem: 'Usina de Pearl Street, Nova York', txt: 'Uma usina central levando eletricidade por fios a vários prédios. O começo das redes que hoje cruzam continentes.', veio: ['lampada', 'dinamo'], alias: ['usina'] },
  { id: 'automovel', t: 'Automóvel', g: 'energia', ano: 1886, quando: '1886', quem: 'Carl Benz', txt: 'Um motor a combustão sobre rodas. Em poucas décadas, redesenhou cidades e estradas.', veio: ['motor', 'roda'], alias: ['carro'] },
  { id: 'aviao', t: 'Avião', g: 'energia', ano: 1903, quando: '1903 e 1906', quem: 'Irmãos Wright; Santos-Dumont', txt: 'Os irmãos Wright voaram em 1903. Em 1906, em Paris, Santos-Dumont fez com o 14-bis o primeiro voo homologado de um avião que decolou por meios próprios.', veio: ['motor'], alias: ['14-bis', 'aviação'] },
  { id: 'fertilizante', t: 'Adubo sintético', g: 'energia', ano: 1909, quando: '1909', quem: 'Fritz Haber e Carl Bosch', txt: 'Tirar nitrogênio do ar para fazer adubo. Hoje, boa parte da comida do mundo depende desse processo.', veio: ['agricultura', 'termodinamica'], alias: ['Haber-Bosch', 'fertilizante'] },
  { id: 'nuclear', t: 'Energia nuclear', g: 'energia', ano: 1942, quando: '1942', quem: 'Enrico Fermi e equipe, Chicago', txt: 'O primeiro reator nuclear controlado. Em 1954, uma usina começou a mandar eletricidade de origem nuclear para a rede.', veio: ['fissao', 'relatividade'], alias: ['reator', 'usina nuclear'] },
  { id: 'solar', t: 'Célula solar', g: 'energia', ano: 1954, quando: '1954', quem: 'Bell Labs', txt: 'Uma placa de silício que transforma luz em eletricidade. Hoje, a energia solar é uma das fontes que mais crescem no mundo.', veio: ['fotoeletrico', 'transistor'], alias: ['painel solar', 'energia solar'] },
  { id: 'litio', t: 'Bateria de íon-lítio', g: 'energia', ano: 1991, quando: '1991', quem: 'Goodenough, Whittingham e Yoshino; lançada pela Sony', txt: 'Leve e recarregável, cabe no bolso e move celulares, notebooks e carros elétricos. Rendeu o Nobel de Química de 2019.', veio: ['pilha'], alias: ['bateria', 'carro elétrico'] },

  // ——— Física
  { id: 'arquimedes', t: 'Princípio de Arquimedes', g: 'fisica', ano: -250, quando: 'c. 250 a.C.', quem: 'Arquimedes de Siracusa', txt: 'Um corpo mergulhado num líquido recebe um empuxo igual ao peso do líquido que desloca. Arquimedes também explicou as alavancas.', veio: ['geometria'], alias: ['empuxo', 'alavanca', 'eureka'] },
  { id: 'optica', t: 'Óptica', g: 'fisica', ano: 1021, quando: 'c. 1021', quem: 'Ibn al-Haytham', txt: 'O Livro da Óptica explicou que enxergamos porque a luz entra nos olhos, e testou as ideias com experimentos.', veio: ['geometria'], alias: ['luz', 'lente', 'Alhazen'] },
  { id: 'bussola', t: 'Bússola', g: 'fisica', ano: 1088, quando: 'séc. XI', quem: 'China', txt: 'Uma agulha magnetizada que aponta o norte. Guiou navegantes por mares sem nenhuma referência à vista.', alias: ['magnetismo', 'ímã'] },
  { id: 'newton', t: 'Leis de Newton', g: 'fisica', ano: 1687, quando: '1687', quem: 'Isaac Newton', txt: 'Três leis do movimento e a gravitação universal: a mesma força que derruba a maçã mantém a Lua em órbita.', veio: ['kepler', 'calculo'], alias: ['gravidade', 'gravitação', 'Principia'] },
  { id: 'cronometro', t: 'Cronômetro marítimo', g: 'fisica', ano: 1761, quando: '1761', quem: 'John Harrison', txt: 'Um relógio preciso mesmo no balanço do navio permitiu calcular a longitude. Navegar ficou muito mais seguro.', veio: ['relogio', 'navegacoes'], alias: ['longitude'] },
  { id: 'termodinamica', t: 'Termodinâmica', g: 'fisica', ano: 1824, quando: '1824', quem: 'Sadi Carnot e outros', txt: 'As regras do calor e do trabalho. Explicaram o limite das máquinas a vapor e por que a energia sempre se dispersa.', veio: ['vapor'], alias: ['calor', 'entropia'] },
  { id: 'inducao', t: 'Indução eletromagnética', g: 'fisica', ano: 1831, quando: '1831', quem: 'Michael Faraday', txt: 'Um ímã em movimento cria corrente elétrica num fio. Eletricidade e magnetismo eram dois lados da mesma coisa.', veio: ['pilha', 'bussola'], alias: ['Faraday', 'eletromagnetismo'] },
  { id: 'maxwell', t: 'Equações de Maxwell', g: 'fisica', ano: 1865, quando: '1865', quem: 'James Clerk Maxwell', txt: 'Quatro equações unem eletricidade, magnetismo e luz. Previram ondas invisíveis que logo virariam rádio.', veio: ['inducao', 'calculo'], alias: ['ondas eletromagnéticas'] },
  { id: 'raiosx', t: 'Raios X', g: 'fisica', ano: 1895, quando: '1895', quem: 'Wilhelm Röntgen', txt: 'Uma radiação que atravessa o corpo e revela os ossos. Em poucas semanas, médicos já a usavam.', veio: ['maxwell'], alias: ['Röntgen', 'radiação'] },
  { id: 'radioatividade', t: 'Radioatividade', g: 'fisica', ano: 1896, quando: '1896', quem: 'Henri Becquerel, Marie e Pierre Curie', txt: 'Certos átomos emitem energia sozinhos. Marie Curie ganhou dois prêmios Nobel estudando o fenômeno.', veio: ['raiosx'], alias: ['Curie', 'urânio'] },
  { id: 'eletron', t: 'Elétron', g: 'fisica', ano: 1897, quando: '1897', quem: 'J. J. Thomson', txt: 'A primeira partícula menor que o átomo. Toda a eletrônica é, no fundo, o controle do movimento de elétrons.', veio: ['maxwell'], alias: ['partícula'] },
  { id: 'quantum', t: 'Quantum de energia', g: 'fisica', ano: 1900, quando: '1900', quem: 'Max Planck', txt: 'A energia vem em pacotes, e não num fluxo contínuo. Foi a primeira pista da física quântica.', veio: ['termodinamica'], alias: ['Planck'] },
  { id: 'fotoeletrico', t: 'Efeito fotoelétrico', g: 'fisica', ano: 1905, quando: '1905', quem: 'Albert Einstein', txt: 'A luz arranca elétrons de metais como se fosse feita de partículas. Rendeu a Einstein o Nobel de 1921.', veio: ['quantum', 'eletron'], alias: ['fóton'] },
  { id: 'relatividade', t: 'Relatividade', g: 'fisica', ano: 1905, quando: '1905 e 1915', quem: 'Albert Einstein', txt: 'Tempo e espaço mudam com a velocidade e com a gravidade, e massa é energia: E = mc².', veio: ['maxwell', 'newton'], alias: ['Einstein', 'E=mc2', 'espaço-tempo'] },
  { id: 'atomo', t: 'Núcleo atômico', g: 'fisica', ano: 1911, quando: '1911', quem: 'Ernest Rutherford', txt: 'O átomo é quase todo vazio, com um núcleo minúsculo e denso no centro.', veio: ['radioatividade', 'eletron'], alias: ['átomo', 'Rutherford'] },
  { id: 'quantica', t: 'Mecânica quântica', g: 'fisica', ano: 1925, quando: '1925', quem: 'Werner Heisenberg, Erwin Schrödinger e outros', txt: 'A física do muito pequeno, feita de probabilidades. Parece estranha, mas é a teoria mais bem testada que existe.', veio: ['quantum', 'fotoeletrico', 'atomo', 'probabilidade'], alias: ['física quântica', 'Schrödinger'] },
  { id: 'fissao', t: 'Fissão nuclear', g: 'fisica', ano: 1938, quando: '1938', quem: 'Otto Hahn, Fritz Strassmann, Lise Meitner e Otto Frisch', txt: 'Um núcleo de urânio se parte em dois e libera uma quantidade enorme de energia.', veio: ['atomo', 'radioatividade'], alias: ['urânio', 'Meitner'] },
  { id: 'relogio_atomico', t: 'Relógio atômico', g: 'fisica', ano: 1955, quando: '1955', quem: 'Louis Essen e Jack Parry', txt: 'Medir o tempo pela vibração dos átomos de césio. Os modelos atuais erram menos de um segundo em milhões de anos.', veio: ['quantica', 'relogio'], alias: ['césio', 'tempo'] },
  { id: 'laser', t: 'Laser', g: 'fisica', ano: 1960, quando: '1960', quem: 'Theodore Maiman', txt: 'Luz de uma só cor concentrada num feixe. Hoje está em cirurgias, leitores, fibras ópticas e medições.', veio: ['quantica'] },
  { id: 'higgs', t: 'Bóson de Higgs', g: 'fisica', ano: 2012, quando: '2012', quem: 'CERN', txt: 'A partícula ligada à origem da massa foi detectada no maior acelerador do mundo, quase 50 anos depois de prevista.', veio: ['quantica', 'relatividade'], alias: ['LHC', 'acelerador'] },

  // ——— Cosmos
  { id: 'calendario', t: 'Calendário solar', g: 'cosmos', ano: -2500, quando: '3º milênio a.C.', quem: 'Egito antigo', txt: 'Um ano de 365 dias, ligado às cheias do Nilo, organizou o plantio e a vida religiosa.', veio: ['agricultura'], alias: ['ano', 'Egito'] },
  { id: 'heliocentrismo', t: 'Heliocentrismo', g: 'cosmos', ano: 1543, quando: '1543', quem: 'Nicolau Copérnico', txt: 'A Terra gira em torno do Sol, e não o contrário. A ideia tirou a humanidade do centro do universo.', veio: ['geometria', 'calendario'], alias: ['Copérnico', 'Sol'] },
  { id: 'telescopio', t: 'Telescópio', g: 'cosmos', ano: 1608, quando: '1608', quem: 'Hans Lipperhey; Galileu Galilei em 1609', txt: 'Lentes que aproximam o que está longe. Galileu apontou um para o céu e viu luas em Júpiter e montanhas na Lua.', veio: ['optica'], alias: ['Galileu', 'luneta'] },
  { id: 'kepler', t: 'Leis de Kepler', g: 'cosmos', ano: 1609, quando: '1609', quem: 'Johannes Kepler', txt: 'Os planetas giram em elipses, não em círculos, e andam mais rápido quando estão perto do Sol.', veio: ['heliocentrismo'], alias: ['órbita', 'planetas'] },
  { id: 'galaxias', t: 'Outras galáxias', g: 'cosmos', ano: 1924, quando: '1924', quem: 'Edwin Hubble', txt: 'Manchas no céu que pareciam nuvens eram galáxias inteiras, fora da Via Láctea. O universo ficou imensamente maior.', veio: ['telescopio'], alias: ['Hubble', 'Via Láctea', 'Andrômeda'] },
  { id: 'foguete', t: 'Foguete a combustível líquido', g: 'cosmos', ano: 1926, quando: '1926', quem: 'Robert Goddard', txt: 'O primeiro foguete a combustível líquido subiu 12 metros. Foi o começo da tecnologia que levaria gente ao espaço.', veio: ['polvora', 'newton'], alias: ['foguete'] },
  { id: 'bigbang', t: 'Big Bang', g: 'cosmos', ano: 1927, quando: '1927', quem: 'Georges Lemaître', txt: 'Se o universo está se expandindo, um dia ele foi muito pequeno e quente. Em 1929, Hubble mediu a expansão.', veio: ['relatividade', 'galaxias'], alias: ['origem do universo', 'expansão'] },
  { id: 'sputnik', t: 'Satélite artificial', g: 'cosmos', ano: 1957, quando: '1957', quem: 'Sputnik 1, União Soviética', txt: 'Uma esfera de 58 centímetros dando a volta na Terra a cada 96 minutos. Começava a era espacial.', veio: ['foguete'], alias: ['Sputnik', 'satélite'] },
  { id: 'gagarin', t: 'Primeiro humano no espaço', g: 'cosmos', ano: 1961, quando: '1961', quem: 'Iuri Gagarin', txt: 'Uma volta completa na Terra em 108 minutos, a bordo da Vostok 1.', veio: ['sputnik'], alias: ['astronauta', 'cosmonauta'] },
  { id: 'radiacao_fundo', t: 'Radiação cósmica de fundo', g: 'cosmos', ano: 1965, quando: '1965', quem: 'Arno Penzias e Robert Wilson', txt: 'Um chiado vindo de todas as direções do céu: o brilho que sobrou do Big Bang.', veio: ['bigbang', 'radio'] },
  { id: 'lua', t: 'Pouso na Lua', g: 'cosmos', ano: 1969, quando: '1969', quem: 'Apollo 11', txt: 'Neil Armstrong e Buzz Aldrin caminharam na Lua enquanto Michael Collins orbitava em volta dela.', veio: ['gagarin', 'circuito_integrado'], alias: ['Apollo', 'Armstrong', 'NASA'] },
  { id: 'gps', t: 'GPS', g: 'cosmos', ano: 1978, quando: '1978 a 1995', quem: 'Departamento de Defesa dos Estados Unidos', txt: 'Satélites com relógios atômicos transmitem a hora certa. Comparando os sinais, um receptor descobre onde está.', veio: ['sputnik', 'relogio_atomico', 'relatividade'], alias: ['localização', 'mapa'] },
  { id: 'hubble', t: 'Telescópio Espacial Hubble', g: 'cosmos', ano: 1990, quando: '1990', quem: 'NASA e ESA', txt: 'Um telescópio acima da atmosfera, sem distorção. Ajudou a medir a idade do universo.', veio: ['telescopio', 'sputnik'] },
  { id: 'exoplaneta', t: 'Exoplanetas', g: 'cosmos', ano: 1995, quando: '1995', quem: 'Michel Mayor e Didier Queloz', txt: 'O primeiro planeta encontrado em volta de outra estrela parecida com o Sol. Hoje já são milhares.', veio: ['telescopio'], alias: ['planetas'] },
  { id: 'ondas_gravitacionais', t: 'Ondas gravitacionais', g: 'cosmos', ano: 2015, quando: '2015', quem: 'LIGO', txt: 'Ondulações no espaço-tempo, previstas por Einstein, captadas na colisão de dois buracos negros.', veio: ['relatividade', 'laser'], alias: ['LIGO'] },
  { id: 'buraco_negro', t: 'Imagem de um buraco negro', g: 'cosmos', ano: 2019, quando: '2019', quem: 'Event Horizon Telescope', txt: 'Radiotelescópios do mundo inteiro, combinados, fotografaram a sombra do buraco negro da galáxia M87.', veio: ['relatividade', 'radio'], alias: ['M87'] },
  { id: 'webb', t: 'Telescópio James Webb', g: 'cosmos', ano: 2021, quando: '2021', quem: 'NASA, ESA e CSA', txt: 'Um espelho de 6,5 metros que enxerga no infravermelho e observa galáxias formadas pouco depois do Big Bang.', veio: ['hubble'], alias: ['JWST'] },

  // ——— Vida
  { id: 'microscopio', t: 'Microscópio', g: 'vida', ano: 1590, quando: 'c. 1590', quem: 'Fabricantes de lentes da Holanda', txt: 'Lentes combinadas revelaram um mundo pequeno demais para o olho nu.', veio: ['optica'] },
  { id: 'celula', t: 'Célula', g: 'vida', ano: 1665, quando: '1665', quem: 'Robert Hooke', txt: 'Olhando cortiça ao microscópio, Hooke viu pequenas cavidades e as chamou de células.', veio: ['microscopio'], alias: ['Hooke'] },
  { id: 'microbios', t: 'Micróbios', g: 'vida', ano: 1676, quando: '1676', quem: 'Antonie van Leeuwenhoek', txt: 'Gotas de água cheias de seres vivos minúsculos. Ninguém sabia que eles existiam.', veio: ['microscopio'], alias: ['bactérias', 'microrganismos'] },
  { id: 'lineu', t: 'Classificação dos seres vivos', g: 'vida', ano: 1735, quando: '1735', quem: 'Carlos Lineu', txt: 'Gênero e espécie: o sistema de nomes científicos usado até hoje, como Homo sapiens.', veio: ['metodo'], alias: ['taxonomia', 'espécie'] },
  { id: 'fotossintese', t: 'Fotossíntese', g: 'vida', ano: 1779, quando: '1779', quem: 'Jan Ingenhousz', txt: 'As plantas precisam de luz para renovar o ar. É a base de quase toda a cadeia alimentar.', veio: ['metodo'], alias: ['plantas', 'oxigênio'] },
  { id: 'teoria_celular', t: 'Teoria celular', g: 'vida', ano: 1839, quando: '1839', quem: 'Matthias Schleiden e Theodor Schwann', txt: 'Todo ser vivo é feito de células. Mais tarde se somou: toda célula vem de outra célula.', veio: ['celula', 'microscopio'] },
  { id: 'evolucao', t: 'Evolução por seleção natural', g: 'vida', ano: 1859, quando: '1859', quem: 'Charles Darwin e Alfred Russel Wallace', txt: 'As espécies mudam ao longo das gerações, porque quem se adapta melhor deixa mais descendentes.', veio: ['lineu', 'navegacoes'], alias: ['Darwin', 'seleção natural'] },
  { id: 'mendel', t: 'Leis da hereditariedade', g: 'vida', ano: 1865, quando: '1865', quem: 'Gregor Mendel', txt: 'Cruzando ervilhas, Mendel mostrou que as características passam de pais para filhos em unidades, que hoje chamamos de genes.', veio: ['probabilidade'], alias: ['genética', 'genes', 'herança'] },
  { id: 'dna', t: 'Dupla hélice do DNA', g: 'vida', ano: 1953, quando: '1953', quem: 'Rosalind Franklin, James Watson, Francis Crick e Maurice Wilkins', txt: 'A molécula da herança tem a forma de uma escada torcida, e a sequência dos degraus guarda a informação.', veio: ['mendel', 'raiosx', 'teoria_celular'], alias: ['Watson', 'Crick', 'Franklin'] },
  { id: 'codigo_genetico', t: 'Código genético', g: 'vida', ano: 1961, quando: '1961 a 1966', quem: 'Marshall Nirenberg e outros', txt: 'Cada trio de letras do DNA corresponde a um aminoácido. A célula lê os genes como um manual de montagem de proteínas.', veio: ['dna'], alias: ['proteína', 'RNA'] },
  { id: 'engenharia_genetica', t: 'Engenharia genética', g: 'vida', ano: 1973, quando: '1973', quem: 'Stanley Cohen e Herbert Boyer', txt: 'Recortar e colar DNA entre organismos. Em 1978, bactérias passaram a fabricar insulina humana.', veio: ['codigo_genetico'], alias: ['DNA recombinante', 'transgênico'] },
  { id: 'sequenciamento', t: 'Sequenciamento de DNA', g: 'vida', ano: 1977, quando: '1977', quem: 'Frederick Sanger', txt: 'Um método para ler a ordem exata das letras do DNA.', veio: ['dna'] },
  { id: 'pcr', t: 'PCR', g: 'vida', ano: 1983, quando: '1983', quem: 'Kary Mullis', txt: 'Copiar um trecho de DNA milhões de vezes em poucas horas. Usado em diagnósticos, perícias e pesquisas.', veio: ['dna'], alias: ['teste de PCR'] },
  { id: 'clonagem', t: 'Clonagem de um mamífero', g: 'vida', ano: 1996, quando: '1996', quem: 'Ovelha Dolly, Escócia', txt: 'O primeiro mamífero clonado a partir de uma célula adulta.', veio: ['teoria_celular', 'engenharia_genetica'], alias: ['Dolly'] },
  { id: 'genoma', t: 'Genoma humano', g: 'vida', ano: 2003, quando: '2003', quem: 'Projeto Genoma Humano', txt: 'As cerca de 3 bilhões de letras do DNA humano, lidas por um consórcio internacional.', veio: ['sequenciamento', 'pcr'], alias: ['genoma'] },
  { id: 'crispr', t: 'CRISPR', g: 'vida', ano: 2012, quando: '2012', quem: 'Jennifer Doudna e Emmanuelle Charpentier', txt: 'Uma tesoura molecular que corta o DNA em pontos escolhidos. Rendeu o Nobel de Química de 2020.', veio: ['engenharia_genetica', 'genoma'], alias: ['edição genética'] },

  // ——— Saúde
  { id: 'hipocrates', t: 'Medicina hipocrática', g: 'saude', ano: -400, quando: 'c. 400 a.C.', quem: 'Hipócrates e seguidores, Grécia', txt: 'Doenças têm causas naturais, e não divinas. Observar o paciente com atenção virou método.', veio: ['escrita'], alias: ['Hipócrates', 'medicina'] },
  { id: 'anatomia', t: 'Anatomia moderna', g: 'saude', ano: 1543, quando: '1543', quem: 'Andreas Vesalius', txt: 'Um atlas do corpo humano baseado em dissecações, corrigindo erros que vinham da Antiguidade.', veio: ['hipocrates', 'prensa'], alias: ['Vesalius', 'corpo humano'] },
  { id: 'circulacao', t: 'Circulação do sangue', g: 'saude', ano: 1628, quando: '1628', quem: 'William Harvey', txt: 'O coração bombeia o sangue num circuito fechado pelo corpo.', veio: ['anatomia'], alias: ['coração', 'Harvey'] },
  { id: 'vacina', t: 'Vacina', g: 'saude', ano: 1796, quando: '1796', quem: 'Edward Jenner', txt: 'Material da varíola bovina protegia contra a varíola humana. A palavra vacina vem de vaca, em latim.', veio: ['metodo'], alias: ['Jenner', 'imunização'] },
  { id: 'anestesia', t: 'Anestesia', g: 'saude', ano: 1846, quando: '1846', quem: 'William Morton, Boston', txt: 'Uma cirurgia sem dor, com éter, feita diante de uma plateia de médicos. Operar deixou de ser um suplício.', veio: ['metodo'], alias: ['éter', 'cirurgia'] },
  { id: 'teoria_microbiana', t: 'Teoria microbiana', g: 'saude', ano: 1864, quando: 'anos 1860', quem: 'Louis Pasteur e Robert Koch', txt: 'Muitas doenças são causadas por micróbios. A ideia mudou a higiene, a cirurgia e a saúde pública.', veio: ['microbios', 'metodo'], alias: ['Pasteur', 'Koch', 'germes'] },
  { id: 'antissepsia', t: 'Antissepsia', g: 'saude', ano: 1867, quando: '1867', quem: 'Joseph Lister', txt: 'Limpar instrumentos e feridas com antisséptico derrubou as mortes depois das cirurgias.', veio: ['teoria_microbiana'], alias: ['Lister', 'higiene'] },
  { id: 'radiografia', t: 'Radiografia', g: 'saude', ano: 1896, quando: '1896', quem: 'Hospitais de vários países', txt: 'Poucas semanas depois da descoberta dos raios X, eles já eram usados para achar fraturas e projéteis.', veio: ['raiosx'], alias: ['raio-x'] },
  { id: 'grupos_sanguineos', t: 'Grupos sanguíneos', g: 'saude', ano: 1901, quando: '1901', quem: 'Karl Landsteiner', txt: 'A, B e O: saber o tipo de sangue tornou as transfusões seguras.', veio: ['circulacao'], alias: ['transfusão', 'tipo sanguíneo'] },
  { id: 'insulina', t: 'Insulina', g: 'saude', ano: 1922, quando: '1922', quem: 'Frederick Banting, Charles Best e equipe', txt: 'Um hormônio extraído do pâncreas transformou o diabetes tipo 1 de sentença em doença tratável.', veio: ['anatomia'], alias: ['diabetes'] },
  { id: 'penicilina', t: 'Penicilina', g: 'saude', ano: 1928, quando: '1928', quem: 'Alexander Fleming', txt: 'Um mofo que matava bactérias. Produzida em massa nos anos 1940, abriu a era dos antibióticos.', veio: ['teoria_microbiana'], alias: ['antibiótico', 'Fleming'] },
  { id: 'transplante', t: 'Transplante de órgãos', g: 'saude', ano: 1954, quando: '1954', quem: 'Joseph Murray, Boston', txt: 'O primeiro transplante de rim bem-sucedido, entre gêmeos idênticos. O de coração veio em 1967.', veio: ['anestesia', 'antissepsia', 'grupos_sanguineos'], alias: ['rim', 'coração'] },
  { id: 'pilula', t: 'Pílula anticoncepcional', g: 'saude', ano: 1960, quando: '1960', quem: 'Gregory Pincus, John Rock e outros', txt: 'Controle da gravidez por via oral, com efeitos profundos na vida das mulheres e no tamanho das famílias.', veio: ['insulina'], alias: ['contracepção', 'hormônio'] },
  { id: 'tomografia', t: 'Tomografia computadorizada', g: 'saude', ano: 1971, quando: '1971', quem: 'Godfrey Hounsfield', txt: 'Raios X em várias direções, combinados por computador, mostram o corpo em fatias.', veio: ['radiografia', 'eniac'], alias: ['tomógrafo'] },
  { id: 'ressonancia', t: 'Ressonância magnética', g: 'saude', ano: 1977, quando: '1977', quem: 'Raymond Damadian, Paul Lauterbur, Peter Mansfield e outros', txt: 'Imagens detalhadas do corpo feitas com ímãs fortes e ondas de rádio, sem radiação ionizante.', veio: ['quantica', 'eniac'], alias: ['MRI'] },
  { id: 'variola', t: 'Fim da varíola', g: 'saude', ano: 1980, quando: '1980', quem: 'Organização Mundial da Saúde', txt: 'A primeira doença humana erradicada no mundo, graças a uma campanha global de vacinação.', veio: ['vacina'], alias: ['erradicação', 'OMS'] },
  { id: 'mrna', t: 'Vacinas de mRNA', g: 'saude', ano: 2020, quando: '2020', quem: 'Katalin Karikó, Drew Weissman e outros', txt: 'Em vez do vírus, a vacina leva a receita de uma proteína dele. Foi decisiva contra a covid-19.', veio: ['vacina', 'codigo_genetico', 'engenharia_genetica'], alias: ['covid', 'Karikó'] },

  // ——— Matemática
  { id: 'numeracao', t: 'Números escritos', g: 'matematica', ano: -3200, quando: 'c. 3200 a.C.', quem: 'Mesopotâmia', txt: 'Marcas em tábuas de argila para contar grãos e animais. Os sumérios contavam em base 60, e por isso a hora tem 60 minutos.', veio: ['agricultura'], alias: ['contagem', 'base 60'] },
  { id: 'logica', t: 'Lógica', g: 'matematica', ano: -350, quando: 'séc. IV a.C.', quem: 'Aristóteles', txt: 'Regras para tirar conclusões válidas a partir de premissas. Ficou como referência por mais de 2 mil anos.', veio: ['democracia'], alias: ['Aristóteles', 'silogismo'] },
  { id: 'geometria', t: 'Geometria de Euclides', g: 'matematica', ano: -300, quando: 'c. 300 a.C.', quem: 'Euclides de Alexandria', txt: 'Os Elementos provaram tudo a partir de poucas regras básicas. Foi livro de estudo por mais de 2 mil anos.', veio: ['numeracao', 'logica'], alias: ['Euclides', 'Elementos'] },
  { id: 'zero', t: 'Zero', g: 'matematica', ano: 628, quando: '628', quem: 'Brahmagupta, Índia', txt: 'O zero como número, com regras para somar e multiplicar. Antes, ele era só um espaço vazio.', veio: ['numeracao'], alias: ['Brahmagupta', 'Índia'] },
  { id: 'algebra', t: 'Álgebra', g: 'matematica', ano: 820, quando: 'c. 820', quem: 'Muhammad al-Khwarizmi, Bagdá', txt: 'Resolver equações com regras gerais. O nome vem de al-jabr, palavra do título do seu livro.', veio: ['algarismos', 'geometria'], alias: ['equação', 'al-Khwarizmi'] },
  { id: 'algarismos', t: 'Algarismos indo-arábicos', g: 'matematica', ano: 825, quando: 'c. 825', quem: 'Índia, divulgados por al-Khwarizmi', txt: 'Dez símbolos e o valor dado pela posição. Chegaram à Europa e se espalharam a partir de 1202, com Fibonacci.', veio: ['zero'], alias: ['números', 'Fibonacci', 'decimal'] },
  { id: 'logaritmos', t: 'Logaritmos', g: 'matematica', ano: 1614, quando: '1614', quem: 'John Napier', txt: 'Transformar multiplicações em somas. Acelerou os cálculos de astrônomos e navegadores.', veio: ['algebra'] },
  { id: 'geometria_analitica', t: 'Geometria analítica', g: 'matematica', ano: 1637, quando: '1637', quem: 'René Descartes', txt: 'Pontos viram pares de números e curvas viram equações: nasce o plano cartesiano.', veio: ['algebra', 'geometria'], alias: ['Descartes', 'plano cartesiano', 'gráfico'] },
  { id: 'probabilidade', t: 'Probabilidade', g: 'matematica', ano: 1654, quando: '1654', quem: 'Blaise Pascal e Pierre de Fermat', txt: 'Cartas trocadas sobre jogos de azar fundaram a matemática do acaso.', veio: ['algebra'], alias: ['acaso', 'chance'] },
  { id: 'calculo', t: 'Cálculo', g: 'matematica', ano: 1670, quando: 'c. 1670', quem: 'Isaac Newton e Gottfried Leibniz', txt: 'A matemática da mudança: velocidades, áreas e curvas. É a base da física e da engenharia.', veio: ['geometria_analitica'], alias: ['derivada', 'integral'] },
  { id: 'binario', t: 'Sistema binário', g: 'matematica', ano: 1703, quando: '1703', quem: 'Gottfried Leibniz', txt: 'Todos os números escritos só com 0 e 1.', veio: ['algarismos'], alias: ['bit', 'zero e um'] },
  { id: 'estatistica', t: 'Estatística', g: 'matematica', ano: 1805, quando: 'início do séc. XIX', quem: 'Adrien-Marie Legendre, Carl Friedrich Gauss e outros', txt: 'Tirar conclusões de dados com margem de erro. A curva em forma de sino aparece em quase tudo.', veio: ['probabilidade'], alias: ['curva normal', 'Gauss', 'dados'] },
  { id: 'boole', t: 'Lógica booleana', g: 'matematica', ano: 1854, quando: '1854', quem: 'George Boole', txt: 'O raciocínio virou álgebra de verdadeiro e falso. Quase um século depois, isso viraria a base dos circuitos digitais.', veio: ['logica', 'algebra'], alias: ['Boole', 'verdadeiro e falso'] },
  { id: 'conjuntos', t: 'Teoria dos conjuntos', g: 'matematica', ano: 1874, quando: '1874', quem: 'Georg Cantor', txt: 'Existem infinitos de tamanhos diferentes. A ideia virou alicerce de toda a matemática moderna.', veio: ['calculo'], alias: ['infinito', 'Cantor'] },
  { id: 'incompletude', t: 'Teoremas da incompletude', g: 'matematica', ano: 1931, quando: '1931', quem: 'Kurt Gödel', txt: 'Em qualquer sistema matemático rico o bastante, há verdades que não podem ser provadas dentro dele.', veio: ['conjuntos', 'logica'], alias: ['Gödel'] },
  { id: 'teoria_jogos', t: 'Teoria dos jogos', g: 'matematica', ano: 1944, quando: '1944', quem: 'John von Neumann e Oskar Morgenstern', txt: 'A matemática das decisões estratégicas, quando o resultado depende também da escolha dos outros.', veio: ['probabilidade'], alias: ['estratégia', 'Nash'] },
  { id: 'teoria_informacao', t: 'Teoria da informação', g: 'matematica', ano: 1948, quando: '1948', quem: 'Claude Shannon', txt: 'Informação medida em bits. Mostrou quanto dá para comprimir uma mensagem e transmiti-la sem erro.', veio: ['probabilidade', 'boole', 'telefone'], alias: ['Shannon', 'bit'] },

  // ——— Comunicação
  { id: 'escrita', t: 'Escrita', g: 'comunicacao', ano: -3200, quando: 'c. 3200 a.C.', quem: 'Suméria, Mesopotâmia', txt: 'Sinais em tábuas de argila, primeiro para contas, depois para leis, cartas e histórias.', veio: ['cidades', 'numeracao'], alias: ['cuneiforme'] },
  { id: 'alfabeto', t: 'Alfabeto', g: 'comunicacao', ano: -1050, quando: 'c. 1050 a.C.', quem: 'Fenícios', txt: 'Poucos sinais, um para cada som. Deu origem aos alfabetos grego, latino e a muitos outros.', veio: ['escrita'], alias: ['letras', 'fenício'] },
  { id: 'papel', t: 'Papel', g: 'comunicacao', ano: 105, quando: '105', quem: 'Cai Lun, China', txt: 'Fibras vegetais prensadas numa folha barata e leve. Levou séculos para chegar à Europa.', veio: ['escrita'] },
  { id: 'notacao', t: 'Notação musical', g: 'comunicacao', ano: 1025, quando: 'c. 1025', quem: 'Guido d’Arezzo', txt: 'Linhas para a altura das notas e nomes para cantá-las. A música passou a ser lida, e não só decorada.', veio: ['escrita'], alias: ['partitura', 'música', 'dó ré mi'] },
  { id: 'perspectiva', t: 'Perspectiva', g: 'comunicacao', ano: 1415, quando: 'c. 1415', quem: 'Filippo Brunelleschi', txt: 'Regras geométricas para pintar profundidade numa superfície plana.', veio: ['geometria', 'optica'], alias: ['pintura', 'Renascimento', 'arte'] },
  { id: 'prensa', t: 'Prensa de tipos móveis', g: 'comunicacao', ano: 1440, quando: 'c. 1440', quem: 'Johannes Gutenberg', txt: 'Letras de metal reutilizáveis numa prensa. Livros ficaram baratos e as ideias passaram a circular rápido. Na China, Bi Sheng já usava tipos móveis por volta de 1040.', veio: ['papel', 'alfabeto'], alias: ['Gutenberg', 'imprensa', 'livro'] },
  { id: 'jornal', t: 'Jornal impresso', g: 'comunicacao', ano: 1605, quando: '1605', quem: 'Estrasburgo', txt: 'Notícias periódicas impressas e vendidas. Nascia a imprensa.', veio: ['prensa'], alias: ['notícias'] },
  { id: 'fotografia', t: 'Fotografia', g: 'comunicacao', ano: 1826, quando: '1826', quem: 'Nicéphore Niépce; daguerreótipo em 1839', txt: 'Fixar a imagem de uma câmera escura numa superfície sensível à luz.', veio: ['optica', 'perspectiva'], alias: ['foto', 'câmera'] },
  { id: 'telegrafo', t: 'Telégrafo elétrico', g: 'comunicacao', ano: 1837, quando: '1837', quem: 'Samuel Morse; Cooke e Wheatstone', txt: 'Pulsos elétricos por fio, em código. Pela primeira vez, uma mensagem viajava mais rápido que um cavalo.', veio: ['pilha', 'inducao', 'alfabeto'], alias: ['código Morse', 'Morse'] },
  { id: 'telefone', t: 'Telefone', g: 'comunicacao', ano: 1876, quando: '1876', quem: 'Alexander Graham Bell', txt: 'A voz convertida em corrente elétrica e de volta em som. Dom Pedro II viu uma demonstração naquele mesmo ano.', veio: ['telegrafo'], alias: ['Bell'] },
  { id: 'fonografo', t: 'Gravação de som', g: 'comunicacao', ano: 1877, quando: '1877', quem: 'Thomas Edison', txt: 'O fonógrafo gravava e reproduzia a voz. A música passou a existir fora do palco.', veio: ['telefone', 'notacao'], alias: ['fonógrafo', 'disco'] },
  { id: 'radio', t: 'Rádio', g: 'comunicacao', ano: 1895, quando: '1895', quem: 'Guglielmo Marconi; no Brasil, o padre Landell de Moura', txt: 'Mensagens sem fio, levadas pelas ondas que Maxwell tinha previsto.', veio: ['maxwell', 'telegrafo'], alias: ['Marconi', 'Landell de Moura', 'sem fio'] },
  { id: 'cinema', t: 'Cinema', g: 'comunicacao', ano: 1895, quando: '1895', quem: 'Irmãos Lumière', txt: 'Fotografias em sequência projetadas para uma plateia, criando a ilusão de movimento.', veio: ['fotografia'], alias: ['filme', 'Lumière'] },
  { id: 'televisao', t: 'Televisão', g: 'comunicacao', ano: 1927, quando: '1927', quem: 'Philo Farnsworth; John Logie Baird', txt: 'Imagens em movimento transmitidas pelo ar e recebidas em casa.', veio: ['radio', 'cinema', 'eletron'], alias: ['TV'] },
  { id: 'satelite_com', t: 'Satélite de comunicação', g: 'comunicacao', ano: 1962, quando: '1962', quem: 'Telstar', txt: 'Transmissões de TV ao vivo entre a América e a Europa, rebatidas no espaço.', veio: ['sputnik', 'televisao'], alias: ['Telstar'] },
  { id: 'comutacao', t: 'Comutação de pacotes', g: 'comunicacao', ano: 1964, quando: '1964', quem: 'Paul Baran; Donald Davies', txt: 'Dividir mensagens em pacotes que seguem caminhos diferentes e se juntam no destino.', veio: ['telegrafo', 'eniac'], alias: ['pacotes', 'rede'] },
  { id: 'hipertexto', t: 'Hipertexto', g: 'comunicacao', ano: 1965, quando: '1945 a 1965', quem: 'Vannevar Bush; Ted Nelson', txt: 'Textos ligados uns aos outros por referências que se seguem com um clique.', veio: ['enciclopedia'], alias: ['link'] },
  { id: 'arpanet', t: 'ARPANET', g: 'comunicacao', ano: 1969, quando: '1969', quem: 'Departamento de Defesa dos EUA e universidades', txt: 'Quatro computadores ligados em rede. A primeira mensagem, “lo”, travou o sistema no meio da palavra “login”.', veio: ['comutacao', 'eniac'] },
  { id: 'fibra', t: 'Fibra óptica', g: 'comunicacao', ano: 1970, quando: '1970', quem: 'Corning', txt: 'Fios de vidro levando dados como pulsos de luz. Formam a espinha dorsal da internet.', veio: ['laser'], alias: ['cabo submarino'] },
  { id: 'email', t: 'E-mail', g: 'comunicacao', ano: 1971, quando: '1971', quem: 'Ray Tomlinson', txt: 'Mensagens entre usuários de computadores diferentes, com o @ separando nome e máquina.', veio: ['arpanet'], alias: ['correio eletrônico', 'arroba'] },
  { id: 'celular', t: 'Telefone celular', g: 'comunicacao', ano: 1973, quando: '1973', quem: 'Martin Cooper, Motorola', txt: 'A primeira ligação de um telefone portátil, num aparelho de mais de um quilo.', veio: ['radio', 'transistor'], alias: ['celular', 'Motorola'] },
  { id: 'internet', t: 'Internet', g: 'comunicacao', ano: 1983, quando: '1983', quem: 'Vint Cerf e Bob Kahn', txt: 'O protocolo TCP/IP liga redes diferentes numa rede de redes. Em 1983, a ARPANET passou a usá-lo.', veio: ['arpanet', 'teoria_informacao', 'fibra'], alias: ['TCP/IP', 'rede'] },
  { id: 'web', t: 'World Wide Web', g: 'comunicacao', ano: 1989, quando: '1989 a 1991', quem: 'Tim Berners-Lee, CERN', txt: 'Páginas ligadas por links, abertas para qualquer pessoa. A internet ganhou uma cara.', veio: ['internet', 'hipertexto'], alias: ['WWW', 'site', 'navegador'] },
  { id: 'wikipedia', t: 'Wikipédia', g: 'comunicacao', ano: 2001, quando: '2001', quem: 'Jimmy Wales e Larry Sanger', txt: 'Uma enciclopédia que qualquer pessoa pode editar, em centenas de línguas.', veio: ['web', 'enciclopedia'] },
  { id: 'redes_sociais', t: 'Redes sociais', g: 'comunicacao', ano: 2004, quando: 'anos 2000', quem: 'Orkut, Facebook e outras', txt: 'Perfis e amigos conectados. Mudaram o jeito como notícias e conversas circulam.', veio: ['web'], alias: ['Orkut', 'Facebook'] },
  { id: 'smartphone', t: 'Smartphone', g: 'comunicacao', ano: 2007, quando: '2007', quem: 'iPhone e os aparelhos que vieram depois', txt: 'Telefone, câmera, mapa e internet numa tela de toque, no bolso.', veio: ['celular', 'microprocessador', 'internet', 'litio', 'interface_grafica', 'gps'], alias: ['iPhone', 'Android', 'celular'] },

  // ——— Computação
  { id: 'abaco', t: 'Ábaco', g: 'computacao', ano: -500, quando: 'Antiguidade', quem: 'Várias civilizações', txt: 'Contas em hastes ou sulcos para somar e subtrair depressa. Ainda é usado para ensinar.', veio: ['numeracao'] },
  { id: 'algoritmo', t: 'Algoritmo', g: 'computacao', ano: -300, quando: 'c. 300 a.C.', quem: 'Euclides; o nome vem de al-Khwarizmi', txt: 'Uma receita passo a passo que sempre termina. O algoritmo de Euclides, que acha o maior divisor comum, ainda é usado.', veio: ['geometria'], alias: ['receita', 'passo a passo'] },
  { id: 'pascalina', t: 'Calculadora mecânica', g: 'computacao', ano: 1642, quando: '1642', quem: 'Blaise Pascal', txt: 'Engrenagens que somavam e subtraíam sozinhas.', veio: ['abaco', 'algarismos'], alias: ['Pascalina', 'calculadora'] },
  { id: 'jacquard', t: 'Cartões perfurados', g: 'computacao', ano: 1804, quando: '1804', quem: 'Joseph-Marie Jacquard', txt: 'Um tear controlado por cartões com furos: o desenho do tecido virou um programa.', veio: ['fabrica'], alias: ['tear de Jacquard'] },
  { id: 'maquina_analitica', t: 'Máquina analítica', g: 'computacao', ano: 1837, quando: '1837', quem: 'Charles Babbage', txt: 'O projeto de um computador mecânico, com memória e unidade de cálculo. Nunca foi construído por inteiro.', veio: ['pascalina', 'jacquard', 'logaritmos'], alias: ['Babbage'] },
  { id: 'lovelace', t: 'Primeiro programa', g: 'computacao', ano: 1843, quando: '1843', quem: 'Ada Lovelace', txt: 'Notas com um algoritmo para a máquina de Babbage e a intuição de que máquinas poderiam lidar com música e símbolos.', veio: ['maquina_analitica', 'algoritmo'], alias: ['Ada Lovelace', 'programação'] },
  { id: 'hollerith', t: 'Processamento de dados', g: 'computacao', ano: 1890, quando: '1890', quem: 'Herman Hollerith', txt: 'Cartões perfurados e máquinas elétricas apuraram o censo dos Estados Unidos em muito menos tempo. A empresa viraria a IBM.', veio: ['jacquard', 'estatistica'], alias: ['IBM', 'censo'] },
  { id: 'turing', t: 'Máquina de Turing', g: 'computacao', ano: 1936, quando: '1936', quem: 'Alan Turing', txt: 'Um modelo matemático de computador que define o que pode, e o que não pode, ser calculado.', veio: ['incompletude', 'algoritmo'], alias: ['Alan Turing', 'computabilidade'] },
  { id: 'circuitos_logicos', t: 'Circuitos lógicos', g: 'computacao', ano: 1937, quando: '1937', quem: 'Claude Shannon', txt: 'Interruptores elétricos podem fazer lógica booleana. Toda a eletrônica digital parte daí.', veio: ['boole', 'telefone'], alias: ['portas lógicas', 'digital'] },
  { id: 'neuronio_artificial', t: 'Neurônio artificial', g: 'computacao', ano: 1943, quando: '1943', quem: 'Warren McCulloch e Walter Pitts', txt: 'Um modelo matemático simplificado de como neurônios combinam sinais.', veio: ['boole', 'turing'], alias: ['rede neural'] },
  { id: 'programa_armazenado', t: 'Programa armazenado', g: 'computacao', ano: 1945, quando: '1945', quem: 'John von Neumann e a equipe do ENIAC', txt: 'Instruções e dados guardados na mesma memória. É a arquitetura de quase todo computador atual.', veio: ['turing'], alias: ['von Neumann', 'memória'] },
  { id: 'eniac', t: 'Computador eletrônico', g: 'computacao', ano: 1946, quando: '1946', quem: 'ENIAC, Universidade da Pensilvânia', txt: 'Quase 18 mil válvulas e 27 toneladas, fazendo contas milhares de vezes mais rápido que uma pessoa.', veio: ['circuitos_logicos', 'hollerith', 'eletron'], alias: ['ENIAC', 'computador'] },
  { id: 'transistor', t: 'Transistor', g: 'computacao', ano: 1947, quando: '1947', quem: 'John Bardeen, Walter Brattain e William Shockley', txt: 'Um interruptor minúsculo, sem partes móveis. Os chips atuais têm bilhões deles.', veio: ['quantica', 'eletron'], alias: ['semicondutor', 'silício'] },
  { id: 'teste_turing', t: 'Teste de Turing', g: 'computacao', ano: 1950, quando: '1950', quem: 'Alan Turing', txt: 'Se uma máquina conversa como uma pessoa, a ponto de não se notar a diferença, ela pensa?', veio: ['turing'] },
  { id: 'linguagens', t: 'Linguagens de programação', g: 'computacao', ano: 1957, quando: '1952 a 1957', quem: 'Grace Hopper; FORTRAN, de John Backus', txt: 'Escrever programas em algo parecido com palavras e fórmulas, e deixar a máquina traduzir.', veio: ['programa_armazenado', 'eniac'], alias: ['compilador', 'FORTRAN', 'Grace Hopper', 'código'] },
  { id: 'ia', t: 'Inteligência artificial', g: 'computacao', ano: 1956, quando: '1956', quem: 'Conferência de Dartmouth', txt: 'O nome e o programa de pesquisa: fazer máquinas raciocinarem, aprenderem e usarem linguagem.', veio: ['teste_turing', 'neuronio_artificial', 'eniac'], alias: ['IA', 'AI'] },
  { id: 'perceptron', t: 'Perceptron', g: 'computacao', ano: 1958, quando: '1958', quem: 'Frank Rosenblatt', txt: 'A primeira rede neural que aprendia com exemplos.', veio: ['neuronio_artificial'], alias: ['rede neural'] },
  { id: 'circuito_integrado', t: 'Circuito integrado', g: 'computacao', ano: 1958, quando: '1958', quem: 'Jack Kilby; Robert Noyce', txt: 'Vários transistores fabricados juntos num só pedaço de material: o chip.', veio: ['transistor'], alias: ['chip'] },
  { id: 'lei_moore', t: 'Lei de Moore', g: 'computacao', ano: 1965, quando: '1965', quem: 'Gordon Moore', txt: 'A previsão de que o número de transistores num chip dobraria a intervalos regulares. Valeu por décadas.', veio: ['circuito_integrado'] },
  { id: 'interface_grafica', t: 'Mouse e interface gráfica', g: 'computacao', ano: 1968, quando: '1968', quem: 'Douglas Engelbart', txt: 'Mouse, janelas e links numa só apresentação, que ficou conhecida como a mãe de todas as demonstrações.', veio: ['hipertexto', 'televisao'], alias: ['mouse', 'janelas'] },
  { id: 'unix', t: 'Unix', g: 'computacao', ano: 1969, quando: '1969', quem: 'Ken Thompson e Dennis Ritchie', txt: 'Um sistema operacional simples e portátil. Seus descendentes rodam em servidores, celulares e no Mac.', veio: ['linguagens'], alias: ['sistema operacional', 'linguagem C'] },
  { id: 'microprocessador', t: 'Microprocessador', g: 'computacao', ano: 1971, quando: '1971', quem: 'Intel 4004', txt: 'Um processador inteiro num único chip, com 2.300 transistores.', veio: ['circuito_integrado', 'lei_moore'], alias: ['CPU', 'Intel'] },
  { id: 'criptografia', t: 'Criptografia de chave pública', g: 'computacao', ano: 1976, quando: '1976', quem: 'Whitfield Diffie e Martin Hellman; RSA em 1977', txt: 'Dois desconhecidos combinam um segredo em público. Protege compras, mensagens e senhas.', veio: ['algoritmo', 'teoria_informacao'], alias: ['RSA', 'segurança', 'senha'] },
  { id: 'pc', t: 'Computador pessoal', g: 'computacao', ano: 1977, quando: '1977', quem: 'Apple II, Commodore PET e TRS-80', txt: 'Computadores prontos para usar em casa e no escritório.', veio: ['microprocessador', 'interface_grafica'], alias: ['PC', 'Apple'] },
  { id: 'computacao_quantica', t: 'Computação quântica', g: 'computacao', ano: 1982, quando: '1982', quem: 'Richard Feynman', txt: 'Usar as regras da física quântica para calcular. A ideia é antiga; as máquinas ainda estão sendo construídas.', veio: ['quantica', 'turing'], alias: ['qubit'] },
  { id: 'software_livre', t: 'Software livre', g: 'computacao', ano: 1983, quando: '1983', quem: 'Richard Stallman; Linux em 1991', txt: 'Programas que qualquer pessoa pode usar, estudar, modificar e compartilhar.', veio: ['unix'], alias: ['Linux', 'código aberto', 'GNU'] },
  { id: 'retropropagacao', t: 'Retropropagação', g: 'computacao', ano: 1986, quando: '1986', quem: 'David Rumelhart, Geoffrey Hinton e Ronald Williams', txt: 'Um jeito eficiente de redes neurais aprenderem com os próprios erros.', veio: ['perceptron', 'calculo'], alias: ['backpropagation'] },
  { id: 'gpu', t: 'GPU', g: 'computacao', ano: 1999, quando: '1999', quem: 'NVIDIA GeForce 256', txt: 'Chips feitos para gráficos, com milhares de contas em paralelo. Viraram o motor do aprendizado de máquina.', veio: ['microprocessador', 'pc'], alias: ['placa de vídeo'] },
  { id: 'nuvem', t: 'Computação em nuvem', g: 'computacao', ano: 2006, quando: '2006', quem: 'Amazon Web Services', txt: 'Alugar servidores pela internet em vez de comprá-los.', veio: ['internet', 'software_livre'], alias: ['servidor', 'cloud'] },
  { id: 'blockchain', t: 'Blockchain', g: 'computacao', ano: 2008, quando: '2008', quem: 'Satoshi Nakamoto', txt: 'Um registro de transações compartilhado e difícil de adulterar, sem um banco central.', veio: ['criptografia', 'internet', 'moeda'], alias: ['Bitcoin', 'criptomoeda'] },
  { id: 'aprendizado_profundo', t: 'Aprendizado profundo', g: 'computacao', ano: 2012, quando: '2012', quem: 'AlexNet: Alex Krizhevsky, Ilya Sutskever e Geoffrey Hinton', txt: 'Uma rede neural treinada em GPUs venceu com folga uma competição de reconhecimento de imagens.', veio: ['retropropagacao', 'gpu', 'web'], alias: ['deep learning', 'AlexNet'] },
  { id: 'transformer', t: 'Transformer', g: 'computacao', ano: 2017, quando: '2017', quem: 'Pesquisadores do Google', txt: 'Uma arquitetura de rede baseada em atenção, que pesa a relação entre todas as palavras de um texto.', veio: ['aprendizado_profundo'], alias: ['atenção'] },
  { id: 'ia_generativa', t: 'IA generativa', g: 'computacao', ano: 2022, quando: '2022', quem: 'Modelos de linguagem e de imagem', txt: 'Sistemas que escrevem, traduzem, programam e criam imagens a partir de instruções em linguagem comum.', veio: ['transformer', 'nuvem', 'web'], alias: ['ChatGPT', 'modelo de linguagem', 'LLM'] },
]

export interface Viagem {
  id: string
  titulo: string
  resumo: string
  passos: { id: string; texto: string }[]
}

// Viagens guiadas: cada passo está ligado ao anterior por uma conexão do grafo.
export const VIAGENS: Viagem[] = [
  {
    id: 'faisca-smartphone',
    titulo: 'Da faísca ao smartphone',
    resumo: 'Como uma pilha de discos de metal levou ao telefone no bolso.',
    passos: [
      { id: 'pilha', texto: 'Em 1800, Volta empilha discos de metal e papel molhado e cria a primeira corrente elétrica contínua.' },
      { id: 'inducao', texto: 'Com pilhas, Faraday descobre que um ímã em movimento gera corrente. Eletricidade e magnetismo andam juntos.' },
      { id: 'maxwell', texto: 'Maxwell junta tudo em quatro equações e prevê ondas eletromagnéticas que ninguém tinha visto.' },
      { id: 'radio', texto: 'As ondas viram mensagens sem fio. O mundo passa a ouvir o que acontece longe.' },
      { id: 'celular', texto: 'Rádio e transistor cabem numa mão: em 1973, a primeira ligação de um telefone portátil.' },
      { id: 'smartphone', texto: 'Em 2007, o celular vira computador, câmera e mapa, com a internet sempre no bolso.' },
    ],
  },
  {
    id: 'zero-ia',
    titulo: 'Do zero à inteligência artificial',
    resumo: 'Um número que não existia, a lógica do verdadeiro e falso e as redes que aprendem.',
    passos: [
      { id: 'zero', texto: 'Na Índia, em 628, o zero ganha regras próprias e vira número.' },
      { id: 'algarismos', texto: 'Com o zero, dez símbolos bastam para escrever qualquer número pela posição.' },
      { id: 'algebra', texto: 'Al-Khwarizmi ensina a resolver equações com regras gerais.' },
      { id: 'boole', texto: 'Boole transforma o raciocínio em álgebra de verdadeiro e falso.' },
      { id: 'neuronio_artificial', texto: 'Em 1943, um neurônio vira um modelo matemático que soma sinais e decide.' },
      { id: 'perceptron', texto: 'O perceptron aprende ajustando seus pesos a partir de exemplos.' },
      { id: 'retropropagacao', texto: 'A retropropagação ensina redes com várias camadas a corrigir os próprios erros.' },
      { id: 'aprendizado_profundo', texto: 'Com GPUs e muitos dados, redes profundas passam a enxergar imagens.' },
      { id: 'transformer', texto: 'O Transformer aprende a prestar atenção nas relações entre as palavras.' },
      { id: 'ia_generativa', texto: 'Treinados com muito texto, modelos passam a conversar, escrever e programar.' },
    ],
  },
  {
    id: 'microscopio-mrna',
    titulo: 'Do microscópio à vacina de mRNA',
    resumo: 'Lentes, células, DNA e uma vacina feita de instruções.',
    passos: [
      { id: 'optica', texto: 'Ibn al-Haytham explica como a luz forma imagens e como as lentes desviam a luz.' },
      { id: 'microscopio', texto: 'Lentes combinadas abrem a porta para o muito pequeno.' },
      { id: 'celula', texto: 'Hooke vê as células pela primeira vez, numa fatia de cortiça.' },
      { id: 'teoria_celular', texto: 'Todo ser vivo é feito de células, e toda célula vem de outra.' },
      { id: 'dna', texto: 'Dentro delas, a dupla hélice do DNA guarda as instruções da vida.' },
      { id: 'codigo_genetico', texto: 'Decifrado o código, dá para ler genes como receitas de proteínas.' },
      { id: 'mrna', texto: 'A vacina de mRNA entrega a receita de uma proteína do vírus, e o corpo aprende a se defender.' },
    ],
  },
  {
    id: 'fogo-lua',
    titulo: 'Do fogo à Lua',
    resumo: 'A química da pólvora vira foguete, e o foguete chega à Lua.',
    passos: [
      { id: 'fogo', texto: 'Tudo começa com o domínio do fogo, centenas de milhares de anos atrás.' },
      { id: 'polvora', texto: 'Alquimistas chineses descobrem uma mistura que queima depressa: a pólvora.' },
      { id: 'foguete', texto: 'Goddard troca a pólvora por combustível líquido e cria o foguete moderno.' },
      { id: 'sputnik', texto: 'Em 1957, um foguete põe o primeiro satélite em órbita.' },
      { id: 'gagarin', texto: 'Quatro anos depois, Gagarin dá a volta na Terra.' },
      { id: 'lua', texto: 'Em 1969, a Apollo 11 pousa na Lua.' },
    ],
  },
]
