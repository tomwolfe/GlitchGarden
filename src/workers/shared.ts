/**
 * Shared utilities for AI workers
 * Contains common functions and constants used by both mockWorker and aiWorker
 */

// Story templates based on potion levels
export const STORY_TEMPLATES = {
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

export const CREATURE_NAMES = [
  'fluffpot', 'wobblebot', 'sparklepuff', 'glimmernose',
  'snugglewiggle', 'bumbleface', 'twinkletoes', 'gigglepot',
  'mystic squish', 'shadowgle', 'doodlebear', 'zapnob',
];

// Generate SVG blob with random colors
export function generateSvgBlob(silly: number, spooky: number, sleepy: number): string {
  const size = 512;
  const colors: string[] = [];

  // Color mixing based on potion levels
  if (silly > 50) colors.push('#FDE047', '#FCD34D', '#FBBF24');
  if (spooky > 50) colors.push('#C084FC', '#A855F7', '#9333EA');
  if (sleepy > 50) colors.push('#93C5FD', '#60A5FA', '#3B82F6');

  // Default colors if all low
  if (colors.length === 0) colors.push('#FDE68A', '#D8B4FE', '#BAE6FD');

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

export function generateStory(silly: number, spooky: number, sleepy: number): string {
  // Determine dominant trait
  const traits = [
    { name: 'silly' as const, value: silly },
    { name: 'spooky' as const, value: spooky },
    { name: 'sleepy' as const, value: sleepy },
  ];

  traits.sort((a, b) => b.value - a.value);
  const dominant = traits[0].name;

  const template = STORY_TEMPLATES[dominant][Math.floor(Math.random() * STORY_TEMPLATES[dominant].length)];
  const creature = CREATURE_NAMES[Math.floor(Math.random() * CREATURE_NAMES.length)];

  return template.replace('{creature}', creature);
}
