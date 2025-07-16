import json
from django.test import TestCase, Client

class ProcesarGastosViewTests(TestCase):
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
