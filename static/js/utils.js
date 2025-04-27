// utils.js

// Estado de la navegación
export let pasoActual = 1;

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

  if (pasoActual === 1) {
    paso1.classList.remove('hidden');
    paso2.classList.add('hidden');
  } else if (pasoActual === 2) {
    paso1.classList.add('hidden');
    paso2.classList.remove('hidden');
  }
}

// Avanzar al siguiente paso
export function pasoSiguiente() {
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
}



export function initializeWizardNavigation() {
  const botonPaso1 = document.getElementById('go-to-step-2');
  const botonPaso2 = document.getElementById('go-to-step-3');

  if (botonPaso1) {
    botonPaso1.addEventListener('click', pasoSiguiente);
  }

  if (botonPaso2) {
    botonPaso2.addEventListener('click', pasoSiguiente);
  }

  actualizarVisualPasos();
  mostrarPasoCorrecto();
}

