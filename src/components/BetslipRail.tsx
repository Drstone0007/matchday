import React, { useState } from 'react';
import { BetSlip, Wallet } from '../types';
import { 
  Receipt, 
  Trash2, 
  CheckCircle, 
  DollarSign, 
  Sparkles, 
  Timer, 
  XOctagon, 
  Wallet as WalletIcon, 
  TrendingUp,
  Coins
} from 'lucide-react';

interface BetslipRailProps {
  preparedSlip: BetSlip | null;
  onClearPrepared: () => void;
  onSubmitSlip: (stake: number) => void;
  historySlips: BetSlip[];
  wallet: Wallet;
}

export default function BetslipRail({
  preparedSlip,
  onClearPrepared,
  onSubmitSlip,
  historySlips,
  wallet
}: BetslipRailProps) {
  const [stakeInput, setStakeInput] = useState<number>(50);

  // Return calculation modifier
  const calculatedReturn = preparedSlip ? parseFloat((strokeAmount() * preparedSlip.odds).toFixed(2)) : 0;

  function strokeAmount(): number {
    return isNaN(stakeInput) || stakeInput <= 0 ? 0 : stakeInput;
  }

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preparedSlip) return;
    const stake = strokeAmount();
    if (stake <= 0) return;
    if (stake > wallet.balance) {
      alert("Insufficient funds in your simulated wallet balance. Try a lower stake.");
      return;
    }
    onSubmitSlip(stake);
  };

  return (
    <div id="betslip-rail" className="w-80 bg-white/5 border-l border-white/10 flex flex-col h-screen overflow-hidden backdrop-blur-xl z-10 relative">
      {/* Rail header */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-2">
          <Receipt className="w-4.5 h-4.5 text-emerald-400" />
          AI Bet Slip
        </h3>
        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider font-mono">OPTIMIZED</span>
      </div>

      {/* Main vertical content block */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* 1. Prepared AI Slip Generator area */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-black px-1">
            Active Prepared Ticket
          </div>

          {!preparedSlip ? (
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center space-y-2.5 backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto opacity-75" />
              <p className="text-slate-400 text-[11.5px] leading-relaxed font-sans max-w-[210px] mx-auto font-light">
                No active betting slips prepared. Run a **Tactical Pre-Match** review or click the in-play odds button to populate this with Gemini recommendations!
              </p>
            </div>
          ) : (
            <form onSubmit={handleConfirmSubmit} className="bg-white/10 border border-white/20 rounded-2xl p-4.5 space-y-4 shadow-lg backdrop-blur-md">
              
              {/* Slip details card header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-black bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">AI RECOMMENDED SLIP</span>
                  <div className="text-slate-400 text-[10px] font-mono mt-2">{preparedSlip.tournament}</div>
                  <div className="text-white font-display font-bold text-sm tracking-tight truncate max-w-[170px] mt-0.5">
                    {preparedSlip.homeTeam} vs {preparedSlip.awayTeam}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearPrepared}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-red-400 rounded h-7 w-7 flex items-center justify-center transition"
                  title="Discard slip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Selection lines description */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                <span className="text-[9px] text-slate-450 font-mono uppercase font-black tracking-wider block">YOUR SELECTION</span>
                <span className="text-white text-xs font-bold block mt-0.5">{preparedSlip.selection}</span>
                
                <div className="flex justify-between items-baseline mt-1.5 pt-1.5 border-t border-white/5">
                  <span className="text-[9px] text-slate-450 font-mono uppercase font-black tracking-wider">DECIMAL ODDS</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm tracking-wider">{preparedSlip.odds.toFixed(2)}</span>
                </div>
              </div>

              {/* Stake input controllers */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs text-slate-400 font-mono">
                  <span>Stake (USD)</span>
                  <span className="text-[10px] text-slate-500 font-bold">Limit: Max</span>
                </div>
                
                <div className="flex gap-1.5">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-3 flex items-center pr-2 text-slate-500 font-mono text-xs">$</span>
                    <input
                      type="number"
                      min="5"
                      max={wallet.balance}
                      value={stakeInput || ''}
                      onChange={(e) => setStakeInput(parseFloat(e.target.value))}
                      className="w-full bg-slate-950/60 text-slate-100 pl-7 pr-3 py-1.5 border border-white/10 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {/* Quick stake increment choices */}
                  <div className="flex gap-1">
                    {[10, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setStakeInput(amt)}
                        className={`px-1.5 py-1 text-[10px] font-mono border rounded-xl transition ${
                          stakeInput === amt 
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        +${amt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payout forecast */}
              <div className="flex justify-between items-center text-xs border-t border-white/10 pt-3">
                <span className="text-slate-450">Projected Return:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">${calculatedReturn.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Confirmation submission button */}
              <button
                type="submit"
                disabled={strokeAmount() <= 0 || strokeAmount() > wallet.balance}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-white/5 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 uppercase text-xs tracking-wider font-display cursor-pointer"
              >
                Confirm & Place Bet
              </button>
            </form>
          )}
        </div>

        {/* 2. Historic resolved and pending tickets ledger */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-black">
              Placement Archive Ledger ({historySlips.length})
            </span>
          </div>

          {historySlips.length === 0 ? (
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center backdrop-blur-sm">
              <span className="text-xs text-slate-500 font-sans font-light">No previous bet tickets in log.</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historySlips.map((slip) => {
                const isWon = slip.status === 'won';
                const isLost = slip.status === 'lost';
                const isPending = slip.status === 'pending';

                return (
                  <div 
                    key={slip.id} 
                    className={`p-3.5 rounded-xl border text-xs font-sans space-y-2 transition-all backdrop-blur-md ${
                      isWon 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-200' 
                        : isLost 
                        ? 'bg-white/5 border-white/10 opacity-70 text-slate-400'
                        : 'bg-blue-500/10 border-blue-500/25 text-blue-200'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-mono font-semibold text-slate-300 max-w-[130px] truncate">{slip.homeTeam} vs {slip.awayTeam}</span>
                      
                      {/* Ticket status pill */}
                      {isWon && (
                        <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-0.5">
                          <CheckCircle className="w-2.5 h-2.5" />
                          WON
                        </span>
                      )}
                      {isLost && (
                        <span className="bg-white/10 text-slate-405 font-mono text-[9px] px-1.5 py-0.5 rounded-lg border border-white/10">
                          LOST
                        </span>
                      )}
                      {isPending && (
                        <span className="bg-blue-500/20 text-blue-405 font-mono text-[9px] px-1.5 py-0.5 rounded-lg border border-blue-500/30 flex items-center gap-0.5 animate-pulse">
                          <Timer className="w-2.5 h-2.5" />
                          PENDING
                        </span>
                      )}
                    </div>

                    {/* Specific details */}
                    <div>
                      <div className="text-[10.5px] font-bold text-slate-100 block truncate">{slip.selection}</div>
                      <div className="text-[9.5px] text-slate-400 font-mono mt-0.5 flex justify-between font-light">
                        <span>Odds: {slip.odds.toFixed(2)}</span>
                        <span>Stake: ${slip.stake.toFixed(0)}</span>
                      </div>
                    </div>

                    {/* Wallet Payout receipts */}
                    <div className="pt-1.5 border-t border-white/5 flex justify-between items-center text-[10px]">
                      <span className="text-slate-500">Predicted return:</span>
                      <span className={`font-mono font-bold ${isWon ? 'text-emerald-400' : 'text-slate-300'}`}>
                        ${slip.predictedReturn.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Quick summary counters widget */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-500 uppercase font-mono font-bold tracking-wider">
        <span className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-emerald-400" /> Active Ledger</span>
        <span>Hypothetical Mode</span>
      </div>
    </div>
  );
}
