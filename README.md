# AI Novel & Short Drama Workstation

A modern, Vue 3 + TypeScript based application for writing novels and converting them into short drama scripts.

## Tech Stack

- **Framework**: Vue 3 + TypeScript
- **UI Library**: Element Plus
- **Styling**: TailwindCSS
- **Editor**: Tiptap (Rich Text + AI Bubble Menu)
- **State Management**: Pinia
- **AI Integration**: OpenAI (SSE Streaming)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and add your OpenAI API Key:
   ```bash
   cp .env.example .env
   # Edit .env and set VITE_OPENAI_API_KEY
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Features

- **Workbench**: Project management and AI cover generation.
- **Lore Hub**: Character and world-building management.
- **Immersive Editor**: Distraction-free writing with AI assistance.
- **Script Converter**: Transform novels into structured scripts for video production.
