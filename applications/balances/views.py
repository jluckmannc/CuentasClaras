import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import calcular_balances, agrupar_transacciones


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
            resultado = calcular_balances(datos)

            # Responder con los balances y transacciones al frontend
            print(f"balances: {resultado['balances']}")
            print(f"transacciones: {agrupar_transacciones(resultado['transacciones'])}")
            return JsonResponse({
                "status": "success",
                "balances": resultado["balances"],
                "resumen": agrupar_transacciones(resultado["transacciones"])
            })

        except json.JSONDecodeError:
            return JsonResponse({"error": "Datos JSON inválidos"}, status=400)

    return JsonResponse({"error": "Método no permitido"}, status=405)




def about(request):
    return render(request, 'static_pages/about.html')