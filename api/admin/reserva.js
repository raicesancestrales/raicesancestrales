import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  if (req.method === "GET") {
    const result = await client.query("SELECT * FROM reservas ORDER BY fecha DESC, hora DESC");
    await client.end();
    return res.status(200).json(result.rows);
  }

  if (req.method === "PUT") {
    const { id, estado, nombre, nacimiento, telefono, correo, signo, fecha, hora } = req.body;
  
    if (!id) return res.status(400).send("ID requerido");
  
    const result = await client.query("SELECT * FROM reservas WHERE id = $1", [id]);
    const reserva = result.rows[0];
  
    if (!reserva) {
      await client.end();
      return res.status(404).send("Reserva no encontrada");
    }
  
    if (estado && !nombre && !telefono && !correo && !fecha && !hora) {
      // Solo se cambia el estado desde el botón ✅
      await client.query("UPDATE reservas SET estado = $1 WHERE id = $2", [estado, id]);
      await client.end();
      return res.status(200).send("✅ Estado actualizado");
    }
  
    // Si hay más datos: modificar todo desde modificar.html
    await client.query(`
      UPDATE reservas SET
        nombre = $1,
        nacimiento = $2,
        telefono = $3,
        correo = $4,
        signo = $5,
        fecha = $6,
        hora = $7,
        estado = 'confirmada'
      WHERE id = $8
    `, [
      nombre || reserva.nombre,
      nacimiento || reserva.nacimiento,
      telefono || reserva.telefono,
      correo || reserva.correo,
      signo || reserva.signo,
      fecha || reserva.fecha,
      hora || reserva.hora,
      id
    ]);
  
    await client.end();
    return res.status(200).send("✅ Reserva modificada correctamente");
  }
  

  





  if (req.method === "DELETE") {
    const { id } = req.body;

    if (!id) return res.status(400).send("ID faltante");
    

    await client.query("DELETE FROM reservas WHERE id = $1", [id]);
    await client.end();
    return res.status(200).send("🗑️ Reserva eliminada");
  }

  await client.end();
  return res.status(405).send("Método no permitido");
}
