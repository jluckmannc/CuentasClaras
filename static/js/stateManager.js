// stateManager.js

// Estado actual de amigos y gastos
let currentFriends = []; // Lista de amigos
let currentExpenses = []; // Lista de gastos

// Función para obtener los amigos actuales
export function getCurrentFriends() {
    return currentFriends;
}

// Función para actualizar los amigos
export function updateFriends(newFriends) {
    currentFriends = newFriends;
}

// Función para agregar un gasto
export function addExpense(expense) {
    currentExpenses.push(expense);
}

// Función para obtener los gastos actuales
export function getCurrentExpenses() {
    return currentExpenses;
}

// Función para sincronizar gastos desde el DOM
export function syncExpensesFromDOM(expensesList) {
    expensesList.querySelectorAll('.expense-item').forEach((item, index) => {
        const nameInput = item.querySelector('input[name="expense_name"]');
        const amountInput = item.querySelector('input[name="expense_amount"]');
        const payerSelect = item.querySelector('select[name="payer"]');
        const participantsCheckboxes = item.querySelectorAll('input[name="participants"]:checked');

        currentExpenses[index] = {
            name: nameInput ? nameInput.value.trim() : '',
            amount: amountInput ? parseFloat(amountInput.value) || 0 : 0,
            payer: payerSelect ? payerSelect.value : '',
            participants: Array.from(participantsCheckboxes).map(input => input.value),
        };
    });
}
