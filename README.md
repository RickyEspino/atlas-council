# Atlas Council

**Three minds. One vision.** A personal AI deliberation workspace built on the open-source [Parallax](https://github.com/Houchen181/parallax) project.

Atlas Council puts multiple independently configured model seats in one conversation. Each seat can have its own name, instructions, and model, then take part in structured discussions. The three signature roles are **General Aeuron** (strategist, red), **Solara** (humanist/visionary, yellow), and **Vector** (skeptic/challenger, blue). The seat roles are independent of the particular GPT, Claude, or other models assigned to them.

> **Project status:** personal, local-first prototype (0.1). This is not an OpenAI product, nor an official Parallax release. AI responses may be wrong or agree for the same reasons; three speakers are not three independent sources of truth.

## What works

- One-on-one and group conversations with configurable model participants and persona instructions.
- **Independent opening round** (per-group option): each model receives the same conversation snapshot when responding to a new prompt; subsequent rounds are conversational and sequential.
- **Saved default Council**: save seat names, model assignments, role instructions, and group settings for new sessions. New sessions do **not** inherit old chat transcripts.
- Up to five conventional discussion rounds per prompt, adjustable group speaking order, and `@name` targeting.
- Browser UI, installable PWA, and local backend for provider requests and supported ChatGPT plan sign-in.
- Existing Parallax features including side-by-side chats, comparisons, streaming, and session history.

## Run locally

Requires Node.js 22 or later and npm. Clone this repository to your own machine, then run:

```bash
npm ci
npm run serve
```

Open `http://127.0.0.1:4747/` and configure your provider in **Settings → Providers**. This local server intentionally listens on localhost and is **not a public hosted backend**. ChatGPT plan usage depends on the account's eligibility and the provider's applicable terms and limits. Other providers may require separately billed API credentials.

The app can be installed from a supported browser as a PWA. Installing the PWA does not make the AI available offline; conversations require the local backend and network connectivity. Do not expose port 4747 directly to the public internet.

### Build and test

```bash
npm run typecheck
npm test
npm run build:web
```

### Council setup

1. Use **Convene Council** or open an existing group.
2. Assign each seat a model, name, and persona instructions.
3. In **Group chat options**, enable **Independent opening round** if desired and choose a round count.
4. Select **Save this group as default Council** to reuse those seats in new chats.

Seat colors follow the *role name*, not the provider: General red, Solara yellow, Vector (also recognized as Vectone) blue.

## Privacy and current limitations

- Conversation history and settings are persisted locally in the browser (IndexedDB) for the origin you use. Local provider credentials and ChatGPT tokens are managed by the local backend, not stored as conversation settings.
- The saved Council preset is a configuration template, **not persistent conversational memory**. There is currently no automated cross-chat knowledge ledger, adaptive stopping engine, or independently audited privacy system.
- Independent opening rounds reduce *within-round anchoring*; they do not guarantee different conclusions or eliminate shared model biases.
- A remote hosted deployment with ChatGPT plan-backed sign-in cannot be assumed to work like the local version. Hosting requires a separate architectural and authorization review.
- The application retains some Parallax-derived internal identifiers to keep compatibility with existing stored data and working authentication flows.

## Project ancestry and license

Atlas Council is a derivative of **[Parallax](https://github.com/Houchen181/parallax)** by **Houchen181 and contributors**. The original repository, source architecture, and prior features are credited here. Atlas Council's changes include Council-specific discussion controls, saved seat presets, branding, and PWA configuration.

The source retains Parallax's **MIT license**; see [LICENSE](LICENSE). Original copyright notices and attributions remain applicable. This fork is maintained independently.
