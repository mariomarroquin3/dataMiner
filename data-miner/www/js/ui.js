// Piezas compartidas de la interfaz interna de VeriMine: barra de navegación y utilidades.
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = n => typeof n === 'number' ? n.toLocaleString('es') : esc(n);
  const usd = v => Number(v) > 0 ? '$' + Math.round(Number(v)).toLocaleString('en-US') : '—';
  const q = location.search.includes('mock=1') ? '?mock=1' : '';

  // Barra de la plataforma (ya adentro): logo + subtítulo, estado, volver al inicio y cambiar entre Agente y Mi inventario (tablero.html).
  // data-nav="agente" | "tablero" indica la página actual
  function nav(actual) {
    const otra = actual === 'tablero' ? `<a class="vm-navbtn" href="app.html${q}">Agente</a>` : `<a class="vm-navbtn" href="tablero.html${q}">Mi inventario</a>`;
    return `<nav class="vm-nav"><div class="vm-nav-in">
      <a class="vm-logo" href="index.html" aria-label="VeriMine, inicio"><img src="img/verimine.png" alt="VeriMine"></a>
      <div class="vm-nav-r">
        <span class="vm-estado" id="estado"><i></i><span>Listo</span></span>
        <a class="vm-navbtn" href="index.html">← Inicio</a>
        ${otra}
      </div>
    </div></nav>`;
  }
  document.addEventListener('DOMContentLoaded', () => {
    const slot = document.querySelector('[data-nav]');
    if (slot) slot.outerHTML = nav(slot.dataset.nav);
  });
  const estado = (t, tipo) => { const e = $('#estado'); if (!e) return; e.querySelector('span').textContent = t; e.className = 'vm-estado' + (tipo ? ' ' + tipo : ''); };

  window.VM = { $, esc, num, usd, estado, q };
})();
