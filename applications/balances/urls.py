from django.urls import path
from .views import home, input_data, procesar_gastos

urlpatterns = [
    path('', home, name=''),
    path('input-data/', input_data, name='input_data'),
    path('procesar-gastos/', procesar_gastos, name='procesar_gastos'),
]