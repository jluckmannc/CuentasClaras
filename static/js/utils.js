// utils.js
import { initializeGastosHandlers, crearGastoCard, showError, initPasoRepartoNudge } from './domHandlers.js';
import { gastosList } from './stateManager.js';
import { enviarDatosAGestionar, renderResultados } from './resultRenderer.js';
import { participantsList } from './stateManager.js';


// Estado de la navegación
let _pasoActual = 1;

export function getPasoActual() {
  return _pasoActual;
}

export function setPasoActual(valor) {
  _pasoActual = valor;
  
  renderizarSeccionActual();
}

// Mostrar u ocultar pantallas
export function renderizarSeccionActual() {
  const paso1 = document.getElementById('step-participants');
  const paso2 = document.getElementById('step-gastos');
  const paso3 = document.getElementById('step-reparto');
  const paso4 = document.getElementById('step-resultados');

  if (getPasoActual() === 1) {
    paso1.classList.remove('hidden');
    paso2.classList.add('hidden');
    paso3.classList.add('hidden');
    paso4.classList.add('hidden');
  } else if (getPasoActual() === 2) {
    paso1.classList.add('hidden');
    paso2.classList.remove('hidden');
    paso3.classList.add('hidden');
    paso4.classList.add('hidden');
    initializeGastosHandlers();
    // 🧼 Limpiar contenedor visual
    const gastosContainer = document.getElementById('gastos-container');
    gastosContainer.innerHTML = '';

    // 🔁 Volver a renderizar gastos actuales
    gastosList.forEach((gasto, index) => {
      const card = crearGastoCard(
        gasto.expense_name,
        gasto.expense_amount,
        gasto.payer,
        gasto.participants,
        index
      );
      gastosContainer.appendChild(card);
    });

    // Ocultar botón continuar si ya no hay gastos
    const continuarBtn = document.getElementById('go-to-step-3');
    if (gastosList.length === 0) {
      continuarBtn.classList.add('hidden');
    } else {
      continuarBtn.classList.remove('hidden');
    }
  } else if (getPasoActual() === 3) {
    paso1.classList.add('hidden');
    paso2.classList.add('hidden');
    paso3.classList.remove('hidden');
    paso4.classList.add('hidden');
  } 
   else if (getPasoActual() === 4) {
    enviarDatosAGestionar().then(res => {
        renderResultados(res.resumen);
    });
    paso1.classList.add('hidden');
    paso2.classList.add('hidden');
    paso3.classList.add('hidden');
    paso4.classList.remove('hidden');
  }
}


function smoothScrollToTop(callback) {
  if (window.scrollY === 0) {
    // Ya estamos arriba
    callback();
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const checkIfScrolledToTop = () => {
      if (window.scrollY === 0) {
        window.removeEventListener('scroll', checkIfScrolledToTop);
        callback();
      }
    };

    window.addEventListener('scroll', checkIfScrolledToTop);
  }
}


export function cambiarPaso(nuevoPaso) {
  const pasoActual = getPasoActual();
  if (Math.abs(nuevoPaso - pasoActual) <= 1) {
    // Comportamiento original para pasos adyacentes
    const direccion = nuevoPaso > pasoActual ? 'avanzar' : 'retroceder';
    const conectorId = `#conector-${Math.min(pasoActual, nuevoPaso)}-${Math.max(pasoActual, nuevoPaso)}`;
    const barra = document.querySelector(conectorId);
    smoothScrollToTop(() => {
      if (barra) {
        barra.style.width = direccion === 'avanzar' ? '100%' : '0%';
        barra.addEventListener('transitionend', function onTransitionEnd(e) {
          if (e.propertyName === 'width') {
            barra.removeEventListener('transitionend', onTransitionEnd);
            setPasoActual(nuevoPaso);
          }
        }, { once: true });
      } else {
        setPasoActual(nuevoPaso);
      }
    });
  } else {
    // Recursivo/iterativo para saltos de más de un paso
    const pasos = [];
    if (nuevoPaso > pasoActual) {
      for (let i = pasoActual; i < nuevoPaso; i++) {
        pasos.push([i, i + 1, 'avanzar']);
      }
    } else {
      for (let i = pasoActual; i > nuevoPaso; i--) {
        pasos.push([i, i - 1, 'retroceder']);
      }
    }

    const avanzarPaso = (index) => {
      if (index >= pasos.length) {
        console.log(`[cambiarPaso] Todos los pasos completados - setPasoActual(${nuevoPaso})`);
        setPasoActual(nuevoPaso);
        return;
      }
      const [from, to, direccion] = pasos[index];
      const conectorId = `#conector-${Math.min(from, to)}-${Math.max(from, to)}`;
      const barra = document.querySelector(conectorId);
      smoothScrollToTop(() => {
        if (barra) {
          barra.style.width = direccion === 'avanzar' ? '100%' : '0%';
          barra.addEventListener('transitionend', function onTransitionEnd(e) {
            if (e.propertyName === 'width') {
              barra.removeEventListener('transitionend', onTransitionEnd);
              setPasoActual(to);
              avanzarPaso(index + 1);
            }
          }, { once: true });
        } else {
          setPasoActual(to);
          avanzarPaso(index + 1);
        }
      });
    };

    avanzarPaso(0);
  }
}

export function pasoSiguiente() {
  cambiarPaso(getPasoActual() + 1);
}

export function pasoAnterior() {
  cambiarPaso(getPasoActual() - 1);
}


export function initializeWizardNavigation() {
  const botonPaso1 = document.getElementById('go-to-step-2');
  const botonPaso2 = document.getElementById('go-to-step-3');

  // Detectar el hash en la URL al cargar
  if (window.location.hash === '#paso2') {

    setPasoActual(2);
    if (gastosList.length > 0) {
      const gastosContainer = document.getElementById('gastos-container');
      gastosContainer.innerHTML = ''; // limpiar por si acaso
    
      gastosList.forEach((gasto, index) => {
        const card = crearGastoCard(
          gasto.expense_name,
          gasto.expense_amount,
          gasto.payer,
          gasto.participants,
          index
        );
        gastosContainer.appendChild(card);
      });
    
      // Mostrar botón continuar
      document.getElementById('go-to-step-3')?.classList.remove('hidden');
    }

  } else if (window.location.hash === '#paso3') {
    initPasoRepartoNudge({ demo: true });
    
    setPasoActual(3);
    activarWizardPaso(3);
    cambiarPaso(3);
    
  } else if (window.location.hash === '#paso4') {
    setPasoActual(1);
    activarWizardPaso(2);
    activarWizardPaso(3);
    activarWizardPaso(4);
    cambiarPaso(4);
  }
   else {
    setPasoActual(1);
  }

  botonPaso1.addEventListener('click', () => {
    if (participantsList.length >= 2) {
      pasoSiguiente();
      activarWizardPaso(2);
    } else {
      const errorMessage = document.getElementById('error-message');
      showError(errorMessage, "Debes agregar al menos 2 participantes para continuar.")
    }
  });

  botonPaso2.addEventListener('click', () => {
    pasoSiguiente();
    activarWizardPaso(3);
  });

}

export function activarWizardPaso(paso) {
  
  const circulo = document.getElementById(`wizard-${paso}`);
  const step = circulo?.parentElement;
  const texto = step?.querySelector('p');

  if (!circulo || !texto) return;

  circulo.className = 'w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-white text-sm';
  texto.className = 'mt-2 text-xs md:text-sm font-body text-primary-dark';
  
}

export function desactivarWizardPaso(paso) {
  const circulo = document.getElementById(`wizard-${paso}`);
  const step = circulo?.parentElement;
  const texto = step?.querySelector('p');

  if (!circulo || !texto) return;

  circulo.className = 'w-6 h-6 rounded-full bg-neutral-light flex items-center justify-center text-primary-dark text-sm';
  texto.className = 'mt-2 text-xs md:text-sm font-body text-neutral-mid';
}


export function setParticipantButtonState(button, isSelected) {
  button.classList.toggle('bg-secondary', isSelected);
  button.classList.toggle('bg-white', !isSelected);
  button.classList.toggle('text-white', isSelected);
  button.classList.toggle('text-primary-dark', !isSelected);
  button.classList.toggle('border-primary-dark', true);
  button.classList.toggle('hover:bg-primary-light', !isSelected);
}

export function showToast(message) {
  const toast = document.getElementById('toastSuccess');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}


// utils.js

export function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function isInViewport(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
}

export function restartAnimationClass(el, className) {
  if (!el) return;
  el.classList.remove(className);
  // reflow para reiniciar animación CSS
  void el.offsetWidth;
  el.classList.add(className);
}

export function ensureRecalcNudgeStyles() {
  // Inyecta SOLO si no existe. Puedes mover esto a tu CSS global después.
  if (document.getElementById("recalc-nudge-styles")) return;

  const style = document.createElement("style");
  style.id = "recalc-nudge-styles";
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      .recalc-attn, .recalc-ping, .recalc-pill { animation: none !important; transition: none !important; }
    }

    @keyframes recalcFlash {
      0%   { box-shadow: 0 0 0 0 rgba(36,115,188,.00); transform: translateY(0); }
      15%  { box-shadow: 0 0 0 6px rgba(36,115,188,.18); }
      35%  { box-shadow: 0 0 0 10px rgba(36,115,188,.10); }
      100% { box-shadow: 0 0 0 0 rgba(36,115,188,.00); transform: translateY(0); }
    }

    .recalc-attn {
      color: rgb(0, 91, 159);
      text-decoration: underline;
      animation: recalcFlash 900ms ease-out 1;
    }

    .recalc-pill {
      position: fixed;
      left: 50%;
      bottom: 16px;
      transform: translateX(-50%);
      z-index: 50;
      display: none;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 9999px;
      background: rgba(255,255,255,.92);
      border: 1px solid rgba(0,0,0,.08);
      box-shadow: 0 10px 30px rgba(0,0,0,.10);
      font-size: 13px;
      color: rgba(0,0,0,.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      user-select: none;
    }

    .recalc-pill strong { color: rgb(0, 91, 159); font-weight: 700; }

    @keyframes pillPulse {
      0%   { box-shadow: 0 10px 30px rgba(0,0,0,.10); }
      50%  { box-shadow: 0 12px 34px rgba(36,115,188,.20); }
      100% { box-shadow: 0 10px 30px rgba(0,0,0,.10); }
    }

    .recalc-pill.recalc-ping { animation: pillPulse 1.1s ease-in-out 1; }
  `;
  document.head.appendChild(style);
}

export function createRecalcPill({
  text = "Cambios sin aplicar · <strong>Recalcular</strong>",
  ariaLive = "polite",
} = {}) {
  const pill = document.createElement("button");
  pill.type = "button";
  pill.className = "recalc-pill";
  pill.setAttribute("aria-live", ariaLive);
  pill.innerHTML = text;
  document.body.appendChild(pill);
  return pill;
}

export function setupRecalcNudge({
  stepEl,
  recalcButtons = [],
  watchSelector = "input, select",
  nudgeEveryMs = 6000,
  demoDirtyEveryMs = 0, // 0 = off
} = {}) {
  if (!stepEl) return () => {};

  ensureRecalcNudgeStyles();

  const watched = stepEl.querySelectorAll(watchSelector);
  const buttons = recalcButtons.filter(Boolean);

  const pill = createRecalcPill();

  let dirty = false;
  let nudgeTimer = null;
  let demoTimer = null;

  const flashBtn = (btn) => {
    restartAnimationClass(btn, "recalc-attn");
    // limpiar clase después (para que no quede subrayado permanente)
    window.setTimeout(() => btn.classList.remove("recalc-attn"), 1000);
  };

  const pingPill = () => {
    restartAnimationClass(pill, "recalc-ping");
    window.setTimeout(() => pill.classList.remove("recalc-ping"), 1200);
  };

  const updateAffordance = () => {
    if (!dirty) {
      pill.style.display = "none";
      return;
    }

    const visibleBtn = buttons.find(isInViewport);

    if (visibleBtn) {
      pill.style.display = "none";
      flashBtn(visibleBtn);
    } else {
      pill.style.display = "inline-flex";
      pingPill();
    }
  };

  const setDirty = (val) => {
    dirty = Boolean(val);
    updateAffordance();

    if (dirty && !nudgeTimer) {
      nudgeTimer = window.setInterval(updateAffordance, nudgeEveryMs);
    }
    if (!dirty && nudgeTimer) {
      window.clearInterval(nudgeTimer);
      nudgeTimer = null;
    }
  };

  // Evento: cambia cualquier campo => dirty true
  const onChange = () => setDirty(true);
  watched.forEach((el) => {
    el.addEventListener("input", onChange, { passive: true });
    el.addEventListener("change", onChange, { passive: true });
  });

  // Evento: click en recalcular => dirty false (por ahora demo)
  const onRecalc = () => setDirty(false);
  buttons.forEach((b) => b.addEventListener("click", onRecalc));

  // Scroll/resize => re-evaluar
  const onViewport = () => dirty && updateAffordance();
  window.addEventListener("scroll", onViewport, { passive: true });
  window.addEventListener("resize", onViewport, { passive: true });

  // Pill click: lleva al primer botón recalcular disponible
  pill.addEventListener("click", () => {
    const target = buttons.find(Boolean);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => flashBtn(target), 350);
  });

  // Demo: cada X ms simula que “hubo cambios”
  if (demoDirtyEveryMs > 0) {
    demoTimer = window.setInterval(() => setDirty(true), demoDirtyEveryMs);
  }

  // cleanup (por si navegas entre pasos y quieres desmontar)
  return function cleanup() {
    watched.forEach((el) => {
      el.removeEventListener("input", onChange);
      el.removeEventListener("change", onChange);
    });
    buttons.forEach((b) => b.removeEventListener("click", onRecalc));
    window.removeEventListener("scroll", onViewport);
    window.removeEventListener("resize", onViewport);

    if (nudgeTimer) window.clearInterval(nudgeTimer);
    if (demoTimer) window.clearInterval(demoTimer);

    pill.remove();
  };
}
