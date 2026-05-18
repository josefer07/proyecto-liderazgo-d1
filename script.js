// NUEVA FUNCIÓN PARA EL MENÚ
function showTab(view, event) {
    // Ocultar todas las vistas
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    // Quitar clase active
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Mostrar seleccionada
    document.getElementById('view-' + view).style.display = 'block';
    // Activar botón
    event.currentTarget.classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');

    // 1. CARGAR USUARIOS EXISTENTES (TU CÓDIGO ORIGINAL)
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuariosD1')) || {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor / Jefe de Tienda", pass: "1234" }
    };

    // 2. LÓGICA DE NAVEGACIÓN (TU CÓDIGO ORIGINAL)
    document.getElementById('btn-ir-a-registro').onclick = () => {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    };

    document.getElementById('btn-ir-a-login').onclick = () => {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // 3. LÓGICA DE REGISTRO (TU CÓDIGO ORIGINAL)
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        usuariosGuardados[u] = { nombre: n, rol: r, pass: p };
        localStorage.setItem('usuariosD1', JSON.stringify(usuariosGuardados));

        alert("¡Registro exitoso! Ya puedes ingresar con tu usuario.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // 4. LÓGICA DE LOGIN (TU CÓDIGO ORIGINAL)
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        if (usuariosGuardados[u] && usuariosGuardados[u].pass === p) {
            document.getElementById('display-name').innerText = `¡Bienvenido, ${usuariosGuardados[u].nombre}!`;
            document.getElementById('display-role').innerText = usuariosGuardados[u].rol;
            
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        } else {
            alert("Error: Usuario o contraseña incorrectos.");
        }
    };
});
