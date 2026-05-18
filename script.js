// Función para cambiar de pestaña en el menú principal
function showTab(view) {
    // 1. Ocultar todas las vistas
    document.querySelectorAll('.content-view').forEach(v => {
        v.style.display = 'none';
    });

    // 2. Quitar la clase 'active' de todos los botones
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
    });

    // 3. Mostrar la vista seleccionada y activar su botón
    document.getElementById('view-' + view).style.display = 'block';
    
    // El evento 'currentTarget' ayuda a saber cuál botón se presionó
    if(event) {
        event.currentTarget.classList.add('active');
    }
}

// Función para el Canal Ético
function enviarDenuncia() {
    const texto = document.getElementById('denuncia-texto').value;
    if(texto.length < 10) {
        alert("Por favor, describa la situación con más detalle.");
        return;
    }
    alert("Reporte enviado exitosamente. Gracias por confiar en el Canal Ético de Tiendas D1[cite: 57].");
    document.getElementById('denuncia-texto').value = "";
    showTab('home'); // Volver al panel principal
}
