from django.shortcuts import render

def lista_gastos(request):
    return render(request, 'balances/balances.html')
