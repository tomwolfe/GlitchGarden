# The Latent Space Zoo 🦄

A **privacy-first, client-side AI storybook and creature collection game** for children. Create stories and collect "glitch creatures" by adjusting mood sliders. All AI inference runs **100% locally in the browser**—no API keys, no backend, no data leaves the device.

![The Latent Space Zoo](https://img.shields.io/badge/Privacy-First-purple?style=for-the-badge)
![No API Keys](https://img.shields.io/badge/No-API_Keys-green?style=for-the-badge)
![COPPA Compliant](https://img.shields.io/badge/COPPA-Compliant-blue?style=for-the-badge)

## ✨ Features

- 🧪 **Story Potion Sliders** - Mix silly, spooky, sleepy, and chaos moods to generate unique stories
- 🎨 **Creature Canvas** - Watch as AI-generated creatures appear with procedural glitch art
- 🏠 **Zoo Collection** - Catch and save your creatures to a persistent collection
- 🔒 **Privacy-First** - All AI runs locally via Transformers.js, no data leaves the browser
- 📱 **Mobile-Friendly** - Large buttons and touch-friendly UI for ages 4+
- 🌐 **Works Offline** - After initial load, the app works without internet
- ⏰ **Cool-Down Timer** - Prevents battery drain with a 30-second rest after 3 generations

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 14 (Static Export) |
| Styling | Tailwind CSS |
| AI Engine | Transformers.js (Web Workers) |
| Storage | IndexedDB (via `idb` library) |
| Hosting | Vercel Hobby (static files only) |
| Models | LaMini-Flan-T578M from HuggingFace CDN |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGPU or WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/latent-space-zoo.git
cd latent-space-zoo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run serve
```

The static files will be in the `out/` directory.

## 📁 Project Structure

```
latent-space-zoo/
├── public/
│   ├── models/          # Model configs (weights from HF CDN)
│   ├── sounds/          # UI sounds (optional)
│   └── icons/           # App icons
├── src/
│   ├── components/
│   │   ├── StoryPotion.tsx      # Mood sliders
│   │   ├── CreatureCanvas.tsx   # Creature display
│   │   ├── ZooCollection.tsx    # Saved creatures grid
│   │   ├── PixelNarrator.tsx    # AI text display
│   │   └── LoadingScreen.tsx    # Model download progress
│   ├── workers/
│   │   └── ai-worker.ts         # Transformers.js inference
│   ├── utils/
│   │   ├── db.ts                # IndexedDB operations
│   │   └── safety-filter.ts     # Local content moderation
│   ├── app/
│   │   ├── page.tsx             # Main app
│   │   ├── layout.tsx           # Root layout
│   │   └── globals.css          # Global styles
│   └── ...
├── next.config.mjs
├── package.json
└── README.md
```

## 🎮 How to Play

1. **Wake up Pixel** - Wait for the AI model to load (one-time download ~100MB)
2. **Mix the Potion** - Adjust the mood sliders:
   - 😄 **Silly** - Makes stories funnier and creatures wiggly
   - 👻 **Spooky** - Adds mystery and shadow effects
   - 😴 **Sleepy** - Creates calm, dreamy creatures
   - 🌈 **Chaos** - Injects glitch effects for unique variations
3. **Brew!** - Click the button to generate a story and creature
4. **Catch It!** - Save your favorite creatures to the zoo
5. **Collect Them All** - Build your creature collection!

## 🔒 Privacy & Safety

- ✅ **No API Keys** - Everything runs locally
- ✅ **No Backend** - Static files only
- ✅ **No Data Collection** - COPPA compliant
- ✅ **Content Filter** - Local keyword filtering for child safety
- ✅ **Offline Capable** - Works after initial load

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository to Vercel
3. Use these settings:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `out`
4. Deploy!

### Manual Static Hosting

```bash
npm run build
# Upload the `out/` directory to any static host
```

## 📱 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Firefox | 88+ | ✅ Full |
| Safari | 15+ | ✅ Full |
| Edge | 90+ | ✅ Full |

**Note:** First load requires internet to download the AI model (~100MB). Subsequent visits use browser cache.

## 🎨 Customization

### Change the AI Model

Edit `src/workers/ai-worker.ts`:

```typescript
textGenerator = await pipeline(
  'text2text-generation', 
  'Xenova/LaMini-Flan-T578M', // Change this
  { quantized: true }
);
```

### Modify Creature Colors

Edit the `drawCreature` function in `src/components/CreatureCanvas.tsx`.

### Adjust Cool-Down Timer

Edit the timeout in `src/app/page.tsx`:

```typescript
setTimeout(() => {
  setCoolDown(false);
  setGenerationCount(0);
}, 30000); // Change milliseconds
```

## 🐛 Troubleshooting

### Model fails to load
- Check your internet connection
- Try refreshing the page
- Clear browser cache and reload

### App runs slowly
- Close other browser tabs
- Reduce chaos slider (high chaos = more processing)
- Use a device with better GPU support

### Creatures don't save
- Check browser storage permissions
- Ensure IndexedDB is enabled
- Try a different browser

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Transformers.js](https://huggingface.co/docs/transformers.js) by Hugging Face
- [LaMini-Flan-T5](https://huggingface.co/Xenova/LaMini-Flan-T578M) by Xenova
- [idb](https://github.com/jakearchibald/idb) by Jake Archibald
- Next.js and Vercel teams

---

**Made with 💜 for curious kids everywhere!**
