/**
 * Local content safety filter for COPPA compliance
 * Runs entirely client-side with no external API calls
 */

export interface SafetyCheckResult {
  isSafe: boolean;
  filteredText: string;
  reason?: string;
}

// Blocked keywords for children's content
const BLOCKED_WORDS = [
  // Violence
  'kill', 'killed', 'killing',
  'die', 'died', 'dying', 'death',
  'hurt', 'hurts', 'hurting',
  'blood', 'bloody',
  'weapon', 'weapons', 'gun', 'guns', 'knife', 'knives',
  'fight', 'fighting', 'hit', 'hitting',
  'attack', 'attacking',
  'murder', 'murdered',
  'wound', 'wounded',
  
  // Scary/Dark themes
  'scary', 'terrified', 'terror',
  'nightmare', 'nightmares',
  'evil', 'demon', 'demons',
  'horror', 'horrific',
  'dark', 'darkness',
  'grave', 'graves',
  'ghost', 'ghosts',
  'haunted',
  
  // Negative emotions
  'hate', 'hated', 'hating',
  'mean', 'cruel', 'cruelty',
  'bad', 'worst',
  'sad', 'sadness', 'cry', 'crying',
  'angry', 'anger',
  'afraid', 'fear', 'scared',
  
  // Other inappropriate
  'drunk', 'alcohol',
  'smoke', 'smoking',
  'drugs',
];

// Positive replacement phrases
const SAFE_REPLACEMENTS: Record<string, string> = {
  'dark': 'mysterious',
  'scary': 'adventurous',
  'evil': 'mischievous',
  'bad': 'silly',
  'mean': 'playful',
};

export function checkContent(text: string): SafetyCheckResult {
  const lowerText = text.toLowerCase();
  
  for (const word of BLOCKED_WORDS) {
    if (lowerText.includes(word)) {
      return {
        isSafe: false,
        filteredText: generateSafeAlternative(),
        reason: `Contains inappropriate content: "${word}"`,
      };
    }
  }
  
  // Apply safe replacements for borderline words
  let filteredText = text;
  for (const [blocked, safe] of Object.entries(SAFE_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${blocked}\\b`, 'gi');
    filteredText = filteredText.replace(regex, safe);
  }
  
  // Check for appropriate length
  if (filteredText.trim().length < 5) {
    return {
      isSafe: false,
      filteredText: generateSafeAlternative(),
      reason: 'Text too short',
    };
  }
  
  return {
    isSafe: true,
    filteredText,
  };
}

function generateSafeAlternative(): string {
  const safeStories = [
    "A magical creature appears with a sparkle!",
    "A wonderful friend emerges from the shadows!",
    "A shimmering being dances with joy!",
    "A friendly creature waves hello!",
    "A glowing friend brings smiles to everyone!",
    "A playful being twirls with happiness!",
    "A magical friend shares a warm hug!",
    "A sparkly creature brings laughter everywhere!",
  ];
  
  return safeStories[Math.floor(Math.random() * safeStories.length)];
}

export function generateCreatureName(mood: {
  silly: number;
  spooky: number;
  sleepy: number;
  chaos: number;
}): string {
  const prefixes: Record<string, string[]> = {
    silly: ['Giggle', 'Wiggle', 'Bouncy', 'Silly', 'Happy', 'Jumpy', 'Bubbly'],
    spooky: ['Shadow', 'Mystery', 'Phantom', 'Whisper', 'Twilight', 'Moonbeam'],
    sleepy: ['Fluffy', 'Cozy', 'Dreamy', 'Soft', 'Gentle', 'Calm', 'Snuggle'],
    chaos: ['Glitch', 'Sparkle', 'Shimmer', 'Cosmic', 'Prism', 'Rainbow', 'Zap'],
  };
  
  const suffixes: string[] = [
    'puff', 'wiggle', 'spark', 'beam', 'fluff', 'pop', 
    'gleam', 'swirl', 'bounce', 'twirl', 'zoom', 'fizz',
    'doodle', 'noodle', 'berry', 'drop', 'whirl',
  ];
  
  // Determine dominant mood
  const moods = [
    { name: 'silly', value: mood.silly },
    { name: 'spooky', value: mood.spooky },
    { name: 'sleepy', value: mood.sleepy },
    { name: 'chaos', value: mood.chaos },
  ];
  
  moods.sort((a, b) => b.value - a.value);
  const dominantMood = moods[0].name as keyof typeof prefixes;
  
  const prefixList = prefixes[dominantMood];
  const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return prefix + suffix;
}

export function validateStoryLength(text: string): boolean {
  const wordCount = text.trim().split(/\s+/).length;
  return wordCount >= 5 && wordCount <= 50;
}
