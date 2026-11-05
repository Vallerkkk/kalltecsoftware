# KallTec — apresentação com voz única

Este projeto serve a apresentação KallTec e gera a narração no backend. O navegador recebe um arquivo WAV pronto, portanto a voz não muda entre Chrome, Edge, Safari e Firefox.

## Configuração local

1. Copie `.env.example` para `.env`.
2. Defina `OPENAI_API_KEY` somente no ambiente do servidor.
3. Execute `pnpm install`.
4. Carregue as variáveis de `.env` e execute `npm start`.
5. Abra `http://localhost:3000`.

O backend aceita apenas os 16 textos da apresentação. Cada áudio gerado é guardado em `.cache/audio` para evitar geração e custo repetidos enquanto o cache existir.

## Render

- Tipo: Web Service.
- Build command: `corepack enable && pnpm install --frozen-lockfile`.
- Start command: `npm start`.
- Health check: `/api/health`.
- Variável secreta obrigatória: `OPENAI_API_KEY`.
- Variáveis já definidas em `render.yaml`: `OPENAI_AUDIO_MODEL=gpt-audio-1.5` e `OPENAI_AUDIO_VOICE=coral`.

O arquivo `render.yaml` deixa o projeto pronto para um Blueprint no Render. Nunca envie o arquivo `.env` nem a chave da API ao repositório.

## Observação

A interface informa que a voz é gerada por inteligência artificial, conforme a orientação de transparência da OpenAI.
