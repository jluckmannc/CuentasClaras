import { pasoActual, actualizarVisualPasos, mostrarPasoCorrecto } from './utils.js';

export function renderResultados(transacciones) {
  const contenedor = document.getElementById('resultado-contenedor');
  contenedor.innerHTML = '';

  if (!transacciones.length) {
    contenedor.innerHTML = `<div class="bg-white rounded-2xl shadow-md p-6 text-sm text-neutral-mid text-center">
      No hay deudas que mostrar.
    </div>`;
    return;
  }

  // Agrupar por destinatario
  const mapa = {};
  transacciones.forEach(linea => {
    const [deudor, , monto, , acreedor] = linea.split(' ');
    if (!mapa[acreedor]) mapa[acreedor] = [];
    mapa[acreedor].push({ deudor, monto: monto.replace('$', '') });
  });

  for (const [acreedor, deudas] of Object.entries(mapa)) {
    const bloque = document.createElement('div');
    bloque.className = 'bg-white rounded-2xl shadow-md p-6';

    const titulo = document.createElement('h3');
    titulo.className = 'text-primary-dark font-bold text-base mb-2';
    titulo.innerHTML = `👉 A <span class="text-secondary">${acreedor}</span>:`;
    bloque.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.className = 'text-sm text-neutral-mid list-disc list-inside space-y-1';

    deudas.forEach(({ deudor, monto }) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${deudor}</strong> paga <span class="text-primary-dark">$${parseInt(monto).toLocaleString('es-CL')}</span>`;
      lista.appendChild(item);
    });

    bloque.appendChild(lista);
    contenedor.appendChild(bloque);
  }

  actualizarVisualPasos();
  mostrarPasoCorrecto();
}

export function copiarResultadosTexto() {
  const contenedor = document.getElementById('resultado-contenedor');
  const bloques = contenedor.querySelectorAll('div');

  let texto = '📌 Resumen de pagos:\n\n';
  bloques.forEach(div => {
    const title = div.querySelector('h3')?.innerText;
    const items = div.querySelectorAll('li');
    texto += `${title}\n`;
    items.forEach(li => texto += `- ${li.innerText}\n`);
    texto += '\n';
  });

  navigator.clipboard.writeText(texto.trim()).then(() => {
    mostrarToastResultado('¡Resumen copiado al portapapeles!');
  }).catch(() => {
    mostrarToastResultado('Error al copiar 😕');
  });
}

function mostrarToastResultado(mensaje) {
  const toast = document.getElementById('toastResultado');
  toast.textContent = mensaje;
  toast.classList.remove('hidden', 'opacity-0');
  toast.classList.add('opacity-100');

  setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
  }, 2000);

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2500);
}
