import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
  const { correo } = req.query;

  if (!correo) {
    return res.status(400).json({ error: "Falta correo" });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const query = `
    SELECT fecha, hora, estado
    FROM reservas
    WHERE correo = $1
    ORDER BY fecha ASC, hora ASC;
  `;

  const result = await client.query(query, [correo]);
  await client.end();

  return res.status(200).json(result.rows);
}
