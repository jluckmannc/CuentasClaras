from django.urls import path
from .views import home, input_data, procesar_gastos
from .develop import add_friends, add_expense

urlpatterns = [
    path('', home, name='home'),
    path('input-data/', input_data, name='input_data'),
    path('procesar-gastos/', procesar_gastos, name='procesar_gastos'),
    # Develop
    path('add_friends/', add_friends, name='add_friends'),
    path('add_expense/', add_expense, name='add_expense'),
]