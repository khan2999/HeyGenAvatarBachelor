# AURA — Human-AI Avatar Interface

> **Bachelor Thesis Project** — "Interaction Between Humans and AI-Based Avatars"

A production-ready web application enabling real-time conversation with a HeyGen streaming AI avatar. Users speak via microphone, their speech is transcribed and sent to OpenAI GPT, and the AI response is delivered by a lifelike avatar in real time.

---

## 🎬 Demo Flow

```
User clicks mic → Speaks → Web Speech API transcribes →
/api/chat calls OpenAI → Response sent to HeyGen avatar →
Avatar speaks the reply → Repeat
```

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript |
| Styling | Tailwind CSS |
| AI Avatar | HeyGen Streaming Avatar SDK v2 |
| Language Model | OpenAI GPT-4o-mini (configurable) |
| Speech-to-Text | Web Speech API (browser-native) |
| API Routes | Next.js serverless functions |

---

## 📁 Project Structure

```
heygen-avatar-app/
├── app/
│   ├── layout.tsx              # Root layout + metadata
│   ├── page.tsx                # Main page — orchestrates all features
│   ├── globals.css             # Global styles, design tokens, animations
│   └── api/
│       ├── chat/
│       │   └── route.ts        # POST /api/chat → OpenAI GPT response
│       └── heygen-token/
│           └── route.ts        # POST /api/heygen-token → HeyGen session token
├── components/
│   ├── Avatar.tsx              # HeyGen video container + loading states
│   ├── ChatHistory.tsx         # Scrollable conversation display
│   ├── Microphone.tsx          # Animated mic button with pulse rings
│   ├── StatusIndicator.tsx     # Current state badge (Listening/Thinking/Speaking)
│   └── TextInput.tsx           # Keyboard fallback input
├── lib/
│   ├── heygen.ts               # HeyGen SDK wrappers (session, stream, speak)
│   ├── openai.ts               # OpenAI client singleton + system prompt
│   └── speechRecognition.ts    # Web Speech API utilities
├── types/
│   └── index.ts                # Shared TypeScript interfaces
├── .env.example                # Environment variable template
├── next.config.js              # Next.js config (WebRTC headers)
├── tailwind.config.ts          # Tailwind theme + custom animations
└── tsconfig.json               # TypeScript configuration
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- **Node.js** v18.17 or later
- **npm** v9+ (or yarn/pnpm)
- A **HeyGen** account with API access
- An **OpenAI** account with API access

### 2. Clone / Download the Project

```bash
# If cloning from a repo:
git clone <your-repo-url>
cd heygen-avatar-app

# Or navigate to the project folder if already downloaded
cd heygen-avatar-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy the example file and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Get from https://app.heygen.com/settings?nav=API
HEYGEN_API_KEY=your_heygen_api_key_here

# Required: Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Override the AI model (default: gpt-4o-mini)
# OPENAI_MODEL=gpt-4o

# Optional: Override the avatar ID (default: Wayne_20240711)
# NEXT_PUBLIC_HEYGEN_AVATAR_ID=your_avatar_id
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Important**: Use a Chromium-based browser (Chrome, Edge, Brave) for the best Web Speech API support. Firefox has limited support; Safari uses `webkitSpeechRecognition`.

### 6. Build for Production

```bash
npm run build
npm start
```

---

## 🔑 Where to Get API Keys

### HeyGen API Key
1. Log in to [HeyGen](https://app.heygen.com)
2. Go to **Settings → API** (or visit https://app.heygen.com/settings?nav=API)
3. Generate or copy your API key
4. Paste into `HEYGEN_API_KEY` in `.env.local`

> ⚠️ Make sure your HeyGen plan includes **Streaming Avatar** access.

### OpenAI API Key
1. Log in to [OpenAI Platform](https://platform.openai.com)
2. Go to **API Keys** → Create new secret key
3. Paste into `OPENAI_API_KEY` in `.env.local`

> The default model is `gpt-4o-mini` — affordable and fast for conversational use.

---

## 🎛️ Configuration Options

| Variable | Default | Description |
|---|---|---|
| `HEYGEN_API_KEY` | *(required)* | Your HeyGen API key |
| `OPENAI_API_KEY` | *(required)* | Your OpenAI API key |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model to use |
| `NEXT_PUBLIC_HEYGEN_AVATAR_ID` | `Wayne_20240711` | HeyGen avatar ID |
| `NEXT_PUBLIC_HEYGEN_VOICE_ID` | *(Wayne's voice)* | HeyGen voice ID |

### Changing the Avatar

Browse available avatars at https://docs.heygen.com/reference/list-avatars-v2 (requires API key).

Set `NEXT_PUBLIC_HEYGEN_AVATAR_ID` to your chosen avatar's ID.

---

## 🏗️ Architecture Overview

### Conversation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Next.js)                       │
│                                                             │
│  [Microphone Button]                                        │
│         │                                                   │
│         ▼                                                   │
│  Web Speech API → transcript string                         │
│         │                                                   │
│         ▼                                                   │
│  fetch POST /api/chat { message, history }                  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │  Next.js API Route (/api/chat)      │                   │
│  │  → OpenAI GPT-4o-mini              │                   │
│  │  → returns { reply: string }        │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                   │
│         ▼                                                   │
│  avatar.speak({ text: reply })                              │
│         │                                                   │
│         ▼                                                   │
│  HeyGen SDK → WebRTC → <video> element                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Security Model

- `HEYGEN_API_KEY` is **never** sent to the browser — it's used only in `/api/heygen-token`
- `OPENAI_API_KEY` is **never** sent to the browser — it's used only in `/api/chat`
- Short-lived HeyGen session tokens are fetched server-side and passed to the SDK

---

## 🐛 Troubleshooting

| Issue | Solution |
|---|---|
| "HEYGEN_API_KEY is not set" | Add your key to `.env.local` and restart the server |
| "Microphone access denied" | Allow microphone in browser settings |
| Avatar not appearing | Check HeyGen plan includes Streaming Avatar; verify avatar ID |
| "Speech recognition not supported" | Use Chrome or Edge; use text input as fallback |
| Avatar speaks but video is black | Try a different browser; check WebRTC isn't blocked by firewall |
| "OpenAI 401 error" | Check your OPENAI_API_KEY is correct and has credits |

---

## 📚 Research Context

This application was built for a Bachelor thesis studying **human-AI avatar interaction**. It demonstrates:

- Real-time multimodal interaction (voice input + video avatar output)
- Low-latency conversation pipeline with WebRTC streaming
- Natural language understanding via large language models
- Embodied AI agents through photorealistic avatar synthesis

---

## 📄 License

MIT — Free for academic and research purposes.
