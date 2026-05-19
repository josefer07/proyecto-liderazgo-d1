// ======================== MODELO DE DATOS ========================
let datosApp = {
    usuarios: {},
    tiendas: [],
    indicadores: {},
    semaforo: {},
    cronograma: {},
    denuncias: [],
    evaluacionesDesempeno: {},   // estructura: { "usuario_trabajador": [ {actividad, nota, comentario, fecha, evaluador} ] }
    planesMejora: {},
    actividadesEvaluacion: []    // lista de títulos de actividades (strings)
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
        datosApp.actividadesEvaluacion = ["Taller liderazgo", "Simulación casos", "Evaluación 360", "Trabajo en equipo"];
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
    const esSupervisor = (usuarioActual.rol === 'supervisor');
    const formDenuncia = document.getElementById('form-denegocio');
    const gestionDenuncias = document.getElementById('gestion-denuncias');

    if (esSupervisor) {
        formDenuncia.style.display = 'none';
        gestionDenuncias.style.display = 'block';
        const tbody = document.getElementById('lista-denuncias');
        const tienda = document.getElementById('selector-tienda').value;
        const denunciasFiltradas = datosApp.denuncias.filter(d => d.tienda === tienda);
        tbody.innerHTML = denunciasFiltradas.map(d => `
            <tr>
                <td>${new Date(d.fecha).toLocaleDateString()}</td>
                <td>${d.descripcion.substring(0, 80)}${d.descripcion.length > 80 ? '…' : ''}</td>
                <td>${d.estado}</td>
                <td>${d.estado !== 'resuelto' ? `<button class="btn btn-sm btn-success" onclick="cambiarEstadoDenuncia(${d.id}, 'resuelto')">Resolver</button>` : 'Resuelta'}</td>
            </tr>
        `).join('');
        if (denunciasFiltradas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay denuncias en esta tienda</td></tr>';
        }
    } else {
        formDenuncia.style.display = 'block';
        gestionDenuncias.style.display = 'none';
        const btnEnviar = document.getElementById('btn-enviar-denuncia');
        const nuevoBtn = btnEnviar.cloneNode(true);
        btnEnviar.parentNode.replaceChild(nuevoBtn, btnEnviar);
        nuevoBtn.onclick = () => {
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
        };
    }
}
window.cambiarEstadoDenuncia = (id, estado) => {
    const den = datosApp.denuncias.find(d => d.id === id);
    if (den) den.estado = estado;
    guardarDatos();
    cargarCanal();
};

// GESTIÓN COMPLETA (usuarios, tiendas, actividades evaluación y calificación)
function cargarGestion() {
    if (usuarioActual.rol !== 'supervisor') return;
    // 1. Usuarios y tiendas (igual que antes)
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

    // 2. Gestión de actividades de evaluación
    const listaActividades = document.getElementById('lista-actividades');
    function renderActividades() {
        listaActividades.innerHTML = datosApp.actividadesEvaluacion.map((act, idx) => `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span>${act}</span>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarActividad(${idx})">Eliminar</button>
            </div>
        `).join('');
    }
    window.eliminarActividad = (idx) => {
        datosApp.actividadesEvaluacion.splice(idx, 1);
        guardarDatos();
        renderActividades();
        // Actualizar selects de calificación
        llenarSelectActividades();
    };
    document.getElementById('btn-agregar-actividad').onclick = () => {
        const nombre = document.getElementById('nuevaActividadNombre').value.trim();
        if (nombre && !datosApp.actividadesEvaluacion.includes(nombre)) {
            datosApp.actividadesEvaluacion.push(nombre);
            guardarDatos();
            renderActividades();
            llenarSelectActividades();
            document.getElementById('nuevaActividadNombre').value = '';
        } else alert("Nombre inválido o duplicado");
    };
    renderActividades();

    // 3. Calificar trabajadores
    function llenarSelectActividades() {
        const selAct = document.getElementById('selActividadEvaluacion');
        selAct.innerHTML = '<option value="">Seleccione actividad</option>' + datosApp.actividadesEvaluacion.map(a => `<option value="${a}">${a}</option>`).join('');
    }
    function llenarSelectTiendasEvaluacion() {
        const selTienda = document.getElementById('selTiendaEvaluacion');
        selTienda.innerHTML = datosApp.tiendas.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    llenarSelectActividades();
    llenarSelectTiendasEvaluacion();

    function cargarTablaCalificaciones() {
        const actividad = document.getElementById('selActividadEvaluacion').value;
        const tienda = document.getElementById('selTiendaEvaluacion').value;
        const tbody = document.getElementById('tablaCalificacionesBody');
        if (!actividad || !tienda) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">Seleccione actividad y tienda</td></tr>';
            return;
        }
        // Obtener trabajadores de esa tienda (con rol 'trabajador')
        const trabajadores = Object.entries(datosApp.usuarios).filter(([user, data]) => data.rol === 'trabajador' && data.tienda === tienda);
        if (trabajadores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No hay trabajadores en esta tienda</td></tr>';
            return;
        }
        tbody.innerHTML = '';
        trabajadores.forEach(([user, data]) => {
            // Buscar evaluación existente para este trabajador y actividad
            const evaluacionesUsuario = datosApp.evaluacionesDesempeno[user] || [];
            const evalExistente = evaluacionesUsuario.find(e => e.actividad === actividad);
            const nota = evalExistente ? evalExistente.nota : '';
            const comentario = evalExistente ? evalExistente.comentario : '';
            const fecha = evalExistente ? evalExistente.fecha.split('T')[0] : new Date().toISOString().split('T')[0];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${data.nombre} (${user})</td>
                <td><input type="number" step="0.1" min="0" max="5" class="form-control form-control-sm nota-input" data-user="${user}" value="${nota}"></td>
                <td><input type="text" class="form-control form-control-sm comentario-input" data-user="${user}" value="${comentario.replace(/"/g, '&quot;')}"></td>
                <td><input type="date" class="form-control form-control-sm fecha-input" data-user="${user}" value="${fecha}"></td>
            `;
            tbody.appendChild(row);
        });
        // Guardar todas las notas al hacer clic en el botón
        const btnGuardar = document.getElementById('btnGuardarCalificaciones');
        const nuevoBtn = btnGuardar.cloneNode(true);
        btnGuardar.parentNode.replaceChild(nuevoBtn, btnGuardar);
        nuevoBtn.onclick = () => {
            const actividadSeleccionada = document.getElementById('selActividadEvaluacion').value;
            const tiendaSeleccionada = document.getElementById('selTiendaEvaluacion').value;
            if (!actividadSeleccionada || !tiendaSeleccionada) return alert("Seleccione actividad y tienda");
            // Recoger todas las notas
            const notas = [];
            document.querySelectorAll('#tablaCalificacionesBody .nota-input').forEach(input => {
                const user = input.dataset.user;
                const nota = parseFloat(input.value);
                const comentario = input.parentElement.parentElement.querySelector('.comentario-input').value;
                const fecha = input.parentElement.parentElement.querySelector('.fecha-input').value;
                if (!isNaN(nota) && nota >= 0 && nota <= 5) {
                    notas.push({ user, nota, comentario, fecha });
                }
            });
            // Guardar en evaluacionesDesempeno
            for (let n of notas) {
                if (!datosApp.evaluacionesDesempeno[n.user]) datosApp.evaluacionesDesempeno[n.user] = [];
                // Reemplazar si ya existe para esa actividad
                const idx = datosApp.evaluacionesDesempeno[n.user].findIndex(e => e.actividad === actividadSeleccionada);
                const nuevaEval = {
                    actividad: actividadSeleccionada,
                    nota: n.nota,
                    comentario: n.comentario,
                    fecha: n.fecha,
                    evaluador: usuarioActual.user
                };
                if (idx !== -1) {
                    datosApp.evaluacionesDesempeno[n.user][idx] = nuevaEval;
                } else {
                    datosApp.evaluacionesDesempeno[n.user].push(nuevaEval);
                }
            }
            guardarDatos();
            alert("Calificaciones guardadas");
            cargarTablaCalificaciones(); // refrescar
        };
    }
    document.getElementById('selActividadEvaluacion').onchange = cargarTablaCalificaciones;
    document.getElementById('selTiendaEvaluacion').onchange = cargarTablaCalificaciones;
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

function crearModalTienda(tiendaActual, callback) {
    if (document.getElementById('modalEditarTienda')) {
        const modalEl = document.getElementById('modalEditarTienda');
        document.getElementById('editTiendaNombre').value = tiendaActual;
        new bootstrap.Modal(modalEl).show();
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
        if (nuevo && nuevo !== tiendaActual) callback(nuevo);
        const modalEl = document.getElementById('modalEditarTienda');
        bootstrap.Modal.getInstance(modalEl).hide();
        modalEl.remove();
    };
    new bootstrap.Modal(document.getElementById('modalEditarTienda')).show();
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
    const evaluaciones = datosApp.evaluacionesDesempeno[usuarioActual.user] || [];
    if (evaluaciones.length === 0) {
        document.getElementById('evaluacion-trabajador-contenido').innerHTML = '<p>Aún no hay evaluaciones de desempeño.</p>';
        return;
    }
    let html = '<div class="table-responsive"><table class="table table-bordered"><thead><tr><th>Actividad</th><th>Nota</th><th>Comentario</th><th>Fecha</th><th>Evaluador</th></tr></thead><tbody>';
    evaluaciones.forEach(e => {
        html += `<tr>
            <td>${e.actividad}</td>
            <td>${e.nota}/5</td>
            <td>${e.comentario || '—'}</td>
            <td>${new Date(e.fecha).toLocaleDateString()}</td>
            <td>${e.evaluador}</td>
        </tr>`;
    });
    html += '</tbody></table></div>';
    document.getElementById('evaluacion-trabajador-contenido').innerHTML = html;
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
