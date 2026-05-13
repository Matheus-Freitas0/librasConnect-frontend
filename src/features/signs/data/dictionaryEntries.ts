export type DictionaryEntry = {
  id: string
  termo: string
  significado: string
  imagemSrc?: string
  youtubeVideoId?: string
  textoAlternativo?: string
}

export const entradasDicionario: DictionaryEntry[] = [
  {
    id: 'oi',
    termo: 'Oi',
    significado: 'Saudação informal, equivalente a um cumprimento leve.',
    youtubeVideoId: '3iUZju5h5gw',
  },
  {
    id: 'prazer-em-conhecer',
    termo: 'Prazer em conhecer',
    significado: 'Expressão usada ao se apresentar a alguém pela primeira vez.',
    youtubeVideoId: '9UcdfolhYDI',
  },
  {
    id: 'tchau',
    termo: 'Tchau',
    significado: 'Despedida informal.',
    youtubeVideoId: 'pXm5ify_64U',
  },
  {
    id: 'te-amo',
    termo: 'Te amo',
    significado: 'Declaração de afeto e carinho profundo.',
    youtubeVideoId: 'qLE_3Yy9VVU',
  },
  {
    id: 'eu',
    termo: 'Eu',
    significado: 'Pronome de primeira pessoa: a própria pessoa que fala ou gesticula.',
    youtubeVideoId: 'ley08jLPxMk',
  },
]
