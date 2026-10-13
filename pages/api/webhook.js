import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = req.body;

    if (body.type === 'MATCH_UPDATE') {
      const { error } = await supabase
        .from('matches')
        .upsert({
          id: body.match_id,
          round: body.round,
          team_a: body.team_a,
          team_b: body.team_b,
          score_a: body.score_a ?? 0,
          score_b: body.score_b ?? 0,
          status: body.status || 'UPCOMING',
          winner: body.winner || null,
        });

      if (error) throw error;
    }

    if (body.type === 'TOP_SCORE_UPDATE') {
      const { error } = await supabase
        .from('top_scorers')
        .upsert({
          player_name: body.player_name,
          team_name: body.team_name,
          kills: body.kills ?? 0,
          assists: body.assists ?? 0,
        });

      if (error) throw error;
    }

    return res.status(200).json({ success: true, message: 'Data synced successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
