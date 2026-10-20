"""
Indonesian Macroeconomic and Sector Benchmarks.
Calibrated for Indonesian capital markets (IDX / Bank Indonesia / UU HPP / Damodaran framework).
"""

from typing import Dict, List, Any

# Indonesian Macroeconomic Presets
INDONESIA_MACRO: Dict[str, Any] = {
    "country": "Indonesia",
    "currency": "IDR",
    "statutory_tax_rate": 0.22,  # Statutory corporate tax rate under UU HPP (22.0%)
    "risk_free_rate": 0.0660,    # Indonesia 10-Year Government Bond yield (6.60%)
    "equity_risk_premium": 0.0720,  # Aswath Damodaran ERP for Indonesia (7.20%)
    "terminal_gdp_growth_cap": 0.040,  # Long-term sustainable nominal GDP growth ceiling (4.0%)
    "default_terminal_g": 0.015,  # Conservative terminal perpetuity growth rate (1.5%)
}

# Pre-mapped IDX Sectors and Comparable Universe
DEFAULT_PEERS_MAP: Dict[str, List[str]] = {
    # Property & Real Estate (Primary Benchmark Universe)
    "PWON.JK": ["BSDE.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK", "LPKR.JK"],
    "BSDE.JK": ["PWON.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK"],
    "CTRA.JK": ["PWON.JK", "BSDE.JK", "SMRA.JK", "ASRI.JK"],
    "SMRA.JK": ["PWON.JK", "BSDE.JK", "CTRA.JK", "ASRI.JK"],
    "ASRI.JK": ["PWON.JK", "BSDE.JK", "CTRA.JK", "SMRA.JK"],
    # Automotive / Conglomerates
    "ASII.JK": ["UNTR.JK", "AUTO.JK", "IMAS.JK"],
    "UNTR.JK": ["ASII.JK", "HEXA.JK", "DOID.JK"],
    "AUTO.JK": ["ASII.JK", "SMSM.JK", "DRMA.JK"],
    # Telecommunications
    "TLKM.JK": ["ISAT.JK", "EXCL.JK", "TOWR.JK"],
    "ISAT.JK": ["TLKM.JK", "EXCL.JK", "FREN.JK"],
    "EXCL.JK": ["TLKM.JK", "ISAT.JK", "TOWR.JK"],
    # Consumer Goods
    "ICBP.JK": ["INDF.JK", "MYOR.JK", "UNVR.JK"],
    "INDF.JK": ["ICBP.JK", "MYOR.JK", "GGRM.JK"],
    "UNVR.JK": ["ICBP.JK", "MYOR.JK", "KLBF.JK"],
    # Mining / Energy
    "ADRO.JK": ["PTBA.JK", "ITMG.JK", "INDY.JK"],
    "PTBA.JK": ["ADRO.JK", "ITMG.JK", "MEDC.JK"],
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
