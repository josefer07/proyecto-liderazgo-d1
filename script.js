// FUNCIÓN PARA CAMBIAR ENTRE PESTAÑAS
function showTab(view, event) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('view-' + view).style.display = 'block';
    if (event) {
        event.currentTarget.classList.add('active');
    }
}

// Cargar o inicializar usuarios en localStorage (simula archivo aparte)
function cargarUsuarios() {
    let usuarios = localStorage.getItem('usuariosD1');
    if (!usuarios) {
        // Usuario inicial: jefe (Supervisor / Jefe de Tienda)
        const inicial = {
            "jefe": { nombre: "Jefe Principal", rol: "Supervisor / Jefe de Tienda", pass: "1234" }
        };
        localStorage.setItem('usuariosD1', JSON.stringify(inicial));
        return inicial;
    }
    return JSON.parse(usuarios);
}

// Guardar usuarios
function guardarUsuarios(usuarios) {
    localStorage.setItem('usuariosD1', JSON.stringify(usuarios));
}

// Actualizar la lista de usuarios en la vista de gestión (solo para supervisores)
function actualizarListaUsuarios(usuarios, usuarioActual) {
    const listaDiv = document.getElementById('listaUsuarios');
    if (!listaDiv) return;
    let html = '<table class="table table-sm table-bordered"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th></tr></thead><tbody>';
    for (const [user, data] of Object.entries(usuarios)) {
        if (user !== usuarioActual) { // no mostrar al propio jefe en la lista para evitar autocreación
            html += `<tr><td>${user}</td><td>${data.nombre}</td><td>${data.rol}</td></tr>`;
        }
    }
    html += '</tbody></table>';
    listaDiv.innerHTML = html || '<p class="text-muted">No hay otros usuarios creados.</p>';
}

// Construir menú según rol
function construirMenu(rol) {
    const menuContainer = document.getElementById('menu-lateral');
    if (!menuContainer) return;
    
    // Botones base para todos
    let botones = `
        <button class="nav-link active mb-2 text-start d-flex align-items-center" onclick="showTab('home', event)">
            <span class="material-icons me-2">dashboard</span> PANEL
        </button>
        <button class="nav-link mb-2 text-start d-flex align-items-center" onclick="showTab('indicadores', event)">
            <span class="material-icons me-2">analytics</span> INDICADORES
        </button>
        <button class="nav-link mb-2 text-start d-flex align-items-center" onclick="showTab('canal', event)">
            <span class="material-icons me-2">gavel</span> CANAL ÉTICO
        </button>
    `;
    
    // Si es Supervisor / Jefe de Tienda, añadir botón de Gestión
    if (rol === "Supervisor / Jefe de Tienda") {
        botones += `
            <button class="nav-link mb-2 text-start d-flex align-items-center" onclick="showTab('gestion', event)">
                <span class="material-icons me-2">people</span> GESTIÓN DE TRABAJADORES
            </button>
        `;
    }
    
    menuContainer.innerHTML = botones;
    
    // Activar la primera pestaña (home) por defecto
    setTimeout(() => {
        const firstBtn = menuContainer.querySelector('.nav-link');
        if (firstBtn) firstBtn.classList.add('active');
    }, 0);
}

// Inicializar eventos después del login
function initDashboard(usuarioActual, rolActual, nombreActual) {
    // Mostrar nombre y rol
    document.getElementById('display-name').innerText = `¡Bienvenido, ${nombreActual}!`;
    document.getElementById('display-role').innerText = rolActual;
    
    // Construir menú según rol
    construirMenu(rolActual);
    
    // Si es supervisor, cargar la lista de usuarios y configurar el formulario de creación
    if (rolActual === "Supervisor / Jefe de Tienda") {
        const usuarios = cargarUsuarios();
        actualizarListaUsuarios(usuarios, usuarioActual);
        
        const formCrear = document.getElementById('crearUsuarioForm');
        if (formCrear) {
            formCrear.onsubmit = (e) => {
                e.preventDefault();
                const nombre = document.getElementById('newNombre').value.trim();
                const user = document.getElementById('newUser').value.trim();
                const pass = document.getElementById('newPass').value.trim();
                const rol = document.getElementById('newRole').value;
                
                if (!nombre || !user || !pass) {
                    alert("Todos los campos son obligatorios.");
                    return;
                }
                
                let usuarios = cargarUsuarios();
                if (usuarios[user]) {
                    alert("Ese nombre de usuario ya existe. Elija otro.");
                    return;
                }
                
                usuarios[user] = { nombre: nombre, rol: rol, pass: pass };
                guardarUsuarios(usuarios);
                alert(`Usuario ${user} creado exitosamente como ${rol}.`);
                formCrear.reset();
                actualizarListaUsuarios(usuarios, usuarioActual);
            };
        }
    }
}

// LOGIN
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    
    const usuarios = cargarUsuarios();
    
    if (usuarios[u] && usuarios[u].pass === p) {
        const userData = usuarios[u];
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        initDashboard(u, userData.rol, userData.nombre);
    } else {
        alert("Error: Usuario o contraseña incorrectos.");
    }
};
