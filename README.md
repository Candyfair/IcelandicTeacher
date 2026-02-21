# Icelandic Teacher

**Local AI-powered Icelandic grammar teacher.** Analyse sentences word by word with streaming responses, anti-hallucination verification, and a bilingual (FR/EN) interface. Runs fully offline with Ollama.

---

## Features

- **Word-by-word grammar analysis** — conjugation, morphology, natural translation, and contextual examples
- **Streaming responses** — first tokens appear in ~0.5s via Server-Sent Events; no waiting for the full generation
- **Anti-hallucination pipeline** — two-stage verification (generate → verify → correct if needed) with deterministic temperature
- **Bilingual interface** — French and English, switchable at runtime
- **Light / dark theme**
- **Fully offline** — no external API calls; everything runs locally via Ollama

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18+, Express, ESM |
| Frontend | React 18, Vite |
| AI runtime | [Ollama](https://ollama.com) (local LLM) |
| Markdown | react-markdown + remark-gfm |

---

## Prerequisites

- **Node.js** >= 18
- **Ollama** installed and running — [ollama.com/download](https://ollama.com/download)
- A compatible model pulled, e.g. `llama3:8b`:

```bash
ollama pull llama3:8b
```

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Candyfair/IcelandicTeacher.git
cd IcelandicTeacher
```

### 2. Configure the environment

```bash
cp .env.example .env
```

Edit `.env` to match your setup (see [Configuration](#configuration)).

### 3. Install dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 4. Start Ollama and load the model

Make sure Ollama is running, then start the model:

```bash
ollama serve          # starts the Ollama server (skip if already running)
ollama run llama3:8b  # loads the model into memory
```

> You can stop `ollama run` once the model is loaded — the server keeps it in memory.
> To verify Ollama is ready: `curl http://localhost:11434`

### 5. Build the frontend

```bash
cd frontend && npm run build && cd ..
```

### 6. Start the server

```bash
npm start
```

The app is available at [http://localhost:3000](http://localhost:3000).

> **Development mode** (backend auto-reload + Vite HMR):
> ```bash
> # Terminal 1 — backend
> npm run dev
>
> # Terminal 2 — frontend
> cd frontend && npm run dev
> ```

---

## Configuration

Copy `.env.example` to `.env` and adjust the values:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Port the Express server listens on |
| `HOST` | `0.0.0.0` | Bind address |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama API base URL |
| `MODEL_NAME` | `llama3:8b` | Model used for generation and verification |
| `REQUEST_TIMEOUT_MS` | `120000` | Request timeout in milliseconds |
| `PROVIDER` | `ollama` | AI provider (`ollama` only for now) |
| `NODE_ENV` | `development` | Node environment |

---

## Project structure

```
IcelandicTeacher/
├── server.js                   # Entry point
├── app.js                      # Express app setup
├── src/
│   ├── config/config.js        # Environment variables & model parameters
│   ├── controllers/            # Route handlers
│   ├── services/
│   │   ├── analyzeService.js   # Generation + streaming + anti-hallucination
│   │   └── validationService.js# Answer validation (double-pass)
│   ├── providers/
│   │   └── localOllamaProvider.js  # Ollama integration (blocking + streaming)
│   ├── routes/apiRoutes.js     # API routes
│   └── middlewares/            # Error handling
└── frontend/
    └── src/
        ├── components/         # InputForm, ResultBlock, ThemeToggle
        ├── hooks/              # useGrammarAnalysis
        ├── services/api.js     # SSE client
        └── locales/            # fr.js, en.js
```

---

## Roadmap

See the [open issues](https://github.com/Candyfair/IcelandicTeacher/issues) for the full list of planned features and known bugs.

---

## License

This project is licensed under the **GNU General Public License v3.0 or later** (GPL-3.0-or-later).
See the [GPL-3.0 license](https://www.gnu.org/licenses/gpl-3.0.html) for details.
