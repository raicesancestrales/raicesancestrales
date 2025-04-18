const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();

// Usar middleware para manejar el cuerpo de la solicitud
app.use(bodyParser.json()); // Para recibir datos en formato JSON

// Conectar a la base de datos de Heroku Postgres
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Heroku gestiona esta variable
  ssl: { rejectUnauthorized: false }, // Requerido por Heroku
});

client.connect()
  .then(() => console.log('Conexión exitosa a la base de datos en Heroku'))
  .catch(err => console.error('Error de conexión', err));

// Endpoint POST para recibir y guardar los datos de la reserva
app.post('/api/reserva', async (req, res) => {
  const {
    nombre,
    nacimiento,
    telefono,
    correo,
    signo,
    pais,
    fecha,
    hora,
    metodoPago,
    urlArchivo
  } = req.body;

  try {
    // Query SQL para insertar la reserva en la base de datos
    const query = `
      INSERT INTO reservas (
        nombre, nacimiento, telefono, correo, signo, pais, fecha, hora, metodo_pago, url_archivo, created_at, estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), 'Pendiente')
      RETURNING id
    `;
    const values = [nombre, nacimiento, telefono, correo, signo, pais, fecha, hora, metodoPago, urlArchivo];

    // Ejecutar el query para insertar los datos
    const result = await client.query(query, values);

    // Obtener el ID generado de la reserva
    const idReserva = result.rows[0].id;

    // Responder con éxito
    res.status(200).json({ message: 'Reserva guardada correctamente', idReserva });
  } catch (error) {
    console.error('Error al guardar los datos:', error);
    res.status(500).json({ error: 'Error al guardar la reserva' });
  }
});

// Iniciar el servidor (puerto dinámico para Heroku)
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor en funcionamiento en puerto ${port}`);
});
