# KallTec — apresentação com voz única

Este projeto serve a apresentação KallTec. A narração já vem gerada em `public/audio`, então o navegador recebe um arquivo MP3 pronto e a voz é igual em Chrome, Edge, Safari e Firefox.

## Voz

A voz é a **Thalita (pt-BR, neural multilíngue)**, gerada com o Edge TTS. Não há chave de API, custo ou limite de créditos em tempo de execução — os 16 áudios são arquivos estáticos versionados no repositório.

Para trocar a voz, a velocidade ou o texto de alguma fala:

1. Edite os textos em `narrations.js` (fonte única das falas da Vera).
2. Rode `pip install edge-tts` uma vez.
3. Gere os áudios: `python tools/gerar-narracao.py`
   - `--voice pt-BR-FranciscaNeural` ou `--voice pt-BR-AntonioNeural` para outra voz.
   - `--rate +8%` ajusta a velocidade (padrão).
   - `--slide 3` regenera apenas um slide (índice 0 = primeiro slide).
4. Faça commit dos MP3 gerados em `public/audio`.

O arquivo `tools/gerar-narracao.py` substitui na fala termos que o leitor pronuncia mal (`KallTec` → "Caltec", `SOAP` → "Sóap", siglas como `SBIS` e `CFM`), sem alterar o texto exibido na tela.

## Configuração local

1. Instale com `pnpm install`.
2. Execute `npm start`.
3. Abra `http://localhost:3000`.

Não é necessário nenhum arquivo `.env`. Para ver a apresentação basta abrir a pasta `public` em qualquer servidor estático — o `server.js` é só um servidor local conveniência.

## Render

O site é 100% estático: uma página e os 16 MP3. No Render, crie um **Static Site** (não um Web Service), sem comando de build e sem variáveis secretas.

- Tipo: Static Site.
- Publish directory: `public`.
- Build command: vazio.
- 404 fallback: `/index.html`.

O arquivo `render.yaml` já declara essa configuração para uso como Blueprint. Static Site não hiberna entre acessos, então a apresentação abre na hora durante a reunião.

## Observação

A interface informa que a voz é gerada por inteligência artificial, conforme a orientação de transparência da OpenAI e da Microsoft.
