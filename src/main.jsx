import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./supabase";
import "./styles.css";

const ODDS_API_BASE = "/api/odds/v4";
const POLYMARKET_GAMMA_BASE = "/api/polymarket";
const REPORT_STORAGE_KEY = "oddstable-community-reports";
const API_KEY_STORAGE_KEY = "oddstable-odds-api-key";
const ENV_ODDS_API_KEY = import.meta.env.VITE_ODDS_API_KEY || "";

const demoPredictionMarkets = [
  {
    id: "pm-1",
    event: "Will the Fed cut rates by June?",
    outcome: "Yes",
    bestYesPlatform: "Polymarket",
    bestYesPrice: 0.42,
    bestNoPlatform: "Kalshi",
    bestNoPrice: 0.55,
    volume: "$4.2M",
    spread: "3c",
    updated: "Demo",
    arb: 0.03,
    note: "Buy YES at 42c and NO at 55c for a 3c theoretical lock before fees."
  },
  {
    id: "pm-2",
    event: "NBA champion: Boston",
    outcome: "Yes",
    bestYesPlatform: "Kalshi",
    bestYesPrice: 0.31,
    bestNoPlatform: "Polymarket",
    bestNoPrice: 0.66,
    volume: "$890K",
    spread: "4c",
    updated: "Demo",
    arb: 0.03,
    note: "Cross-venue prices imply a small arb if contract terms match exactly."
  },
  {
    id: "pm-3",
    event: "Bitcoin above $100k on Dec 31?",
    outcome: "Yes",
    bestYesPlatform: "Polymarket",
    bestYesPrice: 0.58,
    bestNoPlatform: "Kalshi",
    bestNoPrice: 0.44,
    volume: "$11.8M",
    spread: "2c",
    updated: "Demo",
    arb: -0.02,
    note: "No lock yet; watch for a cross below $1.00 after fees."
  }
];

const sportMarkets = [
  {
    id: 1,
    game: "Knights at Aces",
    category: "Basketball",
    market: "Spread",
    target: "Aces -4.5",
    bestOdds: -104,
    book: "Northline",
    runnerUp: "SummitBet -108",
    edge: "+2.1%",
    payout: "$196.15",
    distance: "Online",
    region: "NV",
    freshness: "12 sec",
    confidence: 94
  },
  {
    id: 2,
    game: "Seattle at Dallas",
    category: "Baseball",
    market: "Moneyline",
    target: "Seattle",
    bestOdds: 132,
    book: "Harbor Sports",
    runnerUp: "Fanfront +128",
    edge: "+1.6%",
    payout: "$232.00",
    distance: "Online",
    region: "NJ",
    freshness: "21 sec",
    confidence: 91
  },
  {
    id: 3,
    game: "Vancouver at LA",
    category: "Hockey",
    market: "Total",
    target: "Over 5.5",
    bestOdds: 108,
    book: "MetroOdds",
    runnerUp: "Northline +105",
    edge: "+1.1%",
    payout: "$208.00",
    distance: "Online",
    region: "PA",
    freshness: "38 sec",
    confidence: 88
  },
  {
    id: 4,
    game: "Madrid vs Milan",
    category: "Soccer",
    market: "Draw no bet",
    target: "Madrid",
    bestOdds: -118,
    book: "SummitBet",
    runnerUp: "Harbor Sports -122",
    edge: "+0.9%",
    payout: "$184.75",
    distance: "Online",
    region: "CO",
    freshness: "44 sec",
    confidence: 86
  }
];

const casinoOdds = [
  {
    id: 101,
    game: "Blackjack",
    category: "Table odds",
    market: "Rules",
    venue: "Silver Mesa Casino",
    city: "Las Vegas, NV",
    best: "3:2, S17",
    detail: "Double after split, late surrender",
    playerEdge: "0.42% house edge",
    minimum: 10,
    confidence: 96,
    freshness: "4 min"
  },
  {
    id: 102,
    game: "Craps",
    category: "Table odds",
    market: "Odds multiple",
    venue: "Canyon Club",
    city: "Henderson, NV",
    best: "10x odds",
    detail: "$5 pass line with full odds",
    playerEdge: "0.18% blended edge",
    minimum: 5,
    confidence: 92,
    freshness: "6 min"
  },
  {
    id: 103,
    game: "Roulette",
    category: "Table odds",
    market: "Wheel type",
    venue: "Marina Bay Room",
    city: "Atlantic City, NJ",
    best: "Single zero",
    detail: "La partage on even-money bets",
    playerEdge: "1.35% house edge",
    minimum: 15,
    confidence: 89,
    freshness: "9 min"
  },
  {
    id: 104,
    game: "Baccarat",
    category: "Table odds",
    market: "Commission",
    venue: "Red Rock Hall",
    city: "Las Vegas, NV",
    best: "No commission",
    detail: "Banker wins on 6 pay 1:2",
    playerEdge: "1.46% banker edge",
    minimum: 25,
    confidence: 86,
    freshness: "11 min"
  },
  {
    id: 105,
    game: "Video Poker",
    category: "Machine odds",
    market: "Paytable",
    venue: "Fremont Hotel",
    city: "Las Vegas, NV",
    best: "9/6 Jacks or Better",
    detail: "Full-pay machine bank near west bar",
    playerEdge: "99.54% optimal return",
    minimum: 1,
    confidence: 84,
    freshness: "18 min"
  },
  {
    id: 106,
    game: "Ultimate Hold'em",
    category: "Table odds",
    market: "Trips paytable",
    venue: "Park MGM",
    city: "Las Vegas, NV",
    best: "Trips 50-40-30",
    detail: "$10 ante, $5 trips minimum",
    playerEdge: "Better side-bet schedule",
    minimum: 10,
    confidence: 81,
    freshness: "24 min"
  }
];

const tableMarkets = [
  {
    id: 11,
    venue: "Silver Mesa Casino",
    city: "Las Vegas, NV",
    game: "Blackjack",
    rules: "3:2, S17, DAS",
    minimum: 10,
    max: "$2,000",
    wait: "8 min",
    tables: 6,
    advantage: "Best rules",
    distance: "1.8 mi",
    vibe: "Calm",
    openSeats: 14,
    updated: "4 min"
  },
  {
    id: 12,
    venue: "Canyon Club",
    city: "Henderson, NV",
    game: "Craps",
    rules: "10x odds",
    minimum: 5,
    max: "$5,000",
    wait: "Walk up",
    tables: 3,
    advantage: "Lowest min",
    distance: "8.4 mi",
    vibe: "Lively",
    openSeats: 8,
    updated: "6 min"
  },
  {
    id: 13,
    venue: "Marina Bay Room",
    city: "Atlantic City, NJ",
    game: "Roulette",
    rules: "Single zero",
    minimum: 15,
    max: "$1,500",
    wait: "14 min",
    tables: 2,
    advantage: "Single zero",
    distance: "3.2 mi",
    vibe: "Quiet",
    openSeats: 5,
    updated: "9 min"
  },
  {
    id: 14,
    venue: "Union Station Poker",
    city: "Philadelphia, PA",
    game: "Poker",
    rules: "1/3 NLH",
    minimum: 100,
    max: "$500 buy-in",
    wait: "22 min",
    tables: 11,
    advantage: "Most tables",
    distance: "5.7 mi",
    vibe: "Busy",
    openSeats: 3,
    updated: "3 min"
  },
  {
    id: 15,
    venue: "Red Rock Hall",
    city: "Las Vegas, NV",
    game: "Baccarat",
    rules: "Midi, no commission",
    minimum: 25,
    max: "$10,000",
    wait: "Walk up",
    tables: 4,
    advantage: "No commission",
    distance: "11.1 mi",
    vibe: "Calm",
    openSeats: 9,
    updated: "11 min"
  }
];

const regions = ["All", "NV", "NJ", "PA", "CO"];
const gameTypes = ["All", "Blackjack", "Craps", "Roulette", "Poker", "Baccarat", "Video Poker", "Ultimate Hold'em"];
const sports = ["All", "Basketball", "Baseball", "Hockey", "Soccer"];
const casinoGames = ["All", "Blackjack", "Craps", "Roulette", "Baccarat", "Video Poker", "Ultimate Hold'em"];
const seedReports = [
  {
    id: "r1",
    type: "Cheap table",
    venue: "Canyon Club",
    game: "Craps",
    value: "$5 min / 10x odds",
    note: "Walk-up table on the east pit.",
    age: "6 min ago",
    trust: 94,
    status: "Verified",
    confirmations: 7
  },
  {
    id: "r2",
    type: "Good odds",
    venue: "Fremont Hotel",
    game: "Video Poker",
    value: "9/6 Jacks or Better",
    note: "Two machines open near the west bar.",
    age: "18 min ago",
    trust: 82,
    status: "Needs review",
    confirmations: 3
  }
];

function americanToDecimal(odds) {
  return odds > 0 ? (1 + odds / 100).toFixed(2) : (1 + 100 / Math.abs(odds)).toFixed(2);
}

function getStoredValue(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function getStoredReports() {
  try {
    const storedReports = localStorage.getItem(REPORT_STORAGE_KEY);
    return storedReports ? JSON.parse(storedReports) : seedReports;
  } catch {
    return seedReports;
  }
}

function rowToReport(row) {
  return {
    id: row.id,
    type: row.type,
    venue: row.venue,
    game: row.game,
    value: row.value,
    note: row.note,
    age: formatFreshness(row.created_at) === "live" ? "just now" : `${formatFreshness(row.created_at)} ago`,
    trust: row.trust,
    status: row.status,
    confirmations: row.confirmations
  };
}

function formatFreshness(dateText) {
  if (!dateText) {
    return "live";
  }

  const ageMs = Date.now() - new Date(dateText).getTime();
  if (Number.isNaN(ageMs) || ageMs < 0) {
    return "live";
  }

  const ageMinutes = Math.max(1, Math.round(ageMs / 60000));
  return ageMinutes < 60 ? `${ageMinutes} min` : `${Math.round(ageMinutes / 60)} hr`;
}

function reportToTable(report, index) {
  const parsedMinimum = Number(report.value.match(/\$?(\d+)/)?.[1] || 25);
  return {
    id: `report-table-${report.id}`,
    venue: report.venue,
    city: "User reported",
    game: report.game,
    rules: report.value,
    minimum: parsedMinimum,
    max: "Reported",
    wait: report.status,
    tables: Math.max(1, report.confirmations || 1),
    advantage: report.type,
    distance: `${report.trust || 60}% trust`,
    vibe: "Community",
    openSeats: report.confirmations || 1,
    updated: report.age || `${index + 1} min`
  };
}

function reportToCasinoOdds(report) {
  const parsedMinimum = Number(report.value.match(/\$?(\d+)/)?.[1] || 25);
  return {
    id: `report-odds-${report.id}`,
    game: report.game,
    category: "User report",
    market: report.type,
    venue: report.venue,
    city: "User reported",
    best: report.value,
    detail: report.note,
    playerEdge: `${report.trust || 60}% trust`,
    minimum: parsedMinimum,
    confidence: report.trust || 60,
    freshness: report.age || "just now"
  };
}

function normalizeOddsApiEvents(events) {
  return events
    .flatMap((event) => {
      const eventName = `${event.away_team} at ${event.home_team}`;
      const offers = new Map();

      event.bookmakers?.forEach((bookmaker) => {
        bookmaker.markets?.forEach((market) => {
          market.outcomes?.forEach((outcome) => {
            const target = `${outcome.name}${outcome.point ? ` ${outcome.point > 0 ? "+" : ""}${outcome.point}` : ""}`;
            const key = `${event.id}-${market.key}-${target}`;
            const current = offers.get(key);
            if (!current || outcome.price > current.bestOdds) {
              offers.set(key, {
                id: key,
                game: eventName,
                category: event.sport_title || "Sports",
                market: market.key === "h2h" ? "Moneyline" : market.key === "spreads" ? "Spread" : "Total",
                target,
                bestOdds: outcome.price,
                book: bookmaker.title,
                runnerUp: `Updated ${formatFreshness(bookmaker.last_update)} ago`,
                edge: "Live",
                payout: "$0.00",
                distance: "Online",
                region: "API",
                freshness: formatFreshness(bookmaker.last_update),
                confidence: 90
              });
            }
          });
        });
      });

      return [...offers.values()];
    })
    .sort((a, b) => b.bestOdds - a.bestOdds)
    .slice(0, 18);
}

function parseMarketArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    return JSON.parse(value || "[]");
  } catch {
    return [];
  }
}

function normalizePolymarketMarkets(markets) {
  return markets
    .map((market) => {
      const outcomes = parseMarketArray(market.outcomes);
      const prices = parseMarketArray(market.outcomePrices).map(Number);
      const yesIndex = outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "yes");
      const noIndex = outcomes.findIndex((outcome) => String(outcome).toLowerCase() === "no");
      const yesPrice = prices[yesIndex >= 0 ? yesIndex : 0];
      const noPrice = prices[noIndex >= 0 ? noIndex : 1];

      return {
        id: market.id,
        event: market.question,
        outcome: "Yes",
        bestYesPlatform: "Polymarket",
        bestYesPrice: Number.isFinite(yesPrice) ? yesPrice : Number(market.bestAsk || market.lastTradePrice || 0),
        bestNoPlatform: "Needs 2nd venue",
        bestNoPrice: Number.isFinite(noPrice) ? noPrice : Math.max(0, 1 - Number(market.bestBid || 0)),
        volume: `$${Math.round(Number(market.volumeNum || market.volume || 0)).toLocaleString()}`,
        spread: `${Math.round(Number(market.spread || 0) * 100)}c`,
        updated: `${formatFreshness(market.updatedAt)} ago`,
        arb: 1 - (Number.isFinite(yesPrice) ? yesPrice : 0) - (Number.isFinite(noPrice) ? noPrice : 0),
        note: "Live Polymarket price. Add Kalshi/CLOB orderbooks to confirm cross-venue arb."
      };
    })
    .filter((market) => market.event && market.bestYesPrice > 0)
    .slice(0, 18);
}

function App() {
  const [mode, setMode] = useState("tables");
  const [useDemoData, setUseDemoData] = useState(true);
  const [oddsApiKey, setOddsApiKey] = useState(() => getStoredValue(API_KEY_STORAGE_KEY, ENV_ODDS_API_KEY));
  const [apiMarkets, setApiMarkets] = useState([]);
  const [apiStatus, setApiStatus] = useState(
    ENV_ODDS_API_KEY ? "Environment API key found. Refresh live odds." : "No sportsbook API key connected yet."
  );
  const [apiMeta, setApiMeta] = useState(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [predictionMarkets, setPredictionMarkets] = useState([]);
  const [predictionStatus, setPredictionStatus] = useState("Refresh Polymarket for public live contract prices.");
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const [reportStatus, setReportStatus] = useState(
    supabase ? "Loading shared reports..." : "Using browser-local reports."
  );
  const [region, setRegion] = useState("All");
  const [tableGame, setTableGame] = useState("All");
  const [sport, setSport] = useState("All");
  const [casinoGame, setCasinoGame] = useState("All");
  const [oddsType, setOddsType] = useState("sportsbook");
  const [maxMinimum, setMaxMinimum] = useState(25);
  const [minConfidence, setMinConfidence] = useState(85);
  const [stake, setStake] = useState(100);
  const [query, setQuery] = useState("");
  const [reports, setReports] = useState(() => (supabase ? [] : getStoredReports()));
  const [reportDraft, setReportDraft] = useState({
    type: "Cheap table",
    venue: "",
    game: "Blackjack",
    value: "",
    note: ""
  });

  const tableSource = useDemoData ? tableMarkets : reports.map(reportToTable);
  const sportsbookSource = useDemoData ? sportMarkets : apiMarkets;
  const casinoOddsSource = useDemoData ? casinoOdds : reports.map(reportToCasinoOdds);
  const predictionSource = useDemoData ? demoPredictionMarkets : predictionMarkets;

  React.useEffect(() => {
    if (supabase) {
      return;
    }

    try {
      localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Local storage can be unavailable in private browsing.
    }
  }, [reports]);

  React.useEffect(() => {
    async function loadSharedReports() {
      if (!supabase) {
        return;
      }

      const { data, error } = await supabase
        .from("oddstable_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        setReportStatus(`Shared reports unavailable: ${error.message}`);
        return;
      }

      setReports(data.map(rowToReport));
      setReportStatus(
        data.length
          ? "Shared report feed is live."
          : "Shared report feed is live, but no real user reports have been submitted yet."
      );
    }

    loadSharedReports();
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, oddsApiKey);
    } catch {
      // Local storage can be unavailable in private browsing.
    }
  }, [oddsApiKey]);

  React.useEffect(() => {
    if (!useDemoData && mode === "odds" && oddsType === "sportsbook" && oddsApiKey.trim() && !apiMarkets.length) {
      refreshLiveOdds();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useDemoData, mode, oddsType]);

  async function refreshLiveOdds() {
    if (!oddsApiKey.trim()) {
      setApiStatus("Add a The Odds API key to pull current sportsbook odds.");
      setApiMarkets([]);
      return;
    }

    setIsLoadingApi(true);
    setApiStatus("Fetching current sportsbook odds...");

    try {
      const params = new URLSearchParams({
        apiKey: oddsApiKey.trim(),
        regions: "us",
        markets: "h2h,spreads,totals",
        oddsFormat: "american",
        dateFormat: "iso"
      });
      const response = await fetch(`${ODDS_API_BASE}/sports/upcoming/odds?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `Odds API returned ${response.status}`);
      }

      const normalizedMarkets = normalizeOddsApiEvents(payload);
      setApiMarkets(normalizedMarkets);
      setApiMeta({
        remaining: response.headers.get("x-requests-remaining"),
        used: response.headers.get("x-requests-used"),
        last: response.headers.get("x-requests-last"),
        checkedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      });
      setApiStatus(
        normalizedMarkets.length
          ? `Loaded ${normalizedMarkets.length} current sportsbook markets.`
          : "Connected, but no current odds were returned for upcoming US markets."
      );
    } catch (error) {
      setApiMarkets([]);
      setApiStatus(error.message || "Could not fetch live sportsbook odds.");
    } finally {
      setIsLoadingApi(false);
    }
  }

  async function refreshPredictionMarkets() {
    setIsLoadingPredictions(true);
    setPredictionStatus("Fetching live Polymarket contracts...");

    try {
      const params = new URLSearchParams({
        active: "true",
        closed: "false",
        limit: "30"
      });
      const response = await fetch(`${POLYMARKET_GAMMA_BASE}/markets?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || `Polymarket returned ${response.status}`);
      }

      const normalizedMarkets = normalizePolymarketMarkets(payload);
      setPredictionMarkets(normalizedMarkets);
      setPredictionStatus(
        normalizedMarkets.length
          ? `Loaded ${normalizedMarkets.length} live Polymarket contracts.`
          : "Connected, but no active prediction markets were returned."
      );
    } catch (error) {
      setPredictionMarkets([]);
      setPredictionStatus(error.message || "Could not fetch prediction-market data.");
    } finally {
      setIsLoadingPredictions(false);
    }
  }

  const filteredTables = useMemo(() => {
    return tableSource.filter((table) => {
      const matchesRegion = region === "All" || table.city.includes(region);
      const matchesGame = tableGame === "All" || table.game === tableGame;
      const matchesMinimum = table.minimum <= maxMinimum || table.game === "Poker";
      const matchesQuery = `${table.venue} ${table.city} ${table.rules}`.toLowerCase().includes(query.toLowerCase());
      return matchesRegion && matchesGame && matchesMinimum && matchesQuery;
    });
  }, [tableSource, region, tableGame, maxMinimum, query]);

  const filteredOdds = useMemo(() => {
    return sportsbookSource.filter((market) => {
      const matchesRegion = region === "All" || market.region === region || market.region === "API";
      const matchesSport = sport === "All" || market.category === sport;
      const matchesConfidence = market.confidence >= minConfidence;
      const matchesQuery = `${market.game} ${market.target} ${market.book}`.toLowerCase().includes(query.toLowerCase());
      return matchesRegion && matchesSport && matchesConfidence && matchesQuery;
    });
  }, [sportsbookSource, region, sport, minConfidence, query]);

  const filteredCasinoOdds = useMemo(() => {
    return casinoOddsSource.filter((market) => {
      const matchesRegion = region === "All" || market.city.includes(region);
      const matchesGame = casinoGame === "All" || market.game === casinoGame;
      const matchesMinimum = market.minimum <= maxMinimum;
      const matchesConfidence = market.confidence >= minConfidence;
      const matchesQuery = `${market.game} ${market.market} ${market.venue} ${market.best}`
        .toLowerCase()
        .includes(query.toLowerCase());
      return matchesRegion && matchesGame && matchesMinimum && matchesConfidence && matchesQuery;
    });
  }, [casinoOddsSource, region, casinoGame, maxMinimum, minConfidence, query]);

  const activeOdds = oddsType === "sportsbook" ? filteredOdds : filteredCasinoOdds;
  const filteredPredictions = useMemo(() => {
    return predictionSource.filter((market) =>
      `${market.event} ${market.bestYesPlatform} ${market.bestNoPlatform}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [predictionSource, query]);
  const activeCount = mode === "tables" ? filteredTables.length : mode === "odds" ? activeOdds.length : filteredPredictions.length;

  function submitReport(event) {
    event.preventDefault();
    if (!reportDraft.venue.trim() || !reportDraft.value.trim()) {
      return;
    }

    const nextReport = {
      id: crypto.randomUUID(),
      ...reportDraft,
      venue: reportDraft.venue.trim(),
      value: reportDraft.value.trim(),
      note: reportDraft.note.trim() || "No extra notes.",
      age: "just now",
      trust: 62,
      status: "Pending moderation",
      confirmations: 1
    };

    setReports((current) => [nextReport, ...current]);
    setReportDraft((current) => ({ ...current, venue: "", value: "", note: "" }));

    if (supabase) {
      supabase
        .from("oddstable_reports")
        .insert({
          type: nextReport.type,
          venue: nextReport.venue,
          game: nextReport.game,
          value: nextReport.value,
          note: nextReport.note
        })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            setReportStatus(`Saved locally, but shared save failed: ${error.message}`);
            return;
          }

          setReports((current) => [rowToReport(data), ...current.filter((report) => report.id !== nextReport.id)]);
          setReportStatus("Report submitted to the shared feed.");
        });
    }
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">21+ comparison workspace</p>
          <h1>Best Value Betting</h1>
        </div>
        <div className="status-cluster" aria-label="feed health">
          <span className="pulse" />
          <span>{useDemoData ? "Demo feeds loaded" : "API mode ready"}</span>
          <strong>{activeCount} matches</strong>
          <label className="demo-switch">
            <input
              type="checkbox"
              checked={useDemoData}
              onChange={(event) => setUseDemoData(event.target.checked)}
            />
            <span>{useDemoData ? "Demo" : "API"}</span>
          </label>
        </div>
      </section>

      <section className="workspace">
        <aside className="control-panel" aria-label="search controls">
          <div className="brand-mark" aria-hidden="true">
            <div className="chip-stack">
              <span />
              <span />
              <span />
            </div>
            <div className="card-fan">
              <span />
              <span />
            </div>
          </div>

          <div className="mode-toggle" role="tablist" aria-label="finder mode">
            <button className={mode === "tables" ? "active" : ""} onClick={() => setMode("tables")}>
              Tables
            </button>
            <button className={mode === "odds" ? "active" : ""} onClick={() => setMode("odds")}>
              Odds
            </button>
            <button className={mode === "predictions" ? "active" : ""} onClick={() => setMode("predictions")}>
              Predictions
            </button>
          </div>

          <label className="field">
            <span>Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                mode === "tables"
                  ? "venue, city, rules"
                  : mode === "predictions"
                    ? "contract, platform, event"
                    : "team, game, book, rules"
              }
            />
          </label>

          {mode !== "predictions" && (
            <label className="field">
              <span>Region</span>
              <select value={region} onChange={(event) => setRegion(event.target.value)}>
                {regions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          )}

          {mode === "tables" ? (
            <>
              <label className="field">
                <span>Game</span>
                <select value={tableGame} onChange={(event) => setTableGame(event.target.value)}>
                  {gameTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Max minimum ${maxMinimum}</span>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={maxMinimum}
                  onChange={(event) => setMaxMinimum(Number(event.target.value))}
                />
              </label>
            </>
          ) : mode === "odds" ? (
            <>
              <div className="sub-toggle" role="tablist" aria-label="odds source">
                <button className={oddsType === "sportsbook" ? "active" : ""} onClick={() => setOddsType("sportsbook")}>
                  Sportsbooks
                </button>
                <button className={oddsType === "casino" ? "active" : ""} onClick={() => setOddsType("casino")}>
                  Game Odds
                </button>
              </div>

              <label className="field">
                <span>{oddsType === "sportsbook" ? "Sport" : "Game"}</span>
                <select
                  value={oddsType === "sportsbook" ? sport : casinoGame}
                  onChange={(event) =>
                    oddsType === "sportsbook" ? setSport(event.target.value) : setCasinoGame(event.target.value)
                  }
                >
                  {(oddsType === "sportsbook" ? sports : casinoGames).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Minimum confidence {minConfidence}%</span>
                <input
                  type="range"
                  min="70"
                  max="98"
                  value={minConfidence}
                  onChange={(event) => setMinConfidence(Number(event.target.value))}
                />
              </label>
              <label className="field">
                <span>Stake ${stake}</span>
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={stake}
                  onChange={(event) => setStake(Number(event.target.value) || 0)}
                />
              </label>
            </>
          ) : (
            <>
              <div className="api-panel">
                <p className="eyebrow">prediction-market data</p>
                <button onClick={refreshPredictionMarkets} disabled={isLoadingPredictions || useDemoData}>
                  {isLoadingPredictions ? "Refreshing..." : "Refresh Polymarket"}
                </button>
                <p>{useDemoData ? "Turn Demo off to pull public Polymarket contracts." : predictionStatus}</p>
                <small>Kalshi orderbooks need signed API auth, so they are modeled as the next connector.</small>
              </div>
              <label className="field">
                <span>Stake ${stake}</span>
                <input
                  type="number"
                  min="5"
                  max="10000"
                  value={stake}
                  onChange={(event) => setStake(Number(event.target.value) || 0)}
                />
              </label>
            </>
          )}

          <div className="alert-builder">
            <span>Alert rule</span>
            <strong>
              {mode === "tables"
                ? `Notify when ${tableGame} is $${maxMinimum} or less`
                : mode === "predictions"
                  ? "Notify when YES + NO costs less than $1.00"
                  : oddsType === "sportsbook"
                    ? `Notify on ${sport} edges above ${minConfidence}%`
                    : `Notify on ${casinoGame} odds at $${maxMinimum} or less`}
            </strong>
          </div>

          {!useDemoData && mode === "odds" && (
            <div className="api-panel">
              <p className="eyebrow">live sportsbook API</p>
              <label className="field">
                <span>The Odds API key</span>
                <input
                  value={oddsApiKey}
                  onChange={(event) => setOddsApiKey(event.target.value)}
                  placeholder="Paste API key"
                  type="password"
                />
              </label>
              <button onClick={refreshLiveOdds} disabled={isLoadingApi}>
                {isLoadingApi ? "Refreshing..." : "Refresh live odds"}
              </button>
              <p>{apiStatus}</p>
              {apiMeta && (
                <small>
                  Checked {apiMeta.checkedAt}
                  {apiMeta.remaining ? ` / ${apiMeta.remaining} credits left` : ""}
                </small>
              )}
            </div>
          )}
        </aside>

        <section className="results-panel">
          <div className="results-header">
            <div>
              <p className="eyebrow">
                {mode === "tables"
                  ? "casino floor scan"
                  : mode === "predictions"
                    ? "contract pricing scan"
                    : oddsType === "sportsbook"
                      ? "sportsbook scan"
                      : "game odds scan"}
              </p>
              <h2>
                {mode === "tables"
                  ? "Cheapest live tables"
                  : mode === "predictions"
                    ? "Prediction-market arbitrage"
                    : oddsType === "sportsbook"
                      ? "Best available odds"
                      : "Best casino game odds"}
              </h2>
            </div>
            <div className="sort-pill">Sorted by expected value</div>
          </div>

          {!useDemoData && (
            <div className="live-source-strip">
              <div>
                <strong>Sportsbook odds</strong>
                <span>{apiMarkets.length ? `${apiMarkets.length} live markets loaded` : oddsApiKey.trim() ? apiStatus : "Needs The Odds API key"}</span>
              </div>
              <div>
                <strong>Table reports</strong>
                <span>{reports.length ? `${reports.length} shared reports loaded` : "Connected to Supabase, no reports yet"}</span>
              </div>
              <div>
                <strong>Casino game odds</strong>
                <span>{reports.length ? "Built from user reports" : "Waiting for user reports"}</span>
              </div>
            </div>
          )}

          {mode === "tables" ? (
            filteredTables.length ? (
              <div className="table-grid">
                {filteredTables.map((table) => (
                <article className="result-card table-card" key={table.id}>
                  <div className="card-topline">
                    <span>{table.advantage}</span>
                    <small>Updated {table.updated} ago</small>
                  </div>
                  <h3>{table.venue}</h3>
                  <p>{table.city}</p>
                  <div className="price-row">
                    <strong>${table.minimum}</strong>
                    <span>{table.game}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Rules</dt>
                      <dd>{table.rules}</dd>
                    </div>
                    <div>
                      <dt>Wait</dt>
                      <dd>{table.wait}</dd>
                    </div>
                    <div>
                      <dt>Tables</dt>
                      <dd>{table.tables}</dd>
                    </div>
                    <div>
                      <dt>Seats</dt>
                      <dd>{table.openSeats}</dd>
                    </div>
                  </dl>
                  <div className="card-actions">
                    <button>Track</button>
                    <button className="secondary">{table.distance}</button>
                  </div>
                </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No real table reports yet"
                copy="The table section is connected to the shared Supabase report feed. It will display live user-submitted table minimums as soon as someone reports one."
              />
            )
          ) : mode === "predictions" ? (
            filteredPredictions.length ? (
              <div className="prediction-grid">
                {filteredPredictions.map((market) => {
                  const totalCost = market.bestYesPrice + market.bestNoPrice;
                  const lockProfit = Math.max(0, 1 - totalCost);
                  return (
                    <article className="result-card prediction-card" key={market.id}>
                      <div className="card-topline">
                        <span>{lockProfit > 0 ? "Arb candidate" : "Watchlist"}</span>
                        <small>{market.updated}</small>
                      </div>
                      <h3>{market.event}</h3>
                      <div className="contract-prices">
                        <div>
                          <span>Best YES</span>
                          <strong>{Math.round(market.bestYesPrice * 100)}c</strong>
                          <small>{market.bestYesPlatform}</small>
                        </div>
                        <div>
                          <span>Best NO</span>
                          <strong>{Math.round(market.bestNoPrice * 100)}c</strong>
                          <small>{market.bestNoPlatform}</small>
                        </div>
                        <div>
                          <span>Combined</span>
                          <strong>{Math.round(totalCost * 100)}c</strong>
                          <small>{lockProfit > 0 ? `${Math.round(lockProfit * 100)}c lock` : "No lock"}</small>
                        </div>
                      </div>
                      <p>{market.note}</p>
                      <dl>
                        <div>
                          <dt>Volume</dt>
                          <dd>{market.volume}</dd>
                        </div>
                        <div>
                          <dt>Spread</dt>
                          <dd>{market.spread}</dd>
                        </div>
                        <div>
                          <dt>Stake model</dt>
                          <dd>{lockProfit > 0 ? `$${(stake * lockProfit).toFixed(2)} gross lock` : "No arb"}</dd>
                        </div>
                        <div>
                          <dt>Risk check</dt>
                          <dd>Match rules</dd>
                        </div>
                      </dl>
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No live prediction contracts loaded" copy="Turn Demo off, click Refresh Polymarket, then compare prices. Kalshi support needs a signed backend connector before live orderbooks can be combined." />
            )
          ) : oddsType === "sportsbook" ? (
            filteredOdds.length ? (
              <div className="odds-list">
                {filteredOdds.map((market) => (
                <article className="result-card odds-card" key={market.id}>
                  <div>
                    <span className="market-label">{market.category} / {market.market}</span>
                    <h3>{market.game}</h3>
                    <p>{market.target}</p>
                  </div>
                  <div className="odds-price">
                    <strong>{market.bestOdds > 0 ? `+${market.bestOdds}` : market.bestOdds}</strong>
                    <span>{americanToDecimal(market.bestOdds)} decimal</span>
                  </div>
                  <div className="book-panel">
                    <span>{market.book}</span>
                    <small>{market.runnerUp}</small>
                  </div>
                  <div className="edge-panel">
                    <strong>{market.edge}</strong>
                    <span>{stake ? `Est. return $${(stake * Number(americanToDecimal(market.bestOdds))).toFixed(2)}` : market.payout}</span>
                  </div>
                  <div className="confidence">
                    <span style={{ width: `${market.confidence}%` }} />
                  </div>
                </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title={oddsApiKey.trim() ? "No sportsbook odds returned yet" : "Sportsbook API key needed"}
                copy={
                  oddsApiKey.trim()
                    ? apiStatus
                    : "The sportsbook API is wired, but live odds require a The Odds API key. Paste one in the left panel and click Refresh live odds."
                }
              />
            )
          ) : (
            filteredCasinoOdds.length ? (
              <div className="game-odds-grid">
                {filteredCasinoOdds.map((market) => (
                <article className="result-card game-odds-card" key={market.id}>
                  <div className="card-topline">
                    <span>{market.category}</span>
                    <small>Updated {market.freshness} ago</small>
                  </div>
                  <h3>{market.game}</h3>
                  <p>{market.venue} / {market.city}</p>
                  <div className="game-best">
                    <strong>{market.best}</strong>
                    <span>{market.market}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Detail</dt>
                      <dd>{market.detail}</dd>
                    </div>
                    <div>
                      <dt>Minimum</dt>
                      <dd>${market.minimum}</dd>
                    </div>
                    <div>
                      <dt>Player value</dt>
                      <dd>{market.playerEdge}</dd>
                    </div>
                    <div>
                      <dt>Confidence</dt>
                      <dd>{market.confidence}%</dd>
                    </div>
                  </dl>
                  <div className="confidence">
                    <span style={{ width: `${market.confidence}%` }} />
                  </div>
                </article>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No real user-reported game odds yet"
                copy="This live source is connected to Supabase. Once someone submits a table rule, paytable, or good casino-game odds report, it will display here."
              />
            )
          )}

          <section className="report-section" aria-label="community reports">
            <div className="report-heading">
              <div>
                <p className="eyebrow">community feed</p>
                <h2>Report cheap tables or good odds</h2>
              </div>
              <span>{reports.length} active reports</span>
            </div>
            <p className="report-status">{reportStatus}</p>

            <div className="trust-strip" aria-label="trust and moderation summary">
              <div>
                <strong>Trust score</strong>
                <span>Starts at 62, rises with confirmations and verified contributors.</span>
              </div>
              <div>
                <strong>Moderation</strong>
                <span>New reports land pending until enough users confirm or an admin approves.</span>
              </div>
              <div>
                <strong>Staleness</strong>
                <span>Reports decay by age so old table minimums stop outranking fresh ones.</span>
              </div>
            </div>

            <form className="report-form" onSubmit={submitReport}>
              <label className="field">
                <span>Type</span>
                <select
                  value={reportDraft.type}
                  onChange={(event) => setReportDraft((current) => ({ ...current, type: event.target.value }))}
                >
                  <option>Cheap table</option>
                  <option>Good odds</option>
                  <option>Bad data</option>
                </select>
              </label>
              <label className="field">
                <span>Venue or book</span>
                <input
                  value={reportDraft.venue}
                  onChange={(event) => setReportDraft((current) => ({ ...current, venue: event.target.value }))}
                  placeholder="Casino, poker room, or sportsbook"
                />
              </label>
              <label className="field">
                <span>Game</span>
                <select
                  value={reportDraft.game}
                  onChange={(event) => setReportDraft((current) => ({ ...current, game: event.target.value }))}
                >
                  {gameTypes.filter((game) => game !== "All").map((game) => (
                    <option key={game}>{game}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Value</span>
                <input
                  value={reportDraft.value}
                  onChange={(event) => setReportDraft((current) => ({ ...current, value: event.target.value }))}
                  placeholder="$5 min, +132, 3:2 S17"
                />
              </label>
              <label className="field wide-field">
                <span>Note</span>
                <input
                  value={reportDraft.note}
                  onChange={(event) => setReportDraft((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Where on the floor, wait, paytable, limits"
                />
              </label>
              <button className="submit-report" type="submit">Submit report</button>
            </form>

            <div className="report-feed">
              {reports.map((report) => (
                <article key={report.id}>
                  <div className="report-meta">
                    <span>{report.type}</span>
                    <em>{report.status}</em>
                  </div>
                  <strong>{report.value}</strong>
                  <p>{report.game} at {report.venue}</p>
                  <small>{report.note} / {report.age}</small>
                  <div className="trust-meter" aria-label={`Trust score ${report.trust}`}>
                    <span style={{ width: `${report.trust}%` }} />
                  </div>
                  <small>{report.trust} trust / {report.confirmations} confirmations</small>
                </article>
              ))}
            </div>
          </section>
        </section>

        <aside className="insight-panel" aria-label="market insights">
          <div className="map-card">
            <div className="floor-map" aria-hidden="true">
              <span className="zone blackjack">BJ</span>
              <span className="zone craps">CR</span>
              <span className="zone poker">PK</span>
              <span className="zone book">SB</span>
            </div>
          </div>

          <div className="insight-block">
            <p className="eyebrow">best right now</p>
            <h3>
              {mode === "tables"
                ? "$5 craps at Canyon Club"
                : mode === "predictions"
                  ? "3c theoretical contract lock"
                  : oddsType === "sportsbook"
                    ? "Aces -4.5 at -104"
                    : "3:2 blackjack at $10"}
            </h3>
            <p>
              {mode === "tables"
                ? "Lowest tracked minimum with 10x odds and walk-up seating."
                : mode === "predictions"
                  ? "Contract arbitrage works when the cheapest YES plus cheapest NO across equivalent markets costs less than $1.00 before fees."
                  : oddsType === "sportsbook"
                    ? "Top spread price across checked feeds with a 2.1% modeled edge."
                    : "Best tracked blackjack rules with a low minimum and recent confirmation."}
            </p>
          </div>

          <div className="source-card">
            <p className="eyebrow">data path</p>
            <h3>Easy for sports, harder for floors</h3>
            <p>Use an odds API for sportsbook lines. Use user reports, casino partnerships, or an existing table-minimum tracker for live floors.</p>
          </div>

          <div className="watchlist">
            <div>
              <span>Blackjack 3:2 under $15</span>
              <strong>2 hits</strong>
            </div>
            <div>
              <span>Single-zero roulette</span>
              <strong>1 hit</strong>
            </div>
            <div>
              <span>Positive baseball moneylines</span>
              <strong>3 hits</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

function EmptyState({ title, copy }) {
  return (
    <div className="empty-state">
      <p className="eyebrow">live source</p>
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

const rootElement = document.getElementById("root");
const appRoot = window.__oddstableRoot || createRoot(rootElement);
window.__oddstableRoot = appRoot;
appRoot.render(<App />);
