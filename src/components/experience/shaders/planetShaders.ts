import * as THREE from 'three';

// ============================================================================
// GLSL 3D SIMPLEX NOISE & FBM HELPER SHADERS
// ============================================================================
export const glslNoiseFunctions = `
// Simplex 3D noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p) {
  float f = 0.0;
  f += 0.5000 * snoise(p); p *= 2.02;
  f += 0.2500 * snoise(p); p *= 2.03;
  f += 0.1250 * snoise(p); p *= 2.01;
  f += 0.0625 * snoise(p);
  return f;
}
`;

// ============================================================================
// 1. PROCEDURAL TRANSITION ENERGY WAVE SHADER (SWEEPING FLUID/FLAME FRONT)
// ============================================================================
export const PlanetTransitionWaveShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    ${glslNoiseFunctions}

    uniform sampler2D uTexFrom;
    uniform sampler2D uTexTo;
    uniform float uProgress;          // 0.0 to 1.0
    uniform float uTime;
    uniform float uUvOffset;
    uniform int uVariant;             // 0 = Cool Fluid, 1 = Warm Flame
    uniform vec3 uLightDir;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;

    void main() {
      vec2 uv = vec2(fract(vUv.x + uUvOffset), vUv.y);

      // Spherical 3D Normal Lighting
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(uLightDir);
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.35;
      float lighting = ambient + (1.0 - ambient) * diff;

      // Sample Diffuse Textures
      vec4 texFrom = texture2D(uTexFrom, uv);
      vec4 texTo = texture2D(uTexTo, uv);

      // Smooth Wavefront Coordinates with 3D FBM Domain Warping
      // The wave travels organically across the sphere from (x: 1.0 -> -1.0)
      vec3 noiseCoord = vPosition * 1.8 + vec3(uTime * 0.4, uTime * 0.3, uTime * 0.2);
      float noiseVal = fbm(noiseCoord);
      
      // Normalized wave progress coordinate along sphere (-1.8 to +1.8)
      float waveCoord = (vPosition.x + vPosition.y * 0.35) / 2.2;
      // Remap progress to sweep across entire sphere [-1.3, 1.3]
      float sweepThreshold = mix(1.4, -1.4, uProgress);
      
      // Distance from the turbulent wavefront
      float distToFront = waveCoord - (sweepThreshold + noiseVal * 0.35);

      // Three-layer energy edge:
      // 1. White-hot sharp core
      // 2. Saturated plasma/flame band
      // 3. Soft outer corona glow
      float coreEdge = 1.0 - smoothstep(0.0, 0.04, abs(distToFront));
      float flameBand = 1.0 - smoothstep(0.0, 0.22, abs(distToFront));
      float outerGlow = 1.0 - smoothstep(0.0, 0.45, abs(distToFront));

      // Color Palettes
      vec3 coreColor = vec3(1.0, 1.0, 1.0); // White-hot core
      vec3 midColor = (uVariant == 1) 
        ? vec3(1.0, 0.55, 0.08)  // Blazing Orange/Gold Flame
        : vec3(0.05, 0.85, 1.0);  // Electric Cyan Fluid

      vec3 glowColor = (uVariant == 1)
        ? vec3(0.95, 0.20, 0.02)  // Deep Red/Amber Flame
        : vec3(0.02, 0.40, 0.90);  // Oceanic Deep Blue Fluid

      // Transition Blend Mask: Behind the wavefront is New Planet (texTo), ahead is Old Planet (texFrom)
      float blendFactor = smoothstep(-0.12, 0.12, -distToFront);
      vec4 basePlanetTex = mix(texFrom, texTo, blendFactor);

      // Fresnel Rim Atmosphere
      vec3 viewDir = normalize(-vPosition);
      float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
      float rim = pow(fresnel, 3.2);

      // Intensity modulation based on transition progress
      float waveIntensity = sin(uProgress * 3.14159265);
      
      // Energy Wavefront Emission
      vec3 energyEmission = (coreColor * coreEdge * 1.8 + midColor * flameBand * 1.4 + glowColor * outerGlow * 0.9) * waveIntensity;

      // Base planet color with lighting and subtle atmospheric rim
      vec3 planetColor = basePlanetTex.rgb * lighting + rim * midColor * (0.25 + waveIntensity * 0.5);

      // Final Composited Pixel
      vec3 finalColor = planetColor + energyEmission;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

// ============================================================================
// 2. VOLUMETRIC CORONA SHELL SHADER (OUTER ATMOSPHERIC EXPANSION)
// ============================================================================
export const PlanetCoronaShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    ${glslNoiseFunctions}

    uniform float uProgress;
    uniform float uTime;
    uniform int uVariant;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(-vPosition);

      // Dynamic corona flares using 3D FBM noise along view ray
      vec3 noiseCoord = normal * 2.5 + vec3(uTime * 0.5, uTime * 0.4, uTime * 0.3);
      float noiseVal = fbm(noiseCoord);

      // Pure rim corona (invisible in center, peaks outside silhouette)
      float rim = 1.0 - max(dot(viewDir, normal), 0.0);
      float corona = pow(rim, 2.5) * (0.8 + noiseVal * 0.5);

      // Transition envelope: peaks in middle (t ~ 0.5), 0 at start and end
      float intensity = sin(uProgress * 3.14159265);

      vec3 coronaColor = (uVariant == 1)
        ? mix(vec3(1.0, 0.45, 0.05), vec3(1.0, 0.85, 0.2), noiseVal * 0.5 + 0.5)
        : mix(vec3(0.05, 0.75, 1.0), vec3(0.6, 0.95, 1.0), noiseVal * 0.5 + 0.5);

      float alpha = corona * intensity * 0.85;

      gl_FragColor = vec4(coronaColor * 1.5, alpha);
    }
  `,
};

// ============================================================================
// 3. PROCEDURAL TEXTURES FOR PLANETS & RINGS
// ============================================================================

// Procedural Mercury Texture (Rocky, cratered lunar gray)
export function createMercuryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#5A5E64';
  ctx.fillRect(0, 0, 2048, 1024);

  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, 92 + n));
    data[i + 1] = Math.min(255, Math.max(0, 94 + n));
    data[i + 2] = Math.min(255, Math.max(0, 98 + n));
  }
  ctx.putImageData(imgData, 0, 0);

  // Procedural impact craters
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = Math.random() * 20 + 2;

    ctx.beginPath();
    ctx.arc(x - r * 0.15, y - r * 0.15, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 185, 190, 0.22)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(38, 40, 44, 0.45)';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Uranus Texture (Pale cyan / aquamarine ice giant bands)
export function createUranusTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#A5F3FC');
  grad.addColorStop(0.35, '#06B6D4');
  grad.addColorStop(0.7, '#0891B2');
  grad.addColorStop(1, '#164E63');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  for (let y = 0; y < 512; y += 4) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.12})`;
    ctx.fillRect(0, y, 1024, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Mars Texture (Deep vibrant rust-red / ochre / volcanic basalt and polar cap)
export function createMarsTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base Red Martian terrain
  ctx.fillStyle = '#C84C1C';
  ctx.fillRect(0, 0, 2048, 1024);

  const imgData = ctx.getImageData(0, 0, 2048, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, 205 + n));     // High Red
    data[i + 1] = Math.min(255, Math.max(0, 75 + n * 0.6));  // Low Green
    data[i + 2] = Math.min(255, Math.max(0, 30 + n * 0.4));  // Low Blue
  }
  ctx.putImageData(imgData, 0, 0);

  // Dark Basalt Lowlands (Syrtis Major, Mare Tyrrhenum)
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 2048;
    const y = 300 + Math.random() * 450;
    const rx = Math.random() * 180 + 60;
    const ry = Math.random() * 90 + 30;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, rx);
    grad.addColorStop(0, 'rgba(65, 22, 8, 0.65)');
    grad.addColorStop(0.7, 'rgba(110, 35, 12, 0.40)');
    grad.addColorStop(1, 'rgba(200, 76, 28, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Craters & Valles Marineris canyon features
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * 2048;
    const y = Math.random() * 1024;
    const r = Math.random() * 15 + 2;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(70, 24, 8, 0.35)';
    ctx.fill();
  }

  // Polar Ice Cap (North & South Poles)
  const northCap = ctx.createLinearGradient(0, 0, 0, 110);
  northCap.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  northCap.addColorStop(0.7, 'rgba(240, 245, 255, 0.60)');
  northCap.addColorStop(1, 'rgba(200, 76, 28, 0.0)');
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, 2048, 110);

  const southCap = ctx.createLinearGradient(0, 1024, 0, 920);
  southCap.addColorStop(0, 'rgba(255, 255, 255, 0.90)');
  southCap.addColorStop(0.7, 'rgba(240, 245, 255, 0.50)');
  southCap.addColorStop(1, 'rgba(200, 76, 28, 0.0)');
  ctx.fillStyle = southCap;
  ctx.fillRect(0, 914, 2048, 110);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Neptune Texture (Deep saturated oceanic azure cobalt with Great Dark Spot)
export function createNeptuneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep oceanic blue gradient base
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0.0, '#102554');
  grad.addColorStop(0.3, '#1E4598');
  grad.addColorStop(0.5, '#2A5ECE');
  grad.addColorStop(0.7, '#1B4292');
  grad.addColorStop(1.0, '#0E1F46');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 2048, 1024);

  // Atmospheric bands and cirrus streaks
  for (let y = 80; y < 950; y += 12) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.18})`;
    ctx.fillRect(0, y, 2048, Math.random() * 4 + 1);
  }

  // Great Dark Spot (Storm)
  const spotGrad = ctx.createRadialGradient(850, 480, 0, 850, 480, 120);
  spotGrad.addColorStop(0, 'rgba(10, 20, 55, 0.90)');
  spotGrad.addColorStop(0.7, 'rgba(18, 38, 90, 0.65)');
  spotGrad.addColorStop(1, 'rgba(42, 94, 206, 0.0)');
  ctx.fillStyle = spotGrad;
  ctx.beginPath();
  ctx.ellipse(850, 480, 140, 75, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // White companion methane cloud around storm
  ctx.fillStyle = 'rgba(230, 245, 255, 0.60)';
  ctx.beginPath();
  ctx.ellipse(870, 410, 100, 18, 0.1, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Procedural Saturn Ring Texture (Cassini division + golden dust bands)
export function createSaturnRingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0.00, 'rgba(0, 0, 0, 0.0)');
  grad.addColorStop(0.15, 'rgba(217, 180, 120, 0.85)');
  grad.addColorStop(0.42, 'rgba(240, 205, 140, 0.95)');
  grad.addColorStop(0.53, 'rgba(10, 8, 5, 0.05)'); // Cassini Division gap
  grad.addColorStop(0.62, 'rgba(220, 185, 120, 0.85)');
  grad.addColorStop(0.88, 'rgba(190, 150, 95, 0.65)');
  grad.addColorStop(1.00, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Soft Glowing Energy Embers / Particle Texture
export function createGlowParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, 'rgba(255, 210, 120, 0.85)');
  grad.addColorStop(0.6, 'rgba(255, 130, 40, 0.35)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
