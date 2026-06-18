import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory base matches data
interface ServerMatch {
  id: string;
  homeTeam: string;
  homeShort: string;
  awayTeam: string;
  awayShort: string;
  tournament: string;
  stage: string;
  status: 'upcoming' | 'live' | 'completed';
  date: string;
  venue: string;
  referee: string;
  colorHome: string;
  colorAway: string;
  homeScore?: number;
  awayScore?: number;
  startingOdds: {
    homeWin: number;
    draw: number;
    awayWin: number;
    over25: number;
    under25: number;
  };
}

let matches: ServerMatch[] = [
  {
    id: "match-1",
    homeTeam: "Argentina",
    homeShort: "ARG",
    awayTeam: "France",
    awayShort: "FRA",
    tournament: "World Cup 2026",
    stage: "Quarter-Finals",
    status: "upcoming",
    date: "Dec 18, 2026",
    venue: "MetLife Stadium, New Jersey",
    referee: "Szymon Marciniak",
    colorHome: "#75aadb",
    colorAway: "#0f1c3f",
    startingOdds: {
      homeWin: 2.25,
      draw: 3.10,
      awayWin: 3.40,
      over25: 1.95,
      under25: 1.85
    }
  },
  {
    id: "match-2",
    homeTeam: "Real Madrid",
    homeShort: "RMA",
    awayTeam: "Manchester City",
    awayShort: "MCI",
    tournament: "UEFA Champions League",
    stage: "Semi-Finals",
    status: "upcoming",
    date: "Jun 24, 2026",
    venue: "Santiago Bernabéu, Madrid",
    referee: "Michael Oliver",
    colorHome: "#ececec",
    colorAway: "#6caedd",
    startingOdds: {
      homeWin: 2.60,
      draw: 3.40,
      awayWin: 2.50,
      over25: 1.70,
      under25: 2.10
    }
  },
  {
    id: "match-3",
    homeTeam: "Brazil",
    homeShort: "BRA",
    awayTeam: "Germany",
    awayShort: "GER",
    tournament: "World Cup 2026",
    stage: "Group Stage - Group C",
    status: "upcoming",
    date: "Dec 10, 2026",
    venue: "Rose Bowl, Pasadena",
    referee: "Danny Makkelie",
    colorHome: "#fedf00",
    colorAway: "#111111",
    startingOdds: {
      homeWin: 1.90,
      draw: 3.30,
      awayWin: 4.20,
      over25: 1.80,
      under25: 2.00
    }
  },
  {
    id: "match-4",
    homeTeam: "Spain",
    homeShort: "ESP",
    awayTeam: "England",
    awayShort: "ENG",
    tournament: "UEFA Euro 2028",
    stage: "Group Stage - Group A",
    status: "upcoming",
    date: "Jul 12, 2028",
    venue: "Wembley Stadium, London",
    referee: "John Brooks",
    colorHome: "#c8102e",
    colorAway: "#ffffff",
    startingOdds: {
      homeWin: 2.45,
      draw: 3.00,
      awayWin: 3.10,
      over25: 2.10,
      under25: 1.70
    }
  },
  {
    id: "match-5",
    homeTeam: "USA",
    homeShort: "USA",
    awayTeam: "Mexico",
    awayShort: "MEX",
    tournament: "CONCACAF Gold Cup",
    stage: "Final",
    status: "upcoming",
    date: "Jul 26, 2026",
    venue: "SoFi Stadium, Inglewood",
    referee: "César Arturo Ramos",
    colorHome: "#022a54",
    colorAway: "#006847",
    startingOdds: {
      homeWin: 2.15,
      draw: 3.10,
      awayWin: 3.50,
      over25: 2.20,
      under25: 1.60
    }
  }
];

// Lazy Gemini Initialization helper to avoid startup crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY is not configured. Please add your key in the Secrets panel under Settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// ---------------- API ENDPOINTS ----------------

// Fetch all matches
app.get("/api/matches", (req, res) => {
  res.json(matches);
});

// Create custom match (Agent can curate or predict custom combinations)
app.post("/api/matches", (req, res) => {
  const { homeTeam, awayTeam, tournament } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "Home and Away teams are required." });
  }

  // Create clean shortnames
  const homeShort = homeTeam.slice(0, 3).toUpperCase();
  const awayShort = awayTeam.slice(0, 3).toUpperCase();
  const id = `match-${Date.now()}`;

  const newMatch = {
    id,
    homeTeam,
    homeShort,
    awayTeam,
    awayShort,
    tournament: tournament || "International Exhibition Match",
    stage: "Single Match Cup",
    status: "upcoming" as const,
    date: "Scheduled Today",
    venue: "Vibrant Arena",
    referee: "AI Assistant Referee",
    colorHome: "#3b82f6",
    colorAway: "#ef4444",
    startingOdds: {
      homeWin: parseFloat((1.5 + Math.random() * 2.5).toFixed(2)),
      draw: parseFloat((2.8 + Math.random() * 1.5).toFixed(2)),
      awayWin: parseFloat((1.5 + Math.random() * 2.5).toFixed(2)),
      over25: parseFloat((1.6 + Math.random() * 0.8).toFixed(2)),
      under25: parseFloat((1.6 + Math.random() * 0.8).toFixed(2)),
    }
  };

  matches.unshift(newMatch);
  res.json(newMatch);
});

// Pre-match analysis endpoint using Gemini
app.get("/api/matches/:id/pre-match", async (req, res) => {
  const matchId = req.params.id;
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Perform a highly detailed tactical pre-match engineering review for the football matchup:
Home Team: ${match.homeTeam}
AwayTeam: ${match.awayTeam}
Tournament/Stage: ${match.tournament} (Stage: ${match.stage})
Venue: ${match.venue}

Generate structural tactical information, projected starting lineups, battle details, win percentages, and specific betting slip suggestions with current estimated decimal odds related to match winner, total goals, or specific outcomes. Ensure the analysis has realistic tactical depth and professional sports analytics styling.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "matchId",
            "tacticalSetupHome",
            "tacticalSetupAway",
            "keyPlayersHome",
            "keyPlayersAway",
            "expectedLineupHome",
            "expectedLineupAway",
            "battleAreas",
            "winProbabilityHome",
            "winProbabilityAway",
            "drawProbability",
            "predictedScoreLine",
            "betRecommendations"
          ],
          properties: {
            matchId: { type: Type.STRING },
            tacticalSetupHome: { type: Type.STRING, description: "Home tactical playbook overview." },
            tacticalSetupAway: { type: Type.STRING, description: "Away tactical playbook overview." },
            keyPlayersHome: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "number", "position", "rating"],
                properties: {
                  name: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  position: { type: Type.STRING, description: "GK, DEF, MID, FWD" },
                  rating: { type: Type.NUMBER, description: "Current form rating 1-100" }
                }
              }
            },
            keyPlayersAway: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "number", "position", "rating"],
                properties: {
                  name: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  position: { type: Type.STRING },
                  rating: { type: Type.NUMBER }
                }
              }
            },
            expectedLineupHome: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "number", "position", "rating"],
                properties: {
                  name: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  position: { type: Type.STRING },
                  rating: { type: Type.NUMBER }
                }
              }
            },
            expectedLineupAway: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "number", "position", "rating"],
                properties: {
                  name: { type: Type.STRING },
                  number: { type: Type.INTEGER },
                  position: { type: Type.STRING },
                  rating: { type: Type.NUMBER }
                }
              }
            },
            battleAreas: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "description"],
                properties: {
                  title: { type: Type.STRING, description: "e.g., Midfield Supremacy" },
                  description: { type: Type.STRING }
                }
              }
            },
            winProbabilityHome: { type: Type.INTEGER, description: "Percentage. 0 to 100" },
            winProbabilityAway: { type: Type.INTEGER, description: "Percentage. 0 to 100" },
            drawProbability: { type: Type.INTEGER, description: "Percentage. 0 to 100" },
            predictedScoreLine: { type: Type.STRING, description: "e.g., 2-1" },
            betRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["type", "odds", "confidence", "reasoning"],
                properties: {
                  type: { type: Type.STRING, description: "Bet type like 'Match Winner: Argentina' or 'Over 2.5 Goals'" },
                  odds: { type: Type.NUMBER },
                  confidence: { type: Type.STRING, description: "high, medium, low" },
                  reasoning: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    // Ensure correct matchId
    parsedData.matchId = matchId;
    res.json(parsedData);

  } catch (error: any) {
    console.error("Error generating pre-match analysis:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI pre-match analysis" });
  }
});

// Simulate Live game stream timeline of events using Gemini
app.get("/api/matches/:id/simulate", async (req, res) => {
  const matchId = req.params.id;
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Construct an entire full-match interactive script/timeline of simulated match events for:
Home: ${match.homeTeam}
Away: ${match.awayTeam}
Tournament: ${match.tournament}

This is a simulated timeline detailing exactly what happens in the game across 90 minutes. Generate a series of 12 to 18 realistic events sequenced chronologically by "minute" from 0 to 95.
Make sure to include game essential milestones:
1. Minute 0: A 'kickoff' event.
2. An appropriate 'halftime' event around minute 45.
3. Appropriate 'substitution', 'chance', 'foul', 'corner', or 'var' events interspersed.
4. One or more 'goal' events to match a plausible scoreline. Each goal increment should correctly accumulate the currentHomeScore and currentAwayScore.
5. Minute 90+: A 'fulltime' event.
6. Provide x, y coordinates (0 to 100) on a football field for visual replay animations.
x: left goal is 0, right goal is 100. (so if home team is shooting right, home attacks are near 90-100, away attacks are near 0-10)
y: top sideline is 0, bottom sideline is 100.
7. Return a precise log of events with engaging commentary text for each, capturing drama, tactics, and playmakers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: [
              "id",
              "minute",
              "type",
              "team",
              "description",
              "currentHomeScore",
              "currentAwayScore",
              "x",
              "y"
            ],
            properties: {
              id: { type: Type.STRING },
              minute: { type: Type.INTEGER, description: "Match minute between 0 and 95" },
              type: { type: Type.STRING, description: "kickoff, goal, card_yellow, card_red, chance, substitution, var, corner, foul, halftime, fulltime" },
              team: { type: Type.STRING, description: "home, away, or none" },
              player: { type: Type.STRING, description: "Name of the key player involved (optional)" },
              assistant: { type: Type.STRING, description: "Assistant driver/passer (optional)" },
              x: { type: Type.INTEGER, description: "Strategic horizontal position 0-100 on the field." },
              y: { type: Type.INTEGER, description: "Strategic vertical position 0-100 on the field." },
              description: { type: Type.STRING, description: "Rich details of this action." },
              currentHomeScore: { type: Type.INTEGER, description: "Cumulative home goals up to this event." },
              currentAwayScore: { type: Type.INTEGER, description: "Cumulative away goals up to this event." }
            }
          }
        }
      }
    });

    const parsedEvents = JSON.parse(response.text || "[]");
    res.json(parsedEvents);

  } catch (error: any) {
    console.error("Error generating match simulation:", error);
    res.status(500).json({ error: error.message || "Failed to generate match simulation" });
  }
});

// Post-match review generation matching completed score
app.post("/api/matches/:id/post-match", async (req, res) => {
  const matchId = req.params.id;
  const match = matches.find(m => m.id === matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  const { homeScore, awayScore, events } = req.body;

  try {
    const ai = getGeminiClient();
    const prompt = `Write a comprehensive, professional post-match tactical evaluation for the recently concluded football match:
${match.homeTeam} (${homeScore}) vs ${match.awayTeam} (${awayScore})
Tournament: ${match.tournament} (Stage: ${match.stage})

Below is some of the critical timeline content that occurred in this game:
${JSON.stringify(events?.slice(-6) || [])}

Perform an expert breakdown: assign tactical playbook ratings for both managers, determine a Player of the Match with explanation, compose a professional post-match summary narrative, capture mock post-game manager press-conference quotes, and structure 3 striking media headlines.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "matchId",
            "tacticalRatingsHome",
            "tacticalRatingsAway",
            "playerOfMatch",
            "reviewParagraph",
            "managerQuotesHome",
            "managerQuotesAway",
            "pressHeadlines"
          ],
          properties: {
            matchId: { type: Type.STRING },
            tacticalRatingsHome: { type: Type.NUMBER, description: "1 to 10 scale" },
            tacticalRatingsAway: { type: Type.NUMBER, description: "1 to 10 scale" },
            playerOfMatch: {
              type: Type.OBJECT,
              required: ["name", "rating", "team", "contribution"],
              properties: {
                name: { type: Type.STRING },
                rating: { type: Type.NUMBER, description: "1 to 10 scale" },
                team: { type: Type.STRING },
                contribution: { type: Type.STRING }
              }
            },
            reviewParagraph: { type: Type.STRING, description: "Detailed summary of the tactical course." },
            managerQuotesHome: { type: Type.STRING },
            managerQuotesAway: { type: Type.STRING },
            pressHeadlines: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsedReview = JSON.parse(response.text || "{}");
    parsedReview.matchId = matchId;

    // Update match status to completed so it reflects dynamically in the match list
    match.status = "completed";
    match.homeScore = homeScore;
    match.awayScore = awayScore;

    res.json(parsedReview);

  } catch (error: any) {
    console.error("Error generating post-match review:", error);
    res.status(500).json({ error: error.message || "Failed to generate post-match tactical review" });
  }
});

// ---------------- VITE / STATIC MIDDLEWARE ----------------

async function setupHttpServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Loading Vite dev server middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static files from dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

setupHttpServer().catch(err => {
  console.error("Server boot failure:", err);
});
