# AI Chatbot Full Stack

Projeto com frontend em Vite + React e backend em Node + Express + MongoDB.

## Estrutura

- `src/`: interface do chatbot
- `server/`: API Express, modelos do MongoDB e servico de IA
- `.env.example`: variaveis de ambiente necessarias

## Como rodar

1. Crie o arquivo `.env` com base em `.env.example`
2. Garanta que o MongoDB esteja rodando
3. Em um terminal, rode `npm run dev:server`
4. Em outro terminal, rode `npm run dev:client`

O frontend usa proxy do Vite para acessar a API em `/api` no ambiente local.

## Integracao de IA

O backend esta preparado para usar a API da Groq via `GROQ_API_KEY`.

Se a chave nao estiver configurada, o sistema responde em modo fallback para facilitar o teste da interface e da persistencia.

## Deploy

No frontend em producao, configure `VITE_API_URL` com a URL publica do backend.

No backend em producao, configure `CLIENT_URL` com a URL publica do frontend.

## Sobre scraping do ChatGPT Web

Nao implementei scraping do site do ChatGPT como motor principal do projeto. Essa abordagem e instavel, dificil de manter e inadequada para um backend de producao. A base foi montada para trabalhar com integracao por API no arquivo `server/services/aiClient.js`.
