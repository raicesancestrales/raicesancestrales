const requiredVars = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY',
  'GOOGLE_FOLDER_ID',
  'DATABASE_URL'
];

const missing = requiredVars.filter(v => !process.env[v]);
if (missing.length) {
  console.error("❌ Variables de entorno faltantes:", missing);
}





import path from 'path';
import { subirArchivo } from '../lib/googleDrive.js';
import { IncomingForm } from 'formidable';
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

      // Convertir todos los campos a string plano (último valor si viene como array)
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
      } = Object.fromEntries(
        Object.entries(fields).map(([key, val]) => [key, Array.isArray(val) ? val.at(-1) : val])
      );

      // Subida a Google Drive
      const archivo = files.comprobante;
      let urlArchivo = null;

      if (archivo && archivo.filepath && archivo.originalFilename && archivo.mimetype) {
        const ext = path.extname(archivo.originalFilename);
        const nombrePersonalizado = `Comprobante - ${nombre}${ext}`;
        try {
          urlArchivo = await subirArchivo(
            archivo.filepath,
            nombrePersonalizado,
            archivo.mimetype,
            process.env.GOOGLE_FOLDER_ID
          );
        } catch (uploadError) {
          console.error('❌ Error al subir a Google Drive:', uploadError);
        }
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

      return res.status(200).send('✅ Reserva guardada correctamente en PostgreSQL');
    } catch (error) {
      console.error("❌ Error al guardar en la base de datos:", error);
      return res.status(500).send('Error interno al guardar la reserva');
    }
  });
}
