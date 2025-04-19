import { Client } from 'pg';

export default async function handler(req, res) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // GET: Listar todas las reservas
  if (req.method === 'GET') {
    try {
      const result = await client.query('SELECT id, nombre, fecha, hora, estado, url_archivo FROM reservas ORDER BY fecha, hora');
      await client.end();
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('❌ Error al obtener reservas:', error);
      await client.end();
      return res.status(500).json({ error: 'Error al obtener las reservas' });
    }
  }

  // PUT: Actualizar el estado de una reserva
  if (req.method === 'PUT') {
    const { id, estado } = req.body;

    if (!id || !estado) {
      await client.end();
      return res.status(400).json({ error: 'ID y estado son requeridos' });
    }

    try {
      await client.query('UPDATE reservas SET estado = $1 WHERE id = $2', [estado, id]);
      await client.end();
      return res.status(200).send('Estado actualizado correctamente');
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      await client.end();
      return res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
  }

  // DELETE: Eliminar una reserva
  if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      await client.end();
      return res.status(400).json({ error: 'ID es requerido para eliminar' });
    }

    try {
      await client.query('DELETE FROM reservas WHERE id = $1', [id]);
      await client.end();
      return res.status(200).send('Reserva eliminada correctamente');
    } catch (error) {
      console.error('❌ Error al eliminar reserva:', error);
      await client.end();
      return res.status(500).json({ error: 'Error al eliminar la reserva' });
    }
  }

  // Otro método HTTP no permitido
  await client.end();
  return res.status(405).json({ error: 'Método no permitido' });
}
