export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeShort: string;
  awayShort: string;
  tournament: string;
  stage: string;
  status: 'upcoming' | 'live' | 'completed';
  date: string;
  homeScore?: number;
  awayScore?: number;
  venue: string;
  referee: string;
  colorHome: string; // Hex code for team colors
  colorAway: string;
  startingOdds: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
  };
}

export interface PlayerLineup {
  name: string;
  number: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number;
}

export interface PreMatchAnalysis {
  matchId: string;
  tacticalSetupHome: string;
  tacticalSetupAway: string;
  keyPlayersHome: PlayerLineup[];
  keyPlayersAway: PlayerLineup[];
  expectedLineupHome: PlayerLineup[];
  expectedLineupAway: PlayerLineup[];
  battleAreas: { title: string; description: string }[];
  winProbabilityHome: number;
  winProbabilityAway: number;
  drawProbability: number;
  predictedScoreLine: string;
  betRecommendations: {
    type: string;
    odds: number;
    confidence: 'high' | 'medium' | 'low';
    reasoning: string;
  }[];
}

export interface LiveEvent {
  id: string;
  minute: number;
  type: 'goal' | 'card_yellow' | 'card_red' | 'chance' | 'substitution' | 'var' | 'corner' | 'foul' | 'kickoff' | 'halftime' | 'fulltime';
  team: 'home' | 'away' | 'none';
  player?: string;
  assistant?: string;
  x: number; // 0-100 on football pitch width
  y: number; // 0-100 on football pitch height
  description: string;
  currentHomeScore: number;
  currentAwayScore: number;
}

export interface PostMatchReview {
  matchId: string;
  tacticalRatingsHome: number; // 1-10
  tacticalRatingsAway: number; // 1-10
  playerOfMatch: { name: string; rating: number; team: string; contribution: string };
  reviewParagraph: string;
  managerQuotesHome: string;
  managerQuotesAway: string;
  pressHeadlines: string[];
}

export interface BetSlip {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  tournament: string;
  selection: string; // e.g., "Argentina Win"
  market: string; // e.g., "Match Winner", "Total Goals"
  odds: number;
  stake: number;
  predictedReturn: number;
  status: 'pending' | 'won' | 'lost';
  rationale: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  currency: string;
}
