"""
Archetype Dispatcher and Sector Auto-Detection Engine.
Identifies whether an IDX issuer belongs to the Corporate Archetype
(General Industry, Mining, Consumer, Infrastructure, Property)
or Financial Institutions Archetype (Commercial Banks, Sharia Banks, Multifinance, Insurance).

Enforces institutional methodology boundary: Top-down corporate finance models
(EBITDA, FCFF, 3-Statement articulation) strictly require non-financial operating structures.
"""

from typing import Dict, Any, List, Optional


KNOWN_BANKING_TICKERS = {
    # Commercial & State-Owned Banks
    "BBCA", "BBRI", "BMRI", "BBNI", "BBTN", "BDMN", "BNGA", "BRIS", "BTPS",
    "MEGA", "BJBR", "BJTM", "PNBN", "BCIC", "BNII", "NISP", "BTPN", "AGRO",
    "ARTO", "BABP", "BACA", "BBHI", "BBKP", "BBYB", "BCAP", "BEKS", "BGTG",
    "BINA", "BKSW", "BMAS", "BNBA", "BNLI", "BSIM", "BSWD", "BVIC", "DNAR",
    "INPC", "MAYA", "MCOR", "NOBU", "PNBS", "SDRA",
    # Consumer Finance & Multifinance
    "BFIN", "ADMF", "CFIN", "MFIN", "WOMF", "TRUS", "AMOR",
    # Insurance & Securities
    "TUGU", "ASBI", "AHAP", "ASDM", "LIFE", "LPGI", "MREI", "MTWI",
    "PANS", "TRIM", "YULE", "KREN"
}

FINANCIAL_KEYWORDS = [
    "bank", "perbankan", "keuangan", "pembiayaan", "financing",
    "financial", "asuransi", "insurance", "sekuritas", "securities",
    "reksadana", "multifinance", "leasing"
]

BANKING_EXCLUSION_REASON = (
    "Methodology Scope Limitation: Commercial banks and financial intermediaries operate "
    "under Asset-Liability Management (ALM) where customer deposits and loans are the core "
    "operating product itself. Interest expense represents Cost of Goods Sold (COGS), rendering "
    "Operating Profit (EBIT), EBITDA, and Free Cash Flow to Firm (FCFF) inapplicable. "
    "Bank equity is strictly regulated by Basel III / OJK Capital Adequacy Ratios (CAR), "
    "requiring an ALM spread engine and regulatory-constrained DDM."
)

RECOMMENDED_NON_FINANCIAL_ALTERNATIVES = [
    {"ticker": "ASII.JK", "name": "Astra International", "sector": "Industrials / Conglomerate"},
    {"ticker": "ANTM.JK", "name": "Aneka Tambang", "sector": "Mining & Natural Resources"},
    {"ticker": "AKRA.JK", "name": "AKR Corporindo", "sector": "Logistics & Supply Chain"},
    {"ticker": "ICBP.JK", "name": "Indofood CBP", "sector": "Consumer Staples"},
    {"ticker": "TLKM.JK", "name": "Telkom Indonesia", "sector": "Telecommunications"}
]


def is_banking_or_financial(ticker: str) -> bool:
    """
    Returns True if the symbol belongs to a commercial bank or financial intermediary.
    Used for instant pre-flight validation and methodology boundary disclosures.
    """
    clean = (ticker or "").upper().replace(".JK", "").strip()
    if clean in KNOWN_BANKING_TICKERS:
        return True
    if any(clean.startswith(prefix) for prefix in ["BANK", "BFIN", "ADMF"]):
        return True
    return False


def detect_archetype(
    ticker: str,
    general_info: Optional[Dict[str, str]] = None,
    sheet_names: Optional[List[str]] = None,
    facts: Optional[Dict[Any, float]] = None
) -> str:
    """
    Detect whether the ticker should be modeled as 'banking' or 'corporate'.
    
    Returns:
        'banking' or 'corporate'
    """
    clean_ticker = (ticker or "").strip().upper()

    # 1. Ticker registry check
    if is_banking_or_financial(clean_ticker):
        return "banking"

    # 2. General information metadata check
    if general_info:
        metadata_str = " ".join(str(v).lower() for k, v in general_info.items() if any(
            x in str(k).lower() for x in ["sektor", "industri", "sector", "industry", "kegiatan", "bidang"]
        ))
        if any(kw in metadata_str for kw in FINANCIAL_KEYWORDS):
            return "banking"

    # 3. Excel sheet code prefix check (Entry Point 4/5/6/7: 4220000, 4322000, etc.)
    if sheet_names:
        for name in sheet_names:
            s_clean = name.strip()
            if any(s_clean.startswith(p) for p in ["4220000", "4322000", "4510000", "[42", "[43", "422", "432"]):
                return "banking"

    # 4. XBRL facts presence check
    if facts:
        banking_tags = [
            "TotalInterestAndShariaIncome",
            "TotalLoansGross",
            "AllowanceForImpairmentLossesForLoans",
            "CurrentAccountsWithBankIndonesia",
            "DepositsFromCustomers"
        ]
        fact_tags = {k[0] if isinstance(k, tuple) else str(k) for k in facts.keys()}
        if any(bt in fact_tags for bt in banking_tags):
            return "banking"

    # Default to non-financial Corporate Archetype
    return "corporate"
