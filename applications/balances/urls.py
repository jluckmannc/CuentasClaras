from django.urls import path
from .views import home, procesar_gastos, wizard, about

urlpatterns = [
    # Páginas estáticas
    path('', home, name='home'),
    path('organizar-gastos/', wizard, name='wizard'),
    path('acerca-de/', about, name='about'),
    # Llamadas a la API
    path('procesar-gastos/', procesar_gastos, name='procesar_gastos'),
]