require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a la base de datos RDS
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar con RDS:', err.message);
    process.exit(1);
  }
  console.log('Conectado a Amazon RDS MySQL correctamente.');
});

// Página principal con interfaz HTML
app.get('/', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).send('Error al consultar usuarios.');
    }

    const filas = results.map((u) => `
      <tr>
        <td>${u.id}</td>
        <td>${u.nombre}</td>
        <td>${u.email}</td>
      </tr>`).join('');

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Laboratorio 3 — RDS MySQL</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; color: #333; padding: 2rem; }
    h1 { margin-bottom: 0.25rem; color: #1a1a2e; }
    p.sub { color: #666; margin-bottom: 2rem; font-size: 0.9rem; }
    .card { background: white; border-radius: 10px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h2 { margin-bottom: 1rem; font-size: 1.1rem; color: #444; }
    label { display: block; margin-bottom: 0.25rem; font-size: 0.85rem; font-weight: bold; color: #555; }
    input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 6px; font-size: 0.95rem; margin-bottom: 1rem; }
    input:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 2px rgba(79,70,229,0.2); }
    button { background: #4f46e5; color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 6px; font-size: 0.95rem; cursor: pointer; }
    button:hover { background: #4338ca; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th { background: #4f46e5; color: white; padding: 0.6rem 1rem; text-align: left; }
    td { padding: 0.6rem 1rem; border-bottom: 1px solid #eee; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f9f9ff; }
    .empty { color: #999; font-style: italic; padding: 1rem 0; }
  </style>
</head>
<body>
  <h1>Laboratorio 3 — AWS RDS MySQL</h1>
  <p class="sub">Base de datos: <strong>lab</strong> · Tabla: <strong>usuarios</strong></p>
  <p class="sub">Creado por: <strong>Josue Carlos Perez</strong> · Carnet: <strong>999021107</strong></p>

  <div class="card">
    <h2>Agregar usuario</h2>
    <form method="POST" action="/usuarios">
      <label for="nombre">Nombre</label>
      <input type="text" id="nombre" name="nombre" placeholder="Ej. Ana García" required />
      <label for="email">Email</label>
      <input type="email" id="email" name="email" placeholder="Ej. ana@correo.com" required />
      <button type="submit">Insertar usuario</button>
    </form>
  </div>

  <div class="card">
    <h2>Usuarios registrados</h2>
    ${results.length === 0
      ? '<p class="empty">No hay usuarios aún.</p>'
      : `<table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>`}
  </div>
</body>
</html>`);
  });
});

// GET /usuarios — JSON para consumo de API
app.get('/usuarios', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar usuarios.' });
    }
    res.json(results);
  });
});

// POST /usuarios — insertar usuario (desde form HTML o JSON)
app.post('/usuarios', (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({ error: 'Los campos nombre y email son obligatorios.' });
  }

  db.query(
    'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
    [nombre, email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error al insertar usuario.' });
      }
      // Si viene del form HTML, redirige a la página principal
      if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
        return res.redirect('/');
      }
      res.status(201).json({ mensaje: 'Usuario creado.', id: result.insertId });
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
