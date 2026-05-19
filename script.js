// FUNCIÓN PARA CAMBIAR ENTRE PESTAÑAS
function showTab(view, event) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('view-' + view).style.display = 'block';
    if (event) {
        event.currentTarget.classList.add('active');
    }
}

// Cargar o inicializar usuarios en localStorage
function cargarUsuarios() {
    let usuarios = localStorage.getItem('usuariosD1');
    let usuariosObj = usuarios ? JSON.parse(usuarios) : {};
    
    if (!usuariosObj["jefe"]) {
        usuariosObj["jefe"] = { nombre: "Jefe Principal", rol: "Supervisor / Jefe de Tienda", pass: "1234" };
        localStorage.setItem('usuariosD1', JSON.stringify(usuariosObj));
    } else {
        if (usuariosObj["jefe"].pass !== "1234") {
            usuariosObj["jefe"].pass = "1234";
            localStorage.setItem('usuariosD1', JSON.stringify(usuariosObj));
        }
    }
    return JSON.parse(localStorage.getItem('usuariosD1'));
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuariosD1', JSON.stringify(usuarios));
}

// Actualizar la lista de usuarios
function actualizarListaUsuarios(usuarios, usuarioActual) {
    const listaDiv = document.getElementById('listaUsuarios');
    if (!listaDiv) return;
    let html = '<table class="table table-sm table-bordered"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>';
    for (const [user, data] of Object.entries(usuarios)) {
        // No mostrar al usuario actual ni al usuario "jefe" (protegido)
        if (user !== usuarioActual && user !== "jefe") {
            html += `
                <tr>
                    <td>${user}</td>
                    <td>${data.nombre}</td>
                    <td>${data.rol}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editarUsuario('${user}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario('${user}')">Eliminar</button>
                    </td>
                </tr>
            `;
        }
    }
    html += '</tbody><table>';
    listaDiv.innerHTML = html || '<p class="text-muted">No hay otros usuarios creados.</p>';
}

// Función global para editar usuario (solo si no es "jefe")
window.editarUsuario = function(username) {
    if (username === "jefe") {
        alert("El usuario principal no puede ser editado.");
        return;
    }
    const usuarios = cargarUsuarios();
    const userData = usuarios[username];
    if (!userData) return;
    
    document.getElementById('editUsername').value = username;
    document.getElementById('editNombre').value = userData.nombre;
    document.getElementById('editRol').value = userData.rol;
    document.getElementById('editPass').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('editarUsuarioModal'));
    modal.show();
}

// Función global para eliminar usuario (protege al "jefe")
window.eliminarUsuario = function(username) {
    if (username === "jefe") {
        alert("El usuario principal no puede ser eliminado.");
        return;
    }
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${username}"? Esta acción no se puede deshacer.`)) {
        let usuarios = cargarUsuarios();
        if (usuarios[username]) {
            delete usuarios[username];
            guardarUsuarios(usuarios);
            const usuarioActual = window.usuarioActualLogueado;
            actualizarListaUsuarios(usuarios, usuarioActual);
            alert(`Usuario ${username} eliminado correctamente.`);
        } else {
            alert("El usuario ya no existe.");
        }
    }
}

// Construir menú según rol
function construirMenu(rol) {
    const menuContainer = document.getElementById('menu-lateral');
    if (!menuContainer) return;
    
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
    
    if (rol === "Supervisor / Jefe de Tienda") {
        botones += `
            <button class="nav-link mb-2 text-start d-flex align-items-center" onclick="showTab('gestion', event)">
                <span class="material-icons me-2">people</span> GESTIÓN DE TRABAJADORES
            </button>
        `;
    }
    
    menuContainer.innerHTML = botones;
    
    setTimeout(() => {
        const firstBtn = menuContainer.querySelector('.nav-link');
        if (firstBtn) firstBtn.classList.add('active');
    }, 0);
}

// Inicializar dashboard
function initDashboard(usuarioActual, rolActual, nombreActual) {
    window.usuarioActualLogueado = usuarioActual;
    document.getElementById('display-name').innerText = `¡Bienvenido, ${nombreActual}!`;
    document.getElementById('display-role').innerText = rolActual;
    construirMenu(rolActual);
    
    if (rolActual === "Supervisor / Jefe de Tienda") {
        const usuarios = cargarUsuarios();
        actualizarListaUsuarios(usuarios, usuarioActual);
        
        // Formulario de creación de usuario (con validación duplicados insensible a mayúsculas)
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
                // Comparación insensible a mayúsculas
                const existe = Object.keys(usuarios).some(u => u.toLowerCase() === user.toLowerCase());
                if (existe) {
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
        
        // Formulario de edición (modal)
        const editarForm = document.getElementById('editarUsuarioForm');
        if (editarForm) {
            // Remover eventos anteriores para evitar duplicados
            const newForm = editarForm.cloneNode(true);
            editarForm.parentNode.replaceChild(newForm, editarForm);
            newForm.onsubmit = (e) => {
                e.preventDefault();
                const username = document.getElementById('editUsername').value;
                if (username === "jefe") {
                    alert("No se puede editar al usuario principal.");
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
                    modal.hide();
                    return;
                }
                const nuevoNombre = document.getElementById('editNombre').value.trim();
                const nuevoRol = document.getElementById('editRol').value;
                const nuevaPass = document.getElementById('editPass').value;
                
                if (!nuevoNombre) {
                    alert("El nombre no puede estar vacío.");
                    return;
                }
                
                let usuarios = cargarUsuarios();
                if (!usuarios[username]) {
                    alert("El usuario ya no existe.");
                    return;
                }
                
                usuarios[username].nombre = nuevoNombre;
                usuarios[username].rol = nuevoRol;
                if (nuevaPass.trim() !== "") {
                    usuarios[username].pass = nuevaPass.trim();
                }
                
                guardarUsuarios(usuarios);
                alert(`Usuario ${username} actualizado correctamente.`);
                const modal = bootstrap.Modal.getInstance(document.getElementById('editarUsuarioModal'));
                modal.hide();
                actualizarListaUsuarios(usuarios, window.usuarioActualLogueado);
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
