// domHandlers.js

const participantsList = []; // Lista interna de participantes

export function initializeDOMHandlers() {
  const errorMessage = document.getElementById('error-message');
  const inputField = document.getElementById('friend-input');
  const addButton = document.getElementById('add-friend');
  const friendsListContainer = document.getElementById('friends-list');

  // Función para crear un nuevo chip de participante
  function createFriendChip(name) {
    const chip = document.createElement('div');
    chip.className = 'flex items-center bg-neutral-light text-primary-dark px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-in-out';
    
    const span = document.createElement('span');
    span.textContent = name;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'ml-2 text-neutral-mid hover:text-primary-dark focus:outline-none';
    removeButton.textContent = '×';

    // Acción al hacer click en "×"
    removeButton.addEventListener('click', () => {
      const index = participantsList.indexOf(name);
      if (index !== -1) {
        participantsList.splice(index, 1); // Elimina del array
      }
      chip.remove(); // Elimina visualmente
      console.log('Participantes actuales:', participantsList);
    });

    chip.appendChild(span);
    chip.appendChild(removeButton);
    return chip;
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('opacity-0', 'translate-y-2');
    errorMessage.classList.add('opacity-100', 'translate-y-0');
  
    setTimeout(() => {
      errorMessage.classList.add('opacity-0', 'translate-y-2');
      errorMessage.classList.remove('opacity-100', 'translate-y-0');
    }, 3000);
  }

  // Función para manejar el click en "Agregar"
  function handleAddFriend() {
    const name = inputField.value.trim();

    if (name === '') {
      // Podrías mostrar un pequeño mensaje de error aquí si quieres
      return;
    }

    // Opcional: evitar duplicados exactos
    if (participantsList.includes(name)) {
      // showError('Ya has agregado ese participante.');
      showError('No sea bruto, ya lo agregó');
      inputField.value = '';
      return;
  }

    participantsList.push(name); // Guarda en la lista
    const newChip = createFriendChip(name);
    friendsListContainer.appendChild(newChip);

    inputField.value = ''; // Limpia el input
    inputField.focus();    // Vuelve a enfocar para rápida entrada
    console.log('Participantes actuales:', participantsList);
  }

  // Eventos
  addButton.addEventListener('click', handleAddFriend);

  // También permitir agregar presionando "Enter"
  inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleAddFriend();
    }
  });
}
