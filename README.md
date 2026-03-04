# AI Novel & Short Drama Workstation

A modern, Vue 3 + TypeScript based application for writing novels and converting them into short drama scripts.

## Tech Stack

- **Framework**: Vue 3 + TypeScript (Composition API)
- **UI Library**: Element Plus (Customized Dark/Light Mode)
- **Styling**: TailwindCSS (Utility-first CSS)
- **Editor**: Tiptap (Rich Text + AI Bubble Menu)
- **State Management**: Pinia (with Persistence)
- **Routing**: Vue Router
- **AI Integration**: OpenAI Compatible API (SSE Streaming)
- **Build Tool**: Vite

## Architecture Overview

### Frontend Architecture
- **View Layer**: Modular Vue components split by feature (Workbench, Editor, Lore Hub).
- **Store Layer**: Centralized state management using Pinia `useLoreStore` for cross-component data sharing (Characters, Chapters, World Settings).
- **Service Layer**: `LLMClient` utility for handling AI API requests, stream parsing, and error handling.
- **Routing**: Dynamic routing for project navigation and step-based workflows.

### Key Features
- **Workbench**: Project management dashboard with AI cover generation (SVG/Canvas based).
- **Lore Hub**: Character and world-building management with visual traits.
- **Immersive Editor**: Distraction-free writing environment with floating AI tools and real-time suggestions.
- **Novel Generator**: Step-by-step wizard for creating novels from scratch (Outline -> Chapters -> Content).
- **Script Converter**: Transform novels into structured scripts for video production.

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

## Project Structure
- `src/views`: Main page views (AIWriteNovel, Editor, Workbench)
- `src/components`: Reusable UI components
- `src/stores`: Pinia state stores
- `src/utils`: Helper functions and API clients
- `src/router`: Route definitions

