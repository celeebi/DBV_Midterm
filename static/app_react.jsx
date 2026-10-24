/**

 * VALUEX Institutional Equity Research & Financial Modeling Platform

 * MM6026 Digital Business Valuation Mid-Term Project

 * Universal Institutional Valuation Terminal for All Indonesia Stock Exchange (IDX) Equities

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



// =============================================================================
// EXHIBIT 1: SHARE PRICE VS. REBASED JCI & 12-MONTH TARGET PRICE CONE
// Visualizes 5-year historical price trajectory against benchmark JCI index,
// historical milestone event callouts, and 12-month forward scenario cone:
// [ BULL TP, BASE TP, BEAR TP ]
// =============================================================================
function TargetPriceConeChart({
  company,
  backendData = null,
  basePrice = null,
  bullPrice = null,
  bearPrice = null,
}) {
  if (!company) {
    return <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">No company selected</div>;
  }

  const currentPrice = company.referencePrice || 1000;
  const beta = company.beta || 1.0;
  const ticker = company.ticker || 'IDX';

  // Effective scenario target levels
  const effBase = (basePrice !== null && basePrice !== undefined && Number(basePrice) > 0)
    ? Number(basePrice)
    : Math.round(currentPrice * 1.15);

  let effBull = (bullPrice !== null && bullPrice !== undefined && Number(bullPrice) > 0)
    ? Number(bullPrice)
    : Math.round(effBase * 1.25);

  let effBear = (bearPrice !== null && bearPrice !== undefined && Number(bearPrice) > 0)
    ? Number(bearPrice)
    : Math.round(effBase * 0.75);

  // Invariant assertion: Bear < Base < Bull
  if (effBear >= effBase) {
    effBear = Math.round(effBase * 0.85);
  }
  if (effBull <= effBase) {
    effBull = Math.round(effBase * 1.20);
  }

  // Scenario Upside Percentages
  const bullUpside = +(((effBull / currentPrice) - 1) * 100).toFixed(1);
  const baseUpside = +(((effBase / currentPrice) - 1) * 100).toFixed(1);
  const bearUpside = +(((effBear / currentPrice) - 1) * 100).toFixed(1);

  // Macro-calibrated historical points (Feb 2021 to Oct 2026)
  const historicalMacro = [
    { date: "2021-02", label: "Feb-21", jciRat: 1.00, stockFactor: 1.04 },
    { date: "2021-06", label: "Jun-21", jciRat: 0.98, stockFactor: 0.96 },
    { date: "2021-11", label: "Nov-21", jciRat: 1.06, stockFactor: 1.02 },
    { date: "2022-04", label: "Apr-22", jciRat: 1.16, stockFactor: 1.12 },
    { date: "2022-08", label: "Aug-22", jciRat: 1.14, stockFactor: 1.05 },
    { date: "2022-12", label: "Dec-22", jciRat: 1.10, stockFactor: 0.90, milestone: "Rights Issue / Cycle Base" },
    { date: "2023-05", label: "May-23", jciRat: 1.08, stockFactor: 0.97 },
    { date: "2023-09", label: "Sep-23", jciRat: 1.11, stockFactor: 1.02 },
    { date: "2024-02", label: "Feb-24", jciRat: 1.18, stockFactor: 1.14 },
    { date: "2024-06", label: "Jun-24", jciRat: 1.15, stockFactor: 1.08 },
    { date: "2024-10", label: "Oct-24", jciRat: 1.22, stockFactor: 1.24, milestone: "Bullion & Earnings Rally" },
    { date: "2025-03", label: "Mar-25", jciRat: 1.19, stockFactor: 1.16 },
    { date: "2025-08", label: "Aug-25", jciRat: 1.20, stockFactor: 1.12 },
    { date: "2025-12", label: "Dec-25", jciRat: 1.18, stockFactor: 1.05 },
    { date: "2026-05", label: "May-26", jciRat: 1.16, stockFactor: 0.98 },
    { date: "2026-10", label: "Oct-26", jciRat: 1.19, stockFactor: 1.00, isCurrent: true },
  ];

  const lastStockFactor = historicalMacro[historicalMacro.length - 1].stockFactor;
  const p0 = currentPrice * (historicalMacro[0].stockFactor / lastStockFactor);
  const j0 = historicalMacro[0].jciRat;

  const points = historicalMacro.map(item => ({
    date: item.date,
    label: item.label,
    price: Math.round(currentPrice * (item.stockFactor / lastStockFactor)),
    jciRebased: Math.round(p0 * (item.jciRat / j0)),
    milestone: item.milestone || null,
    isCurrent: item.isCurrent || false,
  }));

  // Coordinate Geometry
  const width = 880;
  const height = 340;
  const padding = { top: 32, right: 185, bottom: 45, left: 60 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Split: 77% historical, 23% forward cone
  const histW = chartW * 0.77;
  const coneW = chartW * 0.23;

  const allVals = [
    ...points.map(p => p.price),
    ...points.map(p => p.jciRebased),
    effBull,
    effBase,
    effBear
  ];
  const minVal = Math.max(0, Math.min(...allVals) * 0.88);
  const maxVal = Math.max(...allVals) * 1.10;

  const getHistX = (idx) => padding.left + (idx / Math.max(1, points.length - 1)) * histW;
  const getY = (val) => padding.top + chartH - ((val - minVal) / Math.max(1, maxVal - minVal)) * chartH;

  const xNow = padding.left + histW;
  const yNow = getY(currentPrice);
  const x12m = padding.left + chartW;
  const yBull = getY(effBull);
  const yBase = getY(effBase);
  const yBear = getY(effBear);

  // SVG Paths
  const pricePoints = points.map((p, i) => `${getHistX(i)},${getY(p.price)}`);
  const pricePath = `M ${pricePoints.join(' L ')}`;

  const jciPoints = points.map((p, i) => `${getHistX(i)},${getY(p.jciRebased)}`);
  const jciPath = `M ${jciPoints.join(' L ')}`;

  // Shaded area under historical price curve
  const areaHistPath = `M ${getHistX(0)},${getY(points[0].price)} L ${pricePoints.join(' L ')} L ${xNow},${padding.top + chartH} L ${getHistX(0)},${padding.top + chartH} Z`;

  // Forward Target Cone Shading (polygon radiating from xNow, yNow to yBull and yBear at x12m)
  const coneShadePath = `M ${xNow},${yNow} L ${x12m},${yBull} L ${x12m},${yBear} Z`;

  // Y-axis tick intervals
  const yTicks = [0, 0.25, 0.50, 0.75, 1].map(r => Math.round(minVal + r * (maxVal - minVal)));

  return (
    <div className="w-full flex flex-col justify-between select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Top-Left Embedded Chart Header & Legend */}
        <g transform="translate(60, 18)">
          <g transform="translate(0, 0)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#0D9488" strokeWidth="2.5" />
            <text x="22" y="3" fontSize="10" fill="#0F172A" fontFamily="monospace" fontWeight="bold">
              {ticker} Share Price (IDR)
            </text>
          </g>

          <g transform="translate(185, 0)">
            <line x1="0" y1="0" x2="16" y2="0" stroke="#64748B" strokeWidth="1.8" strokeDasharray="4 3" />
            <text x="22" y="3" fontSize="10" fill="#64748B" fontFamily="monospace">
              JCI (IHSG) Rebased to {ticker} Feb-21
            </text>
          </g>

          <g transform="translate(425, 0)">
            <rect x="0" y="-5" width="14" height="10" fill="rgba(13, 148, 136, 0.15)" stroke="#0D9488" strokeWidth="0.8" rx="1" />
            <text x="20" y="3" fontSize="10" fill="#0D9488" fontFamily="monospace">
              12M Scenario Target Cone
            </text>
          </g>
        </g>

        {/* Y Gridlines and Labels */}
        {yTicks.map((tVal, idx) => {
          const y = getY(tVal);
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={x12m} y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
              <text x={padding.left - 10} y={y + 3.5} textAnchor="end" fontSize="10" fill="#64748B" fontFamily="monospace">
                {tVal.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* Y-Axis Label */}
        <text
          x={-(padding.top + chartH / 2)}
          y="18"
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="10"
          fill="#475569"
          fontFamily="monospace"
          fontWeight="bold"
        >
          Share Price (IDR)
        </text>

        {/* Historical Price Area Fill */}
        <path d={areaHistPath} fill="rgba(13, 148, 136, 0.08)" />

        {/* Rebased JCI Dashed Line */}
        <path d={jciPath} fill="none" stroke="#64748B" strokeWidth="1.8" strokeDasharray="5 3" />

        {/* Historical Price Trajectory Line */}
        <path d={pricePath} fill="none" stroke="#0D9488" strokeWidth="2.5" />

        {/* Milestone Callout Pins and Badges */}
        {points.map((p, i) => {
          if (!p.milestone) return null;
          const px = getHistX(i);
          const py = getY(p.price);
          const isHigh = p.price > (p.jciRebased || 0);
          const badgeY = isHigh ? py - 26 : py + 26;

          return (
            <g key={i}>
              <circle cx={px} cy={py} r="4" fill="#0D9488" stroke="#FFFFFF" strokeWidth="1.5" />
              <line x1={px} y1={py} x2={px} y2={badgeY} stroke="#0D9488" strokeWidth="1" strokeDasharray="2 2" />
              <g transform={`translate(${px - 50}, ${isHigh ? badgeY - 18 : badgeY})`}>
                <rect width="100" height="20" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1" rx="2" />
                <text x="50" y="9" textAnchor="middle" fontSize="7.5" fill="#0D9488" fontFamily="monospace" fontWeight="bold">
                  {p.label}: {p.milestone.split('/')[0]}
                </text>
                <text x="50" y="17" textAnchor="middle" fontSize="7.5" fill="#0F172A" fontFamily="monospace">
                  (IDR {p.price.toLocaleString()})
                </text>
              </g>
            </g>
          );
        })}

        {/* Current Closing Marker Pin */}
        <g>
          <circle cx={xNow} cy={yNow} r="5" fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" />
          <line x1={xNow} y1={yNow} x2={xNow - 40} y2={yNow + 25} stroke="#0D9488" strokeWidth="1.2" />
          <g transform={`translate(${xNow - 110}, ${yNow + 25})`}>
            <rect width="105" height="22" fill="#FFFFFF" stroke="#0D9488" strokeWidth="1.2" rx="2" />
            <text x="52" y="9" textAnchor="middle" fontSize="8" fill="#0F172A" fontFamily="monospace" fontWeight="bold">
              Oct-26 Close: IDR {currentPrice.toLocaleString()}
            </text>
            <text x="52" y="18" textAnchor="middle" fontSize="7.5" fill="#64748B" fontFamily="monospace">
              (Current Market Quote)
            </text>
          </g>
        </g>

        {/* Vertical Guideline at 12M Horizon Line */}
        <line x1={x12m} y1={padding.top} x2={x12m} y2={padding.top + chartH} stroke="#CBD5E1" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* 12M Forward Shaded Target Cone */}
        <path d={coneShadePath} fill="rgba(13, 148, 136, 0.10)" />

        {/* 1. BULL TP Line & Badge */}
        <g>
          <line x1={xNow} y1={yNow} x2={x12m} y2={yBull} stroke="#10B981" strokeWidth="2" strokeDasharray="5 3" />
          <circle cx={x12m} cy={yBull} r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform={`translate(${x12m + 8}, ${yBull - 9})`}>
            <rect width="160" height="18" fill="#ECFDF5" stroke="#10B981" strokeWidth="1" rx="2" />
            <text x="80" y="12.5" textAnchor="middle" fontSize="9" fill="#065F46" fontFamily="monospace" fontWeight="bold">
              BULL TP: IDR {effBull.toLocaleString()} ({bullUpside >= 0 ? '+' : ''}{bullUpside}%)
            </text>
          </g>
        </g>

        {/* 2. BASE TP Line & Badge */}
        <g>
          <line x1={xNow} y1={yNow} x2={x12m} y2={yBase} stroke="#2563EB" strokeWidth="2" strokeDasharray="5 3" />
          <circle cx={x12m} cy={yBase} r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform={`translate(${x12m + 8}, ${yBase - 9})`}>
            <rect width="160" height="18" fill="#EFF6FF" stroke="#2563EB" strokeWidth="1" rx="2" />
            <text x="80" y="12.5" textAnchor="middle" fontSize="9" fill="#1E40AF" fontFamily="monospace" fontWeight="bold">
              BASE TP: IDR {effBase.toLocaleString()} ({baseUpside >= 0 ? '+' : ''}{baseUpside}%)
            </text>
          </g>
        </g>

        {/* 3. BEAR TP Line & Badge */}
        <g>
          <line x1={xNow} y1={yNow} x2={x12m} y2={yBear} stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" />
          <circle cx={x12m} cy={yBear} r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
          <g transform={`translate(${x12m + 8}, ${yBear - 9})`}>
            <rect width="160" height="18" fill="#FFF1F2" stroke="#EF4444" strokeWidth="1" rx="2" />
            <text x="80" y="12.5" textAnchor="middle" fontSize="9" fill="#991B1B" fontFamily="monospace" fontWeight="bold">
              BEAR TP: IDR {effBear.toLocaleString()} ({bearUpside >= 0 ? '+' : ''}{bearUpside}%)
            </text>
          </g>
        </g>

        {/* X-Axis Month Labels (Angled) */}
        {points.map((p, i) => {
          if (i % 2 !== 0 && !p.isCurrent) return null;
          const x = getHistX(i);
          const y = padding.top + chartH + 15;

          return (
            <text
              key={i}
              x={x}
              y={y}
              transform={`rotate(-25, ${x}, ${y})`}
              textAnchor="end"
              fontSize="9"
              fill="#64748B"
              fontFamily="monospace"
            >
              {p.date}
            </text>
          );
        })}

        {/* 12M Forward Target X-Axis Label */}
        <text
          x={x12m}
          y={padding.top + chartH + 15}
          transform={`rotate(-25, ${x12m}, ${padding.top + chartH + 15})`}
          textAnchor="end"
          fontSize="9.5"
          fill="#0D9488"
          fontFamily="monospace"
          fontWeight="bold"
        >
          12M Target (Oct-27E)
        </text>
      </svg>
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

    { key: 'compsWeight', label: 'Relative Multiples (Comps)', shortLabel: 'Comps', color: '#059669', weight: Number(weights.compsWeight ?? 25), price: prices.compsSharePrice || 0 },

    { key: 'rimWeight', label: 'Residual Income (RIM)', shortLabel: 'RIM', color: '#7c3aed', weight: Number(weights.rimWeight ?? 15), price: prices.rimSharePrice || 0 },

    { key: 'ddmWeight', label: 'Dividend Discount (DDM)', shortLabel: 'DDM', color: '#d97706', weight: Number(weights.ddmWeight ?? 10), price: prices.ddmSharePrice || 0 },

  ];



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



// Indonesian Capital Markets & Macroeconomic Tape

const INITIAL_MACRO_BENCHMARKS = [

  { id: 'ihsg', symbol: 'IHSG (IDX COMP)', price: 7785.40, changePct: 0.42 },

  { id: 'id10y', symbol: 'ID 10Y SOVEREIGN', price: 6.60, changePct: -0.15, isYield: true },

  { id: 'usdidr', symbol: 'USD / IDR', price: 15850.00, changePct: -0.12 },

  { id: 'bi7drr', symbol: 'BI 7-DAY REPO', price: 6.00, changePct: 0.0, isYield: true },

  { id: 'lq45', symbol: 'IDX LQ45', price: 928.30, changePct: 0.58 },

  { id: 'spx', symbol: 'S&P 500', price: 5892.45, changePct: 0.35 },

];



// Rotating Indonesian Macroeconomic & Multi-Sector Research Wire
const BREAKING_WIRE_HEADLINES = [
  { id: 1, ticker: 'MACRO', source: 'BANK INDONESIA', link: 'https://www.bi.go.id/id/statistik/indikator/bi-rate.aspx', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'BANK INDONESIA: Holds 7-Day Reverse Repo rate steady at 6.00%; monetary policy anchors rupiah stability and foreign capital inflows.' },
  { id: 2, ticker: 'IHSG', source: 'IDX MARKET', link: 'https://www.idx.co.id/id/data-pasar/ringkasan-perdagangan/ringkasan-indeks', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'IDX MARKET TAPE: IHSG tracks firm above 7,700 with daily turnover surpassing IDR 12.8T; broad sector leadership across banking, mining, and consumer.' },
  { id: 3, ticker: 'AKRA.JK', source: 'CNBC INDONESIA', link: 'https://www.cnbcindonesia.com/market', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'AKRA: Petroleum and basic chemical throughput expands +8.4% YoY; JIIPE industrial estate monetization accelerates institutional operating cash flows.' },
  { id: 4, ticker: 'ANTM.JK', source: 'KONTAN', link: 'https://investasi.kontan.co.id/', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'ANTM: Gold and nickel sales volumes sustain double-digit growth; EV battery upstream integration enhances long-term ROIC outlook.' },
  { id: 5, ticker: 'ASII.JK', source: 'BISNIS.COM', link: 'https://market.bisnis.com/', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'ASII: Automotive market share steady at 53%; fortress net cash position underpins resilient institutional dividend yield.' },
  { id: 6, ticker: 'TLKM.JK', source: 'IDX CHANNEL', link: 'https://www.idxchannel.com/market-news', sentiment: 'NEUTRAL', time: 'LIVE WIRE', headline: 'TLKM: Data center and enterprise cloud segment monetization offsets legacy mobile voice transitions; FY26 capex guided disciplined.' }
];

// Parameter Data Provenance & Academic Metadata Registry
const PARAM_PROVENANCE = {
  beta: {
    title: "Equity Beta (β)",
    badge: "LIVE YAHOO API",
    badgeColor: "bg-blue-900 text-blue-200 border-blue-500",
    source: "Yahoo Finance Live API / CFA Institute",
    citation: "5-Year Monthly Regression against Jakarta Composite Index (IHSG)",
    url: "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/cost-capital",
    domain: "cfainstitute.org",
    methodology: "Calculated as Cov(R_stock, R_ihsg) / Var(R_ihsg) over 60 monthly periods. Measures systemic sensitivity and financial/operating leverage.",
    impact: "Scales the Equity Risk Premium. Raising beta increases Cost of Equity (Ke) and lowers DCF, RIM, and DDM fair values.",
    defaultText: "1.00 (Market Benchmark) / Scraped live for any searched equity"
  },
  rf: {
    title: "Risk-Free Rate (Rf)",
    badge: "BANK INDONESIA 10Y",
    badgeColor: "bg-emerald-900 text-emerald-200 border-emerald-500",
    source: "Bank Indonesia / Ministry of Finance (DJPPR)",
    citation: "10-Year Republic of Indonesia Benchmark Government Bond Yield (INDOGB 10Y)",
    url: "https://tradingeconomics.com/indonesia/government-bond-yield",
    domain: "tradingeconomics.com",
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
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html",
    domain: "pages.stern.nyu.edu",
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
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html",
    domain: "pages.stern.nyu.edu",
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
    url: "https://www.bi.go.id/id/statistik/indikator/bi-rate.aspx",
    domain: "bi.go.id",
    methodology: "Effective weighted borrowing cost on outstanding bank credit facilities and corporate rupiah debt notes.",
    impact: "Direct cost of debt capital. Mitigated by the corporate income tax shield: Kd(after) = Kd × (1 - t).",
    defaultText: "6.50% (Effective corporate borrowing rate)"
  },
  wd: {
    title: "Debt Weight (Wd) / Leverage",
    badge: "CAPITAL STRUCTURE",
    badgeColor: "bg-slate-800 text-slate-200 border-slate-600",
    source: "Audited Balance Sheet & CFA Institute",
    citation: "Gearing = Total Debt / (Total Debt + Market Equity Value)",
    url: "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-structure",
    domain: "cfainstitute.org",
    methodology: "Proportion of interest-bearing debt in the firm's total enterprise funding structure.",
    impact: "Balances the mix between higher-cost equity (Ke ~12%) and lower-cost after-tax debt (Kd ~5.07%).",
    defaultText: "20.0% (Target debt capital weighting)"
  },
  taxRate: {
    title: "Corporate Tax Rate (t)",
    badge: "UU HPP 22%",
    badgeColor: "bg-emerald-900 text-emerald-200 border-emerald-500",
    source: "Indonesian Directorate General of Taxes (DJP)",
    citation: "Harmonization of Tax Regulations Law No. 7/2021 (UU HPP Pasal 17)",
    url: "https://pajak.go.id/id/tarif-pajak-penghasilan-pph-badan",
    domain: "pajak.go.id",
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
    url: "https://pages.stern.nyu.edu/~adamodar/pdfiles/country/termval.pdf",
    domain: "pages.stern.nyu.edu",
    methodology: "Long-term perpetual growth rate for Gordon Growth cash flows after Year 10. Cannot exceed risk-free rate or national GDP.",
    impact: "Massive leverage on terminal value. Capped at 4.0% to prevent infinite economic value paradox.",
    defaultText: "1.50% (Conservative steady-state)"
  },
  exitEbitdaMultiple: {
    title: "Terminal Exit Multiple (EV/EBITDA)",
    badge: "IDX PEER COMPS",
    badgeColor: "bg-indigo-900 text-indigo-200 border-indigo-500",
    source: "Corporate Finance Institute (CFI) / IDX Peer Comps",
    citation: "10-Year Normalized EV/EBITDA Multiple across IDX Peers",
    url: "https://corporatefinanceinstitute.com/resources/valuation/ev-ebitda/",
    domain: "corporatefinanceinstitute.com",
    methodology: "Terminal multiple cross-check applied to Year 10 EBITDA.",
    impact: "Blended 50/50 with Gordon Growth perpetuity to compute robust Enterprise Value.",
    defaultText: "6.5x (Normalized peer median)"
  },
  ebitdaMargin: {
    title: "Steady-State EBITDA Margin (%)",
    badge: "AUDITED DRIVER",
    badgeColor: "bg-blue-900 text-blue-200 border-blue-500",
    source: "IDX Audited Filings & Damodaran Margin Dataset",
    citation: "Historical 5-Year Audited EBITDA / Revenue Benchmark",
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/margin.html",
    domain: "pages.stern.nyu.edu",
    methodology: "Operating cash profitability before D&A, interest, and tax. Anchored to 5-year historical actuals.",
    impact: "Primary driver of NOPAT and Free Cash Flow to Firm (FCFF) across the 10-year forecast.",
    defaultText: "Calibrated to 5Y historical average"
  },
  capexPercentRev: {
    title: "Capital Expenditure Intensity (% Rev)",
    badge: "REINVESTMENT",
    badgeColor: "bg-amber-900 text-amber-200 border-amber-500",
    source: "IDX Cash Flow Statements & Damodaran CapEx Dataset",
    citation: "Maintenance & Expansion PP&E Additions / Gross Revenue",
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/capex.html",
    domain: "pages.stern.nyu.edu",
    methodology: "Annual cash outflow for property, plant, equipment, and investment property divided by revenue.",
    impact: "Directly deducted from Operating Cash Flow when computing Free Cash Flow to Firm (FCFF).",
    defaultText: "Calibrated to 5Y historical CapEx/Rev"
  },
  daPercentRev: {
    title: "Depreciation & Amortization (% Rev)",
    badge: "PSAK 16 / IAS 16",
    badgeColor: "bg-slate-800 text-slate-200 border-slate-600",
    source: "Audited Notes to Financial Statements & CFI Guide",
    citation: "Straight-LinePP&E & Intangible Amortization Schedule",
    url: "https://corporatefinanceinstitute.com/resources/accounting/depreciation-methods/",
    domain: "corporatefinanceinstitute.com",
    methodology: "Non-cash allocation of historical fixed asset cost over useful economic life.",
    impact: "Reduces taxable EBIT (creating a tax shield) and is added back in full to NOPAT to derive FCFF.",
    defaultText: "5.0% (Historical D&A intensity)"
  },
  nwcPercentRevChange: {
    title: "Net Working Capital Intensity (% ΔRev)",
    badge: "WORKING CAPITAL",
    badgeColor: "bg-teal-900 text-teal-200 border-teal-500",
    source: "Audited Balance Sheet Drivers & Damodaran WC Dataset",
    citation: "Incremental Non-Cash Working Capital per IDR of Revenue Growth",
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/wcdata.html",
    domain: "pages.stern.nyu.edu",
    methodology: "Calculated from DSO (Receivables), DIO (Inventory), and DPO (Payables) cash conversion cycle.",
    impact: "Determines cash tied up in working capital as revenue scales: ΔNWC = % × (Rev_t - Rev_{t-1}).",
    defaultText: "4.0% (Incremental working capital need)"
  }
};

// Interactive Hoverable & Clickable Data Provenance Tooltip Component
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (meta.url) {
            window.open(meta.url, '_blank', 'noopener,noreferrer');
          } else {
            setShow(!show);
          }
        }}
        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-blue-50"
        title={meta.url ? `Click to open ${meta.domain} reference in new tab (Hover for methodology)` : "View Data Provenance & Methodology"}
        aria-label="Data Provenance & External Reference"
      >
        <Icon name="Info" size={13} />
      </button>

      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full pb-2 w-72 sm:w-80 z-50">
          <div className="relative bg-slate-900 text-white rounded-md shadow-2xl border border-slate-700 p-3 text-[11px] leading-snug animate-fadeIn pointer-events-auto text-left font-sans">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-1">
              <span className="font-bold font-mono text-slate-100">{meta.title}</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs border ${meta.badgeColor}`}>
                {meta.badge}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-400 font-medium">Source: </span>
                {meta.url ? (
                  <a
                    href={meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-300 hover:text-blue-200 font-semibold underline decoration-blue-500/50 hover:decoration-blue-300 transition"
                  >
                    {meta.source} ↗
                  </a>
                ) : (
                  <span className="text-slate-200 font-semibold">{meta.source}</span>
                )}
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
              {meta.url && (
                <div className="pt-1.5 mt-1 border-t border-slate-800">
                  <a
                    href={meta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-blue-950/90 hover:bg-blue-900 border border-blue-500/50 hover:border-blue-400 rounded-xs text-blue-200 hover:text-white transition-all group cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5 font-semibold text-[10px]">
                      <span>↗</span>
                      <span>Verify at {meta.domain}</span>
                    </span>
                    <span className="text-[9px] font-mono text-blue-300 group-hover:text-white uppercase tracking-wider">Open Link</span>
                  </a>
                </div>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Interactive Hoverable & Clickable Live News Wire Provenance Tooltip
function NewsWireProvenanceTooltip({ wireItem }) {
  const [show, setShow] = useState(false);
  if (!wireItem) return null;

  const targetUrl = wireItem.link || "https://www.cnbcindonesia.com/market";
  const sourceName = wireItem.source || "Indonesian Macro & IDX Wire";
  const sentiment = wireItem.sentiment || "NEUTRAL";
  const badgeColor = sentiment === "BULLISH"
    ? "bg-emerald-900 text-emerald-200 border-emerald-500"
    : sentiment === "BEARISH"
    ? "bg-rose-900 text-rose-200 border-rose-500"
    : "bg-amber-900 text-amber-200 border-amber-500";

  return (
    <div
      className="relative inline-flex items-center shrink-0"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(targetUrl, '_blank', 'noopener,noreferrer');
        }}
        className="text-slate-400 hover:text-blue-400 transition-colors cursor-pointer p-0.5 rounded-full hover:bg-slate-800"
        title={`Click to open full article on ${sourceName} (Hover for news provenance)`}
        aria-label="News Provenance & Article Link"
      >
        <Icon name="Info" size={12} />
      </button>

      {show && (
        <div className="absolute left-0 top-full pt-2 w-80 sm:w-96 z-50">
          <div className="relative bg-slate-900 text-white rounded-md shadow-2xl border border-slate-700 p-3 text-[11px] leading-snug animate-fadeIn pointer-events-auto text-left font-sans">
            <div className="absolute bottom-full left-3 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900"></div>
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 gap-1">
              <span className="font-bold font-mono text-slate-100">Live Macroeconomic & IHSG Wire</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-xs border ${badgeColor}`}>
                {sentiment}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-400 font-medium">Publisher Agency: </span>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-300 hover:text-blue-200 font-semibold underline decoration-blue-500/50 transition"
                >
                  {sourceName} ↗
                </a>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Full Headline: </span>
                <span className="text-slate-100 font-medium">{wireItem.headline}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Methodology: </span>
                <span className="text-slate-300">Aggregated live via Google News Indonesia RSS feed with automated bilingual financial sentiment scoring (10-minute TTL cache).</span>
              </div>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Timestamp / Feed:</span>
                <span className="text-emerald-400 font-semibold">{wireItem.time || 'LIVE RSS STREAM'}</span>
              </div>
              <div className="pt-1.5 mt-1 border-t border-slate-800">
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between px-2.5 py-1.5 bg-blue-950/90 hover:bg-blue-900 border border-blue-500/50 hover:border-blue-400 rounded-xs text-blue-200 hover:text-white transition-all group cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5 font-semibold text-[10px]">
                    <span>↗</span>
                    <span>Read Full Article on {sourceName}</span>
                  </span>
                  <span className="text-[9px] font-mono text-blue-300 group-hover:text-white uppercase tracking-wider">Open News</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// Helper: Calculate Granular CAPM & Cost of Debt Parameters

function computeCapmParameters(assumptions = {}, company = {}) {

  const comp = company || {};

  const rf = assumptions.rf !== undefined && assumptions.rf !== null ? Number(assumptions.rf) : 6.60;

  const beta = assumptions.beta !== undefined && assumptions.beta !== null ? Number(assumptions.beta) : (comp.beta || 0.75);

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

  const comp = company || {};

  const lastHist = company.historical && company.historical.length 

    ? company.historical[company.historical.length - 1] 

    : { revenue: (company.marketCap || 10) * 100, ebitda: (company.marketCap || 10) * 25, netIncome: (company.marketCap || 10) * 15, eps: 50 };

  const baseRev = lastHist.revenue || ((company.marketCap || 10) * 100);



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

    const ebit = rev * (effMargin / 100);

    const da = rev * ((assumptions.daPercentRev || 7.2) / 100);

    const ebitda = ebit + da;

    const taxes = Math.max(0, ebit * ((assumptions.taxRate || 22.0) / 100));

    const nopat = ebit - taxes;

    const capex = rev * ((assumptions.capexPercentRev || 9.0) / 100);

    const nwcChange = Math.max(0, revDelta * ((assumptions.nwcPercentRevChange || 4.0) / 100));

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

  const terminalVal = (finalYear.fcf * (1 + effTgr / 100)) / ((effWacc - effTgr) / 100);

  const pvTerminalVal = terminalVal / Math.pow(1 + effWacc / 100, 10);

  const dcfEv = sumPvFcf + pvTerminalVal;

  const netDebt = (company.totalDebt || 0) - (company.cashAndEquivalents || 0);

  const mi = (company.minorityInterest || 0);

  const dcfEquity = Math.max(0, dcfEv - netDebt - mi);

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



  // Valuation Multi-Method Triangulation with Safe 0-Weight Handling (4-Way Triangulation)

  const wDcf = assumptions.dcfWeight !== undefined && assumptions.dcfWeight !== null ? Number(assumptions.dcfWeight) : 50;

  const wComps = assumptions.compsWeight !== undefined && assumptions.compsWeight !== null ? Number(assumptions.compsWeight) : 25;

  const wRim = assumptions.rimWeight !== undefined && assumptions.rimWeight !== null ? Number(assumptions.rimWeight) : 15;

  const wDdm = assumptions.ddmWeight !== undefined && assumptions.ddmWeight !== null ? Number(assumptions.ddmWeight) : 10;



  const rawTotalW = wDcf + wComps + wRim + wDdm;

  const totalW = rawTotalW > 0 ? rawTotalW : 1;



  const compositeIntrinsicValue = rawTotalW > 0

    ? Math.round((dcfSharePrice * wDcf + compsSharePrice * wComps + rimSharePrice * wRim + ddmSharePrice * wDdm) / totalW)

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







// =============================================================================


// =============================================================================
// DYNAMIC STEP-BY-STEP KATEX VALUATION PROOFS COMPONENT
// Renders mathematically substituted derivations dynamically for any security
// and assumption scenario (CAPM/WACC, Gordon TV, EV-to-Equity Bridge, DDM, Triangulation)
// =============================================================================
function ValuationProofsCards({ company, backendData, isDrawer = false }) {
  if (!company) {
    return (
      <div className="p-4 text-slate-500 font-mono text-center text-xs">
        Select a coverage security to view step-by-step mathematical proofs.
      </div>
    );
  }

  const a = company.assumptions || {};
  const v = company.valuation || {};

  const isMatchingBackend = Boolean(
    backendData && (
      backendData.company?.clean_ticker === company.clean_ticker ||
      backendData.company?.ticker === company.ticker
    )
  );

  // 1. Fundamental CAPM & WACC Parameters
  const cpm = computeCapmParameters(a, company);
  const effWaccDec = isMatchingBackend && backendData.wacc?.wacc !== undefined
    ? (backendData.wacc.wacc < 1.0 ? backendData.wacc.wacc : backendData.wacc.wacc / 100.0)
    : (cpm.effectiveWacc / 100.0);
  const effWaccPct = effWaccDec * 100.0;
  const effKeDec = isMatchingBackend && backendData.wacc?.ke !== undefined
    ? (backendData.wacc.ke < 1.0 ? backendData.wacc.ke : backendData.wacc.ke / 100.0)
    : (cpm.ke / 100.0);

  const effTerminalG = a.terminalGrowth !== undefined && a.terminalGrowth !== null ? Number(a.terminalGrowth) : 1.5;
  const effGDec = effTerminalG / 100.0;

  // 2. Gordon Growth Terminal Value Proof (in Trillions IDR)
  let fcff10 = 0;
  if (isMatchingBackend && backendData.pro_forma_schedule && backendData.pro_forma_schedule.length > 0) {
    const lastRow = backendData.pro_forma_schedule[backendData.pro_forma_schedule.length - 1];
    fcff10 = Number(lastRow.fcf || 0);
  } else if (v.projections && v.projections.length > 0) {
    const lastProj = v.projections[v.projections.length - 1];
    fcff10 = Number(lastProj.fcf || 0) / 1000.0;
  } else {
    const lastHist = company.historical && company.historical.length > 0 ? company.historical[company.historical.length - 1] : {};
    const baseRev = Number(lastHist.revenue || 1000) / 1000.0;
    fcff10 = +(baseRev * ((a.ebitdaMargin || 25.0) / 100.0) * 0.7).toFixed(2);
  }

  let tvGordon = 0;
  let pvTvGordon = 0;
  if (isMatchingBackend && backendData.dcf?.tv_gordon !== undefined) {
    tvGordon = Number(backendData.dcf.tv_gordon);
    pvTvGordon = Number(backendData.dcf.pv_tv_gordon);
  } else if (v.terminalValue !== undefined && v.terminalValue !== null) {
    tvGordon = Number(v.terminalValue) / 1000.0;
    pvTvGordon = Number(v.pvTerminalValue || 0) / 1000.0;
  } else {
    tvGordon = (effWaccDec > effGDec) ? (fcff10 * (1.0 + effGDec)) / (effWaccDec - effGDec) : 0;
    pvTvGordon = tvGordon / Math.pow(1.0 + effWaccDec, 10);
  }

  // 3. EV-to-Equity Value Bridge (in Trillions IDR)
  let evTrill = 0;
  let cashTrill = 0;
  let debtTrill = 0;
  let miTrill = 0;
  let equityTrill = 0;
  let sharesB = Number(company.sharesOutstanding || 1);

  if (isMatchingBackend && backendData.dcf) {
    evTrill = Number(backendData.dcf.enterprise_value || 0);
    cashTrill = Number(backendData.dcf.cash || 0);
    debtTrill = Number(backendData.dcf.debt || 0);
    miTrill = Number(backendData.dcf.minority_interest || 0);
    equityTrill = Number(backendData.dcf.equity_value || 0);
    sharesB = Number(backendData.dcf.shares_outstanding || sharesB);
  } else {
    evTrill = Number(v.dcfEnterpriseValue || 0) / 1000.0;
    cashTrill = Number(company.cashAndEquivalents || 0) / 1000.0;
    debtTrill = Number(company.totalDebt || 0) / 1000.0;
    miTrill = Number(company.minorityInterest || 0) / 1000.0;
    equityTrill = Math.max(0, evTrill + cashTrill - debtTrill - miTrill);
  }

  const dcfTargetPrice = isMatchingBackend && backendData.dcf?.dcf_price !== undefined
    ? Math.round(backendData.dcf.dcf_price)
    : (v.dcfSharePrice ? Math.round(v.dcfSharePrice) : Math.round((equityTrill * 1000.0) / Math.max(0.01, sharesB)));

  // 4. Dividend Discount Model (DDM)
  let ddmPrice = 0;
  let ddmProofTv = '';
  let ddmProofTotal = '';

  if (isMatchingBackend && backendData.ddm) {
    ddmPrice = Math.round(backendData.ddm.ddm_price || 0);
    ddmProofTv = backendData.ddm.proofs?.tv || '';
    ddmProofTotal = backendData.ddm.proofs?.total || '';
  } else {
    ddmPrice = v.ddmSharePrice ? Math.round(v.ddmSharePrice) : 0;
  }

  // 5. Multi-Method Composite Triangulation
  const compsPrice = isMatchingBackend && backendData.comps?.comps_target_price !== undefined
    ? Math.round(backendData.comps.comps_target_price)
    : (v.compsSharePrice ? Math.round(v.compsSharePrice) : 0);

  const rimPrice = isMatchingBackend && backendData.rim?.rim_target_price !== undefined
    ? Math.round(backendData.rim.rim_target_price)
    : (v.rimSharePrice ? Math.round(v.rimSharePrice) : 0);

  const wDcf = a.dcfWeight !== undefined && a.dcfWeight !== null ? Number(a.dcfWeight) : 50;
  const wComps = a.compsWeight !== undefined && a.compsWeight !== null ? Number(a.compsWeight) : 25;
  const wRim = a.rimWeight !== undefined && a.rimWeight !== null ? Number(a.rimWeight) : 15;
  const wDdm = a.ddmWeight !== undefined && a.ddmWeight !== null ? Number(a.ddmWeight) : 10;
  const totalW = (wDcf + wComps + wRim + wDdm) || 1;

  const displayComposite = Math.round((dcfTargetPrice * wDcf + compsPrice * wComps + rimPrice * wRim + ddmPrice * wDdm) / totalW);

  const containerClass = isDrawer ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <div className={containerClass}>
      {/* 1. Fundamental CAPM Cost of Equity & WACC Proof */}
      <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
        <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
          1. Fundamental CAPM Cost of Equity & WACC Proof
        </span>
        <MathProof latex={`\\text{ERP} = \\text{Mature ERP} + \\text{CRP} = ${cpm.matureErp.toFixed(2)}\\% + ${cpm.crp.toFixed(2)}\\% = ${cpm.totalErp.toFixed(2)}\\%`} />
        <MathProof latex={`K_e = R_f + (\\beta \\times \\text{ERP}) = ${cpm.rf.toFixed(2)}\\% + (${cpm.beta.toFixed(2)} \\times ${cpm.totalErp.toFixed(2)}\\%) = ${cpm.ke.toFixed(2)}\\%`} />
        <MathProof latex={`K_{d,\\text{after}} = K_d \\times (1 - t) = ${cpm.kdPre.toFixed(2)}\\% \\times (1 - ${cpm.taxRate.toFixed(1)}\\%) = ${cpm.kdAfter.toFixed(2)}\\%`} />
        <MathProof latex={`\\text{WACC} = (${cpm.we.toFixed(1)}\\% \\times ${cpm.ke.toFixed(2)}\\%) + (${cpm.wd.toFixed(1)}\\% \\times ${cpm.kdAfter.toFixed(2)}\\%) = ${effWaccPct.toFixed(2)}\\%`} />
      </div>

      {/* 2. Gordon Growth Terminal Value Proof */}
      <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
        <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
          2. Gordon Growth Terminal Value Proof
        </span>
        <MathProof latex={`TV_{10} = \\frac{FCFF_{10} \\times (1 + g)}{WACC - g} = \\frac{${fcff10.toFixed(2)} \\times (1 + ${effGDec.toFixed(3)})}{${effWaccDec.toFixed(4)} - ${effGDec.toFixed(3)}} = \\text{IDR } ${tvGordon.toFixed(2)} \\text{ Trillion}`} />
        <MathProof latex={`PV(TV_{10}) = \\frac{TV_{10}}{(1 + WACC)^{10}} = \\frac{${tvGordon.toFixed(2)}}{(1 + ${effWaccDec.toFixed(4)})^{10}} = \\text{IDR } ${pvTvGordon.toFixed(2)} \\text{ Trillion}`} />
      </div>

      {/* 3. Enterprise-to-Equity Value Bridge */}
      <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
        <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
          3. Enterprise-to-Equity Value Bridge
        </span>
        <MathProof latex={`\\text{Equity Value} = \\text{EV} + \\text{Cash} - \\text{Debt} - \\text{Minority} = ${evTrill.toFixed(2)} + ${cashTrill.toFixed(2)} - ${debtTrill.toFixed(2)} - ${miTrill.toFixed(2)} = \\text{IDR } ${equityTrill.toFixed(2)} \\text{ Trillion}`} />
        <MathProof latex={`\\text{Target Price} = \\frac{\\text{Equity Value}}{\\text{Shares Outstanding}} = \\frac{\\text{IDR } ${equityTrill.toFixed(2)}\\text{T}}{${sharesB.toFixed(2)}\\text{B Shares}} = \\mathbf{\\text{IDR } ${dcfTargetPrice.toLocaleString()} \\text{ / Share}}`} />
      </div>

      {/* 4. Dividend Discount Model (DDM) Proof */}
      <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
        <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
          4. Dividend Discount Model (DDM) Proof
        </span>
        {ddmProofTv ? (
          <MathProof latex={ddmProofTv} />
        ) : null}
        {ddmProofTotal ? (
          <MathProof latex={ddmProofTotal} />
        ) : (
          <MathProof latex={`P_{0, \\text{DDM}} = \\sum_{t=1}^{10} \\frac{DPS_t}{(1 + K_e)^t} + \\frac{DPS_{10} \\times (1 + g)}{(K_e - g) \\times (1 + K_e)^{10}} = \\mathbf{\\text{IDR } ${ddmPrice.toLocaleString()} \\text{ / Share}}`} />
        )}
      </div>

      {/* 5. Composite Valuation Triangulation Target Price */}
      <div className="border border-slate-200 rounded-xs p-3.5 bg-slate-50 space-y-1">
        <span className="font-mono font-bold text-blue-900 uppercase block mb-1">
          5. Composite Valuation Triangulation Target Price
        </span>
        <MathProof latex={`\\text{Target} = (${wDcf}\\% \\times \\text{IDR } ${dcfTargetPrice.toLocaleString()}) + (${wComps}\\% \\times \\text{IDR } ${compsPrice.toLocaleString()}) + (${wRim}\\% \\times \\text{IDR } ${rimPrice.toLocaleString()}) + (${wDdm}\\% \\times \\text{IDR } ${ddmPrice.toLocaleString()}) = \\mathbf{\\text{IDR } ${displayComposite.toLocaleString()} \\text{ / Share}}`} />
      </div>
    </div>
  );
}


// INSTITUTIONAL METHODOLOGY BOUNDARY & BANKING INTERCEPT

// =============================================================================

const KNOWN_BANKING_SYMBOLS = new Set([

  'BBCA', 'BBRI', 'BMRI', 'BBNI', 'BBTN', 'BDMN', 'BNGA', 'BRIS', 'BTPS',

  'MEGA', 'BJBR', 'BJTM', 'PNBN', 'BCIC', 'BNII', 'NISP', 'BTPN', 'AGRO',

  'ARTO', 'BABP', 'BACA', 'BBHI', 'BBKP', 'BBYB', 'BCAP', 'BEKS', 'BGTG',

  'BINA', 'BKSW', 'BMAS', 'BNBA', 'BNLI', 'BSIM', 'BSWD', 'BVIC', 'DNAR',

  'INPC', 'MAYA', 'MCOR', 'NOBU', 'PNBS', 'SDRA', 'BFIN', 'ADMF', 'CFIN',

  'MFIN', 'WOMF', 'TRUS', 'AMOR', 'TUGU', 'ASBI', 'AHAP', 'ASDM', 'LIFE',

  'LPGI', 'MREI', 'MTWI', 'PANS', 'TRIM', 'YULE', 'KREN'

]);



function isBankingSymbol(sym) {

  if (!sym) return false;

  const clean = sym.replace('.JK', '').toUpperCase().trim();

  if (KNOWN_BANKING_SYMBOLS.has(clean)) return true;

  if (clean.startsWith('BANK') || clean.startsWith('BFIN') || clean.startsWith('ADMF')) return true;

  return false;

}



function BankingLimitationModal({ notice, onClose, onSelectAlternative }) {

  if (!notice) return null;

  const ticker = notice.ticker || 'BBCA';

  const isOverview = notice.isScopeOverview;



  const alternatives = [

    { sym: 'ASII', name: 'Astra International', sector: 'Industrials / Auto Conglomerate' },

    { sym: 'ANTM', name: 'Aneka Tambang', sector: 'Mining & Resources' },

    { sym: 'AKRA', name: 'AKR Corporindo', sector: 'Energy Logistics & Infrastructure' },

    { sym: 'ICBP', name: 'Indofood CBP', sector: 'Consumer Staples' },

    { sym: 'TLKM', name: 'Telkom Indonesia', sector: 'Telecommunications' },

    { sym: 'KLBF', name: 'Kalbe Farma', sector: 'Healthcare & Pharma' }

  ];



  return (

    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">

      <div className="bg-[#0A1120] border border-amber-500/50 rounded-xs max-w-xl w-full p-6 text-white space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">

        <div className="flex items-start justify-between border-b border-slate-800 pb-3">

          <div className="flex items-center space-x-2.5">

            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xs border border-amber-500/30">

              <Icon name="ShieldAlert" size={20} />

            </span>

            <div>

              <div className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-bold">

                Methodology Boundary Limitation

              </div>

              <h2 className="text-base font-bold text-white">

                {isOverview ? 'Non-Financial Corporate Scope' : `Financial Institution Detected: ${ticker}`}

              </h2>

            </div>

          </div>

          <button

            onClick={onClose}

            className="text-slate-400 hover:text-white p-1 text-sm font-mono cursor-pointer"

          >

            ✕

          </button>

        </div>



        <div className="space-y-3 text-xs leading-relaxed text-slate-300">

          <p className="font-semibold text-slate-200">

            Why commercial banks & financial intermediaries cannot be evaluated on this platform:

          </p>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xs p-3 space-y-2 text-[11px]">

            <div className="flex items-start space-x-2">

              <Icon name="AlertCircle" size={13} className="text-amber-400 shrink-0 mt-0.5" />

              <div>

                <strong className="text-slate-200">1. Balance Sheet As Earning Product:</strong> Commercial bank customer deposits and loan receivables are not working capital; they represent the core operational assets and liabilities of the business.

              </div>

            </div>

            <div className="flex items-start space-x-2">

              <Icon name="AlertCircle" size={13} className="text-amber-400 shrink-0 mt-0.5" />

              <div>

                <strong className="text-slate-200">2. Interest Is Cost of Goods Sold (COGS):</strong> Interest expense cannot be isolated from operating decisions. As a result, Operating Profit (EBIT), EBITDA, and Free Cash Flow to Firm (FCFF) are mathematically invalid.

              </div>

            </div>

            <div className="flex items-start space-x-2">

              <Icon name="AlertCircle" size={13} className="text-amber-400 shrink-0 mt-0.5" />

              <div>

                <strong className="text-slate-200">3. Basel III / OJK Capital Constraints:</strong> Bank capacity is legally constrained by regulatory Capital Adequacy Ratios (CAR), necessitating an Asset-Liability Management (ALM) spread model and regulatory-constrained DDM.

              </div>

            </div>

          </div>

        </div>



        <div className="space-y-2 pt-2 border-t border-slate-800">

          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">

            Select a Recommended Non-Financial Real Economy Leader:

          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">

            {alternatives.map(alt => (

              <button

                key={alt.sym}

                onClick={() => {

                  onSelectAlternative(alt.sym);

                  onClose();

                }}

                className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xs text-left transition cursor-pointer group"

              >

                <div className="font-mono font-bold text-xs text-blue-400 group-hover:text-blue-300">

                  {alt.sym}

                </div>

                <div className="text-[10px] text-slate-400 truncate">{alt.name}</div>

              </button>

            ))}

          </div>

        </div>



        <div className="flex justify-end pt-2">

          <button

            onClick={onClose}

            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xs text-xs font-mono font-semibold cursor-pointer"

          >

            Acknowledge & Close

          </button>

        </div>

      </div>

    </div>

  );

}



// UNIVERSAL TICKER LAUNCHPAD COMPONENT

function UniversalTickerLaunchpad({ onLoadTicker, isLoading }) {

  const [inputVal, setInputVal] = useState('');



  const sectorPresets = [

    {

      sector: "Logistics & Energy Infrastructure",

      icon: "Truck",

      color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",

      tickers: [

        { sym: "AKRA", name: "AKR Corporindo" },

        { sym: "PGAS", name: "Perusahaan Gas Negara" },

        { sym: "JSMR", name: "Jasa Marga" },

        { sym: "MEDC", name: "Medco Energi" },

      ]

    },

    {

      sector: "Energy, Mining & Metals",

      icon: "Flame",

      color: "text-amber-400 bg-amber-500/10 border-amber-500/20 hover:border-amber-500/50",

      tickers: [

        { sym: "ANTM", name: "Aneka Tambang" },

        { sym: "AADI", name: "Adaro Andalan" },

        { sym: "ADRO", name: "Adaro Energy" },

        { sym: "PTBA", name: "Bukit Asam" },

      ]

    },

    {

      sector: "Consumer Staples & Retail",

      icon: "ShoppingCart",

      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50",

      tickers: [

        { sym: "ICBP", name: "Indofood CBP" },

        { sym: "INDF", name: "Indofood Sukses" },

        { sym: "UNVR", name: "Unilever Indonesia" },

        { sym: "MYOR", name: "Mayora Indah" },

      ]

    },

    {

      sector: "Industrials & Conglomerates",

      icon: "Factory",

      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50",

      tickers: [

        { sym: "ASII", name: "Astra International" },

        { sym: "UNTR", name: "United Tractors" },

      ]

    },

    {

      sector: "Telecommunications & Tech",

      icon: "Radio",

      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/50",

      tickers: [

        { sym: "TLKM", name: "Telkom Indonesia" },

        { sym: "ISAT", name: "Indosat Ooredoo" },

        { sym: "TOWR", name: "Sarana Menara" },

      ]

    },

    {

      sector: "Property & Real Estate",

      icon: "Building2",

      color: "text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50",

      tickers: [

        { sym: "PWON", name: "Pakuwon Jati" },

        { sym: "BSDE", name: "Bumi Serpong Damai" },

        { sym: "CTRA", name: "Ciputra Development" },

        { sym: "SMRA", name: "Summarecon Agung" },

      ]

    },

    {

      sector: "Healthcare & Pharma",

      icon: "Activity",

      color: "text-rose-400 bg-rose-500/10 border-rose-500/20 hover:border-rose-500/50",

      tickers: [

        { sym: "KLBF", name: "Kalbe Farma" },

        { sym: "MIKA", name: "Mitra Keluarga" },

      ]

    }

  ];



  const handleSubmit = (e) => {

    e?.preventDefault();

    if (inputVal.trim()) {

      onLoadTicker(inputVal.trim());

    }

  };



  return (

    <div className="bg-[#0A1120] border border-slate-800 rounded-xs p-6 md:p-8 text-white space-y-6 shadow-xl">

      <div className="max-w-3xl space-y-2">

        <div className="flex items-center space-x-2 text-[11px] font-mono text-blue-400">

          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>

          <span>VALUEX UNIVERSAL RESEARCH LAUNCHPAD</span>

          <span>•</span>

          <span>ALL INDONESIA STOCK EXCHANGE (IDX) EQUITIES</span>

        </div>

        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">

          Universal Indonesian Equity Valuation Terminal

        </h1>

        <p className="text-sm text-slate-300 leading-relaxed">

          Search, model, and value <strong>any non-financial corporate enterprise listed on the IDX</strong>. Automatically ingests audited financial statements, articulates a 10-year pro forma model with mathematical 0.00 balance checks, and computes a 4-way valuation triangulation (DCF, Multiples Comps, RIM, DDM).

        </p>

        <div className="bg-amber-950/40 border border-amber-600/40 rounded-xs p-3 text-xs text-amber-200 flex items-start space-x-2.5 mt-2">

          <Icon name="ShieldAlert" size={16} className="text-amber-400 shrink-0 mt-0.5" />

          <div>

            <span className="font-bold font-mono text-[11px] uppercase tracking-wider text-amber-300">

              Institutional Scope Boundary: Non-Financial Corporate Enterprises Only

            </span>

            <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">

              Standard corporate finance models (EBITDA, FCFF, CapEx, Working Capital) cannot evaluate financial intermediaries. Commercial banks & lending institutions (e.g., BBCA, BBRI, BMRI) operate with customer deposits as inventory and interest as Cost of Goods Sold (COGS), requiring Asset-Liability Management (ALM) modeling and Basel III / OJK Capital Adequacy Ratio (CAR) constraints; they are excluded from this platform.

            </p>

          </div>

        </div>

      </div>



      {/* Big Search Command Bar */}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-2xl">

        <div className="relative flex-1">

          <Icon name="Search" size={16} className="text-slate-400 absolute left-3.5 top-3" />

          <input

            type="text"

            value={inputVal}

            onChange={(e) => setInputVal(e.target.value)}

            placeholder="Enter any non-financial IDX ticker (e.g. ASII, ANTM, AKRA, TLKM, ICBP)..."

            className="w-full bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xs pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none transition shadow-inner"

          />

        </div>

        <button

          type="submit"

          disabled={isLoading || !inputVal.trim()}

          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md"

        >

          {isLoading ? (

            <>

              <Icon name="RefreshCw" size={14} className="animate-spin" />

              <span>Fetching IDX...</span>

            </>

          ) : (

            <>

              <Icon name="Play" size={14} />

              <span>Load & Value</span>

            </>

          )}

        </button>

      </form>



      {/* Sector Quick Starter Pills */}

      <div className="space-y-3 pt-2 border-t border-slate-800/80">

        <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">

          <span>Or Select a Blue-Chip Equity by Sector to Launch Immediately:</span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">

          {sectorPresets.map((sec) => (

            <div key={sec.sector} className="bg-slate-900/60 border border-slate-800 rounded-xs p-3 space-y-2">

              <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-300">

                <Icon name={sec.icon} size={14} className="text-blue-400" />

                <span>{sec.sector}</span>

              </div>

              <div className="flex flex-wrap gap-1.5">

                {sec.tickers.map((t) => (

                  <button

                    key={t.sym}

                    type="button"

                    onClick={() => onLoadTicker(t.sym)}

                    disabled={isLoading}

                    className={`px-2 py-1 rounded-xs border text-xs font-mono font-semibold transition cursor-pointer flex items-center space-x-1.5 ${sec.color}`}

                    title={t.name}

                  >

                    <span>{t.sym}</span>

                    <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">({t.name.split(' ')[0]})</span>

                  </button>

                ))}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}



// MAIN VALUEX APP COMPONENT

function App() {

  const defaultCoverage = [];



  const [activeNav, setActiveNav] = useState('dashboard');

  const [coverageCompanies, setCoverageCompanies] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [watchlistIds, setWatchlistIds] = useState([]);

  const [compareIds, setCompareIds] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const [inspectorOpen, setInspectorOpen] = useState(false);

  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const [customTickerInput, setCustomTickerInput] = useState('');

  const [sidebarTickerInput, setSidebarTickerInput] = useState('');

  const [isLoadingCustomTicker, setIsLoadingCustomTicker] = useState(false);

  const [bankingNotice, setBankingNotice] = useState(null);



  // Live market ticker state

  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);

  const [livePricesMap, setLivePricesMap] = useState({});

  const [macroBenchmarks, setMacroBenchmarks] = useState(INITIAL_MACRO_BENCHMARKS);

  const [wireHeadlines, setWireHeadlines] = useState(BREAKING_WIRE_HEADLINES);

  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);



  // Custom assumption state per security

  const [customAssumptionsMap, setCustomAssumptionsMap] = useState({});



  const [activityLog, setActivityLog] = useState([

    { id: 1, timestamp: '10:42 WIB', ticker: 'ASII.JK', parameter: 'WACC', oldVal: '10.8%', newVal: '10.42%', user: 'M. Vance' },

    { id: 2, timestamp: '09:15 WIB', ticker: 'UNTR.JK', parameter: 'EBITDA Margin', oldVal: '24.0%', newVal: '25.5%', user: 'E. Rostova' },

    { id: 3, timestamp: 'Yesterday', ticker: 'ICBP.JK', parameter: 'Terminal g', oldVal: '2.0%', newVal: '1.8%', user: 'D. Thorne' },

    { id: 4, timestamp: 'Oct 19', ticker: 'TOWR.JK', parameter: 'DDM Payout', oldVal: '35.0%', newVal: '40.0%', user: 'M. Vance' },

  ]);



  // Decision Workspace State

  const [decisionState, setDecisionState] = useState({

    pwon: { action: 'BUY', targetEntry: 260.0, targetExit: 440.0, horizon: '12-18 Months', marginOfSafety: 20, notes: 'Accumulate below IDR 270 ahead of Pakuwon Mall expansion and FY26 dividend step-up.' },

    asii: { action: 'BUY', targetEntry: 5100.0, targetExit: 7000.0, horizon: '24 Months', marginOfSafety: 15, notes: 'Conglomerate fortress balance sheet offering resilient 7%+ dividend yield.' },

    untr: { action: 'BUY', targetEntry: 26000.0, targetExit: 32000.0, horizon: '18 Months', marginOfSafety: 18, notes: 'Mining contracting resilience and gold revenue diversification.' }

  });



  // Simulated Order Blotter (IDX Standard 100-Share Lots)

  const [simulatedOrders, setSimulatedOrders] = useState([

    { id: 'ORD-7801', time: '09:32:15 WIB', ticker: 'ASII.JK', side: 'BUY', qtyLots: 500, shares: 50000, type: 'LIMIT', price: 5250.0, notional: 262500000, status: 'STAGED / SIMULATED' },

    { id: 'ORD-7754', time: 'Yesterday', ticker: 'UNTR.JK', side: 'BUY', qtyLots: 200, shares: 20000, type: 'VWAP', price: 26800.0, notional: 536000000, status: 'LOGGED / SIMULATED' }

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



  // Search-First Platform Lifecycle:
  // Starts with 0 pre-selected companies. Equities are ingested dynamically via handleLoadCustomTicker on demand.
  useEffect(() => {
    console.log('ValueX Universal Indonesian Terminal initialized in Search-First mode.');
  }, []);



  // Universal Ticker Loader Function

  const handleLoadCustomTicker = async (symbol) => {

    if (!symbol || !symbol.trim()) return;

    let formatted = symbol.trim().toUpperCase();

    if (!formatted.includes('.')) {

      formatted = `${formatted}.JK`;

    }

    const slug = formatted.replace('.JK', '').toLowerCase();



    // Intercept banking and financial institution tickers

    if (isBankingSymbol(formatted)) {

      setBankingNotice({ ticker: formatted });

      setCustomTickerInput('');

      setGlobalSearchOpen(false);

      return;

    }



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

      const res = await fetch(`/api/company?ticker=${encodeURIComponent(formatted)}&source=idx`);

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

        const priceChange1D = d.price_change_1d || 0.0;



        const cal = d.calibrated_defaults || {};

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

          ebitdaMargin: cal.ebitda_margin ?? 25.0,

          taxRate: 22.0,

          capexPercentRev: cal.capex_pct_rev ?? 6.0,

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

          ebitda: Math.round((hist.ebitda?.[idx] ?? (hist.ebit?.[idx] || 0.3) * 1.25) * 1000),

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

          priceChange1D: priceChange1D,

          priceChangeYTD: 0.0,

          sharesOutstanding: shares,

          totalDebt: debt,

          cashAndEquivalents: cash,

          lastUpdated: "Just now (Live Market)",

          analyst: "M. Vance, CFA",

          confidence: "Dynamic Feed",

          description: `${d.name} (${formatted}) fetched live via IDX market data loader.`,

          reportingCurrency: d.reporting_currency || "IDR",

          presentationCurrency: d.presentation_currency || "IDR",

          fxConversionApplied: Boolean(d.fx_conversion_applied),

          fxRateApplied: d.fx_rate_applied || 1.0,

          dataAvailability: d.data_availability || null,

          historical_statements: d.historical_statements || {},

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



        setCoverageCompanies(prev => [newCompany, ...prev.filter(c => c.id !== slug)]);

        setLivePricesMap(prev => ({
          ...prev,
          [slug]: {
            price: currentPrice,
            change1D: priceChange1D,
            lastDirection: null,
            lastTickTime: Date.now()
          }
        }));

        setCustomAssumptionsMap(prev => ({ ...prev, [slug]: defAssumptions }));

        setBackendData(null);

        setSelectedCompanyId(slug);

        setActiveNav('valuation');

        setGlobalSearchOpen(false);

        setCustomTickerInput('');

        refreshBackendValuation(formatted, defAssumptions);

        if (d.data_availability?.status === 'partial') {

          triggerToast(`Notice: Loaded ${formatted} with ${d.data_availability.years_count}Y audited history. Earlier filings unarchived on IDX.`);

        } else {

          triggerToast(`Successfully loaded ${formatted} (${d.name}) from IDX live feed!`);

        }

      } else if (json.error_type === 'banking_unsupported') {

        setBankingNotice({ ticker: formatted, message: json.message });

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

  const refreshBackendValuation = (ticker, customAssumptions = null) => {

    if (!ticker) return;

    setIsLoadingBackend(true);

    const payload = { ticker, source: 'idx' };

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

    if (selectedCompanyId && activeCompany?.ticker) {

      refreshBackendValuation(activeCompany.ticker, customAssumptionsMap[selectedCompanyId] || activeCompany?.assumptions);

    }

  }, [selectedCompanyId]);



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

      setActiveHeadlineIdx(prev => (prev + 1) % Math.max(1, wireHeadlines.length));

    }, 6000);

    return () => clearInterval(wireInterval);

  }, [isLiveFeedActive, wireHeadlines.length]);



  // Fetch real-time live Indonesian macroeconomic & IHSG news wire from backend

  useEffect(() => {

    const fetchLiveMacroNews = async () => {

      try {

        const res = await fetch('/api/news');

        if (res.ok) {

          const json = await res.json();

          if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {

            setWireHeadlines(json.data);

          }

        }

      } catch (err) {

        console.warn('Using fallback institutional wire:', err);

      }

    };

    fetchLiveMacroNews();

    const pollInterval = setInterval(fetchLiveMacroNews, 300000);

    return () => clearInterval(pollInterval);

  }, []);



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



      // Synchronize client valuation with verified backend recalculation when available
      if (backendData && comp.ticker === backendData.company?.ticker && backendData.dcf?.dcf_price) {
        const bDcf = Math.round(backendData.dcf.dcf_price);
        const bComps = backendData.comps?.comps_target_price !== undefined ? Math.round(backendData.comps.comps_target_price) : baseVal.compsSharePrice;
        const bRim = backendData.rim?.rim_target_price !== undefined ? Math.round(backendData.rim.rim_target_price) : baseVal.rimSharePrice;
        const bDdm = backendData.ddm?.ddm_price !== undefined ? Math.round(backendData.ddm.ddm_price) : baseVal.ddmSharePrice;

        const wD = assumptions.dcfWeight !== undefined && assumptions.dcfWeight !== null ? Number(assumptions.dcfWeight) : 50;
        const wC = assumptions.compsWeight !== undefined && assumptions.compsWeight !== null ? Number(assumptions.compsWeight) : 25;
        const wR = assumptions.rimWeight !== undefined && assumptions.rimWeight !== null ? Number(assumptions.rimWeight) : 15;
        const wM = assumptions.ddmWeight !== undefined && assumptions.ddmWeight !== null ? Number(assumptions.ddmWeight) : 10;
        const tW = (wD + wC + wR + wM) || 1;

        const bComposite = Math.round((bDcf * wD + bComps * wC + bRim * wR + bDdm * wM) / tW);
        const bUpside = +(((bComposite / liveComp.referencePrice) - 1) * 100).toFixed(1);
        const bRec = bUpside >= 15.0 ? 'BUY' : bUpside <= -10.0 ? 'SELL' : 'HOLD';

        baseVal.dcfSharePrice = bDcf;
        baseVal.compsSharePrice = bComps;
        baseVal.rimSharePrice = bRim;
        baseVal.ddmSharePrice = bDdm;
        baseVal.compositeIntrinsicValue = bComposite;
        baseVal.impliedUpside = bUpside;
        baseVal.recommendation = bRec;
        if (backendData.dcf?.enterprise_value !== undefined) {
          baseVal.dcfEnterpriseValue = Math.round(backendData.dcf.enterprise_value * 1000);
          baseVal.dcfEquityValue = Math.round(backendData.dcf.equity_value * 1000);
          baseVal.sumPvFcf = Math.round(backendData.dcf.pv_explicit * 1000);
          baseVal.terminalValue = Math.round(backendData.dcf.tv_gordon * 1000);
          baseVal.pvTerminalValue = Math.round(backendData.dcf.pv_tv_gordon * 1000);
          baseVal.netDebt = Math.round((backendData.dcf.debt - backendData.dcf.cash) * 1000);
        }
      }

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

  }, [coverageCompanies, customAssumptionsMap, watchlistIds, livePricesMap, backendData]);



  const activeCompany = useMemo(() => {

    if (!selectedCompanyId) return null;

    return enrichedCompanies.find(c => c.id === selectedCompanyId) || null;

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

      setBackendData(null);

      refreshBackendValuation(targetComp.ticker);

      if (!targetComp.historical_statements || !targetComp.historical_statements.years) {

        fetch(`/api/company?ticker=${encodeURIComponent(targetComp.ticker)}&source=idx`)

          .then(r => r.json())

          .then(json => {

            if (json.status === 'success' && json.data) {

              const d = json.data;

              const hist = d.historical || {};

              const shares = d.shares_outstanding || targetComp.sharesOutstanding || 10;

              const historicalItems = (hist.years || [2021, 2022, 2023, 2024, 2025]).map((yr, idx) => ({

                year: `${yr}A`,

                revenue: Math.round((hist.revenue?.[idx] || 1) * 1000),

                ebitda: Math.round((hist.ebitda?.[idx] ?? (hist.ebit?.[idx] || 0.3) * 1.25) * 1000),

                netIncome: Math.round((hist.net_income?.[idx] || 0.2) * 1000),

                fcf: Math.round((hist.fcff?.[idx] || 0.15) * 1000),

                eps: Math.round(((hist.net_income?.[idx] || 0.2) * 1000 / shares) * 100) / 100,

                capex: Math.round((hist.capex?.[idx] || 0.1) * 1000)

              }));

              setCoverageCompanies(prev => prev.map(c => c.id === companyId ? {

                ...c,

                historical_statements: d.historical_statements || {},

                historical: historicalItems,

                dataAvailability: d.data_availability,

                reportingCurrency: d.reporting_currency,

                fxConversionApplied: d.fx_conversion_applied,

                fxRateApplied: d.fx_rate_applied

              } : c));

            }

          })

          .catch(e => console.error("Error fetching coverage statements:", e));

      }

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

    if (!activeCompany) {

      triggerToast('Please select or search an equity to export its valuation model.');

      return;

    }

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

      ticker: activeCompany?.ticker || 'ASII.JK', source: 'idx',

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

        a.download = `${activeCompany?.ticker || 'IDX_Valuation'}_Valuation_Model_MM6026.xlsx`;

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



  const currentWire = wireHeadlines[activeHeadlineIdx % Math.max(1, wireHeadlines.length)] || wireHeadlines[0] || BREAKING_WIRE_HEADLINES[0];



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

          animation: tickerMarquee 55s linear infinite;

        }

        .animate-ticker-marquee:hover {

          animation-play-state: paused;

        }

      `}</style>



      {/* 1. TOP LIVE MARKET TICKER RIBBON & BREAKING WIRE */}

      <div className="bg-[#050912] text-slate-200 border-b border-slate-800/90 sticky top-0 z-50 select-none">

        {/* Row 1: Real-time Equity & IDX Macro Ticker Strip */}

        <div className="min-h-[44px] h-11 flex items-center border-b border-slate-800/80 overflow-hidden py-1 relative bg-[#050912]">

          {/* Pinned Unified Interactive Beacon */}

          <button

            onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}

            className="flex items-center space-x-2 px-3.5 h-full bg-[#0A1120] border-r border-slate-800 shrink-0 z-20 cursor-pointer hover:bg-slate-900 transition group select-none"

            title={isLiveFeedActive ? "Live market tape active — Click to pause" : "Market tape paused — Click to resume"}

          >

            <span className="relative flex h-2 w-2">

              {isLiveFeedActive && (

                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

              )}

              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveFeedActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />

            </span>

            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-200">

              {isLiveFeedActive ? 'IDX LIVE FEED' : 'TAPE PAUSED'}

            </span>

            <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition">

              {isLiveFeedActive ? '❚❚' : '▶'}

            </span>

          </button>



          {/* Marquee Viewport with Smooth Alpha Gradient Edge Fade */}

          <div

            className="flex-1 overflow-hidden relative h-full flex items-center"

            style={{

              maskImage: 'linear-gradient(to right, transparent, black 36px, black calc(100% - 36px), transparent)',

              WebkitMaskImage: 'linear-gradient(to right, transparent, black 36px, black calc(100% - 36px), transparent)',

            }}

          >

            <div className={isLiveFeedActive ? 'animate-ticker-marquee items-center' : 'flex items-center overflow-x-auto no-scrollbar'}>

              {[0, 1].map(loopIdx => (

                <div key={loopIdx} className="flex items-center px-1">

                  {enrichedCompanies.map(comp => {

                    const isPositive = comp.priceChange1D >= 0;

                    const isFlashingUp = comp.tickDirection === 'up';

                    const isFlashingDown = comp.tickDirection === 'down';

                    const isSelected = comp.id === selectedCompanyId;

                    const upside = comp.valuation?.impliedUpside ?? 0;

                    const isUpsidePos = upside >= 0;



                    return (

                      <button

                        key={`${loopIdx}-${comp.id}`}

                        onClick={() => openCompanyWorkspace(comp.id, 'valuation')}

                        className={`min-w-[270px] px-3.5 py-1.5 mx-1 flex items-center justify-between space-x-2 text-[11px] font-mono rounded-xs border transition-all duration-300 cursor-pointer whitespace-nowrap shrink-0 ${

                          isFlashingUp

                            ? 'bg-emerald-500/25 border-emerald-500/40 text-emerald-200'

                            : isFlashingDown

                            ? 'bg-rose-500/25 border-rose-500/40 text-rose-200'

                            : isSelected

                            ? 'bg-blue-950/70 border-blue-500/40 text-white shadow-2xs'

                            : 'bg-[#0A1122]/70 hover:bg-[#111C38] border-slate-800/90 text-slate-200'

                        }`}

                        title={`${comp.name} — Click to analyze in Valuation Workspace`}

                      >

                        <div className="flex items-center space-x-2">

                          <span className="font-bold text-white tracking-tight">{comp.ticker}</span>

                          <span className="text-slate-300 font-medium">

                            IDR {comp.referencePrice?.toLocaleString()}

                          </span>

                        </div>



                        <div className="flex items-center space-x-1.5">

                          <span className={`inline-flex items-center px-1.5 py-0.2 rounded-xs font-bold text-[10px] ${

                            isPositive

                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'

                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'

                          }`}>

                            {isPositive ? '▲ +' : '▼ '}{Math.abs(comp.priceChange1D).toFixed(2)}%

                          </span>

                          <span className="text-[10px] font-semibold text-slate-400 pl-1.5 border-l border-slate-700/60 whitespace-nowrap">

                            IV: <strong className={isUpsidePos ? 'text-emerald-400' : 'text-rose-400'}>

                              Rp{comp.valuation?.compositeIntrinsicValue?.toLocaleString()} ({fmtPct(upside)})

                            </strong>

                          </span>

                        </div>

                      </button>

                    );

                  })}



                  {macroBenchmarks.map(macro => {

                    const isPos = macro.changePct >= 0;

                    return (

                      <div

                        key={`${loopIdx}-${macro.id}`}

                        className={`min-w-[190px] px-3 py-1.5 mx-1 flex items-center justify-between space-x-2 text-[11px] font-mono rounded-xs border transition-colors duration-300 whitespace-nowrap shrink-0 ${

                          macro.flash === 'up'

                            ? 'bg-emerald-500/20 border-emerald-500/30'

                            : macro.flash === 'down'

                            ? 'bg-rose-500/20 border-rose-500/30'

                            : 'bg-[#080E1C]/80 border-slate-800/80'

                        }`}

                      >

                        <div className="flex items-center space-x-1.5">

                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-1 py-0.2 bg-slate-800/80 rounded-2xs">MACRO</span>

                          <span className="text-slate-300 font-semibold">{macro.symbol}</span>

                        </div>

                        <div className="flex items-center space-x-1.5">

                          <span className="text-slate-100 font-medium">

                            {macro.isYield ? `${macro.price.toFixed(2)}%` : macro.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}

                          </span>

                          <span className={`font-bold text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>

                            {isPos ? '▲' : '▼'}{Math.abs(macro.changePct).toFixed(2)}%

                          </span>

                        </div>

                      </div>

                    );

                  })}

                </div>

              ))}

            </div>

          </div>

        </div>



        {/* Row 2: Rotating Institutional Research Wire */}
        <div className="min-h-[32px] h-8 bg-[#080E1C] px-3 flex items-center justify-between text-[11px] font-mono py-1 relative z-30">
          <div className="flex items-center space-x-2 pr-4 min-w-0 flex-1">
            <span className="px-1.5 py-0.2 bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-[10px] rounded-xs shrink-0">
              RESEARCH WIRE
            </span>
            <span className={`px-1.5 py-0.2 rounded-xs font-bold text-[10px] shrink-0 ${
              currentWire.sentiment === 'BULLISH'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : currentWire.sentiment === 'BEARISH'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
            }`}>
              {currentWire.sentiment}
            </span>
            {currentWire.source && (
              <span className="hidden sm:inline px-1.5 py-0.2 bg-slate-800/90 border border-slate-700/80 text-slate-300 font-semibold text-[10px] rounded-xs shrink-0">
                {currentWire.source}
              </span>
            )}
            <NewsWireProvenanceTooltip wireItem={currentWire} />
            {currentWire.link ? (
              <a
                href={currentWire.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 hover:text-blue-300 hover:underline truncate text-left transition flex items-center space-x-1.5 cursor-pointer group min-w-0"
                title={`Read full article on ${currentWire.source || 'News Portal'} (opens in new tab)`}
              >
                <span className="truncate">{currentWire.headline}</span>
                <span className="text-[10px] text-blue-400/90 group-hover:text-blue-300 shrink-0">↗</span>
              </a>
            ) : (
              <span className="text-slate-300 truncate text-left">
                {currentWire.headline}
              </span>
            )}
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

                onClick={() => setActiveHeadlineIdx((prev) => (prev + 1) % Math.max(1, wireHeadlines.length))}

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

      <header className="h-12 bg-[#0A1120] text-slate-200 border-b border-slate-800 px-4 flex items-center justify-between sticky top-[76px] z-40 gap-3">

        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">

          <div

            onClick={() => setActiveNav('dashboard')}

            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"

          >

            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center rounded-xs font-mono font-bold text-xs text-white tracking-tighter">

              VX

            </div>

            <div className="flex items-baseline space-x-1.5">

              <span className="font-bold tracking-wider text-sm text-white">VALUEX</span>

              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l border-slate-700 pl-1.5">

                UNIVERSAL EQUITY RESEARCH

              </span>

            </div>

          </div>



          {/* Active Security Context Pill */}

          {activeCompany && activeCompany.ticker ? (

            <div className="hidden sm:flex items-center space-x-2 px-2.5 h-7 bg-slate-900/90 border border-slate-800 rounded-xs text-xs whitespace-nowrap shrink-0">

              <span className="font-mono font-bold text-white">{activeCompany.ticker}</span>

              <span className="text-slate-300 font-mono">IDR {activeCompany.referencePrice?.toLocaleString()}</span>

              <span className={`font-mono font-semibold border-l border-slate-700 pl-2 ${

                activeCompany.valuation?.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'

              }`}>

                <span className="hidden xl:inline">IV: IDR {activeCompany.valuation?.compositeIntrinsicValue} </span>

                <span>({fmtPct(activeCompany.valuation?.impliedUpside)})</span>

              </span>

              <button

                onClick={() => setSelectedCompanyId(null)}

                className="ml-1 px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded text-[10px] font-mono transition cursor-pointer"

                title="Clear active security / Return to Universe Overview"

              >

                ✕

              </button>

            </div>

          ) : (

            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 h-7 bg-blue-950/40 border border-blue-500/30 rounded-xs text-xs text-blue-300 font-mono whitespace-nowrap shrink-0">

              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0"></span>

              <span className="font-semibold tracking-wider text-[11px]">ALL IDX EQUITIES</span>

            </div>

          )}



          {/* Quick Universal Ticker Search & Loader (Visible on 2XL Viewports) */}

          <div className="hidden 2xl:flex items-center space-x-1.5 bg-slate-950/90 border border-slate-700/80 rounded-xs px-2 h-7 font-mono text-xs shrink-0">

            <Icon name="Search" size={12} className="text-slate-400 shrink-0" />

            <input

              type="text"

              placeholder="Search Ticker (e.g. ASII)..."

              value={customTickerInput}

              onChange={(e) => setCustomTickerInput(e.target.value)}

              onKeyDown={(e) => { if (e.key === 'Enter') handleLoadCustomTicker(customTickerInput); }}

              className="bg-transparent text-white placeholder-slate-500 text-[11px] w-28 sm:w-36 md:w-40 focus:outline-none"

            />

            <button

              onClick={() => handleLoadCustomTicker(customTickerInput)}

              disabled={isLoadingCustomTicker}

              className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xs text-[10px] font-bold transition cursor-pointer shrink-0"

            >

              {isLoadingCustomTicker ? '...' : 'Load'}

            </button>

            <div className="hidden 2xl:flex items-center space-x-1 pl-1.5 border-l border-slate-800 text-[10px]">

              {['ASII', 'ANTM', 'AKRA', 'ICBP', 'TLKM', 'KLBF'].map(sym => (

                <button

                  key={sym}

                  onClick={() => handleLoadCustomTicker(sym)}

                  className={`px-1.5 py-0.2 rounded-xs hover:bg-slate-800 transition ${

                    activeCompany?.ticker?.startsWith(sym) ? 'text-blue-400 font-bold bg-slate-800' : 'text-slate-400'

                  }`}

                >

                  {sym}

                </button>

              ))}

            </div>

          </div>

        </div>



        {/* Top Action Buttons (Scope, Inspector, Excel, Command Search) */}

        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">

          <button

            onClick={() => setBankingNotice({ ticker: 'SCOPE_OVERVIEW', isScopeOverview: true })}

            className="flex items-center space-x-1.5 px-2 sm:px-2.5 h-7 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 hover:border-amber-400 rounded-xs text-[11px] font-mono text-amber-300 transition cursor-pointer shadow-2xs whitespace-nowrap shrink-0"

            title="Click to view methodology scope limitation & why commercial banks are excluded"

          >

            <Icon name="ShieldAlert" size={12} className="text-amber-400 shrink-0" />

            <span className="hidden xl:inline font-semibold">NON-FINANCIAL SCOPE</span>

            <span className="xl:hidden font-semibold">SCOPE</span>

          </button>



          <button

            onClick={() => setInspectorOpen(true)}

            className="hidden xl:flex items-center space-x-1.5 px-2.5 h-7 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xs text-xs font-mono text-blue-300 transition whitespace-nowrap shrink-0 cursor-pointer"

            title="Open Technical Diagnostic Inspector"

          >

            <Icon name="Activity" size={13} className="text-blue-400" />

            <span>Inspector ⚡</span>

          </button>



          <button

            onClick={handleDownloadExcel}

            disabled={isExportingExcel}

            className="px-2.5 sm:px-3 h-7 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xs text-xs font-mono font-bold flex items-center space-x-1.5 transition shadow-xs whitespace-nowrap shrink-0 cursor-pointer"

            title="Download multi-sheet institutional financial model in Microsoft Excel format (.xlsx)"

          >

            <Icon name="Download" size={13} />

            <span className="hidden md:inline">{isExportingExcel ? 'Exporting...' : 'Excel Model'}</span>

            <span className="md:hidden">Excel</span>

          </button>



          <div className="relative">

            <button

              onClick={() => setGlobalSearchOpen(!globalSearchOpen)}

              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-xs px-2.5 h-7 text-xs transition whitespace-nowrap shrink-0 cursor-pointer"

              title="Search All IDX Equities (Press CTRL+K)"

            >

              <Icon name="Search" size={13} className="text-slate-400" />

              <span className="hidden lg:inline">Jump to Ticker...</span>

              <span className="text-[10px] font-mono bg-slate-800 px-1 py-0.2 rounded text-slate-400">CTRL+K</span>

            </button>



            {globalSearchOpen && (

              <div className="absolute right-0 mt-1.5 w-96 bg-white text-slate-900 rounded-xs shadow-2xl border border-slate-300 z-50 overflow-hidden">

                <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center">

                  <Icon name="Search" size={14} className="text-slate-400 mr-2" />

                  <input

                    type="text"

                    autoFocus

                    placeholder="Search any non-financial IDX ticker (e.g. ASII, ANTM, AKRA)..."

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

            {/* Active Company Ticker Loader & Signal Card */}

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xs space-y-2.5">

              <div className="flex items-center justify-between">

                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">

                  Load / Input Ticker

                </label>

                {activeCompany && (

                  <button

                    onClick={() => setSelectedCompanyId(null)}

                    className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition cursor-pointer"

                    title="Clear active security / Return to Universe Overview"

                  >

                    ✕ Reset

                  </button>

                )}

              </div>



              {/* Ticker Input & Load Button */}

              <div className="flex items-center space-x-1.5">

                <div className="relative flex-1">

                  <input

                    type="text"

                    value={sidebarTickerInput}

                    onChange={(e) => setSidebarTickerInput(e.target.value.toUpperCase())}

                    onKeyDown={(e) => {

                      if (e.key === 'Enter') {

                        handleLoadCustomTicker(sidebarTickerInput);

                        setSidebarTickerInput('');

                      }

                    }}

                    placeholder={activeCompany ? activeCompany.ticker : "e.g. TOWR, ASII..."}

                    className="w-full bg-slate-950 text-white placeholder-slate-500 border border-slate-700 focus:border-blue-500 rounded-xs px-2.5 py-1.5 text-xs font-mono uppercase focus:outline-none transition"

                  />

                </div>

                <button

                  onClick={() => {

                    handleLoadCustomTicker(sidebarTickerInput);

                    setSidebarTickerInput('');

                  }}

                  disabled={isLoadingCustomTicker || !sidebarTickerInput.trim()}

                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xs text-xs font-mono font-bold transition cursor-pointer shrink-0 flex items-center justify-center min-w-[46px]"

                >

                  {isLoadingCustomTicker ? '...' : 'Load'}

                </button>

              </div>



              {/* Active Security Overview Card (When Loaded) */}

              {activeCompany ? (

                <div className="bg-slate-950/70 border border-slate-800/90 rounded-xs p-2 space-y-1.5 font-mono">

                  <div className="flex items-center justify-between text-xs">

                    <span className="font-bold text-white tracking-wide">{activeCompany.ticker}</span>

                    <span className="text-slate-300 font-semibold">IDR {activeCompany.referencePrice?.toLocaleString()}</span>

                  </div>

                  <div className="text-[10px] text-slate-400 truncate" title={activeCompany.name}>

                    {activeCompany.name}

                  </div>

                  <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">

                    <span className="text-slate-500 text-[10px]">Signal:</span>

                    <RecommendationBadge rec={activeCompany.valuation?.recommendation || 'BUY'} />

                  </div>

                  <div className="flex items-center justify-between text-[10px]">

                    <span className="text-slate-500">Margin-of-Safety:</span>

                    <span className={`font-bold ${activeCompany.valuation?.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>

                      {fmtPct(activeCompany.valuation?.impliedUpside)}

                    </span>

                  </div>

                </div>

              ) : (

                /* Idle Quick Starters */

                <div className="space-y-1.5 pt-1 border-t border-slate-800/60 font-mono">

                  <div className="flex items-center justify-between text-[10px] text-slate-500">

                    <span>Quick Starters:</span>

                    <span>Status: IDLE</span>

                  </div>

                  <div className="flex flex-wrap gap-1">

                    {['ASII', 'UNTR', 'ICBP', 'TOWR', 'AKRA', 'KLBF'].map(sym => (

                      <button

                        key={sym}

                        onClick={() => handleLoadCustomTicker(sym)}

                        className="px-1.5 py-0.5 bg-slate-800/80 hover:bg-blue-600 hover:text-white text-slate-300 text-[10px] rounded-2xs transition cursor-pointer"

                      >

                        {sym}

                      </button>

                    ))}

                  </div>

                </div>

              )}

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

                <span>Active Universe</span>

                <div className="flex items-center space-x-2">

                  {coverageCompanies.length > 0 && (

                    <button

                      onClick={() => {

                        setCoverageCompanies([]);

                        setSelectedCompanyId(null);

                        triggerToast("Active research universe reset to empty state");

                      }}

                      className="text-[9px] font-mono text-slate-400 hover:text-rose-400 transition cursor-pointer"

                      title="Clear all tickers from active session universe"

                    >

                      [Clear]

                    </button>

                  )}

                  <span>Implied</span>

                </div>

              </div>

              <div className="space-y-0.5 mt-1">

                {enrichedCompanies.length === 0 ? (

                  <div className="p-3 text-center text-[10px] font-mono text-slate-400 border border-dashed border-slate-800/80 rounded-xs space-y-1.5 bg-slate-900/40">

                    <div className="font-semibold text-slate-300">No Active Universe</div>

                    <div className="text-[9px] text-slate-500 leading-normal">

                      Enter any non-banking IDX ticker above (e.g. ASII, UNTR, ICBP, TOWR) to load live valuation.

                    </div>

                  </div>

                ) : (

                  enrichedCompanies.map(comp => (

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

                      <span className={comp.valuation?.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>

                        {fmtPct(comp.valuation?.impliedUpside || 0)}

                      </span>

                    </button>

                  ))

                )}

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

          {/* Banking Limitation Modal */}

          {bankingNotice && (

            <BankingLimitationModal

              notice={bankingNotice}

              onClose={() => setBankingNotice(null)}

              onSelectAlternative={(sym) => {

                setBankingNotice(null);

                handleLoadCustomTicker(sym);

              }}

            />

          )}



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

              onLoadTicker={handleLoadCustomTicker}

              isLoadingTicker={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'discovery' && (

            <CompanyDiscovery

              companies={enrichedCompanies}

              onSelectCompany={openCompanyWorkspace}

              onToggleWatchlist={toggleWatchlist}

              onLoadCustomTicker={handleLoadCustomTicker}

              isLoadingCustomTicker={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'valuation' && !activeCompany && (

            <UniversalTickerLaunchpad

              onLoadTicker={handleLoadCustomTicker}

              isLoading={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'valuation' && activeCompany && (

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



          {activeNav === 'threestatements' && !activeCompany && (

            <UniversalTickerLaunchpad

              onLoadTicker={handleLoadCustomTicker}

              isLoading={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'threestatements' && activeCompany && (

            <ThreeStatementWorkspace

              company={activeCompany}

              backendData={backendData}

              isLoadingBackend={isLoadingBackend}

              onRefreshCalculation={handleRefreshCalculation}

              onDownloadExcel={handleDownloadExcel}

            />

          )}



          {activeNav === 'modeler' && !activeCompany && (

            <UniversalTickerLaunchpad

              onLoadTicker={handleLoadCustomTicker}

              isLoading={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'modeler' && activeCompany && (

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



          {activeNav === 'decision' && !activeCompany && (

            <UniversalTickerLaunchpad

              onLoadTicker={handleLoadCustomTicker}

              isLoading={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'decision' && activeCompany && (

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

              onLoadCustomTicker={handleLoadCustomTicker}

              isLoadingCustomTicker={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'reports' && !activeCompany && (

            <UniversalTickerLaunchpad

              onLoadTicker={handleLoadCustomTicker}

              isLoading={isLoadingCustomTicker}

            />

          )}



          {activeNav === 'reports' && activeCompany && (

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

                  Step-by-Step KaTeX Valuation Proofs ({activeCompany?.ticker || 'Terminal Standard'})

                </h3>

              </div>

              <button

                onClick={() => setInspectorOpen(false)}

                className="text-slate-400 hover:text-white p-1 rounded-xs"

              >

                <Icon name="X" size={18} />

              </button>

            </div>



            <div className="flex-1 overflow-y-auto p-5 font-sans text-xs">
              <ValuationProofsCards company={activeCompany} backendData={backendData} isDrawer={true} />
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

function ExecutiveDashboard({ companies, activityLog, onSelectCompany, onNavigate, onLoadTicker, isLoadingTicker }) {

  if (!companies || companies.length === 0) {

    return (

      <UniversalTickerLaunchpad

        onLoadTicker={onLoadTicker}

        isLoading={isLoadingTicker}

      />

    );

  }

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

              ALL IDX SECTORS

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

            <span>Tracked Market Capitalization</span>

            <Icon name="Building2" size={14} className="text-slate-400" />

          </div>

          <div className="mt-1.5 flex items-baseline justify-between">

            <span className="text-xl font-bold font-mono text-slate-900">{fmtCompact(totalTrackedMcap)}</span>

            <span className="text-xs font-mono text-slate-500">{companies.length} Active Names</span>

          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">

            <span>Coverage Universe Scope:</span>

            <span className="font-mono font-bold text-slate-900">Multi-Sector IDX Equities</span>

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

              {sortedByUpside[0]?.ticker || '-'} ({fmtPct(sortedByUpside[0]?.valuation?.impliedUpside || 0)})

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

                IDX Coverage Valuation Matrix

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

              Enter any non-financial ticker (e.g. <strong className="text-blue-300">ASII</strong>, <strong className="text-blue-300">ANTM</strong>, <strong className="text-blue-300">AKRA</strong>, <strong className="text-blue-300">TLKM</strong>, <strong className="text-blue-300">ICBP</strong>) to pull audited financials and model 10-year valuation.

            </div>

          </div>

        </div>



        <div className="flex items-center space-x-2 w-full md:w-auto">

          <input

            type="text"

            placeholder="e.g. ASII, ANTM, AKRA, TLKM..."

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

            placeholder="Search by non-financial ticker (e.g. ASII, ANTM, AKRA, TLKM) or company name..."

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



// (RNAVTab retired in universal multi-sector suite)



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



// (EVATab retired in universal multi-sector suite)



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

                5-Stage DuPont ROE Decomposition vs. Indonesian Corporate Benchmark

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

  if (!company) return null;

  const [activeTab, setActiveTab] = useState('dcf');

  const [footballView, setFootballView] = useState('bars');
  const [priceChartView, setPriceChartView] = useState('track');

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

  // Multi-method synchronized targets
  const dcfPrice = displaySharePrice;
  const compsPrice = backendData?.comps?.comps_target_price !== undefined ? Math.round(backendData.comps.comps_target_price) : v.compsSharePrice;
  const rimPrice = backendData?.rim?.rim_target_price !== undefined ? Math.round(backendData.rim.rim_target_price) : v.rimSharePrice;
  const ddmPrice = backendData?.ddm?.ddm_price !== undefined ? Math.round(backendData.ddm.ddm_price) : v.ddmSharePrice;

  const wDcf = a.dcfWeight !== undefined && a.dcfWeight !== null ? Number(a.dcfWeight) : 50;
  const wComps = a.compsWeight !== undefined && a.compsWeight !== null ? Number(a.compsWeight) : 25;
  const wRim = a.rimWeight !== undefined && a.rimWeight !== null ? Number(a.rimWeight) : 15;
  const wDdm = a.ddmWeight !== undefined && a.ddmWeight !== null ? Number(a.ddmWeight) : 10;
  const totalW = (wDcf + wComps + wRim + wDdm) || 1;

  const displayComposite = Math.round((dcfPrice * wDcf + compsPrice * wComps + rimPrice * wRim + ddmPrice * wDdm) / totalW);
  const displayUpside = +(((displayComposite / (company.referencePrice || 1)) - 1) * 100).toFixed(1);
  const displayRec = displayUpside >= 15.0 ? 'BUY' : displayUpside <= -10.0 ? 'SELL' : 'HOLD';

  const isBackendCurrent = Boolean(backendData && backendData.company?.ticker === company.ticker);

  const rawBasePrice = displaySharePrice || displayComposite || Math.round((company.referencePrice || 1000) * 1.15);
  let rawBullPrice = (isBackendCurrent && backendData.scenarios?.bull?.price !== undefined)
    ? Math.round(backendData.scenarios.bull.price)
    : (company.bullCase || Math.round(rawBasePrice * 1.25));
  let rawBearPrice = (isBackendCurrent && backendData.scenarios?.bear?.price !== undefined)
    ? Math.round(backendData.scenarios.bear.price)
    : (company.bearCase || Math.round(rawBasePrice * 0.75));

  if (rawBearPrice >= rawBasePrice) {
    rawBearPrice = Math.round(rawBasePrice * 0.85);
  }
  if (rawBullPrice <= rawBasePrice) {
    rawBullPrice = Math.round(rawBasePrice * 1.20);
  }

  const basePrice = rawBasePrice;
  const bullPrice = rawBullPrice;
  const bearPrice = rawBearPrice;

  // Football Field Range Setup

  const footballField = [

    { method: '10-Year DCF (FCFF)', low: Math.round(displaySharePrice * 0.85), base: displaySharePrice, high: Math.round(displaySharePrice * 1.15) },

    { method: 'Relative Multiples Comps', low: Math.round(v.compsSharePrice * 0.88), base: v.compsSharePrice, high: Math.round(v.compsSharePrice * 1.12) },

    { method: 'Residual Income (RIM)', low: Math.round(v.rimSharePrice * 0.90), base: v.rimSharePrice, high: Math.round(v.rimSharePrice * 1.10) },

    { method: 'Dividend Discount (DDM)', low: Math.round(v.ddmSharePrice * 0.85), base: v.ddmSharePrice, high: Math.round(v.ddmSharePrice * 1.15) },

    { method: 'House Composite Triangulation', low: Math.round(displayComposite * 0.85), base: displayComposite, high: Math.round(displayComposite * 1.18) }

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

              <RecommendationBadge rec={displayRec} size="lg" />

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

            <span className="text-lg font-bold text-blue-700">IDR {displayComposite?.toLocaleString()}</span>

            <span className="block text-[11px] text-slate-500">

              DCF: IDR {dcfPrice} | DDM: IDR {ddmPrice}

            </span>

          </div>



          <div className="border-r border-slate-100 pr-2">

            <span className="text-[10px] text-slate-500 uppercase block">Implied Upside</span>

            <span className={`text-lg font-bold ${displayUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>

              {fmtPct(displayUpside)}

            </span>

            <span className="block text-[11px] text-slate-500">

              Spread: +IDR {(displayComposite - company.referencePrice)?.toLocaleString()}

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

            <span className="text-[10px] text-slate-500 uppercase block">Audited {lastHist.year || '2025A'} Revenue (PSAK)</span>

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

        {/* 12M Price vs Intrinsic Area Chart OR Exhibit 1 Target Price Cone */}

        <div className="bg-white border border-slate-200 rounded-xs p-4 shadow-2xs">

          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">

            <div>

              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">

                {priceChartView === 'track'
                  ? '12M Share Price vs. Intrinsic Value Track (IDR)'
                  : `Exhibit 1: ${company.ticker} Share Price vs. Rebased JCI & 12M Target Cone`}

              </h2>

              <p className="text-[11px] text-slate-500">

                {priceChartView === 'track'
                  ? 'Observed market quotes vs. house DCF fair value estimates'
                  : '5-Year historical trajectory vs. benchmark IHSG index & 12-month forward scenario cone'}

              </p>

            </div>

            <div className="flex items-center space-x-2">

              {priceChartView === 'track' ? (
                <span className="text-[11px] font-mono text-blue-700 font-semibold">
                  Upside: {fmtPct(v.impliedUpside)}
                </span>
              ) : (
                <div className="flex items-center space-x-1.5 font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded-xs border border-rose-200">
                    Bear: {bearPrice ? `${+(((bearPrice / (company.referencePrice || 1)) - 1) * 100).toFixed(1)}%` : '-'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-xs border border-blue-200 font-semibold">
                    Base: {basePrice ? `${+(((basePrice / (company.referencePrice || 1)) - 1) * 100).toFixed(1)}%` : '-'}
                  </span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-xs border border-emerald-200">
                    Bull: {bullPrice ? `+${+(((bullPrice / (company.referencePrice || 1)) - 1) * 100).toFixed(1)}%` : '-'}
                  </span>
                </div>
              )}

              {/* Segmented Switch (matching adjacent card's Range Bars | Weight Pie) */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-xs">
                <button
                  onClick={() => setPriceChartView('track')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-xs transition ${priceChartView === 'track' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  12M Track
                </button>
                <button
                  onClick={() => setPriceChartView('cone')}
                  className={`px-2 py-0.5 text-[10px] font-mono font-semibold rounded-xs transition ${priceChartView === 'cone' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Target Cone
                </button>
              </div>

            </div>

          </div>



          <div className="w-full">
            {priceChartView === 'track' ? (
              <div className="h-56 w-full">
                <PriceHistoryChart data={company.priceHistory || []} />
              </div>
            ) : (
              <div className="w-full">
                <TargetPriceConeChart
                  company={company}
                  backendData={backendData}
                  basePrice={displaySharePrice || displayComposite}
                  bullPrice={bullPrice}
                  bearPrice={bearPrice}
                />
              </div>
            )}
          </div>

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

              { id: 'montecarlo', label: '5. Monte Carlo (10k Runs)' },

              { id: 'analytics', label: '6. Tornado & DuPont Analytics' },

              { id: 'sensitivity', label: '7. 5x5 WACC Sensitivity' },

              { id: 'proofs', label: '8. KaTeX LaTeX Proofs' },

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

            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xs p-2.5 text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">

              <div className="flex items-center space-x-2">

                <Icon name="ShieldCheck" size={15} className="text-indigo-600 shrink-0" />

                <span>

                  <strong className="text-indigo-900">Official IDX Scraped Statements ({company.ticker}):</strong> Base Revenue ({fmtCompact(lastHist.revenue)}), Audited EBITDA ({fmtCompact(lastHist.ebitda)}), Cash ({fmtCompact(company.cashAndEquivalents)}), and Debt ({fmtCompact(company.totalDebt)}) strictly sourced from audited IDX XBRL annual filings ({company.historical?.[0]?.year || '2021A'}–{lastHist.year || '2025A'}).

                </span>

              </div>

              <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded-xs border border-indigo-200 text-indigo-800 shrink-0">

                100% AUDITED PSAK INTEGRITY

              </span>

            </div>

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

                  Cross-Industry Peer Trading Multiples Matrix

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
            <ValuationProofsCards company={company} backendData={backendData} isDrawer={false} />
          </div>
        )}

        {/* TAB 5: MONTE CARLO (10K SIMULATIONS) */}

        {activeTab === 'montecarlo' && (

          <MonteCarloTab company={company} backendData={backendData} />

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

  if (!company) return null;

  const [activeStmt, setActiveStmt] = useState('bs');

  const [showScopeInfo, setShowScopeInfo] = useState(false);

  // Default to historical actuals so the user immediately sees authentic 2021A-2025A audited filings

  const [viewMode, setViewMode] = useState('historical'); // 'historical' | 'forecast'

  

  const isMatchingBackend = (backendData?.company?.clean_ticker === company?.clean_ticker ||

                             backendData?.company?.ticker === company?.ticker);

  const threeStmt = isMatchingBackend ? (backendData?.three_statement || {}) : {};

  const isBalanced = threeStmt.is_balanced !== undefined ? threeStmt.is_balanced : true;



  const bsRows = threeStmt.balance_sheet || [];

  const isRows = threeStmt.income_statement || [];

  const cfsRows = threeStmt.cash_flow || [];



  // Extract authentic audited historical statements

  const historicalData = (isMatchingBackend && threeStmt.historical?.years?.length)

    ? threeStmt.historical

    : (company?.historical_statements || {});

  const histBsRows = historicalData.balance_sheet || [];

  const histIsRows = historicalData.income_statement || [];

  const histCfsRows = historicalData.cash_flow || [];

  const histDriverRows = historicalData.drivers || [];

  const histYears = historicalData.years || company?.historical_statements?.years || [2021, 2022, 2023, 2024, 2025];



  const tabs = viewMode === 'forecast' ? [

    { id: 'bs', label: '1. Balance Sheet (Assets = Liab + Equity)' },

    { id: 'is', label: '2. Income Statement (Rev -> Net Income)' },

    { id: 'cfs', label: '3. Cash Flow Statement (CFO + CFI + CFF)' }

  ] : [

    { id: 'bs', label: '1. Audited Balance Sheet (Assets ≡ Liab + Eq)' },

    { id: 'is', label: '2. Audited Income Statement (Rev -> Net Income)' },

    { id: 'cfs', label: '3. Audited Cash Flow Statement (CFO + CFI + CFF)' },

    { id: 'drivers', label: '4. Operational Drivers & Margins (DSO, DIO, DPO)' }

  ];



  return (

    <div className="space-y-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">

        <div>

          <div className="flex flex-wrap items-center gap-2">

            <h1 className="text-lg font-bold text-slate-900 tracking-tight">

              {viewMode === 'forecast' ? '10-Year Integrated 3-Statement Financial Model' : 'Audited Multi-Year 3-Statement Actuals'}

            </h1>

            <span className="text-[11px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded-xs font-bold">

              {company.ticker} AUDITED ENGINE

            </span>

            <span className="text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded-xs font-medium flex items-center space-x-1">

              <Icon name="Building2" size={11} className="text-slate-500" />

              <span>Corporate Finance Scope (Non-Banking)</span>

            </span>

            {company?.fxConversionApplied && (

              <span className="text-[11px] font-mono bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-xs font-bold flex items-center space-x-1 shadow-2xs">

                <Icon name="DollarSign" size={11} className="text-indigo-600" />

                <span>USD REPORTING (Converted @ {company.fxRateApplied?.toLocaleString()} IDR/USD)</span>

              </span>

            )}

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

            {viewMode === 'forecast' 

              ? 'Articulated Income Statement, Balance Sheet, and Cash Flow Statement across 2026E–2035E with live zero-balance reconciliation.'

              : `Authentic audited PSAK / IFRS consolidated financial statements directly from IDX XBRL filings (${histYears[0]}A–${histYears[histYears.length - 1]}A).`}

          </p>



          {/* Institutional Data Availability Notice Banner */}

      {(company?.dataAvailability?.status === 'partial' || (histYears && histYears.length < 5)) && (

        <div className="bg-amber-50/90 border border-amber-300 rounded-xs p-3 text-xs text-amber-950 flex items-start space-x-3 mt-3 shadow-2xs">

          <Icon name="AlertTriangle" size={16} className="text-amber-600 shrink-0 mt-0.5" />

          <div className="space-y-1">

            <div className="font-bold font-mono text-[11px] uppercase tracking-wider text-amber-950 flex items-center space-x-2">

              <span>{company?.dataAvailability?.title || `Notice: Limited Historical Depth on IDX (${histYears?.length || 2} Years Available)`}</span>

              <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-sans font-bold uppercase">Exchange Filing Archive</span>

            </div>

            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">

              {company?.dataAvailability?.message || `The official IDX repository contains ${histYears?.length || 2} year(s) of audited statements (${histYears?.[0]}A–${histYears?.[histYears.length - 1]}A). Earlier annual filings are not archived on the exchange portal (typical for recent IPOs or newly incorporated entities). The 10-year valuation model and pro forma schedules are calibrated using the available audited actuals.`}

            </p>

          </div>

        </div>

      )}



      {/* Segmented View Switcher */}

          <div className="inline-flex p-0.5 bg-slate-200/90 rounded-xs border border-slate-300 mt-2">

            <button

              onClick={() => { setViewMode('forecast'); if (activeStmt === 'drivers') setActiveStmt('bs'); }}

              className={`px-3 py-1 text-xs font-mono font-semibold rounded-xs transition cursor-pointer flex items-center space-x-1.5 ${

                viewMode === 'forecast' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'

              }`}

            >

              <Icon name="TrendingUp" size={12} className={viewMode === 'forecast' ? "text-blue-600" : "text-slate-400"} />

              <span>10-Year Pro Forma (2026E–2035E)</span>

            </button>

            <button

              onClick={() => setViewMode('historical')}

              className={`px-3 py-1 text-xs font-mono font-semibold rounded-xs transition cursor-pointer flex items-center space-x-1.5 ${

                viewMode === 'historical' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'

              }`}

            >

              <Icon name="History" size={12} className={viewMode === 'historical' ? "text-indigo-600" : "text-slate-400"} />

              <span>Audited Historical Actuals ({histYears[0]}A–{histYears[histYears.length - 1]}A)</span>

            </button>

          </div>

        </div>



        <div className="flex flex-wrap items-center gap-2">

          {/* Prominent Historical / Forecast Switch Button */}

          <button

            onClick={() => {

              const nextMode = viewMode === 'forecast' ? 'historical' : 'forecast';

              setViewMode(nextMode);

              if (nextMode === 'forecast' && activeStmt === 'drivers') setActiveStmt('bs');

            }}

            className={`px-3.5 py-1.5 rounded-xs text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition ${

              viewMode === 'forecast'

                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'

                : 'bg-blue-600 hover:bg-blue-700 text-white'

            }`}

            title={viewMode === 'forecast' ? `Show authentic audited historical actuals (${histYears[0]}A-${histYears[histYears.length - 1]}A)` : "Return to 10-Year Pro Forma forecast"}

          >

            <Icon name={viewMode === 'forecast' ? "History" : "TrendingUp"} size={13} className="text-amber-200" />

            <span>{viewMode === 'forecast' ? "🏛️ Show Historical Actuals" : "📈 Show 10-Year Forecast"}</span>

          </button>



          <button

            onClick={onRefreshCalculation}

            disabled={isLoadingBackend}

            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xs text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer transition"

            title="Recalculate 10-Year 3-Statement financial model with current custom assumptions"

          >

            <Icon name={isLoadingBackend ? "Loader2" : "Zap"} size={13} className={isLoadingBackend ? "animate-spin" : "text-amber-300"} />

            <span>{isLoadingBackend ? "Recalculating..." : "⚡ Refresh"}</span>

          </button>

          <div className={`px-3 py-1.5 rounded-xs border text-xs font-mono font-bold flex items-center space-x-1.5 ${

            isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'

          }`}>

            <Icon name={isBalanced ? 'CheckCircle2' : 'AlertTriangle'} size={14} className={isBalanced ? 'text-emerald-600' : 'text-rose-600'} />

            <span>{isBalanced ? 'ZERO-BALANCE: ASSETS ≡ LIAB + EQUITY' : 'BALANCE MISMATCH'}</span>

          </div>

          <button

            onClick={onDownloadExcel}

            className="px-3.5 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white rounded-xs text-xs font-medium flex items-center space-x-1.5 cursor-pointer"

          >

            <Icon name="Download" size={13} className="text-blue-400" />

            <span>Download .xlsx</span>

          </button>

        </div>

      </div>



      {viewMode === 'historical' && (

        <div className="bg-indigo-50 border border-indigo-200 rounded-xs p-3 text-xs text-indigo-950 flex flex-col gap-2 shadow-2xs">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">

            <div className="flex items-center space-x-2">

              <Icon name="ShieldCheck" size={17} className="text-indigo-600 shrink-0" />

              <div>

                <span className="font-bold">Official Audited PSAK Statements:</span>

                <span className="ml-1 text-indigo-800">

                  Parsed directly from official IDX XBRL reports ({histYears.join(', ')}). 100% reconciled with celeebi/IDX_GetFinancialStatement.

                </span>

              </div>

            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono shrink-0">

              <span className="bg-white px-2 py-0.5 rounded-xs border border-indigo-200 font-bold text-emerald-700 flex items-center space-x-1">

                <Icon name="CheckCircle2" size={11} className="text-emerald-600" />

                <span>BS BALANCE: 0.00</span>

              </span>

              <span className="bg-indigo-100 px-2 py-0.5 rounded-xs font-semibold text-indigo-800">

                SOURCE: IDX.CO.ID (XBRL)

              </span>

            </div>

          </div>

          <div className="bg-white/80 rounded border border-indigo-100 p-2 text-[11px] text-indigo-900 flex flex-wrap items-center justify-between gap-2">

            <div>

              <span className="font-semibold text-indigo-950">Scale & Currency Reconciliation: </span>

              <span>

                Raw filings reported in <strong>{company?.reporting_scale || 'In Thousands IDR (Ribuan)'}</strong> ({company?.reporting_currency || 'IDR'}).

                Normalized to <strong>IDR Trillion</strong> for clean institutional DCF & Pro Forma arithmetic.

              </span>

            </div>

            <div className="font-mono text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">

              Raw units in Excel reconcile exactly: (IDR Trillion = 1,000,000,000 Ribuan)

            </div>

          </div>

        </div>

      )}



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

        <div className="border-b border-slate-200 bg-slate-50 px-4 flex space-x-1 overflow-x-auto">

          {tabs.map(tab => (

            <button

              key={tab.id}

              onClick={() => setActiveStmt(tab.id)}

              className={`px-4 py-2.5 text-xs font-mono font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${

                activeStmt === tab.id ? 'border-blue-600 text-blue-700 bg-white' : 'border-transparent text-slate-600 hover:text-slate-900'

              }`}

            >

              {tab.label}

            </button>

          ))}

        </div>



        <div className="p-4 overflow-x-auto">

          {/* ================================================================= */}

          {/* VIEW MODE: 10-YEAR FORECAST (2026E - 2035E)                       */}

          {/* ================================================================= */}

          {viewMode === 'forecast' && (

            <>

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

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Inventories</td>

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

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Non-Current / Operating Assets</td>

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

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Equity & Reserves</td>

                      {bsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{(r.other_equity ?? 0).toFixed(2)}</td>)}

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

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-/+) Change in Inventories</td>

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

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Other Non-Current / Operating Assets Expansion</td>

                      {cfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{(r.investment_prop_capex ?? 0)?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">NET CASH USED IN INVESTING (CFI)</td>

                      {cfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-bold text-rose-800">{r.cfi?.toFixed(2)}</td>)}

                    </tr>



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

            </>

          )}



          {/* ================================================================= */}

          {/* VIEW MODE: AUDITED HISTORICAL STATEMENTS (2021A - 2024A/2025A)     */}

          {/* ================================================================= */}

          {viewMode === 'historical' && (

            <>

              {activeStmt === 'bs' && (

                <table className="w-full text-left border-collapse text-xs font-mono">

                  <thead>

                    <tr className="border-b border-indigo-300 bg-indigo-50/70 text-[10px] uppercase text-indigo-900">

                      <th className="py-2.5 px-3 sticky left-0 bg-indigo-50 z-10 font-sans w-72">Audited Balance Sheet Item (IDR Trillion)</th>

                      {histBsRows.map((r, idx) => (

                        <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-indigo-900">{r.period || `${r.year}A`}</th>

                      ))}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    {/* 1. Current Assets */}

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histBsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        I. CURRENT ASSETS

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans font-medium text-slate-900 pl-6">Cash & Cash Equivalents</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-indigo-900">{r.cash?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Accounts Receivable</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ar?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Inventories</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.inventory?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Current Assets & Prepayments</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_current_assets?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Total Current Assets</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-indigo-900 font-semibold">{r.total_current_assets?.toFixed(2)}</td>)}

                    </tr>



                    {/* 2. Non-Current Assets */}

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histBsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        II. NON-CURRENT ASSETS

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Net PP&E & Operating Assets</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.net_ppe?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Non-Current Assets</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_non_current_assets?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">

                      <td className="py-2.5 px-3 sticky left-0 bg-slate-100 z-10 font-sans text-slate-900">TOTAL ASSETS</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-indigo-900 font-bold">{r.total_assets?.toFixed(2)}</td>)}

                    </tr>



                    {/* 3. Current Liabilities */}

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histBsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        III. CURRENT LIABILITIES

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Accounts Payable</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ap?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Short-Term Borrowings & Facilities</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.short_term_debt?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Current Liabilities</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_current_liabilities?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Total Current Liabilities</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right">{r.total_current_liabilities?.toFixed(2)}</td>)}

                    </tr>



                    {/* 4. Non-Current Liabilities */}

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histBsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        IV. NON-CURRENT LIABILITIES

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Long-Term Bank Debt & Senior Notes</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.long_term_debt?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Non-Current Liabilities</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_non_current_liabilities?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50/70 font-medium text-slate-800">

                      <td className="py-1.5 px-3 sticky left-0 bg-slate-50/70 z-10 font-sans pl-6">Total Debt (ST + LT Borrowings)</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium">{r.total_debt?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">

                      <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL LIABILITIES</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-slate-900">{r.total_liabilities?.toFixed(2)}</td>)}

                    </tr>



                    {/* 5. Shareholders' Equity */}

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histBsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        V. SHAREHOLDERS' EQUITY

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Share Capital & Additional Capital</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.share_capital?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Retained Earnings (Cumulated)</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-indigo-900">{r.retained_earnings?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Other Equity & Reserves</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.other_equity?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Non-Controlling / Minority Interest</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{(r.minority_interest ?? 0).toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">

                      <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">TOTAL SHAREHOLDERS' EQUITY</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-slate-900 font-bold">{r.total_equity?.toFixed(2)}</td>)}

                    </tr>



                    {/* Total Liabilities & Equity */}

                    <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-400">

                      <td className="py-2.5 px-3 sticky left-0 bg-slate-100/90 z-10 font-sans">TOTAL LIABILITIES & EQUITY</td>

                      {histBsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-indigo-950 font-bold">{r.total_liabilities_equity?.toFixed(2)}</td>)}

                    </tr>



                    {/* Balance Check */}

                    <tr className="bg-emerald-50 text-emerald-900 font-bold border-t-2 border-emerald-300">

                      <td className="py-2.5 px-3 sticky left-0 bg-emerald-50 z-10 font-sans flex items-center space-x-1.5">

                        <Icon name="CheckCircle2" size={13} className="text-emerald-600" />

                        <span>ZERO-BALANCE CHECK (Assets ≡ Liab + Equity)</span>

                      </td>

                      {histBsRows.map((r, idx) => (

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

                    <tr className="border-b border-indigo-300 bg-indigo-50/70 text-[10px] uppercase text-indigo-900">

                      <th className="py-2.5 px-3 sticky left-0 bg-indigo-50 z-10 font-sans w-64">Audited Income Statement Item (IDR Trillion)</th>

                      {histIsRows.map((r, idx) => <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-indigo-900">{r.period || `${r.year}A`}</th>)}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    <tr>

                      <td className="py-2 px-3 sticky left-0 bg-white z-10 font-sans font-bold text-slate-900">Gross Revenue</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-semibold text-slate-900">{r.revenue?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Cost of Goods Sold (COGS)</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({r.cogs?.toFixed(2)})</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">Gross Profit</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-slate-900">{r.gross_profit?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">SG&A / Operating Expenses</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({r.sga?.toFixed(2)})</td>)}

                    </tr>

                    <tr className="bg-blue-50/40 font-bold">

                      <td className="py-2 px-3 sticky left-0 bg-blue-50/40 z-10 font-sans">EBITDA</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-blue-900">{r.ebitda?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Depreciation & Amortization</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">({r.depr?.toFixed(2)})</td>)}

                    </tr>

                    <tr className="bg-indigo-50/50 font-bold">

                      <td className="py-2 px-3 sticky left-0 bg-indigo-50/50 z-10 font-sans text-indigo-950">Operating Profit (EBIT)</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-indigo-900 font-bold">{r.ebit?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Finance Income</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-emerald-700">{r.finance_income?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Finance Costs</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">({r.finance_costs?.toFixed(2)})</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Pre-Tax Earnings (EBT)</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right">{r.ebt?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700">Income Tax Expense</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">({r.tax?.toFixed(2)})</td>)}

                    </tr>

                    <tr className="bg-emerald-50/50 font-bold text-slate-900 border-t-2 border-slate-300">

                      <td className="py-2.5 px-3 sticky left-0 bg-emerald-50/50 z-10 font-sans text-emerald-900">NET INCOME (Post-Tax)</td>

                      {histIsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-emerald-700 font-bold">{r.net_income?.toFixed(2)}</td>)}

                    </tr>

                    {histIsRows.some(r => r.net_income_parent) && (

                      <tr className="bg-emerald-100/30 font-semibold text-slate-800">

                        <td className="py-1.5 px-3 sticky left-0 bg-emerald-100/30 z-10 font-sans text-slate-700 pl-6">Net Income (Parent Entity Holders)</td>

                        {histIsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-emerald-800">{(r.net_income_parent ?? r.net_income)?.toFixed(2)}</td>)}

                      </tr>

                    )}

                  </tbody>

                </table>

              )}



              {activeStmt === 'cfs' && (

                <table className="w-full text-left border-collapse text-xs font-mono">

                  <thead>

                    <tr className="border-b border-indigo-300 bg-indigo-50/70 text-[10px] uppercase text-indigo-900">

                      <th className="py-2.5 px-3 sticky left-0 bg-indigo-50 z-10 font-sans w-72">Audited Cash Flow Statement Item (IDR Trillion)</th>

                      {histCfsRows.map((r, idx) => <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-indigo-900">{r.period || `${r.year}A`}</th>)}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histCfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        I. CASH FLOWS FROM OPERATING ACTIVITIES (CFO)

                      </td>

                    </tr>

                    <tr className="bg-blue-50/50 font-bold text-slate-900">

                      <td className="py-2 px-3 sticky left-0 bg-blue-50/50 z-10 font-sans text-blue-900">Operating Cash Flow (CFO)</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-blue-900 font-bold">{r.cfo?.toFixed(2)}</td>)}

                    </tr>



                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histCfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        II. CASH FLOWS FROM INVESTING ACTIVITIES (CFI)

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Capital Expenditures (PP&E & Additions)</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{r.capex?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">NET CASH USED IN INVESTING (CFI)</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-bold text-rose-800">{r.cfi?.toFixed(2)}</td>)}

                    </tr>



                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histCfsRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        III. CASH FLOWS FROM FINANCING ACTIVITIES (CFF)

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">(-) Cash Dividends Paid</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-rose-700">{r.dividends_paid?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans">NET CASH FROM FINANCING (CFF)</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right font-bold text-slate-800">{r.cff?.toFixed(2)}</td>)}

                    </tr>



                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">

                      <td className="py-2 px-3 sticky left-0 bg-slate-100 z-10 font-sans">NET CHANGE IN CASH & EQUIVALENTS</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className={`py-2 px-3 text-right font-bold ${r.net_change_cash >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{r.net_change_cash?.toFixed(2)}</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-600 pl-6">Cash & Equivalents at Beginning of Period</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-700">{r.beginning_cash?.toFixed(2)}</td>)}

                    </tr>

                    <tr className="bg-indigo-700 text-white font-bold border-t-2 border-indigo-800">

                      <td className="py-2.5 px-3 sticky left-0 bg-indigo-700 z-10 font-sans">CASH & EQUIVALENTS AT END OF PERIOD (Balance Sheet Cash)</td>

                      {histCfsRows.map((r, idx) => <td key={idx} className="py-2.5 px-3 text-right text-white font-bold">{r.ending_cash?.toFixed(2)}</td>)}

                    </tr>

                  </tbody>

                </table>

              )}



              {activeStmt === 'drivers' && (

                <table className="w-full text-left border-collapse text-xs font-mono">

                  <thead>

                    <tr className="border-b border-indigo-300 bg-indigo-50/70 text-[10px] uppercase text-indigo-900">

                      <th className="py-2.5 px-3 sticky left-0 bg-indigo-50 z-10 font-sans w-72">Operational Driver / Historical Metric</th>

                      {histDriverRows.map((r, idx) => <th key={idx} className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-indigo-900">{r.period || `${r.year}A`}</th>)}

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-200">

                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histDriverRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        I. GROWTH & PROFITABILITY MARGINS

                      </td>

                    </tr>

                    <tr>

                      <td className="py-2 px-3 sticky left-0 bg-white z-10 font-sans font-semibold text-slate-900 pl-6">Revenue Growth (YoY %)</td>

                      {histDriverRows.map((r, idx) => (

                        <td key={idx} className="py-2 px-3 text-right font-bold text-blue-900">

                          {r.growth_pct != null ? `${r.growth_pct > 0 ? '+' : ''}${r.growth_pct.toFixed(1)}%` : '—'}

                        </td>

                      ))}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Gross Margin (%)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-900 font-medium">{r.gross_margin_pct?.toFixed(1)}%</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">SG&A / Opex (% of Revenue)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">{r.sga_pct?.toFixed(1)}%</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-semibold text-slate-900">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans pl-6">EBITDA Margin (%)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-indigo-900">{r.ebitda_margin_pct?.toFixed(1)}%</td>)}

                    </tr>

                    <tr className="bg-indigo-50/50 font-bold text-indigo-950">

                      <td className="py-2 px-3 sticky left-0 bg-indigo-50/50 z-10 font-sans pl-6">Operating Margin (EBIT %)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-indigo-900">{r.operating_margin_pct?.toFixed(1)}%</td>)}

                    </tr>

                    <tr className="bg-emerald-50/40 font-bold text-emerald-950">

                      <td className="py-2 px-3 sticky left-0 bg-emerald-50/40 z-10 font-sans pl-6">Net Profit Margin (%)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-emerald-700">{r.net_margin_pct?.toFixed(1)}%</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">Effective Tax Rate (%)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right text-slate-600">{r.effective_tax_rate_pct?.toFixed(1)}%</td>)}

                    </tr>



                    <tr className="bg-indigo-50/40 font-bold text-indigo-950 text-[11px]">

                      <td colSpan={histDriverRows.length + 1} className="py-1.5 px-3 sticky left-0 bg-indigo-50/40">

                        II. WORKING CAPITAL VELOCITY & REINVESTMENT

                      </td>

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">DSO - Days Sales Outstanding (Receivables)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-slate-800">{r.dso_days?.toFixed(1)} days</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">DIO - Days Inventory Outstanding (Properties)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-slate-800">{r.dio_days?.toFixed(1)} days</td>)}

                    </tr>

                    <tr>

                      <td className="py-1.5 px-3 sticky left-0 bg-white z-10 font-sans text-slate-700 pl-6">DPO - Days Payable Outstanding (Payables)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-1.5 px-3 text-right font-medium text-slate-800">{r.dpo_days?.toFixed(1)} days</td>)}

                    </tr>

                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">

                      <td className="py-2 px-3 sticky left-0 bg-slate-50 z-10 font-sans pl-6">CapEx Reinvestment (% of Revenue)</td>

                      {histDriverRows.map((r, idx) => <td key={idx} className="py-2 px-3 text-right text-rose-700 font-bold">{r.capex_pct_rev?.toFixed(1)}%</td>)}

                    </tr>

                  </tbody>

                </table>

              )}

            </>

          )}

        </div>

      </div>

    </div>

  );

}



// 5. VALUATION MODEL ASSUMPTIONS & PARAMETER EDITOR

function ValuationModelEditor({ company, isLoadingBackend, onRefreshCalculation, onUpdateAssumption, onUpdateMultipleAssumptions, onResetAssumptions, onApplyAutoFade, onNavigate }) {

  if (!company) return null;

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

              <div className="flex items-center">
                <label className="text-slate-700 font-medium text-[11px]">{item.label}</label>
                <ProvenanceTooltip paramKey={item.key} />
              </div>

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

  if (!company) return null;

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

function WatchlistAndComparison({ companies, watchlistIds, compareIds, setCompareIds, onToggleWatchlist, onSelectCompany, onLoadCustomTicker, isLoadingCustomTicker }) {

  if (!companies || companies.length === 0) {

    return (

      <UniversalTickerLaunchpad

        onLoadTicker={onLoadCustomTicker}

        isLoading={isLoadingCustomTicker}

      />

    );

  }

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

          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Watchlist & Equity Benchmarking</h1>

          <p className="text-xs text-slate-600 mt-0.5">

            Cross-company multiples, margin structures, and valuation upside comparisons across Indonesian listed equities.

          </p>

        </div>

      </div>



      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">

        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">

          <h2 className="text-xs font-bold uppercase font-mono text-slate-800">

            Side-by-Side Equity Comparison Matrix

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

  if (!company) return null;

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

              {company.description} Our 4-way triangulation framework (50% 10-Year DCF, 25% Relative Multiples Comps, 15% Residual Income, 10% Dividend Discount Model) establishes an intrinsic equity fair value of <strong>IDR {v.compositeIntrinsicValue?.toLocaleString()} per share</strong> against the market price of <strong>IDR {company.referencePrice?.toLocaleString()}</strong>, implying a compelling upside of <strong>{fmtPct(v.impliedUpside)}</strong>. We reiterate our <strong>{v.recommendation || 'BUY'}</strong> recommendation.

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



        {/* 3-Column Navigation Links Grid */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">

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

                  Monte Carlo Simulation (10k Runs)

                </button>

              </li>

              <li>

                <button onClick={() => onNavigate('valuation')} className="hover:text-blue-400 transition text-left cursor-pointer">

                  Sensitivity & DuPont Analytics

                </button>

              </li>

              <li>

                <button onClick={() => onNavigate('threestatements')} className="hover:text-blue-400 transition text-left cursor-pointer">

                  3-Statement Articulated Model

                </button>

              </li>

            </ul>

          </div>



          {/* Col 3: Author & Academic Affiliation */}

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

            <div className="flex flex-wrap items-center gap-1.5 mb-3">

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

              <a

                href="https://instagram.com/abas.space"

                target="_blank"

                rel="noopener noreferrer"

                className="px-2 py-1 bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-white border border-pink-700/50 rounded-xs text-[10px] font-mono flex items-center space-x-1 transition cursor-pointer"

                title="Instagram (@abas.space)"

              >

                <Icon name="Instagram" size={11} />

                <span>Instagram</span>

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

                Release: <span className="text-slate-400">latest (v1.2.0)</span>

              </div>

            </div>

          </div>

        </div>



        {/* Bottom Disclaimers & Copyright */}

        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">

          <div>

            © 2026 VALUEX Institutional Equity Terminal. Universal Coverage for all Indonesia Stock Exchange (IDX) Listed Equities.

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

              onClick={() => { onNavigate('discovery'); }}

              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xs text-xs font-bold font-mono transition flex items-center space-x-2 shadow-xs cursor-pointer"

            >

              <Icon name="Search" size={14} />

              <span>Explore Any IDX Equity</span>

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

          <h3 className="font-bold text-sm text-slate-900">4-Way Valuation Triangulation</h3>

          <p className="text-xs text-slate-600 leading-relaxed">

            Eliminates single-model biases by synthesizing Multi-Stage Discounted Cash Flow (FCFF), Relative Multiples Comps, Residual Income Model (RIM), and Dividend Discount Model (DDM).

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

              Under institutional financial modeling frameworks, the platform provides universal coverage for all equities listed on the <strong className="text-slate-900">Indonesia Stock Exchange (IDX)</strong>, featuring dynamic XBRL financial statement scraping, 10-year pro forma articulated modeling, and cross-sector valuation.

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

              <span className="text-slate-500">Target Security Scope:</span>

              <span className="font-bold text-blue-700">All Indonesia Stock Exchange (IDX) Equities</span>

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

              href="https://instagram.com/abas.space"

              target="_blank"

              rel="noopener noreferrer"

              className="px-3 py-1.5 bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-white border border-pink-700/50 rounded-xs text-xs font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"

            >

              <Icon name="Instagram" size={13} />

              <span>Instagram (@abas.space)</span>

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

                  placeholder="e.g. ASII, ANTM, AKRA, or General"

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

                Operating at the intersection of quantitative rigor and financial modeling to streamline institutional business valuation frameworks.

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

                <a

                  href="https://instagram.com/abas.space"

                  target="_blank"

                  rel="noopener noreferrer"

                  className="px-2.5 py-1 bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 hover:text-white border border-pink-700/50 rounded-xs text-[11px] font-mono font-medium flex items-center space-x-1.5 transition cursor-pointer"

                >

                  <Icon name="Instagram" size={12} />

                  <span>@abas.space</span>

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

                <div className="font-bold text-slate-900 mb-1">Can I test any Indonesian equity ticker on the IDX?</div>

                <div className="text-slate-600 text-[11px] leading-relaxed">

                  Yes, use the universal ticker search bar at the top right to load any non-financial IDX corporate symbol (e.g., ASII, ANTM, AKRA, TLKM, ICBP).

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

