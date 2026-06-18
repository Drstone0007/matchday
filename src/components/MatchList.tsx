import React, { useState } from 'react';
import { Match } from '../types';
import { 
  Dribbble, 
  Search, 
  MapPin, 
  User, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Calendar,
  Layers,
  Sparkle,
  PlusCircle
} from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  onSelectMatch: (match: Match, action: 'pre-match' | 'simulation' | 'post-match') => void;
  onCreateCustomMatch: (homeTeam: string, awayTeam: string, tournament: string) => Promise<void>;
  loadingCustom: boolean;
}

export default function MatchList({
  matches,
  onSelectMatch,
  onCreateCustomMatch,
  loadingCustom
}: MatchListProps) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [tournament, setTournament] = useState('World Cup 2026');
  const [searchQuery, setSearchQuery] = useState('');

  // Form submit handler for custom matches
  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeTeam.trim() || !awayTeam.trim()) return;
    await onCreateCustomMatch(homeTeam, awayTeam, tournament);
    setHomeTeam('');
    setAwayTeam('');
  };

  const filteredMatches = matches.filter(match => {
    const query = searchQuery.toLowerCase();
    return (
      match.homeTeam.toLowerCase().includes(query) ||
      match.awayTeam.toLowerCase().includes(query) ||
      match.tournament.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Football Tournaments Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5 font-light">Explore scheduled matches, predict odds, simulate game commentary, and prepare bet slips.</p>
        </div>

        {/* Tactical Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pr-2">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search teams or tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 text-slate-200 pl-10 pr-4 py-2 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-transparent transition-all font-sans"
          />
        </div>
      </div>

      {/* Grid of Custom Creator & Match cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Match fixture Cards Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Available Fixtures ({filteredMatches.length})
            </h3>
            <span className="text-slate-500 text-xs font-mono font-bold uppercase tracking-wider">Agent Curated</span>
          </div>

          {filteredMatches.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-slate-400 backdrop-blur-sm">
              <p className="font-light">No matches matching your search. Try creating a custom matchup!</p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              return (
                <div 
                  key={match.id}
                  id={`match-card-${match.id}`} 
                  className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-350 rounded-2xl p-5 shadow-lg backdrop-blur-xl"
                >
                  {/* Tournament header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/15 text-emerald-400 text-[10.5px] font-mono px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20 uppercase tracking-wide">
                        {match.tournament}
                      </span>
                      <span className="text-slate-400 text-xs font-sans font-light">• {match.stage}</span>
                    </div>

                    {/* Status badge */}
                    <div>
                      {match.status === 'live' && (
                        <span className="bg-red-500/10 text-red-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-red-500/20 animate-pulse flex items-center gap-1.5 uppercase tracking-wide">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full inline-block animate-ping"></span>
                          WATCHING LIVE
                        </span>
                      )}
                      {match.status === 'completed' && (
                        <span className="bg-white/10 text-slate-300 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wide">
                          COMPLETED
                        </span>
                      )}
                      {match.status === 'upcoming' && (
                        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wide">
                          SCHEDULED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Versus Competitors Row */}
                  <div className="flex items-center justify-between py-2 px-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-3.5 w-5/12">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-xs shadow-lg transition-transform hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${match.colorHome}, ${match.colorHome}dd)`, color: '#000000' }}
                      >
                        <span className="text-white mix-blend-difference font-black">{match.homeShort}</span>
                      </div>
                      <div className="truncate">
                        <span className="font-display font-bold text-white text-base md:text-lg block tracking-tight truncate">
                          {match.homeTeam}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Home</span>
                      </div>
                    </div>

                    {/* Score / VS Center column */}
                    <div className="flex flex-col items-center justify-center w-2/12">
                      {match.status === 'completed' || match.status === 'live' ? (
                        <div className="bg-slate-950/60 px-3 py-1.5 rounded-xl border border-white/10 font-mono font-bold text-lg text-emerald-400 tracking-wider shadow-inner">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      ) : (
                        <div className="bg-slate-950/40 px-3 py-1 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400 font-black tracking-widest uppercase shadow-sm">
                          VS
                        </div>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-3.5 w-5/12 justify-end text-right">
                      <div className="truncate">
                        <span className="font-display font-bold text-white text-base md:text-lg block tracking-tight truncate">
                          {match.awayTeam}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Away</span>
                      </div>
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-display font-extrabold text-xs shadow-lg transition-transform hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${match.colorAway}, ${match.colorAway}dd)`, color: '#000000' }}
                      >
                        <span className="text-white mix-blend-difference font-black">{match.awayShort}</span>
                      </div>
                    </div>
                  </div>

                  {/* Match Info Details footer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-slate-400 font-light">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:justify-end">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ref: {match.referee}</span>
                    </div>
                  </div>

                  {/* Betting Starting Odds Row */}
                  <div className="mt-4 p-3 bg-slate-950/40 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-[10px] font-mono text-slate-450 uppercase font-black tracking-wider">Starting 1X2 Odds:</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onSelectMatch(match, 'pre-match')}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 font-mono text-xs transition-all cursor-pointer"
                      >
                        <span className="text-slate-500 font-semibold">{match.homeShort}:</span>
                        <span className="text-emerald-400 font-bold">{match.startingOdds.homeWin}</span>
                      </button>
                      <button 
                        onClick={() => onSelectMatch(match, 'pre-match')}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 font-mono text-xs transition-all cursor-pointer"
                      >
                        <span className="text-slate-500 font-semibold">Draw:</span>
                        <span className="text-emerald-400 font-bold">{match.startingOdds.draw}</span>
                      </button>
                      <button 
                        onClick={() => onSelectMatch(match, 'pre-match')}
                        className="bg-white/5 hover:bg-white/10 active:scale-95 border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-slate-300 font-mono text-xs transition-all cursor-pointer"
                      >
                        <span className="text-slate-500 font-semibold">{match.awayShort}:</span>
                        <span className="text-emerald-400 font-bold">{match.startingOdds.awayWin}</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2.5 justify-end">
                    <button
                      onClick={() => onSelectMatch(match, 'pre-match')}
                      className="bg-white/10 hover:bg-white/15 active:scale-95 text-white font-sans font-semibold text-xs px-4 py-2 rounded-xl transition border border-white/10 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                      Tactical Pre-Match
                    </button>

                    {match.status !== 'completed' ? (
                      <button
                        onClick={() => onSelectMatch(match, 'simulation')}
                        className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-sans font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer"
                      >
                        Live Watch-Along
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectMatch(match, 'post-match')}
                        className="bg-white/10 hover:bg-white/15 text-emerald-400 border border-white/10 font-sans font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        AI Tactical Report
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Sidebar: AI Custom Curator Form */}
        <div className="space-y-4">
          <div className="px-1">
            <h3 className="font-display font-bold text-slate-200 text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              Custom Match Curator
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 font-light leading-relaxed">Let the betting agent setup your favorite rivalry matchups dynamically with Gemini intelligence.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-black tracking-wider">Tournament Selection</label>
                <select
                  value={tournament}
                  onChange={(e) => setTournament(e.target.value)}
                  className="w-full bg-slate-950/40 text-slate-250 py-2.5 px-3 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <option value="World Cup 2026">World Cup 2026</option>
                  <option value="UEFA Champions League">UEFA Champions League</option>
                  <option value="UEFA Euro 2028">UEFA Euro 2028</option>
                  <option value="Copa América 2028">Copa América 2028</option>
                  <option value="English Premier League">English Premier League</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-black tracking-wider">Home Team Competitor</label>
                <input
                  type="text"
                  placeholder="e.g., Italy, Liverpool, Japan"
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full bg-slate-950/40 text-slate-200 py-2.5 px-3 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="relative text-center my-1.5">
                <span className="bg-slate-950/60 text-slate-400 font-mono text-[9px] px-2.5 py-1 rounded-full border border-white/10 inline-block font-black select-none z-10 relative">
                  VS
                </span>
                <div className="absolute inset-y-1/2 left-0 right-0 h-[1px] bg-white/5 z-0"></div>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase mb-1.5 font-black tracking-wider">Away Team Competitor</label>
                <input
                  type="text"
                  placeholder="e.g., Portugal, Barcelona, South Korea"
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full bg-slate-950/40 text-slate-200 py-2.5 px-3 border border-white/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingCustom || !homeTeam.trim() || !awayTeam.trim()}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-slate-500 text-white font-sans font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer uppercase tracking-wider"
              >
                {loadingCustom ? (
                  <>
                    <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                    Scheduling Fixture...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-300" />
                    AI Agent Set-Up Fixture
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-white/5 flex items-start gap-2.5 text-[11px] text-slate-400 font-light">
              <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5 animate-pulse" />
              <p className="leading-snug">
                Submitting this prompts the AI system to initialize custom team playbooks, tactical form rating variables, and realistic odds calculations automatically.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
