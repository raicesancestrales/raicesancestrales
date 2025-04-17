export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Método no permitido');
  }

  try {
    const fetchResponse = await fetch('https://script.google.com/macros/s/AKfycbwU6yGIc66D2-SZyf1x5nz7Jtpv9L_Nl2k_fMn-5kAyIdTVlF2UYWQMMuZQIlPOEXCV/exec', {
      method: 'POST',
      body: req,
      headers: {
        'Content-Type': req.headers['content-type'],
      },
    });

    const text = await fetchResponse.text();
    return res.status(200).send(text);
  } catch (err) {
    console.error('Error al reenviar al Apps Script:', err);
    return res.status(500).send('Error en el proxy');
  }
}
