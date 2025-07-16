from .views import calcular_balances

import json
from django.test import TestCase, Client

class CalculoBalancesTests(TestCase):
    """Tests unitarios para la función calcular_balances (sin HTTP)."""

    def test_balance_simple_dos_personas(self):
        """
        Caso 1: Ana paga el almuerzo ($12.000) para ella y Luis. Luis debe pagarle la mitad a Ana.
        """
        datos = {
            "expenses": [
                {
                    "expense_name": "Almuerzo",
                    "expense_amount": 12000,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis"]
                }
            ]
        }
        resultado = calcular_balances(datos)
        self.assertEqual(resultado["balances"], {"Luis": -6000, "Ana": 6000})
        self.assertEqual(resultado["transacciones"], ["Luis paga $6000 a Ana"])

    def test_balance_tres_personas_varios_gastos(self):
        """
        Caso 2: Tres personas, dos gastos. Ana paga la cena ($18.000), Luis paga el taxi ($6.000), todos participan en ambos.
        """
        datos = {
            "expenses": [
                {
                    "expense_name": "Cena",
                    "expense_amount": 18000,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis", "Carlos"]
                },
                {
                    "expense_name": "Taxi",
                    "expense_amount": 6000,
                    "payer": "Luis",
                    "participants": ["Ana", "Luis", "Carlos"]
                }
            ]
        }
        resultado = calcular_balances(datos)
        # Cada uno debe pagar 8000. Ana pagó 18000, Luis 6000, Carlos 0
        # Ana: 18000-8000=10000, Luis: 6000-8000=-2000, Carlos: 0-8000=-8000
        self.assertEqual(resultado["balances"], {"Carlos": -8000, "Luis": -2000, "Ana": 10000})
        self.assertIn("Carlos paga $8000 a Ana", resultado["transacciones"])
        self.assertIn("Luis paga $2000 a Ana", resultado["transacciones"])

    def test_balance_todos_pagan_lo_suyo(self):
        """
        Caso 3: Cada uno paga exactamente lo que le corresponde, nadie debe nada.
        """
        datos = {
            "expenses": [
                {"expense_name": "Desayuno", "expense_amount": 2500, "payer": "Ana", "participants": ["Ana"]},
                {"expense_name": "Almuerzo", "expense_amount": 4000, "payer": "Luis", "participants": ["Luis"]},
                {"expense_name": "Cena", "expense_amount": 6000, "payer": "Carlos", "participants": ["Carlos"]},
            ]
        }
        resultado = calcular_balances(datos)
        self.assertEqual(resultado["balances"], {"Ana": 0, "Luis": 0, "Carlos": 0})
        self.assertEqual(resultado["transacciones"], [])
        
    def test_balance_cuatro_personas_un_gasto(self):
        """
        Caso 4: Un gasto grande compartido entre cuatro personas, paga una sola.
        """
        datos = {
            "expenses": [
                {
                    "expense_name": "Cabaña",
                    "expense_amount": 200000,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis", "Carlos", "Sofía"]
                }
            ]
        }
        resultado = calcular_balances(datos)
        # Cada uno debe 50000. Ana pagó 200000, los demás 0
        self.assertEqual(resultado["balances"], {"Luis": -50000, "Carlos": -50000, "Sofía": -50000, "Ana": 150000})
        self.assertIn("Luis paga $50000 a Ana", resultado["transacciones"])
        self.assertIn("Carlos paga $50000 a Ana", resultado["transacciones"])
        self.assertIn("Sofía paga $50000 a Ana", resultado["transacciones"])
    """Suite de pruebas para la vista `procesar-gastos/`."""

    def setUp(self):
        """Configura el cliente de pruebas y la URL base para todos los tests."""
        self.client = Client()
        self.url = '/procesar-gastos/'

    def test_post_valido(self):
        """
        Verifica que un POST con datos correctamente formados
        retorna un 200 OK y contiene las claves esperadas.
        """
        # Datos de ejemplo: un único gasto con emisor y participantes
        data = {
            "expenses": [
                {
                    "expense_name": "Almuerzo",
                    "expense_amount": 100,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis"]
                }
            ]
        }
        # Envío de la petición con JSON y encabezado adecuado
        response = self.client.post(
            self.url,
            data=json.dumps(data),
            content_type='application/json'
        )

        # Comprueba que la respuesta sea exitosa
        self.assertEqual(response.status_code, 200)
        # Asegura que la respuesta JSON incluya el cálculo de balances y el resumen
        payload = response.json()
        self.assertIn("balances", payload,
                      msg="La respuesta debe incluir la clave 'balances'.")
        self.assertIn("resumen", payload,
                      msg="La respuesta debe incluir la clave 'resumen'.")

    def test_metodo_no_permitido(self):
        """
        Garantiza que sólo se permita el método POST;
        otras peticiones deben devolver 405 Method Not Allowed.
        """
        # Intento con GET → debe rechazar
        response_get = self.client.get(self.url)
        self.assertEqual(response_get.status_code, 405,
                         msg="GET no debe estar permitido en este endpoint.")

        # Intento con PUT → también debe rechazar
        response_put = self.client.put(self.url)
        self.assertEqual(response_put.status_code, 405,
                         msg="PUT no debe estar permitido en este endpoint.")

    def test_json_mal_formado(self):
        """
        Comprueba que el endpoint valide el JSON de entrada
        y devuelva 400 Bad Request si está mal formado.
        """
        # Envío de cadena no JSON
        response = self.client.post(
            self.url,
            data="no es json",
            content_type='application/json'
        )

        # Debe responder con 400 y una clave 'error' indicando la causa
        self.assertEqual(response.status_code, 400,
                         msg="Debe devolver 400 Bad Request ante JSON inválido.")
        self.assertIn("error", response.json(),
                      msg="La respuesta JSON debe incluir una clave 'error'.")
