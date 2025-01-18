// Elementos del DOM
const step1 = document.getElementById('step-1'); // Contenedor del Paso 1
const step2 = document.getElementById('step-2'); // Contenedor del Paso 2
const friendsList = document.getElementById('friends-list'); // Lista de amigos dinámica
const expensesList = document.getElementById('expenses-list'); // Lista de gastos dinámicos
const form = document.querySelector('form'); // Formulario principal

// Estado actual de amigos y gastos
let currentFriends = []; // Lista de amigos
let currentExpenses = []; // Lista de gastos

// Agregar amigos dinámicamente
document.getElementById('add-friend').addEventListener('click', function () {
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
    friendsList.appendChild(newFriend);
});

// Eliminar amigos
friendsList.addEventListener('click', function (e) {
    if (e.target.classList.contains('remove-friend')) {
        e.target.parentElement.remove();
    }
});

// Pasar al Paso 2
document.getElementById('go-to-step-2').addEventListener('click', function () {
    currentFriends = Array.from(document.querySelectorAll('[name="friends[]"]')).map(input => input.value.trim());
    if (currentFriends.length === 0 || currentFriends.some(name => name === '')) {
        alert('Por favor, ingresa los nombres de todos los amigos antes de continuar.');
        return;
    }

    step1.classList.add('hidden');
    step2.classList.remove('hidden');

    // Si no hay gastos, inicializa uno vacío
    if (currentExpenses.length === 0) {
        currentExpenses.push({
            name: '',
            amount: 0,
            payer: '',
            participants: []
        });
    }

    populateExpenses();
});

// Volver al Paso 1
document.getElementById('back-to-step-1').addEventListener('click', function () {
    step2.classList.add('hidden');
    step1.classList.remove('hidden');
});

// Agregar un nuevo gasto
document.getElementById('add-expense').addEventListener('click', function () {
    currentExpenses.push({
        name: '',
        amount: 0,
        payer: '',
        participants: []
    });
    populateExpenses();
});

// Renderizar la lista de gastos
function populateExpenses() {
  // **Sincronizar currentExpenses con los valores del DOM existentes**
  expensesList.querySelectorAll('.expense-item').forEach((item, index) => {
      const nameInput = item.querySelector('input[name="expense_name"]');
      const amountInput = item.querySelector('input[name="expense_amount"]');
      const payerSelect = item.querySelector('select[name="payer"]');
      const participantsCheckboxes = item.querySelectorAll('input[name="participants"]:checked');

      // Actualizar currentExpenses con los valores ingresados por el usuario
      currentExpenses[index].name = nameInput ? nameInput.value.trim() : '';
      currentExpenses[index].amount = amountInput ? parseFloat(amountInput.value) || 0 : 0;
      currentExpenses[index].payer = payerSelect ? payerSelect.value : '';
      currentExpenses[index].participants = Array.from(participantsCheckboxes).map(input => input.value);
  });

  // **Reconstruir el DOM**
  expensesList.innerHTML = '';
  currentExpenses.forEach((expense, index) => {
      const expenseDiv = document.createElement('div');
      expenseDiv.classList.add('expense-item', 'mb-4', 'p-4', 'border', 'border-gray-300', 'rounded-md');
      expenseDiv.innerHTML = `
          <label class="block text-lg font-medium text-gray-700 mb-2">Nombre del gasto</label>
          <input 
              type="text" 
              name="expense_name" 
              class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" 
              placeholder="Ejemplo: Cena, Taxi, etc." 
              value="${expense.name}" 
              required>
          
          <label class="block text-lg font-medium text-gray-700 mb-2">Monto</label>
          <input 
              type="number" 
              name="expense_amount" 
              class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" 
              placeholder="Ejemplo: 10000" 
              value="${expense.amount}" 
              min="0" 
              required>
          
          <label class="block text-md font-medium text-gray-700 mb-2">¿Quién pagó?</label>
          <select name="payer" class="w-full px-4 py-2 mb-3 border border-gray-300 rounded-md" required>
              <option value="" disabled ${!expense.payer ? 'selected' : ''}>Selecciona</option>
              ${currentFriends.map(friend => `
                  <option value="${friend}" ${expense.payer === friend ? 'selected' : ''}>${friend}</option>
              `).join('')}
          </select>
          
          <label class="block text-md font-medium text-gray-700 mb-2">¿Quiénes participaron?</label>
          <div class="flex flex-wrap gap-2">
              ${currentFriends.map(friend => `
                  <label class="flex items-center gap-2">
                      <input 
                          type="checkbox" 
                          name="participants" 
                          value="${friend}" 
                          ${expense.participants.includes(friend) ? 'checked' : ''}>
                      ${friend}
                  </label>
              `).join('')}
          </div>
      `;
      expensesList.appendChild(expenseDiv);
  });
}

// Manejar envío del formulario
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // **Sincronizar currentExpenses antes de crear el payload**
  populateExpenses();

  console.log("currentExpenses:", currentExpenses);

  const payload = {
      expenses: currentExpenses.map(expense => ({
          expense_name: expense.name,
          expense_amount: expense.amount,
          payer: expense.payer,
          participants: expense.participants
      }))
  };

  console.log("payload:", JSON.stringify(payload));

  fetch(form.action, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
      },
      body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
      step1.classList.add('hidden');
      step2.classList.add('hidden');
      mostrarResultados(data);


  })
  .catch(error => console.error(error));
});


// Mostrar los resultados en el DOM
function mostrarResultados(data) {
  // Seleccionar o crear el contenedor de resultados
  let resultsContainer = document.getElementById('results');

  // Si no existe, crearlo dinámicamente
  if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'results';
      resultsContainer.classList.add('mt-6', 'p-4', 'border', 'border-gray-300', 'rounded-md', 'bg-gray-50');
      form.parentElement.appendChild(resultsContainer);
  }

  // Limpiar contenido previo
  resultsContainer.innerHTML = '';

  // Agregar título
  resultsContainer.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-gray-800">Resultados:</h3>
  `;

  // Mostrar transacciones
  if (data.transacciones) {
      resultsContainer.innerHTML += `
          <h4 class="text-lg font-bold mb-2 text-gray-700">Transacciones:</h4>
          <ul>
              ${data.transacciones.map(transaccion => `<li>${transaccion}</li>`).join('')}
          </ul>
      `;
  }

  // Crear un contenedor para el gráfico
  const chartContainer = document.createElement('div');
  chartContainer.classList.add('mt-6');
  chartContainer.innerHTML = `
      <h4 class="text-lg font-bold mb-2 text-gray-700">Balances:</h4>
      <canvas id="balanceChart"></canvas>
  `;
  resultsContainer.appendChild(chartContainer);

  // Preparar los datos para el gráfico
  const labels = Object.keys(data.balances); // Nombres de las personas
  const balances = Object.values(data.balances); // Valores de balance

  // Crear el gráfico con Chart.js
  const ctx = document.getElementById('balanceChart').getContext('2d');
  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Balance',
              data: balances,
              backgroundColor: balances.map(balance => balance >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'), // Verde si es positivo, rojo si es negativo
              borderColor: balances.map(balance => balance >= 0 ? 'rgba(34, 197, 94, 1)' : 'rgba(239, 68, 68, 1)'),
              borderWidth: 1,
          }],
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true,
              },
              x: {
                  ticks: {
                      autoSkip: false,
                      maxRotation: 90,
                      minRotation: 45,
                  },
              },
          },
      },
  });
}


