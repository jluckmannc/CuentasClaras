import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import calcular_balances, agrupar_transacciones_por_acreedor


def home(request):
    return render(request, 'static_pages/home.html')

def wizard(request):
    return render(request, 'balances/wizard.html')


@csrf_exempt
def procesar_gastos(request):
    if request.method == 'POST':
        try:
            # Parsear el cuerpo de la solicitud como JSON
            datos = json.loads(request.body)

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