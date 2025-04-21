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
    const { id, nombre, nacimiento, telefono, correo, signo, fecha, hora } = req.body;

    const result = await client.query("SELECT estado FROM reservas WHERE id = $1", [id]);
    const estadoActual = result.rows[0]?.estado || 'pendiente';

    await client.query(
      `UPDATE reservas 
       SET nombre = $1, nacimiento = $2, telefono = $3, correo = $4, signo = $5, fecha = $6, hora = $7, estado = $8 
       WHERE id = $9`,
      [nombre, nacimiento, telefono, correo, signo, fecha, hora, estadoActual, id]
    );

    await client.end();
    return res.status(200).send("✅ Cita modificada correctamente");
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
