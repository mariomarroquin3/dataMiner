// Placa de escaneo (inspirada en el bloque "Features 15"): una matriz de puntos en canvas donde un ping de sonar
// sale de cada hallazgo y enciende los puntos a su paso. Los pines (los hallazgos) se colocan por porcentaje de ancho.
// Uso: Escaner.mount(canvas, { pines: [{ x: 12.5, color: '#19e6ff' }, ...], paso: 11, periodo: 2600 })
window.Escaner = (function () {
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rgb = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };

  function mount(canvas, o) {
    o = Object.assign({ pines: [], paso: 11, periodo: 2600, radio: 1.4, base: 0.13, ancho: 24, alcance: 300 }, o || {});
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, puntos = [], raf = 0, t0 = performance.now(), activo = 0;
    const pines = o.pines.map(p => ({ ...p, c: rgb(p.color) }));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      puntos = [];
      const ox = (W % o.paso) / 2, oy = (H % o.paso) / 2;
      for (let y = oy; y < H; y += o.paso) for (let x = ox; x < W; x += o.paso) puntos.push(x, y);
      pines.forEach(p => { p.px = W * p.x / 100; p.py = H * (p.y ?? 50) / 100; });
    }
    function frame(now) {
      const t = (now - t0) % o.periodo, i = Math.floor((now - t0) / o.periodo) % Math.max(1, pines.length);
      activo = i;
      const p = pines[i], r = (t / o.periodo) * o.alcance, fade = 1 - t / o.periodo;
      ctx.clearRect(0, 0, W, H);
      for (let k = 0; k < puntos.length; k += 2) {
        const x = puntos[k], y = puntos[k + 1];
        let a = o.base, col = '255,255,255';
        if (p) {
          const d = Math.hypot(x - p.px, y - p.py), dd = Math.abs(d - r);
          if (dd < o.ancho) { const g = (1 - dd / o.ancho) * fade; a = o.base + g * 0.85; col = p.c.join(','); }
          else if (d < 14) { a = 0.5; col = p.c.join(','); }
        }
        ctx.fillStyle = `rgba(${col},${a})`;
        ctx.beginPath(); ctx.arc(x, y, o.radio, 0, 6.2832); ctx.fill();
      }
      // halo del pin activo
      if (p) { const g = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, 60); g.addColorStop(0, `rgba(${p.c.join(',')},${0.22 * fade})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(p.px - 60, p.py - 60, 120, 120); }
      canvas.dispatchEvent(new CustomEvent('ping', { detail: { indice: i, fase: t / o.periodo } }));
      if (!quieto) raf = requestAnimationFrame(frame);
    }
    window.addEventListener('resize', resize); resize();
    raf = requestAnimationFrame(frame);
    document.addEventListener('visibilitychange', () => { if (quieto) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(frame); });
    return { destroy() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); }, get activo() { return activo; } };
  }
  return { mount };
})();
