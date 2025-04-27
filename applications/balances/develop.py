import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


def add_friends(request):
    return render(request, 'develop/add_friends.html')

def add_expense(request):
    return render(request, 'develop/add_expense.html')

def wizard(request):
    return render(request, 'develop/wizard.html')