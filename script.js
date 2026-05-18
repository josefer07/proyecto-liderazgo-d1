// Esperar a que cargue el documento
document.addEventListener('DOMContentLoaded', function() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    
    // Botones para cambiar de vista
    document.getElementById('btn-ir-a-registro').addEventListener('click', function() {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    });

    document.getElementById('btn-ir-a-login').addEventListener('click', function() {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    });

    // Simulación de "Base de Datos"
    let usuarios = {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor", pass: "1234" }
    };

    // Registro de nuevo usuario
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        usuarios[u] = { nombre: n, rol: r, pass: p };
        alert("¡Cuenta creada! Ya puedes iniciar sesión.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    });

    // Login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        if (usuarios[u] && usuarios[u].pass === p) {
            document.getElementById('display-name').innerText = `¡Hola, Bienvenido, ${usuarios[u].nombre}!`;
            document.getElementById('display-role').innerText = `Rol: ${usuarios[u].rol}`;
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('dashboard').style.display = 'block';
        } else {
            alert("Usuario o contraseña incorrectos");
        }
    });
});
