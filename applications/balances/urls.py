from django.urls import path
from .views import lista_gastos

urlpatterns = [
    path('lista_gastos', lista_gastos)
]