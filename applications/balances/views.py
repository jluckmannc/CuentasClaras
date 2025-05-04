import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def home(request):
    return render(request, 'static_pages/home.html')

def procesar_gasto(gasto, totales_participantes, totales_pagados):
    """
    Procesa un gasto individual, actualizando los totales de participantes y pagadores.
    """
    amount = gasto["expense_amount"]
    payer = gasto["payer"]
    participants = gasto["participants"]

    # Cuánto debe pagar cada participante
    monto_individual = amount / len(participants)

    # Actualizar lo que cada participante debe
    for participante in participants:
        totales_participantes[participante] = totales_participantes.get(participante, 0) + monto_individual

    # Registrar cuánto pagó el pagador
    totales_pagados[payer] = totales_pagados.get(payer, 0) + amount


def calcular_balances_individuales(totales_participantes, totales_pagados):
    """
    Calcula los balances individuales combinando lo que cada persona pagó y lo que debe.
    """
    balances = {}
    personas = set(totales_participantes.keys()).union(set(totales_pagados.keys()))
    for persona in personas:
        debe = totales_participantes.get(persona, 0)
        pago = totales_pagados.get(persona, 0)
        balances[persona] = round(pago - debe)
    return dict(sorted(balances.items(), key=lambda item: item[1]))


def ajustar_balances(balances):
    """
    Ajusta los balances para determinar quién debe pagar a quién.
    """
    deudores = [(persona, abs(balance)) for persona, balance in balances.items() if balance < 0]
    acreedores = [(persona, balance) for persona, balance in balances.items() if balance > 0]

    transacciones = []

    while deudores and acreedores:
        deudor, deuda = deudores.pop(0)
        acreedor, credito = acreedores.pop(0)

        # Determinar cuánto puede pagar
        pago = min(deuda, credito)

        # Registrar la transacción
        transacciones.append(f"{deudor} paga ${pago} a {acreedor}")

        # Actualizar deuda y crédito restantes
        deuda -= pago
        credito -= pago

        # Si el deudor aún debe, volver a añadirlo a la lista
        if deuda > 0:
            deudores.insert(0, (deudor, deuda))

        # Si el acreedor aún tiene crédito, volver a añadirlo a la lista
        if credito > 0:
            acreedores.insert(0, (acreedor, credito))

    return transacciones


def calcular_balances(datos):
    """
    Calcula los balances y las transacciones necesarias para equilibrar los gastos.
    """
    totales_participantes = {}
    totales_pagados = {}

    # Procesar cada gasto
    for gasto in datos["expenses"]:
        procesar_gasto(gasto, totales_participantes, totales_pagados)

    # Calcular balances individuales
    balances = calcular_balances_individuales(totales_participantes, totales_pagados)

    # Ajustar balances para determinar quién debe pagar a quién
    transacciones = ajustar_balances(balances)

    return {
        "balances": balances,
        "transacciones": transacciones
    }

@csrf_exempt
def agrupar_transacciones(transacciones):
    agrupado = {}
    for t in transacciones:
        partes = t.split(" paga $")
        deudor = partes[0]
        monto, acreedor = partes[1].split(" a ")
        monto = int(monto)

        if acreedor not in agrupado:
            agrupado[acreedor] = []

        agrupado[acreedor].append({
            "deudor": deudor,
            "monto": monto
        })
    print()
    print(agrupado)
    print()
    return agrupado

@csrf_exempt
def procesar_gastos(request):
    if request.method == 'POST':
        try:
            # Parsear el cuerpo de la solicitud como JSON
            datos = json.loads(request.body)

            # Llamar a la función de cálculo de balances
            resultado = calcular_balances(datos)

            # Responder con los balances y transacciones al frontend
            return JsonResponse({
                "status": "success",
                "balances": resultado["balances"],
                "resumen": agrupar_transacciones(resultado["transacciones"])
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Datos JSON inválidos"}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)



def wizard(request):
    return render(request, 'balances/wizard.html')

def about(request):
    return render(request, 'static_pages/about.html')