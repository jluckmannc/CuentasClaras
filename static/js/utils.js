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

// Actualizar todos los conectores según el paso
function actualizarConectores() {
  const conector1a2 = document.getElementById('conector-1-2');
  const conector2a3 = document.getElementById('conector-2-3');

  if (pasoActual >= 2) {
    // Si estamos en paso 2 o más, pintar conector del 1 al 2
    conector1a2.className = 'w-10 h-1 bg-primary-dark md:w-16';
  } else {
    conector1a2.className = 'w-10 h-1 bg-neutral-light md:w-16';
  }

  if (pasoActual >= 3) {
    // Si estamos en paso 3 o más, pintar conector del 2 al 3
    conector2a3.className = 'w-10 h-1 bg-primary-dark md:w-16';
  } else {
    conector2a3.className = 'w-10 h-1 bg-neutral-light md:w-16';
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

  actualizarConectores();
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
  if (pasoActual < 3) { // Evitamos seguir aumentando en vacío
    pasoActual++;
    actualizarVisualPasos();
    mostrarPasoCorrecto();
  }
}

// Inicializar la navegación del wizard
export function initializeWizardNavigation() {
  const botonPaso1 = document.getElementById('go-to-step-2');
  const botonPaso2 = document.getElementById('go-to-step-3');

  if (botonPaso1) {
    botonPaso1.addEventListener('click', () => {
      pasoActual = 2;
      actualizarVisualPasos();
      actualizarConectores();  // <---- Asegúrate de esto
      mostrarPasoCorrecto();
    });
  }

  if (botonPaso2) {
    botonPaso2.addEventListener('click', () => {
      pasoActual = 3;
      actualizarVisualPasos();
      actualizarConectores();  // <---- Asegúrate de esto también
      mostrarPasoCorrecto();
    });
  }

  actualizarVisualPasos();
  actualizarConectores();   // <---- También en la carga inicial
  mostrarPasoCorrecto();
}

