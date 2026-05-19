const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ========== TABLAS (se crean automáticamente al iniciar) ==========
async function inicializarTablas() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS usuarios (
      username TEXT PRIMARY KEY,
      nombre TEXT,
      rol TEXT,
      pass TEXT,
      tienda TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS tiendas (
      nombre TEXT PRIMARY KEY
    )`,
    `CREATE TABLE IF NOT EXISTS indicadores (
      tienda TEXT PRIMARY KEY,
      taller REAL,
      auditoria REAL,
      satisfaccion360 REAL,
      denuncias_atendidas INTEGER,
      fecha TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS semaforo (
      tienda TEXT PRIMARY KEY,
      estado TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS cronograma (
      tienda TEXT,
      actividades JSONB,
      ciclo_actual INTEGER,
      fecha_inicio TEXT,
      PRIMARY KEY (tienda)
    )`,
    `CREATE TABLE IF NOT EXISTS denuncias (
      id INTEGER PRIMARY KEY,
      fecha TEXT,
      descripcion TEXT,
      estado TEXT,
      tienda TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS evaluaciones_desempeno (
      usuario TEXT,
      actividad TEXT,
      nota REAL,
      comentario TEXT,
      fecha TEXT,
      evaluador TEXT,
      PRIMARY KEY (usuario, actividad)
    )`,
    `CREATE TABLE IF NOT EXISTS planes_mejora (
      tienda TEXT PRIMARY KEY,
      texto TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS actividades_evaluacion (
      nombre TEXT PRIMARY KEY
    )`
  ];
  for (let sql of queries) {
    await pool.query(sql);
  }
}
inicializarTablas();

// ========== RUTAS ==========
// Usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/usuarios', async (req, res) => {
  const { username, nombre, rol, pass, tienda } = req.body;
  try {
    await pool.query('INSERT INTO usuarios VALUES ($1,$2,$3,$4,$5) ON CONFLICT(username) DO UPDATE SET nombre=$2, rol=$3, pass=$4, tienda=$5', [username, nombre, rol, pass, tienda]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/usuarios/:username', async (req, res) => {
  const { username } = req.params;
  try {
    await pool.query('DELETE FROM usuarios WHERE username = $1', [username]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tiendas
app.get('/api/tiendas', async (req, res) => {
  try {
    const result = await pool.query('SELECT nombre FROM tiendas');
    res.json(result.rows.map(r => r.nombre));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/tiendas', async (req, res) => {
  const { nombre } = req.body;
  try {
    await pool.query('INSERT INTO tiendas VALUES ($1) ON CONFLICT DO NOTHING', [nombre]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/tiendas/:nombre', async (req, res) => {
  const { nombre } = req.params;
  try {
    await pool.query('DELETE FROM tiendas WHERE nombre = $1', [nombre]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Indicadores
app.get('/api/indicadores/:tienda', async (req, res) => {
  const { tienda } = req.params;
  try {
    const result = await pool.query('SELECT * FROM indicadores WHERE tienda = $1', [tienda]);
    res.json(result.rows[0] || { taller: 0, auditoria: 0, satisfaccion360: 0, denunciasAtendidas: 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/indicadores', async (req, res) => {
  const { tienda, taller, auditoria, satisfaccion360, denunciasAtendidas } = req.body;
  try {
    await pool.query('INSERT INTO indicadores VALUES ($1,$2,$3,$4,$5, $6) ON CONFLICT(tienda) DO UPDATE SET taller=$2, auditoria=$3, satisfaccion360=$4, denuncias_atendidas=$5, fecha=$6', [tienda, taller, auditoria, satisfaccion360, denunciasAtendidas, new Date().toISOString()]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Semaforo
app.get('/api/semaforo/:tienda', async (req, res) => {
  const { tienda } = req.params;
  try {
    const result = await pool.query('SELECT estado FROM semaforo WHERE tienda = $1', [tienda]);
    res.json({ estado: result.rows[0]?.estado || 'rojo' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/semaforo', async (req, res) => {
  const { tienda, estado } = req.body;
  try {
    await pool.query('INSERT INTO semaforo VALUES ($1,$2) ON CONFLICT(tienda) DO UPDATE SET estado=$2', [tienda, estado]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Denuncias
app.get('/api/denuncias/:tienda', async (req, res) => {
  const { tienda } = req.params;
  try {
    const result = await pool.query('SELECT * FROM denuncias WHERE tienda = $1', [tienda]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/denuncias', async (req, res) => {
  const { fecha, descripcion, estado, tienda } = req.body;
  try {
    const id = Date.now();
    await pool.query('INSERT INTO denuncias (id, fecha, descripcion, estado, tienda) VALUES ($1,$2,$3,$4,$5)', [id, fecha, descripcion, estado, tienda]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/denuncias/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    await pool.query('UPDATE denuncias SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Evaluaciones desempeño
app.get('/api/evaluaciones/:usuario', async (req, res) => {
  const { usuario } = req.params;
  try {
    const result = await pool.query('SELECT * FROM evaluaciones_desempeno WHERE usuario = $1', [usuario]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/evaluaciones', async (req, res) => {
  const { usuario, actividad, nota, comentario, fecha, evaluador } = req.body;
  try {
    await pool.query('INSERT INTO evaluaciones_desempeno VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT(usuario,actividad) DO UPDATE SET nota=$3, comentario=$4, fecha=$5, evaluador=$6', [usuario, actividad, nota, comentario, fecha, evaluador]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Actividades evaluación
app.get('/api/actividades', async (req, res) => {
  try {
    const result = await pool.query('SELECT nombre FROM actividades_evaluacion');
    res.json(result.rows.map(r => r.nombre));
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/actividades', async (req, res) => {
  const { nombre } = req.body;
  try {
    await pool.query('INSERT INTO actividades_evaluacion VALUES ($1) ON CONFLICT DO NOTHING', [nombre]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.delete('/api/actividades/:nombre', async (req, res) => {
  const { nombre } = req.params;
  try {
    await pool.query('DELETE FROM actividades_evaluacion WHERE nombre = $1', [nombre]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Cronograma
app.get('/api/cronograma/:tienda', async (req, res) => {
  const { tienda } = req.params;
  try {
    const result = await pool.query('SELECT actividades, ciclo_actual, fecha_inicio FROM cronograma WHERE tienda = $1', [tienda]);
    res.json(result.rows[0] || { actividades: [], cicloActual: 1, fechaInicio: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/cronograma', async (req, res) => {
  const { tienda, actividades, cicloActual, fechaInicio } = req.body;
  try {
    await pool.query('INSERT INTO cronograma VALUES ($1,$2,$3,$4) ON CONFLICT(tienda) DO UPDATE SET actividades=$2, ciclo_actual=$3, fecha_inicio=$4', [tienda, JSON.stringify(actividades), cicloActual, fechaInicio]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Plan de mejora
app.get('/api/planmejora/:tienda', async (req, res) => {
  const { tienda } = req.params;
  try {
    const result = await pool.query('SELECT texto FROM planes_mejora WHERE tienda = $1', [tienda]);
    res.json({ texto: result.rows[0]?.texto || '' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/planmejora', async (req, res) => {
  const { tienda, texto } = req.body;
  try {
    await pool.query('INSERT INTO planes_mejora VALUES ($1,$2) ON CONFLICT(tienda) DO UPDATE SET texto=$2', [tienda, texto]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => {
  console.log(`Backend D1 escuchando en puerto ${port}`);
});
