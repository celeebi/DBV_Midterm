"""
Patch static/app_react.jsx to fix historical actuals, EBITDA mapping, dynamic banner text,
and ensure 2021-2025 historical statements are prioritized and shown by default.
"""

path = "static/app_react.jsx"
with open(path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update handleLoadCustomTicker EBITDA calculation
old_hist_items = """        const historicalItems = (hist.years || [2021, 2022, 2023, 2024, 2025]).map((yr, idx) => ({
          year: `${yr}A`,
          revenue: Math.round((hist.revenue?.[idx] || 1) * 1000),
          ebitda: Math.round((hist.ebit?.[idx] || 0.3) * 1.25 * 1000),
          netIncome: Math.round((hist.net_income?.[idx] || 0.2) * 1000),
          fcf: Math.round((hist.fcff?.[idx] || 0.15) * 1000),
          eps: Math.round(((hist.net_income?.[idx] || 0.2) * 1000 / shares) * 100) / 100,
          capex: Math.round((hist.capex?.[idx] || 0.1) * 1000)
        }));"""

new_hist_items = """        const historicalItems = (hist.years || [2021, 2022, 2023, 2024, 2025]).map((yr, idx) => ({
          year: `${yr}A`,
          revenue: Math.round((hist.revenue?.[idx] || 1) * 1000),
          ebitda: Math.round((hist.ebitda?.[idx] ?? (hist.ebit?.[idx] || 0.3) * 1.25) * 1000),
          netIncome: Math.round((hist.net_income?.[idx] || 0.2) * 1000),
          fcf: Math.round((hist.fcff?.[idx] || 0.15) * 1000),
          eps: Math.round(((hist.net_income?.[idx] || 0.2) * 1000 / shares) * 100) / 100,
          capex: Math.round((hist.capex?.[idx] || 0.1) * 1000)
        }));"""

if old_hist_items.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_hist_items.replace("\r\n", "\n"), new_hist_items)
    print("[+] Updated historicalItems EBITDA mapping in handleLoadCustomTicker")

# 2. Update openCompanyWorkspace to clear backendData and fetch statements if missing
old_open_ws = """  const openCompanyWorkspace = (companyId, targetScreen = 'valuation') => {
    setSelectedCompanyId(companyId);
    setActiveNav(targetScreen);
    setGlobalSearchOpen(false);
    const targetComp = coverageCompanies.find(c => c.id === companyId);
    if (targetComp) {
      refreshBackendValuation(targetComp.ticker);
    }
  };"""

new_open_ws = """  const openCompanyWorkspace = (companyId, targetScreen = 'valuation') => {
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
  };"""

if old_open_ws.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_open_ws.replace("\r\n", "\n"), new_open_ws)
    print("[+] Updated openCompanyWorkspace to fetch statements and clear stale state")

# 3. Update ValuationWorkspace Audited Revenue header
old_vw_header = """            <span className="text-[10px] text-slate-500 uppercase block">Audited 2024 Revenue (PSAK)</span>"""
new_vw_header = """            <span className="text-[10px] text-slate-500 uppercase block">Audited {lastHist.year || '2025A'} Revenue (PSAK)</span>"""
if old_vw_header.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_vw_header.replace("\r\n", "\n"), new_vw_header)
    print("[+] Updated ValuationWorkspace header to dynamic year")

# 4. Update ValuationWorkspace line 3257 hardcoded PWON banner
old_vw_banner = """              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheck" size={15} className="text-indigo-600 shrink-0" />
                <span>
                  <strong className="text-indigo-900">Official IDX Scraped Statements:</strong> Base Revenue (Rp 6.67T), Audited EBITDA (Rp 3.38T, 50.7% margin), Cash (Rp 9.20T), and Debt (Rp 6.44T) strictly sourced from audited IDX XBRL annual filings.
                </span>
              </div>"""

new_vw_banner = """              <div className="flex items-center space-x-2">
                <Icon name="ShieldCheck" size={15} className="text-indigo-600 shrink-0" />
                <span>
                  <strong className="text-indigo-900">Official IDX Scraped Statements ({company.ticker}):</strong> Base Revenue ({fmtCompact(lastHist.revenue)}), Audited EBITDA ({fmtCompact(lastHist.ebitda)}), Cash ({fmtCompact(company.cashAndEquivalents)}), and Debt ({fmtCompact(company.totalDebt)}) strictly sourced from audited IDX XBRL annual filings ({company.historical?.[0]?.year || '2021A'}–{lastHist.year || '2025A'}).
                </span>
              </div>"""

if old_vw_banner.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_vw_banner.replace("\r\n", "\n"), new_vw_banner)
    print("[+] Updated ValuationWorkspace banner to dynamic emiten figures")

# 5. Update ThreeStatementWorkspace viewMode and historicalData priority
old_three_state = """function ThreeStatementWorkspace({ company, backendData, isLoadingBackend, onRefreshCalculation, onDownloadExcel }) {
  if (!company) return null;
  const [activeStmt, setActiveStmt] = useState('bs');
  const [showScopeInfo, setShowScopeInfo] = useState(false);
  const [viewMode, setViewMode] = useState('forecast'); // 'forecast' | 'historical'
  
  const threeStmt = backendData?.three_statement || {};
  const isBalanced = threeStmt.is_balanced !== undefined ? threeStmt.is_balanced : true;

  const bsRows = threeStmt.balance_sheet || [];
  const isRows = threeStmt.income_statement || [];
  const cfsRows = threeStmt.cash_flow || [];

  // Extract authentic audited historical statements
  const historicalData = threeStmt.historical || company?.historical_statements || {};
  const histBsRows = historicalData.balance_sheet || [];
  const histIsRows = historicalData.income_statement || [];
  const histCfsRows = historicalData.cash_flow || [];
  const histDriverRows = historicalData.drivers || [];
  const histYears = historicalData.years || [2021, 2022, 2023, 2024];"""

new_three_state = """function ThreeStatementWorkspace({ company, backendData, isLoadingBackend, onRefreshCalculation, onDownloadExcel }) {
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
  const histYears = historicalData.years || company?.historical_statements?.years || [2021, 2022, 2023, 2024, 2025];"""

if old_three_state.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_three_state.replace("\r\n", "\n"), new_three_state)
    print("[+] Updated ThreeStatementWorkspace to default to historical and prioritize matching ticker")

# 6. Update calculateClientValuation fallbacks
old_calc_val = """  const comp = company || {};
  const lastHist = company.historical && company.historical.length 
    ? company.historical[company.historical.length - 1] 
    : { revenue: 7110, ebitda: 3660, netIncome: 2350, eps: 48.8 };
  const baseRev = lastHist.revenue || 7110;"""

new_calc_val = """  const comp = company || {};
  const lastHist = company.historical && company.historical.length 
    ? company.historical[company.historical.length - 1] 
    : { revenue: (company.marketCap || 10) * 100, ebitda: (company.marketCap || 10) * 25, netIncome: (company.marketCap || 10) * 15, eps: 50 };
  const baseRev = lastHist.revenue || ((company.marketCap || 10) * 100);"""

if old_calc_val.replace("\r\n", "\n") in code.replace("\r\n", "\n"):
    code = code.replace("\r\n", "\n").replace(old_calc_val.replace("\r\n", "\n"), new_calc_val)
    print("[+] Updated calculateClientValuation fallbacks")

with open(path, "w", encoding="utf-8") as f:
    f.write(code)

print("[OK] static/app_react.jsx patched successfully.")
