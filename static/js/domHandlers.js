// domHandlers.js
import { actualizarVisualPasos, mostrarPasoCorrecto, pasoSiguiente } from './utils.js';

export const participantsList = []; // Lista global de participantes

// Inicializador del Paso 1 (Participantes)
export function initializeDOMHandlers() {
  const errorMessage = document.getElementById('error-message');
  const inputField = document.getElementById('friend-input');
  const addButton = document.getElementById('add-friend');
  const friendsListContainer = document.getElementById('friends-list');
  const continuarButton = document.getElementById('go-to-step-2');

  // Crear un chip visual de participante
  function createFriendChip(name) {
    const chip = document.createElement('div');
    chip.className = 'flex items-center bg-neutral-light text-primary-dark px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-in-out';
    
    const span = document.createElement('span');
    span.textContent = name;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'ml-2 text-neutral-mid hover:text-primary-dark focus:outline-none';
    removeButton.textContent = '×';

    removeButton.addEventListener('click', () => {
      const index = participantsList.indexOf(name);
      if (index !== -1) {
        participantsList.splice(index, 1);
      }
      chip.remove();
      console.log('Participantes actuales:', participantsList);
    });

    chip.appendChild(span);
    chip.appendChild(removeButton);
    return chip;
  }

  // Mostrar error de validación
  function showError(message = 'Ese participante ya fue agregado.') {
    errorMessage.textContent = message;
    errorMessage.classList.remove('opacity-0', 'translate-y-2');
    errorMessage.classList.add('opacity-100', 'translate-y-0');

    setTimeout(() => {
      errorMessage.classList.add('opacity-0', 'translate-y-2');
      errorMessage.classList.remove('opacity-100', 'translate-y-0');
    }, 3000);
  }

  // Agregar participante
  function handleAddFriend() {
    const name = inputField.value.trim();

    if (name === '') return;

    if (participantsList.includes(name)) {
      showError();
      inputField.value = '';
      return;
    }

    participantsList.push(name);
    const newChip = createFriendChip(name);
    friendsListContainer.appendChild(newChip);

    inputField.value = '';
    inputField.focus();
    console.log('Participantes actuales:', participantsList);
  }

  // Listeners
  addButton.addEventListener('click', handleAddFriend);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  });

  // Listener del botón Continuar
  continuarButton.addEventListener('click', () => {
    pasoSiguiente();  // Lógica centralizada en utils.js
  });
}

// Inicializador del Paso 2 (Gastos)
export function initializeGastosHandlers() {
  const gastosContainer = document.getElementById('gastos-container');
  const addGastoButton = document.getElementById('add-gasto');

  function createGastoCard() {
    const card = document.createElement('div');
    card.className = 'flex flex-col gap-4 p-6 mb-6 bg-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out';

    // Inputs y campos
    const gastoInput = document.createElement('input');
    gastoInput.type = 'text';
    gastoInput.placeholder = '¿Qué gasto quieres agregar? (Ej: Entrada al cine)';
    gastoInput.className = 'w-full px-4 py-2 border border-neutral-light rounded-lg font-input text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark';

    const montoInput = document.createElement('input');
    montoInput.type = 'number';
    montoInput.placeholder = 'Monto total (Ej: 20000)';
    montoInput.className = 'w-full px-4 py-2 border border-neutral-light rounded-lg font-input text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark';

    const pagadorSelect = document.createElement('select');
    pagadorSelect.className = 'w-full px-4 py-2 border border-neutral-light rounded-lg font-input text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark';
    participantsList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      pagadorSelect.appendChild(option);
    });

    const participantsContainer = document.createElement('div');
    participantsContainer.className = 'flex flex-wrap gap-2';
    participantsList.forEach(name => {
      const label = document.createElement('label');
      label.className = 'flex items-center space-x-2 text-primary-dark text-sm';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = name;
      checkbox.className = 'form-checkbox h-4 w-4 text-primary focus:ring-primary-dark';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(name));
      participantsContainer.appendChild(label);
    });

    card.appendChild(gastoInput);
    card.appendChild(montoInput);
    card.appendChild(pagadorSelect);
    card.appendChild(participantsContainer);

    return card;
  }

  addGastoButton.addEventListener('click', () => {
    const newCard = createGastoCard();
    gastosContainer.appendChild(newCard);
  });
}


export function initializeParticipantSelection() {
  const participantButtons = document.querySelectorAll('.participant-btn');
  const toggleAllBtn = document.getElementById('toggle-all');
  const toggleIcon = document.getElementById('toggle-icon');

  if (!participantButtons.length) return; // por si acaso

  participantButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('bg-secondary')) {
        btn.classList.remove('bg-secondary', 'text-white');
        btn.classList.add('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
      } else {
        btn.classList.add('bg-secondary', 'text-white');
        btn.classList.remove('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
      }
    });
  });

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      const allSelected = Array.from(participantButtons).every(btn => btn.classList.contains('bg-secondary'));
      participantButtons.forEach(btn => {
        if (allSelected) {
          btn.classList.add('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
          btn.classList.remove('bg-secondary', 'text-white');
        } else {
          btn.classList.add('bg-secondary', 'text-white');
          btn.classList.remove('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
        }
      });

      // Cambiar el ícono según el estado
      if (toggleIcon && toggleAllBtn) {
        toggleIcon.src = allSelected
          ? toggleAllBtn.dataset.checkSrc
          : toggleAllBtn.dataset.uncheckSrc;
      }
    });
  }
}



// MODAL CONTROL
export function openModal() {
  document.getElementById('editModal').classList.remove('hidden');
}

export function closeModal() {
  document.getElementById('editModal').classList.add('hidden');
}

export function showToast(message) {
  const toast = document.getElementById('toastSuccess');
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}

// ACORDEÓN PARTICIPANTES
export function toggleAccordion(event) {
  if (event.target.tagName.toLowerCase() === 'button') {
    return;
  }

  const content = document.getElementById('accordionContent');

  if (content.classList.contains('max-h-0')) {
    content.classList.remove('max-h-0');
    content.classList.add('max-h-96'); // Puedes ajustar el máximo
  } else {
    content.classList.add('max-h-0');
    content.classList.remove('max-h-96');
  }
}

// BOTÓN EDITAR
export function editGasto(event) {
  event.stopPropagation();
  openModal();
}

// BOTÓN ELIMINAR
export function deleteGasto(event) {
  event.stopPropagation();
  alert('Eliminar gasto'); // (opcional: luego agregar confirmación)
}

// INICIALIZADOR DEL MODAL
export function initializeEditModalHandlers() {
  // Seleccionar/Deseleccionar participantes dentro del modal
  document.querySelectorAll('.participant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('bg-primary-light');
      btn.classList.toggle('bg-white');
    });
  });

  // Capturar submit del formulario de edición
  const editForm = document.getElementById('editForm');
  if (editForm) {
    editForm.addEventListener('submit', function(event) {
      event.preventDefault();
      closeModal();
      showToast('Gasto editado correctamente');
    });
  }
}

// Exponer para el HTML
window.toggleAccordion = toggleAccordion;
window.editGasto = editGasto;
window.deleteGasto = deleteGasto;
window.openModal = openModal;
window.closeModal = closeModal;