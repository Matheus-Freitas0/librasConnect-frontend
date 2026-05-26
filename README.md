# Libras Connect — Frontend

Interface web do **Libras Connect** para tradução assistida por gestos em LIBRAS, treinamento de novas expressões e consulta a um glossário com vídeos de referência.

## Funcionalidades

| Módulo | Rota | Descrição |
|--------|------|-----------|
| **Tradutor** | `/translator` | Captura gestos pela câmera; ao retirar as mãos, o clip é enviado ao backend para reconhecimento e o texto entra na conversa (com opção de fala por voz). |
| **Treinar** | `/training` | Grava amostras de gestos e associa cada uma a um rótulo em português para alimentar o modelo. |
| **Dicionário** | `/dicionario` | Glossário estático com termos, significado e vídeos do YouTube (dados em `dictionaryEntries.ts`). |

O fluxo de captura é automático: não é necessário clicar em “Iniciar”. O sistema detecta as mãos com **MediaPipe Hand Landmarker**, grava enquanto há mãos visíveis e encerra o segmento quando as mãos saem do quadro (ou após **15 segundos** no máximo).

## Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 8](https://vite.dev/) com React Compiler (Babel)
- [Material UI 9](https://mui.com/)
- [React Router 7](https://reactrouter.com/)
- [MediaPipe Tasks Vision](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker) (detecção de mãos no navegador)
- [Axios](https://axios-http.com/) para chamadas à API

## Pré-requisitos

- **Node.js** 20+ (recomendado LTS)
- **npm** 10+
- Backend da API Libras Connect em execução (padrão: `http://localhost:8080`)
- Navegador com suporte a **getUserMedia** (HTTPS ou `localhost`) para a câmera

## Configuração

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação abre em `http://localhost:5173` (porta padrão do Vite).

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Verificação TypeScript (`tsc -b`) e build de produção |
| `npm run preview` | Pré-visualização do build em `dist/` |
| `npm run lint` | ESLint no projeto |

## Estrutura do projeto

```
src/
├── App.tsx                 # Rotas e guarda de autenticação
├── main.tsx
├── components/             # Layout global (navbar, login, feature layout)
├── pages/                  # Re-exports das páginas principais
├── services/               # HTTP client, auth, token em localStorage
├── theme/                  # Tema MUI
└── features/signs/
    ├── api/                # Endpoints /api/v1/samples e /recognize
    ├── capture/            # MediaPipe, gravador manual, detecção de mãos
    ├── components/         # Câmera, overlay, dicionário, cards
    ├── data/               # Entradas do dicionário (termos + YouTube IDs)
    ├── pages/              # Tradutor, Treinar, Dicionário
    ├── services/           # Síntese de voz (Web Speech API)
    └── utils/              # Desenho de landmarks e mapeamento do vídeo
public/
└── dicionario/             # Imagens estáticas do glossário (opcional)
```

## API

O frontend espera um backend compatível com os prefixos:

- `POST /api/v1/auth/login` — autenticação (JWT)
- `POST /api/v1/samples` — envio de amostra de treino
- `POST /api/v1/recognize` — reconhecimento de clip de gesto

O token JWT é enviado no header `Authorization: Bearer <token>`. Em respostas `401`/`403`, o usuário é redirecionado para `/login`.

## Dicionário

Novos termos são adicionados em `src/features/signs/data/dictionaryEntries.ts`:

```ts
{
  id: 'exemplo',
  termo: 'Exemplo',
  significado: 'Descrição do gesto.',
  youtubeVideoId: 'ID_DO_VIDEO_YOUTUBE',
}
```

Vídeos embutidos carregam sob demanda (lazy) quando o card entra na tela.

## Build para produção

```bash
npm run build
```

Os artefatos ficam em `dist/`. Sirva com qualquer host estático ou integração ao seu pipeline; configure `VITE_API_URL` no ambiente de build para apontar à API de produção.

## Licença e manutenção

Este repositório é mantido por **[Matheus Freitas](https://github.com/Matheus-Freitas0)** ([@Matheus-Freitas0](https://github.com/Matheus-Freitas0)).

O código-fonte é de propriedade do mantenedor. Não há arquivo `LICENSE` na raiz do projeto — uso, cópia e distribuição fora do escopo autorizado pelo mantenedor não são permitidos sem permissão prévia.