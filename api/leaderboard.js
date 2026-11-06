import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
  const connectionString = process.env.SCREEN_DATABASE_URL;
  if (!connectionString) {
    response.status(503).json({ error: 'Leaderboard feed is not configured.' });
    return;
  }
  try {
    const sql = neon(connectionString);
    const rows = await sql`
      select id, name, role, avatar_id, points
      from public.screen_leaderboard
      order by points desc, name asc
      limit 50`;
    response.setHeader('Cache-Control', 'public, s-maxage=2, stale-while-revalidate=5');
    response.status(200).json({
      updatedAt: new Date().toISOString(),
      players: rows.map(row => ({
        id: row.id,
        name: row.name,
        role: row.role,
        avatarId: row.avatar_id,
        points: row.points
      }))
    });
  } catch (error) {
    console.error('Leaderboard feed failed', error);
    response.status(500).json({ error: 'Leaderboard feed is unavailable.' });
  }
}
