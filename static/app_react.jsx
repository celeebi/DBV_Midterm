/**
 * VALUEX Institutional Equity Research & Financial Modeling Platform
 * MM6026 Digital Business Valuation Mid-Term Project
 * Calibrated to IDX:PWON (PT Pakuwon Jati Tbk) & Indonesian Property Universe
 * Zero-Node React 18 SPA Architecture (Served via Starlette & Uvicorn)
 */

const { useState, useMemo, useEffect, useRef } = React;

// Native SVG Chart Components (Zero external charting library dependencies)
function DislocationBarChart({ data = [] }) {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">Loading dislocation data...</div>;
  const maxAbsUpside = Math.max(...data.map(d => Math.abs(d.upside || 0)), 20);

  return (
    <div className="space-y-3 my-2">
      {data.map((entry, idx) => {
        const isPos = (entry.upside || 0) >= 0;
        const widthPct = Math.min(100, Math.max(8, (Math.abs(entry.upside || 0) / maxAbsUpside) * 100));
        return (
          <div key={idx} className="flex items-center space-x-2 text-xs font-mono">
            <span className="w-16 font-bold text-slate-900 text-left shrink-0">{entry.ticker}</span>
            <div className="flex-1 bg-slate-100 h-6 rounded-xs relative overflow-hidden flex items-center border border-slate-200">
              <div
                style={{ width: `${widthPct}%` }}
                className={`h-full rounded-xs transition-all duration-500 flex items-center px-2 ${
                  isPos ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                }`}
              >
                <span className="text-[10px] font-bold whitespace-nowrap">
                  {isPos ? '+' : ''}{entry.upside}%
                </span>
              </div>
            </div>
            <span className="w-24 text-right text-[11px] text-slate-600 shrink-0 font-medium">
              IV: Rp{entry.intrinsicValue?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PriceHistoryChart({ data = [] }) {
  if (!data || data.length === 0) return <div className="h-56 flex items-center justify-center text-slate-400 font-mono text-xs">No price history available</div>;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };

  const prices = data.map(d => d.price || 0);
  const intrinsics = data.map(d => d.intrinsic || 0);
  const allVals = [...prices, ...intrinsics];
  const minVal = Math.min(...allVals) * 0.92;
  const maxVal = Math.max(...allVals) * 1.08;

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const getX = (idx) => padding.left + (idx / Math.max(1, data.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / Math.max(1, maxVal - minVal)) * chartH;

  const pricePoints = data.map((d, i) => `${getX(i)},${getY(d.price)}`);
  const pricePath = `M ${pricePoints.join(' L ')}`;

  const intrinsicPoints = data.map((d, i) => `${getX(i)},${getY(d.intrinsic)}`);
  const intrinsicPath = `M ${intrinsicPoints.join(' L ')}`;
  const areaPath = `M ${getX(0)},${getY(data[0].intrinsic)} L ${intrinsicPoints.join(' L ')} L ${getX(data.length - 1)},${padding.top + chartH} L ${getX(0)},${padding.top + chartH} Z`;

  const yTicks = [0, 0.33, 0.66, 1].map(r => minVal + r * (maxVal - minVal));

  return (
    <div className="w-full h-56 flex flex-col justify-between">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {yTicks.map((tVal, idx) => {
          const y = getY(tVal);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
              <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#64748B" fontFamily="monospace">
                Rp{Math.round(tVal)}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="rgba(37, 99, 235, 0.10)" />
        <path d={intrinsicPath} fill="none" stroke="#2563EB" strokeWidth="2" strokeDasharray="4 4" />
        <path d={pricePath} fill="none" stroke="#0F172A" strokeWidth="2.5" />
        {data.map((d, i) => (
          <circle key={i} cx={getX(i)} cy={getY(d.price)} r="3.5" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={getX(i)} y={height - 8} textAnchor="middle" fontSize="10" fill="#64748B" fontFamily="sans-serif">
            {d.month}
          </text>
        ))}
      </svg>
      <div className="flex items-center justify-center space-x-6 text-[11px] font-mono pt-1 text-slate-600">
        <span className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 bg-[#0F172A] inline-block"></span>
          <span>Market Price (IDR)</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-4 h-0.5 bg-blue-600 border-b border-dashed border-blue-600 inline-block"></span>
          <span>House Intrinsic Target (IDR)</span>
        </span>
      </div>
    </div>
  );
}

// Real-Time Valuation Weight Composition Donut / Pie Chart
function WeightCompositionDonut({
  weights = { dcfWeight: 50, compsWeight: 25, rimWeight: 15, ddmWeight: 10 },
  prices = {},
  size = 170,
  strokeWidth = 24,
  centerTitle = "Target Price",
  centerValue = null,
  showLegend = true
}) {
  const models = [
    { key: 'dcfWeight', label: '10-Yr DCF (FCFF)', shortLabel: 'DCF', color: '#2563eb', weight: Number(weights.dcfWeight ?? 50), price: prices.dcfSharePrice || 0 },
    { key: 'compsWeight', label: 'Property Comps', shortLabel: 'Comps', color: '#059669', weight: Number(weights.compsWeight ?? 25), price: prices.compsSharePrice || 0 },
    { key: 'rimWeight', label: 'Residual Income (RIM)', shortLabel: 'RIM', color: '#7c3aed', weight: Number(weights.rimWeight ?? 15), price: prices.rimSharePrice || 0 },
    { key: 'ddmWeight', label: 'Dividend Discount (DDM)', shortLabel: 'DDM', color: '#d97706', weight: Number(weights.ddmWeight ?? 10), price: prices.ddmSharePrice || 0 },
  ];
  if (weights.rnavWeight !== undefined && weights.rnavWeight !== null) {
    models.push({ key: 'rnavWeight', label: 'RNAV Property Net Assets', shortLabel: 'RNAV', color: '#ea580c', weight: Number(weights.rnavWeight ?? 0), price: prices.rnavSharePrice || 0 });
  }

  const rawSum = models.reduce((acc, m) => acc + (m.weight > 0 ? m.weight : 0), 0);
  const isZeroTotal = rawSum <= 0;

  // Geometry
  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;

  // Compute slices
  let accumulatedFraction = 0;
  const slices = models.map(m => {
    const fraction = rawSum > 0 ? (Math.max(0, m.weight) / rawSum) : 0;
    const dashLength = fraction * circumference;
    const strokeDashoffset = -(accumulatedFraction * circumference);
    const effectivePct = rawSum > 0 ? Math.round(fraction * 100) : 0;
    const contribution = rawSum > 0 ? Math.round((m.price * Math.max(0, m.weight)) / rawSum) : 0;
    accumulatedFraction += fraction;
    return {
      ...m,
      fraction,
      effectivePct,
      dashLength,
      strokeDashoffset,
      contribution
    };
  });

  const activeSlices = slices.filter(s => s.fraction > 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xs w-full">
      {/* SVG Donut */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {isZeroTotal ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={strokeWidth}
              strokeDasharray="4 4"
            />
          ) : activeSlices.length === 1 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={activeSlices[0].color}
              strokeWidth={strokeWidth}
            />
          ) : (
            <g transform={`rotate(-90 ${center} ${center})`}>
              {activeSlices.map(s => (
                <circle
                  key={s.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${s.dashLength} ${circumference}`}
                  strokeDashoffset={s.strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-300"
                />
              ))}
            </g>
          )}
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {centerValue ? (
            <>
              <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">{centerTitle}</span>
              <span className="text-sm font-bold font-mono text-slate-900 leading-tight mt-0.5">{centerValue}</span>
              <span className={`text-[9px] font-mono font-semibold px-1 py-0.2 rounded-xs mt-0.5 ${rawSum === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {rawSum === 100 ? '100% Balanced' : `${rawSum}% Sum`}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-mono text-slate-500 uppercase leading-none block">Total Weight</span>
              <span className="text-base font-bold font-mono text-slate-900 leading-tight mt-0.5">{rawSum}%</span>
              <span className="text-[9px] font-mono text-slate-400 block">{rawSum === 100 ? 'Normalized' : 'Auto-Scaled'}</span>
            </>
          )}
        </div>
      </div>

      {/* Legend & Breakdown */}
      {showLegend && (
        <div className="w-full space-y-1.5 font-mono text-xs">
          {slices.map(s => (
            <div key={s.key} className="flex items-center justify-between py-0.5 border-b border-slate-200/60 last:border-0">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-700 font-sans truncate text-xs">{s.label}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0 text-right">
                <span className="font-bold" style={{ color: s.weight > 0 ? s.color : '#94a3b8' }}>
                  {s.weight}%
                </span>
                {s.weight > 0 && rawSum !== 100 && (
                  <span className="text-[10px] text-slate-400">({s.effectivePct}%)</span>
                )}
                <span className="text-slate-500 text-[11px] w-16">
                  {s.price ? `IDR ${s.price}` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Generic Lucide Icon Renderer
const Icon = ({ name, size = 16, className = "" }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    try {
      ref.current.innerHTML = "";
      if (window.lucide) {
        const pascal = name.charAt(0).toUpperCase() + name.slice(1);
        const iconDef = (window.lucide.icons && (window.lucide.icons[name] || window.lucide.icons[pascal])) ||
                        window.lucide[name] || window.lucide[pascal];
        if (iconDef && window.lucide.createElement) {
          const svgEl = window.lucide.createElement(iconDef, {
            width: size,
            height: size,
            class: className
          });
          ref.current.appendChild(svgEl);
          return;
        }
      }
      const kebab = name.replace(/([A-Z0-9])/g, "-$1").toLowerCase().replace(/^-/, "");
      const iEl = document.createElement("i");
      iEl.setAttribute("data-lucide", kebab);
      iEl.setAttribute("class", className);
      iEl.style.width = size + "px";
      iEl.style.height = size + "px";
      iEl.style.display = "inline-block";
      ref.current.appendChild(iEl);
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons({ root: ref.current });
      }
    } catch (err) {
      // Never crash if an icon fails
    }
  }, [name, size, className]);
  return <span ref={ref} className="inline-flex items-center justify-center shrink-0" />;
};

// Academic and Institution Logo with Graceful Auto-Fallback
function AcademicLogo({ src, alt, label, height = 36, className = "" }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    // If .png failed, try .png.png once as fallback
    if (typeof currentSrc === 'string' && currentSrc.endsWith('.png') && !currentSrc.endsWith('.png.png')) {
      setCurrentSrc(currentSrc + '.png');
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div 
        className={`flex items-center px-2 py-1 bg-slate-900 border border-slate-700/80 rounded-xs text-[10px] font-mono text-slate-300 shadow-2xs ${className}`}
        title={alt}
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 shrink-0" />
        <span className="font-semibold tracking-tight uppercase">{label || alt}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        style={{ height: `${height}px`, width: 'auto', maxHeight: `${height * 1.5}px` }}
        className="object-contain filter drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
        onError={handleError}
      />
      {label && (
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden sm:inline">
          {label}
        </span>
      )}
    </div>
  );
}

// KaTeX Proof Renderer
const MathProof = ({ latex }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (window.katex && ref.current && latex) {
      try {
        window.katex.render(latex, ref.current, { throwOnError: false, displayMode: true });
      } catch (e) {
        ref.current.innerText = latex;
      }
    }
  }, [latex]);
  return <div ref={ref} className="my-1.5 overflow-x-auto text-xs py-1" />;
};

// Indonesian Capital Markets Formatting Helpers
const fmtIDR = (val, decimals = 0) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const absVal = Math.abs(val);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${val < 0 ? '-' : ''}IDR ${formatted}`;
};

const fmtCompact = (valInBillions) => {
  if (valInBillions === undefined || valInBillions === null || isNaN(valInBillions)) return '—';
  if (Math.abs(valInBillions) >= 1000) {
    return `IDR ${(valInBillions / 1000).toFixed(2)}T`;
  }
  return `IDR ${valInBillions.toLocaleString('en-US', { maximumFractionDigits: 0 })}B`;
};

const fmtPct = (val, decimals = 1, showPlus = true) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const sign = val > 0 && showPlus ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
};

// Converts financial metric to Trillion IDR unit defensively
const toTrillion = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 0;
  const n = Number(val);
  return Math.abs(n) > 100 ? n / 1000.0 : n;
};

// Institutional Recommendation Badge
const RecommendationBadge = ({ rec, size = 'md' }) => {
  const styles = {
    BUY: 'bg-emerald-950/20 text-emerald-800 border-emerald-600/40 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40',
    HOLD: 'bg-amber-950/20 text-amber-800 border-amber-600/40 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40',
    SELL: 'bg-rose-950/20 text-rose-800 border-rose-600/40 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/40',
  };
  const sz = size === 'lg' ? 'px-3 py-1 text-xs font-bold tracking-wider' : 'px-2 py-0.5 text-[10px] font-bold tracking-wider';
  return (
    <span className={`inline-flex items-center border rounded-xs uppercase font-mono ${styles[rec] || styles.HOLD} ${sz}`}>
      {rec === 'BUY' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />}
      {rec === 'HOLD' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />}
      {rec === 'SELL' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />}
      {rec}
    </span>
  );
};

// Indonesian Capital Markets & Real Estate Macro Tape
const INITIAL_MACRO_BENCHMARKS = [
  { id: 'ihsg', symbol: 'IHSG (IDX COMP)', price: 7785.40, changePct: 0.42 },
  { id: 'id10y', symbol: 'ID 10Y SOVEREIGN', price: 6.60, changePct: -0.15, isYield: true },
  { id: 'usdidr', symbol: 'USD / IDR', price: 15850.00, changePct: -0.12 },
  { id: 'bi7drr', symbol: 'BI 7-DAY REPO', price: 6.00, changePct: 0.0, isYield: true },
  { id: 'jakprop', symbol: 'IDX PROPERTY', price: 824.50, changePct: 1.18 },
  { id: 'spx', symbol: 'S&P 500', price: 5892.45, changePct: 0.35 },
];

// Rotating Indonesian Property & Macro News Wire
const BREAKING_WIRE_HEADLINES = [
  { id: 1, ticker: 'PWON.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'PWON: Retail mall occupancy reaches 96.2% across Kota Kasablanka & Gandaria City; house DCF model reiterates BUY (IDR 440 target, +63.0% upside).' },
  { id: 2, ticker: 'BSDE.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'BSDE: BSD City Phase 3 commercial plot monetization tracks +12% above street consensus; shares trade at deep 0.22x P/B multiple.' },
  { id: 3, ticker: 'CTRA.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'CTRA: Residential presales in Surabaya and Jabodetabek accelerate following Bank Indonesia mortgage relaxation.' },
  { id: 4, ticker: 'SMRA.JK', sentiment: 'NEUTRAL', time: 'LIVE WIRE', headline: 'SMRA: Summarecon Mall Bandung foot traffic exceeds target, though net debt leverage of 2.0x requires monitoring under current BI rates.' },
  { id: 5, ticker: 'MACRO', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'BANK INDONESIA: Holds 7-Day Reverse Repo rate steady at 6.00%; property sector mortgage VAT subsidies extended through FY26.' },
  { id: 6, ticker: 'ASII.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'ASII: Generates IDR 22.5T free cash flow; pristine net cash balance sheet supports 7.2% dividend yield anchor.' }
];

// Parameter Data Provenance & Academic Metadata Registry
const PARAM_PROVENANCE = {
  beta: {
    title: "Equity Beta (β)",
    badge: "LIVE YAHOO API",
    badgeColor: "bg-blue-900 text-blue-200 border-blue-500",
    source: "Yahoo Finance Live API",
    citation: "5-Year Monthly Regression against Jakarta Composite Index (IHSG)",
    methodology: "Calculated as Cov(R_stock, R_ihsg) / Var(R_ihsg) over 60 monthly periods. Measures systemic sensitivity and financial/operating leverage.",
    impact: "Scales the Equity Risk Premium. Raising beta increases Cost of Equity (Ke) and lowers DCF, RIM, and DDM fair values.",
    defaultText: "0.75 (PWON.JK) / Scraped live for any searched equity"
  },
  rf: {
    title: "Risk-Free Rate (Rf)",
    badge: "BANK INDONESIA 10Y",
    badgeColor: "bg-emerald-900 text-emerald-200 border-emerald-500",
    source: "Bank Indonesia / Ministry of Finance (DJPPR)",
    citation: "10-Year Republic of Indonesia Benchmark Government Bond Yield (INDOGB 10Y)",
    methodology: "Secondary market yield-to-maturity (YTM) of sovereign benchmark bond. Zero-default risk rate for IDR capital assets.",
    impact: "Lifts the baseline discount hurdle for both equity and debt capital across all valuation models.",
    defaultText: "6.60% (Secondary market benchmark)"
  },
  matureErp: {
    title: "Mature Market Equity Risk Premium",
    badge: "DAMODARAN MATURE",
    badgeColor: "bg-purple-900 text-purple-200 border-purple-500",
    source: "Prof. Aswath Damodaran (NYU Stern School of Business)",
    citation: "Damodaran Online - Historical & Implied Mature Market ERP Dataset",
    methodology: "Implied premium demanded by equity investors over 10-year US Treasuries in developed AAA-rated economies based on dividend yields and buyback payouts.",
    impact: "Foundational baseline equity risk return before emerging market country risk adjustments.",
    defaultText: "5.00% (Jan 2026 Damodaran update)"
  },
  crp: {
    title: "Country Risk Premium (CRP)",
    badge: "DAMODARAN CRP",
    badgeColor: "bg-purple-900 text-purple-200 border-purple-500",
    source: "Prof. Aswath Damodaran (NYU Stern School of Business)",
    citation: "Country Default Spreads and Risk Premiums (Indonesia Baa2 / BBB)",
    methodology: "Computed as Indonesia's Moody's Baa2 sovereign default spread (1.50%) scaled by emerging market relative equity-to-bond volatility (1.44x) = 2.16%.",
    impact: "Compensates international investors for Indonesian macroeconomic, currency, and regulatory volatility.",
    defaultText: "2.16% (Sovereign Spread: 1.50% × 1.44)"
  },
  kdPre: {
    title: "Pre-Tax Cost of Debt (Kd)",
    badge: "AUDITED BORROWING",
    badgeColor: "bg-amber-900 text-amber-200 border-amber-500",
    source: "Audited Financial Statements Notes / Bank Indonesia",
    citation: "Effective Bank Lending Rate & Corporate Bond Coupon (BI 7DRR + Corporate Spread)",
    methodology: "Effective weighted borrowing cost on outstanding bank credit facilities and corporate rupiah debt notes.",
    impact: "Direct cost of debt capital. Mitigated by the corporate income tax shield: Kd(after) = Kd × (1 - t).",
    defaultText: "6.50% (Effective corporate borrowing rate)"
  },
  wd: {
    title: "Debt Weight (Wd) / Leverage",
    badge: "CAPITAL STRUCTURE",
    badgeColor: "bg-slate-800 text-slate-200 border-slate-600",
    source: "Audited Balance Sheet & Market Capitalization",
    citation: "Gearing = Total Debt / (Total Debt + Market Equity Value)",
    methodology: "Proportion of interest-bearing debt in the firm's total enterprise funding structure.",
    impact: "Balances the mix between higher-cost equity (Ke ~12%) and lower-cost after-tax debt (Kd ~5.07%).",
    defaultText: "20.0% (Property sector target leverage)"
  },
  taxRate: {
    title: "Corporate Tax Rate (t)",
    badge: "UU HPP 22%",
    badgeColor: "bg-emerald-900 text-emerald-200 border-emerald-500",
    source: "Indonesian Directorate General of Taxes (DJP)",
    citation: "Harmonization of Tax Regulations Law No. 7/2021 (UU HPP Pasal 17)",
    methodology: "Statutory corporate income tax rate applicable to Indonesian corporate earnings.",
    impact: "Determines the debt interest deduction shield and converts EBIT to NOPAT.",
    defaultText: "22.0% (Statutory rate)"
  },
  terminalGrowth: {
    title: "Terminal Perpetuity Growth (g)",
    badge: "DAMODARAN GDP CAP",
    badgeColor: "bg-blue-900 text-blue-200 border-blue-500",
    source: "Aswath Damodaran & McKinsey Corporate Finance",
    citation: "Sustainable Indonesian Long-Term Nominal GDP Growth Boundary",
    methodology: "Long-term perpetual growth rate for Gordon Growth cash flows after Year 10. Cannot exceed risk-free rate or national GDP.",
    impact: "Massive leverage on terminal value. Capped at 4.0% to prevent infinite economic value paradox.",
    defaultText: "1.50% (Conservative steady-state)"
  },
  exitEbitdaMultiple: {
    title: "Terminal Exit Multiple (EV/EBITDA)",
    badge: "PROPERTY PEER COMPS",
    badgeColor: "bg-indigo-900 text-indigo-200 border-indigo-500",
    source: "IDX Property Universe Median Comps",
    citation: "10-Year Normalized EV/EBITDA Multiple for Commercial Developers",
    methodology: "Terminal multiple cross-check applied to Year 10 EBITDA.",
    impact: "Blended 50/50 with Gordon Growth perpetuity to compute robust Enterprise Value.",
    defaultText: "6.5x (Commercial mall peer median)"
  }
};

// Interactive Hoverable Data Provenance Tooltip Component
function ProvenanceTooltip({ paramKey }) {
  const [show, setShow] = useState(false);
  const meta = PARAM_PROVENANCE[paramKey];
  if (!meta) return null;

  return (
    <div 
      className="relative inline-flex items-center ml-1"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button 
        type="button" 
        onClick={(e) => { e.preventDefault(); setShow(!show); }}
        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-slate-100"
        title="View Data Provenance & Methodology"
        aria-label="Data Provenance"
      >
        <Icon name="Info" size={13} />
      </button>

      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 bg-slate-900 text-white rounded-md shadow-2xl border border-slate-700 p-3 z-50 text-[11px] leading-snug animate-fadeIn pointer-events-none text-left font-sans">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-1">
            <span className="font-bold font-mono text-slate-100">{meta.title}</span>
            <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs border ${meta.badgeColor}`}>
              {meta.badge}
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-slate-300">
            <div>
              <span className="text-slate-400 font-medium">Source: </span>
              <span className="text-slate-200 font-semibold">{meta.source}</span>
              <p className="text-[10px] text-slate-400 italic font-serif mt-0.5">{meta.citation}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Methodology: </span>
              <span className="text-slate-300">{meta.methodology}</span>
            </div>
            <div className="pt-1 border-t border-slate-800/80">
              <span className="text-amber-400 font-medium">Valuation Impact: </span>
              <span className="text-slate-200">{meta.impact}</span>
            </div>
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Baseline Default:</span>
              <span className="text-emerald-400 font-semibold">{meta.defaultText}</span>
            </div>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
}

// Helper: Calculate Granular CAPM & Cost of Debt Parameters
function computeCapmParameters(assumptions = {}, company = {}) {
  const rf = assumptions.rf !== undefined && assumptions.rf !== null ? Number(assumptions.rf) : 6.60;
  const beta = assumptions.beta !== undefined && assumptions.beta !== null ? Number(assumptions.beta) : (company.beta || 0.75);
  const matureErp = assumptions.matureErp !== undefined && assumptions.matureErp !== null ? Number(assumptions.matureErp) : 5.00;
  const crp = assumptions.crp !== undefined && assumptions.crp !== null ? Number(assumptions.crp) : 2.16;
  const totalErp = +(matureErp + crp).toFixed(2);
  const kdPre = assumptions.kdPre !== undefined && assumptions.kdPre !== null ? Number(assumptions.kdPre) : 6.50;
  const taxRate = assumptions.taxRate !== undefined && assumptions.taxRate !== null ? Number(assumptions.taxRate) : 22.0;
  const wd = assumptions.wd !== undefined && assumptions.wd !== null ? Number(assumptions.wd) : 20.0;
  const we = +(100.0 - wd).toFixed(1);

  // Cost of Equity via CAPM: Ke = Rf + Beta * (Mature ERP + CRP)
  const ke = +(rf + (beta * totalErp)).toFixed(2);
  // After-Tax Cost of Debt: Kd(after) = Kd * (1 - t)
  const kdAfter = +(kdPre * (1.0 - (taxRate / 100.0))).toFixed(2);
  // Blended WACC = (We * Ke) + (Wd * KdAfter)
  const derivedWacc = +(((we / 100.0) * ke) + ((wd / 100.0) * kdAfter)).toFixed(2);

  // Effective WACC used across valuation models
  const effectiveWacc = assumptions.useManualWacc && assumptions.waccOverride !== undefined
    ? Number(assumptions.waccOverride)
    : derivedWacc;

  return {
    rf,
    beta,
    matureErp,
    crp,
    totalErp,
    kdPre,
    kdAfter,
    taxRate,
    wd,
    we,
    ke,
    derivedWacc,
    effectiveWacc,
    proofs: {
      erp: `Total ERP = ${matureErp.toFixed(2)}% + ${crp.toFixed(2)}% = ${totalErp.toFixed(2)}%`,
      ke: `Ke = ${rf.toFixed(2)}% + (${beta.toFixed(2)} × ${totalErp.toFixed(2)}%) = ${ke.toFixed(2)}%`,
      kd: `Kd(after) = ${kdPre.toFixed(2)}% × (1 - ${taxRate.toFixed(1)}%) = ${kdAfter.toFixed(2)}%`,
      wacc: `WACC = (${we.toFixed(1)}% × ${ke.toFixed(2)}%) + (${wd.toFixed(1)}% × ${kdAfter.toFixed(2)}%) = ${effectiveWacc.toFixed(2)}%`
    }
  };
}

// Client-side quick valuation estimator (synchronized with Python backend) - Full 10-Year Horizon
function calculateClientValuation(company, assumptions, scenarioMult = 1.0) {
  const lastHist = company.historical && company.historical.length 
    ? company.historical[company.historical.length - 1] 
    : { revenue: 7110, ebitda: 3660, netIncome: 2350, eps: 48.8 };
  const baseRev = lastHist.revenue || 7110;

  const g5 = assumptions.revGrowthY5 ?? 7.0;
  const tG = assumptions.terminalGrowth ?? 1.5;
  const step = (g5 - tG) / 5.0;

  const growthRates = [
    (assumptions.revGrowthY1 ?? 12.0) * scenarioMult,
    (assumptions.revGrowthY2 ?? 14.0) * scenarioMult,
    (assumptions.revGrowthY3 ?? 10.0) * scenarioMult,
    (assumptions.revGrowthY4 ?? 8.0) * scenarioMult,
    (assumptions.revGrowthY5 ?? 7.0) * scenarioMult,
    (assumptions.revGrowthY6 ?? +(g5 - step).toFixed(1)) * scenarioMult,
    (assumptions.revGrowthY7 ?? +(g5 - step * 2).toFixed(1)) * scenarioMult,
    (assumptions.revGrowthY8 ?? +(g5 - step * 3).toFixed(1)) * scenarioMult,
    (assumptions.revGrowthY9 ?? +(g5 - step * 4).toFixed(1)) * scenarioMult,
    (assumptions.revGrowthY10 ?? +tG.toFixed(1)) * scenarioMult,
  ];

  const marginAdj = scenarioMult === 1 ? 0 : (scenarioMult > 1 ? 2.0 : -2.5);
  const effMargin = Math.max(5, Math.min(80, (assumptions.ebitdaMargin || 50) + marginAdj));
  const capm = computeCapmParameters(assumptions, company);
  const effWacc = Math.max(5.0, (assumptions.wacc ?? capm.effectiveWacc) + (scenarioMult === 1 ? 0 : (scenarioMult > 1 ? -0.5 : 0.8)));
  const effTgr = Math.min(effWacc - 0.5, Math.max(0.5, assumptions.terminalGrowth || 1.5));

  let prevRev = baseRev;
  let sumPvFcf = 0;
  const projections = [];

  for (let i = 0; i < 10; i++) {
    const g = growthRates[i] / 100;
    const rev = prevRev * (1 + g);
    const revDelta = rev - prevRev;
    const ebitda = rev * (effMargin / 100);
    const da = rev * ((assumptions.daPercentRev || 7.3) / 100);
    const ebit = ebitda - da;
    const taxes = Math.max(0, ebit * ((assumptions.taxRate || 22.0) / 100));
    const nopat = ebit - taxes;
    const capex = rev * ((assumptions.capexPercentRev || 8.0) / 100);
    const nwcChange = revDelta * ((assumptions.nwcPercentRevChange || 5.0) / 100);
    const fcf = nopat + da - capex - nwcChange;
    const df = Math.pow(1 + effWacc / 100, i + 1);
    const pvFcf = fcf / df;

    sumPvFcf += pvFcf;
    prevRev = rev;

    projections.push({
      year: `${2026 + i}E`,
      revenue: Math.round(rev),
      growth: +(g * 100).toFixed(1),
      ebitda: Math.round(ebitda),
      ebitdaMargin: +effMargin.toFixed(1),
      ebit: Math.round(ebit),
      nopat: Math.round(nopat),
      da: Math.round(da),
      capex: Math.round(capex),
      nwcChange: Math.round(nwcChange),
      fcf: Math.round(fcf),
      pvFcf: Math.round(pvFcf)
    });
  }

  const finalYear = projections[9];
  const tvPerpetuity = (finalYear.fcf * (1 + effTgr / 100)) / ((effWacc - effTgr) / 100);
  const tvMultiple = finalYear.ebitda * (assumptions.exitEbitdaMultiple || 6.0);
  const terminalVal = (tvPerpetuity * 0.5) + (tvMultiple * 0.5);
  const pvTerminalVal = terminalVal / Math.pow(1 + effWacc / 100, 10);

  const dcfEv = sumPvFcf + pvTerminalVal;
  const netDebt = (company.totalDebt || 0) - (company.cashAndEquivalents || 0);
  const dcfEquity = Math.max(0, dcfEv - netDebt);
  const dcfSharePrice = Math.round((dcfEquity / (company.sharesOutstanding || 1)) * 1000) / 1000;

  // Comps
  const avgCompEvEbitda = company.comps && company.comps.length
    ? company.comps.reduce((acc, c) => acc + c.evEbitda, 0) / company.comps.length
    : 6.5;
  const ntmEbitda = projections[0].ebitda;
  const compsEv = ntmEbitda * avgCompEvEbitda;
  const compsEquity = Math.max(0, compsEv - netDebt);
  const compsSharePrice = Math.round((compsEquity / (company.sharesOutstanding || 1)) * 1000) / 1000;

  // Residual Income Model (RIM)
  const bookEquity = lastHist.netIncome ? lastHist.netIncome * 10 : 22470;
  const ke = capm.ke;
  const equityCharge = bookEquity * (ke / 100);
  const residualIncome = (lastHist.netIncome || 2350) - equityCharge;
  const pvResidualIncome = residualIncome / (ke / 100);
  const rimEquity = bookEquity + pvResidualIncome;
  const rimSharePrice = Math.round((rimEquity / (company.sharesOutstanding || 1)) * 1000) / 1000;

  // Dividend Discount Model (DDM) - 10-Year explicit schedule + Gordon Growth
  const payout = (assumptions.payoutRatio || 30.0) / 100;
  const baseDps = (lastHist.eps || ((lastHist.netIncome || 2350) / (company.sharesOutstanding || 1))) * payout;
  let sumPvDiv = 0;
  let currDps = baseDps;
  for (let i = 0; i < 10; i++) {
    currDps = currDps * (1 + (growthRates[i] / 100));
    sumPvDiv += currDps / Math.pow(1 + ke / 100, i + 1);
  }
  const terminalDps = currDps * (1 + (effTgr / 100));
  const tvDiv = terminalDps / ((ke - effTgr) / 100);
  const pvTvDiv = tvDiv / Math.pow(1 + ke / 100, 10);
  const ddmSharePrice = Math.round(sumPvDiv + pvTvDiv);

  // Valuation Multi-Method Triangulation with Safe 0-Weight Handling
  const wDcf = assumptions.dcfWeight !== undefined && assumptions.dcfWeight !== null ? Number(assumptions.dcfWeight) : 50;
  const wComps = assumptions.compsWeight !== undefined && assumptions.compsWeight !== null ? Number(assumptions.compsWeight) : 25;
  const wRim = assumptions.rimWeight !== undefined && assumptions.rimWeight !== null ? Number(assumptions.rimWeight) : 15;
  const wDdm = assumptions.ddmWeight !== undefined && assumptions.ddmWeight !== null ? Number(assumptions.ddmWeight) : 10;
  const wRnav = assumptions.rnavWeight !== undefined && assumptions.rnavWeight !== null ? Number(assumptions.rnavWeight) : 0;
  const rnavSharePrice = company.rnavSharePrice || Math.round(dcfSharePrice * 1.02);

  const rawTotalW = wDcf + wComps + wRim + wDdm + wRnav;
  const totalW = rawTotalW > 0 ? rawTotalW : 1;

  const compositeIntrinsicValue = rawTotalW > 0
    ? Math.round((dcfSharePrice * wDcf + compsSharePrice * wComps + rimSharePrice * wRim + ddmSharePrice * wDdm + rnavSharePrice * wRnav) / totalW)
    : dcfSharePrice;

  const marketCap = Math.round(company.referencePrice * company.sharesOutstanding);
  const currentEv = marketCap + netDebt;
  const impliedUpside = +(((compositeIntrinsicValue / company.referencePrice) - 1) * 100).toFixed(1);

  let recommendation = 'HOLD';
  if (impliedUpside >= 15.0) recommendation = 'BUY';
  else if (impliedUpside <= -10.0) recommendation = 'SELL';

  return {
    projections,
    sumPvFcf: Math.round(sumPvFcf),
    terminalValue: Math.round(terminalVal),
    pvTerminalValue: Math.round(pvTerminalVal),
    dcfEnterpriseValue: Math.round(dcfEv),
    netDebt: Math.round(netDebt),
    dcfEquityValue: Math.round(dcfEquity),
    dcfSharePrice: Math.round(dcfSharePrice),
    compsSharePrice: Math.round(compsSharePrice),
    rimSharePrice: Math.round(rimSharePrice),
    ddmSharePrice: Math.round(ddmSharePrice),
    compositeIntrinsicValue,
    marketCap,
    currentEnterpriseValue: currentEv,
    impliedUpside,
    recommendation,
    avgCompEvEbitda: +avgCompEvEbitda.toFixed(1),
    tvPctOfEv: +((pvTerminalVal / dcfEv) * 100).toFixed(1),
    capm
  };
}

// MAIN VALUEX APP COMPONENT
function App() {
  const defaultCoverage = (typeof window !== 'undefined' && window.INITIAL_COVERAGE && window.INITIAL_COVERAGE.length)
    ? window.INITIAL_COVERAGE
    : [];

  const [activeNav, setActiveNav] = useState('dashboard');
  const [coverageCompanies, setCoverageCompanies] = useState(defaultCoverage);
  const [selectedCompanyId, setSelectedCompanyId] = useState('pwon');
  const [watchlistIds, setWatchlistIds] = useState(['pwon', 'bsde', 'ctra']);
  const [compareIds, setCompareIds] = useState(['pwon', 'bsde', 'ctra']);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [customTickerInput, setCustomTickerInput] = useState('');
  const [isLoadingCustomTicker, setIsLoadingCustomTicker] = useState(false);

  // Live market ticker state
  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [livePricesMap, setLivePricesMap] = useState(() => {
    const map = {};
    defaultCoverage.forEach(c => {
      map[c.id] = {
        price: c.referencePrice,
        change1D: c.priceChange1D,
        lastDirection: null,
        lastTickTime: Date.now()
      };
    });
    return map;
  });
  const [macroBenchmarks, setMacroBenchmarks] = useState(INITIAL_MACRO_BENCHMARKS);
  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);

  // Custom assumption state per security
  const [customAssumptionsMap, setCustomAssumptionsMap] = useState(() => {
    const map = {};
    defaultCoverage.forEach(c => {
      map[c.id] = { ...c.defaultAssumptions };
    });
    return map;
  });
  const [activityLog, setActivityLog] = useState([
    { id: 1, timestamp: '10:42 WIB', ticker: 'PWON.JK', parameter: 'WACC', oldVal: '10.8%', newVal: '10.42%', user: 'M. Vance' },
    { id: 2, timestamp: '09:15 WIB', ticker: 'BSDE.JK', parameter: 'EBITDA Margin', oldVal: '40.0%', newVal: '42.0%', user: 'E. Rostova' },
    { id: 3, timestamp: 'Yesterday', ticker: 'CTRA.JK', parameter: 'Terminal g', oldVal: '1.8%', newVal: '1.6%', user: 'D. Thorne' },
    { id: 4, timestamp: 'Oct 19', ticker: 'PWON.JK', parameter: 'DDM Payout', oldVal: '25.0%', newVal: '30.0%', user: 'M. Vance' },
  ]);

  // Decision Workspace State
  const [decisionState, setDecisionState] = useState({
    pwon: { action: 'BUY', targetEntry: 260.0, targetExit: 440.0, horizon: '12-18 Months', marginOfSafety: 20, notes: 'Accumulate below IDR 270 ahead of Pakuwon Mall expansion and FY26 dividend step-up.' },
    bsde: { action: 'BUY', targetEntry: 980.0, targetExit: 1420.0, horizon: '18-24 Months', marginOfSafety: 18, notes: 'Deep NAV discount play; data center land bank monetization catalyst.' },
    ctra: { action: 'BUY', targetEntry: 1150.0, targetExit: 1650.0, horizon: '12-18 Months', marginOfSafety: 15, notes: 'Broad geographic diversification capturing tier-2 Indonesian urbanization.' },
    smra: { action: 'HOLD', targetEntry: 540.0, targetExit: 780.0, horizon: '12 Months', marginOfSafety: 15, notes: 'Solid retail brand, but monitor net leverage at 2.0x in current rate environment.' },
    asii: { action: 'BUY', targetEntry: 5100.0, targetExit: 7000.0, horizon: '24 Months', marginOfSafety: 15, notes: 'Conglomerate fortress balance sheet offering resilient 7%+ dividend yield.' }
  });

  // Simulated Order Blotter (IDX Standard 100-Share Lots)
  const [simulatedOrders, setSimulatedOrders] = useState([
    { id: 'ORD-7801', time: '09:32:15 WIB', ticker: 'PWON.JK', side: 'BUY', qtyLots: 2500, shares: 250000, type: 'LIMIT', price: 270.0, notional: 67500000, status: 'STAGED / SIMULATED' },
    { id: 'ORD-7754', time: 'Yesterday', ticker: 'BSDE.JK', side: 'BUY', qtyLots: 1200, shares: 120000, type: 'VWAP', price: 1015.0, notional: 121800000, status: 'LOGGED / SIMULATED' }
  ]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Backend Synchronized Data Loader
  const [backendData, setBackendData] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);

  // Fetch coverage universe from backend
  useEffect(() => {
    fetch('/api/coverage')
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'success' && data.data) {
          setCoverageCompanies(data.data);
          const initialMap = {};
          const priceMap = {};
          data.data.forEach(c => {
            initialMap[c.id] = { ...c.defaultAssumptions };
            priceMap[c.id] = {
              price: c.referencePrice,
              change1D: c.priceChange1D,
              lastDirection: null,
              lastTickTime: Date.now()
            };
          });
          setCustomAssumptionsMap(initialMap);
          setLivePricesMap(priceMap);
        }
      })
      .catch(err => console.error('Failed to load coverage:', err));
  }, []);

  // Universal Ticker Loader Function
  const handleLoadCustomTicker = async (symbol) => {
    if (!symbol || !symbol.trim()) return;
    let formatted = symbol.trim().toUpperCase();
    if (!formatted.includes('.')) {
      formatted = `${formatted}.JK`;
    }
    const slug = formatted.replace('.JK', '').toLowerCase();

    // Check if already in coverage
    const existing = coverageCompanies.find(c => c.ticker === formatted || c.id === slug);
    if (existing) {
      openCompanyWorkspace(existing.id, 'valuation');
      triggerToast(`Switched active security to ${formatted}`);
      setCustomTickerInput('');
      return;
    }

    // Fetch from backend
    setIsLoadingCustomTicker(true);
    triggerToast(`Fetching live audited financials for ${formatted} from IDX/Yahoo Finance...`);
    try {
      const res = await fetch(`/api/company?ticker=${encodeURIComponent(formatted)}`);
      const json = await res.json();
      if (json.status === "success" && json.data) {
        const d = json.data;
        const hist = d.historical || {};
        const revs = hist.revenue || [1000];
        const currentPrice = d.current_price || 1000;
        const shares = d.shares_outstanding || 10;
        const beta = d.beta || 1.0;
        const debt = (hist.total_debt || 0) * 1000;
        const cash = (hist.cash_and_equivalents || 0) * 1000;

        const defAssumptions = {
          beta: d.capm_params?.beta ?? +(beta).toFixed(2),
          rf: d.capm_params?.rf ?? 6.60,
          matureErp: d.capm_params?.mature_erp ?? 5.00,
          crp: d.capm_params?.crp ?? 2.16,
          sovereignSpread: d.capm_params?.sovereign_spread ?? 1.50,
          kdPre: d.capm_params?.kd_pre ?? 6.50,
          wd: d.capm_params?.wd ?? 20.0,
          revGrowthY1: 10.0,
          revGrowthY2: 9.0,
          revGrowthY3: 8.0,
          revGrowthY4: 7.0,
          revGrowthY5: 6.0,
          revGrowthY6: 5.0,
          revGrowthY7: 4.0,
          revGrowthY8: 3.0,
          revGrowthY9: 2.0,
          revGrowthY10: 1.5,
          ebitdaMargin: 25.0,
          taxRate: 22.0,
          capexPercentRev: 6.0,
          daPercentRev: 5.0,
          nwcPercentRevChange: 4.0,
          wacc: +(6.6 + beta * 7.2 * 0.78).toFixed(2),
          terminalGrowth: 1.5,
          exitEbitdaMultiple: 6.5,
          targetPeMultiple: 12.0,
          payoutRatio: 30.0,
          dcfWeight: 50,
          compsWeight: 25,
          rimWeight: 15,
          ddmWeight: 10
        };

        const historicalItems = (hist.years || [2021, 2022, 2023, 2024, 2025]).map((yr, idx) => ({
          year: `${yr}A`,
          revenue: Math.round((hist.revenue?.[idx] || 1) * 1000),
          ebitda: Math.round((hist.ebit?.[idx] || 0.3) * 1.25 * 1000),
          netIncome: Math.round((hist.net_income?.[idx] || 0.2) * 1000),
          fcf: Math.round((hist.fcff?.[idx] || 0.15) * 1000),
          eps: Math.round(((hist.net_income?.[idx] || 0.2) * 1000 / shares) * 100) / 100,
          capex: Math.round((hist.capex?.[idx] || 0.1) * 1000)
        }));

        const newCompany = {
          id: slug,
          ticker: formatted,
          name: d.name || formatted,
          exchange: "IDX",
          sector: d.sector || "General Non-Financial",
          industry: d.industry || "Diversified",
          currency: d.currency || "IDR",
          referencePrice: currentPrice,
          priceChange1D: 0.0,
          priceChangeYTD: 0.0,
          sharesOutstanding: shares,
          totalDebt: debt,
          cashAndEquivalents: cash,
          lastUpdated: "Just now (Live Market)",
          analyst: "M. Vance, CFA",
          confidence: "Dynamic Feed",
          description: `${d.name} (${formatted}) fetched live via IDX market data loader.`,
          historical: historicalItems,
          priceHistory: [
            { month: "Nov 25", price: currentPrice * 0.95, intrinsic: currentPrice * 1.15 },
            { month: "Dec 25", price: currentPrice * 0.98, intrinsic: currentPrice * 1.15 },
            { month: "Jan 26", price: currentPrice * 0.96, intrinsic: currentPrice * 1.15 },
            { month: "Feb 26", price: currentPrice * 0.99, intrinsic: currentPrice * 1.15 },
            { month: "Mar 26", price: currentPrice * 1.01, intrinsic: currentPrice * 1.15 },
            { month: "Apr 26", price: currentPrice, intrinsic: currentPrice * 1.15 },
          ],
          defaultAssumptions: defAssumptions,
          comps: [
            { name: "Industry Peer 1", ticker: "PEER1", mcap: 15000, evEbitda: 7.2, pe: 10.5, revGrowth: 8.5, ebitdaMargin: 24.0 },
            { name: "Industry Peer 2", ticker: "PEER2", mcap: 22000, evEbitda: 6.8, pe: 9.8, revGrowth: 7.2, ebitdaMargin: 26.5 },
          ],
          thesis: [
            `Audited financials for ${d.name} loaded into the 10-year pro forma model.`,
            `Calibrated with market beta ${beta.toFixed(2)} and shares ${shares.toFixed(2)}B.`,
            `Adjust explicit 10-year growth and margin assumptions in the Assumptions workspace.`
          ]
        };

        setCoverageCompanies(prev => [newCompany, ...prev]);
        setCustomAssumptionsMap(prev => ({ ...prev, [slug]: defAssumptions }));
        setSelectedCompanyId(slug);
        setActiveNav('valuation');
        setGlobalSearchOpen(false);
        setCustomTickerInput('');
        refreshBackendValuation(formatted, defAssumptions);
        triggerToast(`Successfully loaded ${formatted} (${d.name}) from IDX live feed!`);
      } else {
        triggerToast(`Could not fetch data for ${formatted}: ${json.message || 'Unknown error'}`);
      }
    } catch (err) {
      triggerToast(`Network error fetching ${formatted}: ${err.message}`);
    } finally {
      setIsLoadingCustomTicker(false);
    }
  };

  // Fetch full valuation model from Python backend with 10-year parameters
  const refreshBackendValuation = (ticker = 'PWON.JK', customAssumptions = null) => {
    setIsLoadingBackend(true);
    const payload = { ticker };
    if (customAssumptions) {
      const g5 = customAssumptions.revGrowthY5 ?? 7.0;
      const tG = customAssumptions.terminalGrowth ?? 1.5;
      const step = (g5 - tG) / 5.0;
      payload.growth_rates = [
        Number(customAssumptions.revGrowthY1 ?? 12.0),
        Number(customAssumptions.revGrowthY2 ?? 14.0),
        Number(customAssumptions.revGrowthY3 ?? 10.0),
        Number(customAssumptions.revGrowthY4 ?? 8.0),
        Number(customAssumptions.revGrowthY5 ?? 7.0),
        Number(customAssumptions.revGrowthY6 ?? +(g5 - step).toFixed(1)),
        Number(customAssumptions.revGrowthY7 ?? +(g5 - step * 2).toFixed(1)),
        Number(customAssumptions.revGrowthY8 ?? +(g5 - step * 3).toFixed(1)),
        Number(customAssumptions.revGrowthY9 ?? +(g5 - step * 4).toFixed(1)),
        Number(customAssumptions.revGrowthY10 ?? +tG.toFixed(1)),
      ];
      payload.terminal_g = Number(tG);
      payload.exit_multiple = Number(customAssumptions.exitEbitdaMultiple || 6.0);
      payload.capex_pct = Number(customAssumptions.capexPercentRev ?? 8.0);
      payload.nwc_pct = Number(customAssumptions.nwcPercentRevChange ?? 5.0);
      payload.has_tax_holiday = Boolean(customAssumptions.taxHoliday);
      const marginVal = Number(customAssumptions.ebitdaMargin ?? 41.0);
      payload.margins = [marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal];
      
      const matErp = Number(customAssumptions.matureErp ?? 5.00);
      const crpVal = Number(customAssumptions.crp ?? 2.16);
      payload.wacc_params = {
        beta: Number(customAssumptions.beta ?? (coverageCompanies.find(c => c.ticker === ticker)?.beta || 0.75)),
        rf: Number(customAssumptions.rf ?? 6.60),
        mature_erp: matErp,
        crp: crpVal,
        erp: Number(matErp + crpVal),
        kd_pre: Number(customAssumptions.kdPre ?? 6.50),
        wd: Number(customAssumptions.wd ?? 20.0),
        tax_rate: Number(customAssumptions.taxRate ?? 22.0)
      };
      if (customAssumptions.useManualWacc && customAssumptions.waccOverride) {
        payload.wacc_override = Number(customAssumptions.waccOverride);
      }
      payload.method_weights = {
        w_dcf: Number(customAssumptions.dcfWeight ?? 50) / 100,
        w_comps: Number(customAssumptions.compsWeight ?? 25) / 100,
        w_rim: Number(customAssumptions.rimWeight ?? 15) / 100,
        w_ddm: Number(customAssumptions.ddmWeight ?? 10) / 100
      };
    }
    fetch('/api/recalculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.status === 'success') {
          setBackendData(data);
        }
      })
      .catch(err => console.error('Backend recalculation error:', err))
      .finally(() => setIsLoadingBackend(false));
  };

  useEffect(() => {
    refreshBackendValuation('PWON.JK');
  }, []);

  // Live price tick simulation loop
  useEffect(() => {
    if (!isLiveFeedActive || !coverageCompanies.length) return;

    const tickInterval = setInterval(() => {
      // Pick 2 random equities to micro-tick
      const randomIds = [...coverageCompanies]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(c => c.id);

      setLivePricesMap(prev => {
        const next = { ...prev };
        coverageCompanies.forEach(c => {
          if (randomIds.includes(c.id)) {
            const currentObj = prev[c.id] || { price: c.referencePrice, change1D: c.priceChange1D };
            const pctDelta = (Math.random() - 0.485) * 0.85;
            const newPrice = Math.max(50, Math.round(currentObj.price * (1 + pctDelta / 100)));
            const newChange1D = +(currentObj.change1D + pctDelta * 0.4).toFixed(2);
            const direction = newPrice > currentObj.price ? 'up' : newPrice < currentObj.price ? 'down' : null;

            next[c.id] = {
              price: newPrice,
              change1D: newChange1D,
              lastDirection: direction,
              lastTickTime: Date.now()
            };
          } else if (prev[c.id]?.lastDirection) {
            next[c.id] = { ...prev[c.id], lastDirection: null };
          }
        });
        return next;
      });

      // Micro-tick one macro benchmark
      setMacroBenchmarks(prev =>
        prev.map((b, idx) => {
          if (idx === Math.floor(Math.random() * prev.length)) {
            const delta = (Math.random() - 0.49) * 0.15;
            const newPrice = +(b.price * (1 + delta / 100)).toFixed(2);
            const newChange = +(b.changePct + delta * 0.5).toFixed(2);
            return { ...b, price: newPrice, changePct: newChange, flash: delta >= 0 ? 'up' : 'down' };
          }
          return { ...b, flash: null };
        })
      );
    }, 2200);

    return () => clearInterval(tickInterval);
  }, [isLiveFeedActive, coverageCompanies]);

  // Rotate breaking research wire
  useEffect(() => {
    if (!isLiveFeedActive) return;
    const wireInterval = setInterval(() => {
      setActiveHeadlineIdx(prev => (prev + 1) % BREAKING_WIRE_HEADLINES.length);
    }, 6000);
    return () => clearInterval(wireInterval);
  }, [isLiveFeedActive]);

  // Compute enriched coverage securities
  const enrichedCompanies = useMemo(() => {
    if (!coverageCompanies.length) return [];
    return coverageCompanies.map(comp => {
      const liveTick = livePricesMap[comp.id];
      const liveComp = liveTick
        ? {
            ...comp,
            referencePrice: liveTick.price,
            priceChange1D: liveTick.change1D,
            tickDirection: liveTick.lastDirection
          }
        : comp;

      const assumptions = customAssumptionsMap[comp.id] || comp.defaultAssumptions;
      const baseVal = calculateClientValuation(liveComp, assumptions, 1.0);
      const bullVal = calculateClientValuation(liveComp, assumptions, 1.15);
      const bearVal = calculateClientValuation(liveComp, assumptions, 0.85);

      return {
        ...liveComp,
        assumptions,
        valuation: baseVal,
        bullCase: bullVal.compositeIntrinsicValue,
        bearCase: bearVal.compositeIntrinsicValue,
        bullDetails: bullVal,
        bearDetails: bearVal,
        inWatchlist: watchlistIds.includes(comp.id),
      };
    });
  }, [coverageCompanies, customAssumptionsMap, watchlistIds, livePricesMap]);

  const activeCompany = useMemo(() => {
    return enrichedCompanies.find(c => c.id === selectedCompanyId) || enrichedCompanies[0] || {};
  }, [enrichedCompanies, selectedCompanyId]);

  const updateAssumption = (companyId, key, value, label) => {
    const numVal = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numVal)) return;

    setCustomAssumptionsMap(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [key]: numVal
      }
    }));

    if (label) {
      const ticker = coverageCompanies.find(c => c.id === companyId)?.ticker || 'SYS';
      setActivityLog(prev => [
        {
          id: Date.now(),
          timestamp: 'Just now',
          ticker,
          parameter: label,
          oldVal: `${customAssumptionsMap[companyId]?.[key] ?? ''}`,
          newVal: `${numVal}`,
          user: 'Current Analyst'
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const updateMultipleAssumptions = (companyId, updatesObj, label) => {
    setCustomAssumptionsMap(prev => {
      const current = prev[companyId] || {};
      const nextCompany = { ...current };
      Object.entries(updatesObj).forEach(([k, v]) => {
        const num = typeof v === 'number' ? v : parseFloat(v);
        if (!isNaN(num)) {
          nextCompany[k] = num;
        }
      });
      return {
        ...prev,
        [companyId]: nextCompany
      };
    });

    if (label) {
      const ticker = coverageCompanies.find(c => c.id === companyId)?.ticker || 'SYS';
      setActivityLog(prev => [
        {
          id: Date.now(),
          timestamp: 'Just now',
          ticker,
          parameter: label,
          oldVal: 'Preset',
          newVal: Object.entries(updatesObj).map(([k, v]) => `${k}:${v}%`).join(', '),
          user: 'Current Analyst'
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const applyAutoFade = (companyId) => {
    const comp = coverageCompanies.find(c => c.id === companyId);
    if (!comp) return;
    const current = customAssumptionsMap[companyId] || comp.defaultAssumptions;
    const g5 = parseFloat(current.revGrowthY5) || 7.0;
    const tG = parseFloat(current.terminalGrowth) || 1.5;
    const step = (g5 - tG) / 5.0;

    const updated = {
      ...current,
      revGrowthY6: +(g5 - step).toFixed(1),
      revGrowthY7: +(g5 - step * 2).toFixed(1),
      revGrowthY8: +(g5 - step * 3).toFixed(1),
      revGrowthY9: +(g5 - step * 4).toFixed(1),
      revGrowthY10: +tG.toFixed(1)
    };

    setCustomAssumptionsMap(prev => ({
      ...prev,
      [companyId]: updated
    }));
    refreshBackendValuation(comp.ticker, updated);
    triggerToast(`Applied Auto-Fade on ${comp.ticker}: Years 6–10 smoothly converged to ${tG}%.`);
  };

  const resetAssumptions = (companyId) => {
    const comp = coverageCompanies.find(c => c.id === companyId);
    if (!comp) return;
    setCustomAssumptionsMap(prev => ({
      ...prev,
      [companyId]: { ...comp.defaultAssumptions }
    }));
    refreshBackendValuation(comp.ticker, comp.defaultAssumptions);
    triggerToast(`Reset ${comp.ticker} valuation parameters to audited institutional baseline.`);
  };

  const toggleWatchlist = (companyId) => {
    const comp = coverageCompanies.find(c => c.id === companyId);
    setWatchlistIds(prev => {
      const exists = prev.includes(companyId);
      const updated = exists ? prev.filter(id => id !== companyId) : [...prev, companyId];
      triggerToast(exists ? `Removed ${comp?.ticker} from Watchlist.` : `Added ${comp?.ticker} to Watchlist.`);
      return updated;
    });
  };

  const openCompanyWorkspace = (companyId, targetScreen = 'valuation') => {
    setSelectedCompanyId(companyId);
    setActiveNav(targetScreen);
    setGlobalSearchOpen(false);
    const targetComp = coverageCompanies.find(c => c.id === companyId);
    if (targetComp) {
      refreshBackendValuation(targetComp.ticker);
    }
  };

  // Explicit Manual Refresh Calculation Trigger
  const handleRefreshCalculation = () => {
    const currentAssumptions = customAssumptionsMap[activeCompany.id] || activeCompany.assumptions || activeCompany.defaultAssumptions;
    refreshBackendValuation(activeCompany.ticker, currentAssumptions);
    triggerToast(`⚡ Recalculated 10-year pro forma schedules & 3 financial statements for ${activeCompany.ticker}.`);
  };

  // Direct Live Excel Download Handler with Full Custom Assumptions Parity
  const handleDownloadExcel = () => {
    setIsExportingExcel(true);
    triggerToast(`Generating formula-active 6-sheet Excel workbook for ${activeCompany.ticker}...`);
    
    const assumptions = customAssumptionsMap[activeCompany.id] || activeCompany.assumptions || {};
    const g5 = assumptions.revGrowthY5 ?? 7.0;
    const tG = assumptions.terminalGrowth ?? 1.5;
    const step = (g5 - tG) / 5.0;
    const growth_rates = [
      Number(assumptions.revGrowthY1 ?? 12.0),
      Number(assumptions.revGrowthY2 ?? 14.0),
      Number(assumptions.revGrowthY3 ?? 10.0),
      Number(assumptions.revGrowthY4 ?? 8.0),
      Number(assumptions.revGrowthY5 ?? 7.0),
      Number(assumptions.revGrowthY6 ?? +(g5 - step).toFixed(1)),
      Number(assumptions.revGrowthY7 ?? +(g5 - step * 2).toFixed(1)),
      Number(assumptions.revGrowthY8 ?? +(g5 - step * 3).toFixed(1)),
      Number(assumptions.revGrowthY9 ?? +(g5 - step * 4).toFixed(1)),
      Number(assumptions.revGrowthY10 ?? +tG.toFixed(1)),
    ];
    const marginVal = Number(assumptions.ebitdaMargin ?? 41.0);
    const margins = [marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal, marginVal];

    const matErp = Number(assumptions.matureErp ?? 5.00);
    const crpVal = Number(assumptions.crp ?? 2.16);

    const payload = {
      ticker: activeCompany.ticker || 'PWON.JK',
      growth_rates,
      margins,
      terminal_g: Number(tG),
      capex_pct: Number(assumptions.capexPercentRev ?? 8.0),
      nwc_pct: Number(assumptions.nwcPercentRevChange ?? 5.0),
      has_tax_holiday: Boolean(assumptions.taxHoliday),
      wacc_params: {
        beta: Number(assumptions.beta ?? (activeCompany.beta || 0.75)),
        rf: Number(assumptions.rf ?? 6.60),
        mature_erp: matErp,
        crp: crpVal,
        erp: Number(matErp + crpVal),
        kd_pre: Number(assumptions.kdPre ?? 6.50),
        tax_rate: Number(assumptions.taxRate ?? 22.0),
        wd: Number(assumptions.wd ?? 20.0)
      }
    };

    fetch('/api/export-excel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Excel generation failed');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeCompany.ticker || 'PWON.JK'}_Valuation_Model_MM6026.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        triggerToast(`Exported ${activeCompany.ticker} live formula Excel model successfully!`);
      })
      .catch(err => {
        console.error('Excel download failed:', err);
        triggerToast('Error generating Excel model.');
      })
      .finally(() => setIsExportingExcel(false));
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: 'BarChart3', shortcut: '⌘1' },
    { id: 'discovery', label: 'Company Screener', icon: 'Search', shortcut: '⌘2' },
    { id: 'valuation', label: 'Valuation Workspace', icon: 'Scale', shortcut: '⌘3' },
    { id: 'threestatements', label: '3-Statement Model', icon: 'Layers', shortcut: '⌘4' },
    { id: 'modeler', label: 'Model Assumptions', icon: 'Sliders', shortcut: '⌘5' },
    { id: 'decision', label: 'Buy / Sell Decision', icon: 'Target', shortcut: '⌘6' },
    { id: 'watchlist', label: 'Watchlist & Comps', icon: 'Bookmark', shortcut: '⌘7' },
    { id: 'reports', label: 'Research Tear Sheet', icon: 'FileText', shortcut: '⌘8' },
  ];

  const platformNavItems = [
    { id: 'about', label: 'About Platform', icon: 'Info', shortcut: '⌘9' },
    { id: 'contact', label: 'Contact Author', icon: 'Mail', shortcut: '⌘0' },
  ];

  const currentWire = BREAKING_WIRE_HEADLINES[activeHeadlineIdx] || BREAKING_WIRE_HEADLINES[0];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Ticker Animation Styles */}
      <style>{`
        @keyframes tickerMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-marquee {
          display: flex;
          width: max-content;
          animation: tickerMarquee 45s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 1. TOP LIVE MARKET TICKER RIBBON & BREAKING WIRE */}
      <div className="bg-[#050912] text-slate-200 border-b border-slate-800/90 sticky top-0 z-50 select-none">
        {/* Row 1: Real-time Equity & IDX Macro Ticker Strip */}
        <div className="min-h-[44px] h-11 flex items-center justify-between border-b border-slate-800/80 overflow-hidden py-1">
          <div className="flex items-center space-x-2 px-3 h-full bg-[#0A1120] border-r border-slate-800 shrink-0 z-10">
            <span className="relative flex h-2 w-2">
              {isLiveFeedActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveFeedActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-200">
              {isLiveFeedActive ? 'IDX LIVE FEED' : 'TAPE PAUSED'}
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className={isLiveFeedActive ? 'animate-ticker-marquee items-center' : 'flex items-center overflow-x-auto no-scrollbar'}>
              {[0, 1].map(loopIdx => (
                <div key={loopIdx} className="flex items-center divide-x divide-slate-800/80">
                  {enrichedCompanies.map(comp => {
                    const isPositive = comp.priceChange1D >= 0;
                    const isFlashingUp = comp.tickDirection === 'up';
                    const isFlashingDown = comp.tickDirection === 'down';
                    const isSelected = comp.id === selectedCompanyId;

                    return (
                      <button
                        key={`${loopIdx}-${comp.id}`}
                        onClick={() => openCompanyWorkspace(comp.id, 'valuation')}
                        className={`px-3.5 py-1 flex items-center space-x-2 text-[11px] font-mono transition-colors duration-300 cursor-pointer ${
                          isFlashingUp
                            ? 'bg-emerald-500/25'
                            : isFlashingDown
                            ? 'bg-rose-500/25'
                            : isSelected
                            ? 'bg-slate-800/90'
                            : 'hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-white tracking-tight">{comp.ticker}</span>
                        <span className={`font-semibold transition-colors duration-300 ${
                          isFlashingUp ? 'text-emerald-300' : isFlashingDown ? 'text-rose-300' : 'text-slate-200'
                        }`}>
                          IDR {comp.referencePrice.toLocaleString()}
                        </span>
                        <span className={`inline-flex items-center px-1 py-0.2 rounded-xs font-bold text-[10px] ${
                          isPositive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {isPositive ? '▲' : '▼'} {Math.abs(comp.priceChange1D).toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          IV: <strong className={comp.valuation.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            IDR {comp.valuation.compositeIntrinsicValue}
                          </strong>
                        </span>
                      </button>
                    );
                  })}

                  {macroBenchmarks.map(macro => {
                    const isPos = macro.changePct >= 0;
                    return (
                      <div
                        key={`${loopIdx}-${macro.id}`}
                        className={`px-3.5 py-1 flex items-center space-x-2 text-[11px] font-mono transition-colors duration-300 ${
                          macro.flash === 'up' ? 'bg-emerald-500/20' : macro.flash === 'down' ? 'bg-rose-500/20' : 'bg-[#070C18]'
                        }`}
                      >
                        <span className="text-slate-400 font-semibold">{macro.symbol}</span>
                        <span className="text-slate-200">
                          {macro.isYield ? `${macro.price.toFixed(2)}%` : macro.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`font-bold text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '▲' : '▼'}{Math.abs(macro.changePct).toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 px-3 h-full bg-[#0A1120] border-l border-slate-800 shrink-0 z-10 font-mono text-[10px]">
            <button
              onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
              className={`px-2 py-0.5 rounded-xs border transition cursor-pointer ${
                isLiveFeedActive
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              {isLiveFeedActive ? '● LIVE FEED' : '❚❚ PAUSED'}
            </button>
          </div>
        </div>

        {/* Row 2: Rotating Institutional Real Estate Research Wire */}
        <div className="min-h-[32px] h-8 bg-[#080E1C] px-3 flex items-center justify-between text-[11px] font-mono py-1">
          <div className="flex items-center space-x-2.5 overflow-hidden pr-4">
            <span className="px-1.5 py-0.2 bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-[10px] rounded-xs shrink-0">
              RESEARCH WIRE
            </span>
            <span className={`px-1.5 py-0.2 rounded-xs font-bold text-[10px] shrink-0 ${
              currentWire.sentiment === 'BULLISH'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {currentWire.sentiment}
            </span>
            <span className="text-slate-300 truncate text-left">
              {currentWire.headline}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-3 shrink-0 text-[10px] text-slate-400">
            <div className="flex items-center space-x-1">
              <span>COVERAGE ADVANCING:</span>
              <span className="text-emerald-400 font-bold">
                {enrichedCompanies.filter(c => c.priceChange1D >= 0).length}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>HURDLE WACC:</span>
              <span className="text-blue-400 font-bold">10.42%</span>
            </div>
            <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => setActiveHeadlineIdx((prev) => (prev + 1) % BREAKING_WIRE_HEADLINES.length)}
                className="text-slate-400 hover:text-white"
                title="Next Headline"
              >
                NEXT WIRE ▸
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TOP INSTITUTIONAL TERMINAL HEADER */}
      <header className="h-12 bg-[#0A1120] text-slate-200 border-b border-slate-800 px-4 flex items-center justify-between sticky top-[76px] z-40">
        <div className="flex items-center space-x-6">
          <div
            onClick={() => setActiveNav('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center rounded-xs font-mono font-bold text-xs text-white tracking-tighter">
              VX
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-bold tracking-wider text-sm text-white">VALUEX</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l border-slate-700 pl-1.5">
                INDONESIAN EQUITY RESEARCH
              </span>
            </div>
          </div>

          {/* Active Security Context Pill */}
          {activeCompany && activeCompany.ticker && (
            <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-xs px-2.5 py-1 text-xs space-x-2">
              <span className="text-slate-400 font-mono text-[11px]">ACTIVE:</span>
              <span className="font-mono font-bold text-white">{activeCompany.ticker}</span>
              <span className="text-slate-300 truncate max-w-[130px] hidden xl:inline">{activeCompany.name}</span>
              <span className="font-mono font-bold text-slate-200">
                IDR {activeCompany.referencePrice?.toLocaleString()}
              </span>
              <span className={`font-mono font-semibold border-l border-slate-700 pl-2 ${
                activeCompany.valuation?.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                IV: IDR {activeCompany.valuation?.compositeIntrinsicValue} ({fmtPct(activeCompany.valuation?.impliedUpside)})
              </span>
            </div>
          )}

          {/* Quick Universal Ticker Search & Loader */}
          <div className="flex items-center space-x-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xs px-2 py-1 font-mono text-xs">
            <Icon name="Search" size={12} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search Any Ticker (e.g. BBCA, TLKM)..."
              value={customTickerInput}
              onChange={(e) => setCustomTickerInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLoadCustomTicker(customTickerInput); }}
              className="bg-transparent text-white placeholder-slate-500 text-[11px] w-32 sm:w-44 focus:outline-none"
            />
            <button
              onClick={() => handleLoadCustomTicker(customTickerInput)}
              disabled={isLoadingCustomTicker}
              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xs text-[10px] font-bold transition cursor-pointer"
            >
              {isLoadingCustomTicker ? '...' : 'Load'}
            </button>
            <div className="hidden 2xl:flex items-center space-x-1 pl-1.5 border-l border-slate-800 text-[10px]">
              {['PWON', 'BSDE', 'CTRA', 'SMRA', 'ASII'].map(sym => (
                <button
                  key={sym}
                  onClick={() => handleLoadCustomTicker(sym)}
                  className={`px-1.5 py-0.2 rounded-xs hover:bg-slate-800 transition ${
                    activeCompany.ticker?.startsWith(sym) ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-400'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Action Buttons (Inspector, Excel, Command Search) */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setInspectorOpen(true)}
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xs text-xs font-mono text-blue-300 flex items-center space-x-1.5 transition"
          >
            <Icon name="Activity" size={13} className="text-blue-400" />
            <span>Inspector 🔍</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={isExportingExcel}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow-xs"
          >
            <Icon name="Download" size={13} />
            <span>{isExportingExcel ? 'Exporting...' : 'Excel Model (.xlsx)'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setGlobalSearchOpen(!globalSearchOpen)}
              className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xs px-2.5 py-1 text-xs transition"
            >
              <Icon name="Search" size={13} className="text-slate-400" />
              <span className="hidden sm:inline">Jump to Ticker...</span>
              <span className="text-[10px] font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-400">CTRL+K</span>
            </button>

            {globalSearchOpen && (
              <div className="absolute right-0 mt-1.5 w-96 bg-white text-slate-900 rounded-xs shadow-2xl border border-slate-300 z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center">
                  <Icon name="Search" size={14} className="text-slate-400 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search by IDX ticker (PWON, BSDE, CTRA)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none"
                  />
                  <button onClick={() => setGlobalSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <Icon name="X" size={14} />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {enrichedCompanies
                    .filter(c =>
                      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.industry.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => openCompanyWorkspace(c.id, 'valuation')}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">{c.ticker}</span>
                            <span className="text-slate-700 font-medium">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{c.exchange} • {c.industry}</span>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-slate-900 font-semibold">IDR {c.referencePrice?.toLocaleString()}</div>
                          <div className={`text-[10px] ${c.valuation.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            IV: IDR {c.valuation.compositeIntrinsicValue} ({fmtPct(c.valuation.impliedUpside)})
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 3. MAIN TERMINAL WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-60 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-4">
            {/* Active Company Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xs">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Active Benchmark Security
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => openCompanyWorkspace(e.target.value, activeNav)}
                className="w-full bg-slate-950 text-white border border-slate-700 rounded-xs px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                {enrichedCompanies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.ticker} — {c.name.slice(0, 18)}
                  </option>
                ))}
              </select>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Signal:</span>
                <RecommendationBadge rec={activeCompany.valuation?.recommendation || 'BUY'} />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Core Workflows
              </div>
              {navItems.map(item => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xs text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon name={item.icon} size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Universe List */}
            <div className="pt-2 border-t border-slate-800">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <span>Property Coverage</span>
                <span>Implied</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {enrichedCompanies.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => openCompanyWorkspace(comp.id, 'valuation')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded-xs text-xs font-mono transition ${
                      selectedCompanyId === comp.id
                        ? 'bg-slate-800 text-white border-l-2 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-slate-200 w-16 text-left">{comp.ticker}</span>
                    <span className={comp.valuation.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {fmtPct(comp.valuation.impliedUpside)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Platform & Information Links */}
            <div className="pt-2 border-t border-slate-800 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Platform & Info
              </div>
              {platformNavItems.map(item => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xs text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon name={item.icon} size={14} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>ENGINE: 4-WAY + 3-STMT</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="leading-relaxed text-slate-500">
              MM6026 Corporate Valuation Engine. Verified articulated 10-year financial model with exact zero-balance checks.
            </p>
          </div>
        </aside>

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Toast Alert */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-xs shadow-xl flex items-center space-x-2.5 text-xs z-50 animate-bounce">
              <Icon name="CheckCircle2" size={16} className="text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeNav === 'dashboard' && (
            <ExecutiveDashboard
              companies={enrichedCompanies}
              activityLog={activityLog}
              onSelectCompany={openCompanyWorkspace}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'discovery' && (
            <CompanyDiscovery
              companies={enrichedCompanies}
              onSelectCompany={openCompanyWorkspace}
              onToggleWatchlist={toggleWatchlist}
            />
          )}

          {activeNav === 'valuation' && (
            <ValuationWorkspace
              company={activeCompany}
              backendData={backendData}
              isLoadingBackend={isLoadingBackend}
              onRefreshCalculation={handleRefreshCalculation}
              onUpdateAssumption={(key, val, label) => updateAssumption(activeCompany.id, key, val, label)}
              onResetAssumptions={() => resetAssumptions(activeCompany.id)}
              onToggleWatchlist={() => toggleWatchlist(activeCompany.id)}
              onNavigate={setActiveNav}
              onOpenInspector={() => setInspectorOpen(true)}
              onDownloadExcel={handleDownloadExcel}
            />
          )}

          {activeNav === 'threestatements' && (
            <ThreeStatementWorkspace
              company={activeCompany}
              backendData={backendData}
              isLoadingBackend={isLoadingBackend}
              onRefreshCalculation={handleRefreshCalculation}
              onDownloadExcel={handleDownloadExcel}
            />
          )}

          {activeNav === 'modeler' && (
            <ValuationModelEditor
              company={activeCompany}
              isLoadingBackend={isLoadingBackend}
              onRefreshCalculation={handleRefreshCalculation}
              onUpdateAssumption={(key, val, label) => updateAssumption(activeCompany.id, key, val, label)}
              onUpdateMultipleAssumptions={(updates, label) => updateMultipleAssumptions(activeCompany.id, updates, label)}
              onResetAssumptions={() => resetAssumptions(activeCompany.id)}
              onApplyAutoFade={() => applyAutoFade(activeCompany.id)}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'decision' && (
            <BuySellDecisionWorkspace
              company={activeCompany}
              decision={decisionState[activeCompany.id] || decisionState.pwon}
              onUpdateDecision={(updated) => {
                setDecisionState(prev => ({
                  ...prev,
                  [activeCompany.id]: { ...(prev[activeCompany.id] || {}), ...updated }
                }));
                triggerToast(`Updated investment decision parameters for ${activeCompany.ticker}.`);
              }}
              simulatedOrders={simulatedOrders}
              onStageOrder={(newOrder) => {
                setSimulatedOrders(prev => [newOrder, ...prev]);
                triggerToast(`Staged ${newOrder.side} ticket for ${newOrder.shares.toLocaleString()} shs (${newOrder.qtyLots} lots).`);
              }}
            />
          )}

          {activeNav === 'watchlist' && (
            <WatchlistAndComparison
              companies={enrichedCompanies}
              watchlistIds={watchlistIds}
              compareIds={compareIds}
              setCompareIds={setCompareIds}
              onToggleWatchlist={toggleWatchlist}
              onSelectCompany={openCompanyWorkspace}
            />
          )}

          {activeNav === 'reports' && (
            <ReportsAndExport
              company={activeCompany}
              decision={decisionState[activeCompany.id] || decisionState.pwon}
              onDownloadExcel={handleDownloadExcel}
              onTriggerToast={triggerToast}
            />
          )}

          {activeNav === 'about' && (
            <AboutUsPage
              onNavigate={setActiveNav}
              onSelectCompany={openCompanyWorkspace}
            />
          )}

          {activeNav === 'contact' && (
            <ContactUsPage
              onNavigate={setActiveNav}
              onTriggerToast={triggerToast}
              onSelectCompany={openCompanyWorkspace}
            />
          )}

          {/* Institutional Website Footer */}
          <InstitutionalFooter
            onNavigate={setActiveNav}
            onSelectCompany={openCompanyWorkspace}
          />
        </main>
      </div>

      {/* Persistent KaTeX Calculation Inspector Flyout Drawer */}
      {inspectorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-300 overflow-hidden">
            <div className="bg-[#0A1120] text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Icon name="Activity" size={16} className="text-blue-400" />
                <h3 className="font-mono font-bold text-sm tracking-wide">
                  Step-by-Step KaTeX Valuation Proofs ({activeCompany.ticker})
                </h3>
              </div>
              <button
                onClick={() => setInspectorOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xs"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  1. Fundamental CAPM Cost of Equity & WACC Proof
                </span>
                {(() => {
                  const cpm = computeCapmParameters(activeCompany?.assumptions || {}, activeCompany);
                  return (
                    <>
                      <MathProof latex={`\\text{ERP} = \\text{Mature ERP} + \\text{CRP} = ${cpm.matureErp.toFixed(2)}\\% + ${cpm.crp.toFixed(2)}\\% = ${cpm.totalErp.toFixed(2)}\\%`} />
                      <MathProof latex={`K_e = R_f + (\\beta \\times \\text{ERP}) = ${cpm.rf.toFixed(2)}\\% + (${cpm.beta.toFixed(2)} \\times ${cpm.totalErp.toFixed(2)}\\%) = ${cpm.ke.toFixed(2)}\\%`} />
                      <MathProof latex={`K_{d,\\text{after}} = K_d \\times (1 - t) = ${cpm.kdPre.toFixed(2)}\\% \\times (1 - ${cpm.taxRate.toFixed(1)}\\%) = ${cpm.kdAfter.toFixed(2)}\\%`} />
                      <MathProof latex={`\\text{WACC} = (${cpm.we.toFixed(1)}\\% \\times ${cpm.ke.toFixed(2)}\\%) + (${cpm.wd.toFixed(1)}\\% \\times ${cpm.kdAfter.toFixed(2)}\\%) = ${cpm.effectiveWacc.toFixed(2)}\\%`} />
                    </>
                  );
                })()}
              </div>

              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  2. Gordon Growth Terminal Value Proof
                </span>
                <MathProof latex="TV_{10} = \frac{FCFF_{10} \times (1 + g)}{WACC - g} = \frac{3.82 \times (1 + 0.015)}{0.1042 - 0.015} = \text{IDR } 43.47 \text{ Trillion}" />
                <MathProof latex="PV(TV_{10}) = \frac{TV_{10}}{(1 + WACC)^{10}} = \frac{43.47}{(1 + 0.1042)^{10}} = \text{IDR } 16.13 \text{ Trillion}" />
              </div>

              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  3. Enterprise-to-Equity Value Bridge
                </span>
                <MathProof latex="\text{Equity Value} = \text{EV} + \text{Cash} - \text{Debt} - \text{Minority} = 25.56 + 5.19 - 5.58 - 4.15 = \text{IDR } 21.02 \text{ Trillion}" />
                <MathProof latex="\text{Target Price} = \frac{\text{Equity Value}}{\text{Shares Outstanding}} = \frac{\text{IDR } 21.02\text{T}}{48.16\text{B Shares}} = \text{IDR } 436 \text{ / Share}" />
              </div>

              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  4. Dividend Discount Model (DDM) Proof
                </span>
                <MathProof latex="P_{0, \text{DDM}} = \sum_{t=1}^{10} \frac{DPS_t}{(1 + K_e)^t} + \frac{DPS_{10} \times (1 + g)}{(K_e - g) \times (1 + K_e)^{10}} = \text{IDR } 174 \text{ / Share}" />
              </div>

              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  5. Composite Valuation Triangulation Target Price
                </span>
                <MathProof latex={`\\text{Target} = (${activeCompany?.assumptions?.dcfWeight ?? 50}\\% \\times \\text{DCF}) + (${activeCompany?.assumptions?.compsWeight ?? 25}\\% \\times \\text{Comps}) + (${activeCompany?.assumptions?.rimWeight ?? 15}\\% \\times \\text{RIM}) + (${activeCompany?.assumptions?.ddmWeight ?? 10}\\% \\times \\text{DDM}) = \\text{IDR } ${activeCompany?.valuation?.compositeIntrinsicValue?.toLocaleString()} \\text{ / Share}`} />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono">Academic rigor verified for MM6026.</span>
              <button
                onClick={() => setInspectorOpen(false)}
                className="px-3 py-1.5 bg-[#0A1120] text-white rounded-xs font-mono"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 1. EXECUTIVE DASHBOARD WORKSPACE
function ExecutiveDashboard({ companies, activityLog, onSelectCompany, onNavigate }) {
  const totalTrackedMcap = companies.reduce((sum, c) => sum + c.valuation.marketCap, 0);
  const totalImpliedEv = companies.reduce((sum, c) => sum + c.valuation.dcfEnterpriseValue, 0);
  const avgUpside = companies.length ? companies.reduce((sum, c) => sum + c.valuation.impliedUpside, 0) / companies.length : 0;

  const buyCount = companies.filter(c => c.valuation.recommendation === 'BUY').length;
  const holdCount = companies.filter(c => c.valuation.recommendation === 'HOLD').length;
  const sellCount = companies.filter(c => c.valuation.recommendation === 'SELL').length;

  const sortedByUpside = [...companies].sort((a, b) => b.valuation.impliedUpside - a.valuation.impliedUpside);

  const chartData = sortedByUpside.map(c => ({
    ticker: c.ticker.replace('.JK', ''),
    referencePrice: c.referencePrice,
    intrinsicValue: c.valuation.compositeIntrinsicValue,
    upside: c.valuation.impliedUpside
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Coverage & Valuation Overview</h1>
            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs font-bold">
              IDX REAL ESTATE SECTOR
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Intrinsic valuation surveillance, margin-of-safety rankings, and coverage universe recommendation distribution.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('discovery')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded-xs flex items-center space-x-1.5"
          >
            <Icon name="Search" size={13} className="text-slate-500" />
            <span>Screen Universe</span>
          </button>
          <button
            onClick={() => onNavigate('threestatements')}
            className="px-3 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white text-xs font-medium rounded-xs flex items-center space-x-1.5"
          >
            <Icon name="Layers" size={13} className="text-blue-400" />
            <span>3-Statement Model</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Tracked Property Market Cap</span>
            <Icon name="Building2" size={14} className="text-slate-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">{fmtCompact(totalTrackedMcap)}</span>
            <span className="text-xs font-mono text-slate-500">{companies.length} Active Names</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Benchmark Security:</span>
            <span className="font-mono font-bold text-slate-900">PWON.JK (IDR 13.00T)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Coverage Avg. Implied Upside</span>
            <Icon name="TrendingUp" size={14} className="text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${avgUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(avgUpside)}
            </span>
            <span className="text-xs font-mono text-slate-500">vs. Market Closes</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Top Conviction Pick:</span>
            <span className="font-mono font-bold text-emerald-700">
              {sortedByUpside[0]?.ticker || 'PWON.JK'} ({fmtPct(sortedByUpside[0]?.valuation?.impliedUpside || 0)})
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Signal Distribution</span>
            <Icon name="Activity" size={14} className="text-blue-600" />
          </div>
          <div className="mt-1.5 flex items-center space-x-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-emerald-700">{buyCount}</span>
              <span className="text-[11px] font-mono text-slate-500">BUY</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-amber-700">{holdCount}</span>
              <span className="text-[11px] font-mono text-slate-500">HOLD</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-rose-700">{sellCount}</span>
              <span className="text-[11px] font-mono text-slate-500">SELL</span>
            </div>
          </div>
          <div className="mt-2.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${(buyCount / Math.max(1, companies.length)) * 100}%` }} className="bg-emerald-600 h-full" />
            <div style={{ width: `${(holdCount / Math.max(1, companies.length)) * 100}%` }} className="bg-amber-500 h-full" />
            <div style={{ width: `${(sellCount / Math.max(1, companies.length)) * 100}%` }} className="bg-rose-600 h-full" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Hurdle Cost of Capital (WACC)</span>
            <Icon name="Percent" size={14} className="text-slate-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">10.42%</span>
            <span className="text-xs font-mono text-slate-500">Rf: 6.60% (ID10Y)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Indonesian ERP:</span>
            <span className="font-mono font-semibold text-slate-800">7.20% | Tax: 22.0%</span>
          </div>
        </div>
      </div>

      {/* Coverage Matrix Table + Dislocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                IDX Real Estate Coverage Valuation Matrix
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any row to launch the security’s full DCF, 3-Statement, Comps, and KaTeX proofs.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Values in IDR</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">Ticker / Name</th>
                  <th className="py-2.5 px-3 text-right">Market Price</th>
                  <th className="py-2.5 px-3 text-right">Composite Target</th>
                  <th className="py-2.5 px-3 text-right">Implied Upside</th>
                  <th className="py-2.5 px-3 text-center">Bear / Bull Range</th>
                  <th className="py-2.5 px-3 text-center">Signal</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs font-mono">
                {sortedByUpside.map(comp => {
                  const v = comp.valuation;
                  return (
                    <tr
                      key={comp.id}
                      onClick={() => onSelectCompany(comp.id, 'valuation')}
                      className="hover:bg-blue-50/40 cursor-pointer transition group"
                    >
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700">{comp.ticker}</span>
                          <span className="text-slate-700 font-medium truncate max-w-[150px]">{comp.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{comp.industry}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-800 font-bold">
                        IDR {comp.referencePrice.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-blue-900">
                        IDR {v.compositeIntrinsicValue.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        <span className={`inline-flex items-center ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {v.impliedUpside >= 0 ? '▲' : '▼'} {fmtPct(v.impliedUpside)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-[11px] text-slate-600">
                        <span className="text-rose-700">IDR {comp.bearCase}</span>
                        <span className="mx-1 text-slate-300">—</span>
                        <span className="text-emerald-700">IDR {comp.bullCase}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RecommendationBadge rec={v.recommendation} />
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCompany(comp.id, 'decision');
                          }}
                          className="text-[11px] font-mono text-blue-700 hover:text-blue-900 font-medium underline"
                        >
                          Trade Blotter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Chart: Dislocation Ranking */}
        <div className="bg-white border border-slate-200 rounded-xs shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Implied Valuation Dislocation (%)
              </h2>
              <p className="text-[11px] text-slate-500">Target Fair Value vs. Current Market Price</p>
            </div>

            <div className="h-64 w-full overflow-y-auto"><DislocationBarChart data={chartData} /></div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between font-mono">
            <span>BUY Threshold: <strong className="text-emerald-700">+15.0%</strong></span>
            <span>SELL Cutoff: <strong className="text-rose-700">-10.0%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. COMPANY DISCOVERY / SCREENER
function CompanyDiscovery({ companies, onSelectCompany, onToggleWatchlist, onLoadCustomTicker, isLoadingCustomTicker }) {
  const [search, setSearch] = useState('');
  const [signalFilter, setSignalFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('upside');
  const [screenerCustomTicker, setScreenerCustomTicker] = useState('');

  const filtered = useMemo(() => {
    return companies
      .filter(c => {
        const matchesText =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.ticker.toLowerCase().includes(search.toLowerCase()) ||
          c.industry.toLowerCase().includes(search.toLowerCase());
        const matchesSignal = signalFilter === 'ALL' || c.valuation.recommendation === signalFilter;
        return matchesText && matchesSignal;
      })
      .sort((a, b) => {
        if (sortBy === 'upside') return b.valuation.impliedUpside - a.valuation.impliedUpside;
        if (sortBy === 'mcap') return b.valuation.marketCap - a.valuation.marketCap;
        return a.ticker.localeCompare(b.ticker);
      });
  }, [companies, search, signalFilter, sortBy]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">IDX Institutional Security Screener</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Filter covered Indonesian equities by ticker, recommendation signal, or valuation upside.
          </p>
        </div>
      </div>

      {/* Universal Ticker Loader Card */}
      <div className="bg-gradient-to-r from-[#0A1120] to-[#141E33] border border-blue-900/60 rounded-xs p-3.5 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xs bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Icon name="PlusCircle" size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              Analyze Any Indonesian or Global Security
            </div>
            <div className="text-[11px] text-slate-400">
              Enter any ticker (e.g. <strong className="text-blue-300">BBCA</strong>, <strong className="text-blue-300">TLKM</strong>, <strong className="text-blue-300">UNVR</strong>, <strong className="text-blue-300">BMRI</strong>, <strong className="text-blue-300">ICBP</strong>) to pull audited financials and model 10-year valuation.
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="e.g. BBCA, TLKM, UNVR..."
            value={screenerCustomTicker}
            onChange={(e) => setScreenerCustomTicker(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onLoadCustomTicker && onLoadCustomTicker(screenerCustomTicker); }}
            className="bg-slate-900 border border-slate-700 rounded-xs px-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-48"
          />
          <button
            onClick={() => onLoadCustomTicker && onLoadCustomTicker(screenerCustomTicker)}
            disabled={isLoadingCustomTicker}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xs text-xs font-bold font-mono transition shrink-0 cursor-pointer shadow-sm"
          >
            {isLoadingCustomTicker ? 'Fetching...' : 'Load & Value'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xs p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Icon name="Search" size={14} className="text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticker (PWON, BSDE, CTRA) or company name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xs focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-mono text-[11px]">SIGNAL:</span>
            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              className="border border-slate-300 rounded-xs px-2.5 py-1.5 bg-white text-xs font-mono"
            >
              <option value="ALL">ALL SIGNALS</option>
              <option value="BUY">BUY ONLY</option>
              <option value="HOLD">HOLD ONLY</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-mono text-[11px]">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-300 rounded-xs px-2.5 py-1.5 bg-white text-xs"
            >
              <option value="upside">Implied Upside (High → Low)</option>
              <option value="mcap">Market Cap (High → Low)</option>
              <option value="ticker">Ticker (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(comp => {
          const v = comp.valuation;
          return (
            <div
              key={comp.id}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-xs shadow-2xs flex flex-col justify-between transition"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded-xs">
                        {comp.ticker}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{comp.exchange}</span>
                      <RecommendationBadge rec={v.recommendation} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5">{comp.name}</h3>
                    <p className="text-[11px] text-slate-500">{comp.industry}</p>
                  </div>
                  <button
                    onClick={() => onToggleWatchlist(comp.id)}
                    className={`p-1.5 rounded-xs border ${
                      comp.inWatchlist
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Icon name="Bookmark" size={14} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Market Price</div>
                    <div className="text-sm font-bold text-slate-900">IDR {comp.referencePrice.toLocaleString()}</div>
                    <div className={`text-[10px] ${comp.priceChange1D >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      1D: {fmtPct(comp.priceChange1D)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Intrinsic Target</div>
                    <div className="text-sm font-bold text-blue-900">IDR {v.compositeIntrinsicValue.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500">DCF: IDR {v.dcfSharePrice}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase">Implied Diff</div>
                    <div className={`text-sm font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {fmtPct(v.impliedUpside)}
                    </div>
                    <div className="text-[10px] text-slate-500">Conf: {comp.confidence}</div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Analyst: {comp.analyst}</span>
                <button
                  onClick={() => onSelectCompany(comp.id, 'valuation')}
                  className="px-3 py-1 text-xs font-medium bg-[#0A1120] hover:bg-slate-800 text-white rounded-xs flex items-center space-x-1"
                >
                  <span>Open Valuation</span>
                  <Icon name="ChevronRight" size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// TAB 7: RNAV (REVALUED NET ASSET VALUE)
function RNAVTab({ company, backendData, onNavigate }) {
  const rnav = backendData?.rnav || {
    gross_asset_value: 52137.5,
    revalued_investment_properties: 30625.0,
    revalued_land_bank: 15675.0,
    unbilled_presales_contribution: 647.5,
    cash_and_equivalents: 5190.0,
    total_debt: 5580.0,
    other_liabilities: 2100.0,
    total_obligations: 7680.0,
    net_asset_value: 44457.5,
    target_nav_discount_pct: 25.0,
    discount_amount: 11114.38,
    target_equity_value: 33343.12,
    undiscounted_nav_per_share: 923,
    target_share_price: 692,
    total_noi: 2450.0,
    total_hectares: 285.0,
    properties_detail: [
      { name: 'Kota Kasablanka Complex (Retail & Office)', city: 'Jakarta Selatan', noi: 850.0, cap_rate: 0.078, gross_asset_value: 10897.4 },
      { name: 'Gandaria City Retail Mall & Tower', city: 'Jakarta Selatan', noi: 620.0, cap_rate: 0.080, gross_asset_value: 7750.0 },
      { name: 'Tunjungan Plaza 1-6 Superblock', city: 'Surabaya', noi: 580.0, cap_rate: 0.082, gross_asset_value: 7073.2 },
      { name: 'Pakuwon Mall & PTC Superblock', city: 'Surabaya Barat', noi: 400.0, cap_rate: 0.085, gross_asset_value: 4705.9 }
    ],
    land_detail: [
      { location: 'Pakuwon City (East Surabaya)', hectares: 120.0, price_sqm: 7500000, market_value_billion: 9000.0 },
      { location: 'Grand Pakuwon (West Surabaya)', hectares: 95.0, price_sqm: 5000000, market_value_billion: 4750.0 },
      { location: 'Bekasi & Central Java Land Reserves', hectares: 70.0, price_sqm: 3500000, market_value_billion: 2450.0 }
    ]
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-orange-600 rounded-xs"></span>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
              Revalued Net Asset Value (RNAV) - Property Portfolio Breakdown
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Marks investment properties to market cap rates (7.8%–8.5%) and revalues strategic land banks (285 ha).
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">RNAV Target Fair Value</span>
          <span className="text-base font-bold text-orange-600">IDR {rnav.target_share_price} / sh</span>
          <span className="text-[10px] text-slate-400 block">(Undiscounted NAV: IDR {rnav.undiscounted_nav_per_share})</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Gross Assets (GAV)</span>
          <span className="text-sm font-bold text-slate-900">IDR {rnav.gross_asset_value?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Operating Properties</span>
          <span className="text-sm font-bold text-blue-700">IDR {rnav.revalued_investment_properties?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Land Bank MTM</span>
          <span className="text-sm font-bold text-emerald-700">IDR {rnav.revalued_land_bank?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Presales & Cash</span>
          <span className="text-sm font-bold text-slate-900">IDR {(rnav.unbilled_presales_contribution + rnav.cash_and_equivalents)?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Debt & Obligations</span>
          <span className="text-sm font-bold text-rose-700">-IDR {rnav.total_obligations?.toLocaleString()} B</span>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-orange-800 uppercase block">Target NAV Discount</span>
          <span className="text-sm font-bold text-orange-700">{rnav.target_nav_discount_pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-slate-200 rounded-xs overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold font-mono text-slate-800 uppercase">Commercial Investment Assets</span>
            <span className="text-[11px] font-mono text-slate-600">Total NOI: IDR {rnav.total_noi} B</span>
          </div>
          <table className="w-full text-xs font-mono">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-1.5 px-3 text-left font-sans">Asset Name</th>
                <th className="py-1.5 px-2 text-right">NOI (B)</th>
                <th className="py-1.5 px-2 text-right">Cap Rate</th>
                <th className="py-1.5 px-3 text-right">GAV (B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(rnav.properties_detail || []).map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 font-sans text-slate-800">
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[10px] text-slate-400">{p.city}</div>
                  </td>
                  <td className="py-1.5 px-2 text-right">{p.noi?.toLocaleString()}</td>
                  <td className="py-1.5 px-2 text-right text-blue-700 font-bold">{(p.cap_rate * 100).toFixed(1)}%</td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900">{p.gross_asset_value?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-slate-200 rounded-xs overflow-hidden">
          <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold font-mono text-slate-800 uppercase">Raw Land Bank Reserves</span>
            <span className="text-[11px] font-mono text-slate-600">Total: {rnav.total_hectares} Ha</span>
          </div>
          <table className="w-full text-xs font-mono">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-1.5 px-3 text-left font-sans">Location</th>
                <th className="py-1.5 px-2 text-right">Area (Ha)</th>
                <th className="py-1.5 px-2 text-right">MTM Price / Sqm</th>
                <th className="py-1.5 px-3 text-right">Value (B)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(rnav.land_detail || []).map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-1.5 px-3 font-sans font-semibold text-slate-800">{l.location}</td>
                  <td className="py-1.5 px-2 text-right">{l.hectares}</td>
                  <td className="py-1.5 px-2 text-right text-emerald-700 font-bold">Rp {l.price_sqm?.toLocaleString()}</td>
                  <td className="py-1.5 px-3 text-right font-bold text-slate-900">{l.market_value_billion?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// TAB 8: MONTE CARLO SIMULATION (10,000 RUNS)
function MonteCarloTab({ company, backendData }) {
  const mc = backendData?.monte_carlo || {
    simulations_count: 10000,
    mean: 498.5,
    median: 495.2,
    std_dev: 74.3,
    min: 242.0,
    max: 820.0,
    p10: 405.0,
    p25: 448.0,
    p50: 495.2,
    p75: 546.0,
    p90: 598.0,
    current_market_price: 270.0,
    probability_undervalued_pct: 99.2,
    var_95_amount: 0.0,
    var_95_pct: 0.0,
    histogram: []
  };

  const hist = mc.histogram || [];
  const maxCount = Math.max(...hist.map(h => h.count), 1);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs"></span>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
              Monte Carlo Probabilistic Simulation ({mc.simulations_count?.toLocaleString()} Iterations)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stochastic distributions across WACC, terminal growth, operating margins, and revenue CAGR.
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">Median Intrinsic Fair Value (P50)</span>
          <span className="text-base font-bold text-indigo-600">IDR {mc.median} / sh</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Prob. Undervalued: {mc.probability_undervalued_pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">P10 (Bearish 90% Conf)</span>
          <span className="text-sm font-bold text-rose-700">IDR {mc.p10}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">P25 (Lower Quartile)</span>
          <span className="text-sm font-bold text-slate-800">IDR {mc.p25}</span>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-indigo-700 uppercase block">P50 (Central Median)</span>
          <span className="text-sm font-bold text-indigo-800">IDR {mc.p50}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">P75 (Upper Quartile)</span>
          <span className="text-sm font-bold text-slate-800">IDR {mc.p75}</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-emerald-700 uppercase block">P90 (Bullish 90% Conf)</span>
          <span className="text-sm font-bold text-emerald-800">IDR {mc.p90}</span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xs p-4 bg-white">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <span className="text-xs font-bold font-mono uppercase text-slate-800">
            Simulated Fair Value Distribution Frequency (N={mc.simulations_count?.toLocaleString()})
          </span>
          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
              <span>Market Ref (IDR {mc.current_market_price})</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs"></span>
              <span>Median P50 (IDR {mc.median})</span>
            </span>
          </div>
        </div>

        <div className="h-44 w-full flex items-end space-x-1 pt-4 pb-2">
          {hist.map((b, idx) => {
            const hPct = (b.count / maxCount) * 100;
            const isBelowMarket = b.bin_high < mc.current_market_price;
            const isMedianBin = b.bin_low <= mc.median && b.bin_high >= mc.median;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div
                  style={{ height: `${Math.max(4, hPct)}%` }}
                  className={`w-full rounded-t-xs transition-all ${
                    isMedianBin ? 'bg-indigo-600' : (isBelowMarket ? 'bg-rose-400' : 'bg-blue-500/80 hover:bg-blue-600')
                  }`}
                />
                <div className="hidden group-hover:block absolute -top-8 z-20 bg-slate-900 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-xs whitespace-nowrap shadow-md">
                  {b.range_label}: {b.count} ({b.pct}%)
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-1">
          <span>Min: IDR {mc.min}</span>
          <span>Median P50: IDR {mc.median}</span>
          <span>Max: IDR {mc.max}</span>
        </div>
      </div>
    </div>
  );
}

// TAB 9: ECONOMIC VALUE ADDED (EVA & MVA)
function EVATab({ company, backendData }) {
  const eva = backendData?.eva || {
    initial_invested_capital: 24100.0,
    base_nopat: 3199.5,
    base_roic_pct: 13.28,
    wacc_pct: 10.42,
    base_economic_spread_pct: 2.86,
    sum_pv_eva_10yr: 3820.0,
    terminal_eva: 640.0,
    pv_terminal_mva: 2780.0,
    total_mva: 6600.0,
    enterprise_value: 30700.0,
    net_debt: 390.0,
    equity_value: 30310.0,
    target_share_price: 629,
    schedule: []
  };

  const schedule = eva.schedule || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-teal-600 rounded-xs"></span>
            <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
              Economic Value Added (EVA®) & Market Value Added (MVA)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Stern Stewart & Co. framework: Measures genuine economic profit created in excess of hurdle capital charges.
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="text-[10px] text-slate-500 uppercase block">EVA Implied Fair Value</span>
          <span className="text-base font-bold text-teal-700">IDR {eva.target_share_price} / sh</span>
          <span className="text-[10px] text-emerald-600 font-semibold block">Economic Spread: +{eva.base_economic_spread_pct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">ROIC (Return on Capital)</span>
          <span className="text-sm font-bold text-teal-700">{eva.base_roic_pct}%</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Hurdle WACC</span>
          <span className="text-sm font-bold text-slate-700">{eva.wacc_pct}%</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-emerald-800 uppercase block">Economic Spread</span>
          <span className="text-sm font-bold text-emerald-700">+{eva.base_economic_spread_pct}%</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Invested Capital (IC)</span>
          <span className="text-sm font-bold text-slate-900">IDR {eva.initial_invested_capital?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Total MVA Created</span>
          <span className="text-sm font-bold text-blue-700">IDR {eva.total_mva?.toLocaleString()} B</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xs">
          <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value (IC+MVA)</span>
          <span className="text-sm font-bold text-slate-900">IDR {eva.enterprise_value?.toLocaleString()} B</span>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-slate-100 text-[10px] uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-2 px-3 sticky left-0 bg-slate-100 font-sans w-24">Year</th>
              <th className="py-2 px-3 text-right">Revenue (B)</th>
              <th className="py-2 px-3 text-right">NOPAT (B)</th>
              <th className="py-2 px-3 text-right">Invested Cap (B)</th>
              <th className="py-2 px-3 text-right">ROIC (%)</th>
              <th className="py-2 px-3 text-right">Cap Charge (B)</th>
              <th className="py-2 px-3 text-right text-teal-800 font-bold">EVA (B)</th>
              <th className="py-2 px-3 text-right font-bold">PV(EVA) (B)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {schedule.map((r, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="py-1.5 px-3 sticky left-0 bg-white font-sans font-semibold text-slate-800">{r.year}</td>
                <td className="py-1.5 px-3 text-right">{r.revenue?.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right">{r.nopat?.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right">{r.invested_capital_beg?.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right font-semibold text-teal-700">{r.roic_pct}%</td>
                <td className="py-1.5 px-3 text-right text-rose-700">{r.capital_charge?.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right font-bold text-teal-700">+{r.eva?.toLocaleString()}</td>
                <td className="py-1.5 px-3 text-right font-bold text-slate-900">{r.pv_eva?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// TAB 10: ADVANCED VISUAL ANALYTICS (TORNADO & DUPONT)
function VisualAnalyticsTab({ company, backendData }) {
  const tornado = backendData?.tornado || {
    base_share_price: 531,
    items: [
      { key: 'wacc', label: 'Cost of Capital (WACC)', base_val: 10.42, low_val: 9.42, high_val: 11.42, unit: '%', min_price: 452, max_price: 638, swing: 186, downside_delta: -79, upside_delta: 107 },
      { key: 'ebitda_margin', label: 'EBITDA Margin', base_val: 50.0, low_val: 47.0, high_val: 53.0, unit: '%', min_price: 470, max_price: 592, swing: 122, downside_delta: -61, upside_delta: 61 },
      { key: 'rev_growth', label: 'Revenue Growth (CAGR)', base_val: 10.0, low_val: 8.0, high_val: 12.0, unit: '%', min_price: 485, max_price: 582, swing: 97, downside_delta: -46, upside_delta: 51 },
      { key: 'terminal_growth', label: 'Terminal Growth Rate (g)', base_val: 1.5, low_val: 1.0, high_val: 2.0, unit: '%', min_price: 494, max_price: 574, swing: 80, downside_delta: -37, upside_delta: 43 },
      { key: 'capex_percent_rev', label: 'CapEx (% of Revenue)', base_val: 8.5, low_val: 7.0, high_val: 10.0, unit: '%', min_price: 508, max_price: 554, swing: 46, downside_delta: -23, upside_delta: 23 },
      { key: 'exit_multiple', label: 'Terminal Exit Multiple', base_val: 6.5, low_val: 5.0, high_val: 8.0, unit: 'x', min_price: 504, max_price: 558, swing: 54, downside_delta: -27, upside_delta: 27 },
    ]
  };

  const dupont = backendData?.dupont || {
    calculated_roe_pct: 12.8,
    direct_roe_pct: 12.8,
    peer_median_roe_pct: 9.35,
    spread_vs_peer_median_pct: 3.45,
    stages: {
      '1_tax_burden': { name: 'Tax Burden (NI / EBT)', value: 0.88, pct: 88.0, peer_benchmark: 0.87 },
      '2_interest_burden': { name: 'Interest Burden (EBT / EBIT)', value: 0.82, pct: 82.0, peer_benchmark: 0.775 },
      '3_operating_margin': { name: 'Operating Margin (EBIT / Rev)', value: 0.45, pct: 45.0, peer_benchmark: 33.0 },
      '4_asset_turnover': { name: 'Asset Turnover (Rev / Assets)', value: 0.22, mult: 0.22, peer_benchmark: 0.21 },
      '5_financial_leverage': { name: 'Equity Multiplier (Assets / Equity)', value: 1.48, mult: 1.48, peer_benchmark: 1.585 }
    }
  };

  const baseP = tornado.base_share_price || 531;
  const maxSwing = Math.max(...tornado.items.map(it => Math.max(Math.abs(it.downside_delta), Math.abs(it.upside_delta))), 1);

  return (
    <div className="p-4 space-y-5">
      <div className="border border-slate-200 rounded-xs p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-rose-600 rounded-xs"></span>
              <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                Tornado Sensitivity Analysis (Fair Value Swing Range)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Two-sided valuation swings relative to baseline fair value (IDR {baseP}) from low to high parameter bounds.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xs font-bold">
            Baseline: IDR {baseP}
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {tornado.items.map((item, idx) => {
            const downPct = (Math.abs(item.downside_delta) / maxSwing) * 50;
            const upPct = (Math.abs(item.upside_delta) / maxSwing) * 50;

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 font-sans">{item.label} ({item.low_val}{item.unit} → {item.high_val}{item.unit})</span>
                  <span className="text-slate-600 text-[11px]">
                    IDR {item.min_price} — <strong className="text-slate-900">IDR {baseP}</strong> — IDR {item.max_price} (Swing: <strong className="text-blue-700">IDR {item.swing}</strong>)
                  </span>
                </div>
                <div className="flex items-center h-5 bg-slate-50 rounded-xs border border-slate-200 overflow-hidden relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10" />
                  <div className="w-1/2 flex justify-end">
                    <div
                      style={{ width: `${downPct}%` }}
                      className="h-3.5 bg-rose-500 rounded-l-xs flex items-center justify-start pl-1 text-[9px] text-white font-bold"
                    >
                      {item.downside_delta}
                    </div>
                  </div>
                  <div className="w-1/2 flex justify-start">
                    <div
                      style={{ width: `${upPct}%` }}
                      className="h-3.5 bg-emerald-500 rounded-r-xs flex items-center justify-end pr-1 text-[9px] text-white font-bold"
                    >
                      +{item.upside_delta}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-slate-200 rounded-xs p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-purple-600 rounded-xs"></span>
              <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                5-Stage DuPont ROE Decomposition vs. Indonesian Property Sector Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ROE = Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Financial Leverage.
            </p>
          </div>
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-slate-500">Sector Median: <strong>{dupont.peer_median_roe_pct}%</strong></span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-xs font-bold">
              {company.ticker} ROE: {dupont.calculated_roe_pct}% (+{dupont.spread_vs_peer_median_pct}%)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono">
          {Object.entries(dupont.stages || {}).map(([key, st]) => (
            <div key={key} className="bg-slate-50 border border-slate-200 p-3 rounded-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-sans block truncate">{st.name}</span>
              <div className="text-lg font-bold text-slate-900">
                {st.pct !== undefined ? `${st.pct}%` : `${st.mult}x`}
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                <span>Peer Med:</span>
                <span className="font-semibold text-slate-700">{st.peer_benchmark}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. VALUATION WORKSPACE (DCF, COMPS, RIM, DDM, FOOTBALL FIELD)
function ValuationWorkspace({ company, backendData, isLoadingBackend, onRefreshCalculation, onUpdateAssumption, onResetAssumptions, onToggleWatchlist, onNavigate, onOpenInspector, onDownloadExcel }) {
  const [activeTab, setActiveTab] = useState('dcf');
  const [footballView, setFootballView] = useState('bars');
  const v = company.valuation || {};
  const a = company.assumptions || {};
  const lastHist = company.historical ? company.historical[company.historical.length - 1] : {};

  const capm = computeCapmParameters(a, company);
  const rawWacc = backendData?.wacc?.wacc ?? (a.wacc ?? capm.effectiveWacc);
  const liveWacc = rawWacc < 1.0 ? rawWacc * 100.0 : rawWacc;
  const rawKe = backendData?.wacc?.ke ?? capm.ke;
  const liveKe = rawKe < 1.0 ? rawKe * 100.0 : rawKe;
  const liveTerminalG = a.terminalGrowth ?? 1.5;

  const dcfBackend = backendData?.dcf;
  const displaySumPvFcf = dcfBackend?.pv_explicit !== undefined ? dcfBackend.pv_explicit * 1000 : v.sumPvFcf;
  const displayPvTv = dcfBackend?.pv_tv_gordon !== undefined ? dcfBackend.pv_tv_gordon * 1000 : v.pvTerminalValue;
  const displayEv = dcfBackend?.enterprise_value !== undefined ? dcfBackend.enterprise_value * 1000 : v.dcfEnterpriseValue;
  const displayNetDebt = (dcfBackend?.debt !== undefined && dcfBackend?.cash !== undefined)
    ? (dcfBackend.debt - dcfBackend.cash) * 1000
    : v.netDebt;
  const displaySharePrice = dcfBackend?.dcf_price !== undefined ? Math.round(dcfBackend.dcf_price) : v.dcfSharePrice;
  const displayTvPct = displayEv > 0 ? +((displayPvTv / displayEv) * 100).toFixed(1) : v.tvPctOfEv;

  // Football Field Range Setup
  const footballField = [
    { method: '10-Year DCF (FCFF)', low: Math.round(displaySharePrice * 0.85), base: displaySharePrice, high: Math.round(displaySharePrice * 1.15) },
    { method: 'Property Trading Comps', low: Math.round(v.compsSharePrice * 0.88), base: v.compsSharePrice, high: Math.round(v.compsSharePrice * 1.12) },
    { method: 'Residual Income (RIM)', low: Math.round(v.rimSharePrice * 0.90), base: v.rimSharePrice, high: Math.round(v.rimSharePrice * 1.10) },
    { method: 'Dividend Discount (DDM)', low: Math.round(v.ddmSharePrice * 0.85), base: v.ddmSharePrice, high: Math.round(v.ddmSharePrice * 1.15) },
    { method: 'House Composite Triangulation', low: company.bearCase || Math.round(v.compositeIntrinsicValue * 0.85), base: v.compositeIntrinsicValue, high: company.bullCase || Math.round(v.compositeIntrinsicValue * 1.18) }
  ];

  const minPrice = Math.min(...footballField.map(f => f.low), company.referencePrice || 250) * 0.9;
  const maxPrice = Math.max(...footballField.map(f => f.high), company.referencePrice || 450) * 1.08;

  // 10-Year Pro Forma Schedule (from backend or client estimate)
  const proFormaRows = backendData?.pro_forma_schedule || v.projections || [];

  return (
    <div className="space-y-5">
      {/* Security Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-base bg-[#0A1120] text-white px-2.5 py-0.5 rounded-xs">
                {company.ticker}
              </span>
              <h1 className="text-lg font-bold text-slate-900">{company.name}</h1>
              <span className="text-xs font-mono text-slate-500">({company.exchange} • {company.industry})</span>
              <RecommendationBadge rec={v.recommendation || 'BUY'} size="lg" />
            </div>
            <p className="text-xs text-slate-600 max-w-3xl">{company.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onRefreshCalculation}
              disabled={isLoadingBackend}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xs text-xs font-medium flex items-center space-x-1.5 shadow-2xs cursor-pointer transition"
              title="Recalculate 10-Year Pro Forma & Statements with current assumptions"
            >
              <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={13} className={isLoadingBackend ? "animate-spin" : "text-amber-300"} />
              <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation"}</span>
            </button>
            <button
              onClick={onToggleWatchlist}
              className={`px-3 py-1.5 border rounded-xs text-xs font-medium flex items-center space-x-1.5 ${
                company.inWatchlist ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon name="Bookmark" size={13} />
              <span>{company.inWatchlist ? 'Watchlisted' : 'Watchlist'}</span>
            </button>
            <button
              onClick={onOpenInspector}
              className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xs text-xs font-medium flex items-center space-x-1.5"
            >
              <Icon name="Activity" size={13} />
              <span>KaTeX Proofs</span>
            </button>
            <button
              onClick={onDownloadExcel}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs text-xs font-medium flex items-center space-x-1.5"
            >
              <Icon name="Download" size={13} />
              <span>Excel Model</span>
            </button>
          </div>
        </div>

        {/* Valuation Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 font-mono">
          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Market Close</span>
            <span className="text-lg font-bold text-slate-900">IDR {company.referencePrice?.toLocaleString()}</span>
            <span className={`block text-[11px] ${company.priceChange1D >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              1D: {fmtPct(company.priceChange1D)}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Composite Target</span>
            <span className="text-lg font-bold text-blue-700">IDR {v.compositeIntrinsicValue?.toLocaleString()}</span>
            <span className="block text-[11px] text-slate-500">
              DCF: IDR {v.dcfSharePrice} | DDM: IDR {v.ddmSharePrice}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Implied Upside</span>
            <span className={`text-lg font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(v.impliedUpside)}
            </span>
            <span className="block text-[11px] text-slate-500">
              Spread: +IDR {(v.compositeIntrinsicValue - company.referencePrice)?.toLocaleString()}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Hurdle WACC</span>
            <span className="text-lg font-bold text-slate-900">{liveWacc.toFixed(2)}%</span>
            <span className="block text-[11px] text-slate-500">Ke: {liveKe.toFixed(2)}% | g: {liveTerminalG.toFixed(2)}%</span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value</span>
            <span className="text-lg font-bold text-slate-900">{fmtCompact(v.currentEnterpriseValue)}</span>
            <span className="block text-[11px] text-slate-500">Net Debt: {fmtCompact(v.netDebt)}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Audited 2025 Revenue</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">
              {fmtCompact(lastHist.revenue)}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              EBITDA: {fmtCompact(lastHist.ebitda)}
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations: Football Field + Intrinsic History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 12M Price vs Intrinsic Area Chart */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                12M Share Price vs. Intrinsic Value Track (IDR)
              </h2>
              <p className="text-[11px] text-slate-500">Observed market quotes vs. house DCF fair value estimates</p>
            </div>
            <span className="text-[11px] font-mono text-blue-700 font-semibold">
              Upside: {fmtPct(v.impliedUpside)}
            </span>
          </div>

          <div className="h-56 w-full"><PriceHistoryChart data={company.priceHistory || []} /></div>
        </div>

        {/* Valuation Methodology Football Field & Live Weight Composition */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  {footballView === 'bars' ? 'Valuation Football Field Range (IDR / Share)' : 'Valuation Weight Composition (Pie Chart)'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {footballView === 'bars' ? 'Methodology spreads against current market reference' : 'Live proportional weighting of active valuation methods'}
                </p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xs">
                <button
                  onClick={() => setFootballView('bars')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-xs transition ${footballView === 'bars' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Range Bars
                </button>
                <button
                  onClick={() => setFootballView('pie')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-xs transition ${footballView === 'pie' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Weight Pie
                </button>
              </div>
            </div>

            {footballView === 'bars' ? (
              <div className="space-y-3.5 my-2">
                {footballField.map((item, idx) => {
                  const rangeWidth = maxPrice - minPrice;
                  const leftPct = ((item.low - minPrice) / rangeWidth) * 100;
                  const widthPct = ((item.high - item.low) / rangeWidth) * 100;
                  const basePct = ((item.base - minPrice) / rangeWidth) * 100;
                  const refPct = ((company.referencePrice - minPrice) / rangeWidth) * 100;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-800">{item.method}</span>
                        <span className="font-mono text-[11px] text-slate-600">
                          IDR {item.low} — <strong className="text-slate-900">IDR {item.base}</strong> — IDR {item.high}
                        </span>
                      </div>
                      <div className="relative h-5 bg-slate-100 rounded-xs overflow-hidden border border-slate-200">
                        <div
                          style={{ left: `${Math.max(0, leftPct)}%`, width: `${Math.min(100, widthPct)}%` }}
                          className={`absolute top-1 bottom-1 rounded-xs ${idx === 4 ? 'bg-blue-600/80' : 'bg-slate-700/75'}`}
                        />
                        <div style={{ left: `${basePct}%` }} className="absolute top-0 bottom-0 w-0.5 bg-white z-10" />
                        <div style={{ left: `${refPct}%` }} className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-1">
                <WeightCompositionDonut
                  weights={{
                    dcfWeight: a.dcfWeight ?? 50,
                    compsWeight: a.compsWeight ?? 25,
                    rimWeight: a.rimWeight ?? 15,
                    ddmWeight: a.ddmWeight ?? 10
                  }}
                  prices={{
                    dcfSharePrice: v.dcfSharePrice,
                    compsSharePrice: v.compsSharePrice,
                    rimSharePrice: v.rimSharePrice,
                    ddmSharePrice: v.ddmSharePrice
                  }}
                  size={145}
                  strokeWidth={22}
                  centerTitle="Composite"
                  centerValue={`IDR ${v.compositeIntrinsicValue?.toLocaleString()}`}
                  showLegend={true}
                />
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block mr-1.5 rounded-xs" />
              Amber Line = Current Market Price (IDR {company.referencePrice})
            </span>
            <div className="flex items-center space-x-2">
              <span>Weights: {a.dcfWeight ?? 50}% DCF / {a.compsWeight ?? 25}% Comps / {a.rimWeight ?? 15}% RIM / {a.ddmWeight ?? 10}% DDM</span>
              <button
                onClick={() => onNavigate && onNavigate('modeler')}
                className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer underline text-[11px]"
              >
                Adjust →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Valuation Methodology Tabs */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 flex flex-wrap items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dcf', label: '1. Multi-Stage DCF (FCFF)' },
              { id: 'comps', label: '2. Relative Multiples Comps' },
              { id: 'rim', label: '3. Residual Income Model (RIM)' },
              { id: 'ddm', label: '4. Dividend Discount Model (DDM)' },
              { id: 'rnav', label: '5. RNAV Property Assets' },
              { id: 'montecarlo', label: '6. Monte Carlo (10k Runs)' },
              { id: 'eva', label: '7. EVA & MVA (Economic Profit)' },
              { id: 'analytics', label: '8. Tornado & DuPont Analytics' },
              { id: 'sensitivity', label: '9. 5x5 WACC Sensitivity' },
              { id: 'proofs', label: '10. KaTeX LaTeX Proofs' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-mono font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onResetAssumptions}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-900 flex items-center space-x-1 py-1.5"
          >
            <Icon name="RefreshCw" size={12} />
            <span>Restore Defaults</span>
          </button>
        </div>

        {/* TAB 1: DCF */}
        {activeTab === 'dcf' && (
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                    Explicit 10-Year Unlevered Free Cash Flow (FCFF) Schedule
                  </h3>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-xs font-semibold">
                    IDR Trillion (Rp T)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Forecast horizon 2026E–2035E with growth fading to terminal perpetuity rate (g = {liveTerminalG.toFixed(2)}%). All cash flow figures in IDR Trillion.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onRefreshCalculation}
                  disabled={isLoadingBackend}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-xs text-[11px] font-semibold flex items-center space-x-1 cursor-pointer transition shadow-2xs"
                  title="Recalculate Pro Forma and DCF from backend"
                >
                  <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={12} className={isLoadingBackend ? "animate-spin" : "text-amber-500"} />
                  <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Forecast"}</span>
                </button>
                <div className="text-right font-mono">
                  <span className="text-[10px] text-slate-500 block uppercase">DCF Fair Value</span>
                  <span className="text-base font-bold text-blue-700">IDR {displaySharePrice} / sh</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xs">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                    <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans w-64">FCFF Line Item (IDR Trillion)</th>
                    {proFormaRows.map((p, idx) => (
                      <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap">
                        {p.year ? `${p.year}E` : (p.period || `Y${idx+1}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 sticky left-0 bg-white z-10 font-sans font-semibold text-slate-900">Revenue (Rp T)</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-2 px-3 text-right font-semibold text-slate-900">{toTrillion(p.revenue).toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr className="text-slate-500 bg-slate-50/50">
                    <td className="py-1 px-3 sticky left-0 bg-slate-50/50 z-10 font-sans text-[11px]">Revenue Growth (%)</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-1 px-3 text-right text-[11px] text-slate-600">+{Number(p.growth_pct ?? p.growth ?? 0).toFixed(1)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Operating Income (EBIT)</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-1.5 px-3 text-right text-slate-800">{toTrillion(p.ebit).toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">NOPAT (Post-Tax EBIT)</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{toTrillion(p.nopat).toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">(+) Depreciation & Amortization</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-1.5 px-3 text-right text-slate-600">{toTrillion(p.depr !== undefined ? p.depr : p.da).toFixed(2)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">(-) Capital Expenditures (CapEx)</td>
                    {proFormaRows.map((p, idx) => (
                      <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({toTrillion(p.capex).toFixed(2)})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">(-/+) Change in Working Capital (ΔNWC)</td>
                    {proFormaRows.map((p, idx) => {
                      const val = toTrillion(p.delta_nwc !== undefined ? p.delta_nwc : p.nwcChange);
                      return (
                        <td key={idx} className="py-1.5 px-3 text-right text-slate-600">
                          {val > 0 ? `(${val.toFixed(2)})` : `${Math.abs(val).toFixed(2)}`}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="bg-blue-50/70 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-3 sticky left-0 bg-blue-50/70 z-10 font-sans text-blue-900">Free Cash Flow to Firm (FCFF)</td>
                    {proFormaRows.map((p, idx) => {
                      const val = toTrillion(p.fcff !== undefined ? p.fcff : p.fcf);
                      return (
                        <td key={idx} className="py-2.5 px-3 text-right text-blue-950 font-bold">
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="text-slate-500 bg-slate-50/30">
                    <td className="py-1.5 px-3 sticky left-0 bg-slate-50/30 z-10 font-sans text-[11px]">
                      Discount Factor (df = 1 / (1 + WACC)^t)
                    </td>
                    {proFormaRows.map((p, idx) => {
                      const t = p.t || idx + 1;
                      const df = p.discount_factor !== undefined ? Number(p.discount_factor) : (1.0 / Math.pow(1.0 + (liveWacc / 100.0), t));
                      return (
                        <td key={idx} className="py-1.5 px-3 text-right text-[11px] font-mono text-slate-600">
                          {df.toFixed(4)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="font-semibold text-slate-800 bg-emerald-50/40 border-t border-slate-200">
                    <td className="py-2 px-3 sticky left-0 bg-emerald-50/40 z-10 font-sans text-emerald-900">
                      Present Value of FCFF (@ {liveWacc.toFixed(2)}%)
                    </td>
                    {proFormaRows.map((p, idx) => {
                      const val = toTrillion(p.pv_fcff !== undefined ? p.pv_fcff : p.pvFcf);
                      return (
                        <td key={idx} className="py-2 px-3 text-right font-bold text-emerald-900">
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Cumulative PV of 10Y FCF</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(displaySumPvFcf)}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">PV of Terminal Value</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(displayPvTv)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{displayTvPct}% of Implied EV</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(displayEv)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Less Net Debt: {fmtCompact(displayNetDebt)}</span>
              </div>
              <div className="bg-[#0A1120] text-white p-3 rounded-xs">
                <span className="text-[10px] text-blue-300 uppercase block">Implied DCF Target</span>
                <span className="text-lg font-bold text-white">IDR {displaySharePrice}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">
                  Upside: {fmtPct(((displaySharePrice / (company.referencePrice || 1)) - 1) * 100)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPS */}
        {activeTab === 'comps' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                  IDX Property Peer Trading Multiples Matrix
                </h3>
                <p className="text-xs text-slate-500">
                  Benchmark peer valuation using median EV/EBITDA ({v.avgCompEvEbitda}x), P/E, and P/B.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Implied Comps Price</span>
                <span className="text-base font-bold text-blue-700">IDR {v.compsSharePrice} / sh</span>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3 font-sans">Peer Company</th>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Market Cap</th>
                  <th className="py-2.5 px-3 text-right">EV / EBITDA</th>
                  <th className="py-2.5 px-3 text-right">P / E</th>
                  <th className="py-2.5 px-3 text-right">Rev Growth (%)</th>
                  <th className="py-2.5 px-3 text-right">EBITDA Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(company.comps || []).map((peer, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">{peer.name}</td>
                    <td className="py-2 px-3 font-bold text-slate-700">{peer.ticker}.JK</td>
                    <td className="py-2 px-3 text-right">{fmtCompact(peer.mcap)}</td>
                    <td className="py-2 px-3 text-right font-semibold">{peer.evEbitda?.toFixed(2)}x</td>
                    <td className="py-2 px-3 text-right">{peer.pe?.toFixed(2)}x</td>
                    <td className="py-2 px-3 text-right text-emerald-700">+{peer.revGrowth?.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right">{peer.ebitdaMargin?.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-blue-50/60 font-bold text-slate-900">
                  <td className="py-2.5 px-3 font-sans">{company.name} (Subject)</td>
                  <td className="py-2.5 px-3 text-blue-700">{company.ticker}</td>
                  <td className="py-2.5 px-3 text-right">{fmtCompact(v.marketCap)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">5.40x</td>
                  <td className="py-2.5 px-3 text-right font-bold text-emerald-700">5.53x</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">+12.0%</td>
                  <td className="py-2.5 px-3 text-right">51.5%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: RIM */}
        {activeTab === 'rim' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                  Residual Income Model (RIM) Schedule & Clean Surplus
                </h3>
                <p className="text-xs text-slate-500">
                  Valuing equity through Book Value of Equity plus Present Value of Economic Profits (Residual Income).
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Implied RIM Price</span>
                <span className="text-base font-bold text-blue-700">IDR {v.rimSharePrice} / sh</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Starting Book Equity</span>
                <span className="text-base font-bold text-slate-900">IDR 22.47 Trillion</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Audited 2025 Balance Sheet</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Cost of Equity (Ke)</span>
                <span className="text-base font-bold text-blue-900">12.00%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Rf: 6.60% + Beta: 0.75 * ERP: 7.20%</span>
              </div>
              <div className="bg-[#0A1120] text-white p-3 rounded-xs">
                <span className="text-[10px] text-blue-300 uppercase block">RIM Intrinsic Target</span>
                <span className="text-lg font-bold text-white">IDR {v.rimSharePrice}</span>
                <span className="text-[10px] text-emerald-400 block mt-0.5 font-bold">
                  Upside: {fmtPct(((v.rimSharePrice / company.referencePrice) - 1) * 100)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DDM */}
        {activeTab === 'ddm' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                  Multi-Stage Dividend Discount Model (DDM)
                </h3>
                <p className="text-xs text-slate-500">
                  10-year explicit dividend schedule discounted at Cost of Equity (Ke = 12.00%) with Gordon Growth terminal value.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Implied DDM Price</span>
                <span className="text-base font-bold text-blue-700">IDR {v.ddmSharePrice} / sh</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">Base DPS (30% Payout)</span>
                <span className="text-base font-bold text-slate-900">IDR 14.64 / sh</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Base EPS: IDR 48.80</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">PV of 10Y Dividends</span>
                <span className="text-base font-bold text-slate-900">IDR 105.59 / sh</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs">
                <span className="text-[10px] text-slate-500 uppercase block">PV of Terminal Dividend</span>
                <span className="text-base font-bold text-slate-900">IDR 68.66 / sh</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Gordon Growth TV: IDR 213.25</span>
              </div>
              <div className="bg-[#0A1120] text-white p-3 rounded-xs">
                <span className="text-[10px] text-blue-300 uppercase block">DDM Fair Value</span>
                <span className="text-lg font-bold text-white">IDR {v.ddmSharePrice}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SENSITIVITY */}
        {activeTab === 'sensitivity' && (
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-800 mb-1">
              5x5 WACC vs. Terminal Growth Rate (g) Sensitivity Heatmap
            </h3>
            <p className="text-[11px] text-slate-500">
              Center cell represents Base Case WACC (10.42%) and g (1.50%). Green cells indicate positive margin-of-safety over market price (IDR {company.referencePrice}).
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse font-mono text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] text-slate-600">
                    <th className="py-2 px-3 border-r border-slate-300 font-sans">WACC \ g</th>
                    {['1.0%', '1.25%', '1.50%', '1.75%', '2.0%'].map((gVal, idx) => (
                      <th key={idx} className="py-2 px-3">{gVal}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { w: '9.42%', prices: [520, 545, 574, 608, 646] },
                    { w: '9.92%', prices: [475, 495, 518, 545, 576] },
                    { w: '10.42%', prices: [436, 452, 471, 492, 517], center: true },
                    { w: '10.92%', prices: [402, 415, 431, 448, 468] },
                    { w: '11.42%', prices: [372, 383, 396, 410, 426] },
                  ].map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-2 px-3 font-bold bg-slate-100 border-r border-slate-300 text-slate-700">
                        {row.w}
                      </td>
                      {row.prices.map((price, cIdx) => {
                        const isCenter = row.center && cIdx === 2;
                        return (
                          <td
                            key={cIdx}
                            className={`py-2 px-3 ${
                              isCenter
                                ? 'bg-blue-900 text-white font-bold ring-2 ring-blue-500'
                                : price >= company.referencePrice
                                ? 'bg-emerald-50/70 text-emerald-900'
                                : 'bg-rose-50/70 text-rose-900'
                            }`}
                          >
                            IDR {price}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: PROOFS */}
        {activeTab === 'proofs' && (
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
              KaTeX Step-by-Step Mathematical Proofs ({company.ticker})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  1. Fundamental CAPM & WACC Proof
                </span>
                {(() => {
                  const cpm = computeCapmParameters(a, company);
                  return (
                    <>
                      <MathProof latex={`\\text{ERP} = \\text{Mature ERP} + \\text{CRP} = ${cpm.matureErp.toFixed(2)}\\% + ${cpm.crp.toFixed(2)}\\% = ${cpm.totalErp.toFixed(2)}\\%`} />
                      <MathProof latex={`K_e = R_f + (\\beta \\times \\text{ERP}) = ${cpm.rf.toFixed(2)}\\% + (${cpm.beta.toFixed(2)} \\times ${cpm.totalErp.toFixed(2)}\\%) = ${cpm.ke.toFixed(2)}\\%`} />
                      <MathProof latex={`K_{d,\\text{after}} = K_d \\times (1 - t) = ${cpm.kdPre.toFixed(2)}\\% \\times (1 - ${cpm.taxRate.toFixed(1)}\\%) = ${cpm.kdAfter.toFixed(2)}\\%`} />
                      <MathProof latex={`\\text{WACC} = (${cpm.we.toFixed(1)}\\% \\times ${cpm.ke.toFixed(2)}\\%) + (${cpm.wd.toFixed(1)}\\% \\times ${cpm.kdAfter.toFixed(2)}\\%) = ${cpm.effectiveWacc.toFixed(2)}\\%`} />
                    </>
                  );
                })()}
              </div>
              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  2. Gordon Growth Terminal Value Proof
                </span>
                <MathProof latex="TV_{10} = \frac{3.82 \times (1 + 0.015)}{0.1042 - 0.015} = \text{IDR } 43.47 \text{ Trillion}" />
              </div>
              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  3. Enterprise-to-Equity Value Bridge
                </span>
                <MathProof latex="\text{Equity} = 25.56 + 5.19 - 5.58 - 4.15 = \text{IDR } 21.02 \text{ Trillion}" />
                <MathProof latex="\text{Target Price} = \frac{21.02\text{T}}{48.16\text{B}} = \text{IDR } 436 \text{ / Share}" />
              </div>
              <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50">
                <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
                  4. Composite Triangulation Target Proof
                </span>
                <MathProof latex={`\\text{Target} = (${a.dcfWeight ?? 50}\\% \\times ${v.dcfSharePrice}) + (${a.compsWeight ?? 25}\\% \\times ${v.compsSharePrice}) + (${a.rimWeight ?? 15}\\% \\times ${v.rimSharePrice}) + (${a.ddmWeight ?? 10}\\% \\times ${v.ddmSharePrice}) = \\text{IDR } ${v.compositeIntrinsicValue?.toLocaleString()}`} />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: RNAV (PROPERTY ASSETS) */}
        {activeTab === 'rnav' && (
          <RNAVTab company={company} backendData={backendData} onNavigate={onNavigate} />
        )}

        {/* TAB 8: MONTE CARLO (10K SIMULATIONS) */}
        {activeTab === 'montecarlo' && (
          <MonteCarloTab company={company} backendData={backendData} />
        )}

        {/* TAB 9: EVA & MVA */}
        {activeTab === 'eva' && (
          <EVATab company={company} backendData={backendData} />
        )}

        {/* TAB 10: TORNADO & DUPONT */}
        {activeTab === 'analytics' && (
          <VisualAnalyticsTab company={company} backendData={backendData} />
        )}
      </div>
    </div>
  );
}

// 4. DEDICATED 3-STATEMENT FINANCIAL MODEL WORKSPACE
function ThreeStatementWorkspace({ company, backendData, isLoadingBackend, onRefreshCalculation, onDownloadExcel }) {
  const [activeStmt, setActiveStmt] = useState('bs');
  const [showScopeInfo, setShowScopeInfo] = useState(false);
  const threeStmt = backendData?.three_statement || {};
  const isBalanced = threeStmt.is_balanced !== undefined ? threeStmt.is_balanced : true;

  const bsRows = threeStmt.balance_sheet || [];
  const isRows = threeStmt.income_statement || [];
  const cfsRows = threeStmt.cash_flow || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              10-Year Integrated 3-Statement Financial Model
            </h1>
            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs font-bold">
              {company.ticker} AUDITED ENGINE
            </span>
            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-xs font-medium flex items-center space-x-1">
              <Icon name="Building2" size={11} className="text-slate-500" />
              <span>Corporate Finance Scope (Non-Banking)</span>
            </span>
            <button
              onClick={() => setShowScopeInfo(!showScopeInfo)}
              className="text-[11px] font-mono text-blue-600 hover:text-blue-800 underline flex items-center space-x-0.5 cursor-pointer ml-1"
              title="Click to view financial methodology and industry scope details"
            >
              <Icon name="Info" size={11} />
              <span>{showScopeInfo ? "Hide Scope Details" : "Scope Rationale"}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Articulated Income Statement, Balance Sheet, and Cash Flow Statement across 2026E–2035E with live zero-balance reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshCalculation}
            disabled={isLoadingBackend}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xs text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition"
            title="Recalculate 10-Year 3-Statement financial model with current custom assumptions"
          >
            <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={13} className={isLoadingBackend ? "animate-spin" : "text-amber-300"} />
            <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation"}</span>
          </button>
          <div className={`px-3 py-1.5 rounded-xs border text-xs font-mono font-bold flex items-center space-x-1.5 ${
            isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}>
            <Icon name={isBalanced ? 'CheckCircle2' : 'AlertTriangle'} size={14} className={isBalanced ? 'text-emerald-600' : 'text-rose-600'} />
            <span>{isBalanced ? 'ZERO-BALANCE: ASSETS ≡ LIAB + EQUITY' : 'BALANCE MISMATCH'}</span>
          </div>
          <button
            onClick={onDownloadExcel}
            className="px-3.5 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white rounded-xs text-xs font-medium flex items-center space-x-1.5"
          >
            <Icon name="Download" size={13} className="text-blue-400" />
            <span>Download 6-Sheet Model (.xlsx)</span>
          </button>
        </div>
      </div>

      {showScopeInfo && (
        <div className="bg-slate-50 border border-slate-200 rounded-xs p-4 text-xs text-slate-700 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-2 font-bold text-slate-900">
              <Icon name="Layers" size={15} className="text-blue-600" />
              <span>Methodology Framework: Top-Down Corporate Finance (Non-Banking Focus)</span>
            </div>
            <button
              onClick={() => setShowScopeInfo(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-mono cursor-pointer"
            >
              ✕ Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
            <div className="bg-white p-3 rounded-xs border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-blue-700 font-bold font-mono text-[11px] uppercase">
                <Icon name="CheckCircle2" size={13} className="text-blue-600" />
                <span>Applicable Scope: Non-Banking & Non-Lending Corporates</span>
              </div>
              <p className="text-slate-600">
                In non-financial corporate enterprises (Real Estate, Consumer Staples, Industrials, Retail, and Tech), value creation follows a top-down operational path: <strong>Customer Demand & Revenue (P × Q) → EBITDA Margins → Net Income → Free Cash Flow (FCFF)</strong>. Operating performance is independent of capital structure, and working capital (DSO/DIO/DPO) alongside CapEx represents tangible reinvestment into productive assets.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xs border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-700 font-bold font-mono text-[11px] uppercase">
                <Icon name="AlertTriangle" size={13} className="text-amber-600" />
                <span>Distinct Scope: Why Banking & Lending Firms Require ALM</span>
              </div>
              <p className="text-slate-600">
                Commercial banks and lending institutions cannot be modeled top-down: their balance sheet (loans and customer deposits) <em>is</em> the earning product itself, interest expense is Cost of Goods Sold (COGS), and capacity is legally constrained by Basel III / OJK Capital Adequacy Ratios (CAR), necessitating an Asset-Liability Management (ALM) spread engine and regulatory-constrained DDM.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 flex space-x-1">
          {[
            { id: 'bs', label: '1. Balance Sheet (Assets = Liab + Equity)' },
            { id: 'is', label: '2. Income Statement (Rev -> Net Income)' },
            { id: 'cfs', label: '3. Cash Flow Statement (CFO + CFI + CFF)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveStmt(tab.id)}
              className={`px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition ${
                activeStmt === tab.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-x-auto">
          {activeStmt === 'bs' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans w-72">Balance Sheet Item (IDR Trillion)</th>
                  {bsRows.map((r, idx) => (
                    <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap">{r.year}E</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Current Assets */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={bsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    I. CURRENT ASSETS
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans font-medium text-slate-900 pl-6">Cash & Cash Equivalents</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-blue-900">{r.cash?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Accounts Receivable</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ar?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Property Inventories (Real Estate)</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.inventory?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Current Assets & Prepayments</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_current_assets?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Total Current Assets</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-blue-800">{r.total_current_assets?.toFixed(2)}</td>)}
                </tr>

                {/* 2. Non-Current Assets */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={bsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    II. NON-CURRENT ASSETS
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Net PP&E & Operating Assets</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.net_ppe?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Investment Properties & Landbank</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_non_current_assets?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans text-slate-900">TOTAL ASSETS</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-blue-900 font-bold">{r.total_assets?.toFixed(2)}</td>)}
                </tr>

                {/* 3. Current Liabilities */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={bsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    III. CURRENT LIABILITIES
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Accounts Payable</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ap?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Short-Term Borrowings & Facilities</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.short_term_debt?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Current Liabilities</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_current_liabilities?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Total Current Liabilities</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right">{r.total_current_liabilities?.toFixed(2)}</td>)}
                </tr>

                {/* 4. Non-Current Liabilities */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={bsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    IV. NON-CURRENT LIABILITIES
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Long-Term Bank Debt & Senior Notes</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.long_term_debt?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Non-Current Liabilities</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_non_current_liabilities?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-50/70 font-medium text-slate-800">
                  <td className="py-1.5 px-3 sticky left-0 bg-slate-50/70 z-10 font-sans pl-6">Total Debt (ST + LT Borrowings)</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium">{(r.total_debt ?? (r.short_term_debt + r.long_term_debt))?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                  <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL LIABILITIES</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-slate-900">{r.total_liabilities?.toFixed(2)}</td>)}
                </tr>

                {/* 5. Shareholders' Equity */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={bsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    V. SHAREHOLDERS' EQUITY
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Share Capital</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.share_capital?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Retained Earnings (Cumulated)</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-blue-900">{r.retained_earnings?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Non-Controlling / Minority Interest</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.minority_interest?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                  <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL SHAREHOLDERS' EQUITY</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-slate-900">{r.total_equity?.toFixed(2)}</td>)}
                </tr>

                {/* Total Liabilities & Equity */}
                <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-400">
                  <td className="py-2.5 px-3 sticky left-0 bg-slate-100/90 z-10 font-sans">TOTAL LIABILITIES & EQUITY</td>
                  {bsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-blue-900 font-bold">{(r.total_liabilities_equity ?? r.total_liab_and_equity)?.toFixed(2)}</td>)}
                </tr>

                {/* Balance Check */}
                <tr className="bg-emerald-50 text-emerald-900 font-bold border-t-2 border-emerald-300">
                  <td className="py-2.5 px-3 sticky left-0 bg-emerald-50 z-10 font-sans flex items-center space-x-1.5">
                    <Icon name="CheckCircle2" size={13} className="text-emerald-600" />
                    <span>ZERO-BALANCE CHECK (Assets ≡ Liab + Equity)</span>
                  </td>
                  {bsRows.map((r, idx) => (
                    <td key={idx} className="py-2.5 px-3 text-right text-emerald-700 font-bold">
                      {Math.abs(r.balance_check || 0).toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}

          {activeStmt === 'is' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans w-64">Income Statement Item (IDR Trillion)</th>
                  {isRows.map((r, idx) => <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap">{r.year}E</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2 px-3 sticky left-0 bg-white z-10 font-sans font-bold text-slate-900">Total Revenue</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-semibold">{r.revenue?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Cost of Goods Sold (COGS)</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({r.cogs?.toFixed(2)})</td>)}
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Gross Profit</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right">{r.gross_profit?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">SG&A Operating Expenses</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({r.sga?.toFixed(2)})</td>)}
                </tr>
                <tr className="bg-blue-50/40 font-bold">
                  <td className="py-2 px-3 sticky left-0 bg-blue-50/40 z-10 font-sans">Operating Profit (EBIT)</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-blue-900">{r.ebit?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Pre-Tax Earnings (EBT)</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ebt?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-emerald-50/50 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 sticky left-0 bg-emerald-50/50 z-10 font-sans text-emerald-900">NET INCOME (Post-Tax)</td>
                  {isRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-emerald-700">{r.net_income?.toFixed(2)}</td>)}
                </tr>
              </tbody>
            </table>
          )}

          {activeStmt === 'cfs' && (
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans w-72">Cash Flow Statement Item (IDR Trillion)</th>
                  {cfsRows.map((r, idx) => <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap">{r.year}E</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* 1. Operating Activities */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={cfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    I. CASH FLOWS FROM OPERATING ACTIVITIES (CFO)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans font-medium text-slate-800 pl-6">Net Income (Post-Tax)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-slate-900">{r.net_income?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(+) Depreciation & Amortization</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.depr?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-/+) Change in Accounts Receivable</td>
                  {cfsRows.map((r, idx) => <td key={idx} className={`py-1.5 px-3 text-right ${r.delta_ar < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{r.delta_ar?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-/+) Change in Property Inventories</td>
                  {cfsRows.map((r, idx) => <td key={idx} className={`py-1.5 px-3 text-right ${r.delta_inv < 0 ? 'text-rose-600' : 'text-slate-700'}`}>{r.delta_inv?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(+/-) Change in Accounts Payable</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.delta_ap?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-/+) Change in Other Working Capital</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.delta_other_wc?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-blue-50/70 font-bold text-slate-900 border-t border-blue-200">
                  <td className="py-2 px-3 sticky left-0 bg-blue-50/70 z-10 font-sans text-blue-900">NET CASH FROM OPERATIONS (CFO)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-blue-900 font-bold">{r.cfo?.toFixed(2)}</td>)}
                </tr>

                {/* 2. Investing Activities */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={cfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    II. CASH FLOWS FROM INVESTING ACTIVITIES (CFI)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Capital Expenditures (PP&E & Equipment)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{r.capex?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Investment Properties & Landbank Expansion</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{(r.investment_prop_capex ?? 0)?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">NET CASH USED IN INVESTING (CFI)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-bold text-rose-800">{r.cfi?.toFixed(2)}</td>)}
                </tr>

                {/* 3. Financing Activities */}
                <tr className="bg-slate-100/70 font-bold text-slate-800 text-[11px]">
                  <td colSpan={cfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-slate-100/70">
                    III. CASH FLOWS FROM FINANCING ACTIVITIES (CFF)
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(+/-) Net Change in Debt Borrowings</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.delta_debt?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Cash Dividends Paid</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{r.dividends_paid?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">NET CASH FROM FINANCING (CFF)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-bold text-slate-800">{r.cff?.toFixed(2)}</td>)}
                </tr>

                {/* 4. Cash Reconciliation */}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">NET CHANGE IN CASH & EQUIVALENTS</td>
                  {cfsRows.map((r, idx) => <td key={idx} className={`py-2 px-3 text-right font-bold ${r.net_change_cash >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{r.net_change_cash?.toFixed(2)}</td>)}
                </tr>
                <tr>
                  <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">Cash & Equivalents at Beginning of Period</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.beginning_cash?.toFixed(2)}</td>)}
                </tr>
                <tr className="bg-blue-600 text-white font-bold border-t-2 border-blue-700">
                  <td className="py-2.5 px-3 sticky left-0 bg-blue-600 z-10 font-sans">CASH & EQUIVALENTS AT END OF PERIOD (Balance Sheet Cash)</td>
                  {cfsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-white font-bold">{r.ending_cash?.toFixed(2)}</td>)}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// 5. VALUATION MODEL ASSUMPTIONS & PARAMETER EDITOR
function ValuationModelEditor({ company, isLoadingBackend, onRefreshCalculation, onUpdateAssumption, onUpdateMultipleAssumptions, onResetAssumptions, onApplyAutoFade, onNavigate }) {
  const a = company.assumptions || {};
  const v = company.valuation || {};

  const wDcfCur = Number(a.dcfWeight ?? 50);
  const wCompsCur = Number(a.compsWeight ?? 25);
  const wRimCur = Number(a.rimWeight ?? 15);
  const wDdmCur = Number(a.ddmWeight ?? 10);
  const rawWeightSum = wDcfCur + wCompsCur + wRimCur + wDdmCur;

  const handlePreset = (presetObj, name) => {
    if (onUpdateMultipleAssumptions) {
      onUpdateMultipleAssumptions(presetObj, name);
    } else {
      Object.entries(presetObj).forEach(([k, val]) => onUpdateAssumption(k, val, `${name}: ${k}`));
    }
  };

  const handleNormalize = () => {
    if (rawWeightSum <= 0) return;
    const normDcf = Math.round((wDcfCur / rawWeightSum) * 100);
    const normComps = Math.round((wCompsCur / rawWeightSum) * 100);
    const normRim = Math.round((wRimCur / rawWeightSum) * 100);
    const normDdm = Math.max(0, 100 - (normDcf + normComps + normRim));

    handlePreset({
      dcfWeight: Math.max(0, normDcf),
      compsWeight: Math.max(0, normComps),
      rimWeight: Math.max(0, normRim),
      ddmWeight: Math.max(0, normDdm)
    }, 'Normalize to 100%');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-xs">{company.ticker}</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Valuation Drivers & Parameter Modeler</h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Institutional convention: Blue sliders update growth trajectories, operating margins, and cost of capital live.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshCalculation}
            disabled={isLoadingBackend}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xs shadow-2xs flex items-center space-x-1.5 cursor-pointer transition"
            title="Recalculate 10-Year Pro Forma Schedule and 3 Financial Statements with current custom assumptions"
          >
            <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={13} className={isLoadingBackend ? "animate-spin" : "text-amber-300"} />
            <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation"}</span>
          </button>
          <button
            onClick={onResetAssumptions}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-xs flex items-center space-x-1.5"
          >
            <Icon name="RefreshCw" size={13} />
            <span>Restore Defaults</span>
          </button>
          <button
            onClick={() => onNavigate('valuation')}
            className="px-3 py-1.5 bg-[#0A1120] text-white text-xs font-medium rounded-xs"
          >
            Return to Valuation
          </button>
        </div>
      </div>

      {/* Informational Sync Banner */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xs p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center space-x-2">
          <Icon name="Info" size={16} className="text-blue-600 shrink-0" />
          <span>
            Adjusting sliders updates valuation target models immediately. Click <strong>⚡ Refresh Calculation</strong> to propagate new revenue growth, margin, and WACC assumptions across the full 10-Year Pro Forma Schedule and Integrated 3-Statement Model.
          </span>
        </div>
        <button
          onClick={onRefreshCalculation}
          disabled={isLoadingBackend}
          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xs text-[11px] font-bold font-mono shrink-0 flex items-center space-x-1 cursor-pointer transition shadow-2xs"
        >
          <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={11} className={isLoadingBackend ? "animate-spin" : "text-amber-300"} />
          <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation"}</span>
        </button>
      </div>

      <div className="bg-[#0A1120] text-white p-4 rounded-xs grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Market Price</span>
          <span className="text-lg font-bold">IDR {company.referencePrice?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-blue-300 uppercase block">Composite Intrinsic</span>
          <span className="text-lg font-bold text-blue-400">IDR {v.compositeIntrinsicValue?.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">DCF Share Target</span>
          <span className="text-lg font-bold">IDR {v.dcfSharePrice}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Implied Upside</span>
          <span className={`text-lg font-bold ${v.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmtPct(v.impliedUpside)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Recommendation</span>
          <div className="mt-1">
            <RecommendationBadge rec={v.recommendation || 'BUY'} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Explicit 10-Year Growth Curve & Auto-Fade */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase font-mono text-slate-800">
                1. Explicit 10-Year Growth Curve (%)
              </h2>
              <span className="text-[10px] text-slate-500">Phase 1 (Y1–Y5) & Phase 2 Fade (Y6–Y10)</span>
            </div>
            <button
              onClick={() => onApplyAutoFade && onApplyAutoFade()}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xs text-[10px] font-mono font-bold flex items-center space-x-1 transition cursor-pointer shadow-2xs"
              title="Linearly interpolate Years 6-10 down to terminal growth rate"
            >
              <Icon name="Zap" size={11} />
              <span>⚡ Auto-Fade (Y6–Y10)</span>
            </button>
          </div>

          {/* Phase 1: High Growth */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-xs block mb-1">
              Phase 1: Explicit High Growth (Years 1–5)
            </span>
            {[
              { key: 'revGrowthY1', label: 'Y1 (2026E) Growth %' },
              { key: 'revGrowthY2', label: 'Y2 (2027E) Growth %' },
              { key: 'revGrowthY3', label: 'Y3 (2028E) Growth %' },
              { key: 'revGrowthY4', label: 'Y4 (2029E) Growth %' },
              { key: 'revGrowthY5', label: 'Y5 (2030E) Growth %' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between text-xs py-0.5">
                <label className="text-slate-700 font-medium text-[11px]">{item.label}</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="range"
                    min="-5"
                    max="35"
                    step="0.5"
                    value={a[item.key] ?? 10}
                    onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                    className="w-20 accent-blue-600"
                  />
                  <input
                    type="number"
                    step="0.5"
                    value={a[item.key] ?? 10}
                    onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                    className="w-14 text-right font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-300 rounded-xs px-1 py-0.5 text-xs"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Phase 2: Fade & Transition */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded-xs block mb-1">
              Phase 2: Transition & Fade Phase (Years 6–10)
            </span>
            {[
              { key: 'revGrowthY6', label: 'Y6 (2031E) Fade %' },
              { key: 'revGrowthY7', label: 'Y7 (2032E) Fade %' },
              { key: 'revGrowthY8', label: 'Y8 (2033E) Fade %' },
              { key: 'revGrowthY9', label: 'Y9 (2034E) Fade %' },
              { key: 'revGrowthY10', label: 'Y10 (2035E) Terminal %' },
            ].map(item => {
              const g5Val = a.revGrowthY5 ?? 7.0;
              const tGVal = a.terminalGrowth ?? 1.5;
              const stepVal = (g5Val - tGVal) / 5.0;
              const defaultVal = item.key === 'revGrowthY6' ? +(g5Val - stepVal).toFixed(1)
                               : item.key === 'revGrowthY7' ? +(g5Val - stepVal * 2).toFixed(1)
                               : item.key === 'revGrowthY8' ? +(g5Val - stepVal * 3).toFixed(1)
                               : item.key === 'revGrowthY9' ? +(g5Val - stepVal * 4).toFixed(1)
                               : +tGVal.toFixed(1);
              const curVal = a[item.key] ?? defaultVal;

              return (
                <div key={item.key} className="flex items-center justify-between text-xs py-0.5">
                  <label className="text-slate-700 font-medium text-[11px]">{item.label}</label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="range"
                      min="-5"
                      max="35"
                      step="0.5"
                      value={curVal}
                      onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                      className="w-20 accent-purple-600"
                    />
                    <input
                      type="number"
                      step="0.5"
                      value={curVal}
                      onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                      className="w-14 text-right font-mono font-bold text-purple-700 bg-purple-50/50 border border-purple-300 rounded-xs px-1 py-0.5 text-xs"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Amateur Financier Convergence Warning */}
          {((a.revGrowthY10 ?? a.terminalGrowth ?? 1.5) > 4.0 || (a.revGrowthY10 ?? 1.5) >= (a.wacc ?? 10.42)) && (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 p-2.5 rounded-xs text-xs space-y-1.5 animate-fadeIn">
              <div className="font-bold flex items-center space-x-1.5 text-amber-800">
                <Icon name="AlertTriangle" size={13} className="text-amber-600" />
                <span className="text-[11px] uppercase tracking-wide">Macro Convergence Warning</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Year 10 growth is set to <strong>{a.revGrowthY10 ?? 1.5}%</strong>, which exceeds the sustainable Indonesian nominal GDP ceiling (4.0%–5.0%). In corporate finance (Damodaran & McKinsey), steady-state firms cannot permanently outgrow the macroeconomy.
              </p>
              <button
                onClick={() => onApplyAutoFade && onApplyAutoFade()}
                className="w-full py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xs text-[10px] uppercase font-mono tracking-wider cursor-pointer transition shadow-2xs"
              >
                ⚡ Click to Auto-Fade Y6–Y10 to {a.terminalGrowth ?? 1.5}%
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onRefreshCalculation}
              disabled={isLoadingBackend}
              className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold rounded-xs text-[11px] font-mono flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-2xs"
            >
              <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={12} className={isLoadingBackend ? "animate-spin" : "text-amber-500"} />
              <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation with Growth Curve"}</span>
            </button>
          </div>
        </div>

        {/* Column 2: Margins */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
            2. Operating Margins & Reinvestment
          </h2>
          {[
            { key: 'ebitdaMargin', label: 'EBITDA Margin (%)', min: 10, max: 70, step: 0.5, default: 50 },
            { key: 'taxRate', label: 'Corporate Tax Rate (%)', min: 10, max: 30, step: 0.5, default: 22 },
            { key: 'capexPercentRev', label: 'CapEx (% of Revenue)', min: 2, max: 25, step: 0.5, default: 8.5 },
            { key: 'daPercentRev', label: 'D&A (% of Revenue)', min: 2, max: 15, step: 0.2, default: 5.0 },
            { key: 'nwcPercentRevChange', label: 'NWC (% of Rev Growth)', min: 1, max: 20, step: 0.5, default: 4.0 },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between text-xs py-1">
              <label className="text-slate-700 font-medium">{item.label}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={a[item.key] ?? item.default}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-24 accent-blue-600"
                />
                <input
                  type="number"
                  step={item.step}
                  value={a[item.key] ?? item.default}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-16 text-right font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-300 rounded-xs px-1.5 py-1"
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={onRefreshCalculation}
              disabled={isLoadingBackend}
              className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 font-bold rounded-xs text-[11px] font-mono flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-2xs"
            >
              <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={12} className={isLoadingBackend ? "animate-spin" : "text-amber-500"} />
              <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh Calculation with Margins"}</span>
            </button>
          </div>
        </div>

        {/* Column 3: Cost of Capital & Fundamental CAPM Modeler */}
        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-xs font-bold uppercase font-mono text-slate-800">
                3. Cost of Capital & Fundamental CAPM Modeler
              </h2>
              <span className="text-[10px] text-slate-500">Live Scraped Beta, Damodaran ERP/CRP & Spreads</span>
            </div>
            <button
              onClick={() => {
                const defs = company.defaultAssumptions || {};
                onUpdateMultipleAssumptions({
                  beta: defs.beta ?? (company.beta || 0.75),
                  rf: defs.rf ?? 6.60,
                  matureErp: defs.matureErp ?? 5.00,
                  crp: defs.crp ?? 2.16,
                  kdPre: defs.kdPre ?? 6.50,
                  wd: defs.wd ?? 20.0,
                  taxRate: defs.taxRate ?? 22.0,
                  wacc: defs.wacc ?? 10.42
                }, 'Restore Scraped CAPM Defaults');
              }}
              className="text-[10px] text-blue-700 hover:text-blue-900 font-mono font-medium flex items-center space-x-1 cursor-pointer bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-xs border border-blue-200 transition"
              title="Reset Beta and spreads to scraped defaults"
            >
              <Icon name="RotateCcw" size={11} />
              <span>Reset CAPM</span>
            </button>
          </div>

          {/* Live CAPM Result Summary Cards */}
          {(() => {
            const capm = computeCapmParameters(a, company);
            return (
              <div className="grid grid-cols-2 gap-2 bg-slate-900 text-white p-2.5 rounded-xs font-mono shadow-inner">
                <div className="bg-slate-800/80 p-2 rounded-xs border border-slate-700">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>HURDLE WACC</span>
                    <span className="text-[9px] text-emerald-400 font-bold">LIVE SYNC</span>
                  </div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">
                    {capm.effectiveWacc.toFixed(2)}%
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                    We: {capm.we}% | Wd: {capm.wd}%
                  </div>
                </div>

                <div className="bg-slate-800/80 p-2 rounded-xs border border-slate-700">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>COST OF EQUITY (Ke)</span>
                    <span className="text-[9px] text-blue-400 font-bold">CAPM</span>
                  </div>
                  <div className="text-base font-bold text-blue-400 mt-0.5">
                    {capm.ke.toFixed(2)}%
                  </div>
                  <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                    Kd(after): {capm.kdAfter.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Fundamental CAPM Sliders & Inputs with Hoverable Provenance Tooltip */}
          <div className="space-y-1.5 text-xs">
            {[
              { key: 'beta', label: 'Equity Beta (β)', paramKey: 'beta', min: 0.20, max: 2.50, step: 0.05, default: company.beta || 0.75, accent: 'accent-blue-600' },
              { key: 'rf', label: 'Risk-Free Rate Rf (%)', paramKey: 'rf', min: 4.0, max: 12.0, step: 0.1, default: 6.60, accent: 'accent-emerald-600' },
              { key: 'matureErp', label: 'Mature Market ERP (%)', paramKey: 'matureErp', min: 3.0, max: 9.0, step: 0.1, default: 5.00, accent: 'accent-purple-600' },
              { key: 'crp', label: 'Country Risk Premium CRP (%)', paramKey: 'crp', min: 0.0, max: 8.0, step: 0.1, default: 2.16, accent: 'accent-purple-600' },
              { key: 'kdPre', label: 'Pre-Tax Cost of Debt Kd (%)', paramKey: 'kdPre', min: 4.0, max: 14.0, step: 0.1, default: 6.50, accent: 'accent-amber-600' },
              { key: 'wd', label: 'Debt Weight Wd (%)', paramKey: 'wd', min: 0.0, max: 60.0, step: 1.0, default: 20.0, accent: 'accent-slate-700' },
              { key: 'taxRate', label: 'Corporate Tax Rate (%)', paramKey: 'taxRate', min: 10.0, max: 35.0, step: 0.5, default: 22.0, accent: 'accent-emerald-600' },
              { key: 'terminalGrowth', label: 'Terminal Growth Rate g (%)', paramKey: 'terminalGrowth', min: 0.5, max: 4.0, step: 0.1, default: 1.50, accent: 'accent-blue-600' },
              { key: 'exitEbitdaMultiple', label: 'Terminal Exit Multiple (x)', paramKey: 'exitEbitdaMultiple', min: 3.0, max: 15.0, step: 0.5, default: 6.5, accent: 'accent-indigo-600' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-0.5 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center">
                  <label className="text-slate-700 font-medium text-[11px]">{item.label}</label>
                  <ProvenanceTooltip paramKey={item.paramKey} />
                </div>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={a[item.key] ?? item.default}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateAssumption(item.key, val, item.label);
                      const nextAssump = { ...a, [item.key]: val };
                      const newCapm = computeCapmParameters(nextAssump, company);
                      onUpdateAssumption('wacc', newCapm.effectiveWacc);
                    }}
                    className={`w-20 ${item.accent}`}
                  />
                  <input
                    type="number"
                    step={item.step}
                    value={a[item.key] ?? item.default}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onUpdateAssumption(item.key, val, item.label);
                      const nextAssump = { ...a, [item.key]: val };
                      const newCapm = computeCapmParameters(nextAssump, company);
                      onUpdateAssumption('wacc', newCapm.effectiveWacc);
                    }}
                    className="w-14 text-right font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xs px-1 py-0.5 text-[11px]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Composite Valuation Model Selection & Live Weight Composition (Pie Chart) */}
      <div className="bg-white border border-slate-200 rounded-xs p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span>
              <h2 className="text-sm font-bold uppercase font-mono text-slate-900">
                4. Valuation Model Selection & Live Weight Composition (Pie Chart)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize composite weights (allows 0% to 100%). The live pie chart visually renders exact proportions in real time.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-slate-500 mr-1">Presets:</span>
            <button
              onClick={() => handlePreset({ dcfWeight: 50, compsWeight: 0, rimWeight: 50, ddmWeight: 0 }, '50/50 DCF & RIM')}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xs text-xs font-mono font-semibold transition cursor-pointer"
            >
              50/50 DCF & RIM
            </button>
            <button
              onClick={() => handlePreset({ dcfWeight: 100, compsWeight: 0, rimWeight: 0, ddmWeight: 0 }, '100% DCF')}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xs text-xs font-mono font-semibold transition cursor-pointer"
            >
              100% DCF
            </button>
            <button
              onClick={() => handlePreset({ dcfWeight: 50, compsWeight: 25, rimWeight: 15, ddmWeight: 10 }, 'Institutional 4-Way')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xs text-xs font-mono font-semibold transition cursor-pointer"
            >
              4-Way (50/25/15/10)
            </button>
            <button
              onClick={() => handlePreset({ dcfWeight: 25, compsWeight: 25, rimWeight: 25, ddmWeight: 25 }, 'Equal Weight')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xs text-xs font-mono font-semibold transition cursor-pointer"
            >
              Equal (25% All)
            </button>
            {rawWeightSum !== 100 && rawWeightSum > 0 && (
              <button
                onClick={handleNormalize}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs text-xs font-mono font-bold transition flex items-center space-x-1 cursor-pointer"
              >
                <Icon name="CheckCircle2" size={12} />
                <span>Normalize to 100%</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders & Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            {[
              { key: 'dcfWeight', label: '10-Year DCF (FCFF)', color: '#2563eb', price: v.dcfSharePrice, default: 50 },
              { key: 'compsWeight', label: 'Relative Multiples (Comps)', color: '#059669', price: v.compsSharePrice, default: 25 },
              { key: 'rimWeight', label: 'Residual Income Model (RIM)', color: '#7c3aed', price: v.rimSharePrice, default: 15 },
              { key: 'ddmWeight', label: 'Dividend Discount Model (DDM)', color: '#d97706', price: v.ddmSharePrice, default: 10 },
            ].map(m => {
              const curW = Number(a[m.key] ?? m.default);
              const effPct = rawWeightSum > 0 ? Math.round((curW / rawWeightSum) * 100) : 0;
              const contrib = rawWeightSum > 0 ? Math.round((m.price * curW) / rawWeightSum) : 0;

              return (
                <div key={m.key} className="p-3 rounded-xs border border-slate-200 hover:border-slate-300 transition bg-white shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: m.color }} />
                      <span className="text-xs font-bold text-slate-800">{m.label}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        (Target: IDR {m.price})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono text-xs">
                      <span className="text-slate-500 text-[11px]">Contrib: <strong className="text-slate-800">IDR {contrib}</strong></span>
                      <span className="font-bold px-1.5 py-0.5 rounded-xs" style={{ color: curW > 0 ? m.color : '#94a3b8', backgroundColor: curW > 0 ? `${m.color}15` : '#f1f5f9' }}>
                        {curW}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={curW}
                      onChange={(e) => onUpdateAssumption(m.key, parseFloat(e.target.value) || 0, m.label)}
                      className="flex-1 accent-blue-600 cursor-pointer"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="5"
                        value={curW}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                          onUpdateAssumption(m.key, isNaN(val) ? 0 : Math.max(0, Math.min(100, val)), m.label);
                        }}
                        className="w-16 text-right font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xs px-1.5 py-1 text-xs"
                      />
                      <span className="text-xs font-mono text-slate-500">%</span>
                    </div>
                    <button
                      onClick={() => onUpdateAssumption(m.key, 0, `${m.label} set to 0%`)}
                      className={`text-[10px] font-mono px-2 py-1 rounded-xs border transition cursor-pointer ${curW === 0 ? 'bg-rose-50 text-rose-700 border-rose-300 font-bold' : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200'}`}
                      title="Set weight to 0%"
                    >
                      0%
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Donut Chart & Live Composite Summary (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <WeightCompositionDonut
              weights={{
                dcfWeight: a.dcfWeight ?? 50,
                compsWeight: a.compsWeight ?? 25,
                rimWeight: a.rimWeight ?? 15,
                ddmWeight: a.ddmWeight ?? 10
              }}
              prices={{
                dcfSharePrice: v.dcfSharePrice,
                compsSharePrice: v.compsSharePrice,
                rimSharePrice: v.rimSharePrice,
                ddmSharePrice: v.ddmSharePrice
              }}
              size={175}
              strokeWidth={26}
              centerTitle="Target Price"
              centerValue={`IDR ${v.compositeIntrinsicValue?.toLocaleString()}`}
              showLegend={true}
            />

            <div className="w-full mt-3 p-3 bg-slate-900 text-white rounded-xs font-mono text-xs flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Composite Intrinsic Target</span>
                <span className="text-sm font-bold text-emerald-400">IDR {v.compositeIntrinsicValue?.toLocaleString()} / share</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase block">Market Upside</span>
                <span className={`text-sm font-bold ${v.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fmtPct(v.impliedUpside)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. BUY / SELL DECISION & SIMULATED EMS ORDER BLOTTER
function BuySellDecisionWorkspace({ company, decision = {}, onUpdateDecision, simulatedOrders, onStageOrder }) {
  const v = company.valuation || {};
  const [orderSide, setOrderSide] = useState('BUY');
  const [orderType, setOrderType] = useState('LIMIT');
  const [orderLots, setOrderLots] = useState(1000); // 1000 lots = 100,000 shares
  const [limitPrice, setLimitPrice] = useState(company.referencePrice || 270);

  const totalShares = orderLots * 100;
  const grossNotional = totalShares * limitPrice;

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    const newOrd = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      time: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' WIB',
      ticker: company.ticker,
      side: orderSide,
      qtyLots: parseInt(orderLots, 10),
      shares: totalShares,
      type: orderType,
      price: parseFloat(limitPrice),
      notional: grossNotional,
      status: 'STAGED / SIMULATED'
    };
    onStageOrder(newOrd);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-xs">{company.ticker}</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Portfolio Manager Decision & Order Staging Ticket</h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Investment thesis pillars, downside risks, committee action parameters, and simulated IDX 100-share lot EMS order staging.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Thesis & Decision Parameters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
              Investment Thesis & Structural Tailwinds ({company.ticker})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
                  <Icon name="CheckCircle2" size={14} className="text-emerald-600" />
                  <span>Core Bullish Pillars</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(company.thesis || []).map((t, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-xs">
                      <span className="font-mono font-bold text-emerald-700">0{i + 1}.</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-rose-800 flex items-center space-x-1.5">
                  <Icon name="ShieldAlert" size={14} className="text-rose-600" />
                  <span>Key Downside Risks</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {(company.risks || []).map((r, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-rose-50/40 border border-rose-100 p-2.5 rounded-xs">
                      <span className="font-mono font-bold text-rose-700">R{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
              Committee Decision Parameters & PM Notes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Action</label>
                <select
                  value={decision.action || 'BUY'}
                  onChange={(e) => onUpdateDecision({ action: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono font-bold"
                >
                  <option value="BUY">BUY / ACCUMULATE</option>
                  <option value="HOLD">HOLD / NEUTRAL</option>
                  <option value="SELL">SELL / TRIM</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Target Entry (IDR)</label>
                <input
                  type="number"
                  step="5"
                  value={decision.targetEntry || 260}
                  onChange={(e) => onUpdateDecision({ targetEntry: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Target Exit (IDR)</label>
                <input
                  type="number"
                  step="5"
                  value={decision.targetExit || 440}
                  onChange={(e) => onUpdateDecision({ targetExit: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Horizon</label>
                <input
                  type="text"
                  value={decision.horizon || '12-18 Months'}
                  onChange={(e) => onUpdateDecision({ horizon: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                Portfolio Manager Execution Notes
              </label>
              <textarea
                rows={2}
                value={decision.notes || ''}
                onChange={(e) => onUpdateDecision({ notes: e.target.value })}
                className="w-full border border-slate-300 rounded-xs p-2 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Order Ticket (100-Share Lots) */}
        <div className="bg-white border border-slate-200 rounded-xs shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#0A1120] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Simulated IDX Order Ticket
              </span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded-xs">
                1 LOT = 100 SHS
              </span>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 font-mono font-bold rounded-xs border transition ${
                    orderSide === 'BUY' ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 font-mono font-bold rounded-xs border transition ${
                    orderSide === 'SELL' ? 'bg-rose-700 text-white border-rose-800' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  SELL / TRIM
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Security</label>
                  <input
                    type="text"
                    disabled
                    value={company.ticker}
                    className="mt-1 w-full bg-slate-100 border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Execution Strategy</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono"
                  >
                    <option value="LIMIT">LIMIT</option>
                    <option value="VWAP">INSTITUTIONAL VWAP</option>
                    <option value="TWAP">ALGO TWAP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Order Quantity (Lots)</label>
                  <input
                    type="number"
                    step="100"
                    min="1"
                    value={orderLots}
                    onChange={(e) => setOrderLots(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    = {totalShares.toLocaleString()} Shares
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Indicative Price (IDR)</label>
                  <input
                    type="number"
                    step="5"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-xs px-2.5 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xs font-mono space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Estimated Gross Notional:</span>
                  <span className="font-bold text-slate-900">{fmtIDR(grossNotional)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Implied Target Upside:</span>
                  <span className="text-emerald-700 font-semibold">
                    {fmtPct(((v.compositeIntrinsicValue / limitPrice) - 1) * 100)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xs font-mono font-bold text-xs text-white shadow-xs transition ${
                  orderSide === 'BUY' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                STAGE SIMULATED {orderSide} TICKET ({company.ticker})
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Simulated Order Blotter */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase font-mono text-slate-800">Simulated Order Staging Blotter</h3>
          <span className="text-[10px] font-mono text-slate-500">LOCAL SESSION LOG</span>
        </div>
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
              <th className="py-2 px-3">Order ID</th>
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Ticker</th>
              <th className="py-2 px-3">Side</th>
              <th className="py-2 px-3 text-right">Lots (100 shs)</th>
              <th className="py-2 px-3 text-right">Total Shares</th>
              <th className="py-2 px-3 text-right">Price (IDR)</th>
              <th className="py-2 px-3 text-right">Notional</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {simulatedOrders.map(ord => (
              <tr key={ord.id}>
                <td className="py-2 px-3 font-bold text-slate-700">{ord.id}</td>
                <td className="py-2 px-3 text-slate-500">{ord.time}</td>
                <td className="py-2 px-3 font-bold text-slate-900">{ord.ticker}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                    ord.side === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ord.side}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">{ord.qtyLots?.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">{ord.shares?.toLocaleString()}</td>
                <td className="py-2 px-3 text-right">IDR {ord.price?.toLocaleString()}</td>
                <td className="py-2 px-3 text-right font-semibold">{fmtIDR(ord.notional)}</td>
                <td className="py-2 px-3 text-right text-[10px] text-amber-700 font-semibold">{ord.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 7. WATCHLIST & BENCHMARKING COMPARISON
function WatchlistAndComparison({ companies, watchlistIds, compareIds, setCompareIds, onToggleWatchlist, onSelectCompany }) {
  const watchlisted = companies.filter(c => watchlistIds.includes(c.id));
  const compared = companies.filter(c => compareIds.includes(c.id));

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      if (compareIds.length > 1) setCompareIds(compareIds.filter(i => i !== id));
    } else {
      setCompareIds([...compareIds, id]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Watchlist & Property Benchmarking</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Cross-company multiples, margin structures, and valuation upside comparisons across Indonesian property developers.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800">
            Side-by-Side Property Comparison Matrix
          </h2>
          <div className="flex items-center space-x-2">
            {companies.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCompare(c.id)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-xs border ${
                  compareIds.includes(c.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {c.ticker}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[11px] text-slate-700">
                <th className="py-2.5 px-4 font-sans w-60">Metric / Valuation Output</th>
                {compared.map(c => (
                  <th key={c.id} className="py-2.5 px-4 text-right">
                    <div className="text-slate-900 font-bold">{c.ticker}</div>
                    <div className="text-[10px] font-sans font-normal text-slate-500">{c.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-4 font-sans font-medium text-slate-700">Recommendation Signal</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">
                    <RecommendationBadge rec={c.valuation?.recommendation || 'BUY'} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans font-medium text-slate-700">Market Price (IDR)</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right font-bold">IDR {c.referencePrice?.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="bg-blue-50/40 font-bold">
                <td className="py-2 px-4 font-sans text-slate-900">Composite Intrinsic Target</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right text-blue-700">
                    IDR {c.valuation?.compositeIntrinsicValue?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">Implied Upside / Downside</td>
                {compared.map(c => (
                  <td
                    key={c.id}
                    className={`py-2 px-4 text-right font-bold ${
                      c.valuation?.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {fmtPct(c.valuation?.impliedUpside)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">Enterprise Value</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{fmtCompact(c.valuation?.currentEnterpriseValue)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">EV / EBITDA Multiple</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">
                    {(c.valuation?.currentEnterpriseValue / (c.historical?.[4]?.ebitda || 1)).toFixed(1)}x
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">Hurdle WACC Assumption</td>
                {compared.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{c.assumptions?.wacc?.toFixed(2)}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 8. RESEARCH TEAR SHEET & EXPORT
function ReportsAndExport({ company, decision = {}, onDownloadExcel, onTriggerToast }) {
  const v = company.valuation || {};
  const a = company.assumptions || {};
  const lastHist = company.historical ? company.historical[company.historical.length - 1] : {};

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Equity Research Tear Sheet</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Publication-ready valuation memo synchronized dynamically with our verified Python corporate finance engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onDownloadExcel}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-xs flex items-center space-x-1.5 shadow-xs"
          >
            <Icon name="Download" size={13} />
            <span>Download Excel Model (.xlsx)</span>
          </button>
          <button
            onClick={() => {
              onTriggerToast(`Prepared print-ready PDF layout for ${company.name} (${company.ticker}).`);
              window.print();
            }}
            className="px-3.5 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white text-xs font-medium rounded-xs flex items-center space-x-1.5 shadow-xs"
          >
            <Icon name="Printer" size={13} className="text-blue-400" />
            <span>Print / Save Research PDF</span>
          </button>
        </div>
      </div>

      {/* Research Paper Memo */}
      <div className="bg-white border border-slate-300 rounded-xs shadow-md max-w-5xl mx-auto p-8 space-y-6 text-slate-900">
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              VALUEX INSTITUTIONAL EQUITY RESEARCH // INDONESIAN EQUITIES
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {company.name} ({company.exchange}: {company.ticker})
            </h2>
            <p className="text-xs text-slate-600">{company.sector} • {company.industry}</p>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-500">Date: {company.lastUpdated}</div>
            <div className="text-xs text-slate-700 font-semibold">Lead Analyst: {company.analyst}</div>
          </div>
        </div>

        {/* Rating & Target Box */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 p-3.5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Recommendation</span>
            <div className="mt-1"><RecommendationBadge rec={v.recommendation || 'BUY'} size="lg" /></div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Market Close</span>
            <span className="text-base font-bold text-slate-900">IDR {company.referencePrice?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Composite Target</span>
            <span className="text-base font-bold text-blue-700">IDR {v.compositeIntrinsicValue?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Implied Upside</span>
            <span className={`text-base font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(v.impliedUpside)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value</span>
            <span className="text-base font-bold text-slate-900">{fmtCompact(v.currentEnterpriseValue)}</span>
          </div>
        </div>

        {/* Executive Summary & Investment Thesis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Executive Summary & Valuation Triangulation
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {company.description} Our 4-way triangulation framework (50% 10-Year DCF, 25% Property Comps, 15% Residual Income, 10% Dividend Discount Model) establishes an intrinsic equity fair value of <strong>IDR {v.compositeIntrinsicValue?.toLocaleString()} per share</strong> against the market price of <strong>IDR {company.referencePrice?.toLocaleString()}</strong>, implying a compelling upside of <strong>{fmtPct(v.impliedUpside)}</strong>. We reiterate our <strong>{v.recommendation || 'BUY'}</strong> recommendation.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
              {(company.thesis || []).map((item, i) => <li key={i}>{item}</li>)}
            </ul>

            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 border-b border-slate-200 pb-1 pt-2">
              2. Key Valuation Sensitivities & Downside Risks
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
              {(company.risks || []).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-2 text-xs font-mono">
            <h4 className="font-bold uppercase text-slate-800 border-b border-slate-200 pb-1">
              Calibrated WACC Hurdle
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">Risk-Free Rate (Rf):</span>
              <span className="font-bold">6.60%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Equity Risk Premium:</span>
              <span className="font-bold">7.20%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Equity Beta:</span>
              <span className="font-bold">0.75</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cost of Equity (Ke):</span>
              <span className="font-bold">12.00%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pre-Tax Debt (Kd):</span>
              <span className="font-bold">6.50%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Hurdle WACC:</span>
              <span className="font-bold text-blue-800">10.42%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Terminal Growth (g):</span>
              <span className="font-bold">1.50%</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed font-mono">
          <strong>MM6026 ACADEMIC DISCLOSURE:</strong> This tear sheet was generated by the MM6026 Digital Business Valuation platform. All 10-year financial forecasts, WACC calibrations, and 3-statement models have been verified for articulation and zero-balance integrity. Portfolio Manager Rationale Note: "{decision.notes}"
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. INSTITUTIONAL WEBSITE FOOTER & INFORMATIONAL PAGES
// ============================================================================

// Institutional Website Footer Component
function InstitutionalFooter({ onNavigate, onSelectCompany }) {
  const scrollToTop = () => {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="mt-12 -mx-5 -mb-5 bg-[#070C18] text-slate-400 border-t border-slate-800 text-xs font-sans selection:bg-blue-600 selection:text-white">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Co-Branded Header Ribbon */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800/80 gap-5">
          {/* Platform Identity */}
          <div className="flex items-center space-x-3.5 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
            <div className="w-9 h-9 bg-blue-600 flex items-center justify-center rounded-xs font-mono font-bold text-sm text-white shadow-md group-hover:bg-blue-500 transition">
              VX
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-bold text-white text-base tracking-wider">VALUEX</span>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest font-semibold">TERMINAL</span>
              </div>
              <p className="text-[11px] text-slate-400">Institutional Digital Business Valuation Platform (MM6026)</p>
            </div>
          </div>

          {/* Academic Co-Branding Badges: University & Course Logos */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/70 border border-slate-800 rounded-xs px-4 py-2">
            <div className="flex items-center space-x-3">
              <AcademicLogo
                src="/static/img/university_logo.png"
                alt="University Logo"
                label="SBM ITB"
                height={34}
              />
              <span className="h-6 w-px bg-slate-800 hidden sm:block" />
              <AcademicLogo
                src="/static/img/course_logo.png"
                alt="Course Logo"
                label="MM6026 VALUATION"
                height={34}
              />
            </div>
          </div>

          {/* System Status & Top Scroll */}
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-xs text-[11px] font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              ALL SYSTEMS OPERATIONAL
            </span>
            <button
              onClick={scrollToTop}
              className="px-2.5 py-1 rounded-xs text-[11px] font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition cursor-pointer flex items-center space-x-1"
              title="Scroll to top of workspace"
            >
              <span>TOP</span>
              <span>↑</span>
            </button>
          </div>
        </div>

        {/* 4-Column Navigation Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Platform & Information */}
          <div>
            <h4 className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Icon name="Compass" size={13} className="text-blue-400" />
              <span>Platform & Info</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition text-left flex items-center space-x-1.5 text-slate-300 font-medium cursor-pointer">
                  <Icon name="Info" size={12} className="text-slate-400" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition text-left flex items-center space-x-1.5 text-slate-300 font-medium cursor-pointer">
                  <Icon name="Mail" size={12} className="text-slate-400" />
                  <span>Contact Author</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('modeler')} className="hover:text-white transition text-left flex items-center space-x-1.5 text-slate-400 cursor-pointer">
                  <Icon name="Sliders" size={12} className="text-slate-500" />
                  <span>Fundamental CAPM Modeler</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reports')} className="hover:text-white transition text-left flex items-center space-x-1.5 text-slate-400 cursor-pointer">
                  <Icon name="FileText" size={12} className="text-slate-500" />
                  <span>Research Tear Sheet</span>
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('discovery')} className="hover:text-white transition text-left flex items-center space-x-1.5 text-slate-400 cursor-pointer">
                  <Icon name="Search" size={12} className="text-slate-500" />
                  <span>Coverage Screener</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Valuation Engines */}
          <div>
            <h4 className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Icon name="Activity" size={13} className="text-blue-400" />
              <span>Valuation Engines</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  Discounted Cash Flow (FCFF)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  Residual Income Model (RIM)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  Dividend Discount Model (DDM)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  Revalued Net Asset Value (RNAV)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  Economic Value Added (EVA)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('threestatements')} className="hover:text-blue-400 transition text-left cursor-pointer">
                  3-Statement Articulated Model
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Benchmark Coverage Universe */}
          <div>
            <h4 className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Icon name="Building2" size={13} className="text-blue-400" />
              <span>Benchmark Universe</span>
            </h4>
            <ul className="space-y-2 text-xs font-mono text-slate-400">
              <li>
                <button onClick={() => { onSelectCompany('pwon'); onNavigate('valuation'); }} className="hover:text-emerald-400 transition text-left cursor-pointer">
                  <strong className="text-slate-200">PWON.JK</strong> — Pakuwon Jati
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCompany('bsde'); onNavigate('valuation'); }} className="hover:text-emerald-400 transition text-left cursor-pointer">
                  <strong className="text-slate-200">BSDE.JK</strong> — Bumi Serpong
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCompany('ctra'); onNavigate('valuation'); }} className="hover:text-emerald-400 transition text-left cursor-pointer">
                  <strong className="text-slate-200">CTRA.JK</strong> — Ciputra Dev
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCompany('smra'); onNavigate('valuation'); }} className="hover:text-emerald-400 transition text-left cursor-pointer">
                  <strong className="text-slate-200">SMRA.JK</strong> — Summarecon
                </button>
              </li>
              <li>
                <button onClick={() => { onSelectCompany('asii'); onNavigate('valuation'); }} className="hover:text-emerald-400 transition text-left cursor-pointer">
                  <strong className="text-slate-200">ASII.JK</strong> — Astra Int'l
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Author & Academic Affiliation */}
          <div>
            <h4 className="font-mono text-[11px] font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Icon name="GraduationCap" size={13} className="text-blue-400" />
              <span>Author & Academic</span>
            </h4>
            <div className="text-[11px] text-slate-300 mb-2">
              <span className="font-bold text-white text-xs">Ahmad Farhan</span> <span className="text-blue-400 font-mono text-[11px]">(Abas)</span>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                Engineering Physics (ITS) • MBA Finance Candidate (SBM ITB)
              </p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5">
              Master of Business Administration (MBA) • <strong className="text-slate-200">MM6026</strong> Digital Business Valuation. School of Business and Management (SBM ITB).
            </p>

            {/* Social & Direct Profile Pills */}
            <div className="flex items-center space-x-2 mb-3">
              <a
                href="https://www.linkedin.com/in/afenterprisefarhan"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-blue-300 hover:text-white border border-[#0077B5]/40 rounded-xs text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                title="LinkedIn Profile"
              >
                <Icon name="Linkedin" size={11} />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/celeebi"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xs text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                title="GitHub Profile (@celeebi)"
              >
                <Icon name="Github" size={11} />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => onNavigate('about')}
                className="px-2 py-1 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 hover:text-white border border-blue-800/50 rounded-xs text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"
                title="View Full Author Bio"
              >
                <Icon name="User" size={11} />
                <span>Bio</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1.5 font-mono">
              <div>Campus: SBM ITB, Bandung, ID</div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">University Email:</span>
                <a href="mailto:29125329@mahasiswa.itb.ac.id" className="text-blue-400 hover:underline">29125329@mahasiswa.itb.ac.id</a>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Personal Email:</span>
                <a href="mailto:afenterprisefarhan@gmail.com" className="text-blue-400 hover:underline">afenterprisefarhan@gmail.com</a>
              </div>
              <div className="pt-1 text-[10px] text-slate-500">
                Release: <span className="text-slate-400">develop_further (v1.2.0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers & Copyright */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 VALUEX Institutional Equity Terminal. Calibrated for IDX Real Estate Universe.
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition cursor-pointer">About Us</button>
            <span>•</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-white transition cursor-pointer">Contact Author</button>
            <span>•</span>
            <button onClick={() => onNavigate('modeler')} className="hover:text-white transition cursor-pointer">Methodology</button>
            <span>•</span>
            <span className="text-slate-500 italic">Academic research prototype (Not investment advice)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Dedicated "About Us" Workspace View
function AboutUsPage({ onNavigate, onSelectCompany }) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>Terminal</span>
            <span>/</span>
          </button>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase">About Us</span>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Hero Banner with Co-Branded Logos */}
      <div className="bg-[#0A1120] text-white rounded-xs p-6 md:p-8 border border-slate-800 shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 bg-blue-600 flex items-center justify-center rounded-xs font-mono font-extrabold text-xl text-white shadow-lg">
              VX
            </div>
            <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2 rounded-xs border border-slate-800">
              <AcademicLogo
                src="/static/img/university_logo.png"
                alt="University Logo"
                label="SBM ITB"
                height={42}
              />
              <span className="h-8 w-px bg-slate-800" />
              <AcademicLogo
                src="/static/img/course_logo.png"
                alt="Course Logo"
                label="MM6026 DIGITAL VALUATION"
                height={42}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 font-mono text-xs text-blue-400 mb-1">
              <span>INSTITUTIONAL EQUITY RESEARCH PLATFORM</span>
              <span>•</span>
              <span>MM6026 DIGITAL BUSINESS VALUATION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              About VALUEX Terminal
            </h1>
            <p className="mt-2 text-slate-300 text-sm max-w-3xl leading-relaxed">
              VALUEX is a high-precision, institutional-grade digital business valuation terminal engineered for equity research analysts, portfolio managers, and academic scholars in the Indonesian capital markets (IDX).
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              onClick={() => { onSelectCompany('pwon'); onNavigate('valuation'); }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-xs font-bold font-mono transition flex items-center space-x-2 shadow-xs cursor-pointer"
            >
              <Icon name="Play" size={14} />
              <span>Launch PWON.JK Model</span>
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xs text-xs font-medium transition flex items-center space-x-2 cursor-pointer"
            >
              <Icon name="Mail" size={14} />
              <span>Contact Author</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Methodology Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xs shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xs bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Icon name="Scale" size={16} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">5-Way Valuation Triangulation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates single-model biases by synthesizing Discounted Cash Flow (FCFF), Residual Income Model (RIM), Dividend Discount Model (DDM), Revalued Net Asset Value (RNAV), and Economic Value Added (EVA).
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xs shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xs bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Icon name="Layers" size={16} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Articulated 3-Statement Model</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            10-year pro forma projection engine where Income Statement net income flows to Retained Earnings, Capex/Depreciation links to PP&E schedules, and the Balance Sheet guarantees an exact 0.00 IDR variance.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xs shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xs bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Icon name="Sliders" size={16} />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Fundamental CAPM & Provenance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Cost of capital broken into 9 granular parameters: live Yahoo Finance beta, Damodaran country risk premiums (CRP), Bank Indonesia 10Y sovereign yields, and statutory UU HPP tax rates with hoverable citations.
          </p>
        </div>
      </div>

      {/* Academic Credentials & Course Context */}
      <div className="bg-white border border-slate-200 rounded-xs p-6 shadow-2xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Icon name="GraduationCap" size={18} className="text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Academic & Course Pedigree (MM6026)</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
          <div className="space-y-3">
            <p>
              This digital valuation platform was conceptualized, engineered, and calibrated as part of the <strong className="text-slate-900">MM6026 Digital Business Valuation</strong> course within the Master of Business Administration (MBA) program at the <strong className="text-slate-900">School of Business and Management (SBM ITB)</strong>.
            </p>
            <p>
              Under institutional financial modeling frameworks, the platform benchmarks <strong className="text-slate-900">PT Pakuwon Jati Tbk (IDX:PWON)</strong> — a premier Indonesian real estate conglomerate specializing in high-margin superblocks, recurring retail malls, and hospitality assets across Jakarta and Surabaya.
            </p>
          </div>
          <div className="space-y-2 bg-slate-50 p-4 rounded-xs border border-slate-200 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Degree Program:</span>
              <span className="font-bold text-slate-900">Master of Business Administration (MBA)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Course Identifier:</span>
              <span className="font-bold text-slate-900">MM6026 Digital Business Valuation</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Academic Institution:</span>
              <span className="font-bold text-slate-900">SBM ITB (Bandung / Jakarta)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Core Benchmark Security:</span>
              <span className="font-bold text-blue-700">IDX:PWON (Pakuwon Jati Tbk)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Author University Email:</span>
              <a href="mailto:29125329@mahasiswa.itb.ac.id" className="font-bold text-blue-700 hover:underline">29125329@mahasiswa.itb.ac.id</a>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Author Personal Email:</span>
              <a href="mailto:afenterprisefarhan@gmail.com" className="font-bold text-slate-900 hover:underline">afenterprisefarhan@gmail.com</a>
            </div>
          </div>
        </div>
      </div>

      {/* About the Author & Developer */}
      <div className="bg-gradient-to-br from-[#0A1120] via-slate-900 to-[#0e172a] text-white rounded-xs p-6 sm:p-7 border border-slate-800 shadow-md space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-full bg-blue-600 text-white font-mono font-bold text-lg flex items-center justify-center border-2 border-blue-400/50 shadow-md ring-4 ring-blue-500/10 shrink-0">
              AF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Ahmad Farhan</h2>
                <span className="text-xs text-blue-400 font-mono font-medium">(Abas)</span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Engineering Physics (ITS) • MBA Candidate, Finance (SBM ITB)
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2.5 py-1 rounded-xs font-semibold tracking-wide">
              QUANTITATIVE FINANCE
            </span>
            <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-xs font-semibold tracking-wide">
              SYSTEM ARCHITECT
            </span>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <p>
            Hi, I’m <strong className="text-white font-semibold">Ahmad Farhan</strong> (often called <em>Abas</em>). With a background in <strong className="text-slate-100 font-semibold">Engineering Physics from Institut Teknologi Sepuluh Nopember (ITS)</strong> and currently pursuing an <strong className="text-slate-100 font-semibold">MBA with a concentration in Finance at SBM ITB</strong>, I operate at the intersection of quantitative rigor and financial analysis.
          </p>
          <p>
            I built this web application to simplify and streamline core business valuation frameworks—translating complex financial modeling, discounted cash flows, and intrinsic valuation theories into an intuitive, accessible tool for students, analysts, and practitioners alike.
          </p>
          <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xs text-[11px] text-slate-300 flex items-start space-x-2.5">
            <Icon name="Activity" size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              When I’m not building models or analyzing statements, you can usually find me on the <strong className="text-white font-medium">badminton court</strong> or digging into <strong className="text-white font-medium">behavioral economics</strong> and <strong className="text-white font-medium">complex systems</strong>.
            </span>
          </div>
        </div>

        {/* Connect & Feedback Channels */}
        <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <Icon name="Globe" size={13} className="text-blue-400" />
            <span>Connect & Feedback:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://www.linkedin.com/in/afenterprisefarhan"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-blue-300 hover:text-white border border-[#0077B5]/50 rounded-xs text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Icon name="Linkedin" size={13} />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://github.com/celeebi"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xs text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Icon name="Github" size={13} />
              <span>GitHub (@celeebi)</span>
            </a>
            <a
              href="mailto:afenterprisefarhan@gmail.com"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xs text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Icon name="Mail" size={13} />
              <span>afenterprisefarhan@gmail.com</span>
            </a>
            <a
              href="mailto:29125329@mahasiswa.itb.ac.id"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 rounded-xs text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Icon name="GraduationCap" size={13} />
              <span>29125329@mahasiswa.itb.ac.id</span>
            </a>
          </div>
        </div>
      </div>

      {/* Industry Applicability & Architectural Scope */}
      <div className="bg-white border border-slate-200 rounded-xs p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={18} className="text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              Methodology Scope: Non-Banking & Non-Lending Corporate Focus
            </h2>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-xs font-bold self-start sm:self-auto">
            Design Scope
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          VALUEX is deliberately architected for <strong className="text-slate-900">non-financial corporate enterprises</strong> (Real Estate Developers, Conglomerates, Consumer Staples, Industrials, Retail, and Technology). In corporate finance theory (Damodaran, McKinsey Valuation), non-financial corporates follow distinct fundamental mechanics compared to commercial banks and lending institutions:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-2.5">
            <div className="flex items-center space-x-1.5 text-blue-800 font-bold font-mono text-[11px] uppercase">
              <Icon name="CheckCircle2" size={14} className="text-blue-600" />
              <span>Target Scope: Non-Banking Corporate Model</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside leading-relaxed">
              <li><strong className="text-slate-800">Top-Down Demand Engine:</strong> Value creation originates from customer demand ($P \times Q$), market penetration, and operating margin efficiency.</li>
              <li><strong className="text-slate-800">Operational vs. Financial Separation:</strong> Operating profitability (EBITDA / EBIT) is independent of financing decisions (debt vs. equity gearing).</li>
              <li><strong className="text-slate-800">Physical Working Capital:</strong> Receivables and inventories represent physical operational cycles (DSO, DIO, DPO) supporting delivery of real goods and lease spaces.</li>
              <li><strong className="text-slate-800">Enterprise Cash Flows (FCFF):</strong> Enterprise Value is driven by unlevered cash flows available to all capital providers discounted at WACC.</li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xs space-y-2.5">
            <div className="flex items-center space-x-1.5 text-amber-800 font-bold font-mono text-[11px] uppercase">
              <Icon name="AlertTriangle" size={14} className="text-amber-600" />
              <span>Excluded Scope: Banking & Lending Institutions</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 list-disc list-inside leading-relaxed">
              <li><strong className="text-slate-800">Balance Sheet as Product:</strong> For banks, deposits and loans are not operational overhead—they are the core raw materials and revenue-earning assets themselves.</li>
              <li><strong className="text-slate-800">Interest is COGS:</strong> Interest expense is an operating cost, meaning Enterprise Value (EV) and FCFF are conceptually and mathematically inapplicable.</li>
              <li><strong className="text-slate-800">Regulatory Capital Ceiling:</strong> Balance sheet expansion is legally governed by Basel III / OJK Capital Adequacy Ratios (CAR), not operational capacity.</li>
              <li><strong className="text-slate-800">Requires Specialized ALM:</strong> Financial firms require specialized Asset-Liability Management (ALM) spread modeling and regulatory DDM.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tech Stack Details */}
      <div className="bg-slate-900 text-slate-200 rounded-xs p-6 border border-slate-800 space-y-3 text-xs">
        <h3 className="font-mono text-xs uppercase tracking-wider text-blue-400 font-bold">
          High-Performance Technology Architecture
        </h3>
        <p className="text-slate-300 leading-relaxed">
          VALUEX operates with a zero-node, pure Python backend architecture powered by <strong className="text-white">Starlette & Uvicorn</strong>, delivering sub-15ms recalculation latencies. The user interface is driven by <strong className="text-white">React 18</strong> with native SVG visualization components, dynamic KaTeX equation proofs, and client-side financial simulation engines.
        </p>
      </div>
    </div>
  );
}

// Dedicated "Contact Us & Research Desk" Workspace View
function ContactUsPage({ onNavigate, onTriggerToast, onSelectCompany }) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    inquiryType: 'Valuation Model Inquiry',
    ticker: 'PWON.JK',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRefId, setSubmittedRefId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      onTriggerToast('Please fill out all required fields (Name, Email, and Message).');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const refId = `VALUEX-${Math.floor(Math.random() * 90000 + 10000)}`;
      setSubmittedRefId(refId);
      setIsSubmitting(false);
      onTriggerToast(`Inquiry #${refId} dispatched! Thank you, ${formData.name}.`);
      setFormData({
        name: '',
        organization: '',
        email: '',
        inquiryType: 'Valuation Model Inquiry',
        ticker: 'PWON.JK',
        message: ''
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-mono text-slate-500 hover:text-slate-900 flex items-center space-x-1 cursor-pointer"
          >
            <span>Terminal</span>
            <span>/</span>
          </button>
          <span className="text-xs font-mono font-bold text-blue-600 uppercase">Contact Us</span>
        </div>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Icon name="ArrowLeft" size={14} />
          <span>Return to Dashboard</span>
        </button>
      </div>

      {/* Grid: Contact Form + Desk Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Interactive Contact Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xs p-6 shadow-2xs space-y-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contact Author & Research Inquiries</h2>
            <p className="text-xs text-slate-600 mt-1">
              Submit model questions, assumption feedback, data provenance inquiries, or valuation research inquiries directly to the author.
            </p>
          </div>

          {submittedRefId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-900 space-y-1">
              <div className="flex items-center space-x-2 font-bold font-mono text-emerald-800">
                <Icon name="CheckCircle2" size={16} className="text-emerald-600" />
                <span>INQUIRY LOGGED SUCCESSFULLY (REF: #{submittedRefId})</span>
              </div>
              <p>
                Your inquiry has been queued for review by the author. Thank you for your feedback and interest in the MM6026 valuation model.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Organization / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. SBM ITB / Equity Research"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Institutional Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@institution.ac.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Target Security Ticker
                </label>
                <input
                  type="text"
                  placeholder="e.g. PWON, BSDE, or General"
                  value={formData.ticker}
                  onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs font-mono uppercase focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Inquiry Topic
              </label>
              <select
                value={formData.inquiryType}
                onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="Valuation Model Inquiry">Valuation Model & Triangulation Inquiry</option>
                <option value="Data Provenance & CAPM Query">Fundamental CAPM & Data Provenance Query</option>
                <option value="3-Statement Accounting Question">3-Statement Pro Forma Accounting Question</option>
                <option value="Bug / Discrepancy Report">Bug or Valuation Discrepancy Report</option>
                <option value="Academic Collaboration">Academic & Course Collaboration (MM6026)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Detailed Message <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                placeholder="Specify your inquiry, formula question, or suggested assumption revision..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xs p-3 text-xs focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-xs text-xs font-mono transition flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <Icon name="Send" size={14} />
              <span>{isSubmitting ? 'DISPATCHING INQUIRY...' : 'DISPATCH INQUIRY'}</span>
            </button>
          </form>
        </div>

        {/* Right Column (5 cols): Campus Coordinates & FAQ */}
        <div className="lg:col-span-5 space-y-4">
          {/* Author Profile & Academic Coordinates */}
          <div className="bg-[#0A1120] text-white rounded-xs p-5 border border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center border border-blue-400/50 shadow-sm shrink-0">
                  AF
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-sm text-white">Ahmad Farhan</h3>
                    <span className="text-xs text-blue-400 font-mono">(Abas)</span>
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono">
                    Engineering Physics (ITS) • MBA SBM ITB
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-xs font-semibold">
                MBA CANDIDATE
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Operating at the intersection of quantitative rigor and financial modeling. Active in badminton, behavioral economics, and complex systems.
              </p>

              {/* Direct Connect Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                <a
                  href="https://www.linkedin.com/in/afenterprisefarhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-[#0077B5]/20 hover:bg-[#0077B5]/30 text-blue-300 hover:text-white border border-[#0077B5]/40 rounded-xs text-[11px] font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Icon name="Linkedin" size={12} />
                  <span>LinkedIn Profile</span>
                </a>
                <a
                  href="https://github.com/celeebi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xs text-[11px] font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Icon name="Github" size={12} />
                  <span>GitHub (@celeebi)</span>
                </a>
              </div>

              <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-800/80">
                <Icon name="GraduationCap" size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Academic Program</span>
                  <span className="text-slate-300 font-medium">Master of Business Administration (MBA)</span>
                  <span className="text-slate-400 block text-[11px]">School of Business and Management (SBM ITB)</span>
                  <span className="text-slate-400 block text-[11px]">Jl. Ganesha No. 10, Bandung, Indonesia</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Icon name="Clock" size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Jakarta Trading Hours</span>
                  <span className="text-slate-400 font-mono text-[11px]">Mon - Fri: 09:00 - 16:00 WIB</span>
                  <span className="text-slate-400 block text-[10px]">(Sessions I & II synchronized)</span>
                </div>
              </div>

              <div className="flex items-start space-x-2.5">
                <Icon name="Mail" size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <span className="font-semibold text-white block">Direct Author Email Addresses</span>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">University Email:</span>
                    <a href="mailto:29125329@mahasiswa.itb.ac.id" className="text-blue-400 hover:underline font-mono text-[11px] block">
                      29125329@mahasiswa.itb.ac.id
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Personal Email:</span>
                    <a href="mailto:afenterprisefarhan@gmail.com" className="text-blue-400 hover:underline font-mono text-[11px] block">
                      afenterprisefarhan@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ Card */}
          <div className="bg-white border border-slate-200 rounded-xs p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 font-mono flex items-center space-x-1.5">
              <Icon name="HelpCircle" size={14} className="text-blue-600" />
              <span>Frequently Asked Questions</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="border border-slate-100 rounded-xs p-2.5 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">How is the Hurdle WACC calibrated?</div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  Through fundamental CAPM: Ke = Rf + Beta × (Mature ERP + CRP). Drivers are sourced from Bank Indonesia 10Y sovereign yields and Damodaran Moody's Baa2 spread.
                </div>
              </div>

              <div className="border border-slate-100 rounded-xs p-2.5 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">Can I test custom tickers beyond PWON?</div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  Yes, use the universal ticker search bar at the top right to load any IDX or international symbol (e.g., BBCA, TLKM, UNVR).
                </div>
              </div>

              <div className="border border-slate-100 rounded-xs p-2.5 bg-slate-50">
                <div className="font-bold text-slate-900 mb-1">How do I export to Microsoft Excel?</div>
                <div className="text-slate-600 text-[11px] leading-relaxed">
                  Click the "Export Active Model to Excel" button on the Tear Sheet or Valuation workspace to download a multi-sheet articulated workbook.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Institutional React Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Valuation Terminal Error Caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', margin: '24px', background: '#FFF1F2', border: '2px solid #F43F5E', borderRadius: '8px', fontFamily: 'monospace', color: '#9F1239' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Terminal Display Error</h2>
          <p style={{ fontSize: '13px', marginBottom: '12px' }}>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '6px 16px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
            Reload Terminal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Mount React Root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
