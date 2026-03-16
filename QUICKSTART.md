# Quick Start Guide

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Visit http://localhost:3000

## First Load Notes

- The SmolLM-135M model (~270MB) will download on first use
- This may take 1-2 minutes depending on your connection
- Subsequent loads use browser cache (~5-10 seconds)

## Features to Try

1. **Adjust DNA Sliders** - Set Chaos, Sparkle, Ancient, and Size values
2. **Generate Creature** - Click the button and watch the binary heart incubation
3. **Stabilize** - Click all 3 floating glitch particles
4. **Save to Zoo** - Add your creature to the IndexedDB collection
5. **Browse Zoo** - Filter by rarity or favorites

## WebGPU Status

- Look for the "WebGPU Active" badge in the top right
- If you see "LOW POWER MODE", the app is using WASM fallback
- WebGPU requires Chrome 113+ or Edge 113+

## Build for Production

```bash
npm run build
npm start  # Preview production build
```

## Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Deploy (static export is pre-configured)

## Troubleshooting

**Model won't load:**
- Clear browser cache
- Check console for errors
- Ensure stable internet connection

**WebGPU not detected:**
- Update browser to latest version
- App will automatically use WASM fallback

**Generation fails:**
- The procedural fallback will activate automatically
- Try adjusting sliders and regenerating
