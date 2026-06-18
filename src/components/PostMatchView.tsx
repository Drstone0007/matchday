import React from 'react';
import { Match, PostMatchReview } from '../types';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Star, 
  TrendingUp, 
  Trophy, 
  Users, 
  MessageSquare,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface PostMatchViewProps {
  match: Match;
  review: PostMatchReview | null;
  loading: boolean;
  onBack: () => void;
}

export default function PostMatchView({
  match,
  review,
  loading,
  onBack
}: PostMatchViewProps) {

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] backdrop-blur-xl">
        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h3 className="text-xl font-display font-bold text-white">Drafting Post-Match Review...</h3>
        <p className="text-slate-400 text-sm mt-2 max-w-sm font-light leading-relaxed">
          MATCHDAY AI agent is reviewing the match event log, calculating managers&apos; tactical implementation scores, and analyzing player performance stats.
        </p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center min-h-[400px] flex flex-col justify-center items-center backdrop-blur-xl">
        <p className="text-slate-400 font-sans mb-4 font-light">No post-match tactical evaluation report generated for this completed matchup.</p>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Return header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/15 active:scale-95 text-slate-350 font-sans text-xs font-semibold px-4 py-2.5 rounded-xl border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <span className="text-[10px] text-emerald-400 font-mono font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-md">COMPLETED SUMMARY REPORT</span>
      </div>

      {/* Finished score header board */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 backdrop-blur-md">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">Official Scorecard Review</span>
          <h2 className="text-xl font-display font-extrabold text-white tracking-tight mt-1">
            {match.homeTeam} vs {match.awayTeam}
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-light">{match.tournament} • Played at {match.venue}</p>
        </div>

        {/* Big centered scoreboard */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <span className="font-display font-medium text-slate-450 text-xs block uppercase">{match.homeShort}</span>
            <span className="font-display font-black text-white text-3xl">{match.homeScore}</span>
          </div>

          <div className="bg-slate-950/60 px-3 py-1 rounded-lg border border-white/10 font-mono text-emerald-500 text-xs uppercase font-bold select-none">
            FT
          </div>

          <div>
            <span className="font-display font-medium text-slate-450 text-xs block uppercase">{match.awayShort}</span>
            <span className="font-display font-black text-white text-3xl">{match.awayScore}</span>
          </div>
        </div>
      </div>

      {/* Media Headlines columns banner */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3.5 shadow-lg backdrop-blur-xl">
        <h3 className="font-display font-extrabold text-white text-xs uppercase tracking-widest font-mono">Press & Media Outlines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {review.pressHeadlines.map((headline, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950/45 border border-white/5 rounded-xl relative overflow-hidden flex flex-col justify-between">
              <span className="absolute top-1 right-2 p-1 font-mono text-[9px] text-white/10 font-black italic select-none">DAILY TIMES</span>
              <p className="font-display font-bold text-sm text-slate-200 leading-snug pt-1 relative z-10 font-sans">
                &ldquo;{headline}&rdquo;
              </p>
              <span className="text-[9.5px] text-slate-500 mt-3 block font-mono font-bold uppercase tracking-wider">Section: Sports Highlights</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main post match breakdown grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Narrative and Manager block Col */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Narrative summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3.5 backdrop-blur-xl">
            <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Tactical Game Narrative Course
            </h3>
            <p className="text-[12.8px] text-slate-350 leading-relaxed font-sans font-light">
              {review.reviewParagraph}
            </p>
          </div>

          {/* Press Quotes block */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
            <h3 className="font-display font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Manager Post-Game Outlines
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 italic relative">
                <span className="absolute top-1 right-2.5 font-sans font-black text-2xl text-slate-750 leading-none select-none">&ldquo;</span>
                <div className="text-[9px] text-slate-500 font-mono uppercase mb-1.5 font-bold tracking-wider">{match.homeTeam} Head Coach</div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 relative z-10 font-sans font-light">
                  {review.managerQuotesHome}
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-white/5 italic relative">
                <span className="absolute top-1 right-2.5 font-sans font-black text-2xl text-slate-750 leading-none select-none">&ldquo;</span>
                <div className="text-[9px] text-slate-500 font-mono uppercase mb-1.5 font-bold tracking-wider">{match.awayTeam} Head Coach</div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1 relative z-10 font-sans font-light">
                  {review.managerQuotesAway}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Player of Match & Manager Ratings sidebar Col */}
        <div className="space-y-6">

          {/* Player of Match Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-3.5 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"></div>
            
            <span className="bg-emerald-500/20 text-emerald-450 text-[9.5px] font-mono px-2 py-0.5 rounded-lg border border-emerald-500/20 font-bold uppercase tracking-wider flex items-center gap-1 w-max">
              <Award className="w-3.5 h-3.5" />
              Official Man of Match
            </span>

            <div className="pt-3">
              <div className="flex justify-between items-baseline">
                <span className="font-display font-extrabold text-white text-lg tracking-tight">
                  {review.playerOfMatch.name}
                </span>

                <div className="flex items-center gap-1 bg-slate-950/60 border border-white/5 py-1 px-2 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-mono text-xs text-slate-200 font-bold">{review.playerOfMatch.rating.toFixed(1)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-450 font-mono mt-0.5">Team: {review.playerOfMatch.team}</p>
            </div>

            <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans pt-1 border-t border-white/5 font-light">
              {review.playerOfMatch.contribution}
            </p>
          </div>

          {/* Managers tactical ratings meters */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4 backdrop-blur-xl">
            <h3 className="font-display font-bold text-white text-sm">Manager Tactical Execution</h3>
            
            <div className="space-y-3.5 pt-1">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300 font-semibold">
                  <span className="truncate">{match.homeTeam} playbook efficiency</span>
                  <span className="text-emerald-400">{(review.tacticalRatingsHome).toFixed(1)}/10</span>
                </div>
                <div className="h-1.5 bg-slate-950/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${review.tacticalRatingsHome * 10}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1 text-slate-300 font-semibold">
                  <span className="truncate">{match.awayTeam} playbook efficiency</span>
                  <span className="text-emerald-450">{(review.tacticalRatingsAway).toFixed(1)}/10</span>
                </div>
                <div className="h-1.5 bg-slate-950/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${review.tacticalRatingsAway * 10}%` }}></div>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] text-slate-450 leading-snug font-sans font-light">
              Tactical ratings represent how effectively the designated head coaches customized systems, responded to mid-game yellow cards, or maximized corner play options.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
