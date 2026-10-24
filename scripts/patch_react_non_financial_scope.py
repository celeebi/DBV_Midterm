"""
Comprehensive patch script for static/app_react.jsx:
1. Replaces BBCA in BREAKING_WIRE_HEADLINES with AKRA.
2. Removes Banking & Financials preset from UniversalTickerLaunchpad, inserts Logistics & Infrastructure, and adds prominent Methodology Scope Limitation notice.
3. Updates placeholders and quick button pills to replace BBCA with ASII/AKRA/KLBF.
4. Adds BANKING_TICKERS_SET and isBankTicker helper.
5. Adds BankingLimitationModal component.
6. Updates handleLoadCustomTicker to intercept banking tickers and display BankingLimitationModal.
7. Adds header scope badge and sidebar Clear Universe button.
"""

import os
import re

react_file = os.path.join("static", "app_react.jsx")
with open(react_file, "r", encoding="utf-8") as f:
    text = f.read()

# Normalize line endings
text = text.replace("\r\n", "\n")

# 1. Replace BBCA headline
old_headline = """  { id: 3, ticker: 'BBCA.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'BBCA: Digital CASA ratio expands to 82.4% while credit costs remain benign; loan growth momentum beats consensus at +14.2% YoY.' },"""
new_headline = """  { id: 3, ticker: 'AKRA.JK', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'AKRA: Petroleum and basic chemical throughput expands +8.4% YoY; JIIPE industrial estate monetization accelerates institutional operating cash flows.' },"""

if old_headline in text:
    text = text.replace(old_headline, new_headline, 1)
    print("[+] Replaced BBCA in wire headlines with AKRA")

# 2. Update sector presets in UniversalTickerLaunchpad
old_bank_preset = """    {
      sector: "Banking & Financials",
      icon: "Landmark",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",
      tickers: [
        { sym: "BBCA", name: "Bank Central Asia" },
        { sym: "BBRI", name: "Bank Rakyat Indonesia" },
        { sym: "BMRI", name: "Bank Mandiri" },
        { sym: "BBNI", name: "Bank Negara Indonesia" },
      ]
    },"""

new_logistics_preset = """    {
      sector: "Logistics & Energy Infrastructure",
      icon: "Truck",
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20 hover:border-blue-500/50",
      tickers: [
        { sym: "AKRA", name: "AKR Corporindo" },
        { sym: "PGAS", name: "Perusahaan Gas Negara" },
        { sym: "JSMR", name: "Jasa Marga" },
        { sym: "MEDC", name: "Medco Energi" },
      ]
    },"""

if old_bank_preset in text:
    text = text.replace(old_bank_preset, new_logistics_preset, 1)
    print("[+] Replaced Banking preset with Logistics & Energy Infrastructure")

# 3. Add scope notice banner inside UniversalTickerLaunchpad
old_launchpad_desc = """        <p className="text-sm text-slate-300 leading-relaxed">
          Search, model, and value <strong>any company listed on the IDX</strong>. Automatically scrapes audited financial statements, detects accounting archetypes (Corporate vs. Banking), articulates a 10-year pro forma model with mathematical 0.00 balance checks, and computes a 4-way valuation triangulation (DCF, Multiples Comps, RIM, DDM).
        </p>"""

new_launchpad_desc = """        <p className="text-sm text-slate-300 leading-relaxed">
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
        </div>"""

if old_launchpad_desc in text:
    text = text.replace(old_launchpad_desc, new_launchpad_desc, 1)
    print("[+] Added methodology scope banner to UniversalTickerLaunchpad")

# 4. Update quick buttons in top nav bar
old_quick_buttons = """              {['BBCA', 'ANTM', 'ASII', 'TLKM', 'ICBP', 'PWON'].map(sym => ("""
new_quick_buttons = """              {['ASII', 'ANTM', 'AKRA', 'ICBP', 'TLKM', 'KLBF'].map(sym => ("""

if old_quick_buttons in text:
    text = text.replace(old_quick_buttons, new_quick_buttons, 1)
    print("[+] Updated top nav quick buttons to non-financial blue chips")

# 5. Update placeholders
text = text.replace(
    'placeholder="Enter any IDX ticker (e.g. BBCA, ANTM, ASII, TLKM, ICBP, AADI, PWON)..."',
    'placeholder="Enter any non-financial IDX ticker (e.g. ASII, ANTM, AKRA, TLKM, ICBP)..."'
)
text = text.replace(
    'placeholder="Search Any Ticker (e.g. BBCA, TLKM)..."',
    'placeholder="Search Any Ticker (e.g. ASII, ANTM, AKRA)..."'
)
text = text.replace(
    'placeholder="Search any IDX ticker (e.g. BBCA, ANTM, ASII)..."',
    'placeholder="Search any non-financial IDX ticker (e.g. ASII, ANTM, AKRA)..."'
)
text = text.replace(
    'placeholder="Search by ticker (e.g. BBCA, ANTM, ASII, TLKM) or company name..."',
    'placeholder="Search by non-financial ticker (e.g. ASII, ANTM, AKRA, TLKM) or company name..."'
)
text = text.replace(
    'placeholder="e.g. BBCA, TLKM, UNVR..."',
    'placeholder="e.g. ASII, ANTM, AKRA, TLKM..."'
)
text = text.replace(
    'placeholder="e.g. BBCA, ANTM, ASII, or General"',
    'placeholder="e.g. ASII, ANTM, AKRA, or General"'
)
text = text.replace(
    'Enter any ticker (e.g. <strong className="text-blue-300">BBCA</strong>, <strong className="text-blue-300">TLKM</strong>, <strong className="text-blue-300">UNVR</strong>, <strong className="text-blue-300">BMRI</strong>, <strong className="text-blue-300">ICBP</strong>)',
    'Enter any non-financial ticker (e.g. <strong className="text-blue-300">ASII</strong>, <strong className="text-blue-300">ANTM</strong>, <strong className="text-blue-300">AKRA</strong>, <strong className="text-blue-300">TLKM</strong>, <strong className="text-blue-300">ICBP</strong>)'
)
text = text.replace(
    'Yes, use the universal ticker search bar at the top right to load any IDX or international symbol (e.g., BBCA, TLKM, UNVR).',
    'Yes, use the universal ticker search bar at the top right to load any non-financial IDX corporate symbol (e.g., ASII, ANTM, AKRA, TLKM, ICBP).'
)

# 6. Add BANKING_TICKERS_SET and BankingLimitationModal component
banking_components = """
// =============================================================================
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
"""

if "function BankingLimitationModal" not in text:
    # Insert right before UniversalTickerLaunchpad
    text = text.replace("// UNIVERSAL TICKER LAUNCHPAD COMPONENT", banking_components + "\n// UNIVERSAL TICKER LAUNCHPAD COMPONENT")
    print("[+] Added BankingLimitationModal component and helper")

# 7. Add bankingNotice state in App component
old_app_states = """  const [customTickerInput, setCustomTickerInput] = useState('');
  const [isLoadingCustomTicker, setIsLoadingCustomTicker] = useState(false);"""

new_app_states = """  const [customTickerInput, setCustomTickerInput] = useState('');
  const [isLoadingCustomTicker, setIsLoadingCustomTicker] = useState(false);
  const [bankingNotice, setBankingNotice] = useState(null);"""

if old_app_states in text:
    text = text.replace(old_app_states, new_app_states, 1)
    print("[+] Added bankingNotice state in App component")

# 8. Update handleLoadCustomTicker to intercept banking tickers
old_loader_check = """  const handleLoadCustomTicker = async (symbol) => {
    if (!symbol || !symbol.trim()) return;
    let formatted = symbol.trim().toUpperCase();
    if (!formatted.includes('.')) {
      formatted = `${formatted}.JK`;
    }
    const slug = formatted.replace('.JK', '').toLowerCase();"""

new_loader_check = """  const handleLoadCustomTicker = async (symbol) => {
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
    }"""

if old_loader_check in text:
    text = text.replace(old_loader_check, new_loader_check, 1)
    print("[+] Added banking pre-flight intercept in handleLoadCustomTicker")

# 9. In handleLoadCustomTicker, handle error_type === 'banking_unsupported'
old_loader_error = """      } else {
        triggerToast(`Could not fetch data for ${formatted}: ${json.message || 'Unknown error'}`);
      }"""

new_loader_error = """      } else if (json.error_type === 'banking_unsupported') {
        setBankingNotice({ ticker: formatted, message: json.message });
      } else {
        triggerToast(`Could not fetch data for ${formatted}: ${json.message || 'Unknown error'}`);
      }"""

if old_loader_error in text:
    text = text.replace(old_loader_error, new_loader_error, 1)
    print("[+] Handled backend banking_unsupported error in handleLoadCustomTicker")

# 10. Add Scope Badge in Header
old_header_status = """          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="hidden sm:inline text-slate-400">ENGINE:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          </div>"""

new_header_status = """          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setBankingNotice({ ticker: 'SCOPE_OVERVIEW', isScopeOverview: true })}
              className="hidden lg:flex items-center space-x-1.5 px-2 py-1 rounded-xs bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-[10px] font-mono cursor-pointer transition shadow-2xs"
              title="Click to view platform scope boundary and methodology limitations"
            >
              <Icon name="ShieldCheck" size={11} className="text-blue-400" />
              <span>NON-FINANCIAL SCOPE</span>
            </button>
            <span className="hidden sm:inline text-slate-400">ENGINE:</span>
            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>LIVE</span>
            </span>
          </div>"""

if old_header_status in text:
    text = text.replace(old_header_status, new_header_status, 1)
    print("[+] Added NON-FINANCIAL SCOPE badge in header")

# 11. Add Clear Universe and Empty State in Sidebar Active Research Universe
old_sidebar_universe = """            {/* Quick Universe List */}
            <div className="pt-2 border-t border-slate-800">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <span>Active Research Universe</span>
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
            </div>"""

new_sidebar_universe = """            {/* Quick Universe List */}
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
                  <div className="p-2.5 text-center text-[10px] font-mono text-slate-500 border border-dashed border-slate-800 rounded-xs space-y-1.5 bg-slate-900/30">
                    <div>No active tickers loaded.</div>
                    <div className="text-[9px] text-slate-600">Quick load real-economy blue chip:</div>
                    <div className="flex flex-wrap gap-1 justify-center pt-0.5">
                      {['ASII', 'ANTM', 'AKRA', 'ICBP', 'TLKM'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleLoadCustomTicker(s)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[9px] font-mono rounded-xs transition cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
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
            </div>"""

if old_sidebar_universe in text:
    text = text.replace(old_sidebar_universe, new_sidebar_universe, 1)
    print("[+] Added Clear Universe and Empty State in Sidebar")

# 12. Render BankingLimitationModal in App return
old_modal_render = """          {/* Global Search Modal */}
          {globalSearchOpen && ("""

new_modal_render = """          {/* Banking Limitation Modal */}
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

          {/* Global Search Modal */}
          {globalSearchOpen && ("""

if old_modal_render in text:
    text = text.replace(old_modal_render, new_modal_render, 1)
    print("[+] Rendered BankingLimitationModal in App return")

with open(react_file, "w", encoding="utf-8") as f:
    f.write(text)

print("[OK] static/app_react.jsx updated successfully with non-financial scope enhancements")
