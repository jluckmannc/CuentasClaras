from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def home(request):
    return render(request, 'balances/home.html')

def input_data(request):
    return render(request, 'balances/input_data.html')

@csrf_exempt  # Solo para pruebas. Usa {% csrf_token %} en producción.
def procesar_gastos(request):
    if request.method == 'POST':
        # Obtén los datos enviados
        friends = request.POST.getlist('friends[]')
        expense_names = request.POST.getlist('expense_name[]')
        expense_amounts = request.POST.getlist('expense_amount[]')
        payers = request.POST.getlist('payer[]')
        participants = request.POST.getlist('participants[]')
        datos = dict(request.POST)
        # Muestra los datos en la consola
        print()
        print()
        print("Amigos:", friends)
        print("Nombres de gastos:", expense_names)
        print("Montos:", expense_amounts)
        print("Pagadores:", payers)
        print("Participantes:", participants)
        print()
        print()

        return JsonResponse({'status': 'Datos recibidos', 'data': datos})

    return JsonResponse({'error': 'Método no permitido'}, status=405)