import { IncomingForm } from 'formidable';
import { ReadStream, createReadStream } from 'fs';
import { createReadStream as fsCreateReadStream } from 'fs';
import { fileFromPath } from 'formdata-node/file-from-path';
import { FormData } from 'formdata-node';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Error al parsear el formulario:", err);
      return res.status(500).send("Error al procesar el formulario");
    }

    try {
      const { default: fetch } = await import('node-fetch');
      const formData = new FormData();

      // Agregar campos normales
      for (const key in fields) {
        formData.set(key, fields[key]);
      }

      // Agregar archivo
      const file = files.comprobante;
      if (file) {
        const stream = fsCreateReadStream(file.filepath);
        formData.set('comprobante', stream, file.originalFilename);
      }

      const response = await fetch('https://script.google.com/macros/s/AKfycbz8-l1JgquTVIgy9G83Utl93aq50kx_09bCHp89_4Eq57gUqFQP6xTw154sDoRd8eKF/exec', {
        method: 'POST',
        body: formData,
        // No pongas headers, formData los gestiona
      });

      const text = await response.text();
      return res.status(200).send(text);
    } catch (err) {
      console.error("❌ Error al reenviar al Apps Script:", err);
      return res.status(500).send("Error en el proxy");
    }
  });
}
