// utils.js
import { initializeGastosHandlers, crearGastoCard, showError } from './domHandlers.js';
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
    console.log("#paso-3");
    
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