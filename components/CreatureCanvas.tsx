'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface CreatureData {
  species: string;
  trait: string;
  color_palette: string[];
  behavior: 'hyper' | 'docile' | 'glitchy';
  stats: {
    stability: number;
    rarity: 'Common' | 'Mythic' | 'Glitch';
  };
  svg_config: {
    nodes: number;
    spikiness: number;
    wobble: number;
  };
}

interface CreatureCanvasProps {
  creature: CreatureData | null;
  isStabilized: boolean;
  width?: number;
  height?: number;
}

/**
 * GLSL Fragment Shader for noise/digital smoke effect
 */
const NOISE_FRAGMENT_SHADER = `
  precision highp float;
  
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_wobble;
  uniform float u_spikiness;
  
  // Simplex noise
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    
    // Time-based animation
    float time = u_time * 0.5;
    
    // Create organic movement
    float noise1 = snoise(vec2(uv.x * 3.0 + time * 0.2, uv.y * 3.0));
    float noise2 = snoise(vec2(uv.x * 5.0 - time * 0.3, uv.y * 5.0));
    float noise3 = snoise(vec2(uv.x * 8.0 + time * 0.1, uv.y * 8.0));
    
    // Combine noise layers
    float combinedNoise = (noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1) * u_wobble;
    
    // Mix colors based on noise
    vec3 color = mix(u_color1, u_color2, smoothstep(-0.5, 0.5, combinedNoise + noise2 * 0.3));
    color = mix(color, u_color3, smoothstep(0.3, 0.8, combinedNoise + 0.3));
    
    // Add spikiness effect at edges
    float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float spikeEffect = smoothstep(0.2, 0.0, edgeDist) * u_spikiness;
    color += vec3(spikeEffect * 0.3);
    
    // Add digital smoke transparency
    float alpha = 0.7 + combinedNoise * 0.3;
    alpha = clamp(alpha, 0.4, 1.0);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

/**
 * Generate procedural SVG path for creature body
 */
function generateCreaturePath(
  nodes: number,
  spikiness: number,
  wobble: number,
  time: number
): string {
  const points: [number, number][] = [];
  const centerX = 200;
  const centerY = 200;
  const baseRadius = 80;
  
  for (let i = 0; i < nodes; i++) {
    const angle = (i / nodes) * Math.PI * 2;
    
    // Add breathing animation
    const breath = Math.sin(time * 2 + i * 0.5) * 5;
    
    // Add wobble effect
    const wobbleOffset = Math.sin(time * 3 + angle * 3) * wobble * 15;
    
    // Add spikiness
    const spikeFactor = 1 + Math.sin(angle * 8 + time * 4) * spikiness * 0.4;
    
    const radius = (baseRadius + breath + wobbleOffset) * spikeFactor;
    
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    points.push([x, y]);
  }
  
  // Create smooth path through points
  if (points.length < 2) return '';
  
  let path = `M ${points[0][0]} ${points[0][1]}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cp1x = prev[0] + (curr[0] - prev[0]) * 0.5;
    const cp1y = prev[1];
    const cp2x = curr[0] - (curr[0] - prev[0]) * 0.5;
    const cp2y = curr[1];
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr[0]} ${curr[1]}`;
  }
  
  // Close the path
  const last = points[points.length - 1];
  const first = points[0];
  path += ` C ${last[0] + (first[0] - last[0]) * 0.5} ${last[1]}, ${first[0] - (first[0] - last[0]) * 0.5} ${first[1]}, ${first[0]} ${first[1]} Z`;
  
  return path;
}

/**
 * Generate limb SVG paths
 */
function generateLimbs(
  nodes: number,
  spikiness: number,
  time: number,
  color: string
): string {
  const limbs: string[] = [];
  const centerX = 200;
  const centerY = 200;
  const baseRadius = 90;
  
  const limbCount = Math.min(8, Math.max(4, Math.floor(nodes / 3)));
  
  for (let i = 0; i < limbCount; i++) {
    const angle = (i / limbCount) * Math.PI * 2;
    const limbLength = 40 + Math.sin(time * 2 + i) * 20 * spikiness;
    
    const startX = centerX + Math.cos(angle) * baseRadius;
    const startY = centerY + Math.sin(angle) * baseRadius;
    const endX = centerX + Math.cos(angle) * (baseRadius + limbLength);
    const endY = centerY + Math.sin(angle) * (baseRadius + limbLength);
    
    // Curved limb with tentacle-like motion
    const controlAngle = angle + Math.sin(time * 3 + i * 0.5) * 0.3;
    const controlX = (startX + endX) / 2 + Math.cos(controlAngle) * 15;
    const controlY = (startY + endY) / 2 + Math.sin(controlAngle) * 15;
    
    limbs.push(
      `<path d="M ${startX} ${startY} Q ${controlX} ${controlY}, ${endX} ${endY}" 
             stroke="${color}" 
             stroke-width="3" 
             fill="none" 
             opacity="0.6"
             stroke-linecap="round" />`
    );
  }
  
  return limbs.join('\n');
}

export function CreatureCanvas({
  creature,
  isStabilized,
  width = 400,
  height = 400,
}: CreatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Initialize WebGL and shader program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    const webglGl = gl as WebGLRenderingContext;
    glRef.current = webglGl;

    // Create shader program
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const vertexShader = webglGl.createShader(webglGl.VERTEX_SHADER);
    if (!vertexShader) return;
    webglGl.shaderSource(vertexShader, vertexShaderSource);
    webglGl.compileShader(vertexShader);

    const fragmentShader = webglGl.createShader(webglGl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    webglGl.shaderSource(fragmentShader, NOISE_FRAGMENT_SHADER);
    webglGl.compileShader(fragmentShader);

    const program = webglGl.createProgram();
    if (!program) return;
    webglGl.attachShader(program, vertexShader);
    webglGl.attachShader(program, fragmentShader);
    webglGl.linkProgram(program);
    webglGl.useProgram(program);

    programRef.current = program;

    // Set up rectangle geometry
    const positionBuffer = webglGl.createBuffer();
    webglGl.bindBuffer(webglGl.ARRAY_BUFFER, positionBuffer);
    webglGl.bufferData(
      webglGl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      webglGl.STATIC_DRAW
    );

    const positionLocation = webglGl.getAttribLocation(program, 'a_position');
    webglGl.enableVertexAttribArray(positionLocation);
    webglGl.vertexAttribPointer(positionLocation, 2, webglGl.FLOAT, false, 0, 0);

    startTimeRef.current = performance.now();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Render loop
  const render = useCallback(() => {
    const gl = glRef.current as WebGLRenderingContext | null;
    const program = programRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !canvas || !creature) return;

    const time = (performance.now() - startTimeRef.current) / 1000;

    // Update uniforms
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    gl.uniform1f(timeLocation, time);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    // Parse colors from creature
    const colors = creature.color_palette.map((hex) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return [r, g, b];
    });

    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');
    const color3Location = gl.getUniformLocation(program, 'u_color3');

    gl.uniform3fv(color1Location, colors[0] || [0.1, 0.1, 0.2]);
    gl.uniform3fv(color2Location, colors[1] || [0.2, 0.1, 0.3]);
    gl.uniform3fv(color3Location, colors[2] || [0.3, 0.2, 0.4]);

    const wobbleLocation = gl.getUniformLocation(program, 'u_wobble');
    const spikinessLocation = gl.getUniformLocation(program, 'u_spikiness');
    gl.uniform1f(wobbleLocation, creature.svg_config.wobble);
    gl.uniform1f(spikinessLocation, creature.svg_config.spikiness);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    animationRef.current = requestAnimationFrame(render);
  }, [creature]);

  useEffect(() => {
    if (creature && isStabilized) {
      animationRef.current = requestAnimationFrame(render);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [creature, isStabilized, render]);

  // Generate SVG overlay
  const svgOverlay = creature
    ? {
        __html: `
          <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            ${generateLimbs(
              creature.svg_config.nodes,
              creature.svg_config.spikiness,
              performance.now() / 1000,
              creature.color_palette[1] || '#0ea5e9'
            )}
            <path 
              d="${generateCreaturePath(
                creature.svg_config.nodes,
                creature.svg_config.spikiness,
                creature.svg_config.wobble,
                performance.now() / 1000
              )}" 
              fill="url(#gradient)" 
              filter="url(#glow)"
              opacity="0.9"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${creature.color_palette[0] || '#0ea5e9'};stop-opacity:0.8" />
                <stop offset="50%" style="stop-color:${creature.color_palette[1] || '#7b2cbf'};stop-opacity:0.6" />
                <stop offset="100%" style="stop-color:${creature.color_palette[2] || '#1a1a2e'};stop-opacity:0.4" />
              </linearGradient>
            </defs>
          </svg>
        `,
      }
    : undefined;

  return (
    <div className="relative" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="creature-canvas rounded-2xl quantum-glow"
        style={{
          filter: isStabilized
            ? 'none'
            : `hue-rotate(${Math.random() * 360}deg) blur(2px)`,
        }}
      />
      {creature && isStabilized && (
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          dangerouslySetInnerHTML={svgOverlay}
        />
      )}
    </div>
  );
}
