// Soft Aurora (port a WebGL puro del componente de reactbits.dev/backgrounds/soft-aurora, sin React ni OGL).
// Uso: <div data-aurora></div> + Aurora.mount(el, { color1, color2, ... }). Si no hay WebGL, deja el gradiente CSS de fondo.
(function () {
  const VERT = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

  const FRAG = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
#define TAU 6.28318

vec3 gradientHash(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 234.6)), dot(p, vec3(269.5, 183.3, 198.3)), dot(p, vec3(169.5, 283.3, 156.9)));
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}
float quinticSmooth(float t) { float t2 = t * t; float t3 = t * t2; return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3; }
vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(TAU * (c * t + d)); }
float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency; float y = py * frequency;
  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);
  vec3 g000 = gradientHash(vec3(fx, fy, fz)); vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz)); vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz)); vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz)); vec3 g111 = gradientHash(vec3(cx, cy, cz));
  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz)); float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz)); float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz)); float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz)); float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));
  float sx = quinticSmooth(x - fx); float sy = quinticSmooth(y - fy); float sz = quinticSmooth(pz - fz);
  float lx00 = mix(d000, d100, sx); float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx); float lx11 = mix(d011, d111, sx);
  float ly0 = mix(lx00, lx10, sy); float ly1 = mix(lx01, lx11, sy);
  return amplitude * mix(ly0, ly1, sz);
}
float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;
  float noiseVal = 0.0; float freq = uNoiseFreq; float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;
  for (float i = 0.0; i < 3.0; i += 1.0) { noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t); amp *= uOctaveDecay; freq *= 2.0; }
  float yBand = uv.y * 10.0 - uBandHeight * 10.0;
  return 0.3 * max(exp(uBandSpread * (1.0 - 1.1 * abs(noiseVal + yBand))), 0.0);
}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;
  vec2 shift = vec2(0.0);
  if (uEnableMouse) { shift = (uMouse - 0.5) * uMouseInfluence; }
  float glow1 = auroraGlow(t, shift);
  float glow2 = auroraGlow(t + uLayerOffset, shift);
  vec3 gradient1 = cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20));
  vec3 gradient2 = cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));
  vec3 col = 0.99 * glow1 * gradient1 * uColor1;
  col += 0.99 * glow2 * gradient2 * uColor2;
  col *= uBrightness;
  float alpha = clamp(length(col), 0.0, 1.0);
  gl_FragColor = vec4(col, alpha);
}`;

  const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); };

  function mount(el, o) {
    o = Object.assign({
      speed: 0.6, scale: 1.5, brightness: 1.0, color1: '#19e6ff', color2: '#b14bff',
      noiseFrequency: 2.5, noiseAmplitude: 1.0, bandHeight: 0.5, bandSpread: 1.0, octaveDecay: 0.1,
      layerOffset: 0, colorSpeed: 1.0, enableMouseInteraction: false, mouseInfluence: 0.5, maxDpr: 1.5
    }, o || {});
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return null;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    el.appendChild(canvas);

    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('aurora shader', gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); gl.useProgram(prog);

    // Un triángulo que cubre toda la pantalla (igual que Triangle de OGL)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'position'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

    const U = n => gl.getUniformLocation(prog, n);
    gl.uniform1f(U('uSpeed'), o.speed); gl.uniform1f(U('uScale'), o.scale); gl.uniform1f(U('uBrightness'), o.brightness);
    gl.uniform3fv(U('uColor1'), hex(o.color1)); gl.uniform3fv(U('uColor2'), hex(o.color2));
    gl.uniform1f(U('uNoiseFreq'), o.noiseFrequency); gl.uniform1f(U('uNoiseAmp'), o.noiseAmplitude);
    gl.uniform1f(U('uBandHeight'), o.bandHeight); gl.uniform1f(U('uBandSpread'), o.bandSpread);
    gl.uniform1f(U('uOctaveDecay'), o.octaveDecay); gl.uniform1f(U('uLayerOffset'), o.layerOffset);
    gl.uniform1f(U('uColorSpeed'), o.colorSpeed); gl.uniform1f(U('uMouseInfluence'), o.mouseInfluence);
    gl.uniform1i(U('uEnableMouse'), o.enableMouseInteraction ? 1 : 0);
    const uTime = U('uTime'), uRes = U('uResolution'), uMouse = U('uMouse');

    let cur = [0.5, 0.5], target = [0.5, 0.5];
    if (o.enableMouseInteraction) {
      el.addEventListener('mousemove', e => { const r = canvas.getBoundingClientRect(); target = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; });
      el.addEventListener('mouseleave', () => { target = [0.5, 0.5]; });
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr);
      canvas.width = Math.max(1, Math.round(el.clientWidth * dpr)); canvas.height = Math.max(1, Math.round(el.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform3f(uRes, canvas.width, canvas.height, canvas.width / canvas.height);
    }
    window.addEventListener('resize', resize); resize();

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, t0 = performance.now();
    function frame(now) {
      cur[0] += 0.05 * (target[0] - cur[0]); cur[1] += 0.05 * (target[1] - cur[1]);
      gl.uniform2f(uMouse, cur[0], cur[1]);
      gl.uniform1f(uTime, (now - t0) * 0.001 + 20);   // +20: arranca en una fase ya "formada", no en negro
      gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    // Pausa cuando la pestaña no se ve
    document.addEventListener('visibilitychange', () => { if (still) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
    return { canvas, gl, destroy() { cancelAnimationFrame(raf); canvas.remove(); } };
  }

  window.Aurora = { mount };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-aurora]').forEach(el => {
      let opts = {}; try { opts = JSON.parse(el.dataset.aurora || '{}'); } catch (e) {}
      if (mount(el, opts)) el.classList.add('aurora-on');
    });
  });
})();
