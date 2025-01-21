// resultRenderer.js

// Función para mostrar los resultados en el DOM
export function mostrarResultados(data) {
  let resultsContainer = document.getElementById('results');

  if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'results';
      resultsContainer.classList.add('mt-6', 'p-4', 'border', 'border-gray-300', 'rounded-md', 'bg-gray-50');
      document.querySelector('form').parentElement.appendChild(resultsContainer);
  }

  resultsContainer.innerHTML = `
      <h3 class="text-xl font-bold mb-4 text-gray-800">Resultados:</h3>
  `;

  if (data.transacciones) {
      resultsContainer.innerHTML += `
          <h4 class="text-lg font-bold mb-2 text-gray-700">Transacciones:</h4>
          <ul>
              ${data.transacciones.map(transaccion => `<li>${transaccion}</li>`).join('')}
          </ul>
      `;
  }

  const chartContainer = document.createElement('div');
  chartContainer.classList.add('mt-6');
  chartContainer.innerHTML = `
      <h4 class="text-lg font-bold mb-2 text-gray-700">Balances:</h4>
      <canvas id="balanceChart"></canvas>
  `;
  resultsContainer.appendChild(chartContainer);

  const labels = Object.keys(data.balances);
  const balances = Object.values(data.balances);

  const ctx = document.getElementById('balanceChart').getContext('2d');
  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: labels,
          datasets: [{
              label: 'Balance',
              data: balances,
              backgroundColor: balances.map(balance => balance >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
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

// Escuchar el evento disparado desde apiService.js
document.addEventListener('serverResponse', (event) => {
  const data = event.detail;
  mostrarResultados(data);
});
