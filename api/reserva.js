import { IncomingForm } from 'formidable';
import { createReadStream } from 'fs';
import pkg from 'pg';
const { Client } = pkg;


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // Preflight CORS
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const form = new IncomingForm({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al parsear formulario:', err);
      return res.status(500).send('Error al procesar el formulario');
    }

    try {
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      await client.connect();

      console.log("📥 Campos recibidos:", fields);
      console.log("📎 Archivo recibido:", files);

      const {
        idReserva,
        nombre,
        nacimiento,
        telefono,
        correo,
        signo,
        pais,
        fecha,
        hora,
        metodoPago,
      } = fields;

      const archivo = files.comprobante;
      const urlArchivo = archivo ? archivo.originalFilename : null;

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

      return res.status(200).send('✅ Reserva guardada correctamente en PostgreSQL');
    } catch (error) {
      console.error("❌ Error al guardar en la base de datos:", error);
      return res.status(500).send('Error interno al guardar la reserva');
    }
  });
}
