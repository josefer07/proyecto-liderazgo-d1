document.addEventListener('DOMContentLoaded', function() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');

    // 1. CARGAR USUARIOS EXISTENTES (O crear una lista vacía)
    // Esto recupera los datos guardados en el navegador
    let usuariosGuardados = JSON.parse(localStorage.getItem('usuariosD1')) || {
        "jose": { nombre: "Jose Calderin", rol: "Supervisor / Jefe de Tienda", pass: "1234" }
    };

    // 2. LÓGICA DE NAVEGACIÓN (Botones para cambiar de vista)
    document.getElementById('btn-ir-a-registro').onclick = () => {
        loginSec.style.display = 'none';
        regSec.style.display = 'block';
    };

    document.getElementById('btn-ir-a-login').onclick = () => {
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // 3. LÓGICA DE REGISTRO
    document.getElementById('registerForm').onsubmit = (e) => {
        e.preventDefault();
        const n = document.getElementById('regName').value;
        const u = document.getElementById('regUser').value;
        const p = document.getElementById('regPass').value;
        const r = document.getElementById('regRole').value;

        // Guardar nuevo usuario en el objeto
        usuariosGuardados[u] = { nombre: n, rol: r, pass: p };
        
        // GUARDAR EN LOCALSTORAGE (Persistencia real)
        localStorage.setItem('usuariosD1', JSON.stringify(usuariosGuardados));

        alert("¡Registro exitoso! Ya puedes ingresar con tu usuario.");
        regSec.style.display = 'none';
        loginSec.style.display = 'block';
    };

    // 4. LÓGICA DE LOGIN
    document.getElementById('loginForm').onsubmit = (e) => {
        e.preventDefault();
        const u = document.getElementById('loginUser').value;
        const p = document.getElementById('loginPass').value;

        // Verificar si el usuario existe y la contraseña coincide
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
