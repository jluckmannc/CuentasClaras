import {
  initializeGastosHandlers,
  crearGastoCard,
  showError
} from './domHandlers.js';
import { participantsList, gastosList } from './stateManager.js';
import { enviarDatosAGestionar, renderResultados } from './resultRenderer.js';

const REPARTO_COLLAPSE_THRESHOLD = 8;
const REPARTO_PRESET_WEIGHTS = [0.5, 1, 2];
const REPARTO_FALLBACK_PARTICIPANTS = [
  'Camila',
  'Esteban',
  'Roc\u00edo',
  'Dami\u00e1n',
  'Martina',
  'Lucas',
  'Basti\u00e1n',
  'Paula',
  'Tom\u00e1s',
  'Ignacia',
  'Felipe'
];
const REPARTO_FALLBACK_EXPENSES = [
  {
    expense_name: 'Desayuno en cafeter\u00eda',
    expense_amount: 8420,
    tip_enabled: false,
    tip_percentage: 10,
    participants: ['Camila', 'Esteban', 'Roc\u00edo']
  },
  {
    expense_name: 'Arriendo de caba\u00f1a',
    expense_amount: 48450,
    tip_enabled: false,
    tip_percentage: 10,
    participants: ['Martina', 'Lucas', 'Basti\u00e1n', 'Paula']
  },
  {
    expense_name: 'Tour guiado',
    expense_amount: 19800,
    tip_enabled: false,
    tip_percentage: 10,
    participants: ['Tom\u00e1s', 'Ignacia', 'Felipe', 'Roc\u00edo', 'Dami\u00e1n']
  }
];

let _pasoActual = 1;
let repartoUIState = null;

export function getPasoActual() {
  return _pasoActual;
}

export function setPasoActual(valor) {
  _pasoActual = valor;
  renderizarSeccionActual();
}

export function renderizarSeccionActual() {
  const paso1 = document.getElementById('step-participants');
  const paso2 = document.getElementById('step-gastos');
  const paso3 = document.getElementById('step-reparto');
  const paso4 = document.getElementById('step-resultados');

  if (getPasoActual() === 1) {
    paso1?.classList.remove('hidden');
    paso2?.classList.add('hidden');
    paso3?.classList.add('hidden');
    paso4?.classList.add('hidden');
    return;
  }

  if (getPasoActual() === 2) {
    paso1?.classList.add('hidden');
    paso2?.classList.remove('hidden');
    paso3?.classList.add('hidden');
    paso4?.classList.add('hidden');

    initializeGastosHandlers();

    const gastosContainer = document.getElementById('gastos-container');
    if (gastosContainer) {
      gastosContainer.innerHTML = '';
      gastosList.forEach((gasto, index) => {
        const card = crearGastoCard(
          gasto.expense_name,
          gasto.expense_amount,
          gasto.payer,
          gasto.participants,
          index,
          gasto.tip_enabled ?? false,
          gasto.tip_percentage ?? 10
        );
        gastosContainer.appendChild(card);
      });
    }

    const continuarBtn = document.getElementById('go-to-step-3');
    if (continuarBtn) {
      continuarBtn.classList.toggle('hidden', gastosList.length === 0);
    }
    return;
  }

  if (getPasoActual() === 3) {
    paso1?.classList.add('hidden');
    paso2?.classList.add('hidden');
    paso3?.classList.remove('hidden');
    paso4?.classList.add('hidden');
    initializePasoRepartoView();
    return;
  }

  if (getPasoActual() === 4) {
    paso1?.classList.add('hidden');
    paso2?.classList.add('hidden');
    paso3?.classList.add('hidden');
    paso4?.classList.remove('hidden');

    enviarDatosAGestionar().then((res) => {
      if (res?.resumen) {
        renderResultados(res.resumen);
      }
    });
  }
}

function smoothScrollToTop(callback) {
  if (window.scrollY === 0) {
    callback();
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });

  const checkIfScrolledToTop = () => {
    if (window.scrollY === 0) {
      window.removeEventListener('scroll', checkIfScrolledToTop);
      callback();
    }
  };

  window.addEventListener('scroll', checkIfScrolledToTop);
}

export function cambiarPaso(nuevoPaso) {
  const pasoActual = getPasoActual();

  if (Math.abs(nuevoPaso - pasoActual) <= 1) {
    const direccion = nuevoPaso > pasoActual ? 'avanzar' : 'retroceder';
    const conectorId = `#conector-${Math.min(pasoActual, nuevoPaso)}-${Math.max(pasoActual, nuevoPaso)}`;
    const barra = document.querySelector(conectorId);

    smoothScrollToTop(() => {
      if (!barra) {
        setPasoActual(nuevoPaso);
        return;
      }

      barra.style.width = direccion === 'avanzar' ? '100%' : '0%';
      barra.addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'width') {
            setPasoActual(nuevoPaso);
          }
        },
        { once: true }
      );
    });
    return;
  }

  const pasos = [];
  if (nuevoPaso > pasoActual) {
    for (let index = pasoActual; index < nuevoPaso; index += 1) {
      pasos.push([index, index + 1, 'avanzar']);
    }
  } else {
    for (let index = pasoActual; index > nuevoPaso; index -= 1) {
      pasos.push([index, index - 1, 'retroceder']);
    }
  }

  const avanzarPaso = (indice) => {
    if (indice >= pasos.length) {
      setPasoActual(nuevoPaso);
      return;
    }

    const [desde, hacia, direccion] = pasos[indice];
    const conectorId = `#conector-${Math.min(desde, hacia)}-${Math.max(desde, hacia)}`;
    const barra = document.querySelector(conectorId);

    smoothScrollToTop(() => {
      if (!barra) {
        setPasoActual(hacia);
        avanzarPaso(indice + 1);
        return;
      }

      barra.style.width = direccion === 'avanzar' ? '100%' : '0%';
      barra.addEventListener(
        'transitionend',
        (event) => {
          if (event.propertyName === 'width') {
            setPasoActual(hacia);
            avanzarPaso(indice + 1);
          }
        },
        { once: true }
      );
    });
  };

  avanzarPaso(0);
}

export function pasoSiguiente() {
  cambiarPaso(getPasoActual() + 1);
}

export function pasoAnterior() {
  cambiarPaso(getPasoActual() - 1);
}

export function initializeWizardNavigation() {
  const botonPaso1 = document.getElementById('go-to-step-2');
  const botonPaso2 = document.getElementById('go-to-step-3');
  const botonPaso3 = document.getElementById('go-to-step-4');
  const botonVolverReparto = document.getElementById('volver-gastos-from-reparto');

  if (window.location.hash === '#paso2') {
    setPasoActual(2);
    hydrateGastosStep();
  } else if (window.location.hash === '#paso3') {
    activarWizardPaso(2);
    activarWizardPaso(3);
    cambiarPaso(3);
  } else if (window.location.hash === '#paso4') {
    activarWizardPaso(2);
    activarWizardPaso(3);
    activarWizardPaso(4);
    cambiarPaso(4);
  } else {
    setPasoActual(1);
  }

  botonPaso1?.addEventListener('click', () => {
    if (participantsList.length >= 2) {
      pasoSiguiente();
      activarWizardPaso(2);
      return;
    }

    const errorMessage = document.getElementById('error-message');
    showError(errorMessage, 'Debes agregar al menos 2 participantes para continuar.');
  });

  botonPaso2?.addEventListener('click', () => {
    pasoSiguiente();
    activarWizardPaso(3);
  });

  botonPaso3?.addEventListener('click', () => {
    if (!repartoUIState || repartoUIState.invalidReason || repartoUIState.dirty) {
      renderRepartoUI();
      return;
    }

    pasoSiguiente();
    activarWizardPaso(4);
  });

  botonVolverReparto?.addEventListener('click', () => {
    cambiarPaso(2);
    desactivarWizardPaso(4);
  });
}

function hydrateGastosStep() {
  if (!gastosList.length) return;

  const gastosContainer = document.getElementById('gastos-container');
  if (!gastosContainer) return;

  gastosContainer.innerHTML = '';

  gastosList.forEach((gasto, index) => {
    const card = crearGastoCard(
      gasto.expense_name,
      gasto.expense_amount,
      gasto.payer,
      gasto.participants,
      index,
      gasto.tip_enabled ?? false,
      gasto.tip_percentage ?? 10
    );
    gastosContainer.appendChild(card);
  });

  document.getElementById('go-to-step-3')?.classList.remove('hidden');
}

export function activarWizardPaso(paso) {
  const circulo = document.getElementById(`wizard-${paso}`);
  const step = circulo?.parentElement;
  const texto = step?.querySelector('p');

  if (!circulo || !texto) return;

  circulo.className =
    'w-6 h-6 rounded-full bg-primary-dark flex items-center justify-center text-white text-sm';
  texto.className = 'mt-2 text-xs md:text-sm font-body text-primary-dark';
}

export function desactivarWizardPaso(paso) {
  const circulo = document.getElementById(`wizard-${paso}`);
  const step = circulo?.parentElement;
  const texto = step?.querySelector('p');

  if (!circulo || !texto) return;

  circulo.className =
    'w-6 h-6 rounded-full bg-neutral-light flex items-center justify-center text-primary-dark text-sm';
  texto.className = 'mt-2 text-xs md:text-sm font-body text-neutral-mid';
}

export function setParticipantButtonState(button, isSelected) {
  button.classList.toggle('bg-secondary', isSelected);
  button.classList.toggle('bg-white', !isSelected);
  button.classList.toggle('text-white', isSelected);
  button.classList.toggle('text-primary-dark', !isSelected);
  button.classList.toggle('border-primary-dark', true);
  button.classList.toggle('hover:bg-primary-light', !isSelected);
}

export function showToast(message) {
  const toast = document.getElementById('toastSuccess');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove('hidden');
  window.setTimeout(() => {
    toast.classList.add('hidden');
  }, 2000);
}

function getExpenseTotalAmount(expense) {
  const baseAmount = Number(expense?.expense_amount || 0);
  const tipEnabled = Boolean(expense?.tip_enabled);
  const tipPercentage = tipEnabled ? Number(expense?.tip_percentage || 10) : 0;
  const tipAmount = tipEnabled ? Math.round(baseAmount * (tipPercentage / 100)) : 0;
  return baseAmount + tipAmount;
}

function normalizeSearchText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  return `$${Math.round(Number(value) || 0).toLocaleString('es-CL')}`;
}

function formatWeightLabel(value) {
  const numberValue = Number(value) || 1;
  if (Number.isInteger(numberValue)) {
    return `${numberValue}x`;
  }

  return `${numberValue.toFixed(2).replace(/\.?0+$/, '')}x`;
}

function parsePositiveNumber(rawValue) {
  const normalized = String(rawValue || '').replace(',', '.').trim();
  if (!normalized) return null;

  const numberValue = Number(normalized);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return null;

  return numberValue;
}

function parseLimitValue(rawValue) {
  const digitsOnly = String(rawValue || '').replace(/\D/g, '');
  if (!digitsOnly) return null;

  const numberValue = Number(digitsOnly);
  if (!Number.isFinite(numberValue) || numberValue <= 0) return null;

  return numberValue;
}

function createDefaultRepartoRow(name, baseAmount, index) {
  return {
    id: `reparto-${index}`,
    name,
    baseAmount,
    estimatedAmount: Math.round(baseAmount),
    weightMode: 'preset',
    weightValue: 1,
    customWeightInput: '',
    limitInput: '',
    open: false
  };
}

function getFallbackSourceData() {
  return {
    usesFallback: true,
    participantNames: [...REPARTO_FALLBACK_PARTICIPANTS],
    expenses: [...REPARTO_FALLBACK_EXPENSES]
  };
}

function getCurrentSourceData() {
  const hasRealParticipants = participantsList.length > 0;
  const hasRealExpenses = gastosList.length > 0;

  if (!hasRealParticipants && !hasRealExpenses) {
    return getFallbackSourceData();
  }

  const participantNames = participantsList.map((participant) => participant.nombre);
  const expenses = hasRealExpenses ? [...gastosList] : [];

  expenses.forEach((expense) => {
    (expense.participants || []).forEach((name) => {
      if (!participantNames.includes(name)) {
        participantNames.push(name);
      }
    });
  });

  return {
    usesFallback: false,
    participantNames,
    expenses
  };
}

function buildRepartoSourceSignature(participantNames, expenses) {
  return JSON.stringify({
    participants: participantNames,
    expenses: expenses.map((expense) => ({
      name: expense.expense_name,
      amount: expense.expense_amount,
      payer: expense.payer,
      participants: expense.participants,
      tip_enabled: expense.tip_enabled,
      tip_percentage: expense.tip_percentage
    }))
  });
}

function buildRepartoBaseRows() {
  const { participantNames, expenses, usesFallback } = getCurrentSourceData();
  const uniqueNames = [...new Set(participantNames)];
  const baseAmounts = new Map(uniqueNames.map((name) => [name, 0]));

  expenses.forEach((expense) => {
    const participants = Array.isArray(expense.participants)
      ? expense.participants.filter(Boolean)
      : [];

    if (!participants.length) return;

    const totalAmount = getExpenseTotalAmount(expense);
    const share = totalAmount / participants.length;

    participants.forEach((name) => {
      baseAmounts.set(name, (baseAmounts.get(name) || 0) + share);
    });
  });

  const rows = uniqueNames.map((name, index) =>
    createDefaultRepartoRow(name, baseAmounts.get(name) || 0, index)
  );
  const totalAmount = Array.from(baseAmounts.values()).reduce((sum, value) => sum + value, 0);

  return {
    rows,
    totalAmount,
    signature: buildRepartoSourceSignature(uniqueNames, expenses),
    usesFallback
  };
}

function cloneRepartoRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function getEffectiveWeight(row) {
  const weightValue =
    row.weightMode === 'custom'
      ? parsePositiveNumber(row.customWeightInput)
      : Number(row.weightValue);
  return Number.isFinite(weightValue) && weightValue > 0 ? weightValue : 1;
}

function getLimitValue(row) {
  const parsedLimit = parseLimitValue(row.limitInput);
  return parsedLimit ?? Infinity;
}

function rowHasAdjustment(row) {
  return getEffectiveWeight(row) !== 1 || Boolean(parseLimitValue(row.limitInput));
}

function calculateRoundedAllocations(entries, targetTotal) {
  const roundedAmounts = entries.map((entry) => Math.floor(entry.amount));
  let remainder = Math.round(targetTotal) - roundedAmounts.reduce((sum, value) => sum + value, 0);

  const candidates = entries
    .map((entry, index) => ({
      index,
      fraction: entry.amount - Math.floor(entry.amount),
      maxRounded: Number.isFinite(entry.limit) ? Math.floor(entry.limit) : Infinity
    }))
    .sort((left, right) => right.fraction - left.fraction);

  while (remainder > 0) {
    const nextCandidate = candidates.find(
      (candidate) => roundedAmounts[candidate.index] < candidate.maxRounded
    );

    if (!nextCandidate) {
      return { isValid: false, roundedAmounts };
    }

    roundedAmounts[nextCandidate.index] += 1;
    remainder -= 1;
  }

  return { isValid: true, roundedAmounts };
}

function calculateEstimatedAmounts(rows, totalAmount) {
  const targetTotal = Math.round(totalAmount);
  if (targetTotal <= 0) {
    return {
      isValid: true,
      amounts: rows.map(() => 0),
      invalidReason: ''
    };
  }

  const entries = rows.map((row, index) => ({
    index,
    score: Math.max(row.baseAmount, 0) * getEffectiveWeight(row),
    limit: getLimitValue(row),
    amount: 0
  }));

  let activeEntries = entries.filter((entry) => entry.score > 0);
  let remainingTotal = targetTotal;

  while (activeEntries.length > 0 && remainingTotal > 0.0001) {
    const totalScore = activeEntries.reduce((sum, entry) => sum + entry.score, 0);

    if (totalScore <= 0) {
      break;
    }

    const cappedEntries = [];
    const stillActive = [];

    activeEntries.forEach((entry) => {
      const proposedAmount = remainingTotal * (entry.score / totalScore);
      const room = Number.isFinite(entry.limit) ? entry.limit - entry.amount : Infinity;

      if (room <= 0.0001) {
        cappedEntries.push(entry);
        return;
      }

      if (Number.isFinite(entry.limit) && proposedAmount >= room - 0.0001) {
        entry.amount += room;
        cappedEntries.push(entry);
        return;
      }

      stillActive.push(entry);
    });

    if (!cappedEntries.length) {
      activeEntries.forEach((entry) => {
        entry.amount += remainingTotal * (entry.score / totalScore);
      });
      remainingTotal = 0;
      break;
    }

    remainingTotal =
      targetTotal - entries.reduce((sum, entry) => sum + Math.max(entry.amount, 0), 0);
    activeEntries = stillActive;
  }

  if (remainingTotal > 0.5) {
    return {
      isValid: false,
      amounts: rows.map((row) => Math.round(row.estimatedAmount || row.baseAmount || 0)),
      invalidReason: 'Los topes actuales no alcanzan para repartir el total.'
    };
  }

  const roundedResult = calculateRoundedAllocations(entries, targetTotal);
  if (!roundedResult.isValid) {
    return {
      isValid: false,
      amounts: rows.map((row) => Math.round(row.estimatedAmount || row.baseAmount || 0)),
      invalidReason: 'Los topes actuales no alcanzan para repartir el total.'
    };
  }

  return {
    isValid: true,
    amounts: roundedResult.roundedAmounts,
    invalidReason: ''
  };
}

function getAdjustmentCount(rows) {
  return rows.filter(rowHasAdjustment).length;
}

function resetRowAdjustments(row) {
  row.weightMode = 'preset';
  row.weightValue = 1;
  row.customWeightInput = '';
  row.limitInput = '';
}

function cloneAdjustmentState(rows) {
  return rows.map((row) => ({
    id: row.id,
    weightMode: row.weightMode,
    weightValue: row.weightValue,
    customWeightInput: row.customWeightInput,
    limitInput: row.limitInput
  }));
}

function hasPendingAdjustmentChanges(state) {
  const current = JSON.stringify(cloneAdjustmentState(state.rows));
  const applied = JSON.stringify(state.appliedRows || []);
  return current !== applied;
}

function ensureRepartoState(force = false) {
  const source = buildRepartoBaseRows();

  if (!force && repartoUIState?.sourceSignature === source.signature) {
    return repartoUIState;
  }

  repartoUIState = {
    sourceSignature: source.signature,
    totalAmount: source.totalAmount,
    rows: cloneRepartoRows(source.rows),
    usesFallback: source.usesFallback,
    editorOpen: false,
    searchQuery: '',
    showRegularParticipants: source.rows.length <= REPARTO_COLLAPSE_THRESHOLD,
    dirty: false,
    invalidReason: '',
    previousValidAmounts: source.rows.map((row) => Math.round(row.baseAmount)),
    appliedRows: cloneAdjustmentState(source.rows)
  };

  applyRepartoChanges({ markDirty: false });
  return repartoUIState;
}

function calculateDraftReparto() {
  if (!repartoUIState) return;
  return calculateEstimatedAmounts(repartoUIState.rows, repartoUIState.totalAmount);
}

function updateDraftRepartoState() {
  if (!repartoUIState) return;

  const calculation = calculateDraftReparto();
  repartoUIState.invalidReason = calculation.invalidReason;

  if (!calculation.isValid) {
    repartoUIState.dirty = hasPendingAdjustmentChanges(repartoUIState);
    return calculation;
  }

  repartoUIState.dirty = hasPendingAdjustmentChanges(repartoUIState);
  return calculation;
}

function applyRepartoChanges({ markDirty = true } = {}) {
  if (!repartoUIState) return;

  const calculation = calculateDraftReparto();
  repartoUIState.invalidReason = calculation.invalidReason;

  if (calculation.isValid) {
    repartoUIState.rows.forEach((row, index) => {
      row.estimatedAmount = calculation.amounts[index];
    });
    repartoUIState.previousValidAmounts = [...calculation.amounts];
  } else if (repartoUIState.previousValidAmounts.length === repartoUIState.rows.length) {
    repartoUIState.rows.forEach((row, index) => {
      row.estimatedAmount = repartoUIState.previousValidAmounts[index];
    });
  }

  repartoUIState.appliedRows = cloneAdjustmentState(repartoUIState.rows);
  repartoUIState.dirty = false;
}

function getSummaryPills(state) {
  const expenseCount = getCurrentSourceData().expenses.length;
  return [
    `${expenseCount} ${expenseCount === 1 ? 'gasto' : 'gastos'}`,
    `${state.rows.length} ${state.rows.length === 1 ? 'persona' : 'personas'}`,
    `${getAdjustmentCount(state.rows)} ajuste${getAdjustmentCount(state.rows) === 1 ? '' : 's'} activo${getAdjustmentCount(state.rows) === 1 ? '' : 's'}`
  ];
}

function getRowSummary(row) {
  const pieces = [];
  const weight = getEffectiveWeight(row);
  const hasLimit = Boolean(parseLimitValue(row.limitInput));

  if (weight !== 1) {
    pieces.push(`Peso ${formatWeightLabel(weight)}`);
  } else {
    pieces.push('1x');
  }

  if (hasLimit) {
    pieces.push(`Tope ${formatCurrency(parseLimitValue(row.limitInput))}`);
  } else {
    pieces.push('Sin tope');
  }

  return pieces.join(' · ');
}

function getWeightChipMarkup(row, value) {
  const isActive = row.weightMode === 'preset' && getEffectiveWeight(row) === value;
  return `
    <button
      type="button"
      data-reparto-action="set-weight"
      data-row-id="${escapeHtml(row.id)}"
      data-weight="${value}"
      class="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
        isActive
          ? 'border-primary-dark bg-primary-dark text-white'
          : 'border-neutral-light bg-white text-primary-dark hover:border-primary/25 hover:bg-primary-light'
      }">
      ${formatWeightLabel(value)}
    </button>
  `;
}

function getCustomWeightMarkup(row) {
  const isCustom = row.weightMode === 'custom';
  const customValue = isCustom ? row.customWeightInput : '';

  return `
    <div class="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        data-reparto-action="activate-custom-weight"
        data-row-id="${escapeHtml(row.id)}"
        class="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
          isCustom
            ? 'border-secondary/40 bg-secondary/10 text-primary-dark'
            : 'border-neutral-light bg-white text-primary-dark hover:border-secondary/30 hover:bg-secondary/10'
        }">
        Otro peso
      </button>
      <input
        type="text"
        inputmode="decimal"
        data-row-id="${escapeHtml(row.id)}"
        data-reparto-action="custom-weight-input"
        value="${escapeHtml(customValue)}"
        placeholder="Ej. 1,25"
        class="w-full rounded-xl border border-neutral-light px-3 py-2 text-sm text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark sm:max-w-[150px]"
      >
    </div>
  `;
}

function getRowEditorMarkup(row) {
  return `
    <div class="mt-4 rounded-2xl border border-neutral-light bg-primary-light/30 p-4">
      <div class="grid gap-4 lg:grid-cols-2">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-mid">Peso</p>
          <div class="mt-3 flex flex-wrap gap-2">
            ${REPARTO_PRESET_WEIGHTS.map((value) => getWeightChipMarkup(row, value)).join('')}
          </div>
          ${getCustomWeightMarkup(row)}
        </div>
        <label class="block">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-mid">Tope m\u00e1ximo</span>
          <input
            type="text"
            inputmode="numeric"
            data-row-id="${escapeHtml(row.id)}"
            data-reparto-action="limit-input"
            value="${escapeHtml(row.limitInput)}"
            placeholder="Sin tope"
            class="mt-3 w-full rounded-xl border border-neutral-light px-3 py-2 text-sm text-primary-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-dark"
          >
        </label>
      </div>
      <div class="mt-4 flex flex-col gap-2 text-xs text-neutral-mid sm:flex-row sm:items-center sm:justify-between">
        <span></span>
        ${
          rowHasAdjustment(row)
            ? `
              <button
                type="button"
                data-reparto-action="reset-row"
                data-row-id="${escapeHtml(row.id)}"
                class="self-start font-medium text-primary-dark underline underline-offset-4 transition-colors duration-200 hover:text-secondary sm:self-auto">
                Limpiar
              </button>
            `
            : ''
        }
      </div>
    </div>
  `;
}

function getRowMarkup(row) {
  const isOpen = Boolean(row.open);
  const rowSummary = rowHasAdjustment(row) ? getRowSummary(row) : '';

  return `
    <article class="px-4 py-4 ${isOpen ? 'bg-primary-light/20' : 'bg-white'}">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-primary-dark">${escapeHtml(row.name)}</p>
          ${rowSummary ? `<p class="mt-1 text-xs text-neutral-mid">${escapeHtml(rowSummary)}</p>` : ''}
        </div>
        <div class="shrink-0 text-right">
          <p class="text-base font-semibold text-primary-dark">${formatCurrency(row.estimatedAmount)}</p>
          <button
            type="button"
            data-reparto-action="toggle-row"
            data-row-id="${escapeHtml(row.id)}"
            class="mt-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-light text-sm font-medium text-primary-dark transition-all duration-200 hover:border-primary/25 hover:bg-primary-light">
            ${isOpen ? '&#9652;' : '&#9662;'}
          </button>
        </div>
      </div>
      ${isOpen ? getRowEditorMarkup(row) : ''}
    </article>
  `;
}

function getEmptyStateMarkup(message) {
  return `
    <div class="px-4 py-10 text-center text-sm text-neutral-mid">
      ${escapeHtml(message)}
    </div>
  `;
}

function renderRepartoUI() {
  const state = ensureRepartoState();
  const stepRoot = document.getElementById('step-reparto');
  const summaryNote = document.getElementById('reparto-summary-note');
  const statusChip = document.getElementById('reparto-status-chip');
  const summaryPills = document.getElementById('reparto-summary-pills');
  const dirtyBanner = document.getElementById('reparto-dirty-banner');
  const editorShell = document.getElementById('reparto-editor-shell');
  const ajustesSection = document.getElementById('reparto-ajustes-section');
  const ajustesCount = document.getElementById('reparto-ajustes-count');
  const ajustesList = document.getElementById('reparto-ajustes-list');
  const regularTitle = document.getElementById('reparto-regular-title');
  const regularNote = document.getElementById('reparto-regular-note');
  const regularList = document.getElementById('tabla-reparto');
  const footerNote = document.getElementById('reparto-footer-note');
  const totalDisplay = document.getElementById('reparto-total-display');
  const toggleButton = document.getElementById('btn-toggle-participantes');
  const resetButton = document.getElementById('btn-restablecer-reparto');
  const personalizeButton = document.getElementById('btn-personalizar-reparto');
  const recalcButton = document.getElementById('btn-recalcular');
  const recalcMobileButton = document.getElementById('btn-recalcular-mobile');
  const continueButton = document.getElementById('go-to-step-4');
  const searchInput = document.getElementById('reparto-search-input');

  if (
    !stepRoot ||
    !summaryNote ||
    !statusChip ||
    !summaryPills ||
    !dirtyBanner ||
    !editorShell ||
    !ajustesSection ||
    !ajustesCount ||
    !ajustesList ||
    !regularTitle ||
    !regularNote ||
    !regularList ||
    !footerNote ||
    !totalDisplay ||
    !toggleButton ||
    !resetButton ||
    !personalizeButton ||
    !recalcButton ||
    !recalcMobileButton ||
    !continueButton ||
    !searchInput
  ) {
    return;
  }

  const adjustmentCount = getAdjustmentCount(state.rows);
  const normalizedSearch = normalizeSearchText(state.searchQuery);
  const matchingRows = normalizedSearch
    ? state.rows.filter((row) => normalizeSearchText(row.name).includes(normalizedSearch))
    : [...state.rows];
  const adjustedRows = matchingRows.filter((row) => rowHasAdjustment(row));
  const regularRows = matchingRows.filter((row) => !rowHasAdjustment(row));
  const previewCount = adjustmentCount > 0 ? 0 : Math.min(4, regularRows.length);
  const hideRegularRows =
    state.editorOpen &&
    !normalizedSearch &&
    regularRows.length > previewCount &&
    !state.showRegularParticipants;
  const visibleRows = hideRegularRows
    ? regularRows.slice(0, previewCount)
    : regularRows;

  summaryNote.textContent = '';
  summaryNote.textContent = state.editorOpen
    ? 'Ajusta solo a quienes necesiten un reparto distinto.'
    : 'Se calcula autom\u00e1ticamente seg\u00fan los gastos registrados.';
  summaryNote.classList.remove('hidden');

  statusChip.className =
    'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ' +
    (state.invalidReason || state.dirty
      ? 'bg-secondary/10 text-primary-dark'
      : 'bg-primary-light text-primary-dark');
  if (state.invalidReason) {
    statusChip.textContent = 'Revisa topes';
    statusChip.classList.remove('hidden');
  } else if (state.dirty) {
    statusChip.textContent = 'Pendiente';
    statusChip.classList.remove('hidden');
  } else if (adjustmentCount) {
    statusChip.textContent = 'Ajustado';
    statusChip.classList.remove('hidden');
  } else {
    statusChip.textContent = '';
    statusChip.classList.add('hidden');
  }

  summaryPills.innerHTML = getSummaryPills(state)
    .filter((pill, index) => index < 2 || adjustmentCount > 0)
    .map(
      (pill) => `
        <span class="inline-flex items-center rounded-full border border-neutral-light bg-white px-3 py-1 text-xs font-medium text-primary-dark">
          ${escapeHtml(pill)}
        </span>
      `
    )
    .join('');

  dirtyBanner.className = 'hidden mt-5 rounded-2xl border border-secondary/20 bg-secondary/10 px-4 py-3 text-sm text-primary-dark';
  dirtyBanner.textContent = '';

  editorShell.classList.toggle('hidden', !state.editorOpen);
  searchInput.value = state.searchQuery;
  searchInput.parentElement?.classList.toggle(
    'hidden',
    !state.editorOpen || state.rows.length <= REPARTO_COLLAPSE_THRESHOLD
  );

  ajustesSection.classList.toggle('hidden', !state.editorOpen || adjustedRows.length === 0);
  ajustesCount.textContent = adjustedRows.length ? `${adjustedRows.length}` : '';
  ajustesList.innerHTML = adjustedRows.length
    ? adjustedRows.map((row) => getRowMarkup(row)).join('')
    : '';

  regularTitle.textContent = adjustedRows.length ? 'Resto del grupo' : 'Participantes';
  regularNote.textContent = '';
  regularNote.classList.add('hidden');

  if (visibleRows.length) {
    regularList.innerHTML = visibleRows.map((row) => getRowMarkup(row)).join('');
  } else {
    regularList.innerHTML = getEmptyStateMarkup(
      normalizedSearch
        ? 'No hay coincidencias.'
        : adjustedRows.length
          ? 'El resto del grupo sigue igual.'
          : 'Sin participantes.'
    );
  }

  toggleButton.classList.toggle(
    'hidden',
    !state.editorOpen ||
      normalizedSearch ||
      regularRows.length <= previewCount ||
      (adjustedRows.length > 0 && regularRows.length === 0)
  );
  toggleButton.textContent = hideRegularRows ? 'Ver todos' : 'Ver menos';

  resetButton.classList.toggle('hidden', !state.editorOpen || adjustmentCount === 0);

  personalizeButton.textContent = state.editorOpen ? 'Cerrar ajustes' : 'Ajustar reparto';

  recalcButton.classList.toggle('hidden', !state.dirty);
  recalcButton.disabled = Boolean(state.invalidReason);
  recalcMobileButton.classList.toggle('hidden', !state.dirty);
  recalcMobileButton.disabled = Boolean(state.invalidReason);

  continueButton.disabled = Boolean(state.invalidReason || state.dirty);
  footerNote.textContent = state.invalidReason
    ? 'Revisa los topes.'
    : state.dirty
      ? 'Aplica los cambios para continuar.'
    : '';
  footerNote.classList.toggle('hidden', !footerNote.textContent);
  totalDisplay.textContent = formatCurrency(state.totalAmount);

  bindRepartoEvents();
}

function bindRepartoEvents() {
  const state = repartoUIState;
  if (!state) return;

  const personalizeButton = document.getElementById('btn-personalizar-reparto');
  const resetButton = document.getElementById('btn-restablecer-reparto');
  const toggleButton = document.getElementById('btn-toggle-participantes');
  const recalcButton = document.getElementById('btn-recalcular');
  const recalcMobileButton = document.getElementById('btn-recalcular-mobile');
  const searchInput = document.getElementById('reparto-search-input');
  const stepRoot = document.getElementById('step-reparto');

  if (personalizeButton) {
    personalizeButton.onclick = () => {
      state.editorOpen = !state.editorOpen;
      if (!state.editorOpen) {
        state.rows.forEach((row) => {
          row.open = false;
        });
      }
      renderRepartoUI();
    };
  }

  if (resetButton) {
    resetButton.onclick = () => {
      state.rows.forEach((row) => {
        resetRowAdjustments(row);
        row.open = false;
      });
      updateDraftRepartoState();
      renderRepartoUI();
    };
  }

  if (toggleButton) {
    toggleButton.onclick = () => {
      state.showRegularParticipants = !state.showRegularParticipants;
      renderRepartoUI();
    };
  }

  if (recalcButton) {
    recalcButton.onclick = () => {
      applyRepartoChanges();
      renderRepartoUI();
    };
  }

  if (recalcMobileButton) {
    recalcMobileButton.onclick = () => {
      applyRepartoChanges();
      renderRepartoUI();
    };
  }

  if (searchInput) {
    searchInput.oninput = (event) => {
      state.searchQuery = event.currentTarget.value;
      if (state.searchQuery.trim()) {
        state.showRegularParticipants = true;
      } else {
        state.showRegularParticipants = false;
      }
      renderRepartoUI();
    };

    searchInput.onkeydown = (event) => {
      if (event.key !== 'ArrowDown' || !state.searchQuery.trim()) return;

      const firstEditButton = document.querySelector(
        '#step-reparto [data-reparto-action="toggle-row"]'
      );

      if (firstEditButton instanceof HTMLElement) {
        event.preventDefault();
        firstEditButton.focus();
      }
    };
  }

  if (!stepRoot) return;

  stepRoot.querySelectorAll('[data-reparto-action="toggle-row"]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = state.rows.find((item) => item.id === button.dataset.rowId);
      if (!row) return;

      const nextOpenState = !row.open;
      state.rows.forEach((item) => {
        item.open = false;
      });
      row.open = nextOpenState;
      state.editorOpen = true;
      state.showRegularParticipants = true;
      renderRepartoUI();
    });
  });

  stepRoot.querySelectorAll('[data-reparto-action="set-weight"]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = state.rows.find((item) => item.id === button.dataset.rowId);
      const nextWeight = Number(button.dataset.weight);
      if (!row || !Number.isFinite(nextWeight) || nextWeight <= 0) return;

      row.weightMode = 'preset';
      row.weightValue = nextWeight;
      row.customWeightInput = '';
      updateDraftRepartoState();
      renderRepartoUI();
    });
  });

  stepRoot.querySelectorAll('[data-reparto-action="activate-custom-weight"]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = state.rows.find((item) => item.id === button.dataset.rowId);
      if (!row) return;

      row.weightMode = 'custom';
      if (!row.customWeightInput) {
        const nextDefaultWeight = getEffectiveWeight(row) === 1 ? '1,25' : String(getEffectiveWeight(row)).replace('.', ',');
        row.customWeightInput = nextDefaultWeight;
      }
      updateDraftRepartoState();
      renderRepartoUI();
    });
  });

  stepRoot.querySelectorAll('[data-reparto-action="custom-weight-input"]').forEach((input) => {
    input.addEventListener('input', () => {
      const row = state.rows.find((item) => item.id === input.dataset.rowId);
      if (!row) return;

      row.weightMode = 'custom';
      row.customWeightInput = String(input.value || '').replace(/[^0-9,.\s]/g, '').trim();
      const parsedWeight = parsePositiveNumber(row.customWeightInput);
      row.weightValue = parsedWeight === null ? 1 : Number(parsedWeight.toFixed(2));

      updateDraftRepartoState();
    });

    input.addEventListener('blur', () => {
      renderRepartoUI();
    });
  });

  stepRoot.querySelectorAll('[data-reparto-action="limit-input"]').forEach((input) => {
    input.addEventListener('input', () => {
      const row = state.rows.find((item) => item.id === input.dataset.rowId);
      if (!row) return;

      row.limitInput = String(input.value || '').replace(/\D/g, '');
      updateDraftRepartoState();
    });

    input.addEventListener('blur', () => {
      renderRepartoUI();
    });
  });

  stepRoot.querySelectorAll('[data-reparto-action="reset-row"]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = state.rows.find((item) => item.id === button.dataset.rowId);
      if (!row) return;

      resetRowAdjustments(row);
      updateDraftRepartoState();
      renderRepartoUI();
    });
  });
}

function initializePasoRepartoView(force = false) {
  ensureRepartoState(force);
  renderRepartoUI();
}

export function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

export function isInViewport(element) {
  if (!element) return false;

  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  return rect.bottom > 0 && rect.right > 0 && rect.top < viewportHeight && rect.left < viewportWidth;
}

export function restartAnimationClass(element, className) {
  if (!element) return;

  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

export function ensureRecalcNudgeStyles() {
  if (document.getElementById('recalc-nudge-styles')) return;

  const style = document.createElement('style');
  style.id = 'recalc-nudge-styles';
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      .recalc-attn, .recalc-ping, .recalc-pill { animation: none !important; transition: none !important; }
    }

    @keyframes recalcFlash {
      0%   { box-shadow: 0 0 0 0 rgba(36,115,188,.00); transform: translateY(0); }
      15%  { box-shadow: 0 0 0 6px rgba(36,115,188,.18); }
      35%  { box-shadow: 0 0 0 10px rgba(36,115,188,.10); }
      100% { box-shadow: 0 0 0 0 rgba(36,115,188,.00); transform: translateY(0); }
    }

    .recalc-attn {
      color: rgb(0, 91, 159);
      text-decoration: underline;
      animation: recalcFlash 900ms ease-out 1;
    }

    .recalc-pill {
      position: fixed;
      left: 50%;
      bottom: 16px;
      transform: translateX(-50%);
      z-index: 50;
      display: none;
      gap: 8px;
      align-items: center;
      padding: 10px 12px;
      border-radius: 9999px;
      background: rgba(255,255,255,.92);
      border: 1px solid rgba(0,0,0,.08);
      box-shadow: 0 10px 30px rgba(0,0,0,.10);
      font-size: 13px;
      color: rgba(0,0,0,.72);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      user-select: none;
    }

    .recalc-pill strong { color: rgb(0, 91, 159); font-weight: 700; }

    @keyframes pillPulse {
      0%   { box-shadow: 0 10px 30px rgba(0,0,0,.10); }
      50%  { box-shadow: 0 12px 34px rgba(36,115,188,.20); }
      100% { box-shadow: 0 10px 30px rgba(0,0,0,.10); }
    }

    .recalc-pill.recalc-ping { animation: pillPulse 1.1s ease-in-out 1; }
  `;
  document.head.appendChild(style);
}

export function createRecalcPill({
  text = 'Cambios sin aplicar · <strong>Recalcular</strong>',
  ariaLive = 'polite'
} = {}) {
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.className = 'recalc-pill';
  pill.setAttribute('aria-live', ariaLive);
  pill.innerHTML = text;
  document.body.appendChild(pill);
  return pill;
}

export function setupRecalcNudge({
  stepEl,
  recalcButtons = [],
  watchSelector = 'input, select',
  nudgeEveryMs = 6000,
  demoDirtyEveryMs = 0
} = {}) {
  if (!stepEl) return () => {};

  ensureRecalcNudgeStyles();

  const watched = Array.from(stepEl.querySelectorAll(watchSelector)).filter(
    (element) => element.dataset.ignoreDirty !== 'true'
  );
  const buttons = recalcButtons.filter(Boolean);
  const pill = createRecalcPill();

  let dirty = false;
  let nudgeTimer = null;
  let demoTimer = null;

  const flashButton = (button) => {
    if (!button) return;
    restartAnimationClass(button, 'recalc-attn');
    window.setTimeout(() => button.classList.remove('recalc-attn'), 1000);
  };

  const pingPill = () => {
    restartAnimationClass(pill, 'recalc-ping');
    window.setTimeout(() => pill.classList.remove('recalc-ping'), 1200);
  };

  const updateAffordance = () => {
    if (!dirty) {
      pill.style.display = 'none';
      return;
    }

    const visibleButton = buttons.find(isInViewport);

    if (visibleButton) {
      pill.style.display = 'none';
      flashButton(visibleButton);
      return;
    }

    pill.style.display = 'inline-flex';
    pingPill();
  };

  const setDirty = (value) => {
    dirty = Boolean(value);
    updateAffordance();

    if (dirty && !nudgeTimer) {
      nudgeTimer = window.setInterval(updateAffordance, nudgeEveryMs);
    }

    if (!dirty && nudgeTimer) {
      window.clearInterval(nudgeTimer);
      nudgeTimer = null;
    }
  };

  const onChange = () => setDirty(true);
  watched.forEach((element) => {
    element.addEventListener('input', onChange, { passive: true });
    element.addEventListener('change', onChange, { passive: true });
  });

  const onRecalc = () => setDirty(false);
  buttons.forEach((button) => button.addEventListener('click', onRecalc));

  const onViewportChange = () => {
    if (dirty) updateAffordance();
  };
  window.addEventListener('scroll', onViewportChange, { passive: true });
  window.addEventListener('resize', onViewportChange, { passive: true });

  pill.addEventListener('click', () => {
    const target = buttons.find(Boolean);
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => flashButton(target), 350);
  });

  if (demoDirtyEveryMs > 0) {
    demoTimer = window.setInterval(() => setDirty(true), demoDirtyEveryMs);
  }

  return function cleanup() {
    watched.forEach((element) => {
      element.removeEventListener('input', onChange);
      element.removeEventListener('change', onChange);
    });
    buttons.forEach((button) => button.removeEventListener('click', onRecalc));
    window.removeEventListener('scroll', onViewportChange);
    window.removeEventListener('resize', onViewportChange);

    if (nudgeTimer) window.clearInterval(nudgeTimer);
    if (demoTimer) window.clearInterval(demoTimer);

    pill.remove();
  };
}
