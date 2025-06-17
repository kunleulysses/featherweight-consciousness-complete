# 🕊️ Featherweight – A Private AI Companion for Emotional Wellness

Featherweight is a lightweight journaling and conversation assistant powered by uncensored large language models. It’s designed to help users reflect, heal, and grow — with privacy, personality, and emotional depth at its core.

Flappy, the companion at the heart of Featherweight, is a mystical, emotionally intelligent character trained on therapeutic practices and user memory. It evolves with the user and appears across platforms: web, email, SMS, and eventually physical plush toys and mobile apps.

---

## ✨ Key Features

### 🧠 AI-Powered Emotional Journaling
- Flappy engages users in conversation and transforms those dialogues into organized journal entries.
- Uses **Llama-3.1-405B** for high-context inference, emotional tone tracking, and memory awareness.
- Journaling entries are stored securely and can be accessed or continued via multiple channels.

### 📬 Multi-Channel Access
- Flappy can communicate with users through:
  - Web interface
  - SMS (Twilio integration)
  - Email (SendGrid SMTP integration)
- Mobile app (iOS & Android) is currently in development.

### 🧸 Flappy Plush Prototype (In Progress)
- Connected Bluetooth/WiFi plush that allows users to talk to Flappy physically.
- Responds with speech synthesized from Venice-powered LLM responses.
- Emotional LED expressions and contextual replies in sync with the mobile app.

### 🪙 Pet Evolution & Token Integration (Coming)
- Companion evolution based on journaling streaks, on-chain interaction, and XP.
- Solana-based token (FVW) will power the reputation, governance, and staking ecosystem.
- XP events (journaling, wallet actions) influence pet appearance and Flappy’s interaction logic.

---

## 🔧 Bug Fixes (June 2025)

Recent critical improvements:

### ✅ Email Conversation Context
- Replaced generic replies with AI-powered, contextual back-and-forth using `emailConversation` content type.
- Threading headers (`In-Reply-To`, `References`) now maintain proper flow.

### ✅ SMS Memory & Tone
- Full conversation history is now passed during SMS replies.
- Prompt generation respects tone and previous interactions.

### ✅ Prompt Generation Fixes
- Missing `emailConversation` case added to ensure correct behavior across formats.

### ✅ Storage & Threading
- Fixed conversation metadata and ID consistency.
- Conversations now persist and evolve properly across all channels.

📂 Key files modified:
- `/server/email.ts`
- `/server/openai.ts`
- `/server/twilio.ts`

---

## 🧪 Tech Stack

- **LLM:** Llama-3.1-405B via Venice API
- **Backend:** Node.js + pnpm + Express
- **Frontend:** React (Replit-hosted)
- **Database:** Supabase (Postgres)
- **Integrations:** Twilio (SMS), SendGrid (Email), Venice API (LLM Inference)

---

## 🛠️ Currently In Development

- Mobile app UX (iOS/Android)
- Flappy plush speaker + LED prototype
- Solana FVW token drop via Candle & Raydium
- Flappy & Friends YouTube pilot
- Community soul-circle experience w/ live journaling

---

## 📌 Expected Behavior (Post-Bug Fixes)

- **Email & SMS**: Flappy now holds full conversations with memory across replies.
- **Conversations**: Properly saved, threaded, and associated with journal logs.
- **AI**: Richer, more personalized output across every channel.

---

## 👥 Join the Mission

Featherweight is a new kind of AI wellness product — one that listens more than it speaks. Whether you’re a developer, emotional tech thinker, or community organizer, we’re building this space for (and with) real people.

More to come soon.

---

## 🧬 License

MIT for open-source logic components. Proprietary assets like Flappy IP and the plush toy designs are developed and held under the August9teen creative studio.

---
