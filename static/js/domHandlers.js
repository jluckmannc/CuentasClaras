// domHandlers.js
import { setParticipantButtonState, pasoSiguiente } from './utils.js';
import { participantsList } from './stateManager.js';

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





export function setupParticipantToggle(buttonGroupSelector, toggleButtonSelector, toggleIconSelector = null) {
  const participantButtons = document.querySelectorAll(`${buttonGroupSelector} .participant-btn`);
  const toggleAllBtn = toggleButtonSelector ? document.querySelector(toggleButtonSelector) : null;
  const toggleIcon = toggleIconSelector ? document.querySelector(toggleIconSelector) : null;

  if (!participantButtons.length) return;

  participantButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      console.log('click');
      
      const isSelected = btn.classList.contains('bg-secondary');
      setParticipantButtonState(btn, !isSelected);
    });
  });

  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      const allSelected = Array.from(participantButtons).every(btn => btn.classList.contains('bg-secondary'));
      participantButtons.forEach(btn => setParticipantButtonState(btn, !allSelected));

      if (toggleIcon) {
        toggleIcon.src = allSelected
          ? toggleAllBtn.dataset.checkSrc
          : toggleAllBtn.dataset.uncheckSrc;
      }
    });
  }
}

// 🔹 Función para llenar el select de pagadores
function cargarPagadores() {
  const pagadorSelect = document.getElementById('gasto-pagador-select');

  participantsList.forEach(participant => {
    const option = document.createElement('option');
    option.value = participant.nombre;
    option.textContent = participant.nombre;
    pagadorSelect.appendChild(option);
  });
}

// 🔹 Función para crear los botones de participantes
function cargarBotonesParticipantes() {
  const participantesGrid = document.getElementById('gasto-participantes-grid');

  participantsList.forEach(participant => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'participant-btn px-3 py-1 rounded-full border text-xs bg-white text-primary-dark border-primary-dark hover:bg-primary-light focus:outline-none transition-all duration-300';
    button.textContent = participant.nombre;
    participantesGrid.appendChild(button);
  });

  // ⚡ Una vez creados los botones, inicializar selección
  setupParticipantToggle('#gasto-participantes-grid', '#toggle-all', '#toggle-icon');
}

// 🔹 Función para crear una tarjeta de gasto
function crearGastoCard(nombreGasto, monto, pagador, participantesSeleccionados) {
  const card = document.createElement('div');
  card.className = 'p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-6 relative cursor-pointer overflow-hidden flex flex-col gap-2';
  card.setAttribute('onclick', 'toggleAccordion(event)');

  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex justify-between items-start';

  const title = document.createElement('h3');
  title.className = 'text-primary-dark font-bold text-base';
  title.textContent = nombreGasto;

  const amount = document.createElement('p');
  amount.className = 'text-primary-dark font-bold text-base';
  amount.textContent = `$${parseInt(monto).toLocaleString('es-CL')}`;

  headerDiv.appendChild(title);
  headerDiv.appendChild(amount);

  const accordionDiv = document.createElement('div');
  accordionDiv.id = 'accordionContent';
  accordionDiv.className = 'transition-all ease-linear duration-300 overflow-hidden max-h-0';

  const participantsText = document.createElement('p');
  participantsText.className = 'text-neutral-mid text-xs mt-1';
  participantsText.textContent = `Participaron ${participantesSeleccionados.join(', ')}`;

  accordionDiv.appendChild(participantsText);

  const footerDiv = document.createElement('div');
  footerDiv.className = 'flex justify-between items-center mt-2';

  const payerInfo = document.createElement('p');
  payerInfo.className = 'text-neutral-mid text-xs';
  payerInfo.innerHTML = `Pagó <strong>${pagador}</strong>`;

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'flex gap-2';

  const editBtn = document.createElement('button');
  editBtn.className = 'px-3 py-1 bg-neutral-light hover:bg-neutral-mid text-primary-dark rounded-full text-xs transition-all';
  editBtn.textContent = 'Editar';
  editBtn.setAttribute('onclick', 'editGasto(event)');

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'px-3 py-1 bg-neutral-light hover:bg-neutral-mid text-primary-dark rounded-full text-xs transition-all';
  deleteBtn.textContent = 'Eliminar';
  deleteBtn.setAttribute('onclick', 'deleteGasto(event)');

  buttonsDiv.appendChild(editBtn);
  buttonsDiv.appendChild(deleteBtn);

  footerDiv.appendChild(payerInfo);
  footerDiv.appendChild(buttonsDiv);

  card.appendChild(headerDiv);
  card.appendChild(accordionDiv);
  card.appendChild(footerDiv);

  return card;
}

// 🔹 Función para limpiar el formulario
function limpiarFormularioGasto() {
  document.getElementById('gasto-nombre-input').value = '';
  document.getElementById('gasto-monto-input').value = '';
  document.getElementById('gasto-pagador-select').selectedIndex = 0;

  document.querySelectorAll('.participant-btn').forEach(btn => {
    btn.classList.remove('bg-secondary', 'text-white');
    btn.classList.add('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
  });
}

// 🔹 Función principal de inicialización
export function initializeGastosHandlers() {
  const gastosContainer = document.getElementById('gastos-container');
  const addGastoButton = document.getElementById('add-gasto');

  cargarPagadores();
  cargarBotonesParticipantes();

  addGastoButton.addEventListener('click', () => {
    const nombreGasto = document.getElementById('gasto-nombre-input').value.trim();
    const monto = document.getElementById('gasto-monto-input').value.trim();
    const pagador = document.getElementById('gasto-pagador-select').value;
    const participantesSeleccionados = Array.from(document.querySelectorAll('.participant-btn.bg-secondary')).map(btn => btn.textContent.trim());

    if (!nombreGasto || !monto || !pagador || participantesSeleccionados.length === 0) {
      alert('Por favor completa todos los campos y selecciona al menos un participante.');
      return;
    }

    const newCard = crearGastoCard(nombreGasto, monto, pagador, participantesSeleccionados);
    gastosContainer.appendChild(newCard);

    limpiarFormularioGasto();
  });
}


// MODAL CONTROL
export function initializeEditModalHandlers() {
  const editForm = document.getElementById('editForm');

  setupParticipantToggle('#gastoParticipantesGridEdit');

  if (editForm) {
    editForm.addEventListener('submit', function(event) {
      event.preventDefault();
      closeModal();
      showToast('Gasto editado correctamente');
    });
  }
}




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



// Exponer para el HTML
window.toggleAccordion = toggleAccordion;
window.editGasto = editGasto;
window.deleteGasto = deleteGasto;
window.openModal = openModal;
window.closeModal = closeModal;