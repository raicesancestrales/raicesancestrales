import { IncomingForm } from 'formidable';
import { createReadStream } from 'fs';
import { FormData } from 'formdata-node';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Agregar encabezados CORS para permitir solicitudes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const form = new IncomingForm({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('❌ Error al parsear el formulario:', err);
      return res.status(500).send('Error al procesar el formulario');
    }

    try {
      const { default: fetch } = await import('node-fetch');
      const formData = new FormData();

      // Añadir campos al formData
      for (const key in fields) {
        formData.set(key, fields[key]);
      }

      // Adjuntar archivo
      const file = files.comprobante;
      if (file && file.filepath && file.originalFilename) {
        const stream = createReadStream(file.filepath);
        formData.set('comprobante', stream, file.originalFilename);
      } else {
        return res.status(400).send('Archivo no válido o no recibido');
      }

      const response = await fetch('https://script.google.com/macros/s/AKfycbzlTisoKgs7s7QR5NkOZUu1RYkdS3QuC4aqFysTyaY0mcrPR3KAmjm475Vf-bmeC0k/exec', {
        method: 'POST',
        body: formData
      });

      // Loguear respuesta del Apps Script
      const text = await response.text();
      console.log('Respuesta de Google Apps Script:', text);
      return res.status(200).send(text);
    } catch (error) {
      console.error('❌ Error al reenviar al Apps Script:', error);
      return res.status(500).send('Error en el proxy');
    }
  });
}
