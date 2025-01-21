import { syncExpensesFromDOM } from './domHandlers.js';
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

      // Sincroniza los datos del DOM con el estado
      syncExpensesFromDOM();

      // Prepara el payload
      const payload = {
          expenses: getCurrentExpenses().map(expense => ({
              expense_name: expense.name,
              expense_amount: expense.amount,
              payer: expense.payer,
              participants: expense.participants,
          })),
      };

      // Envía los datos al servidor
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

                  // Ocultar los pasos anteriores y mostrar el step 3
                  document.getElementById('step-1').classList.add('hidden');
                  document.getElementById('step-2').classList.add('hidden');

                  // Llama a mostrarResultados para renderizar los resultados
                  mostrarResultados(data);

                  // Asegúrate de que el contenedor de resultados sea visible
                  document.getElementById('results').classList.remove('hidden');
              }
          })
          .catch(error => console.error("Error de red:", error));
  });
});