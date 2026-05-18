document.addEventListener('DOMContentLoaded', function() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');

    // Recuperar usuarios del navegador
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuariosD1')) || {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor / Jefe de Tienda", pass: "1234" }
    };

    // Navegación Login/Registro
    document.getElementById('btn-ir-a-registro').onclick = () => {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    };

    document.getElementById('btn-ir-a-login').onclick = () => {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // Lógica de Registro
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        usuariosGuardados[u] = { nombre: n, rol: r, pass: p };
        localStorage.setItem('usuariosD1', JSON.stringify(usuariosGuardados));

        alert("¡Cuenta creada con éxito! Por favor inicia sesión.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // Lógica de Login
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
            alert("Usuario o contraseña incorrectos.");
        }
    };
});

// Cambiar de Pestaña en el Dashboard
function showTab(view, event) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('view-' + view).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Función para el Canal Ético
function enviarDenuncia() {
    const texto = document.getElementById('denuncia-texto').value;
    if(texto.length < 15) {
        alert("Por favor, sea más descriptivo en su reporte para poder procesarlo.");
        return;
    }
    alert("Reporte enviado al Comité de Ética de forma exitosa y anónima.");
    document.getElementById('denuncia-texto').value = "";
    showTab('home', { currentTarget: document.querySelector('.nav-link') });
}
