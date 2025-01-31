// domHandlers.js
import { updateFriends, getCurrentFriends, addExpense, getCurrentExpenses } from './stateManager.js';

// Seleccionar elementos del DOM
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const friendsList = document.getElementById('friends-list');
const expensesList = document.getElementById('expenses-list');

// Función para agregar amigos dinámicamente
export function setupAddFriendHandler() {
    const addFriendButton = document.getElementById('add-friend');
    addFriendButton.addEventListener('click', function () {
        const newFriend = document.createElement('div');
        newFriend.classList.add('friend-item', 'flex', 'items-center', 'gap-4', 'mb-3');
        newFriend.innerHTML = `
            <input 
                type="text" 
                name="friends[]" 
                class="flex-1 px-4 py-2 border border-neutral-dark rounded-md" 
                placeholder="Nombre del amigo" 
                required>
            <button type="button" class="remove-friend text-red-500 hover:underline">Eliminar</button>
        `;
        friendsList.appendChild(newFriend);
    });
}

// Función para manejar la eliminación de amigos
export function setupRemoveFriendHandler() {
    friendsList.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-friend')) {
            e.target.parentElement.remove();
        }
    });
}

// Función para pasar al Paso 2
export function setupGoToStep2Handler() {
  const goToStep2Button = document.getElementById('go-to-step-2');
  goToStep2Button.addEventListener('click', function () {
      const newFriends = Array.from(document.querySelectorAll('[name="friends[]"]')).map(input => input.value.trim());
      if (newFriends.length === 0 || newFriends.some(name => name === '')) {
          alert('Por favor, ingresa los nombres de todos los amigos antes de continuar.');
          return;
      }

      updateFriends(newFriends);

      // Transición de paso 1 a paso 2
      step1.classList.add('hidden');
      step2.classList.remove('hidden');

      // Inicializa con al menos un formulario de gasto
      if (getCurrentExpenses().length === 0) {
          addExpense({
              name: '',
              amount: 0,
              payer: '',
              participants: [],
          });
      }

      renderExpenses(); 
  });
}


// Función para volver al Paso 1
export function setupBackToStep1Handler() {
    const backToStep1Button = document.getElementById('back-to-step-1');
    backToStep1Button.addEventListener('click', function () {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
        const expenseDiv = createExpenseElement(expense, 0);
    });
}


// Función para crear un elemento de gasto individual
function createExpenseElement(expense, index) {
  const expenseDiv = document.createElement('div');
  expenseDiv.classList.add('expense-item', 'mb-4', 'p-4', 'border', 'border-neutral-dark', 'rounded-md');

  expenseDiv.innerHTML = `
      <label class="block text-lg font-medium text-gray-700 mb-2">Nombre del gasto</label>
      <input 
          type="text" 
          name="expense_name_${index}" 
          class="w-full px-4 py-2 mb-3 border border-neutral-dark rounded-md" 
          placeholder="Ejemplo: Cena, Taxi, etc." 
          value="${expense.name || ''}" 
          required>

      <label class="block text-lg font-medium text-gray-700 mb-2">Monto</label>
      <input 
          type="number" 
          name="expense_amount_${index}" 
          class="w-full px-4 py-2 mb-3 border border-neutral-dark rounded-md" 
          placeholder="Ejemplo: 10000" 
          value="${expense.amount || ''}" 
          min="0" 
          required>

      <label class="block text-md font-medium text-gray-700 mb-2">¿Quién pagó?</label>
      <select name="payer_${index}" class="w-full px-4 py-2 mb-3 border border-neutral-dark rounded-md" required>
          <option value="" disabled ${!expense.payer ? 'selected' : ''}>Selecciona</option>
          ${getCurrentFriends().map(friend => `
              <option value="${friend}" ${expense.payer === friend ? 'selected' : ''}>${friend}</option>
          `).join('')}
      </select>

      <label class="block text-md font-medium text-gray-700 mb-2">¿Quiénes participaron?</label>
      <div class="flex flex-wrap gap-2">
          ${getCurrentFriends().map(friend => `
              <label class="flex items-center gap-2">
                  <input 
                      type="checkbox" 
                      name="participants_${index}" 
                      value="${friend}" 
                      ${expense.participants.includes(friend) ? 'checked' : ''}>
                  ${friend}
              </label>
          `).join('')}
      </div>
  `;

  return expenseDiv;
}

export function renderExpenses() {
  syncExpensesFromDOM(); // Guarda los valores actuales antes de renderizar
  const expenses = getCurrentExpenses(); // Obtén los gastos actualizados

  expensesList.innerHTML = ''; // Limpia el contenedor de gastos

  // Renderiza cada gasto
  expenses.forEach((expense, index) => {
      const expenseDiv = createExpenseElement(expense, index); // Crea el elemento dinámicamente
      expensesList.appendChild(expenseDiv);
  });
}
// Función para agregar un nuevo gasto
export function setupAddExpenseHandler() {
    const addExpenseButton = document.getElementById('add-expense');
    addExpenseButton.addEventListener('click', function () {
        addExpense({
            name: '',
            amount: 0,
            payer: '',
            participants: []
        });
        renderExpenses();
    });
}

export function syncExpensesFromDOM() {
  const expenseItems = expensesList.querySelectorAll('.expense-item');
  const expenses = getCurrentExpenses();

  expenseItems.forEach((item, index) => {
      const nameInput = item.querySelector(`input[name="expense_name_${index}"]`);
      const amountInput = item.querySelector(`input[name="expense_amount_${index}"]`);
      const payerSelect = item.querySelector(`select[name="payer_${index}"]`);
      const participantCheckboxes = item.querySelectorAll(`input[name="participants_${index}"]:checked`);

      expenses[index] = {
          name: nameInput ? nameInput.value.trim() : '',
          amount: amountInput ? parseFloat(amountInput.value) || 0 : 0,
          payer: payerSelect ? payerSelect.value : '',
          participants: Array.from(participantCheckboxes).map(checkbox => checkbox.value),
      };
  });
}

// Función para mostrar el paso 3
export function showStep3() {
  document.getElementById('step-1').classList.add('hidden');
  document.getElementById('step-2').classList.add('hidden');
  document.getElementById('results').classList.remove('hidden');
}
// Inicializar todos los manejadores de eventos
export function initializeDOMHandlers() {
    setupAddFriendHandler();
    setupRemoveFriendHandler();
    setupGoToStep2Handler();
    setupBackToStep1Handler();
    setupAddExpenseHandler();
}
