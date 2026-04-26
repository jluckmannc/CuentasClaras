import json
from django.test import TestCase, Client
import unittest
from .views import calcular_balances

class ProcesarGastosViewTests(TestCase):
    """Suite de pruebas para la vista `procesar-gastos/`."""

    def setUp(self):
        self.client = Client()
        self.url = '/procesar-gastos/'

    def test_post_valido(self):
        data = {
            "expenses": [
                {
                    "expense_name": "Almuerzo",
                    "expense_amount": 12000,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis"]
                }
            ]
        }
        response = self.client.post(self.url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertIn("balances", payload)
        self.assertIsInstance(payload["balances"], dict)
        self.assertIn("resumen", payload)
        self.assertIsInstance(payload["resumen"], dict)
        # Chequea formato de transacción
        for acreedor, pagos in payload["resumen"].items():
            for pago in pagos:
                self.assertIn("deudor", pago)
                self.assertIn("monto", pago)
                self.assertIsInstance(pago["monto"], int)

    def test_metodo_no_permitido(self):
        response_get = self.client.get(self.url)
        self.assertEqual(response_get.status_code, 405)
        response_put = self.client.put(self.url)
        self.assertEqual(response_put.status_code, 405)

    def test_json_mal_formado(self):
        response = self.client.post(self.url, data="no es json", content_type='application/json')
        self.assertEqual(response.status_code, 400)
        resp = response.json()
        self.assertIn("error", resp)
        # Mensaje concreto
        self.assertIn("inválido", resp["error"].lower())

    def test_rechaza_monto_negativo(self):
        data = {
            "expenses": [
                {
                    "expense_name": "Cena",
                    "expense_amount": -5000,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis"]
                }
            ]
        }
        response = self.client.post(self.url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("monto entero mayor a 0", response.json()["error"].lower())

    def test_rechaza_monto_decimal(self):
        data = {
            "expenses": [
                {
                    "expense_name": "Cena",
                    "expense_amount": 5000.5,
                    "payer": "Ana",
                    "participants": ["Ana", "Luis"]
                }
            ]
        }
        response = self.client.post(self.url, data=json.dumps(data), content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("monto entero mayor a 0", response.json()["error"].lower())


class CalcularBalancesUnitTests(unittest.TestCase):
    """Tests unitarios para la función calcular_balances (sin HTTP)."""

    def test_varios_escenarios(self):
        cases = [
            # Caso 1: Ana paga el almuerzo ($12.000) para ella y Luis. Luis debe pagarle la mitad a Ana.
            (
                {"expenses": [
                    {"expense_name": "Almuerzo", "expense_amount": 12000, "payer": "Ana", "participants": ["Ana", "Luis"]}
                ]},
                {"balances": {"Luis": -6000, "Ana": 6000}, "transacciones": ["Luis paga $6000 a Ana"]}
            ),
            # Caso 2: Tres personas, dos gastos. Ana paga la cena ($18.000), Luis paga el taxi ($6.000), todos participan en ambos.
            (
                {"expenses": [
                    {"expense_name": "Cena", "expense_amount": 18000, "payer": "Ana", "participants": ["Ana", "Luis", "Carlos"]},
                    {"expense_name": "Taxi", "expense_amount": 6000, "payer": "Luis", "participants": ["Ana", "Luis", "Carlos"]}
                ]},
                {"balances": {"Carlos": -8000, "Luis": -2000, "Ana": 10000}, "transacciones": ["Carlos paga $8000 a Ana", "Luis paga $2000 a Ana"]}
            ),
            # Caso 3: Cada uno paga exactamente lo que le corresponde, nadie debe nada.
            (
                {"expenses": [
                    {"expense_name": "Desayuno", "expense_amount": 2500, "payer": "Ana", "participants": ["Ana"]},
                    {"expense_name": "Almuerzo", "expense_amount": 4000, "payer": "Luis", "participants": ["Luis"]},
                    {"expense_name": "Cena", "expense_amount": 6000, "payer": "Carlos", "participants": ["Carlos"]}
                ]},
                {
                    "balances": {"Ana": 0, "Luis": 0, "Carlos": 0}, "transacciones": []}
            ),
            # Caso 4: Un gasto grande compartido entre cuatro personas, paga una sola.
            (
                {"expenses": [
                    {"expense_name": "Cabaña", "expense_amount": 200000, "payer": "Ana", "participants": ["Ana", "Luis", "Carlos", "Sofía"]}
                ]},
                {
                "balances": {"Luis": -50000, "Carlos": -50000, "Sofía": -50000, "Ana": 150000}, 
                "transacciones": ["Luis paga $50000 a Ana", "Carlos paga $50000 a Ana", "Sofía paga $50000 a Ana"]
                }
            ),
            # Caso 5: Ejemplo Doggis, Fantasilandia, Locomoción, Hospedaje
            (
                {"expenses": [
                    {"expense_name": "Doggis", "expense_amount": 65520, "payer": "Alberto", "participants": ["Pedro", "Ignacia", "Alberto", "Ángel"]},
                    {"expense_name": "Fantasilandia", "expense_amount": 124970, "payer": "Ángel", "participants": ["Pedro", "Tamara", "Joaquín", "Alberto", "Isidora", "Ángel"]},
                    {"expense_name": "Locomoción", "expense_amount": 36420, "payer": "Isidora", "participants": ["Pedro", "Joaquín", "Isidora", "Ángel"]},
                    {"expense_name": "Hospedaje", "expense_amount": 96400, "payer": "Tamara", "participants": ["Pedro", "Tamara", "Ignacia", "Joaquín", "Alberto", "Isidora", "Ángel"]}
                ]},
                {
                "balances": {'Pedro': -60085, 'Joaquín': -43705, 'Ignacia': -30151, 'Isidora': -7285, 'Alberto': 14540, 'Tamara': 61800, 'Ángel': 64885}, 
                 "transacciones": ['Pedro paga $14540 a Alberto', 'Pedro paga $45545 a Tamara', 'Joaquín paga $16255 a Tamara', 'Joaquín paga $27450 a Ángel', 'Ignacia paga $30151 a Ángel', 'Isidora paga $7284 a Ángel']
                }
            ),
        ]
        for datos, esperado in cases:
            with self.subTest(datos=datos):
                balances, transacciones = calcular_balances(datos)
                self.assertEqual(balances, esperado["balances"])
                for t in esperado["transacciones"]:
                    self.assertIn(t, transacciones)
                self.assertEqual(len(transacciones), len(esperado["transacciones"]))

