// api/admin/login.js
export default async function handler(req, res) {
    const { clave } = req.body;
  
    // Comparar con la clave almacenada como variable de entorno segura
    if (clave === process.env.CLAVE_ADMIN) {
      return res.status(200).json({ acceso: true });
    }
  
    return res.status(401).json({ acceso: false });
  }
  