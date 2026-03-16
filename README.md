# The Latent Space Zoo 🧬✨

A **100% client-side, WebGPU-powered AI creature generator** that uses local LLM inference to generate unique procedural creatures with stunning visual effects.

![The Latent Space Zoo](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-green)
![Transformers.js](https://img.shields.io/badge/Transformers.js-SmolLM-orange)
![License](https://img.shields.io/badge/License-ISC-blue)

## Features

### 🧠 The Latent Oracle (AI Core)
- Powered by **SmolLM-135M-Instruct** (quantized) via [@xenova/transformers](https://github.com/xenova/transformers.js)
- Runs entirely in the browser using a **Web Worker Singleton**
- Generates creature data as structured JSON with species, traits, colors, behavior, and SVG configuration
- Internal system prompt enforces JSON-only output for reliable parsing

### 🎨 Procedural Renderer
- **HTML5 Canvas + GLSL Fragment Shaders** for digital smoke/noise effects
- **SVG paths** for creature limbs and features
- **Breathing animation** using sine waves applied to vertex points
- Real-time color palette generation based on DNA parameters

### 🎮 The Incubation UX
- **4 DNA Sliders**: Chaos, Sparkle, Ancient, Size
- **Binary Heart Animation**: Framer Motion "beating heart" made of binary code during generation
- **Glitch-Net Mechanic**: Click 3 floating glitch particles to stabilize the creature before it can be saved

### 💾 Zoo Database
- **Dexie.js (IndexedDB)** for persistent creature storage
- Filter by rarity (Common, Mythic, Glitch) or favorites
- Rename and delete creatures

### ⚡ Performance & Compatibility
- **WebGPU Detection**: Falls back to WASM if unavailable
- **Low Power Mode Badge**: Shows when using software rendering
- **Model Caching**: Transformers.js cache_manager ensures the ~270MB model downloads only once
- **Static Export**: Ready for Vercel/Netlify deployment

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| AI/ML | @xenova/transformers (SmolLM-135M) |
| Graphics | HTML5 Canvas + GLSL + SVG |
| Database | Dexie.js (IndexedDB) |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+ 
- Modern browser with WebGPU support (Chrome 113+, Edge 113+)
  - Fallback to WASM for older browsers

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/latent-space-zoo.git
cd latent-space-zoo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static export
npm run build

# Preview production build
npm start
```

The build outputs to the `out/` directory, ready for static hosting.

## Project Structure

```
GlitchGarden/
├── app/
│   ├── globals.css          # Global styles + animations
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page component
├── components/
│   ├── CreatureCanvas.tsx   # GLSL shader + SVG renderer
│   ├── GlitchNet.tsx        # Click-to-stabilize mechanic
│   ├── IncubationOverlay.tsx # Binary heart animation
│   ├── ZooGallery.tsx       # Creature collection view
│   └── ui/
│       └── DNAControls.tsx  # Sliders + WebGPU status
├── hooks/
│   └── useWebGPU.ts         # WebGPU detection + worker management
├── lib/
│   ├── bio-worker.ts        # Web Worker for AI inference
│   ├── utils.ts             # Utility functions
│   └── zoo-db.ts            # Dexie.js database schema
├── next.config.js           # Static export configuration
└── tailwind.config.js       # Custom animations + colors
```

## How It Works

### 1. DNA Input
Users adjust 4 sliders that influence the creature generation:
- **Chaos**: Affects spikiness and behavior randomness
- **Sparkle**: Affects color vibrancy and rarity chances
- **Ancient**: Affects stability and wobble animation
- **Size**: Affects node count and visual complexity

### 2. AI Generation
The Web Worker sends a prompt to SmolLM with the DNA parameters:
```
You are a biological data-stream. Output ONLY a valid JSON object.
Schema: { species, trait, color_palette, behavior, stats, svg_config }
```

### 3. Visual Rendering
- GLSL fragment shader creates digital smoke texture
- SVG paths generate procedural creature shapes
- Sine wave animation makes the creature "breathe"

### 4. Glitch-Net Stabilization
Before the creature can be saved, users must click 3 floating particles, simulating the stabilization of a quantum entity.

### 5. Zoo Storage
Creatures are saved to IndexedDB with metadata for later viewing.

## The Latent Oracle Prompt

The internal system prompt that guides the LLM:

```
You are a biological data-stream. Output ONLY a valid JSON object. Do not talk.
Schema: { 
  "species": string, 
  "trait": string, 
  "color_palette": ["#hex", "#hex", "#hex"], 
  "behavior": "hyper" | "docile" | "glitchy", 
  "stats": { "stability": 1-100, "rarity": "Common" | "Mythic" | "Glitch" },
  "svg_config": { "nodes": number, "spikiness": 0-1, "wobble": 0-1 } 
}
```

If the LLM fails to produce valid JSON, a procedural fallback generator ensures the user still gets a creature.

## Deployment

### Vercel

The project is configured for static export (`output: 'export'`). Simply connect your GitHub repository to Vercel and deploy.

### Netlify

```bash
# Build command
npm run build

# Publish directory
out
```

### Self-Hosting

```bash
npm run build
npx serve out
```

## Browser Support

| Browser | WebGPU | Fallback |
|---------|--------|----------|
| Chrome 113+ | ✅ Full | - |
| Edge 113+ | ✅ Full | - |
| Firefox | ❌ | WASM |
| Safari | ❌ | WASM |

## Performance Notes

- **First Load**: 1-2 minutes to download the SmolLM model (~270MB)
- **Subsequent Loads**: Cached model loads in ~5-10 seconds
- **Generation Time**: 2-5 seconds per creature depending on hardware
- **Memory Usage**: ~500MB during generation

## Troubleshooting

### Model fails to load
- Check browser console for CORS errors
- Ensure you have a stable internet connection for first load
- Try clearing browser cache

### WebGPU not detected
- Update to latest Chrome/Edge
- Check `chrome://flags/#enable-unsafe-webgpu`
- App will automatically fall back to WASM mode

### Generation produces invalid JSON
- The fallback procedural generator will activate
- Adjust DNA sliders and try again

## License

ISC License - See [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Transformers.js](https://github.com/xenova/transformers.js) for browser-based LLM inference
- [SmolLM](https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct) by Hugging Face
- [Framer Motion](https://www.framer.com/motion/) for buttery-smooth animations
- [Dexie.js](https://dexie.org/) for IndexedDB wrapper

---

**Generated in the Quantum Void** 🌌
