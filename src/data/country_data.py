"""
Indonesian Macroeconomic and Sector Benchmarks.
Calibrated for Indonesian capital markets (IDX / Bank Indonesia / UU HPP / Damodaran framework).
Includes complete data provenance metadata, sources, and methodologies.
"""

from typing import Dict, List, Any

# Indonesian Macroeconomic Presets with Complete Data Provenance
INDONESIA_MACRO: Dict[str, Any] = {
    "country": "Indonesia",
    "currency": "IDR",
    "statutory_tax_rate": 0.22,  # Statutory corporate tax rate under UU HPP No. 7/2021 (22.0%)
    "risk_free_rate": 0.0660,    # Indonesia 10-Year Government Bond yield (INDOGB 10Y: 6.60%)
    "mature_equity_risk_premium": 0.0500,  # Aswath Damodaran Mature Market Equity Risk Premium (5.00%)
    "country_risk_premium": 0.0216,  # Aswath Damodaran Country Risk Premium (Moody's Baa2 spread 1.50% * 1.44 volatility)
    "sovereign_rating": "Baa2 / BBB",  # Moody's Baa2 / S&P BBB / Fitch BBB (Investment Grade)
    "sovereign_default_spread": 0.0150,  # Damodaran sovereign default spread (150 bps)
    "relative_equity_volatility": 1.44,  # Emerging market equity-to-bond standard deviation ratio
    "equity_risk_premium": 0.0716,  # Combined Indonesian ERP (5.00% + 2.16% = 7.16% ~ 7.20%)
    "pre_tax_cost_of_debt": 0.0650,  # Commercial corporate borrowing rate (BI 7DRR 6.00% + 0.50% spread)
    "target_debt_weight": 0.200,  # Target property sector debt weight (20.0%)
    "terminal_gdp_growth_cap": 0.040,  # Long-term sustainable nominal GDP growth ceiling (4.0%)
    "default_terminal_g": 0.015,  # Conservative terminal perpetuity growth rate (1.5%)
    "provenance": {
        "beta": {
            "source_name": "Yahoo Finance Live API / CFA Institute",
            "citation": "Yahoo Finance 5-Year Monthly Regression against IHSG & CFA CAPM Guide",
            "source_url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/cost-capital",
            "source_domain": "cfainstitute.org",
            "badge": "LIVE YAHOO API",
            "badge_color": "blue",
            "methodology": "Calculated as Cov(R_stock, R_ihsg) / Var(R_ihsg) over 60 monthly periods. Reflects cyclical sensitivity and operating leverage.",
            "valuation_impact": "Higher beta scales the Equity Risk Premium, directly increasing Cost of Equity (Ke) and lowering intrinsic DCF, RIM, and DDM valuations."
        },
        "risk_free_rate": {
            "source_name": "Bank Indonesia / Ministry of Finance (DJPPR)",
            "citation": "10-Year Republic of Indonesia Benchmark Government Bond Yield (INDOGB 10Y)",
            "source_url": "https://tradingeconomics.com/indonesia/government-bond-yield",
            "source_domain": "tradingeconomics.com",
            "badge": "BANK INDONESIA 10Y",
            "badge_color": "emerald",
            "methodology": "Secondary market yield-to-maturity (YTM) for benchmark sovereign paper. Represents default-free nominal rate in IDR.",
            "valuation_impact": "Direct baseline anchor for both Cost of Equity and Cost of Debt. Higher bond yields raise hurdle WACC across all valuation models."
        },
        "mature_equity_risk_premium": {
            "source_name": "Prof. Aswath Damodaran (NYU Stern)",
            "citation": "Damodaran Online - Equity Risk Premiums (US & Mature Markets)",
            "source_url": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html",
            "source_domain": "pages.stern.nyu.edu",
            "badge": "DAMODARAN MATURE",
            "badge_color": "purple",
            "methodology": "Implied premium of equities over 10-year US Treasury bonds based on sustainable dividend yields and buyback cash payouts.",
            "valuation_impact": "Base return demanded by equity investors for taking equity risk in developed, AAA-rated mature markets."
        },
        "country_risk_premium": {
            "source_name": "Prof. Aswath Damodaran (NYU Stern)",
            "citation": "Damodaran Country Default Spreads & Risk Premiums Dataset (Indonesia Baa2)",
            "source_url": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html",
            "source_domain": "pages.stern.nyu.edu",
            "badge": "DAMODARAN CRP",
            "badge_color": "purple",
            "methodology": "Computed as Indonesia's sovereign credit rating default spread (1.50% for Baa2) multiplied by emerging market relative equity/bond volatility (1.44x) = 2.16%.",
            "valuation_impact": "Compensates equity investors for country-specific economic, currency, and regulatory volatility in Indonesia."
        },
        "sovereign_spread": {
            "source_name": "Moody's / S&P / Damodaran",
            "citation": "Indonesia Sovereign Credit Default Spread (Moody's Baa2 / S&P BBB)",
            "source_url": "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/ctryprem.html",
            "source_domain": "pages.stern.nyu.edu",
            "badge": "SOVEREIGN SPREAD",
            "badge_color": "purple",
            "methodology": "Quoted 10-year Sovereign CDS spread and rating-based default spread over US Treasuries.",
            "valuation_impact": "Baseline sovereign default compensation required by global capital markets."
        },
        "cost_of_debt": {
            "source_name": "Audited Financial Notes / Bank Indonesia",
            "citation": "Effective Borrowing Rate on Bank Loans & Corporate Bonds (BI 7DRR + Commercial Spread)",
            "source_url": "https://www.bi.go.id/id/statistik/indikator/bi-rate.aspx",
            "source_domain": "bi.go.id",
            "badge": "AUDITED BORROWING",
            "badge_color": "amber",
            "methodology": "Calculated from annual interest expense divided by average interest-bearing debt, cross-checked with commercial prime lending rates.",
            "valuation_impact": "Pre-tax borrowing cost. High debt cost increases WACC, but is partially shielded by the corporate tax shield (Kd * (1 - t))."
        },
        "debt_weight": {
            "source_name": "Audited Balance Sheet & CFA Capital Structure",
            "citation": "Gearing Ratio = Total Debt / (Total Debt + Market Equity Value)",
            "source_url": "https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/capital-structure",
            "source_domain": "cfainstitute.org",
            "badge": "BALANCE SHEET",
            "badge_color": "slate",
            "methodology": "Market value weight of debt in the enterprise capital structure. Benchmarked to Indonesian corporate capital structures.",
            "valuation_impact": "Determines the mix between Cost of Equity and cheaper after-tax Cost of Debt in blending WACC."
        },
        "tax_rate": {
            "source_name": "Directorate General of Taxes (DJP) / UU HPP",
            "citation": "Harmonization of Tax Regulations Law No. 7/2021 (UU HPP Pasal 17)",
            "source_url": "https://pajak.go.id/id/tarif-pajak-penghasilan-pph-badan",
            "source_domain": "pajak.go.id",
            "badge": "UU HPP 22%",
            "badge_color": "emerald",
            "methodology": "Statutory corporate income tax rate for Indonesian resident corporate entities.",
            "valuation_impact": "Determines the debt interest tax deduction (tax shield) and reduces EBIT into NOPAT."
        },
        "terminal_growth": {
            "source_name": "Aswath Damodaran & McKinsey Corporate Finance",
            "citation": "Closing the Loop: Estimating Terminal Value in Valuation",
            "source_url": "https://pages.stern.nyu.edu/~adamodar/pdfiles/country/termval.pdf",
            "source_domain": "pages.stern.nyu.edu",
            "badge": "DAMODARAN GDP CAP",
            "badge_color": "blue",
            "methodology": "Long-term perpetual growth rate for Gordon Growth cash flows after Year 10. Cannot exceed risk-free rate or national GDP.",
            "valuation_impact": "Massive leverage on terminal value. Capped at 4.0% to prevent infinite economic value paradox."
        },
        "exit_multiple": {
            "source_name": "Corporate Finance Institute (CFI) / IDX Comps",
            "citation": "10-Year Normalized EV/EBITDA Multiple Valuation Methodology",
            "source_url": "https://corporatefinanceinstitute.com/resources/valuation/ev-ebitda/",
            "source_domain": "corporatefinanceinstitute.com",
            "badge": "IDX PEER COMPS",
            "badge_color": "indigo",
            "methodology": "Terminal multiple cross-check applied to Year 10 EBITDA.",
            "valuation_impact": "Blended 50/50 with Gordon Growth perpetuity to compute robust Enterprise Value."
        }
    }
}

# Pre-mapped IDX Sectors and Comparable Universe
DEFAULT_PEERS_MAP: Dict[str, List[str]] = {
    # Property & Real Estate (Primary Benchmark Universe)
    "PWON.JK": ["BSDE.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK", "LPKR.JK"],
    "BSDE.JK": ["PWON.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK"],
    "CTRA.JK": ["PWON.JK", "BSDE.JK", "SMRA.JK", "ASRI.JK"],
    "SMRA.JK": ["PWON.JK", "BSDE.JK", "CTRA.JK", "ASRI.JK"],
    "ASRI.JK": ["PWON.JK", "BSDE.JK", "CTRA.JK", "SMRA.JK"],
    # Mining / Metals
    "ANTM.JK": ["INCO.JK", "MDKA.JK", "TINS.JK", "MBMA.JK", "NCKL.JK"],
    "INCO.JK": ["ANTM.JK", "MDKA.JK", "TINS.JK", "MBMA.JK"],
    "MDKA.JK": ["ANTM.JK", "INCO.JK", "MBMA.JK", "NCKL.JK"],
    # Automotive / Conglomerates
    "ASII.JK": ["UNTR.JK", "AUTO.JK", "DRMA.JK", "SMSM.JK"],
    "UNTR.JK": ["ASII.JK", "HEXA.JK", "DOID.JK"],
    "AUTO.JK": ["ASII.JK", "SMSM.JK", "DRMA.JK"],
    # Telecommunications
    "TLKM.JK": ["ISAT.JK", "EXCL.JK", "TOWR.JK", "MTEL.JK", "TBIG.JK"],
    "ISAT.JK": ["TLKM.JK", "EXCL.JK", "TOWR.JK"],
    "EXCL.JK": ["TLKM.JK", "ISAT.JK", "TOWR.JK"],
    # Consumer Goods
    "ICBP.JK": ["INDF.JK", "MYOR.JK", "UNVR.JK"],
    "INDF.JK": ["ICBP.JK", "MYOR.JK", "GGRM.JK"],
    "UNVR.JK": ["ICBP.JK", "MYOR.JK", "KLBF.JK"],
    # Mining / Energy
    "ADRO.JK": ["PTBA.JK", "ITMG.JK", "INDY.JK", "BUMI.JK"],
    "PTBA.JK": ["ADRO.JK", "ITMG.JK", "INDY.JK", "BUMI.JK"],
}

# Industry valuation guidance rules
INDUSTRY_RULES: Dict[str, Dict[str, Any]] = {
    "Real Estate": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.55, "multiples": 0.30, "rim": 0.15},
        "key_multiples": ["EV/EBITDA", "P/B", "P/E"],
        "justification": "Asset-heavy property developers with prime investment retail malls benefit from steady recurring rental cash flow (DCF anchor), while EV/EBITDA and P/B reflect landbank valuation and market sentiment."
    },
    "Property & Real Estate": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.55, "multiples": 0.30, "rim": 0.15},
        "key_multiples": ["EV/EBITDA", "P/B", "P/E"],
        "justification": "Asset-heavy property developers with prime investment retail malls benefit from steady recurring rental cash flow (DCF anchor), while EV/EBITDA and P/B reflect landbank valuation and market sentiment."
    },
    "Conglomerates / Industrials": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.60, "multiples": 0.25, "rim": 0.15},
        "key_multiples": ["EV/EBITDA", "P/E"],
        "justification": "Capital-intensive diversified operations with reliable audited operating cash flows make FCFF the primary anchor. Peer multiples provide market sentiment cross-checks."
    },
    "Automotive & Components": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.55, "multiples": 0.35, "rim": 0.10},
        "key_multiples": ["EV/EBITDA", "P/E"],
        "justification": "Cyclical auto assembly margins require explicit multi-year forecasting with fade to steady state. EV/EBITDA captures operational profitability across differing leverage."
    },
    "Telecommunications": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.65, "multiples": 0.25, "rim": 0.10},
        "key_multiples": ["EV/EBITDA"],
        "justification": "High D&A from tower and spectrum licenses creates high divergence between Net Income and Cash Flow. EV/EBITDA and FCFF are industry gold standards."
    },
    "Consumer Staples": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.50, "multiples": 0.35, "rim": 0.15},
        "key_multiples": ["P/E", "EV/EBITDA"],
        "justification": "Defensive demand and stable working capital cycles make both DCF and earnings multiples reliable valuation tools."
    },
    "General Non-Financial": {
        "primary_approach": "DCF-FCFF",
        "recommended_weights": {"dcf": 0.60, "multiples": 0.25, "rim": 0.15},
        "key_multiples": ["EV/EBITDA", "P/E", "P/B"],
        "justification": "Standard corporate finance triangulation balancing intrinsic discounted free cash flows with prevailing market peer pricing."
    }
}
