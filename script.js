// ======================== MODELO DE DATOS ========================
let datosApp = {
    usuarios: {},
    tiendas: [],
    indicadores: {},
    semaforo: {},
    cronograma: {},
    denuncias: [],
    evaluacionesDesempeno: {},
    planesMejora: {}
};

function cargarDatos() {
    const local = localStorage.getItem('appD1');
    if (local) {
        datosApp = JSON.parse(local);
    } else {
        datosApp.usuarios = { "jefe": { nombre: "Jefe Principal", rol: "supervisor", pass: "1234", tienda: "Central" } };
        datosApp.tiendas = ["Central", "Tienda Norte", "Tienda Sur"];
        datosApp.indicadores = {
            "Central": { taller: 80, auditoria: 85, satisfaccion360: 3.5, denunciasAtendidas: 0, fecha: new Date().toISOString() },
            "Tienda Norte": { taller: 75, auditoria: 90, satisfaccion360: 4.0, denunciasAtendidas: 1, fecha: new Date().toISOString() },
            "Tienda Sur": { taller: 90, auditoria: 88, satisfaccion360: 3.8, denunciasAtendidas: 0, fecha: new Date().toISOString() }
        };
        datosApp.semaforo = { "Central": "amarillo", "Tienda Norte": "verde", "Tienda Sur": "amarillo" };
        datosApp.cronograma = {};
        datosApp.denuncias = [];
        datosApp.evaluacionesDesempeno = {};
        datosApp.planesMejora = {};
        const actividadesBase = [
            "Taller liderazgo ético", "Simulación de casos reales", "Evaluación 360°", "Auditorías sorpresa",
            "Semáforo laboral", "Canal de denuncias", "Rotación de roles", "Plan de mejora",
            "Seguimiento 1", "Seguimiento 2", "Seguimiento 3", "Seguimiento 4"
        ];
        datosApp.tiendas.forEach(tienda => {
            datosApp.cronograma[tienda] = {
                actividades: actividadesBase.map((act, idx) => ({ nombre: act, semana: idx+1, completada: false })),
                cicloActual: 1,
                fechaInicio: new Date().toISOString()
            };
            if (!datosApp.planesMejora[tienda]) datosApp.planesMejora[tienda] = "";
        });
        guardarDatos();
    }
}
function guardarDatos() {
    localStorage.setItem('appD1', JSON.stringify(datosApp));
}

function actualizarSemaforoTienda(tienda) {
    const ind = datosApp.indicadores[tienda];
    if (!ind) return "rojo";
    let puntaje = (ind.taller * 0.2) + (ind.auditoria * 0.3) + (ind.satisfaccion360 * 20) + (ind.denunciasAtendidas * 5);
    if (puntaje >= 85) return "verde";
    if (puntaje >= 60) return "amarillo";
    return "rojo";
}
function recalcularTodosSemaforos() {
    datosApp.tiendas.forEach(t => {
        datosApp.semaforo[t] = actualizarSemaforoTienda(t);
    });
    guardarDatos();
}

let usuarioActual = null;

function construirMenu() {
    const menu = document.getElementById('menu-lateral');
    menu.innerHTML = '';
    const esSupervisor = (usuarioActual.rol === 'supervisor');
    const botones = [
        { id: 'home', icono: 'dashboard', texto: 'PANEL' },
        { id: 'indicadores', icono: 'analytics', texto: 'INDICADORES' },
        { id: 'canal', icono: 'gavel', texto: 'CANAL ÉTICO' }
    ];
    if (esSupervisor) {
        botones.push({ id: 'gestion', icono: 'people', texto: 'GESTIÓN' });
        botones.push({ id: 'auditorias', icono: 'assignment', texto: 'AUDITORÍAS' });
    } else {
        botones.push({ id: 'mi-evaluacion', icono: 'star', texto: 'MI EVALUACIÓN' });
    }
    botones.forEach(b => {
        const btn = document.createElement('button');
        btn.className = 'nav-link mb-2 text-start d-flex align-items-center';
        btn.innerHTML = `<span class="material-icons me-2">${b.icono}</span> ${b.texto}`;
        btn.onclick = (e) => showTab(b.id, e);
        menu.appendChild(btn);
    });
    document.querySelector('#menu-lateral .nav-link')?.classList.add('active');
}

function showTab(view, event) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.getElementById('view-' + view).style.display = 'block';
    if (event) event.currentTarget.classList.add('active');
    if (view === 'home') cargarPanel();
    if (view === 'indicadores') cargarIndicadores();
    if (view === 'canal') cargarCanal();
    if (view === 'gestion') cargarGestion();
    if (view === 'auditorias') cargarAuditorias();
    if (view === 'mi-evaluacion') cargarMiEvaluacion();
}

function cargarPanel() {
    const tienda = (usuarioActual.rol === 'supervisor') ? document.getElementById('selector-tienda').value : usuarioActual.tienda;
    const semaforo = datosApp.semaforo[tienda] || 'rojo';
    const semaforoDiv = document.getElementById('semaforo-dinamico');
    semaforoDiv.innerHTML = `
        <div class="col-4"><div class="p-3 bg-success rounded shadow-sm ${semaforo !== 'verde' ? 'opacity-25' : ''}">ÓPTIMO</div></div>
        <div class="col-4"><div class="p-3 bg-warning text-dark rounded shadow-sm ${semaforo !== 'amarillo' ? 'opacity-25' : ''}">RIESGO</div></div>
        <div class="col-4"><div class="p-3 bg-danger rounded shadow-sm ${semaforo !== 'rojo' ? 'opacity-25' : ''}">CRÍTICO</div></div>
    `;
    const ind = datosApp.indicadores[tienda];
    document.getElementById('kpi-resumen').innerHTML = `
        <p>✅ Taller: ${ind.taller}%</p>
        <p>📋 Auditoría: ${ind.auditoria}%</p>
        <p>⭐ Satisfacción 360: ${ind.satisfaccion360}/5</p>
        <p>📢 Denuncias atendidas: ${ind.denunciasAtendidas}</p>
    `;
    const crono = datosApp.cronograma[tienda];
    const noCompletadas = crono.actividades.filter(a => !a.completada);
    const prox = noCompletadas.slice(0, 3).map(a => `<li>Semana ${a.semana}: ${a.nombre}</li>`).join('');
    document.getElementById('proximas-actividades').innerHTML = prox ? `<ul>${prox}</ul>` : '<p>¡Programa completado!</p>';
}

// Modal dinámico para indicadores
let modalIndicadoresInstance = null;
function crearModalIndicadores() {
    if (document.getElementById('modalEditarIndicadores')) return;
    const modalHTML = `
        <div class="modal fade" id="modalEditarIndicadores" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white"><h5 class="modal-title">Editar indicadores</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <form id="formEditarIndicadores">
                            <div class="mb-2"><label>Cumplimiento taller (%)</label><input type="number" id="ind-taller" class="form-control" step="1"></div>
                            <div class="mb-2"><label>Cumplimiento auditoría (%)</label><input type="number" id="ind-auditoria" class="form-control" step="1"></div>
                            <div class="mb-2"><label>Satisfacción 360 (1-5)</label><input type="number" id="ind-360" class="form-control" step="0.1"></div>
                            <div class="mb-2"><label>Denuncias atendidas (nº)</label><input type="number" id="ind-denuncias" class="form-control" step="1"></div>
                            <button type="submit" class="btn btn-d1 mt-2">Guardar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('formEditarIndicadores').onsubmit = (e) => {
        e.preventDefault();
        const tienda = (usuarioActual.rol === 'supervisor') ? document.getElementById('selector-tienda').value : usuarioActual.tienda;
        const taller = parseInt(document.getElementById('ind-taller').value);
        const auditoria = parseInt(document.getElementById('ind-auditoria').value);
        const satisfaccion360 = parseFloat(document.getElementById('ind-360').value);
        const denunciasAtendidas = parseInt(document.getElementById('ind-denuncias').value);
        if (isNaN(taller) || isNaN(auditoria) || isNaN(satisfaccion360) || isNaN(denunciasAtendidas)) return alert("Valores inválidos");
        datosApp.indicadores[tienda] = { taller, auditoria, satisfaccion360, denunciasAtendidas, fecha: new Date().toISOString() };
        datosApp.semaforo[tienda] = actualizarSemaforoTienda(tienda);
        guardarDatos();
        const modalEl = document.getElementById('modalEditarIndicadores');
        bootstrap.Modal.getInstance(modalEl).hide();
        cargarIndicadores();
        cargarPanel();
    };
}
function cargarIndicadores() {
    const tienda = (usuarioActual.rol === 'supervisor') ? document.getElementById('selector-tienda').value : usuarioActual.tienda;
    const ind = datosApp.indicadores[tienda];
    const tbody = document.querySelector('#tabla-indicadores tbody');
    tbody.innerHTML = `
        <tr><td>Taller liderazgo</td><td>Nivel de conocimiento</td><td>Prueba escrita</td><td>${ind.taller}%</td><td>>90%</td></tr>
        <tr><td>Auditorías</td><td>Cumplimiento normas</td><td>Lista de chequeo</td><td>${ind.auditoria}%</td><td>100%</td></tr>
        <tr><td>Evaluación 360</td><td>Satisfacción equipo</td><td>Encuesta anónima</td><td>${ind.satisfaccion360}/5</td><td>>4.0</td></tr>
        <tr><td>Canal denuncias</td><td>Reportes atendidos</td><td>Registro interno</td><td>${ind.denunciasAtendidas}</td><td>100%</td></tr>
    `;
    const btnEditar = document.getElementById('btn-editar-indicadores');
    if (usuarioActual.rol === 'supervisor') {
        btnEditar.style.display = 'block';
        btnEditar.onclick = () => {
            crearModalIndicadores();
            document.getElementById('ind-taller').value = ind.taller;
            document.getElementById('ind-auditoria').value = ind.auditoria;
            document.getElementById('ind-360').value = ind.satisfaccion360;
            document.getElementById('ind-denuncias').value = ind.denunciasAtendidas;
            new bootstrap.Modal(document.getElementById('modalEditarIndicadores')).show();
        };
    } else {
        btnEditar.style.display = 'none';
    }
}

function cargarCanal() {
    if (usuarioActual.rol === 'supervisor') {
        document.getElementById('gestion-denuncias').style.display = 'block';
        const tbody = document.getElementById('lista-denuncias');
        const tienda = document.getElementById('selector-tienda').value;
        const denunciasFiltradas = datosApp.denuncias.filter(d => d.tienda === tienda);
        tbody.innerHTML = denunciasFiltradas.map(d => `
            <tr><td>${new Date(d.fecha).toLocaleDateString()}</td><td>${d.descripcion.substring(0, 80)}...</td><td>${d.estado}</td>
            <td><button class="btn btn-sm btn-success" onclick="cambiarEstadoDenuncia(${d.id}, 'resuelto')">Resolver</button></td></tr>
        `).join('');
    } else {
        document.getElementById('gestion-denuncias').style.display = 'none';
    }
    document.getElementById('btn-enviar-denuncia').onclick = () => {
        const texto = document.getElementById('denuncia-texto').value.trim();
        if (!texto) return alert("Escribe la denuncia");
        const nuevaDenuncia = {
            id: Date.now(),
            fecha: new Date().toISOString(),
            descripcion: texto,
            estado: "pendiente",
            tienda: usuarioActual.tienda
        };
        datosApp.denuncias.push(nuevaDenuncia);
        guardarDatos();
        alert("Denuncia enviada anónimamente");
        document.getElementById('denuncia-texto').value = '';
        if (usuarioActual.rol === 'supervisor') cargarCanal();
    };
}
window.cambiarEstadoDenuncia = (id, estado) => {
    const den = datosApp.denuncias.find(d => d.id === id);
    if (den) den.estado = estado;
    guardarDatos();
    cargarCanal();
};

function cargarGestion() {
    if (usuarioActual.rol !== 'supervisor') return;
    const selectTienda = document.getElementById('newTienda');
    selectTienda.innerHTML = datosApp.tiendas.map(t => `<option value="${t}">${t}</option>`).join('');
    const divTiendas = document.getElementById('lista-tiendas');
    divTiendas.innerHTML = datosApp.tiendas.map(t => `
        <div class="d-flex justify-content-between align-items-center mb-1">
            <span>${t}</span>
            <div>
                <button class="btn btn-sm btn-outline-primary" onclick="editarTienda('${t}')">Editar</button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarTienda('${t}')">Eliminar</button>
            </div>
        </div>
    `).join('');
    const lista = document.getElementById('listaUsuarios');
    let html = '<table class="table table-sm table-bordered"><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Tienda</th><th>Acciones</th></tr></thead><tbody>';
    for (const [user, data] of Object.entries(datosApp.usuarios)) {
        if (user !== 'jefe') {
            html += `<tr>
                <td>${user}</td>
                <td>${data.nombre}</td>
                <td>${data.rol === 'supervisor' ? 'Supervisor' : 'Trabajador'}</td>
                <td>${data.tienda || 'Sin asignar'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editarUsuarioGlobal('${user}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarUsuarioGlobal('${user}')">Eliminar</button>
                </td>
            </tr>`;
        }
    }
    html += '</tbody></table>';
    lista.innerHTML = html;
    document.getElementById('crearUsuarioForm').onsubmit = (e) => {
        e.preventDefault();
        const nombre = document.getElementById('newNombre').value.trim();
        const user = document.getElementById('newUser').value.trim();
        const pass = document.getElementById('newPass').value.trim();
        const rol = document.getElementById('newRole').value;
        const tienda = document.getElementById('newTienda').value;
        if (!nombre || !user || !pass) return alert("Complete todos los campos");
        if (datosApp.usuarios[user]) return alert("Usuario ya existe");
        datosApp.usuarios[user] = { nombre, rol, pass, tienda };
        guardarDatos();
        alert("Usuario creado");
        document.getElementById('crearUsuarioForm').reset();
        cargarGestion();
    };
    document.getElementById('btn-agregar-tienda').onclick = () => {
        const nueva = document.getElementById('nuevaTiendaNombre').value.trim();
        if (nueva && !datosApp.tiendas.includes(nueva)) {
            datosApp.tiendas.push(nueva);
            datosApp.indicadores[nueva] = { taller: 50, auditoria: 50, satisfaccion360: 2.5, denunciasAtendidas: 0, fecha: new Date().toISOString() };
            datosApp.semaforo[nueva] = "rojo";
            guardarDatos();
            cargarGestion();
        } else alert("Nombre inválido o duplicado");
    };
}
window.editarUsuarioGlobal = (user) => {
    const u = datosApp.usuarios[user];
    const nuevoNombre = prompt("Nuevo nombre", u.nombre);
    const nuevoRol = confirm("¿Cambiar a supervisor?") ? "supervisor" : "trabajador";
    const nuevaTienda = prompt("Tienda", u.tienda);
    if (nuevoNombre) u.nombre = nuevoNombre;
    u.rol = nuevoRol;
    if (nuevaTienda && datosApp.tiendas.includes(nuevaTienda)) u.tienda = nuevaTienda;
    guardarDatos();
    cargarGestion();
};
window.eliminarUsuarioGlobal = (user) => {
    if (confirm("¿Eliminar usuario?")) {
        delete datosApp.usuarios[user];
        guardarDatos();
        cargarGestion();
    }
};

// Modal dinámico para editar tienda
let modalTiendaInstance = null;
function crearModalTienda(tiendaActual, callback) {
    if (document.getElementById('modalEditarTienda')) {
        // Si ya existe, lo reutilizamos
        const modalEl = document.getElementById('modalEditarTienda');
        const input = document.getElementById('editTiendaNombre');
        input.value = tiendaActual;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        return;
    }
    const modalHTML = `
        <div class="modal fade" id="modalEditarTienda" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header"><h5>Editar tienda</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div>
                    <div class="modal-body">
                        <input type="text" id="editTiendaNombre" class="form-control" value="${tiendaActual}">
                        <button id="guardarEditTienda" class="btn btn-d1 mt-2">Guardar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.getElementById('guardarEditTienda').onclick = () => {
        const nuevo = document.getElementById('editTiendaNombre').value.trim();
        if (nuevo && nuevo !== tiendaActual) {
            callback(nuevo);
        }
        const modalEl = document.getElementById('modalEditarTienda');
        bootstrap.Modal.getInstance(modalEl).hide();
        modalEl.remove();
    };
    const modal = new bootstrap.Modal(document.getElementById('modalEditarTienda'));
    modal.show();
}
window.editarTienda = (tienda) => {
    crearModalTienda(tienda, (nuevoNombre) => {
        const idx = datosApp.tiendas.indexOf(tienda);
        if (idx !== -1) datosApp.tiendas[idx] = nuevoNombre;
        for (let u in datosApp.usuarios) {
            if (datosApp.usuarios[u].tienda === tienda) datosApp.usuarios[u].tienda = nuevoNombre;
        }
        datosApp.indicadores[nuevoNombre] = datosApp.indicadores[tienda];
        delete datosApp.indicadores[tienda];
        datosApp.semaforo[nuevoNombre] = datosApp.semaforo[tienda];
        delete datosApp.semaforo[tienda];
        guardarDatos();
        cargarGestion();
        // Actualizar selector de tienda si está visible
        const selTienda = document.getElementById('selector-tienda');
        if (selTienda) {
            const current = selTienda.value;
            selTienda.innerHTML = datosApp.tiendas.map(t => `<option value="${t}">${t}</option>`).join('');
            if (current === tienda) selTienda.value = nuevoNombre;
        }
    });
};
window.eliminarTienda = (tienda) => {
    if (confirm(`Eliminar tienda ${tienda}?`)) {
        datosApp.tiendas = datosApp.tiendas.filter(t => t !== tienda);
        guardarDatos();
        cargarGestion();
        const selTienda = document.getElementById('selector-tienda');
        if (selTienda && selTienda.value === tienda) selTienda.value = datosApp.tiendas[0];
    }
};

function cargarAuditorias() {
    if (usuarioActual.rol !== 'supervisor') return;
    const tienda = document.getElementById('selector-tienda').value;
    const checklist = document.getElementById('checklist-items');
    checklist.innerHTML = `
        <div class="form-check"><input class="form-check-input" type="checkbox" id="chk1"> Cumplimiento horarios</div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="chk2"> Respeto entre compañeros</div>
        <div class="form-check"><input class="form-check-input" type="checkbox" id="chk3"> Condiciones de seguridad</div>
    `;
    document.getElementById('btn-guardar-auditoria').onclick = () => {
        let cumplimiento = 0;
        if (document.getElementById('chk1').checked) cumplimiento += 33;
        if (document.getElementById('chk2').checked) cumplimiento += 33;
        if (document.getElementById('chk3').checked) cumplimiento += 34;
        datosApp.indicadores[tienda].auditoria = cumplimiento;
        datosApp.semaforo[tienda] = actualizarSemaforoTienda(tienda);
        guardarDatos();
        alert("Auditoría guardada");
        cargarIndicadores();
        cargarPanel();
    };
    const crono = datosApp.cronograma[tienda];
    const tablaCrono = document.getElementById('tabla-cronograma');
    tablaCrono.innerHTML = crono.actividades.map((act, idx) => `
        <tr>
            <td>${act.semana}</td>
            <td>${act.nombre}</td>
            <td><input type="checkbox" ${act.completada ? 'checked' : ''} onchange="toggleActividad('${tienda}', ${idx})"></td>
        </tr>
    `).join('');
    document.getElementById('btn-reiniciar-cronograma').onclick = () => {
        if (confirm("Reiniciar programa? Se marcarán todas como no completadas")) {
            crono.actividades.forEach(a => a.completada = false);
            crono.cicloActual++;
            crono.fechaInicio = new Date().toISOString();
            guardarDatos();
            cargarAuditorias();
        }
    };
    document.getElementById('plan-mejora-texto').value = datosApp.planesMejora[tienda] || "";
    document.getElementById('btn-guardar-plan').onclick = () => {
        datosApp.planesMejora[tienda] = document.getElementById('plan-mejora-texto').value;
        guardarDatos();
        alert("Plan guardado");
    };
}
window.toggleActividad = (tienda, idx) => {
    datosApp.cronograma[tienda].actividades[idx].completada = !datosApp.cronograma[tienda].actividades[idx].completada;
    guardarDatos();
    cargarAuditorias();
};

function cargarMiEvaluacion() {
    const evalUser = datosApp.evaluacionesDesempeno[usuarioActual.user];
    if (evalUser) {
        document.getElementById('evaluacion-trabajador-contenido').innerHTML = `
            <p><strong>Calificación:</strong> ${evalUser.calificacion}/5</p>
            <p><strong>Comentarios:</strong> ${evalUser.comentarios}</p>
            <p><strong>Fecha:</strong> ${new Date(evalUser.fecha).toLocaleDateString()}</p>
        `;
    } else {
        document.getElementById('evaluacion-trabajador-contenido').innerHTML = '<p>Aún no hay evaluación de desempeño.</p>';
    }
}

// LOGIN
document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;
    cargarDatos();
    if (datosApp.usuarios[user] && datosApp.usuarios[user].pass === pass) {
        usuarioActual = { ...datosApp.usuarios[user], user };
        document.getElementById('display-name').innerText = `¡Bienvenido, ${usuarioActual.nombre}!`;
        document.getElementById('display-role').innerText = usuarioActual.rol === 'supervisor' ? 'Supervisor / Jefe de Tienda' : 'Trabajador Operativo';
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        if (usuarioActual.rol === 'supervisor') {
            const selDiv = document.getElementById('selector-tienda-container');
            selDiv.style.display = 'block';
            const selTienda = document.getElementById('selector-tienda');
            selTienda.innerHTML = datosApp.tiendas.map(t => `<option value="${t}">${t}</option>`).join('');
            selTienda.value = usuarioActual.tienda || datosApp.tiendas[0];
            selTienda.onchange = () => {
                const vistaActiva = document.querySelector('.content-view[style="display: block;"]')?.id;
                if (vistaActiva === 'view-home') cargarPanel();
                if (vistaActiva === 'view-indicadores') cargarIndicadores();
                if (vistaActiva === 'view-canal') cargarCanal();
                if (vistaActiva === 'view-auditorias') cargarAuditorias();
            };
        }
        construirMenu();
        showTab('home', null);
    } else {
        alert("Usuario o contraseña incorrectos");
    }
};

cargarDatos();
