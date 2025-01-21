// utils.js

// Función auxiliar para validar formularios
export function validateForm(inputs) {
  return inputs.every(input => input.value.trim() !== '');
}

// Función auxiliar para crear un elemento DOM
export function createElement(tag, classes = [], innerHTML = '') {
  const element = document.createElement(tag);
  element.classList.add(...classes);
  element.innerHTML = innerHTML;
  return element;
}
