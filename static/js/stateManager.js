export const participantsList = [];
export const gastosList = [];

// ✅ Datos de prueba si estás en #paso2
if (window.location.hash === '#paso2') {
  participantsList.push(
    { id: 1, nombre: "Camila" },
    { id: 2, nombre: "Esteban" },
    { id: 3, nombre: "Rocío" },
    { id: 4, nombre: "Damián" },
    { id: 5, nombre: "Martina" },
    { id: 6, nombre: "Lucas" },
    { id: 7, nombre: "Bastián" },
    { id: 8, nombre: "Paula" },
    { id: 9, nombre: "Tomás" },
    { id: 10, nombre: "Ignacia" },
    { id: 11, nombre: "Felipe" }
  );

  gastosList.push(
    {
      expense_name: "Desayuno en cafetería",
      expense_amount: 8420,
      payer: "Camila",
      participants: ["Camila", "Esteban", "Rocío"]
    },
    {
      expense_name: "Arriendo de cabaña",
      expense_amount: 48450,
      payer: "Lucas",
      participants: ["Martina", "Lucas", "Bastián", "Paula"]
    },
    {
      expense_name: "Tour guiado",
      expense_amount: 19800,
      payer: "Tomás",
      participants: ["Tomás", "Ignacia", "Felipe", "Rocío", "Damián"]
    }
  );
}
