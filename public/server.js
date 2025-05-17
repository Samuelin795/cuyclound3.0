
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Habilitar CORS con opciones más permisivas para desarrollo
app.use(cors({
  origin: '*', // Permite solicitudes desde cualquier origen
  methods: ['GET', 'POST'],
  credentials: true
}));

// Configuración de la conexión a la base de datos
const db = mysql.createConnection({
  host: 'buozjrm4aihgms75kuk6-mysql.services.clever-cloud.com',
  user: 'uqmrrimvkufu81dw',
  password: 'wxw4fb1ZXgrTub49OcLq',
  database: 'buozjrm4aihgms75kuk6',
  port: 3306
});

// Conectar a la base de datos
db.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Endpoint para verificar si el servidor está funcionando
app.get('/', (req, res) => {
  res.send('API de Cuycloud funcionando correctamente');
});

// Endpoint para obtener datos por dispositivo y fecha
app.get('/api/datos', (req, res) => {
  const dispositivo = req.query.dispositivo;
  const fecha = req.query.fecha;

  if (!dispositivo || !fecha) {
    return res.status(400).json({ error: 'Faltan parámetros: dispositivo o fecha' });
  }

  console.log(`Solicitando datos para dispositivo ${dispositivo} en fecha ${fecha}`);

  const query = `
    SELECT 
      id,
      fechahora,
      TIME(fechahora) AS hora,
      id_equipo,
      temperatura_aire,
      humedad_aire,
      temperatura_suelo,
      amoniaco,
      ventilacion,
      limpiarpoza,
      temperaturacontrolada,
      humedadcontrolada,
      suelohumedo,
      humedad_suelo
    FROM datos_tucuy
    WHERE id_equipo = ? AND DATE(fechahora) = ?
    ORDER BY fechahora ASC;
  `;

  db.query(query, [dispositivo, fecha], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta:', err);
      return res.status(500).json({ error: 'Error al obtener los datos de la base de datos', details: err.message });
    }
    
    console.log(`Se encontraron ${results.length} registros`);
    
    // Si no hay resultados, devolver un array vacío en lugar de null
    if (results.length === 0) {
      return res.json([]);
    }
    
    // Convertir valores numéricos según sea necesario
    const processedResults = results.map(row => ({
      ...row,
      temperatura_aire: parseFloat(row.temperatura_aire),
      humedad_aire: parseFloat(row.humedad_aire),
      temperatura_suelo: parseFloat(row.temperatura_suelo),
      amoniaco: parseFloat(row.amoniaco),
      humedad_suelo: parseFloat(row.humedad_suelo)
    }));
    
    res.json(processedResults);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});