import pkg from 'pg';
const { Client } = pkg;

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const query = `
    SELECT nombre, correo, telefono, COUNT(*) as total
    FROM reservas
    WHERE estado = 'confirmada'
    GROUP BY nombre, correo, telefono
    HAVING COUNT(*) >= 2
    ORDER BY total DESC;
  `;

  const result = await client.query(query);
  await client.end();

  return res.status(200).json(result.rows);
}
