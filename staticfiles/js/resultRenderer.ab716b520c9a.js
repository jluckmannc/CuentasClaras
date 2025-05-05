// import { gastosList } from './stateManager.js';
const gastosList = [];
// 🔹 Renderiza las transacciones agrupadas por acreedor
export function renderResultados(resumen) {
  
  const contenedor = document.getElementById('resultado-contenedor');
  contenedor.innerHTML = ''; // Limpiar contenido previo

  for (const [acreedor, deudores] of Object.entries(resumen)) {
    const bloque = document.createElement('div');
    bloque.className = 'bg-white rounded-2xl shadow-md p-6';

    const titulo = document.createElement('h3');
    titulo.className = 'text-primary-dark font-bold text-base mb-2';
    titulo.innerHTML = `👉 A <span class="text-secondary">${acreedor}</span>:`; // Nombre en color

    const lista = document.createElement('ul');
    lista.className = 'text-sm text-neutral-mid list-disc list-inside space-y-1';
    
    deudores.forEach(({ deudor, monto }) => {
      const item = document.createElement('li');
      item.innerHTML = `<strong>${deudor}</strong> paga <span class="text-primary-dark">$${monto.toLocaleString('es-CL')}</span>`;
      lista.appendChild(item);
    });
    

    bloque.appendChild(titulo);
    bloque.appendChild(lista);
    contenedor.appendChild(bloque);
  }
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

// 🔹 Permite copiar el resumen en texto plano
export function copiarResultadosTexto() {
  const resumenCopiable = document.getElementById('resumen-copiable');
  const bloques = document.querySelectorAll('#resultado-contenedor > div');
  const texto = [];

  bloques.forEach(bloque => {
    const titulo = bloque.querySelector('h3')?.textContent || '';
    texto.push(titulo);
    const items = bloque.querySelectorAll('li');
    items.forEach(li => texto.push(`- ${li.textContent}`));
    texto.push('');
  });

  resumenCopiable.value = texto.join('\n');
  resumenCopiable.classList.remove('hidden');
  resumenCopiable.select();
  document.execCommand('copy');
  resumenCopiable.classList.add('hidden');

  mostrarToastResultado("Resumen copiado al portapapeles");
}



export async function enviarDatosAGestionar() {
  const payload = { expenses: gastosList };

  try {
    const response = await fetch('/procesar-gastos/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.status === 'success') {
      return data; // <--- ESTA ES LA LÍNEA CLAVE
    } else {
      console.error('❌ Error en la respuesta del servidor:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Error en fetch:', error);
    return null;
  }
}


function getCSRFToken() {
  const cookie = document.cookie.match(/csrftoken=([^;]*)/);
  return cookie ? cookie[1] : '';
}