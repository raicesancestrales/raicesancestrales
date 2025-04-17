export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }
  
    try {
      const response = await fetch(
        'https://script.google.com/macros/s/AKfycbxhXI5SjdLpF1iFGdk--qWKlzC9fRCFeo3AJBWEiJdQzVfhkmICqY_E1QP1_eCO3q7N/exec',
        {
          method: 'POST',
          body: req.body,
          headers: {
            'Content-Type': req.headers['content-type'],
          },
        }
      );
  
      const text = await response.text();
      res.status(200).send(text);
    } catch (error) {
      console.error('Error en proxy:', error);
      res.status(500).json({ error: 'Error al reenviar la solicitud' });
    }
  }
  