# AGENTS.md — Guía de trabajo para Codex en Cuentas Claras

Este archivo define el contexto, la arquitectura, las reglas de modificación y los criterios de calidad que deben respetarse al trabajar en el proyecto **Cuentas Claras**.

Debe leerse antes de realizar cualquier cambio con Codex u otro asistente de programación.

---

## 1. Propósito del proyecto

**Cuentas Claras** es una aplicación web pensada para organizar gastos compartidos entre grupos de personas.

Su objetivo principal es permitir que un grupo ingrese:

1. quiénes participaron;
2. qué gastos se realizaron;
3. quién pagó cada gasto;
4. quiénes participaron en cada gasto;
5. y obtener como resultado final quién debe pagarle a quién.

La aplicación busca entregar un resultado **simple, justo y rápido**, minimizando la cantidad de transferencias necesarias entre los participantes.

El espíritu del proyecto es evitar cálculos manuales, confusiones, diferencias por redondeos y discusiones innecesarias en contextos como viajes, cumpleaños, convivencias, campamentos o gastos grupales cotidianos.

---

## 2. Stack actual

El proyecto actualmente usa:

- **Backend:** Django 4.2.
- **Frontend:** Django Templates + JavaScript vanilla modular.
- **Estilos:** Tailwind CSS 3 compilado a `static/css/output.css`.
- **Base de datos:** existe `db.sqlite3`, pero la lógica actual funciona principalmente en memoria durante la sesión del navegador.
- **Idioma del proyecto:** español.
- **Zona horaria:** `America/Santiago`.

No usa React, Vue, Next.js, Angular ni frameworks frontend equivalentes.

---

## 3. Estructura actual del proyecto

Estructura principal:

```txt
CuentasClaras/
├── applications/
│   └── balances/
│       ├── admin.py
│       ├── apps.py
│       ├── models.py
│       ├── tests.py
│       ├── urls.py
│       └── views.py
├── cuentasclaras/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
├── static/
│   ├── css/
│   │   ├── tailwind.css
│   │   └── output.css
│   ├── fonts/
│   ├── img/
│   └── js/
│       ├── apiService.js
│       ├── domHandlers.js
│       ├── resultRenderer.js
│       ├── stateManager.js
│       └── utils.js
├── templates/
│   ├── base.html
│   ├── balances/
│   │   └── wizard.html
│   └── static_pages/
│       ├── home.html
│       └── about.html
├── manage.py
├── package.json
├── requirements.txt
└── tailwind.config.js
```

---

## 4. Flujo funcional principal

El flujo principal de la aplicación es un wizard de cuatro pasos:


El flujo principal de la aplicación es un wizard de cuatro pasos:  
  
### Paso 1 — Participantes  
  
El usuario agrega los nombres de las personas que compartieron gastos.  
  
Reglas actuales:  
  
- debe haber al menos 2 participantes para continuar;  
- no deben agregarse participantes duplicados;  
- los participantes se almacenan en `participantsList`, definido en `static/js/stateManager.js`;  
- cada participante actualmente se maneja como objeto con la forma:
```js  
{  
id: 123456789,  
nombre: "Nombre"  
}
```

### Paso 2 — Gastos

El usuario registra gastos indicando:

- nombre del gasto;
- monto;
- quién pagó;
- quiénes participaron en ese gasto.

Los gastos se almacenan en `gastosList`, definido en `static/js/stateManager.js`.

Cada gasto tiene la forma:

```js
{
  expense_name: "Nombre del gasto",
  expense_amount: 10000,
  payer: "Nombre del pagador",
  participants: ["Persona 1", "Persona 2"]
}
```

### Paso 3 — Reparto

El usuario accede a una sección intermedia de reparto antes de calcular el resultado final.

Esta etapa está pensada para ajustar condiciones del reparto antes de generar el resumen definitivo.

La interfaz actual considera:

- pesos o proporciones de pago por participante;
- límites opcionales de pago;
- pago estimado;
- botón de "Recalcular";
- aviso visual cuando existen cambios pendientes de recalcular.

Importante:

- esta etapa existe actualmente principalmente a nivel de diseño/interfaz;
- la lógica definitiva de cálculo con pesos y límites aún debe consolidarse antes de modificar el backend;
- Codex no debe asumir que el backend ya procesa pesos, límites o reparto personalizado si esa lógica no está implementada explícitamente.

### Paso 4 — Resultado

El frontend envía los gastos al endpoint:

```txt
POST /procesar-gastos/
```



El backend calcula:

- cuánto debe asumir cada participante;
- cuánto pagó cada persona;
- el balance neto individual;
- las transacciones necesarias para equilibrar el grupo.

El resultado se renderiza agrupado por acreedor, indicando quién debe pagarle a quién.

---

## 5. Lógica de cálculo actual

La lógica principal está actualmente en:

```txt
applications/balances/views.py
```

Funciones relevantes:

- `procesar_gasto(...)`
- `calcular_balances_individuales(...)`
- `ajustar_balances(...)`
- `calcular_balances(...)`
- `agrupar_transacciones(...)`
- `procesar_gastos(request)`

El algoritmo general es:

1. Para cada gasto, dividir el monto entre sus participantes.
2. Sumar cuánto debe cada participante.
3. Sumar cuánto pagó cada pagador.
4. Calcular balance individual: `pagó - debe`.
5. Separar deudores y acreedores.
6. Crear transferencias entre deudores y acreedores hasta equilibrar los balances.
7. Agrupar las transferencias para mostrarlas de forma clara en el frontend.

---

## 6. Regla importante para futuras ampliaciones

Actualmente, `views.py` mezcla:

- vistas Django;
- cálculo de balances;
- agrupación de resultados;
- validación básica de request.

Para funcionalidades nuevas, no seguir aumentando indefinidamente `views.py`.

Si se agregan nuevas capacidades de cálculo, validación, historial, monedas, exportación, usuarios, grupos, eventos o persistencia, se recomienda separar responsabilidades progresivamente.

Estructura sugerida para crecer:

```txt
applications/balances/
├── services.py       # Casos de uso principales del dominio
├── calculators.py    # Algoritmos de cálculo de balances y transacciones
├── validators.py     # Validaciones de datos de entrada
├── serializers.py    # Normalización de payloads si hace falta
├── models.py         # Modelos persistentes cuando se use base de datos
├── views.py          # Solo request/response y renderizado
└── urls.py
```

Codex debe preferir refactors pequeños y controlados antes que reescrituras grandes.

---

## 7. Reglas estrictas para Codex

Al modificar este proyecto, Codex debe cumplir estas reglas:

1. **No reescribir toda la aplicación** salvo instrucción explícita.
2. **No migrar a React, Vue, Next.js ni otro framework frontend** salvo instrucción explícita.
3. **Mantener Django Templates** como sistema principal de vistas.
4. **Mantener JavaScript vanilla modular** en `static/js/`.
5. **No romper el flujo actual:** participantes → gastos → resultado.
6. **No cambiar rutas existentes** sin actualizar templates, JS y documentación.
7. **No eliminar funcionalidades ya existentes** sin justificación clara.
8. **No mezclar grandes cambios visuales con cambios de lógica** en la misma tarea.
9. **No agregar dependencias nuevas** sin explicar por qué son necesarias.
10. **No modificar `output.css` manualmente**. Los estilos fuente deben ir en templates, JS, `tailwind.css` o `tailwind.config.js`, y luego compilar Tailwind.
11. **No guardar secretos reales en el repositorio.**
12. **No asumir que hay autenticación o usuarios persistentes** si no se ha implementado explícitamente.
13. **No romper compatibilidad con español chileno** en textos visibles.
14. **No cambiar nombres públicos del flujo** sin motivo: Participantes, Gastos, Resultado.
15. **Antes de cambios grandes**, proponer un plan breve y esperar instrucción humana si el alcance es ambiguo.

---

## 8. Criterios de estilo visual

La identidad visual actual está definida principalmente en `tailwind.config.js`.

Colores principales:

```js
primary: {
  DEFAULT: '#0077ff',
  dark: '#0a2540',
  light: '#f1f6fb',
}
secondary: {
  DEFAULT: '#ff7b6b',
  hover: '#ff5a4d',
}
neutral: {
  DEFAULT: '#ffffff',
  dark: '#1d3557',
  mid: '#6c757d',
  light: '#e0e0e0',
}
accent: {
  success: '#48cae4',
  warning: '#ff3b30',
}
```

Tipografía principal:

```js
Poppins
```

Estética esperada:

- limpia;
- amigable;
- simple;
- moderna;
- visualmente clara;
- orientada a usuarios no técnicos;
- sin sobrecargar la interfaz.

Las tarjetas, botones, chips y modales deben mantener coherencia con el estilo actual: bordes redondeados, sombras suaves, colores primarios/secundarios y textos claros.

---

## 9. Convenciones frontend actuales

Archivos actuales:

### `stateManager.js`

Responsable del estado compartido en memoria:

- `participantsList`
- `gastosList`

Actualmente contiene también datos de prueba cuando la URL usa `#paso2`.

### `domHandlers.js`

Responsable de:

- agregar participantes;
- crear chips de participantes;
- cargar select de pagadores;
- crear botones de participantes;
- crear tarjetas de gastos;
- editar gastos;
- eliminar gastos;
- manejar modales;
- exponer algunas funciones en `window` para uso desde HTML.

### `utils.js`

Responsable de:

- estado del paso actual;
- navegación del wizard;
- renderizado de pasos;
- activación/desactivación visual de pasos;
- utilidades visuales como selección de participantes y toast.

### `resultRenderer.js`

Responsable de:

- enviar gastos al backend;
- recibir resultados;
- renderizar resumen;
- copiar resumen al portapapeles.

### `apiService.js`

Actualmente existe, pero está prácticamente vacío. Si se agregan más llamadas al backend, este archivo puede convertirse en el lugar adecuado para centralizar `fetch`, manejo de errores y CSRF.

---

## 10. Convenciones recomendadas para nuevo JavaScript

Cuando se agregue JavaScript nuevo:

- Usar módulos ES (`import` / `export`).
- Evitar duplicar lógica DOM.
- Evitar funciones globales en `window`, salvo que sea necesario por compatibilidad con HTML existente.
- Mantener nombres en español cuando representen conceptos del dominio visible: participante, gasto, resultado, pagador.
- Mantener nombres técnicos en inglés si ya existen en payloads: `expense_name`, `expense_amount`, `payer`, `participants`.
- Evitar mezclar manipulación DOM con lógica de cálculo financiero.
- Si una función crece demasiado, dividirla en funciones pequeñas.
- No usar librerías externas si vanilla JS resuelve el problema razonablemente.

---

## 11. Contrato de datos frontend → backend

El frontend envía al backend un payload con esta forma:

```json
{
  "expenses": [
    {
      "expense_name": "Cena",
      "expense_amount": 30000,
      "payer": "Camila",
      "participants": ["Camila", "Esteban", "Rocío"]
    }
  ]
}
```

El backend responde actualmente con:

```json
{
  "status": "success",
  "balances": {
    "Camila": 10000,
    "Esteban": -5000,
    "Rocío": -5000
  },
  "resumen": {
    "Camila": [
      {
        "deudor": "Esteban",
        "monto": 5000
      },
      {
        "deudor": "Rocío",
        "monto": 5000
      }
    ]
  }
}
```

Codex no debe cambiar este contrato sin actualizar simultáneamente:

- backend;
- frontend;
- renderizado de resultados;
- documentación;
- pruebas, si existen.

---

## 12. Reglas de cálculo financiero

Los cálculos deben respetar estas ideas:

1. Cada gasto se divide entre las personas que participaron en ese gasto.
2. No necesariamente todos los participantes participan en todos los gastos.
3. El pagador puede o no estar incluido entre los participantes del gasto, según lo que permita la interfaz.
4. El resultado debe equilibrar deudas: la suma de balances debe tender a cero.
5. Las transferencias deben intentar minimizar la cantidad de pagos necesarios.
6. Los montos visibles al usuario deben formatearse en pesos chilenos con `toLocaleString('es-CL')` o equivalente.
7. Al trabajar con pesos chilenos, normalmente no se necesitan decimales.
8. Cuidar redondeos: si se agregan monedas con decimales o división exacta, revisar esta regla.

---

## 13. Funcionalidades futuras esperables

El proyecto puede crecer hacia funcionalidades como:

- guardar eventos o grupos;
- historial de gastos;
- edición avanzada de participantes;
- persistencia en base de datos;
- compartir resultados por enlace;
- exportar resumen a texto, PDF o imagen;
- copiar mensaje para WhatsApp;
- distintas monedas;
- login opcional;
- grupos recurrentes;
- plantillas de gastos;
- comprobantes o adjuntos;
- validaciones más robustas;
- tests unitarios del algoritmo de balance.

Estas funcionalidades deben agregarse respetando el flujo y la arquitectura existente.

---

## 14. Criterio para introducir base de datos

Actualmente la experiencia principal funciona en memoria durante el uso del navegador.

Si se implementa persistencia, hacerlo de forma gradual:

1. definir modelos claros en `models.py`;
2. crear migraciones;
3. mantener compatibilidad con el flujo actual;
4. no obligar a login si la funcionalidad puede seguir siendo anónima;
5. separar “evento/grupo” de “participantes” y “gastos”.

Modelo conceptual futuro posible:

```txt
Evento
├── nombre
├── fecha_creacion
├── slug/token opcional

Participante
├── evento
├── nombre

Gasto
├── evento
├── nombre
├── monto
├── pagador

ParticipacionGasto
├── gasto
├── participante
```

No implementar esto automáticamente salvo que la tarea lo pida.

---

## 15. Seguridad y configuración

Estado actual observado:

- `DEBUG = True`.
- `ALLOWED_HOSTS = ['*']`.
- Hay `SECRET_KEY` en `settings.py`.

Para desarrollo local esto puede funcionar, pero para producción debe corregirse.

Si la tarea es preparar producción, Codex debe:

- mover `SECRET_KEY` a variable de entorno;
- configurar `DEBUG` desde variable de entorno;
- restringir `ALLOWED_HOSTS`;
- revisar CSRF;
- revisar manejo de archivos estáticos;
- no subir secretos reales.

No realizar estos cambios en tareas pequeñas de UI o lógica si no han sido solicitados.

---

## 16. Comandos útiles

Instalar dependencias Python:

```bash
pip install -r requirements.txt
```

Instalar dependencias Node:

```bash
npm install
```

Correr servidor Django:

```bash
python manage.py runserver
```

Compilar Tailwind en modo observación, si el script no existe en `package.json`, usar comando equivalente:

```bash
npx tailwindcss -i ./static/css/tailwind.css -o ./static/css/output.css --watch
```

Compilar Tailwind una vez:

```bash
npx tailwindcss -i ./static/css/tailwind.css -o ./static/css/output.css
```

---

## 17. Pruebas recomendadas antes de cerrar una tarea

Antes de considerar terminado un cambio, revisar manualmente:

1. La home carga correctamente.
2. La página “Sobre el proyecto” carga correctamente.
3. El wizard abre en `/organizar-gastos/`.
4. No se puede avanzar con menos de 2 participantes.
5. Se pueden agregar participantes.
6. Se pueden agregar gastos.
7. Se pueden editar gastos.
8. Se pueden eliminar gastos.
9. El botón continuar aparece solo cuando hay gastos.
10. El resultado se calcula correctamente.
11. El resumen se puede copiar.
12. Los modales abren y cierran correctamente.
13. El diseño sigue viéndose bien en móvil.
14. La consola del navegador no muestra errores nuevos.
15. Django no muestra errores en terminal.

---

## 18. Reglas para refactor

Si se pide refactorizar:

- preservar comportamiento observable;
- hacerlo en pasos pequeños;
- explicar qué se movió y por qué;
- no mezclar refactor con nuevas funcionalidades grandes;
- agregar pruebas del algoritmo si se modifica la lógica de cálculo;
- mantener nombres de rutas y contratos JSON salvo instrucción contraria.

Refactor recomendado prioritario:

1. mover cálculo desde `views.py` hacia `calculators.py`;
2. mover agrupación de transacciones hacia `services.py` o `calculators.py`;
3. dejar `views.py` solo como capa request/response;
4. mover `fetch` a `apiService.js`;
5. reducir funciones globales en `window` cuando sea posible.

---

## 19. Tono de la aplicación

Los textos visibles deben ser:

- claros;
- cercanos;
- simples;
- no técnicos;
- en español natural;
- orientados a reducir confusión.

Evitar lenguaje excesivamente corporativo o demasiado complejo.

Ejemplos de tono adecuado:

- “Agrega a las personas que participaron.”
- “Registra quién pagó y quiénes participaron.”
- “Listo, este es el resumen de pagos.”
- “Copia el resumen y compártelo con tu grupo.”

---

## 20. Instrucción base para Codex

Cuando Codex trabaje en este repositorio, debe asumir esta instrucción:

> Lee y respeta `AGENTS.md` antes de modificar el proyecto. Mantén la arquitectura Django + Templates + JavaScript vanilla modular + Tailwind. No reescribas la aplicación ni migres de stack. Protege el flujo participantes → gastos → resultado. Haz cambios pequeños, coherentes y fáciles de revisar. Si una tarea requiere alterar rutas, contratos JSON, estructura de datos o lógica central de cálculo, explica el impacto antes de implementar.

---

## 21. Prioridad de decisiones

Cuando haya dudas, priorizar en este orden:

1. Que el cálculo sea correcto.
2. Que el flujo sea simple para el usuario.
3. Que no se rompa lo existente.
4. Que el código sea mantenible.
5. Que el diseño sea coherente con la identidad actual.
6. Que las nuevas funcionalidades no compliquen innecesariamente la experiencia.

---

## 22. Nota final

Cuentas Claras nació como una solución práctica a un problema cotidiano. El proyecto debe crecer sin perder esa esencia: resolver gastos grupales de manera clara, justa y simple.
