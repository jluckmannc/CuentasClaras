// utils.js
import { initializeGastosHandlers, crearGastoCard } from './domHandlers.js';
import { gastosList } from './stateManager.js';
// Estado de la navegación
export let pasoActual = 1;
// ✅ Datos de prueba SOLO si se accede directo a #paso3


// Funciones atómicas para pintar/deseleccionar conectores
function pintarConector(index) {
  const conectores = document.querySelectorAll('.wizard-connector');
  if (conectores[index]) {
    conectores[index].className = 'w-10 h-1 bg-primary-dark md:w-16';
  }
}

function despintarConector(index) {
  const conectores = document.querySelectorAll('.wizard-connector');
  if (conectores[index]) {
    conectores[index].className = 'w-10 h-1 bg-neutral-light md:w-16';
  }
}



// Actualizar visualmente los pasos (números y textos)
export function actualizarVisualPasos() {
  const steps = document.querySelectorAll('.wizard-step');

  steps.forEach((step, index) => {
    const circulo = step.querySelector('div');
    const texto = step.querySelector('p');

    if (index + 1 === pasoActual) {
      circulo.className = 'w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-white text-sm';
      texto.className = 'mt-2 text-xs md:text-sm font-body text-primary-dark';
    } else if (index + 1 < pasoActual) {
      circulo.className = 'w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-white text-sm';
      texto.className = 'mt-2 text-xs md:text-sm font-body text-primary-dark';
    } else {
      circulo.className = 'w-6 h-6 rounded-full bg-neutral-light flex items-center justify-center text-primary-dark text-sm';
      texto.className = 'mt-2 text-xs md:text-sm font-body text-neutral-mid';
    }
  });

}

// Mostrar u ocultar pantallas
export function mostrarPasoCorrecto() {
  const paso1 = document.getElementById('step-participants');
  const paso2 = document.getElementById('step-gastos');
  const paso3 = document.getElementById('step-resultados');

  if (pasoActual === 1) {
    paso1.classList.remove('hidden');
    paso2.classList.add('hidden');
    paso3.classList.add('hidden');
  } else if (pasoActual === 2) {
    paso1.classList.add('hidden');
    paso2.classList.remove('hidden');
    paso3.classList.add('hidden');
    initializeGastosHandlers();
  } else if (pasoActual === 3) {
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

// Avanzar al siguiente paso
export function pasoSiguiente() {
  // Primero hacemos scroll hasta arriba
  smoothScrollToTop(() => {
    // 🔥 Solo después de llegar arriba se ejecuta esto

    if (pasoActual === 1) {
      const barra = document.querySelector('#conector-1-2 .barra-interna');
      if (barra) {
        barra.style.width = '100%';

        barra.addEventListener('transitionend', function onTransitionEnd(e) {
          if (e.propertyName === 'width') {
            barra.removeEventListener('transitionend', onTransitionEnd);
            pasoActual = 2;
            actualizarVisualPasos();
            mostrarPasoCorrecto();
          }
        }, { once: true });
      }
    } else if (pasoActual === 2) {
      const barra = document.querySelector('#conector-2-3 .barra-interna');
      if (barra) {
        barra.style.width = '100%';

        barra.addEventListener('transitionend', function onTransitionEnd(e) {
          if (e.propertyName === 'width') {
            barra.removeEventListener('transitionend', onTransitionEnd);
            pasoActual = 3;
            actualizarVisualPasos();
            mostrarPasoCorrecto();
          }
        }, { once: true });
      }
    }

  });
}

export function initializeWizardNavigation() {
  const botonPaso1 = document.getElementById('go-to-step-2');
  const botonPaso2 = document.getElementById('go-to-step-3');

  // Detectar el hash en la URL al cargar
  if (window.location.hash === '#paso2') {
    pasoActual = 2;

    // Cargar visual
    initializeGastosHandlers();

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
    pasoActual = 3;
  } else {
    pasoActual = 1;
  }

  if (botonPaso1) {
    botonPaso1.addEventListener('click', pasoSiguiente);
  }

  if (botonPaso2) {
    botonPaso2.addEventListener('click', pasoSiguiente);
  }

  actualizarVisualPasos();
  mostrarPasoCorrecto();
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