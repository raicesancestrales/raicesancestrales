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
    const fetchResponse = await fetch('https://script.google.com/macros/s/AKfycbyeC53wi7b-GoBgAFNDLCqTnBWdcJa4YFvk1kGto5wQ8VRwFfW1932EUHEBMzLalkA/exec', {
      method: 'POST',
      body: req, // Transmitimos el body tal cual viene
      duplex: "half", // 👈 esto es lo que faltaba
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
