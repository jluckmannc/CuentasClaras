import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import calcular_balances, agrupar_transacciones_por_acreedor


def home(request):
    return render(request, 'static_pages/home.html')

def wizard(request):
    return render(request, 'balances/wizard.html')


def validar_payload_gastos(datos):
    expenses = datos.get("expenses")
    if not isinstance(expenses, list) or not expenses:
        return "Debes enviar una lista de gastos válida."

    for gasto in expenses:
        amount = gasto.get("expense_amount")
        if isinstance(amount, bool) or not isinstance(amount, int) or amount <= 0:
            return "Cada gasto debe tener un monto entero mayor a 0."

    return None


@csrf_exempt
def procesar_gastos(request):
    if request.method == 'POST':
        try:
            # Parsear el cuerpo de la solicitud como JSON
            datos = json.loads(request.body)

            error_validacion = validar_payload_gastos(datos)
            if error_validacion:
                return JsonResponse({"error": error_validacion}, status=400)

            # Llamar a la función de cálculo de balances
            balances, transacciones = calcular_balances(datos)

            # Responder con los balances y transacciones al frontend
            return JsonResponse({
                "status": "success",
                "balances": balances,
                "resumen": agrupar_transacciones_por_acreedor(transacciones)
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Datos JSON inválidos"}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)




def about(request):
    return render(request, 'static_pages/about.html')
