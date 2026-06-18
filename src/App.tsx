import React, { useState, useEffect } from 'react';
import { Match, PreMatchAnalysis, LiveEvent, PostMatchReview, BetSlip, Wallet } from './types';
import Sidebar from './components/Sidebar';
import MatchList from './components/MatchList';
import PreMatchView from './components/PreMatchView';
import LiveSimulationView from './components/LiveSimulationView';
import PostMatchView from './components/PostMatchView';
import BetslipRail from './components/BetslipRail';
import { Trophy, HelpCircle, Sparkles, PlusCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'explore' | 'simulation' | 'betslip'>('explore');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  
  // Custom detail sub-views inside the 'explore' / 'simulation' tab
  const [exploreView, setExploreView] = useState<'list' | 'pre-match' | 'post-match'>('list');

  // Server-side loaded data caches
  const [preMatchReports, setPreMatchReports] = useState<Record<string, PreMatchAnalysis>>({});
  const [matchSimulations, setMatchSimulations] = useState<Record<string, LiveEvent[]>>({});
  const [postMatchReports, setPostMatchReports] = useState<Record<string, PostMatchReview>>({});

  // Loading states
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingPreCheck, setLoadingPreCheck] = useState(false);
  const [loadingSimFeed, setLoadingSimFeed] = useState(false);
  const [loadingPostCheck, setLoadingPostCheck] = useState(false);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Error notifications
  const [apiError, setApiError] = useState<string | null>(null);

  // Betting variables (Persisted to localStorage safely)
  const [wallet, setWallet] = useState<Wallet>(() => {
    const cached = localStorage.getItem('matchday_wallet');
    return cached ? JSON.parse(cached) : { balance: 1000.00, currency: 'USD' };
  });

  const [historySlips, setHistorySlips] = useState<BetSlip[]>(() => {
    const cached = localStorage.getItem('matchday_history_slips');
    return cached ? JSON.parse(cached) : [];
  });

  const [preparedSlip, setPreparedSlip] = useState<BetSlip | null>(null);

  // Sync betting state with localStorage
  useEffect(() => {
    localStorage.setItem('matchday_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('matchday_history_slips', JSON.stringify(historySlips));
  }, [historySlips]);

  // Read available tournament fixtures on boot
  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoadingMatches(true);
    setApiError(null);
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to load match fixtures.");
      const data = await res.json();
      setMatches(data);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Could not retrieve match data from server.");
    } finally {
      setLoadingMatches(false);
    }
  };

  // Create custom match action
  const handleCreateCustomMatch = async (homeTeam: string, awayTeam: string, tournament: string) => {
    setLoadingCustom(true);
    setApiError(null);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTeam, awayTeam, tournament })
      });
      if (!res.ok) throw new Error("Failed to schedule custom match.");
      const newMatch = await res.json();
      setMatches(prev => [newMatch, ...prev]);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to organize custom fixture.");
    } finally {
      setLoadingCustom(false);
    }
  };

  // Unified select/route coordinator for pre-match, simulate, or post-match tabs
  const handleSelectMatchAction = async (match: Match, action: 'pre-match' | 'simulation' | 'post-match') => {
    setSelectedMatch(match);
    setApiError(null);

    if (action === 'pre-match') {
      setExploreView('pre-match');
      setCurrentTab('explore');

      // Fetch AI Pre-match report from server if not already cached
      if (!preMatchReports[match.id]) {
        setLoadingPreCheck(true);
        try {
          const res = await fetch(`/api/matches/${match.id}/pre-match`);
          if (!res.ok) throw new Error("Could not fetch pre-match report.");
          const analysis: PreMatchAnalysis = await res.json();
          setPreMatchReports(prev => ({ ...prev, [match.id]: analysis }));
        } catch (err: any) {
          console.error(err);
          setApiError(err.message || "Gemini AI was unable to generate pre-match analytics.");
          setExploreView('list');
        } finally {
          setLoadingPreCheck(false);
        }
      }
    } 
    
    else if (action === 'simulation') {
      setCurrentTab('simulation');
      
      // Update match status to live on backend/frontend representation
      setMatches(prevMatches => 
        prevMatches.map(m => m.id === match.id ? { ...m, status: 'live' } : m)
      );

      // Fetch simulated gameplay event log
      if (!matchSimulations[match.id]) {
        setLoadingSimFeed(true);
        try {
          const res = await fetch(`/api/matches/${match.id}/simulate`);
          if (!res.ok) throw new Error("Could not load simulation screenplay.");
          const eventsList: LiveEvent[] = await res.json();
          setMatchSimulations(prev => ({ ...prev, [match.id]: eventsList }));
        } catch (err: any) {
          console.error(err);
          setApiError(err.message || "Simulation server failed to build match events.");
          setCurrentTab('explore');
          setExploreView('list');
        } finally {
          setLoadingSimFeed(false);
        }
      }
    } 
    
    else if (action === 'post-match') {
      setExploreView('post-match');
      setCurrentTab('explore');

      // If review isn't compiled, fetch/POST to server
      if (!postMatchReports[match.id]) {
        setLoadingPostCheck(true);
        try {
          // Re-assemble final/completed parameters or default values
          const hScore = match.homeScore ?? 2;
          const aScore = match.awayScore ?? 1;
          const matchedEvents = matchSimulations[match.id] || [];

          const res = await fetch(`/api/matches/${match.id}/post-match`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              homeScore: hScore,
              awayScore: aScore,
              events: matchedEvents
            })
          });
          if (!res.ok) throw new Error("Could not compile post-match scorecard review.");
          const review: PostMatchReview = await res.json();
          setPostMatchReports(prev => ({ ...prev, [match.id]: review }));
        } catch (err: any) {
          console.error(err);
          setApiError(err.message || "Failed to generate post-match reports.");
          setExploreView('list');
        } finally {
          setLoadingPostCheck(false);
        }
      }
    }
  };

  // Add recommend bet prediction onto current prepared ticket
  const handleAddBetSlip = (selection: string, market: string, odds: number, rationale: string) => {
    if (!selectedMatch) return;
    const slip: BetSlip = {
      id: `slip-${Date.now()}`,
      matchId: selectedMatch.id,
      homeTeam: selectedMatch.homeTeam,
      awayTeam: selectedMatch.awayTeam,
      tournament: selectedMatch.tournament,
      selection,
      market,
      odds,
      stake: 50, // default stake
      predictedReturn: parseFloat((50 * odds).toFixed(2)),
      status: 'pending',
      rationale,
      createdAt: new Date().toLocaleTimeString()
    };
    setPreparedSlip(slip);
  };

  // Confirm and submit slip block (deducts funds, adds to pending history)
  const handleSubmitPreparedSlip = (stake: number) => {
    if (!preparedSlip) return;
    
    const finalSlip: BetSlip = {
      ...preparedSlip,
      stake,
      predictedReturn: parseFloat((stake * preparedSlip.odds).toFixed(2))
    };

    // Deduct stake from wallet balance
    setWallet(prev => ({
      ...prev,
      balance: prev.balance - stake
    }));

    // Insert to historical slips
    setHistorySlips(prev => [finalSlip, ...prev]);

    // Clear prepared block
    setPreparedSlip(null);
  };

  // Grade/Resolve pending match bet tickets upon simulation completion
  const gradeSimulatedBetSlips = (matchId: string, hScore: number, aScore: number, matchObj: Match) => {
    setHistorySlips(prevHistory => 
      prevHistory.map(slip => {
        if (slip.matchId !== matchId || slip.status !== 'pending') return slip;

        let won = false;
        const selLower = slip.selection.toLowerCase();
        const homeLower = matchObj.homeTeam.toLowerCase();
        const awayLower = matchObj.awayTeam.toLowerCase();

        // 1. Home or Away fulltime winner string matches
        if (selLower.includes(homeLower) || selLower.includes('home')) {
          if (hScore > aScore) won = true;
        } else if (selLower.includes(awayLower) || selLower.includes('away')) {
          if (aScore > hScore) won = true;
        } 
        // 2. Draw matches
        else if (selLower.includes('draw')) {
          if (hScore === aScore) won = true;
        } 
        // 3. Over 2.5 goals checks
        else if (selLower.includes('over 2.5')) {
          if (hScore + aScore > 2.5) won = true;
        } 
        // 4. Under 2.5 goals checks
        else if (selLower.includes('under 2.5')) {
          if (hScore + aScore < 2.5) won = true;
        } 
        // 5. General mock evaluation fallback
        else {
          won = Math.random() > 0.45;
        }

        const nextStatus = won ? 'won' : 'lost';

        // Add payout funds into balance instantly if won
        if (won) {
          setWallet(w => ({
            ...w,
            balance: w.balance + slip.predictedReturn
          }));
        }

        return {
          ...slip,
          status: nextStatus
        };
      })
    );
  };

  // Triggered when simulation minute hits 95' (Full play completion)
  const handleSimulationCompleted = async (hScore: number, aScore: number, finalEvents: LiveEvent[]) => {
    if (!selectedMatch) return;

    // Update matches status list to completed and hold results
    setMatches(prevMatches => 
      prevMatches.map(m => m.id === selectedMatch.id 
        ? { ...m, status: 'completed', homeScore: hScore, awayScore: aScore } 
        : m
      )
    );

    // Synchronize latest selections
    const updatedMatch: Match = {
      ...selectedMatch,
      status: 'completed' as const,
      homeScore: hScore,
      awayScore: aScore
    };
    setSelectedMatch(updatedMatch);

    // Resolve matched bet slips immediately
    gradeSimulatedBetSlips(selectedMatch.id, hScore, aScore, selectedMatch);

    // Request AI post-match review compilation
    setLoadingPostCheck(true);
    try {
      const res = await fetch(`/api/matches/${selectedMatch.id}/post-match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeScore: hScore,
          awayScore: aScore,
          events: finalEvents
        })
      });
      if (!res.ok) throw new Error("Server declined to compile review.");
      const review: PostMatchReview = await res.json();
      setPostMatchReports(prev => ({ ...prev, [selectedMatch.id]: review }));
      setExploreView('post-match');
      setCurrentTab('explore');
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to automatically assemble Gemini reviews.");
    } finally {
      setLoadingPostCheck(false);
    }
  };

  // Get active match stats
  const activeMatchName = selectedMatch && selectedMatch.status === 'live' 
    ? `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam}` 
    : undefined;

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-100 font-sans relative overflow-hidden">
      
      {/* Absolute decorative ambient glow circles in the background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 1. Left Control Panel Sidebar */}
      <Sidebar 
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        wallet={wallet}
        activeBetsCount={historySlips.filter(s => s.status === 'pending').length}
        activeMatchName={activeMatchName}
      />

      {/* 2. Main content panels viewport */}
      <main className="flex-1 min-h-screen overflow-y-auto p-6 md:p-8 space-y-6 z-10 relative">
        
        {/* Dynamic Warning Alert banner */}
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md p-4.5 rounded-xl flex items-start gap-3.5 text-xs text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider font-mono">Telemetry Alert Connection Failed</span>
              <p className="mt-1 font-light leading-relaxed">{apiError}</p>
            </div>
          </div>
        )}

        {/* Tab route conditional renders */}
        {currentTab === 'explore' && (
          <>
            {exploreView === 'list' && (
              <MatchList 
                matches={matches}
                onSelectMatch={handleSelectMatchAction}
                onCreateCustomMatch={handleCreateCustomMatch}
                loadingCustom={loadingCustom}
              />
            )}

            {exploreView === 'pre-match' && selectedMatch && (
              <PreMatchView 
                match={selectedMatch}
                analysis={preMatchReports[selectedMatch.id] || null}
                loading={loadingPreCheck}
                onBack={() => setExploreView('list')}
                onStartSim={() => handleSelectMatchAction(selectedMatch, 'simulation')}
                onAddBetSlip={handleAddBetSlip}
                addedSelection={preparedSlip?.selection}
              />
            )}

            {exploreView === 'post-match' && selectedMatch && (
              <PostMatchView 
                match={selectedMatch}
                review={postMatchReports[selectedMatch.id] || null}
                loading={loadingPostCheck}
                onBack={() => setExploreView('list')}
              />
            )}
          </>
        )}

        {currentTab === 'simulation' && (
          selectedMatch ? (
            <LiveSimulationView 
              match={selectedMatch}
              events={matchSimulations[selectedMatch.id] || []}
              loading={loadingSimFeed}
              onFinishSim={handleSimulationCompleted}
              onAddInPlayBetSlip={handleAddBetSlip}
              addedInPlaySelection={preparedSlip?.selection}
              onBack={() => setCurrentTab('explore')}
            />
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center min-h-[400px] flex flex-col justify-center items-center space-y-4 backdrop-blur-xl">
              <Trophy className="w-10 h-10 text-slate-400" />
              <div>
                <h3 className="text-lg font-display font-bold text-slate-200">No Live Game Scheduled</h3>
                <p className="text-slate-450 text-xs mt-1 max-w-sm mx-auto font-light leading-relaxed">
                  Venture to the **Explore Tournaments** tab, select a match card, and click **Live Watch-Along** to initiate the visual simulated coordinate engine!
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('explore')}
                className="bg-emerald-500 hover:bg-emerald-400 text-white font-sans text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-95 transition-all"
              >
                Find a Match
              </button>
            </div>
          )
        )}

        {currentTab === 'betslip' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 backdrop-blur-xl">
            <div>
              <h2 className="text-xl font-display font-bold text-white tracking-tight">Active Betting Ledger History</h2>
              <p className="text-slate-400 text-xs mt-0.5 font-light">Below contains complete receipts, win/loss statuses, and return statistics of all submitted slips.</p>
            </div>

            {historySlips.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs font-light">
                Your placement ledger is empty. Submit a slip inside the right-hand bar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {historySlips.map((slip) => {
                  const isWon = slip.status === 'won';
                  const isLost = slip.status === 'lost';
                  const isPending = slip.status === 'pending';

                  return (
                    <div 
                      key={slip.id} 
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3.5 backdrop-blur-md transition-all ${
                        isWon 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 shadow-sm' 
                          : isLost 
                          ? 'bg-white/5 border-white/10 opacity-60 text-slate-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-200 animate-pulse'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[10.5px]">
                          <span className="font-mono text-slate-400">{slip.tournament}</span>
                          <span className={`font-mono font-bold uppercase text-[9.5px] tracking-wider px-2 py-0.5 rounded border ${
                            isWon 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                              : isLost 
                              ? 'bg-white/10 text-slate-400 border-white/10'
                              : 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                          }`}>
                            {slip.status}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-sm text-slate-100 mt-2">{slip.homeTeam} vs {slip.awayTeam}</h4>
                        <p className="text-xs text-slate-300 mt-1 font-semibold font-light">Selection: {slip.selection}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-white/10 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Odds</div>
                          <div className="text-slate-200 font-semibold">{slip.odds.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Stake</div>
                          <div className="text-slate-200 font-semibold">${slip.stake}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 font-bold uppercase">Return</div>
                          <div className={`font-bold ${isWon ? 'text-emerald-400' : 'text-slate-400'}`}>
                            ${slip.predictedReturn.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 3. Right Slip-Dock Panel Sidebar */}
      <BetslipRail 
        preparedSlip={preparedSlip}
        onClearPrepared={() => setPreparedSlip(null)}
        onSubmitSlip={handleSubmitPreparedSlip}
        historySlips={historySlips}
        wallet={wallet}
      />

    </div>
  );
}
