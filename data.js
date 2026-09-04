/* Demo market universe for offline / GitHub Pages use.
   Prices and contracts are deterministic for the calendar day. */
const UNIVERSE = [
  { t:"AAPL", name:"Apple", px:228.4, cap:3400, pe:33, fpe:29, eps:6.9, short:0.8, beta:1.2, analyst:4.4, iv:22, etf:false, div:0.44 },
  { t:"MSFT", name:"Microsoft", px:428.1, cap:3180, pe:35, fpe:30, eps:12.2, short:0.6, beta:0.9, analyst:4.6, iv:20, etf:false, div:0.72 },
  { t:"NVDA", name:"NVIDIA", px:178.6, cap:4360, pe:48, fpe:36, eps:3.7, short:1.1, beta:1.7, analyst:4.7, iv:38, etf:false, div:0.04 },
  { t:"AMZN", name:"Amazon", px:198.2, cap:2080, pe:38, fpe:31, eps:5.2, short:0.9, beta:1.2, analyst:4.5, iv:28, etf:false, div:0 },
  { t:"GOOGL", name:"Alphabet", px:186.5, cap:2280, pe:24, fpe:21, eps:7.8, short:0.7, beta:1.05, analyst:4.5, iv:24, etf:false, div:0.8 },
  { t:"META", name:"Meta", px:542.0, cap:1370, pe:26, fpe:22, eps:20.8, short:1.2, beta:1.3, analyst:4.3, iv:30, etf:false, div:2.0 },
  { t:"TSLA", name:"Tesla", px:248.7, cap:800, pe:92, fpe:70, eps:2.7, short:3.1, beta:2.1, analyst:3.6, iv:52, etf:false, div:0 },
  { t:"AVGO", name:"Broadcom", px:298.4, cap:1400, pe:41, fpe:28, eps:7.3, short:1.0, beta:1.25, analyst:4.4, iv:34, etf:false, div:2.3 },
  { t:"JPM", name:"JPMorgan", px:248.9, cap:700, pe:13, fpe:12, eps:19.1, short:0.9, beta:1.1, analyst:4.2, iv:19, etf:false, div:5.0 },
  { t:"XOM", name:"Exxon", px:116.2, cap:510, pe:14, fpe:13, eps:8.3, short:1.4, beta:0.85, analyst:3.9, iv:21, etf:false, div:3.8 },
  { t:"KO", name:"Coca-Cola", px:69.4, cap:299, pe:26, fpe:23, eps:2.7, short:0.7, beta:0.55, analyst:4.1, iv:16, etf:false, div:3.0 },
  { t:"PEP", name:"PepsiCo", px:152.1, cap:209, pe:22, fpe:20, eps:6.9, short:1.1, beta:0.5, analyst:3.8, iv:17, etf:false, div:3.2 },
  { t:"COST", name:"Costco", px:918.0, cap:407, pe:52, fpe:46, eps:17.6, short:1.3, beta:0.75, analyst:4.2, iv:18, etf:false, div:0.5 },
  { t:"UNH", name:"UnitedHealth", px:312.4, cap:286, pe:16, fpe:14, eps:19.5, short:1.0, beta:0.6, analyst:4.0, iv:27, etf:false, div:1.8 },
  { t:"LLY", name:"Eli Lilly", px:762.0, cap:684, pe:58, fpe:36, eps:13.1, short:0.8, beta:0.45, analyst:4.5, iv:29, etf:false, div:0.7 },
  { t:"JNJ", name:"J&J", px:178.3, cap:429, pe:17, fpe:15, eps:10.5, short:0.6, beta:0.45, analyst:4.0, iv:15, etf:false, div:3.1 },
  { t:"WMT", name:"Walmart", px:102.6, cap:822, pe:38, fpe:32, eps:2.7, short:0.5, beta:0.5, analyst:4.3, iv:16, etf:false, div:1.1 },
  { t:"HD", name:"Home Depot", px:412.8, cap:410, pe:26, fpe:24, eps:15.9, short:0.9, beta:1.0, analyst:4.1, iv:20, etf:false, div:2.3 },
  { t:"PG", name:"P&G", px:171.2, cap:402, pe:25, fpe:23, eps:6.8, short:0.7, beta:0.4, analyst:3.9, iv:14, etf:false, div:2.4 },
  { t:"V", name:"Visa", px:318.5, cap:620, pe:31, fpe:26, eps:10.3, short:1.2, beta:0.9, analyst:4.4, iv:18, etf:false, div:0.8 },
  { t:"MA", name:"Mastercard", px:528.0, cap:490, pe:36, fpe:30, eps:14.6, short:0.8, beta:1.05, analyst:4.4, iv:19, etf:false, div:0.6 },
  { t:"NFLX", name:"Netflix", px:712.4, cap:305, pe:44, fpe:36, eps:16.2, short:1.6, beta:1.2, analyst:4.1, iv:33, etf:false, div:0 },
  { t:"AMD", name:"AMD", px:148.9, cap:241, pe:92, fpe:32, eps:1.6, short:2.2, beta:1.8, analyst:4.2, iv:41, etf:false, div:0 },
  { t:"INTC", name:"Intel", px:24.8, cap:108, pe:0, fpe:22, eps:-0.4, short:3.4, beta:1.3, analyst:3.2, iv:44, etf:false, div:0 },
  { t:"BA", name:"Boeing", px:178.6, cap:134, pe:0, fpe:28, eps:-2.1, short:2.0, beta:1.5, analyst:3.7, iv:36, etf:false, div:0 },
  { t:"DIS", name:"Disney", px:98.4, cap:178, pe:21, fpe:17, eps:4.7, short:1.3, beta:1.15, analyst:3.9, iv:26, etf:false, div:0.9 },
  { t:"NKE", name:"Nike", px:78.2, cap:116, pe:24, fpe:20, eps:3.3, short:1.8, beta:1.05, analyst:3.8, iv:29, etf:false, div:1.6 },
  { t:"CAT", name:"Caterpillar", px:398.0, cap:193, pe:18, fpe:17, eps:22.1, short:1.4, beta:1.2, analyst:3.9, iv:24, etf:false, div:2.1 },
  { t:"CVX", name:"Chevron", px:151.3, cap:272, pe:15, fpe:14, eps:10.1, short:1.5, beta:0.9, analyst:3.8, iv:22, etf:false, div:4.2 },
  { t:"ABBV", name:"AbbVie", px:196.4, cap:347, pe:17, fpe:15, eps:11.5, short:0.9, beta:0.55, analyst:4.1, iv:21, etf:false, div:3.4 },
  { t:"SPY", name:"S&P 500 ETF", px:642.5, cap:620, pe:24, fpe:22, eps:0, short:0, beta:1.0, analyst:0, iv:13, etf:true, div:1.2 },
  { t:"QQQ", name:"Nasdaq 100 ETF", px:568.2, cap:310, pe:28, fpe:25, eps:0, short:0, beta:1.15, analyst:0, iv:16, etf:true, div:0.6 },
  { t:"IWM", name:"Russell 2000 ETF", px:226.8, cap:68, pe:18, fpe:16, eps:0, short:0, beta:1.2, analyst:0, iv:20, etf:true, div:1.3 },
  { t:"DIA", name:"Dow ETF", px:428.1, cap:36, pe:22, fpe:20, eps:0, short:0, beta:0.95, analyst:0, iv:12, etf:true, div:1.6 },
  { t:"XLF", name:"Financials ETF", px:49.6, cap:42, pe:15, fpe:14, eps:0, short:0, beta:1.1, analyst:0, iv:17, etf:true, div:1.5 },
  { t:"XLE", name:"Energy ETF", px:91.2, cap:34, pe:13, fpe:12, eps:0, short:0, beta:1.05, analyst:0, iv:23, etf:true, div:3.4 },
  { t:"GLD", name:"Gold ETF", px:248.0, cap:72, pe:0, fpe:0, eps:0, short:0, beta:0.15, analyst:0, iv:14, etf:true, div:0 },
  { t:"SOFI", name:"SoFi", px:26.4, cap:28, pe:38, fpe:24, eps:0.7, short:8.4, beta:1.9, analyst:3.5, iv:58, etf:false, div:0 },
  { t:"PLTR", name:"Palantir", px:41.8, cap:98, pe:210, fpe:90, eps:0.2, short:4.1, beta:1.6, analyst:3.4, iv:49, etf:false, div:0 },
  { t:"COIN", name:"Coinbase", px:248.5, cap:62, pe:28, fpe:32, eps:8.9, short:5.2, beta:2.4, analyst:3.6, iv:62, etf:false, div:0 }
];

function daySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function roundTo(x, step) {
  return Math.round(x / step) * step;
}

function strikeStep(px) {
  if (px < 25) return 0.5;
  if (px < 50) return 1;
  if (px < 200) return 2.5;
  if (px < 500) return 5;
  return 10;
}

function money(n) {
  return (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
}

function money0(n) {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(Math.round(n)).toLocaleString();
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function approxDelta(moneyness, dte, isPut) {
  const t = Math.sqrt(Math.max(dte, 1) / 365);
  const z = moneyness / (0.22 * t + 0.02);
  const callDelta = 1 / (1 + Math.exp(z * 1.7));
  const putAbs = 1 - callDelta;
  return isPut ? putAbs : callDelta;
}

function optionPremium(px, strike, dte, iv, isPut) {
  const t = dte / 365;
  const m = isPut ? (strike - px) / px : (px - strike) / px;
  const intrinsic = Math.max(0, isPut ? strike - px : px - strike);
  const extra = px * iv/100 * Math.sqrt(Math.max(t, 1/365)) * 0.4 * Math.exp(-Math.abs(m) * 6);
  return Math.max(0.03, +(intrinsic + extra).toFixed(2));
}

function buildChain(u, rng) {
  const px = +(u.px * (0.97 + rng() * 0.06)).toFixed(2);
  const iv = +(u.iv * (0.9 + rng() * 0.25)).toFixed(1);
  const dtes = [14, 21, 30, 37, 45, 60, 90, 120];
  const step = strikeStep(px);
  const contracts = [];
  dtes.forEach((dte) => {
    const exp = addDays(new Date(), dte);
    for (let k = -6; k <= 6; k++) {
      const strike = +roundTo(px + k * step, step).toFixed(2);
      if (strike <= 0) continue;
      ["P", "C"].forEach((right) => {
        const isPut = right === "P";
        const mid = optionPremium(px, strike, dte, iv, isPut);
        const spreadPct = clamp(0.8 + rng() * 4 + (u.etf ? 0 : 0.4), 0.5, 8);
        const bid = +Math.max(0.01, mid * (1 - spreadPct / 200)).toFixed(2);
        const ask = +(bid + Math.max(0.01, mid * spreadPct / 100)).toFixed(2);
        const otmPct = isPut ? ((px - strike) / px) * 100 : ((strike - px) / px) * 100;
        const delta = +approxDelta((strike - px) / px, dte, isPut).toFixed(2);
        const credit = bid;
        const roc = isPut ? (credit / strike) * 100 : (credit / px) * 100;
        const ann = roc * (365 / dte);
        const vol = Math.floor(80 + rng() * 9000 / (1 + Math.abs(k)));
        const oi = Math.floor(200 + rng() * 18000 / (1 + Math.abs(k) * 0.6));
        const earnIn = Math.floor(8 + rng() * 70);
        const tsRating = clamp(Math.round(55 + (ann / 4) + (u.analyst * 4) - Math.abs(delta - 0.25) * 40 - (u.etf ? 8 : 0) + rng() * 8), 1, 99);
        const optScore = clamp(Math.round(50 + ann * 0.35 + oi / 400 - spreadPct * 3 + rng() * 6), 1, 99);
        const rel = clamp(Math.round(40 + rng() * 50 + (u.beta > 1.3 ? 8 : 0)), 1, 99);
        contracts.push({
          id: `${u.t}-${iso(exp)}-${strike}-${right}`,
          ticker: u.t,
          name: u.name,
          right,
          type: isPut ? "Put" : "Call",
          spot: px,
          strike,
          dte,
          exp: iso(exp),
          expLabel: fmtDate(exp),
          bid, ask, mid: +((bid + ask) / 2).toFixed(2),
          spreadPct: +spreadPct.toFixed(2),
          delta,
          iv,
          otmPct: +otmPct.toFixed(2),
          roc: +roc.toFixed(2),
          ann: +ann.toFixed(1),
          volume: vol,
          oi,
          earnIn,
          cap: u.cap,
          pe: u.pe,
          fpe: u.fpe,
          eps: u.eps,
          short: u.short,
          beta: u.beta,
          analyst: u.analyst,
          div: u.div,
          etf: u.etf,
          tsRating,
          optScore,
          rel,
          premium: credit,
          collateral: isPut ? strike * 100 : px * 100
        });
      });
    }
  });
  return { px, iv, contracts };
}

function buildMarket() {
  const rng = mulberry32(daySeed());
  const stocks = UNIVERSE.map((u) => {
    const chain = buildChain(u, rng);
    return Object.assign({}, u, { px: chain.px, iv: chain.iv, contracts: chain.contracts });
  });
  const contracts = stocks.flatMap((s) => s.contracts);
  return { stocks, contracts, asOf: new Date().toISOString() };
}
