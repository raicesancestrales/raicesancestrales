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

      const response = await fetch("https://script.google.com/macros/s/AKfycbxhXI5SjdLpF1iFGdk--qWKlzC9fRCFeo3AJBWEiJdQzVfhkmICqY_E1QP1_eCO3q7N/exec", {
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
