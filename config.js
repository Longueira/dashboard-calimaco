// ===== CONFIGURACIÓN DEL DASHBOARD =====
window.PD = {
  // Pega aquí el bloque firebaseConfig de tu proyecto NUEVO (Configuración del proyecto > Tus apps > Web)
  firebase: {
    apiKey: "AIzaSyDQ2PSxq3j5z00lQaYkpId2oXqY8Qmm8IQ",
    authDomain: "dashboard-calimaco.firebaseapp.com",
    databaseURL: "https://dashboard-calimaco-default-rtdb.firebaseio.com",
    projectId: "dashboard-calimaco",
    appId: "1:46370589998:web:f6c55591ff28a94fa2bebf"
  },
  // Pestaña HORARIO publicada como CSV
  scheduleCsv: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRUwutHLZTDcI_Y4YbK2u5zXKRiogKZavzb-FXYl7gnF6bMqOY2ywICJc8m9UC0QRNboLS382zPveu/pub?gid=1657845014&single=true&output=csv",
  activeMinutes: 20   // sin actividad en este tiempo = "Inactivo"
};
