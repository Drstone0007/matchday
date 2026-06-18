import React from 'react';
import { Match, PreMatchAnalysis, PlayerLineup } from '../types';
import { 
  ArrowLeft, 
  Sparkles, 
  Percent, 
  Users, 
  FileText, 
  TrendingUp, 
  Play, 
  Plus, 
  CheckCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

interface PreMatchViewProps {
  match: Match;
  analysis: PreMatchAnalysis | null;
  loading: boolean;
  onBack: () => void;
  onStartSim: () => void;
  onAddBetSlip: (selection: string, market: string, odds: number, rationale: string) => void;
  addedSelection?: string; // to show checkmark if already added
}

export default function PreMatchView({
  match,
  analysis,
  loading,
  onBack,
  onStartSim,
  onAddBetSlip,
  addedSelection
}: PreMatchViewProps) {

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] backdrop-blur-xl">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-display font-bold text-white">Consulting Scouting Reports...</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm font-light leading-relaxed">
          MATCHDAY AI agent is analyzing tactical trends, previous head-to-head records, expected lineups, and current goals form parameters.
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center min-h-[400px] flex flex-col justify-center items-center backdrop-blur-xl">
        <p className="text-slate-400 font-sans mb-4 font-light">No tactical analysis generated/found for this fixture.</p>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Helper to categorize starting lineup into standard positions
  const getPlayersByPos = (players: PlayerLineup[], pos: 'GK' | 'DEF' | 'MID' | 'FWD') => {
    return players.filter(p => p.position === pos);
  };

  return (
    <div className="space-y-6">
      {/* Header action panel */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/15 active:scale-95 text-slate-300 font-sans text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Matches
        </button>

        <button
          onClick={onStartSim}
          className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-sans text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          Stream Live Watch-Along
        </button>
      </div>

      {/* Match Showcase header */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">{match.tournament} • PRE-MATCH RADAR</span>
          <h2 className="text-2xl font-display font-extrabold text-white tracking-tight mt-1">
            {match.homeTeam} vs {match.awayTeam}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-light">{match.venue} ({match.date})</p>
        </div>

        {/* Predictive mini score breakdown */}
        <div className="bg-slate-950/60 px-4 py-3 rounded-xl border border-white/10 text-center font-mono">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Predictive Line</div>
          <div className="text-emerald-400 text-2xl font-black tracking-widest mt-1">
            {analysis.predictedScoreLine}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Most probable outcome</div>
        </div>
      </div>      {/* Probability gauge block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Win percentage gauges */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            Win Probabilities
          </h3>

          <div className="space-y-3.5 pt-1">
            {/* Home probability */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300 font-semibold">{match.homeTeam}</span>
                <span className="text-emerald-400 font-bold">{analysis.winProbabilityHome}%</span>
              </div>
              <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 transition-all rounded-full" 
                  style={{ width: `${analysis.winProbabilityHome}%` }}
                ></div>
              </div>
            </div>

            {/* Draw probability */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-400 font-semibold">Draw probability</span>
                <span className="text-slate-300 font-bold">{analysis.drawProbability}%</span>
              </div>
              <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-500 transition-all rounded-full" 
                  style={{ width: `${analysis.drawProbability}%` }}
                ></div>
              </div>
            </div>

            {/* Away probability */}
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300 font-semibold">{match.awayTeam}</span>
                <span className="text-amber-400 font-bold">{analysis.winProbabilityAway}%</span>
              </div>
              <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all rounded-full" 
                  style={{ width: `${analysis.winProbabilityAway}%` }}
                ></div>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-snug pt-1 font-light">
            These percentages are aggregated continuously from manager career matchups, goal efficiency indices, and tactical playbook alignment profiles.
          </p>
        </div>

        {/* Playbook styles block */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Tactical playbooks setup
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.colorHome }}></span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{match.homeTeam} Playbook</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                {analysis.tacticalSetupHome}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: match.colorAway }}></span>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">{match.awayTeam} Playbook</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                {analysis.tacticalSetupAway}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Strategic graphic Starting Lineups Pitch & Key players */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Expected Graphic starting lineups field */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Projected Formations & Squads
          </h3>

          {/* Graphical Simulated field */}
          <div className="relative bg-emerald-950/80 rounded-xl overflow-hidden border border-emerald-900 p-4 h-[340px] flex flex-col justify-between">
            {/* Field lines representation */}
            <div className="absolute inset-0 border border-emerald-900/60 m-2 rounded pointer-events-none"></div>
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-950/80 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-950/80 rounded-full pointer-events-none"></div>
            
            {/* Goal boxes */}
            <div className="absolute inset-y-1/4 left-0 w-8 border-y border-r border-[#000000]/10 pointer-events-none"></div>
            <div className="absolute inset-y-1/4 right-0 w-8 border-y border-l border-[#000000]/10 pointer-events-none"></div>

            {/* Left squad (Home) */}
            <div className="flex justify-between items-center h-full relative z-10">
              <div className="flex flex-col justify-around h-full w-1/2 items-center text-center">
                {/* GK */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-mono text-[10.5px] font-bold flex items-center justify-center border-2 border-amber-400 shadow-md">1</div>
                  <span className="text-[10px] text-white font-medium bg-emerald-955/90 px-1.5 py-0.5 rounded shadow mt-1">GK: {getPlayersByPos(analysis.expectedLineupHome, 'GK')[0]?.name || 'Goalkeeper'}</span>
                </div>

                {/* Defenders */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupHome, 'DEF').slice(0, 3).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-emerald-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* Midfielders */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupHome, 'MID').slice(0, 3).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-emerald-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* Forwards */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupHome, 'FWD').slice(0, 2).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-emerald-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right squad (Away) */}
              <div className="flex flex-col justify-around h-full w-1/2 items-center text-center">
                {/* Forwards (Away) */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupAway, 'FWD').slice(0, 2).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-amber-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* Midfielders (Away) */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupAway, 'MID').slice(0, 3).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-amber-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* Defenders (Away) */}
                <div className="flex flex-col gap-4">
                  {getPlayersByPos(analysis.expectedLineupAway, 'DEF').slice(0, 3).map((player, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-6.5 h-6.5 rounded-full bg-slate-900 text-slate-100 font-mono text-[10px] font-bold flex items-center justify-center border-2 border-amber-500 shadow-sm">{player.number}</div>
                      <span className="text-[9.5px] text-white/90 bg-emerald-955/80 px-1 rounded mt-0.5 truncate max-w-[100px]">{player.name}</span>
                    </div>
                  ))}
                </div>

                {/* GK (Away) */}
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 font-mono text-[10.5px] font-bold flex items-center justify-center border-2 border-amber-400 shadow-md">1</div>
                  <span className="text-[10px] text-white font-medium bg-emerald-955/90 px-1.5 py-0.5 rounded shadow mt-1">GK: {getPlayersByPos(analysis.expectedLineupAway, 'GK')[0]?.name || 'Goalkeeper'}</span>
                </div>
              </div>
            </div>            {/* Tactical label overlay */}
            <div className="flex justify-between items-center text-[10px] text-white/40 font-mono uppercase bg-slate-950/60 px-3 py-1.5 rounded border border-white/5">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> {match.homeShort} 4-3-3</span>
              <span>Projected Lineups Graph</span>
              <span className="flex items-center gap-1">{match.awayShort} 4-3-3 <Shield className="w-3 h-3 text-amber-400" /></span>
            </div>
          </div>
        </div>

        {/* Tactical battle details columns */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Key Pitch Battles
          </h3>
          <div className="space-y-3.5">
            {analysis.battleAreas.map((battle, idx) => (
              <div key={idx} className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 font-sans leading-relaxed">
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest font-black">Battle 0{idx+1}: {battle.title}</span>
                <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans pt-1 font-light">
                  {battle.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Dynamic agent betting recommended slip cards */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
        <div>
          <h3 className="font-display font-extrabold text-white text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            AI Agent Predictive Betting Recommendations
          </h3>
          <p className="text-slate-400 text-xs mt-0.5 font-light">Below are custom tickets crafted by your scouting coordinator agent, combining team parameters, scoring charts, and simulated lines.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {analysis.betRecommendations.map((bet, idx) => {
            const isAdded = addedSelection === bet.type;
            return (
              <div 
                key={idx} 
                className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-3 relative hover:bg-white/10 transition-all duration-300 shadow-md backdrop-blur-md"
              >
                {/* Confidence banner */}
                <div className="flex justify-between items-center">
                  <span className={`text-[9.5px] font-mono uppercase font-black px-2 py-0.5 rounded-lg border ${
                    bet.confidence === 'high' 
                      ? 'bg-emerald-500/20 text-emerald-450 border-emerald-500/20' 
                      : bet.confidence === 'medium'
                      ? 'bg-blue-500/20 text-blue-450 border-blue-500/20'
                      : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    Confidence: {bet.confidence}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wide">Suggested Market</span>
                </div>

                {/* Selection Details */}
                <div>
                  <div className="text-slate-450 text-[10px] uppercase tracking-widest font-mono font-bold">Betting Selection</div>
                  <div className="text-white font-display font-semibold text-base mt-1 truncate">{bet.type}</div>
                </div>

                {/* Decimal Odds */}
                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">EST ODDS</span>
                    <div className="text-2xl font-mono font-bold text-emerald-400">{bet.odds.toFixed(2)}</div>
                  </div>

                  <button
                    onClick={() => onAddBetSlip(bet.type, "Scoring & Outline Market", bet.odds, bet.reasoning)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAdded 
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 cursor-default shadow-inner' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/15'
                    }`}
                    disabled={isAdded}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                        Prepared
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        Prepare slip
                      </>
                    )}
                  </button>
                </div>

                {/* Strategic rationale explanation */}
                <div className="pt-2 border-t border-white/5 text-[11px] text-slate-400 leading-relaxed font-sans font-light">
                  {bet.reasoning}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
