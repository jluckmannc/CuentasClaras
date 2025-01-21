import { syncExpensesFromDOM, showStep3 } from './domHandlers.js';
import { getCurrentExpenses } from './stateManager.js';
import { mostrarResultados } from './resultRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (!form) {
        console.error("El formulario no existe en el DOM.");
        return;
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        syncExpensesFromDOM();

        const payload = {
            expenses: getCurrentExpenses().map(expense => ({
                expense_name: expense.name,
                expense_amount: expense.amount,
                payer: expense.payer,
                participants: expense.participants,
            })),
        };

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: JSON.stringify(payload),
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error del servidor:", data.error);
                } else {
                    console.log("Respuesta del servidor:", data);
                    mostrarResultados(data);
                    showStep3(); // Mueve la lógica de transición a domHandlers.js
                }
            })
            .catch(error => console.error("Error de red:", error));
    });
});
