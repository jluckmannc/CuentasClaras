// utils.js
import { initializeGastosHandlers, crearGastoCard } from './domHandlers.js';
import { gastosList } from './stateManager.js';
import { enviarDatosAGestionar, renderResultados } from './resultRenderer.js';

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
  const paso3 = document.getElementById('step-resultados');

  if (getPasoActual() === 1) {
    paso1.classList.remove('hidden');
    paso2.classList.add('hidden');
    paso3.classList.add('hidden');
  } else if (getPasoActual() === 2) {
    paso1.classList.add('hidden');
    paso2.classList.remove('hidden');
    paso3.classList.add('hidden');
    initializeGastosHandlers();
  } else if (getPasoActual() === 3) {
    enviarDatosAGestionar().then(res => {
      // if (res?.resumen) {
        
        renderResultados(res.resumen);
      // }
    });
    paso1.classList.add('hidden');
    paso2.classList.add('hidden');
    paso3.classList.remove('hidden');
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


export function pasoSiguiente() {
  smoothScrollToTop(() => {
    const actual = getPasoActual();
    const barra = document.querySelector(`#conector-${actual}-${actual + 1} .barra-interna`);
    console.log(barra);
    
    if (barra) {
      barra.style.width = '100%';
      barra.addEventListener('transitionend', function onTransitionEnd(e) {
        if (e.propertyName === 'width') {
          barra.removeEventListener('transitionend', onTransitionEnd);
          setPasoActual(actual + 1);
        }
      }, { once: true });
    } else {
      setPasoActual(actual + 1);
    }
  });
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
    setPasoActual(3);
  } else {
    setPasoActual(1);
  }

  if (botonPaso1) {
    botonPaso1.addEventListener('click', pasoSiguiente);
  }

  if (botonPaso2) {
    botonPaso2.addEventListener('click', pasoSiguiente);
  }
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