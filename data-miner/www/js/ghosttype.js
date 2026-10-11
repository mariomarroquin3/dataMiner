// Ghost Type (recreación en JS puro): el texto base se escribe solo; luego una "sugerencia fantasma" aparece en tenue,
// se acepta con un barrido de color, se borra y sigue la siguiente. Arranca al entrar en pantalla y se pausa al pasar el mouse.
// Uso: GhostType.mount(el, { text, completions, accent, typeSpeed, streamSpeed, thinkDelay, acceptDelay, holdDelay })
window.GhostType = (function () {
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mount(el, o) {
    o = Object.assign({ text: '', completions: [], accent: '#19e6ff', typeSpeed: 45, streamSpeed: 70, thinkDelay: 600, acceptDelay: 1200, holdDelay: 1800, loop: true }, o || {});
    el.classList.add('gt');
    el.innerHTML = `<span class="gt-base"></span><span class="gt-ghost"></span><span class="gt-caret"></span>`;
    const base = el.querySelector('.gt-base'), ghost = el.querySelector('.gt-ghost'), caret = el.querySelector('.gt-caret');
    const st = { pausa: false, vivo: true };
    el.addEventListener('mouseenter', () => st.pausa = true); el.addEventListener('mouseleave', () => st.pausa = false);
    const pausaOk = async () => { while (st.pausa && st.vivo) await espera(120); };
    const jitter = ms => ms * (0.65 + Math.random() * 0.7);

    if (quieto || !o.completions.length) { base.textContent = o.text; caret.hidden = true; return { destroy() { st.vivo = false; } }; }

    async function escribir(destino, texto, vel) {
      for (const ch of texto) { if (!st.vivo) return; await pausaOk(); destino.textContent += ch; await espera(jitter(vel)); }
    }
    async function fluir(texto) {   // palabra por palabra
      const palabras = texto.split(/(\s+)/);
      for (const w of palabras) { if (!st.vivo) return; await pausaOk(); ghost.textContent += w; if (w.trim()) await espera(jitter(o.streamSpeed)); }
    }
    async function ciclo() {
      await escribir(base, o.text, o.typeSpeed);
      let i = 0;
      do {
        const c = o.completions[i % o.completions.length];
        caret.classList.add('idle'); await espera(o.thinkDelay); caret.classList.remove('idle');
        ghost.textContent = ''; ghost.className = 'gt-ghost';
        await fluir(c);
        await espera(o.acceptDelay);
        // aceptar: pasa a texto normal con barrido de color
        ghost.classList.add('acepta'); await espera(900);
        ghost.classList.add('fijo');
        await espera(o.holdDelay);
        // borrar: selección y fuera
        ghost.classList.add('sel'); await espera(450);
        ghost.textContent = ''; ghost.className = 'gt-ghost';
        i++;
      } while (st.vivo && (o.loop || i < o.completions.length));
    }
    const arrancar = () => { if (el.dataset.gtOn) return; el.dataset.gtOn = '1'; ciclo(); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { arrancar(); io.disconnect(); } }, { threshold: .3 });
      io.observe(el);
    } else arrancar();
    return { destroy() { st.vivo = false; } };
  }
  return { mount };
})();
