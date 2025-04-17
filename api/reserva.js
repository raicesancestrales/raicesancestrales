import formidable from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Método no permitido");
  }

  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al parsear el formulario:", err);
      return res.status(500).send("Error al parsear formulario");
    }

    try {
      const formData = new FormData();

      // Agrega todos los campos normales
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value[0]);
      });

      // Agrega el archivo (comprobante)
      const archivo = files.comprobante;
      if (archivo) {
        formData.append(
          "comprobante",
          fs.createReadStream(archivo[0].filepath),
          {
            filename: archivo[0].originalFilename,
            contentType: archivo[0].mimetype,
          }
        );
      }

      const response = await fetch("https://script.google.com/macros/s/AKfycbyeC53wi7b-GoBgAFNDLCqTnBWdcJa4YFvk1kGto5wQ8VRwFfW1932EUHEBMzLalkA/exec", {
        method: "POST",
        body: formData,
        headers: formData.getHeaders()
      });

      const text = await response.text();
      return res.status(200).send(text);
    } catch (error) {
      console.error("Error reenviando al script:", error);
      return res.status(500).send("Error al enviar a Google Script");
    }
  });
}
