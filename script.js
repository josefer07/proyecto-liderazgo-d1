// Función para cambiar de pestaña en el menú principal (Dashboard)
function showTab(view, event) {
    // Ocultar todas las vistas
    const vistas = document.getElementsByClassName('content-view');
    for (let i = 0; i < vistas.length; i++) {
        vistas[i].style.display = 'none';
    }

    // Quitar clase active de los botones
    const links = document.getElementsByClassName('nav-link');
    for (let i = 0; i < links.length; i++) {
        links[i].classList.remove('active');
    }

    // Mostrar la vista actual
    document.getElementById('view-' + view).style.display = 'block';
    
    // Poner el botón como activo
    if (event) {
        event.currentTarget.classList.add('active');
    }
}

// Lógica de autenticación cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    const authCont = document.getElementById('auth-container');
    const dashCont = document.getElementById('dashboard');

    // BOTONES DE CAMBIO (REGISTRO <-> LOGIN)
    document.getElementById('btn-ir-a-registro').onclick = function() {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    };

    document.getElementById('btn-ir-a-login').onclick = function() {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // BASE DE DATOS LOCAL
    let usuarios = JSON.parse(localStorage.getItem('usuariosD1')) || {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor", pass: "1234" }
    };

    // FUNCIÓN REGISTRAR
    document.getElementById('registerForm').onsubmit = function(e) {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        usuarios[u] = { nombre: n, rol: r, pass: p };
        localStorage.setItem('usuariosD1', JSON.stringify(usuarios));

        alert("Usuario creado con éxito. Inicia sesión ahora.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // FUNCIÓN LOGIN
    document.getElementById('loginForm').onsubmit = function(e) {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        if (usuarios[u] && usuarios[u].pass === p) {
            document.getElementById('display-name').innerText = "¡Bienvenido, " + usuarios[u].nombre + "!";
            document.getElementById('display-role').innerText = usuarios[u].rol;
            
            authCont.style.display = 'none';
            dashCont.style.display = 'block';
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    };
});

// Función para el Canal Ético
function enviarDenuncia() {
    const t = document.getElementById('denuncia-texto').value;
    if (t.length < 10) {
        alert("Por favor detalle más su reporte.");
    } else {
        alert("Reporte enviado exitosamente de forma anónima.");
        document.getElementById('denuncia-texto').value = "";
    }
}
