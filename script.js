// Función para cambiar entre Login y Registro
function toggleAuth() {
    const loginSec = document.getElementById('login-section');
    const regSec = document.getElementById('register-section');
    
    if (loginSec.style.display === "none") {
        loginSec.style.display = "block";
        regSec.style.display = "none";
    } else {
        loginSec.style.display = "none";
        regSec.style.display = "block";
    }
}

// Simulación de Base de Datos para el Prototipo
let usuarios = {
    "jose": { nombre: "Jose Calderin", rol: "Supervisor / Jefe de Tienda" }
};

// Lógica de Registro
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const nombre = document.getElementById('regName').value;
    const user = document.getElementById('regUser').value;
    const rol = document.getElementById('regRole').value;
    
    usuarios[user] = { nombre: nombre, rol: rol };
    alert("¡Usuario creado con éxito! Ahora inicia sesión.");
    toggleAuth();
});

// Lógica de Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    
    if (usuarios[user]) {
        document.getElementById('display-name').innerText = `¡Hola, Bienvenido, ${usuarios[user].nombre}!`;
        document.getElementById('display-role').innerText = usuarios[user].rol;
        
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    } else {
        alert("Usuario no encontrado. Por favor, regístrate primero.");
    }
});

// Navegación del Dashboard
function showTab(view) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('view-' + view).style.display = 'block';
    event.currentTarget.classList.add('active');
}
