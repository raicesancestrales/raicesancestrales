export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      const response = await fetch("https://script.google.com/macros/s/AKfycbwU6yGIc66D2-SZyf1x5nz7Jtpv9L_Nl2k_fMn-5kAyIdTVlF2UYWQMMuZQIlPOEXCV/exec", {
        method: "POST",
        headers: {
          "Content-Type": req.headers["content-type"],
        },
        body: buffer,
      });

      const text = await response.text();
      res.status(200).send(text);
    } catch (error) {
      console.error("Error en proxy:", error);
      res.status(500).json({ error: "Error al enviar al script" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
