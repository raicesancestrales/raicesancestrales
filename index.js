import express from 'express';
import dotenv from 'dotenv';
import { subirArchivo } from './lib/googleDrive.js';
import path from 'path';
import formidable from 'formidable';
import pkg from 'pg';

const { Client } = pkg;
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;

app.post('/api/reserva', (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al parsear formulario:', err);
      return res.status(500).send('Error al procesar el formulario');
    }

    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await client.connect();

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
      } = Object.fromEntries(
        Object.entries(fields).map(([key, val]) => [key, Array.isArray(val) ? val.at(-1) : val])
      );

      let urlArchivo = null;
      const archivo = files.comprobante;

      if (archivo?.filepath) {
        const ext = path.extname(archivo.originalFilename);
        const nombrePersonalizado = `Comprobante - ${nombre}${ext}`;
        urlArchivo = await subirArchivo(
          archivo.filepath,
          nombrePersonalizado,
          archivo.mimetype,
          process.env.GOOGLE_FOLDER_ID
        );
      }

      const query = `
        INSERT INTO reservas (
          nombre, nacimiento, telefono, correo, signo, pais,
          fecha, hora, metodo_pago, url_archivo, estado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Pendiente')
      `;

      const values = [
        nombre,
        nacimiento,
        telefono,
        correo,
        signo,
        pais,
        fecha,
        hora,
        metodoPago,
        urlArchivo,
      ];

      await client.query(query, values);
      await client.end();

      res.send('✅ Reserva guardada y archivo subido');
    } catch (e) {
      console.error('❌ Error en el servidor:', e);
      res.status(500).send('Error interno');
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});

