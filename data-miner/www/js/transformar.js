// Animación "transformar": los archivos subidos entran por la izquierda, se trituran en un eje luminoso
// y del eje salen chips con los resultados reales (tablas, filas, calidad, columnas protegidas).
// Uso: Transformar.iniciar(el, nombres) → Transformar.resultados(el, chips) → await Transformar.terminar(el)
window.Transformar = (function () {
  const TIRAS = 6;
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const estado = new WeakMap();

  function armar(el) {
    el.innerHTML = `<div class="tf-docs"></div>
      <div class="tf-axis"><div class="tf-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div></div>
      <div class="tf-results"></div>`;
  }

  function documento(nombre) {
    const doc = document.createElement('div'); doc.className = 'tf-doc';
    const ext = (nombre.split('.').pop() || '').toLowerCase();
    const cara = `<div class="tf-face"><div class="tf-head"><i></i><span>${ext}</span></div>
      ${Array.from({ length: 7 }, (_, i) => `<div class="tf-line" style="width:${[82, 60, 92, 48, 76, 64, 88][i]}%"></div>`).join('')}
      <div class="tf-name">${nombre.replace(/[<>&"]/g, '')}</div></div>`;
    for (let i = 0; i < TIRAS; i++) {
      const tira = document.createElement('div'); tira.className = 'tf-strip';
      tira.style.setProperty('--i', i);
      tira.innerHTML = cara;
      doc.appendChild(tira);
    }
    return doc;
  }

  function particulas(el, n) {
    const axis = el.querySelector('.tf-axis');
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span'); p.className = 'tf-p';
      const a = Math.random() * Math.PI * 2, d = 40 + Math.random() * 110;
      p.style.setProperty('--dx', Math.cos(a) * d + 'px'); p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      p.style.setProperty('--t', 600 + Math.random() * 500 + 'ms');
      p.style.background = i % 3 ? 'var(--cian)' : 'var(--vio-2)';
      axis.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  // Un documento recorre el eje y se tritura. Devuelve cuando termina.
  async function pasar(el, nombre) {
    const docs = el.querySelector('.tf-docs');
    const d = documento(nombre); docs.appendChild(d);
    await espera(30); d.classList.add('entra');
    await espera(1300);
    d.classList.add('triturar'); particulas(el, 16); el.querySelector('.tf-axis').classList.add('pulso');
    setTimeout(() => el.querySelector('.tf-axis').classList.remove('pulso'), 500);
    await espera(900); d.remove();
  }

  async function iniciar(el, nombres) {
    armar(el); el.hidden = false;
    const st = { activo: true, chips: null, lote: nombres.slice(0, 6) };
    estado.set(el, st);
    // Pasa los archivos uno tras otro; si el servidor aún no responde, repite la cola
    (async () => {
      while (st.activo) {
        for (const n of st.lote) { if (!st.activo) break; await pasar(el, n); }
        if (st.activo) await espera(300);
      }
    })();
  }

  async function resultados(el, chips) {
    const st = estado.get(el); if (!st) return;
    st.activo = false;
    const res = el.querySelector('.tf-results');
    for (const c of chips.slice(0, 6)) {
      const chip = document.createElement('div'); chip.className = 'tf-chip' + (c.tipo ? ' ' + c.tipo : '');
      chip.innerHTML = `<b>${c.valor}</b><span>${c.texto}</span>`;
      res.appendChild(chip);
      particulas(el, 6);
      await espera(40); chip.classList.add('sale');
      await espera(380);
    }
  }

  async function terminar(el) { await espera(1100); el.classList.add('cerrar'); await espera(450); el.hidden = true; el.classList.remove('cerrar'); el.innerHTML = ''; }

  return { iniciar, resultados, terminar };
})();
