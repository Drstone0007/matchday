import React from 'react';
import { 
  Trophy, 
  Tv, 
  Receipt, 
  Wallet as WalletIcon, 
  TrendingUp, 
  History,
  Sparkles,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import { Wallet } from '../types';

interface NavMenuItem {
  id: 'explore' | 'simulation' | 'betslip';
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  badge?: string;
  count?: number;
}

interface SidebarProps {
  currentTab: 'explore' | 'simulation' | 'betslip';
  onChangeTab: (tab: 'explore' | 'simulation' | 'betslip') => void;
  wallet: Wallet;
  activeBetsCount: number;
  activeMatchName?: string;
}

export default function Sidebar({
  currentTab,
  onChangeTab,
  wallet,
  activeBetsCount,
  activeMatchName
}: SidebarProps) {
  const navItems: NavMenuItem[] = [
    {
      id: 'explore',
      name: 'Explore Tournaments',
      icon: Trophy,
      description: 'Fixtures, analysis & odds'
    },
    {
      id: 'simulation',
      name: 'Live Simulation',
      icon: Tv,
      description: activeMatchName ? `Watching: ${activeMatchName}` : 'No active game',
      badge: activeMatchName ? 'LIVE' : undefined
    },
    {
      id: 'betslip',
      name: 'Bet Slips & Ledger',
      icon: Receipt,
      description: 'Prepared slips & history',
      count: activeBetsCount
    }
  ];

  return (
    <aside id="app-sidebar" className="w-80 bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col h-screen overflow-hidden z-10 relative">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Trophy className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5 leading-none">
            MATCHDAY <span className="text-emerald-400 font-mono text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold uppercase tracking-wider">AGENT</span>
          </h1>
          <p className="text-slate-400 text-[11px] font-sans mt-1 tracking-wide uppercase font-medium text-slate-400/70">Football Betting & Tactics AI</p>
        </div>
      </div>

      {/* Wallet Status Area */}
      <div className="p-5 border-b border-white/10 bg-white/1">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md shadow-sm">
          <div className="flex justify-between items-center text-xs text-slate-450 mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-slate-400">
              <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
              Hypothetical Wallet
            </span>
            <span className="text-emerald-400/80 font-mono tracking-wider font-bold text-[10px]">SECURE</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-slate-450 text-sm font-medium">$</span>
            <span className="text-2xl font-mono font-bold text-slate-100 tracking-tight">
              {wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-500 font-mono ml-1 font-bold">{wallet.currency}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-450">
            <span className="flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              All Bets Funded Real-Time
            </span>
            <span className="text-slate-500 font-medium">Demo Bal</span>
          </div>
        </div>
      </div>

      {/* Navigation Options */}
      <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-mono tracking-widest text-slate-500 uppercase px-2 mb-3.5 font-black">
          Navigation Control
        </div>
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-white/10 text-white font-medium border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-350 bg-opacity-70'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm tracking-tight">{item.name}</div>
                  <div className="text-[11px] text-slate-400/80 mt-0.5 max-w-[170px] truncate font-light">{item.description}</div>
                </div>
              </div>

              {/* Status Badges */}
              {item.badge && (
                <span className="animate-pulse bg-emerald-500 text-white text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow">
                  {item.badge}
                </span>
              )}
              {item.count !== undefined && item.count > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Area */}
      <div className="p-4 border-t border-white/10 bg-white/1 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-[11px] bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="leading-snug text-slate-300 font-light">
            Bets are pre-arranged by the AI Agent. Review slips before submissions.
          </p>
        </div>
        <div className="text-[10px] text-slate-500 font-mono flex justify-between items-center px-1 font-medium">
          <span>MatchDay AI v1.1.2</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
            Agent Online
          </span>
        </div>
      </div>
    </aside>
  );
}
