document.addEventListener('DOMContentLoaded', function() {
    // Referencias a secciones de autenticación
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');

    // 1. GESTIÓN DE USUARIOS (Persistencia con LocalStorage)
    // Intenta cargar la lista de usuarios guardada; si no hay, crea una inicial.
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuariosD1')) || {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor / Jefe de Tienda", pass: "1234" }
    };

    // 2. NAVEGACIÓN ENTRE LOGIN Y REGISTRO
    document.getElementById('btn-ir-a-registro').addEventListener('click', function() {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    });

    document.getElementById('btn-ir-a-login').addEventListener('click', function() {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    });

    // 3. LÓGICA DE REGISTRO
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        // Guardar nuevo usuario
        usuariosGuardados[u] = { nombre: n, rol: r, pass: p };
        
        // Guardar permanentemente en el navegador
        localStorage.setItem('usuariosD1', JSON.stringify(usuariosGuardados));

        alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
        document.getElementById('registerForm').reset();
    });

    // 4. LÓGICA DE LOGIN
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        // Validar credenciales
        if (usuariosGuardados[u] && usuariosGuardados[u].pass === p) {
            // Personalizar Dashboard
            document.getElementById('display-name').innerText = `¡Bienvenido, ${usuariosGuardados[u].nombre}!`;
            document.getElementById('display-role').innerText = usuariosGuardados[u].rol;
            
            // Cambiar de pantalla
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        } else {
            alert("Error: Usuario o contraseña incorrectos.");
        }
    });
});

// 5. NAVEGACIÓN DEL MENÚ PRINCIPAL (ShowTab)
function showTab(view, event) {
    // Ocultar todas las vistas de contenido
    document.querySelectorAll('.content-view').forEach(v => {
        v.style.display = 'none';
    });

    // Quitar estado activo de los botones del menú
    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
    });

    // Mostrar la vista elegida
    const targetView = document.getElementById('view-' + view);
    if (targetView) {
        targetView.style.display = 'block';
    }
    
    // Marcar el botón como activo
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
}

// 6. LÓGICA DEL CANAL ÉTICO
function enviarDenuncia() {
    const texto = document.getElementById('denuncia-texto').value;
    
    if(texto.trim().length < 15) {
        alert("Por favor, describa los hechos con más detalle para procesar su reporte.");
        return;
    }

    alert("Su reporte ha sido enviado de forma anónima al Comité de Bienestar. Gracias por ayudarnos a mejorar.");
    
    // Limpiar y volver al inicio
    document.getElementById('denuncia-texto').value = "";
    showTab('home'); 
    
    // Resetear visualmente el botón del menú
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('button[onclick*="home"]').classList.add('active');
}
