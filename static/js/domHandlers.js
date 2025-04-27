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
