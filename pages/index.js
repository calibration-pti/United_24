import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function BracketDashboard() {
  const [matches, setMatches] = useState([]);
  const [topScorers, setTopScorers] = useState([]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('realtime_bracket')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'top_scorers' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    const { data: matchData } = await supabase.from('matches').select('*');
    const { data: scoreData } = await supabase.from('top_scorers').select('*').order('kills', { ascending: false });
    if (matchData) setMatches(matchData);
    if (scoreData) setTopScorers(scoreData);
  };

  const rounds = [
    { key: 'Round of 24', label: 'ROUND OF 24' },
    { key: 'Round of 16', label: 'ROUND OF 16' },
    { key: 'Quarter Final', label: 'QUARTER FINAL' },
    { key: 'Semifinal', label: 'SEMIFINAL' },
    { key: 'Grand Final', label: 'GRAND FINAL' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <header className="bg-slate-900 border-b border-red-600/40 p-4 flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div>
          <h1 className="text-xl font-extrabold tracking-wider text-red-500">
            SPORT COMMUNITY CUP PLANT - 2026
          </h1>
          <p className="text-xs text-gray-400">PARAGON E-SPORT - Mobile Legends Tournament</p>
        </div>
        <span className="bg-red-600 text-white text-xs px-3 py-1 font-bold rounded-full animate-pulse tracking-wide">
          • LIVE
        </span>
      </header>

      <main className="p-6">
        <h2 className="text-center text-2xl font-black mb-8 tracking-widest text-slate-100">
          MOBILE LEGEND - ROUND OF 24 BRACKET
        </h2>

        <div className="flex justify-start lg:justify-center gap-6 overflow-x-auto pb-8 min-w-full">
          {rounds.map((round) => (
            <div key={round.key} className="flex flex-col gap-4 min-w-[220px]">
              <div className="bg-slate-900 border border-red-500/40 py-2 px-3 rounded text-center shadow-md">
                <h3 className="text-xs font-black text-red-400 tracking-wider uppercase">
                  {round.label}
                </h3>
              </div>

              <div className="flex flex-col justify-around h-full gap-4">
                {matches
                  .filter((m) => m.round === round.key)
                  .map((m) => (
                    <div
                      key={m.id}
                      className={`bg-slate-900 border rounded-lg p-3 shadow-lg ${
                        m.status === 'LIVE' ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-sm py-1 border-b border-slate-800">
                        <span className={m.winner === m.team_a ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {m.team_a || 'TBD'}
                        </span>
                        <span className="font-bold bg-slate-800 px-2 py-0.5 rounded text-xs">{m.score_a ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1">
                        <span className={m.winner === m.team_b ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {m.team_b || 'TBD'}
                        </span>
                        <span className="font-bold bg-slate-800 px-2 py-0.5 rounded text-xs">{m.score_b ?? 0}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mt-2">
                        <span>{m.id}</span>
                        <span className={m.status === 'LIVE' ? 'text-red-400 font-bold animate-pulse' : ''}>
                          {m.status || 'UPCOMING'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
          <h3 className="text-lg font-extrabold text-red-500 mb-4 tracking-wide">
            🏆 TOP SCORER / MVP LEADERBOARD
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-gray-400 text-xs uppercase">
                  <th className="py-3 px-2">Rank</th>
                  <th className="px-2">Pemain</th>
                  <th className="px-2">Tim</th>
                  <th className="text-center px-2">Kills</th>
                  <th className="text-center px-2">Assists</th>
                </tr>
              </thead>
              <tbody>
                {topScorers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-gray-500">Belum ada data statistik pemain</td>
                  </tr>
                ) : (
                  topScorers.map((player, index) => (
                    <tr key={index} className="border-b border-slate-800/50">
                      <td className="py-3 px-2 font-bold text-red-400">#{index + 1}</td>
                      <td className="font-semibold text-slate-200 px-2">{player.player_name}</td>
                      <td className="text-gray-400 px-2">{player.team_name}</td>
                      <td className="text-center font-extrabold text-green-400 px-2">{player.kills}</td>
                      <td className="text-center font-extrabold text-blue-400 px-2">{player.assists}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
