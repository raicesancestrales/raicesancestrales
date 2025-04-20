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
    const { id, estado } = req.body;
    await client.query("UPDATE reservas SET estado = $1 WHERE id = $2", [estado, id]);
    await client.end();
    return res.status(200).send("Estado actualizado");
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    await client.query("DELETE FROM reservas WHERE id = $1", [id]);
    await client.end();
    return res.status(200).send("Reserva eliminada");
  }

  await client.end();
  return res.status(405).send("Método no permitido");
}
