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
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);

    const response = await fetch('https://script.google.com/macros/s/AKfycbyeC53wi7b-GoBgAFNDLCqTnBWdcJa4YFvk1kGto5wQ8VRwFfW1932EUHEBMzLalkA/exec', {
      method: 'POST',
      headers: {
        'Content-Type': req.headers['content-type'],
      },
      body,
    });

    const text = await response.text();
    res.status(200).send(text);
  } catch (err) {
    console.error('Error en el proxy:', err);
    res.status(500).send('Error en el proxy');
  }
}
