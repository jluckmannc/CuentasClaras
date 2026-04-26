// domHandlers.js
import {
  setParticipantButtonState,
  showToast,
  setPasoActual,
  cambiarPaso,
  activarWizardPaso,
  desactivarWizardPaso,
  setupRecalcNudge
}
from './utils.js';
import {
  participantsList,
  gastosList
}
from './stateManager.js';

const createTipConfig = {
  panelId: 'gasto-tip-panel',
  toggleButtonId: 'toggle-gasto-tip-panel',
  prefixId: 'gasto-tip-prefix',
  titleId: 'gasto-tip-title',
  summaryId: 'gasto-tip-summary',
  indicatorId: 'gasto-tip-indicator',
  contentId: 'gasto-tip-content',
  amountInputId: 'gasto-monto-input',
  tipSelectId: 'gasto-tip-select',
  actionButtonId: 'apply-gasto-tip',
  summaryCardsId: 'gasto-tip-cards',
  tipAmountId: 'gasto-tip-amount',
  totalAmountId: 'gasto-total-amount',
  removeButtonId: 'remove-gasto-tip'
};

const editTipConfig = {
  panelId: 'gastoTipPanelEdit',
  toggleButtonId: 'toggleGastoTipPanelEdit',
  prefixId: 'gastoTipPrefixEdit',
  titleId: 'gastoTipTitleEdit',
  summaryId: 'gastoTipSummaryEdit',
  indicatorId: 'gastoTipIndicatorEdit',
  contentId: 'gastoTipContentEdit',
  amountInputId: 'gastoMontoEdit',
  tipSelectId: 'gastoTipEdit',
  actionButtonId: 'applyGastoTipEdit',
  summaryCardsId: 'gastoTipCardsEdit',
  tipAmountId: 'gastoTipAmountEdit',
  totalAmountId: 'gastoTotalAmountEdit',
  removeButtonId: 'removeGastoTipEdit'
};

function calculateTipAmount(amount, percentage) {
  return Math.round((Number(amount) || 0) * ((Number(percentage) || 0) / 100));
}

function calculateTotalWithTip(amount, percentage) {
  return (Number(amount) || 0) + calculateTipAmount(amount, percentage);
}

function normalizeAmountValue(rawValue) {
  return String(rawValue ?? '').replace(/\D/g, '');
}

function getPositiveIntegerAmount(inputId) {
  const input = document.getElementById(inputId);
  const normalizedValue = normalizeAmountValue(input?.value || '');

  if (input && input.value !== normalizedValue) {
    input.value = normalizedValue;
  }

  if (!normalizedValue) return null;

  const amount = Number(normalizedValue);
  if (!Number.isInteger(amount) || amount <= 0) return null;

  return amount;
}

function initializeAmountInput(inputId, onChange = null) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const handler = () => {
    const normalizedValue = normalizeAmountValue(input.value);
    if (input.value !== normalizedValue) {
      input.value = normalizedValue;
    }

    if (onChange) {
      onChange();
    }
  };

  if (!input.dataset.amountListenerAttached) {
    input.addEventListener('input', handler);
    input.dataset.amountListenerAttached = 'true';
  }
}

const calculatorState = {
  targetInputId: null,
  expression: ''
};

const CALCULATOR_OPERATORS = new Set(['+', '-', '*', '/']);

function getCurrentCalculatorToken(expression) {
  return expression.split(/[+\-*/]/).pop() || '';
}

function countCalculatorChar(expression, targetChar) {
  return Array.from(expression || '').filter((char) => char === targetChar).length;
}

function sanitizeCalculatorExpression(rawValue) {
  return String(rawValue ?? '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/[^0-9.+\-*/()\s]/g, '');
}

function formatCalculatorExpression(expression) {
  return String(expression || '0')
    .replace(/\*/g, '×')
    .replace(/\//g, '÷')
    .replace(/-/g, '−');
}

function normalizeCalculatorExpressionValue(result) {
  if (!Number.isFinite(result)) return '';
  return Number.parseFloat(result.toFixed(10)).toString();
}

function formatCalculatorResult(result) {
  if (!Number.isFinite(result)) return '';
  return new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 4
  }).format(result);
}

function evaluateCalculatorExpression(expression) {
  const sanitizedExpression = sanitizeCalculatorExpression(expression).trim();

  if (!sanitizedExpression) {
    return {
      valid: false,
      reason: 'empty'
    };
  }

  if (/[*+/(.\-]$/.test(sanitizedExpression) && sanitizedExpression !== '-') {
    return {
      valid: false,
      reason: 'incomplete'
    };
  }

  try {
    const result = Function(`"use strict"; return (${sanitizedExpression});`)();
    if (!Number.isFinite(result)) {
      return {
        valid: false,
        reason: 'invalid'
      };
    }

    return {
      valid: true,
      result
    };
  } catch (error) {
    return {
      valid: false,
      reason: 'invalid'
    };
  }
}

function getCalculatorElements() {
  return {
    modal: document.getElementById('calculatorModal'),
    expression: document.getElementById('calculatorExpression'),
    display: document.getElementById('calculatorDisplay'),
    applyButton: document.getElementById('applyCalculatorResult'),
    closeButton: document.getElementById('closeCalculatorModal'),
    cancelButton: document.getElementById('cancelCalculator')
  };
}

function isCalculatorModalOpen() {
  const { modal } = getCalculatorElements();
  return Boolean(modal && !modal.classList.contains('hidden'));
}

function renderCalculatorDisplay() {
  const {
    expression,
    display
  } = getCalculatorElements();
  if (!display) return;

  const rawExpression = calculatorState.expression || '0';
  const sanitizedExpression = sanitizeCalculatorExpression(calculatorState.expression).trim();
  let previewEvaluation = null;
  let directEvaluation = null;
  let usedFallbackEvaluation = false;

  if (sanitizedExpression) {
    directEvaluation = evaluateCalculatorExpression(sanitizedExpression);
    if (directEvaluation.valid) {
      previewEvaluation = directEvaluation;
    } else {
      const fallbackExpression = sanitizedExpression.replace(/[+\-*/(\s]+$/, '').trim();
      const fallbackEvaluation = fallbackExpression && fallbackExpression !== sanitizedExpression
        ? evaluateCalculatorExpression(fallbackExpression)
        : null;
      if (fallbackEvaluation?.valid) {
        previewEvaluation = fallbackEvaluation;
        usedFallbackEvaluation = true;
      }
    }
  }

  if (expression) {
    expression.textContent = formatCalculatorExpression(rawExpression);
  }

  if (!calculatorState.expression) {
    display.textContent = '0';
    return;
  }

  if (!previewEvaluation) {
    display.textContent = directEvaluation && !directEvaluation.valid && !usedFallbackEvaluation
      ? 'Error'
      : '0';
    return;
  }

  display.textContent = formatCalculatorResult(previewEvaluation.result);
}

function updateCalculatorPreview() {
  const {
    applyButton
  } = getCalculatorElements();

  if (!applyButton) return;

  renderCalculatorDisplay();

  const evaluation = evaluateCalculatorExpression(calculatorState.expression);

  if (!evaluation.valid) {
    applyButton.disabled = true;
    return;
  }

   if (evaluation.result <= 0) {
    applyButton.disabled = true;
    return;
  }

  applyButton.disabled = false;
}

function closeCalculatorModal() {
  const { modal } = getCalculatorElements();
  if (!modal) return;

  modal.classList.add('hidden');
  calculatorState.targetInputId = null;
  calculatorState.expression = '';
}

function openCalculatorModal(targetInputId) {
  const {
    modal
  } = getCalculatorElements();
  const targetInput = document.getElementById(targetInputId);

  if (!modal || !targetInput) return;

  calculatorState.targetInputId = targetInputId;
  calculatorState.expression = sanitizeCalculatorExpression(targetInput.value || '');
  modal.classList.remove('hidden');
  modal.focus();
  updateCalculatorPreview();
}

function applyCalculatorResult() {
  const targetInput = document.getElementById(calculatorState.targetInputId);
  if (!targetInput) return;

  const evaluation = evaluateCalculatorExpression(calculatorState.expression);
  if (!evaluation.valid || evaluation.result <= 0) return;

  const roundedResult = Math.round(evaluation.result);
  const exactFormatted = formatCalculatorResult(evaluation.result);
  const roundedChanged = Math.abs(evaluation.result - roundedResult) > 1e-9;
  const roundedUp = roundedResult > evaluation.result;

  targetInput.value = String(roundedResult);
  targetInput.dispatchEvent(new Event('input', { bubbles: true }));
  closeCalculatorModal();
  targetInput.focus();

  if (roundedChanged) {
    showToast(
      roundedUp
        ? `Se aproximó hacia arriba de ${exactFormatted} a ${roundedResult}.`
        : `Se aproximó de ${exactFormatted} a ${roundedResult}.`
    );
  }
}

function appendCalculatorValue(value) {
  if (/^\d+$/.test(value)) {
    if (!calculatorState.expression) {
      calculatorState.expression = value === '00' ? '0' : value;
    } else {
      const lastChar = calculatorState.expression.slice(-1);
      if (lastChar === ')') {
        updateCalculatorPreview();
        return;
      }

      const currentToken = getCurrentCalculatorToken(calculatorState.expression);

      if (CALCULATOR_OPERATORS.has(lastChar)) {
        calculatorState.expression += value === '00' ? '0' : value;
      } else if (currentToken === '0') {
        if (value !== '0' && value !== '00') {
          calculatorState.expression = `${calculatorState.expression.slice(0, -1)}${value}`;
        }
      } else if (currentToken === '') {
        calculatorState.expression += value === '00' ? '0' : value;
      } else {
        calculatorState.expression += value;
      }
    }
  } else if (value === '(') {
    const lastChar = calculatorState.expression.slice(-1);
    if (!calculatorState.expression || CALCULATOR_OPERATORS.has(lastChar) || lastChar === '(') {
      calculatorState.expression += value;
    }
  } else if (value === ')') {
    const lastChar = calculatorState.expression.slice(-1);
    const openParens = countCalculatorChar(calculatorState.expression, '(');
    const closeParens = countCalculatorChar(calculatorState.expression, ')');

    if (openParens > closeParens && (/\d/.test(lastChar) || lastChar === ')')) {
      calculatorState.expression += value;
    }
  } else if (CALCULATOR_OPERATORS.has(value)) {
    const lastChar = calculatorState.expression.slice(-1);

    if (!calculatorState.expression || (!/\d/.test(calculatorState.expression) && lastChar !== ')')) {
      updateCalculatorPreview();
      return;
    }

    if (CALCULATOR_OPERATORS.has(lastChar)) {
      calculatorState.expression = `${calculatorState.expression.slice(0, -1)}${value}`;
    } else {
      calculatorState.expression += value;
    }
  }

  updateCalculatorPreview();
}

function handleCalculatorKeyboardInput(event) {
  if (!isCalculatorModalOpen()) return;
  if (event.altKey || event.ctrlKey || event.metaKey) return;

  const { applyButton } = getCalculatorElements();
  const { key } = event;

  if (/^\d$/.test(key)) {
    event.preventDefault();
    appendCalculatorValue(key);
    return;
  }

  if (['+', '-', '/', '(', ')'].includes(key)) {
    event.preventDefault();
    appendCalculatorValue(key);
    return;
  }

  if (key === '*' || key.toLowerCase() === 'x') {
    event.preventDefault();
    appendCalculatorValue('*');
    return;
  }

  if (key === '=' || key === 'Enter') {
    event.preventDefault();
    if (key === 'Enter' && applyButton && !applyButton.disabled) {
      applyCalculatorResult();
      return;
    }
    handleCalculatorAction('equals');
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    handleCalculatorAction('backspace');
    return;
  }

  if (key === 'Delete') {
    event.preventDefault();
    handleCalculatorAction('clear');
    return;
  }

  if (key === 'Escape') {
    event.preventDefault();
    closeCalculatorModal();
  }
}

function handleCalculatorAction(action) {
  if (action === 'clear') {
    calculatorState.expression = '';
  } else if (action === 'backspace') {
    calculatorState.expression = calculatorState.expression.slice(0, -1);
  } else if (action === 'equals') {
    const evaluation = evaluateCalculatorExpression(calculatorState.expression);
    if (evaluation.valid) {
      calculatorState.expression = normalizeCalculatorExpressionValue(evaluation.result);
    }
  }

  updateCalculatorPreview();
}

function initializeCalculatorModal() {
  const {
    modal,
    closeButton,
    cancelButton,
    applyButton
  } = getCalculatorElements();

  if (!modal || !applyButton) return;

  if (!modal.dataset.listenerAttached) {
    document.querySelectorAll('.calculator-trigger').forEach((button) => {
      button.addEventListener('click', () => openCalculatorModal(button.dataset.calculatorTarget));
    });

    modal.querySelectorAll('[data-calc-value]').forEach((button) => {
      button.addEventListener('click', () => appendCalculatorValue(button.dataset.calcValue));
    });

    modal.querySelectorAll('[data-calc-action]').forEach((button) => {
      button.addEventListener('click', () => handleCalculatorAction(button.dataset.calcAction));
    });

    closeButton?.addEventListener('click', closeCalculatorModal);
    cancelButton?.addEventListener('click', closeCalculatorModal);
    applyButton.addEventListener('click', applyCalculatorResult);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeCalculatorModal();
      }
    });

    document.addEventListener('keydown', handleCalculatorKeyboardInput);

    modal.dataset.listenerAttached = 'true';
  }

  updateCalculatorPreview();
}

function getSelectedTipPercentage(selectId) {
  const select = document.getElementById(selectId);
  return Number(select?.value || 10);
}

function getTipPanelElements(config) {
  return {
    panel: document.getElementById(config.panelId),
    toggleButton: document.getElementById(config.toggleButtonId),
    prefix: document.getElementById(config.prefixId),
    title: document.getElementById(config.titleId),
    summary: document.getElementById(config.summaryId),
    indicator: document.getElementById(config.indicatorId),
    content: document.getElementById(config.contentId),
    amountInput: document.getElementById(config.amountInputId),
    tipSelect: document.getElementById(config.tipSelectId),
    actionButton: document.getElementById(config.actionButtonId),
    summaryCards: document.getElementById(config.summaryCardsId),
    tipAmount: document.getElementById(config.tipAmountId),
    totalAmount: document.getElementById(config.totalAmountId),
    removeButton: document.getElementById(config.removeButtonId)
  };
}

function getTipPanelState(config) {
  const { panel } = getTipPanelElements(config);
  return {
    enabled: panel?.dataset.tipEnabled === 'true',
    expanded: panel?.dataset.tipExpanded === 'true',
    appliedPercentage: Number(panel?.dataset.tipAppliedPercentage || 10)
  };
}

function setTipPanelState(config, { enabled, expanded, appliedPercentage }) {
  const { panel, tipSelect } = getTipPanelElements(config);
  if (!panel) return;

  panel.dataset.tipEnabled = String(Boolean(enabled));
  panel.dataset.tipExpanded = String(Boolean(expanded));
  if (appliedPercentage !== undefined) {
    panel.dataset.tipAppliedPercentage = String(appliedPercentage);
  }
  if (tipSelect && appliedPercentage !== undefined && enabled) {
    tipSelect.value = String(appliedPercentage);
  }
  updateTipSummary(config);
}

function resetTipPanel(config) {
  const { tipSelect, panel } = getTipPanelElements(config);
  if (tipSelect) {
    tipSelect.value = '10';
  }
  if (panel) {
    panel.dataset.tipAppliedPercentage = '10';
  }

  setTipPanelState(config, {
    enabled: false,
    expanded: false,
    appliedPercentage: 10
  });
}

function toggleTipPanel(config) {
  const { enabled, expanded } = getTipPanelState(config);

  setTipPanelState(config, {
    enabled,
    expanded: !expanded
  });
}

function applyTipSelection(config) {
  const { enabled } = getTipPanelState(config);
  const tipPercentage = getSelectedTipPercentage(config.tipSelectId);

  setTipPanelState(config, {
    enabled: true,
    expanded: true,
    appliedPercentage: tipPercentage
  });

  showToast(enabled ? 'Propina actualizada' : 'Propina agregada');
}

function removeTipSelection(config) {
  resetTipPanel(config);
  showToast('Propina eliminada');
}

function animateTipContent(content, expanded) {
  if (!content) return;

  const wasInitialized = content.dataset.tipReady === 'true';
  const wasExpanded = content.dataset.tipExpanded === 'true';

  if (!wasInitialized) {
    content.style.overflow = expanded ? 'visible' : 'hidden';
    content.style.height = expanded ? 'auto' : '0px';
    content.style.opacity = expanded ? '1' : '0';
    content.style.transform = expanded ? 'translateY(0)' : 'translateY(-6px)';
    content.style.pointerEvents = expanded ? 'auto' : 'none';
    content.dataset.tipReady = 'true';
    content.dataset.tipExpanded = String(expanded);
    return;
  }

  if (wasExpanded === expanded) {
    if (expanded) {
      content.style.overflow = 'visible';
      content.style.height = 'auto';
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
      content.style.pointerEvents = 'auto';
    } else {
      content.style.overflow = 'hidden';
      content.style.height = '0px';
      content.style.opacity = '0';
      content.style.transform = 'translateY(-6px)';
      content.style.pointerEvents = 'none';
    }
    return;
  }

  const startHeight = expanded ? 0 : content.scrollHeight;
  const endHeight = expanded ? content.scrollHeight : 0;

  content.style.overflow = 'hidden';
  content.style.willChange = 'height, opacity, transform';
  content.style.transition = 'none';
  content.style.height = `${startHeight}px`;
  content.style.opacity = expanded ? '0' : '1';
  content.style.transform = expanded ? 'translateY(-6px)' : 'translateY(0)';
  content.style.pointerEvents = expanded ? 'auto' : 'none';

  requestAnimationFrame(() => {
    content.style.transition = 'height 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1)';
    content.style.height = `${endHeight}px`;
    content.style.opacity = expanded ? '1' : '0';
    content.style.transform = expanded ? 'translateY(0)' : 'translateY(-6px)';
  });

  const handleTransitionEnd = (event) => {
    if (event.propertyName !== 'height') return;

    content.style.willChange = '';
    content.style.transition = '';
    content.style.overflow = expanded ? 'visible' : 'hidden';
    content.style.height = expanded ? 'auto' : '0px';
    content.dataset.tipExpanded = String(expanded);
    content.removeEventListener('transitionend', handleTransitionEnd);
  };

  content.addEventListener('transitionend', handleTransitionEnd);
}

function updateTipSummary(config) {
  const elements = getTipPanelElements(config);
  const {
    panel,
    prefix,
    title,
    summary,
    indicator,
    content,
    amountInput,
    tipSelect,
    actionButton,
    summaryCards,
    tipAmount,
    totalAmount
  } = elements;

  if (!panel || !amountInput || !tipSelect) return;

  const enabled = panel.dataset.tipEnabled === 'true';
  const expanded = panel.dataset.tipExpanded === 'true';
  const appliedPercentage = Number(panel.dataset.tipAppliedPercentage || 10);
  const amount = Number(amountInput.value || 0);
  const tipPercentage = getSelectedTipPercentage(config.tipSelectId);
  const displayedPercentage = enabled ? appliedPercentage : tipPercentage;
  const tipExtra = calculateTipAmount(amount, displayedPercentage);
  const totalWithTip = calculateTotalWithTip(amount, displayedPercentage);

  if (content) {
    animateTipContent(content, expanded);
  }

  if (indicator) {
    indicator.classList.toggle('rotate-180', expanded);
    indicator.classList.toggle('text-primary-dark', enabled);
    indicator.classList.toggle('text-neutral-mid', !enabled);
  }

  if (panel) {
    const compactState = !enabled && !expanded;
    panel.classList.toggle('border-transparent', compactState);
    panel.classList.toggle('px-1', compactState);
    panel.classList.toggle('py-1', compactState);
    panel.classList.toggle('border-neutral-light', !compactState);
    panel.classList.toggle('px-4', !compactState);
    panel.classList.toggle('py-3.5', !compactState);
    panel.classList.toggle('sm:px-5', !compactState);
  }

  if (prefix) {
    prefix.classList.toggle('hidden', enabled || expanded);
  }

  if (title) {
    if (!enabled) {
      title.textContent = 'Agregar propina';
    } else if (expanded) {
      title.textContent = 'Propina';
    } else {
      title.textContent = `Propina ${appliedPercentage}%`;
    }

    title.classList.toggle('text-primary-dark', !enabled);
    title.classList.toggle('font-medium', !enabled);
    title.classList.toggle('text-primary-dark', enabled);
    title.classList.toggle('font-semibold', enabled);
  }

  if (summary) {
    summary.textContent = '';
    summary.classList.add('hidden');
  }

  if (summaryCards) {
    summaryCards.classList.toggle('hidden', !enabled);
  }

  if (actionButton) {
    const hasPendingChanges = enabled && tipPercentage !== appliedPercentage;
    const shouldShowAction = !enabled || hasPendingChanges;
    actionButton.classList.toggle('hidden', !shouldShowAction);
    actionButton.textContent = enabled ? 'Guardar' : 'Agregar';
  }

  if (elements.removeButton) {
    elements.removeButton.classList.toggle('hidden', !enabled);
  }

  if (tipAmount) {
    tipAmount.textContent = `$${tipExtra.toLocaleString('es-CL')}`;
  }

  if (totalAmount) {
    totalAmount.textContent = `$${totalWithTip.toLocaleString('es-CL')}`;
  }
}

function initializeTipPanel(config) {
  const {
    toggleButton,
    amountInput,
    tipSelect,
    actionButton,
    removeButton,
    panel
  } = getTipPanelElements(config);

  if (!panel || !toggleButton || !amountInput || !tipSelect) return;

  if (!toggleButton.dataset.listenerAttached) {
    toggleButton.addEventListener('click', () => toggleTipPanel(config));
    toggleButton.dataset.listenerAttached = 'true';
  }

  if (!amountInput.dataset.tipListenerAttached) {
    amountInput.addEventListener('input', () => updateTipSummary(config));
    amountInput.dataset.tipListenerAttached = 'true';
  }

  if (!tipSelect.dataset.tipListenerAttached) {
    tipSelect.addEventListener('change', () => updateTipSummary(config));
    tipSelect.dataset.tipListenerAttached = 'true';
  }

  if (actionButton && !actionButton.dataset.listenerAttached) {
    actionButton.addEventListener('click', () => applyTipSelection(config));
    actionButton.dataset.listenerAttached = 'true';
  }

  if (removeButton && !removeButton.dataset.listenerAttached) {
    removeButton.addEventListener('click', () => removeTipSelection(config));
    removeButton.dataset.listenerAttached = 'true';
  }

  updateTipSummary(config);
}

function setTipCardState(card, amount, tipPercentage, tipEnabled) {
  const tipLine = card.querySelector('.gasto-propina');
  if (!tipLine) return;

  if (!tipEnabled) {
    tipLine.classList.add('hidden');
    tipLine.textContent = '';
    return;
  }

  const tipAmount = calculateTipAmount(amount, tipPercentage);
  const totalWithTip = calculateTotalWithTip(amount, tipPercentage);
  tipLine.classList.remove('hidden');
  tipLine.textContent = `Propina ${tipPercentage}% - $${tipAmount.toLocaleString('es-CL')} - Total $${totalWithTip.toLocaleString('es-CL')}`;
}

function getCurrentTipData(config) {
  const { panel } = getTipPanelElements(config);
  return {
    tipEnabled: panel?.dataset.tipEnabled === 'true',
    tipPercentage: Number(panel?.dataset.tipAppliedPercentage || 10)
  };
}

export function showError(errorMessage, message = 'Ese participante ya fue agregado.') {
  errorMessage.textContent = message;
  errorMessage.classList.remove('opacity-0', 'translate-y-2');
  errorMessage.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    errorMessage.classList.add('opacity-0', 'translate-y-2');
    errorMessage.classList.remove('opacity-100', 'translate-y-0');
  }, 3000);
}

export function initializeDOMHandlers() {
  const errorMessage = document.getElementById('error-message');
  const inputField = document.getElementById('friend-input');
  const addButton = document.getElementById('add-friend');
  const friendsListContainer = document.getElementById('friends-list');

  function createFriendChip(name) {
    const chip = document.createElement('div');
    chip.className = 'flex items-center bg-neutral-light text-primary-dark px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-in-out';

    const span = document.createElement('span');
    span.textContent = name;

    const removeButton = document.createElement('button');
    removeButton.className = 'ml-2 text-neutral-mid hover:text-primary-dark focus:outline-none';
    removeButton.textContent = '×';

    removeButton.addEventListener('click', () => {
      const index = participantsList.findIndex(p => p.nombre === name);
      if (index !== -1) {
        participantsList.splice(index, 1);

        for (let i = gastosList.length - 1; i >= 0; i--) {
          if (gastosList[i].payer === name) {
            gastosList.splice(i, 1);
          }
        }

        gastosList.forEach(gasto => {
          gasto.participants = gasto.participants.filter(p => p !== name);
        });
      }
      chip.remove();
    });

    chip.appendChild(span);
    chip.appendChild(removeButton);
    return chip;
  }

  function handleAddFriend() {
    const name = inputField.value.trim();

    if (name === '') return;

    if (participantsList.some(participant => participant.nombre === name)) {
      showError(errorMessage);
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
      activarWizardPaso(2);
      desactivarWizardPaso(3);
    });
  }
}

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

function cargarBotonesParticipantes() {
  const participantesGrid = document.getElementById('gasto-participantes-grid');
  participantesGrid.innerHTML = '';

  participantsList.forEach(participant => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'participant-btn px-3 py-1 rounded-full border text-xs bg-white text-primary-dark border-primary-dark hover:bg-primary-light focus:outline-none transition-all duration-300';
    button.textContent = participant.nombre;
    participantesGrid.appendChild(button);
  });

  setupParticipantToggle('#gasto-participantes-grid', '#toggle-all', '#toggle-icon');
}

export function crearGastoCard(nombreGasto, monto, pagador, participantesSeleccionados, index, tipEnabled = false, tipPercentage = 10) {
  const card = document.createElement('div');
  card.className = 'gasto-card p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-2 relative cursor-pointer overflow-hidden flex flex-col gap-2';
  card.setAttribute('data-id', index);
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

  const tipText = document.createElement('p');
  tipText.className = 'gasto-propina text-neutral-mid text-xs mt-1 hidden';

  accordionDiv.appendChild(participantsText);
  accordionDiv.appendChild(tipText);

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

  setTipCardState(card, monto, tipPercentage, tipEnabled);
  return card;
}

function limpiarFormularioGasto() {
  document.getElementById('gasto-nombre-input').value = '';
  document.getElementById('gasto-monto-input').value = '';
  document.getElementById('gasto-pagador-select').selectedIndex = 0;

  document.querySelectorAll('.participant-btn').forEach(btn => {
    btn.classList.remove('bg-secondary', 'text-white');
    btn.classList.add('bg-white', 'text-primary-dark', 'border-primary-dark', 'hover:bg-primary-light');
  });

  const toggleIcon = document.querySelector('#toggle-icon');
  const toggleBtn = document.querySelector('#toggle-all');
  if (toggleIcon && toggleBtn) {
    toggleIcon.src = toggleBtn.dataset.checkSrc;
  }

  resetTipPanel(createTipConfig);
}

function handleAddGasto() {
  const nombreGasto = document.getElementById('gasto-nombre-input').value.trim();
  const monto = getPositiveIntegerAmount('gasto-monto-input');

  const pagadorSelect = document.getElementById('gasto-pagador-select');
  const pagador = pagadorSelect.value;
  const { tipEnabled, tipPercentage } = getCurrentTipData(createTipConfig);

  const participantesSeleccionados = Array.from(
    document.querySelectorAll('.participant-btn.bg-secondary')
  ).map(btn => btn.textContent.trim());

  if (!nombreGasto || pagador === '' || pagadorSelect.selectedIndex === 0 || participantesSeleccionados.length === 0) {
    showGastoError();
    return;
  }

  if (monto === null) {
    showGastoError('Ingresa un monto entero mayor a 0.');
    return;
  }

  const index = gastosList.length;
  const newCard = crearGastoCard(
    nombreGasto,
    monto,
    pagador,
    participantesSeleccionados,
    index,
    tipEnabled,
    tipPercentage
  );
  document.getElementById('gastos-container').appendChild(newCard);

  gastosList.push({
    expense_name: nombreGasto,
    expense_amount: parseInt(monto),
    tip_enabled: tipEnabled,
    tip_percentage: tipPercentage,
    payer: pagador,
    participants: participantesSeleccionados
  });

  if (gastosList.length === 1) {
    document.getElementById('go-to-step-3').classList.remove('hidden');
  }

  limpiarFormularioGasto();
}

export function initializeGastosHandlers() {
  const addGastoButton = document.getElementById('add-gasto');

  cargarPagadores();
  cargarBotonesParticipantes();
  initializeCalculatorModal();

  if (!addGastoButton.dataset.listenerAttached) {
    addGastoButton.addEventListener('click', handleAddGasto);
    addGastoButton.dataset.listenerAttached = 'true';
  }

  initializeAmountInput('gasto-monto-input', () => updateTipSummary(createTipConfig));
  initializeTipPanel(createTipConfig);
}

function llenarSelectPagadores(selectElementId) {
  const select = document.getElementById(selectElementId);
  if (!select) return;

  select.innerHTML = '<option disabled selected>Selecciona</option>';

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
  document.getElementById('gastoTipEdit').value = String(gasto.tip_percentage ?? 10);
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

  document.getElementById('editForm').dataset.index = index;
  document.getElementById('editModal').classList.remove('hidden');

  setTipPanelState(editTipConfig, {
    enabled: gasto.tip_enabled ?? false,
    expanded: gasto.tip_enabled ?? false,
    appliedPercentage: gasto.tip_percentage ?? 10
  });
}

export function initializeEditModalHandlers() {
  const editForm = document.getElementById('editForm');
  if (!editForm) return;

  initializeCalculatorModal();
  initializeAmountInput('gastoMontoEdit', () => updateTipSummary(editTipConfig));
  initializeTipPanel(editTipConfig);

  editForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const index = parseInt(editForm.dataset.index);
    const nombre = document.getElementById('gastoNombreEdit').value.trim();
    const monto = getPositiveIntegerAmount('gastoMontoEdit');
    const pagador = document.getElementById('gastoPagadorEdit').value;
    const participantes = Array.from(document.querySelectorAll('#gastoParticipantesGridEdit .participant-btn.bg-secondary'))
      .map(btn => btn.textContent);
    const { tipEnabled, tipPercentage } = getCurrentTipData(editTipConfig);

    if (!nombre || !pagador || participantes.length === 0) {
      alert('Completa todos los campos');
      return;
    }

    if (monto === null) {
      alert('Ingresa un monto entero mayor a 0.');
      return;
    }

    gastosList[index] = {
      expense_name: nombre,
      expense_amount: monto,
      tip_enabled: tipEnabled,
      tip_percentage: tipPercentage,
      payer: pagador,
      participants: participantes
    };

    const card = document.querySelector(`.gasto-card[data-id="${index}"]`);
    if (card) {
      card.querySelector('.gasto-title').textContent = nombre;
      card.querySelector('.gasto-monto').textContent = `$${monto.toLocaleString('es-CL')}`;
      card.querySelector('.gasto-participantes').textContent = `Participaron ${participantes.join(', ')}`;
      card.querySelector('.gasto-pagador').innerHTML = `Pagó <strong>${pagador}</strong>`;
      setTipCardState(card, monto, tipPercentage, tipEnabled);
    }

    closeModal();
    showToast('Gasto actualizado');
  });
}

export function closeModal() {
  document.getElementById('editModal').classList.add('hidden');
}

export function toggleAccordion(event) {
  if (event.target.tagName.toLowerCase() === 'button') return;

  const card = event.currentTarget;
  const content = card.querySelector('.accordion-content');
  if (!content) return;

  content.classList.toggle('max-h-0');
  content.classList.toggle('max-h-96');
}

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

  gastosList.splice(gastoAEliminarIndex, 1);

  const card = document.querySelector(`.gasto-card[data-id="${gastoAEliminarIndex}"]`);
  if (card) card.remove();

  if (gastosList.length === 0) {
    document.getElementById('go-to-step-3').classList.add('hidden');
  }

  document.querySelectorAll('.gasto-card').forEach((cardElement, i) => {
    cardElement.dataset.id = i;
  });

  closeDeleteModal();
  showToast('Gasto eliminado correctamente');
}

export function confirmReset() {
  location.href = '/organizar-gastos';
}

export function closeResetModal() {
  document.getElementById('resetModal').classList.add('hidden');
}

export function openResetModal() {
  document.getElementById('resetModal').classList.remove('hidden');
}

let cleanupRepartoNudge = null;
export function initPasoRepartoNudge({ demo = true } = {}) {
  const stepEl = document.getElementById('step-reparto');
  if (!stepEl) return;

  const btnDesktop = document.getElementById('btn-recalcular');
  const btnMobile = document.getElementById('btn-recalcular-mobile');

  if (cleanupRepartoNudge) cleanupRepartoNudge();

  cleanupRepartoNudge = setupRecalcNudge({
    stepEl,
    recalcButtons: [btnDesktop, btnMobile],
    watchSelector: 'input, select',
    nudgeEveryMs: 6000,
    demoDirtyEveryMs: demo ? 14000 : 0,
  });
}

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
