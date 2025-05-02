// domHandlers.js
import { 
  setParticipantButtonState, 
  showToast,
  setPasoActual,
  cambiarPaso,
  activarWizardPaso,
  desactivarWizardPaso
} 
from './utils.js';
import { 
  participantsList, 
  gastosList} 
  from './stateManager.js';

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

    participantsList.push({
      id: Date.now(),
      nombre: name
    });
    
    const newChip = createFriendChip(name);
    friendsListContainer.appendChild(newChip);

    inputField.value = '';
    inputField.focus();
  }

  // Listeners
  addButton.addEventListener('click', handleAddFriend);
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  });


  const volverParticipantsbtn = document.getElementById('volver-participantes');
  if (volverParticipantsbtn) {
    volverParticipantsbtn.addEventListener('click', () => {
      cambiarPaso(1);
      setPasoActual(1);
      desactivarWizardPaso(2);
      desactivarWizardPaso(3);
    });
  }
  const volverGastosBtn = document.getElementById('volver-gastos');
  if (volverGastosBtn) {
    volverGastosBtn.addEventListener('click', () => {
      cambiarPaso(2);
      setPasoActual(2); 
      activarWizardPaso(2)
      desactivarWizardPaso(3);
    });
  }
}

// Inicializador del Paso 2 (Gastos)

function showGastoError(message = 'Por favor completa todos los campos y selecciona al menos un participante.') {
  const errorMessage = document.getElementById('gasto-error-message');
  errorMessage.textContent = message;
  errorMessage.classList.remove('opacity-0', 'translate-y-2');
  errorMessage.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    errorMessage.classList.add('opacity-0', 'translate-y-2');
    errorMessage.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}



export function setupParticipantToggle(buttonGroupSelector, toggleButtonSelector, toggleIconSelector = null) {
  const participantButtons = document.querySelectorAll(`${buttonGroupSelector} .participant-btn`);
  const toggleAllBtn = toggleButtonSelector ? document.querySelector(toggleButtonSelector) : null;
  const toggleIcon = toggleIconSelector ? document.querySelector(toggleIconSelector) : null;

  if (!participantButtons.length) return;

  participantButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      
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
  pagadorSelect.innerHTML = '<option value="" selected disabled hidden>¿Quién pagó?</option>';

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
  participantesGrid.innerHTML = ''; // limpiar primero

  participantsList.forEach(participant => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'participant-btn px-3 py-1 rounded-full border text-xs bg-white text-primary-dark border-primary-dark hover:bg-primary-light focus:outline-none transition-all duration-300';
    button.textContent = participant.nombre;
    participantesGrid.appendChild(button);
  });

  setupParticipantToggle('#gasto-participantes-grid', '#toggle-all', '#toggle-icon');
}

// 🔹 Función para crear una tarjeta de gasto
export function crearGastoCard(nombreGasto, monto, pagador, participantesSeleccionados, index) {
  const card = document.createElement('div');
  card.className = 'gasto-card p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-2 relative cursor-pointer overflow-hidden flex flex-col gap-2';
  card.setAttribute('data-id', gastosList.length);
  card.setAttribute('onclick', 'toggleAccordion(event)');

  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex justify-between items-start';

  const title = document.createElement('h3');
  title.className = 'gasto-title text-primary-dark font-bold text-base';
  title.textContent = nombreGasto;

  const amount = document.createElement('p');
  amount.className = 'gasto-monto text-primary-dark font-bold text-base';
  amount.textContent = `$${parseInt(monto).toLocaleString('es-CL')}`;

  headerDiv.appendChild(title);
  headerDiv.appendChild(amount);

  const accordionDiv = document.createElement('div');
  accordionDiv.className = 'accordion-content transition-all ease-linear duration-300 overflow-hidden max-h-0';


  const participantsText = document.createElement('p');
  participantsText.className = 'gasto-participantes text-neutral-mid text-xs mt-1';
  participantsText.textContent = `Participaron ${participantesSeleccionados.join(', ')}`;

  accordionDiv.appendChild(participantsText);

  const footerDiv = document.createElement('div');
  footerDiv.className = 'flex justify-between items-center mt-2';

  const payerInfo = document.createElement('p');
  payerInfo.className = 'gasto-pagador text-neutral-mid text-xs';
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

function handleAddGasto() {
  const nombreGasto = document.getElementById('gasto-nombre-input').value.trim();
  const monto = document.getElementById('gasto-monto-input').value.trim();

  const pagadorSelect = document.getElementById('gasto-pagador-select');
  const pagador = pagadorSelect.value;

  const participantesSeleccionados = Array.from(
    document.querySelectorAll('.participant-btn.bg-secondary')
  ).map(btn => btn.textContent.trim());

  if (!nombreGasto || !monto || pagador === "" || pagadorSelect.selectedIndex === 0 || participantesSeleccionados.length === 0) {
    showGastoError();
    return;
  }

  const index = gastosList.length;
  const newCard = crearGastoCard(nombreGasto, monto, pagador, participantesSeleccionados, index);
  document.getElementById('gastos-container').appendChild(newCard);

  gastosList.push({
    expense_name: nombreGasto,
    expense_amount: parseInt(monto),
    payer: pagador,
    participants: participantesSeleccionados
  });

  if (gastosList.length === 1) {
    document.getElementById('go-to-step-3').classList.remove('hidden');
  }

  limpiarFormularioGasto();
}


// 🔹 Función principal de inicialización
export function initializeGastosHandlers() {
  
  const gastosContainer = document.getElementById('gastos-container');
  const addGastoButton = document.getElementById('add-gasto');
  
  cargarPagadores();
  cargarBotonesParticipantes();

  if (!addGastoButton.dataset.listenerAttached) {
    addGastoButton.addEventListener('click', handleAddGasto);
    addGastoButton.dataset.listenerAttached = 'true';
  }
}


function llenarSelectPagadores(selectElementId) {
  const select = document.getElementById(selectElementId);
  if (!select) return;

  // Limpiar opciones previas
  select.innerHTML = '<option disabled selected>Selecciona</option>';

  // Agregar nuevas opciones
  participantsList.forEach(participant => {
    const option = document.createElement('option');
    option.value = participant.nombre;
    option.textContent = participant.nombre;
    select.appendChild(option);
  });
}

export function openModal(index) {
  const gasto = gastosList[index];
  if (!gasto) return;

  document.getElementById('gastoNombreEdit').value = gasto.expense_name;
  document.getElementById('gastoMontoEdit').value = gasto.expense_amount;
  llenarSelectPagadores('gastoPagadorEdit');
  document.getElementById('gastoPagadorEdit').value = gasto.payer;

  const grid = document.getElementById('gastoParticipantesGridEdit');
  grid.innerHTML = '';

  participantsList.forEach(p => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'participant-btn px-3 py-1 rounded-full border text-xs border-primary-dark transition-all duration-300';
    btn.textContent = p.nombre;

    if (gasto.participants.includes(p.nombre)) {
      btn.classList.add('bg-secondary', 'text-white');
    } else {
      btn.classList.add('bg-white', 'text-primary-dark', 'hover:bg-primary-light');
    }

    btn.addEventListener('click', () => {
      const isSelected = btn.classList.contains('bg-secondary');
      btn.classList.toggle('bg-secondary', !isSelected);
      btn.classList.toggle('text-white', !isSelected);
      btn.classList.toggle('bg-white', isSelected);
      btn.classList.toggle('text-primary-dark', isSelected);
      btn.classList.toggle('hover:bg-primary-light', isSelected);
    });

    grid.appendChild(btn);
  });

  // Guardar el índice temporalmente
  document.getElementById('editForm').dataset.index = index;
  document.getElementById('editModal').classList.remove('hidden');
}

export function initializeEditModalHandlers() {
  const editForm = document.getElementById('editForm');
  if (!editForm) return;

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const index = parseInt(editForm.dataset.index);
    const nombre = document.getElementById('gastoNombreEdit').value.trim();
    const monto = parseInt(document.getElementById('gastoMontoEdit').value.trim());
    const pagador = document.getElementById('gastoPagadorEdit').value;
    const participantes = Array.from(document.querySelectorAll('#gastoParticipantesGridEdit .participant-btn.bg-secondary'))
      .map(btn => btn.textContent);

    // Validación rápida
    if (!nombre || !monto || !pagador || participantes.length === 0) {
      alert("Completa todos los campos");
      return;
    }

    // Actualizar datos en la lista
    gastosList[index] = {
      expense_name: nombre,
      expense_amount: monto,
      payer: pagador,
      participants: participantes
    };

    // Actualizar visual en la tarjeta
    const card = document.querySelector(`.gasto-card[data-id="${index}"]`);
    if (card) {
      card.querySelector('.gasto-title').textContent = nombre;
      card.querySelector('.gasto-monto').textContent = `$${monto.toLocaleString('es-CL')}`;
      card.querySelector('.gasto-participantes').textContent = `Participaron ${participantes.join(', ')}`;
      card.querySelector('.gasto-pagador').innerHTML = `Pagó <strong>${pagador}</strong>`;
    }

    closeModal();
    showToast("Gasto actualizado");
  });
}


export function closeModal() {
  document.getElementById('editModal').classList.add('hidden');
}


// ACORDEÓN PARTICIPANTES
export function toggleAccordion(event) {
  if (event.target.tagName.toLowerCase() === 'button') return;

  const card = event.currentTarget;
  const content = card.querySelector('.accordion-content');
  if (!content) return;

  content.classList.toggle('max-h-0');
  content.classList.toggle('max-h-96');
}

// Para el botón "Editar" de cada tarjeta
export function editGasto(event) {
  event.stopPropagation();
  const card = event.target.closest('.gasto-card');
  const index = card?.dataset?.id;
  if (index !== undefined) openModal(parseInt(index));
}


let gastoAEliminarIndex = null;

export function deleteGasto(event) {
  event.stopPropagation();
  const card = event.target.closest('.gasto-card');
  const index = parseInt(card?.dataset?.id);
  const gasto = gastosList[index];

  if (!gasto) return;

  gastoAEliminarIndex = index;

  document.getElementById('deleteModalText').textContent =
    `¿Estás seguro de que deseas eliminar el gasto "${gasto.expense_name}"?`;

  document.getElementById('deleteModal').classList.remove('hidden');
}

export function closeDeleteModal() {
  document.getElementById('deleteModal').classList.add('hidden');
  gastoAEliminarIndex = null;
  
}

export function confirmDeleteGasto() {
  if (gastoAEliminarIndex === null) return;

  // 1. Eliminar del array
  gastosList.splice(gastoAEliminarIndex, 1);

  // 2. Eliminar visualmente la tarjeta
  const card = document.querySelector(`.gasto-card[data-id="${gastoAEliminarIndex}"]`);
  if (card) card.remove();
  
  if (gastosList.length === 0) {
    document.getElementById('go-to-step-3').classList.add('hidden');
  }
  // 3. Re-indexar visualmente el resto
  document.querySelectorAll('.gasto-card').forEach((card, i) => {
    card.dataset.id = i;
  });

  closeDeleteModal();
  showToast('Gasto eliminado correctamente');
}


export function confirmReset() {
  // Reinicia todo el flujo
  location.href = "/organizar-gastos"; // O cambia por tu ruta inicial
}

export function closeResetModal() {
  document.getElementById("resetModal").classList.add("hidden");
}

export function openResetModal() {
  document.getElementById("resetModal").classList.remove("hidden");
}


// Exponer para el HTML
window.toggleAccordion = toggleAccordion;
window.editGasto = editGasto;
window.deleteGasto = deleteGasto;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDeleteGasto = confirmDeleteGasto;
window.openResetModal = openResetModal;
window.closeResetModal = closeResetModal;
window.confirmReset = confirmReset;

