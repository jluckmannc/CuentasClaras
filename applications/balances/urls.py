from django.urls import path
from .views import home, procesar_gastos, wizard, about

urlpatterns = [
    path('', home, name='home'),
    path('procesar-gastos/', procesar_gastos, name='procesar_gastos'),
    # Develop
    path('organizar-gastos/', wizard, name='wizard'),
    path('acerca-de/', about, name='about'),
]