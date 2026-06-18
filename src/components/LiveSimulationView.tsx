import React, { useState, useEffect, useRef } from 'react';
import { Match, LiveEvent } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Tv, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Award,
  ArrowRight,
  Plus
} from 'lucide-react';

interface LiveSimulationViewProps {
  match: Match;
  events: LiveEvent[];
  loading: boolean;
  onFinishSim: (homeScore: number, awayScore: number, finalEvents: LiveEvent[]) => void;
  onAddInPlayBetSlip: (selection: string, market: string, odds: number, rationale: string) => void;
  addedInPlaySelection?: string;
  onBack: () => void;
}

export default function LiveSimulationView({
  match,
  events,
  loading,
  onFinishSim,
  onAddInPlayBetSlip,
  addedInPlaySelection,
  onBack
}: LiveSimulationViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentEventIdx, setCurrentEventIdx] = useState(0);
  const [simMinute, setSimMinute] = useState(0);
  const [simSpeed, setSimSpeed] = useState(5); // game minutes advanced per interval step

  // State to track dynamic stats
  const [stats, setStats] = useState({
    possessionHome: 50,
    possessionAway: 50,
    shotsHome: 0,
    shotsAway: 0,
    cornersHome: 0,
    cornersAway: 0,
    foulsHome: 0,
    foulsAway: 0
  });

  // Dynamic live odds state that shifts as matches play out
  const [liveOdds, setLiveOdds] = useState({
    homeWin: match.startingOdds.homeWin,
    draw: match.startingOdds.draw,
    awayWin: match.startingOdds.awayWin
  });

  // Keep track of preceding ball position to show slide animation
  const previousPosition = useRef({ x: 50, y: 50 });

  // Reset simulation when match or events change
  useEffect(() => {
    setCurrentEventIdx(0);
    setSimMinute(0);
    setIsPlaying(true);
    setStats({
      possessionHome: 50,
      possessionAway: 50,
      shotsHome: 0,
      shotsAway: 0,
      cornersHome: 0,
      cornersAway: 0,
      foulsHome: 0,
      foulsAway: 0
    });
    setLiveOdds({
      homeWin: match.startingOdds.homeWin,
      draw: match.startingOdds.draw,
      awayWin: match.startingOdds.awayWin
    });
  }, [match.id, events]);

  // Main simulation timer tick effect
  useEffect(() => {
    if (!isPlaying || loading || events.length === 0) return;

    const interval = setInterval(() => {
      setSimMinute((prevMin) => {
        const nextMin = prevMin + 1;

        // Determine if we've reached a scheduled event
        const nextEvent = events[currentEventIdx + 1];
        if (nextEvent && nextMin >= nextEvent.minute) {
          // Advance the event index
          setCurrentEventIdx((idx) => {
            const newIdx = idx + 1;
            const event = events[newIdx];

            // Safely store preceding coordinates to animate smoothly
            previousPosition.current = { x: events[idx].x, y: events[idx].y };

            // Dynamically increment stats based on events
            setStats(prevStats => {
              const updated = { ...prevStats };
              
              if (event.type === 'goal') {
                if (event.team === 'home') updated.shotsHome += 1;
                else updated.shotsAway += 1;
              } else if (event.type === 'chance') {
                if (event.team === 'home') updated.shotsHome += 1;
                else updated.shotsAway += 1;
              } else if (event.type === 'corner') {
                if (event.team === 'home') updated.cornersHome += 1;
                else updated.cornersAway += 1;
              } else if (event.type === 'foul') {
                if (event.team === 'away') updated.foulsHome += 1; // home commits foul, away gets kick
                else updated.foulsAway += 1;
              }

              // Fluctuating random possession adjustments
              const balanceModifier = event.team === 'home' ? 5 : event.team === 'away' ? -5 : 0;
              updated.possessionHome = Math.min(75, Math.max(25, 50 + balanceModifier + Math.floor(Math.random() * 8 - 4)));
              updated.possessionAway = 100 - updated.possessionHome;

              return updated;
            });

            // Adjust Live betting Odds dynamically based on cumulative score!
            setLiveOdds(() => {
              const homeScore = event.currentHomeScore;
              const awayScore = event.currentAwayScore;
              const diff = homeScore - awayScore;

              if (diff > 0) {
                // Home is leading
                return {
                  homeWin: parseFloat(Math.max(1.05, match.startingOdds.homeWin / (1.8 * diff + 1)).toFixed(2)),
                  draw: parseFloat((match.startingOdds.draw * (1 + 0.3 * diff)).toFixed(2)),
                  awayWin: parseFloat((match.startingOdds.awayWin * (2.5 * diff)).toFixed(2))
                };
              } else if (diff < 0) {
                // Away is leading
                const magnitude = Math.abs(diff);
                return {
                  homeWin: parseFloat((match.startingOdds.homeWin * (2.5 * magnitude)).toFixed(2)),
                  draw: parseFloat((match.startingOdds.draw * (1 + 0.3 * magnitude)).toFixed(2)),
                  awayWin: parseFloat(Math.max(1.05, match.startingOdds.awayWin / (1.8 * magnitude + 1)).toFixed(2))
                };
              } else {
                // Balanced draw state
                return {
                  homeWin: parseFloat((match.startingOdds.homeWin * 1.1).toFixed(2)),
                  draw: parseFloat(Math.max(1.5, match.startingOdds.draw * 0.95).toFixed(2)),
                  awayWin: parseFloat((match.startingOdds.awayWin * 1.1).toFixed(2))
                };
              }
            });

            return newIdx;
          });
        }

        // Handle fulltime / completion
        if (nextMin >= 95) {
          setIsPlaying(false);
          const finalEvent = events[events.length - 1];
          onFinishSim(
            finalEvent?.currentHomeScore || 0,
            finalEvent?.currentAwayScore || 0,
            events
          );
          return 95;
        }

        return nextMin;
      });
    }, 1000 / (simSpeed * 0.35)); // adjusted based on speed factor

    return () => clearInterval(interval);
  }, [isPlaying, currentEventIdx, events, simSpeed, loading]);

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] backdrop-blur-xl">
        <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-500/15 rounded-full"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <Tv className="w-8 h-8 text-emerald-400 animate-pulse" />
        </div>
        <h3 className="text-xl font-display font-bold text-white">Initializing Live Feed Stream...</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm font-light leading-relaxed">
          Generating complete 90-minute narrative screenplay coordinates. Constructing player telemetry variables, live commenting blocks, and expected event sequences.
        </p>
      </div>
    );
  }

  // Active event from timeline list
  const activeEvent = events[currentEventIdx];
  const homeScore = activeEvent?.currentHomeScore || 0;
  const awayScore = activeEvent?.currentAwayScore || 0;

  // Jump to complete immediate mockup simulation
  const handleInstantSim = () => {
    setIsPlaying(false);
    const finalEvent = events[events.length - 1];
    setSimMinute(95);
    setCurrentEventIdx(events.length - 1);
    onFinishSim(
      finalEvent?.currentHomeScore || 0,
      finalEvent?.currentAwayScore || 0,
      events
    );
  };

  // Select inplay custom prediction ticket helper
  const handleAddInPlay = (selection: string, odds: number) => {
    const textSelection = `${match.homeTeam} vs ${match.awayTeam} (In-Play) - ${selection}`;
    onAddInPlayBetSlip(
      textSelection,
      "Live In-Play Odds Marker",
      odds,
      `Submitted at simulation Minute ${simMinute} during an active stadium sequence.`
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Simulation controlling header navigation rail */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">STADIUM WATCH-ALONG ENGINE</div>
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight mt-0.5">
            {match.homeTeam} vs {match.awayTeam} ({match.tournament})
          </h2>
        </div>

        {/* Playback Controls button cluster */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 bg-white/10 hover:bg-white/15 active:scale-95 text-white rounded-xl border border-white/10 transition cursor-pointer"
            title={isPlaying ? "Pause watch-along" : "Play watch-along"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          {/* Speed tuning */}
          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
            {[
              { label: 'Normal', multiplier: 3 },
              { label: 'Fast (10x)', multiplier: 12 },
              { label: 'Super (30x)', multiplier: 35 }
            ].map((speedItem) => (
              <button
                key={speedItem.label}
                onClick={() => setSimSpeed(speedItem.multiplier)}
                className={`px-3 py-1.5 text-[10.5px] font-mono font-bold rounded-lg transition cursor-pointer ${
                  simSpeed === speedItem.multiplier 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speedItem.label}
              </button>
            ))}
          </div>

          {/* Instant calculation shortcut */}
          <button
            onClick={handleInstantSim}
            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-450 hover:text-white border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          >
            Instant Skip
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main visual interface layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Stadium simulation pitch & stats logs Col */}
        <div className="lg:col-span-2 space-y-6">

          {/* Graphical moving football pitch */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-xl">
            <div className="flex justify-between items-center mb-3.5">
              <span className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                Strap Camera: Live Tracker Location map
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-950/80 border border-white/5 px-2.5 py-1 rounded-lg">
                Score: {homeScore} - {awayScore}
              </span>
            </div>

            {/* Stadium Pitch Canvas layout */}
            <div className="relative bg-emerald-950 rounded-2xl overflow-hidden border-2 border-emerald-900/60 p-4 h-[300px] shadow-lg shadow-black/40">
              
              {/* Strategic line assets */}
              <div className="absolute inset-0 border border-emerald-900/40 m-2.5 rounded pointer-events-none"></div>
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-emerald-900/40 pointer-events-none"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-emerald-900/40 rounded-full pointer-events-none"></div>
              {/* Penalty arcs */}
              <div className="absolute inset-y-1/6 left-0 w-14 border border-emerald-900/40 border-l-0 rounded-r-3xl pointer-events-none"></div>
              <div className="absolute inset-y-1/6 right-0 w-14 border border-emerald-900/40 border-r-0 rounded-l-3xl pointer-events-none"></div>

              {/* Tactical drifting background player dots (makes layout feel alive) */}
              <div className="absolute top-[35%] left-[25%] w-3 h-3 rounded-full bg-blue-500 border border-white opacity-80 shadow transition-all duration-[3s]" style={{ transform: `translate(${(simMinute % 4) * 8}px, ${((simMinute+1) % 4) * 5}px)` }}></div>
              <div className="absolute top-[60%] left-[30%] w-3 h-3 rounded-full bg-blue-500 border border-white opacity-80 shadow transition-all duration-[2.5s]" style={{ transform: `translate(${(simMinute % 5) * -6}px, ${((simMinute+2) % 3) * 6}px)` }}></div>
              <div className="absolute top-[25%] left-[65%] w-3 h-3 rounded-full bg-slate-900 border border-white opacity-80 shadow transition-all duration-[3.5s]" style={{ transform: `translate(${(simMinute % 3) * 5}px, ${((simMinute+3) % 5) * -8}px)` }}></div>
              <div className="absolute top-[75%] left-[70%] w-3 h-3 rounded-full bg-slate-900 border border-white opacity-80 shadow transition-all duration-[2.8s]" style={{ transform: `translate(${(simMinute % 4) * -7}px, ${((simMinute) % 4) * 5}px)` }}></div>

              {/* Live active ball tracking point */}
              {activeEvent && (
                <div 
                  className="absolute w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-2xl border-2 border-slate-900 z-30 transform -translate-x-1/2 -translate-y-1/2 duration-1000 ease-out"
                  style={{ 
                    left: `${activeEvent.x}%`, 
                    top: `${activeEvent.y}%`,
                    transition: 'all 1.6s cubic-bezier(0.25, 1, 0.5, 1)' 
                  }}
                >
                  <span className="absolute w-5 h-5 rounded-full bg-white/40 anim-pulse pointer-events-none"></span>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>
                </div>
              )}

              {/* Visual dynamic Event marker tooltip */}
              {activeEvent && (
                <div 
                  className="absolute border border-white/10 bg-slate-950/95 py-2 px-3 rounded-xl shadow-xl text-center max-w-[200px] z-40 text-xs text-white pointer-events-none transition-all duration-500"
                  style={{
                    left: `${activeEvent.x}%`,
                    top: `calc(${activeEvent.y}% - 55px)`,
                    transform: 'translateX(-50%)',
                    opacity: 0.95
                  }}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <span className="font-mono text-[9.5px] font-extrabold text-emerald-400 bg-emerald-950/80 px-1 py-0.1 border border-emerald-900/60 rounded">Min {activeEvent.minute}</span>
                    <span className="font-bold text-[10.5px] uppercase truncate">{activeEvent.type}</span>
                  </div>
                  <div className="text-[10px] text-slate-350 truncate mt-0.5">{activeEvent.player || 'Play sequence'}</div>
                </div>
              )}

              {/* Overlay timer clocks */}
              <div className="absolute bottom-3 left-4 bg-slate-950/90 border border-white/5 py-1.5 px-3 rounded-xl font-mono flex items-center gap-2.5 z-20">
                <span className="text-slate-400 text-xs uppercase font-extrabold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-red-500 rounded-full inline-block animate-pulse"></span>
                  LIVE:
                </span>
                <span className="text-emerald-400 font-black text-xl tracking-wider">
                  {simMinute.toString().padStart(2, '0')}&apos;<span className="text-emerald-600 font-semibold text-sm">/90</span>
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Match stats meters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
            <h3 className="font-display font-bold text-white text-sm">Dynamic Match Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Possession stat bar */}
              <div className="p-3.5 bg-slate-950/40 border border-white/5 rounded-xl">
                <div className="flex justify-between text-xs font-mono mb-1.5 text-slate-400 font-semibold">
                  <span>{match.homeShort} Possession</span>
                  <span className="text-emerald-400">{stats.possessionHome}%</span>
                </div>
                <div className="h-2 bg-slate-950/80 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-400" style={{ width: `${stats.possessionHome}%` }}></div>
                  <div className="h-full bg-slate-700" style={{ width: `${stats.possessionAway}%` }}></div>
                </div>
              </div>

              {/* Shots, Corners, Fouls grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-450 font-mono uppercase font-bold">Shots</div>
                  <div className="text-sm font-mono font-extrabold text-slate-200 mt-1 flex justify-center gap-1.5">
                    <span>{stats.shotsHome}</span>
                    <span className="text-slate-600">-</span>
                    <span>{stats.shotsAway}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-450 font-mono uppercase font-bold">Corners</div>
                  <div className="text-sm font-mono font-extrabold text-slate-200 mt-1 flex justify-center gap-1.5">
                    <span>{stats.cornersHome}</span>
                    <span className="text-slate-605">-</span>
                    <span>{stats.cornersAway}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-slate-450 font-mono uppercase font-bold">Fouls</div>
                  <div className="text-sm font-mono font-extrabold text-slate-200 mt-1 flex justify-center gap-1.5">
                    <span>{stats.foulsHome}</span>
                    <span className="text-slate-605">-</span>
                    <span>{stats.foulsAway}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right side: Commentary events logger + INPLAY betting Exchange panel */}
        <div className="space-y-6">

          {/* LIVE commentary ticket chronological ledger */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg h-[320px] flex flex-col backdrop-blur-xl">
            <h3 className="font-display font-bold text-white text-sm border-b border-white/5 pb-2.5 mb-3 flex-shrink-0">
              Stadium Audio Commentary Logs
            </h3>

            {/* Scrollable events ticker frame */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 font-sans">
              {events.slice(0, currentEventIdx + 1).reverse().map((event, idx) => {
                const isGoal = event.type === 'goal';
                const isCard = event.type === 'card_yellow' || event.type === 'card_red';
                const isVar = event.type === 'var';

                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border flex gap-2.5 transition-all duration-300 ${
                      isGoal 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 shadow-sm shadow-emerald-500/5' 
                        : isVar 
                        ? 'bg-amber-500/10 border-amber-500/20 text-text-amber-100'
                        : isCard 
                        ? 'bg-red-500/10 border-red-500/20 text-red-105'
                        : 'bg-slate-950/40 border-white/5 text-slate-350'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10.5px] font-mono font-black border border-white/5 px-1 py-0.2 bg-slate-950 text-white rounded">
                        {event.minute}&apos;
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-200 leading-normal text-[11.5px] flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono uppercase font-black text-[9.5px] text-slate-450 tracking-wider">
                          [{event.type}]
                        </span>
                        {event.player && (
                          <span className="font-bold text-slate-100">{event.player}</span>
                        )}
                        {event.assistant && (
                          <span className="text-[10px] text-slate-450 font-normal">Asst: {event.assistant}</span>
                        )}
                      </div>
                      <p className="opacity-95 font-light">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Exchange In-Play odds price board */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
            <div>
              <h3 className="font-display font-bold text-white text-sm flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Adaptive Live Betting Exchange
              </h3>
              <p className="text-slate-400 text-[11px] leading-snug mt-0.5 font-light">Odds shift in-play based on goal updates. Prepare in-play slips instantly before the market locks.</p>
            </div>

            <div className="space-y-2.5">
              {/* Home odd */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-200">{match.homeTeam} Win</div>
                  <span className="text-[10px] text-slate-500 font-normal">Full Time Match Odds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-1.5 border border-white/5 rounded-lg">{liveOdds.homeWin}</span>
                  <button
                    onClick={() => handleAddInPlay(`${match.homeTeam} FullTime Win`, liveOdds.homeWin)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-xl transition shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
                    title="Add in-play prediction"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Draw odd */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-200">Draw Outcome</div>
                  <span className="text-[10px] text-slate-500 font-mono font-normal">Full Time Match Odds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-1.5 border border-white/5 rounded-lg">{liveOdds.draw}</span>
                  <button
                    onClick={() => handleAddInPlay("Draw Outcome Match", liveOdds.draw)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-xl transition shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
                    title="Add in-play prediction"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Away odd */}
              <div className="bg-slate-950/45 p-3 rounded-xl border border-white/5 flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-slate-200">{match.awayTeam} Win</div>
                  <span className="text-[10px] text-slate-500 font-normal">Full Time Match Odds</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-400 bg-slate-950/80 px-2.5 py-1.5 border border-white/5 rounded-lg">{liveOdds.awayWin}</span>
                  <button
                    onClick={() => handleAddInPlay(`${match.awayTeam} FullTime Win`, liveOdds.awayWin)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white p-2 rounded-xl transition shadow-lg shadow-emerald-500/10 active:scale-95 cursor-pointer"
                    title="Add in-play prediction"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {addedInPlaySelection && (
              <div className="bg-emerald-500/10 text-emerald-400 text-[10.5px] border border-emerald-500/20 p-2.5 rounded-xl flex items-center gap-1.5 justify-center leading-normal">
                <CheckCircle className="w-4 h-4 flex-shrink-0 animate-pulse" />
                <span>Ticket pre-loaded in right rail slips! Click Submit inside Ledger.</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
