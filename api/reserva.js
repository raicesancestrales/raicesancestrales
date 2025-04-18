// /api/reserva.js

import { IncomingForm } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error al parsear:', err);
      return res.status(500).send('Error al procesar el formulario');
    }

    const formData = new FormData();

    // Agregar campos normales
    for (const key in fields) {
      formData.append(key, fields[key][0]);
    }

    // Agregar archivo como stream
    const file = files.comprobante?.[0];
    if (file) {
      const fileStream = fs.createReadStream(file.filepath);
      formData.append('comprobante', fileStream, {
        contentType: file.mimetype,
        filename: file.originalFilename,
      });
    }

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwU6yGIc66D2-SZyf1x5nz7Jtpv9L_Nl2k_fMn-5kAyIdTVlF2UYWQMMuZQIlPOEXCV/exec', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      const text = await response.text();
      return res.status(200).send(text);
    } catch (error) {
      console.error('Error al reenviar al Apps Script:', error);
      return res.status(500).send('Error en el proxy');
    }
  });
}
