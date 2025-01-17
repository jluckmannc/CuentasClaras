// Elementos del DOM
const step1 = document.getElementById('step-1'); // Contenedor del Paso 1
const step2 = document.getElementById('step-2'); // Contenedor del Paso 2
const friendsList = document.getElementById('friends-list'); // Lista de amigos dinámica
const expensesList = document.getElementById('expenses-list'); // Lista de gastos dinámicos

// Estado actual de amigos y gastos
let currentFriends = []; // Lista de amigos
let currentExpenses = []; // Lista de gastos

// Agregar amigos dinámicamente
document.getElementById('add-friend').addEventListener('click', function () {
    // Crear un nuevo div para un amigo
    const newFriend = document.createElement('div');
    newFriend.classList.add('friend-item', 'flex', 'items-center', 'gap-4', 'mb-3');
    newFriend.innerHTML = `
        <input 
            type="text" 
            name="friends[]" 
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md" 
            placeholder="Nombre del amigo" 
            required>
        <button type="button" class="remove-friend text-red-500 hover:underline">Eliminar</button>
    `;
    friendsList.appendChild(newFriend); // Agregar el nuevo amigo a la lista
});

// Eliminar amigos
friendsList.addEventListener('click', function (e) {
    // Si se hace clic en el botón "Eliminar", eliminar el div correspondiente
    if (e.target.classList.contains('remove-friend')) {
        e.target.parentElement.remove();
    }
});

// Pasar al Paso 2 y agregar automáticamente el primer gasto si no hay ninguno
document.getElementById('go-to-step-2').addEventListener('click', function () {
    // Obtener los nombres de los amigos
    currentFriends = Array.from(document.querySelectorAll('[name="friends[]"]')).map(input => input.value.trim());
    if (currentFriends.length === 0 || currentFriends.some(name => name === '')) {
        alert('Por favor, ingresa los nombres de todos los amigos antes de continuar.');
        return;
    }

    // Agregar el primer gasto automáticamente si no existen gastos previos
    if (currentExpenses.length === 0) {
        currentExpenses.push({
            name: '',
            participants: [], // Lista vacía de participantes
        });
    }

    // Cambiar de paso y renderizar los gastos
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
    populateExpenses();
});

// Volver al Paso 1
document.getElementById('back-to-step-1').addEventListener('click', function () {
    // Mostrar el Paso 1 y ocultar el Paso 2
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
});

// Agregar un nuevo gasto
document.getElementById('add-expense').addEventListener('click', function () {
    const expenseIndex = currentExpenses.length + 1;
    const newExpense = {
        name: ``, // Nombre del nuevo gasto
        participants: [], // Nuevo gasto comienza vacío
    };
    currentExpenses.push(newExpense); // Agregar el nuevo gasto al estado
    populateExpenses(); // Re-renderizar los gastos
});

// Renderizar la lista de gastos
function populateExpenses() {
  // 1. Guardar los valores actuales de los inputs antes de limpiar el DOM
  // Esto asegura que los datos ingresados por el usuario no se pierdan al reconstruir la lista de gastos.
  expensesList.querySelectorAll('.expense-item').forEach((item, index) => {
      // Seleccionar los inputs de nombre, monto y pagador dentro de cada gasto
      const nameInput = item.querySelector('input[name="expense_name[]"]');
      const amountInput = item.querySelector('input[name="expense_amount[]"]');
      const payerSelect = item.querySelector('select[name="payer[]"]');

      // Guardar el valor del nombre del gasto en el estado `currentExpenses`
      // Si el valor está vacío o contiene solo espacios, se guarda como una cadena vacía
      currentExpenses[index].name = nameInput.value.trim() || '';

      // Guardar el monto ingresado como número; si está vacío, se guarda como 0
      currentExpenses[index].amount = parseFloat(amountInput.value) || 0;

      // Guardar el pagador seleccionado en el estado
      currentExpenses[index].payer = payerSelect.value;
  });

  // 2. Limpiar la lista de gastos en el DOM
  // Esto elimina todos los elementos visibles en el contenedor de `expensesList` para reconstruirlos desde cero.
  expensesList.innerHTML = '';

  // 3. Reconstruir los gastos respetando los valores actuales en el estado `currentExpenses`
  currentExpenses.forEach((expense, index) => {
      // Crear un nuevo div que representará cada gasto
      const expenseDiv = document.createElement('div');
      expenseDiv.classList.add('expense-item', 'mb-4', 'p-4', 'border', 'border-gray-300', 'rounded-md');

      // Configurar el contenido HTML del div
      expenseDiv.innerHTML = `
          <!-- Campo para el nombre del gasto -->
          <label class="block text-lg font-medium text-gray-700 mb-2">Nombre del gasto</label>
          <input 
              type="text" 
              name="expense_name[]" 
              class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" 
              placeholder="Ejemplo: Cena, Taxi, etc." 
              value="${expense.name || ''}"  
              required>
          
          <!-- Campo para el monto del gasto -->
          <label class="block text-lg font-medium text-gray-700 mb-2">Monto</label>
          <input 
              type="number" 
              name="expense_amount[]" 
              class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" 
              placeholder="Ejemplo: 10000" 
              min="0"  
              value="${expense.amount || ''}"  
              required>
          
          <!-- Dropdown para seleccionar quién pagó -->
          <label class="block text-md font-medium text-gray-700 mb-2">¿Quién pagó?</label>
          <select 
              name="payer[]" 
              class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" 
              required>
              <option value="" disabled ${expense.payer ? '' : 'selected'}>Selecciona</option>  <!-- Opción predeterminada -->
              ${currentFriends.map(friend => `
                  <option value="${friend}" ${expense.payer === friend ? 'selected' : ''}>${friend}</option>
              `).join('')}  <!-- Generar opciones para cada amigo -->
          </select>
          
          <!-- Checkboxes para seleccionar quiénes participaron -->
          <label class="block text-md font-medium text-gray-700 mb-2">¿Quiénes participaron?</label>
          <div class="flex flex-wrap gap-2">
              ${generateCheckboxes(expense.participants)}  <!-- Generar dinámicamente los checkboxes -->
          </div>
      `;

      // Agregar el div del gasto al contenedor principal `expensesList`
      expensesList.appendChild(expenseDiv);
  });
}







// Generar checkboxes para los participantes
function generateCheckboxes(selectedParticipants) {
    return currentFriends.map(friend => `
        <label class="flex items-center gap-2">
            <input 
                type="checkbox" 
                name="participants[]" 
                value="${friend}" 
                class="form-checkbox" 
                ${selectedParticipants.includes(friend) ? 'checked' : ''}>
            ${friend}
        </label>
    `).join('');
}

// Guardar participantes seleccionados y otros datos antes de reconstruir
expensesList.addEventListener('change', function (e) {
  const expenseIndex = Array.from(expensesList.children).indexOf(e.target.closest('.expense-item'));
  if (e.target.name === 'participants[]') {
      // Guardar participantes seleccionados
      const selectedParticipants = Array.from(
          e.target.closest('.flex-wrap').querySelectorAll('input:checked')
      ).map(input => input.value);
      currentExpenses[expenseIndex].participants = selectedParticipants;
  } else if (e.target.name === 'payer[]') {
      // Guardar quién pagó
      currentExpenses[expenseIndex].payer = e.target.value;
  } else if (e.target.name === 'expense_name[]') {
      // Guardar el nombre del gasto
      currentExpenses[expenseIndex].name = e.target.value.trim();
  } else if (e.target.name === 'expense_amount[]') {
      // Guardar el monto del gasto
      currentExpenses[expenseIndex].amount = parseFloat(e.target.value) || 0;
  }
});

