/**
 * Mock AI Worker
 * Simulates AI generation with pre-written whimsical content
 * Used for UI testing before connecting real WebGPU models
 */

type MockRequestType = 'generate' | 'init' | 'cancel';

interface MockRequest {
  type: MockRequestType;
  payload?: {
    sillyLevel: number;
    spookyLevel: number;
    sleepyLevel: number;
    canvasData?: string | null;
  };
}

interface MockResponse {
  type: 'progress' | 'complete' | 'error' | 'ready';
  payload?: {
    progress?: number;
    status?: string;
    story?: string;
    image?: string;
    isGlitch?: boolean;
    error?: string;
  };
}

// Whimsical story templates based on potion levels
const STORY_TEMPLATES = {
  silly: [
    "Once upon a time, a {creature} discovered that clouds were actually giant cotton candy machines!",
    "In a land where gravity was optional, a {creature} learned to dance on rainbows!",
    "The {creature} accidentally turned all the vegetables into bubblegum - what a sticky situation!",
    "When the moon sneezed, a {creature} caught the sparkles in a jelly jar!",
  ],
  spooky: [
    "In the whispering forest, a {creature} found a door that only opens backwards!",
    "The {creature} discovered shadows have their own secret parties at midnight!",
    "When stars go dim, a {creature} tucks them in with blankets made of twilight!",
    "A {creature} befriended a ghost who was afraid of the dark - how spooky!",
  ],
  sleepy: [
    "The {creature} built a bed from cumulus clouds and dreamed in pastel colors!",
    "Every night, a {creature} collects yawns and stores them in pillowcases!",
    "The {creature} learned that lullabies grow on trees in the Garden of Zzz's!",
    "When the sun sets, a {creature} paints dreams onto the ceiling of the sky!",
  ],
};

const CREATURE_NAMES = [
  'fluffpot', 'wobblebot', 'sparklepuff', 'glimmernose',
  'snugglewiggle', 'bumbleface', 'twinkletoes', 'gigglepot',
  'mystic squish', 'shadowgle', 'doodlebear', 'zapnob',
];

// Generate SVG blob with random colors
function generateSvgBlob(silly: number, spooky: number, sleepy: number): string {
  const size = 512;
  const colors = [];
  
  // Color mixing based on potion levels
  if (silly > 50) {
    colors.push('#FDE047', '#FCD34D', '#FBBF24');
  }
  if (spooky > 50) {
    colors.push('#C084FC', '#A855F7', '#9333EA');
  }
  if (sleepy > 50) {
    colors.push('#93C5FD', '#60A5FA', '#3B82F6');
  }
  
  // Default colors if all low
  if (colors.length === 0) {
    colors.push('#FDE68A', '#D8B4FE', '#BAE6FD');
  }
  
  // Generate random blob path
  const points = [];
  const numPoints = 8 + Math.floor(Math.random() * 4);
  const centerX = size / 2;
  const centerY = size / 2;
  const baseRadius = (size / 3) + (Math.random() * 50);
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const variance = 0.3 + (Math.random() * 0.4);
    const radius = baseRadius * variance;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    points.push({ x, y });
  }
  
  // Create smooth path using quadratic curves
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    const cpY = (prev.y + curr.y) / 2;
    pathD += ` Q ${cpX} ${cpY} ${curr.x} ${curr.y}`;
  }
  // Close the path
  const last = points[points.length - 1];
  const first = points[0];
  const cpX = (last.x + first.x) / 2;
  const cpY = (last.y + first.y) / 2;
  pathD += ` Q ${cpX} ${cpY} ${first.x} ${first.y} Z`;
  
  // Add some whimsical features based on levels
  let features = '';
  
  // Eyes
  const eyeColor = spooky > 50 ? '#1F2937' : '#3B82F6';
  const eyeSize = 15 + (silly / 100) * 20;
  features += `
    <circle cx="${centerX - 40}" cy="${centerY - 20}" r="${eyeSize}" fill="white" stroke="${eyeColor}" stroke-width="3"/>
    <circle cx="${centerX - 40}" cy="${centerY - 20}" r="${eyeSize * 0.4}" fill="${eyeColor}"/>
    <circle cx="${centerX + 40}" cy="${centerY - 20}" r="${eyeSize}" fill="white" stroke="${eyeColor}" stroke-width="3"/>
    <circle cx="${centerX + 40}" cy="${centerY - 20}" r="${eyeSize * 0.4}" fill="${eyeColor}"/>
  `;
  
  // Mouth - varies by sleepy level
  if (sleepy > 60) {
    // Sleepy smile
    features += `<path d="M ${centerX - 30} ${centerY + 30} Q ${centerX} ${centerY + 50} ${centerX + 30} ${centerY + 30}" stroke="#1F2937" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else if (silly > 60) {
    // Silly wavy mouth
    features += `<path d="M ${centerX - 30} ${centerY + 30} Q ${centerX - 15} ${centerY + 45} ${centerX} ${centerY + 30} Q ${centerX + 15} ${centerY + 45} ${centerX + 30} ${centerY + 30}" stroke="#1F2937" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  } else {
    // Simple smile
    features += `<path d="M ${centerX - 25} ${centerY + 35} Q ${centerX} ${centerY + 55} ${centerX + 25} ${centerY + 35}" stroke="#1F2937" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  }
  
  // Extra features for high silly
  if (silly > 70) {
    const numBumps = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numBumps; i++) {
      const bx = centerX - 60 + (i * 60);
      const by = centerY - 80 - (Math.random() * 30);
      const br = 10 + Math.random() * 15;
      features += `<circle cx="${bx}" cy="${by}" r="${br}" fill="${colors[i % colors.length]}" stroke="#1F2937" stroke-width="2"/>`;
    }
  }
  
  // Spooky features
  if (spooky > 60) {
    features += `
      <path d="M ${centerX - 60} ${centerY - 60} L ${centerX - 50} ${centerY - 40} L ${centerX - 70} ${centerY - 40} Z" fill="#1F2937"/>
      <path d="M ${centerX + 60} ${centerY - 60} L ${centerX + 50} ${centerY - 40} L ${centerX + 70} ${centerY - 40} Z" fill="#1F2937"/>
    `;
  }
  
  const gradientId = `gradient-${Date.now()}`;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colors.map((c, i) => `<stop offset="${(i / colors.length) * 100}%" stop-color="${c}"/>`).join('')}
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="#F8FAFC"/>
      <path d="${pathD}" fill="url(#${gradientId})" stroke="#1F2937" stroke-width="4"/>
      ${features}
    </svg>
  `.trim();
}

function generateStory(silly: number, spooky: number, sleepy: number): string {
  // Determine dominant trait
  const traits = [
    { name: 'silly', value: silly },
    { name: 'spooky', value: spooky },
    { name: 'sleepy', value: sleepy },
  ];
  
  traits.sort((a, b) => b.value - a.value);
  const dominant = traits[0].name as keyof typeof STORY_TEMPLATES;
  
  const template = STORY_TEMPLATES[dominant][Math.floor(Math.random() * STORY_TEMPLATES[dominant].length)];
  const creature = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];
  
  return template.replace('{creature}', creature);
}

// Simulate async generation with progress updates
async function simulateGeneration(
  sillyLevel: number,
  spookyLevel: number,
  sleepyLevel: number
): Promise<{ story: string; image: string }> {
  const totalSteps = 50;
  
  for (let i = 0; i <= totalSteps; i += 5) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    let status = '';
    if (i < 10) status = 'Warming up the imagination...';
    else if (i < 25) status = 'Mixing potion ingredients...';
    else if (i < 40) status = 'Weaving dream threads...';
    else if (i < 50) status = 'Adding sparkles and stardust...';
    else status = 'Polishing the magic...';
    
    self.postMessage({
      type: 'progress',
      payload: {
        progress: i,
        status,
      },
    } as MockResponse);
  }
  
  const story = generateStory(sillyLevel, spookyLevel, sleepyLevel);
  const image = generateSvgBlob(sillyLevel, spookyLevel, sleepyLevel);
  
  return { story, image };
}

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<MockRequest>) => {
  const { type, payload } = event.data;
  
  try {
    if (type === 'init') {
      self.postMessage({
        type: 'ready',
        payload: { status: 'Mock AI Worker ready!' },
      } as MockResponse);
    }
    
    if (type === 'generate') {
      if (!payload) {
        throw new Error('Missing payload for generate request');
      }
      
      const { sillyLevel, spookyLevel, sleepyLevel } = payload;
      
      // Generate the content
      const { story, image } = await simulateGeneration(sillyLevel, spookyLevel, sleepyLevel);
      
      // 30% chance of glitch
      const isGlitch = Math.random() < 0.3;
      
      self.postMessage({
        type: 'complete',
        payload: {
          progress: 100,
          status: 'Dream complete!',
          story,
          image,
          isGlitch,
        },
      } as MockResponse);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    } as MockResponse);
  }
};

export {};
