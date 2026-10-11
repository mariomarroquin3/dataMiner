(() => {
  const container = document.getElementById("color-bends");
  if (!container) {
    console.error("Color Bends background container was not found.");
    return;
  }

  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) {
    console.error("Color Bends requires WebGL; showing its CSS fallback instead.");
    return;
  }

  const vertexShaderSource = `
    attribute vec2 position;
    varying vec2 uv;
    void main() {
      uv = position * 0.5 + 0.5;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;
    varying vec2 uv;
    uniform vec2 canvasSize;
    uniform vec2 pointer;
    uniform float time;

    vec2 bend(vec2 p) {
      return sin(1.5 * p.yx + 2.0 * cos(p));
    }

    void main() {
      float t = time * 0.2;
      vec2 p = uv * 2.0 - 1.0;
      p += pointer * 0.05;
      vec2 rotated = vec2(-p.y, p.x);
      vec2 q = vec2(rotated.x * canvasSize.x / canvasSize.y, rotated.y);
      q /= 1.15;
      q /= 0.5 + 0.2 * dot(q, q);
      q += 0.2 * cos(t) - 7.56;
      q += (pointer - rotated) * 0.1;

      vec2 warped = q;
      vec2 firstBend = bend(warped);
      warped += (firstBend - warped) * 0.15;

      vec3 color = vec3(0.0);
      float coverage = 0.0;
      for (int i = 0; i < 2; i++) {
        vec2 samplePoint = warped - float(i) * 0.01;
        vec2 ripple = bend(samplePoint);
        float distanceToBend = length(ripple + sin(5.0 * ripple.y - 3.0 * t + float(i)) / 4.0);
        float band = 1.0 - exp(-6.0 / exp(6.0 * distanceToBend));
        vec3 purple = i == 0 ? vec3(0.39, 0.09, 0.93) : vec3(0.83, 0.13, 1.0);
        color += purple * band;
        coverage = max(coverage, band);
      }

      float grain = fract(sin(dot(gl_FragCoord.xy + vec2(time), vec2(12.9898, 78.233))) * 43758.5453);
      color = clamp(color * 1.5 + (grain - 0.5) * 0.08, 0.0, 1.0);
      gl_FragColor = vec4(color * coverage, coverage);
    }
  `;

  const compileShader = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) {
      console.error("Unable to create a Color Bends shader.");
      return null;
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Unable to compile the Color Bends shader:", gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return;

  const program = gl.createProgram();
  if (!program) {
    console.error("Unable to create the Color Bends shader program.");
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to link the Color Bends shader program:", gl.getProgramInfoLog(program));
    return;
  }

  const vertices = gl.createBuffer();
  if (!vertices) {
    console.error("Unable to create the Color Bends canvas buffer.");
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  gl.useProgram(program);
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const sizeLocation = gl.getUniformLocation(program, "canvasSize");
  const pointerLocation = gl.getUniformLocation(program, "pointer");
  const timeLocation = gl.getUniformLocation(program, "time");
  const pointer = [0, 0];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  const draw = (now = 0) => {
    gl.uniform1f(timeLocation, reducedMotion ? 0 : now * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const animate = (now) => {
    draw(now);
    window.requestAnimationFrame(animate);
  };

  const resize = () => {
    const bounds = container.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width * pixelRatio));
    height = Math.max(1, Math.round(bounds.height * pixelRatio));
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    gl.viewport(0, 0, width, height);
    gl.uniform2f(sizeLocation, bounds.width, bounds.height);
    draw();
  };

  const handlePointerMove = (event) => {
    if (reducedMotion) return;
    const bounds = container.getBoundingClientRect();
    pointer[0] = ((event.clientX - bounds.left) / Math.max(1, bounds.width)) * 2 - 1;
    pointer[1] = -(((event.clientY - bounds.top) / Math.max(1, bounds.height)) * 2 - 1);
    gl.uniform2f(pointerLocation, pointer[0], pointer[1]);
  };

  const resizeObserver = "ResizeObserver" in window ? new ResizeObserver(resize) : null;
  if (resizeObserver) resizeObserver.observe(container);
  else window.addEventListener("resize", resize);
  container.addEventListener("pointermove", handlePointerMove);
  canvas.setAttribute("aria-hidden", "true");
  container.appendChild(canvas);
  container.classList.add("is-active");
  resize();
  if (!reducedMotion) window.requestAnimationFrame(animate);
})();
