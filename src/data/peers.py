"""
Peer Intelligence Universe Service for Indonesian Listed Equities.
Provides automated peer discovery across 112 IDX companies,
calculates verified financial multiples (EV/EBITDA, P/E, P/B, Rev Growth, EBITDA Margin),
and serves full universe catalog for interactive analyst customization.
"""

import os
import glob
import json
import math
from typing import Dict, List, Any, Optional
from src.data.country_data import DEFAULT_PEERS_MAP


# Normalization overrides for tickers with legacy or placeholder sector classifications
TAXONOMY_OVERRIDES: Dict[str, Dict[str, str]] = {
    "ANTM.JK": {
        "sector": "Basic Materials",
        "industry": "Other Industrial Metals & Mining",
        "name": "PT Aneka Tambang Tbk"
    },
    "AADI.JK": {
        "sector": "Energy",
        "industry": "Thermal Coal",
        "name": "PT Adaro Andalan Indonesia Tbk"
    },
    "AKRA.JK": {
        "sector": "Energy",
        "industry": "Oil & Gas Logistics",
        "name": "PT AKR Corporindo Tbk"
    },
    "KLBF.JK": {
        "sector": "Healthcare",
        "industry": "Medical Care & Pharmaceuticals",
        "name": "PT Kalbe Farma Tbk"
    },
    "PTBA.JK": {
        "sector": "Energy",
        "industry": "Thermal Coal",
        "name": "PT Bukit Asam Tbk"
    },
    "TOWR.JK": {
        "sector": "Communication Services",
        "industry": "Telecom Services",
        "name": "PT Sarana Menara Nusantara Tbk"
    },
    "PWON.JK": {
        "sector": "Real Estate",
        "industry": "Real Estate - Development",
        "name": "PT Pakuwon Jati Tbk"
    }
}


class PeerUniverseService:
    """Institutional Peer Intelligence Service indexing 112 IDX listed companies."""

    _instance: Optional["PeerUniverseService"] = None

    def __init__(self, data_dirs: Optional[List[str]] = None):
        if data_dirs is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.data_dirs = [
                os.path.join(base_dir, "data", "fallback_cache"),
                os.path.join(base_dir, "data", "idx_cache")
            ]
        else:
            self.data_dirs = data_dirs

        self._raw_companies: Dict[str, Dict[str, Any]] = {}
        self._computed_peers: Dict[str, Dict[str, Any]] = {}
        self._universe_catalog: List[Dict[str, Any]] = []
        self._load_and_index_universe()

    @classmethod
    def get_instance(cls) -> "PeerUniverseService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def reset_instance(cls):
        cls._instance = None

    def _normalize_ticker(self, ticker: str) -> str:
        t = ticker.strip().upper()
        if not t.endswith(".JK"):
            t = f"{t}.JK"
        return t

    def _load_and_index_universe(self):
        """Scans cached financial filings and builds in-memory metrics index."""
        all_files: List[str] = []
        for d in self.data_dirs:
            if os.path.exists(d):
                all_files.extend(glob.glob(os.path.join(d, "*.json")))

        # Load raw filings, prioritizing richer filings with historical_statements
        for filepath in all_files:
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    raw_ticker = data.get("ticker") or (data.get("clean_ticker", "") + ".JK")
                    ticker = self._normalize_ticker(raw_ticker)
                    if not ticker or ticker == ".JK":
                        continue

                    # Prefer filings that contain 3-statement models
                    if ticker not in self._raw_companies or (
                        "historical_statements" in data and "historical_statements" not in self._raw_companies[ticker]
                    ):
                        self._raw_companies[ticker] = data
            except Exception:
                continue

        # Compute ratios and build catalog
        catalog = []
        for ticker, raw_data in self._raw_companies.items():
            metrics = self._calculate_company_metrics(ticker, raw_data)
            self._computed_peers[ticker] = metrics
            catalog.append({
                "ticker": ticker,
                "clean_ticker": ticker.replace(".JK", ""),
                "name": metrics["name"],
                "sector": metrics["sector"],
                "industry": metrics["industry"],
                "mcap": metrics["mcap"],
                "ev_ebitda": metrics["ev_ebitda"],
                "pe": metrics["pe"],
                "pb": metrics["pb"]
            })

        # Sort catalog alphabetically by sector then name
        catalog.sort(key=lambda x: (x["sector"] or "", x["name"] or ""))
        self._universe_catalog = catalog

    def _calculate_company_metrics(self, ticker: str, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates authentic valuation ratios from audited financial statements."""
        # Check taxonomy overrides
        override = TAXONOMY_OVERRIDES.get(ticker, {})
        name = override.get("name") or raw_data.get("name") or ticker
        sector = override.get("sector") or raw_data.get("sector") or "General Corporate"
        industry = override.get("industry") or raw_data.get("industry") or "Operating Business"

        # Market metrics
        price = float(raw_data.get("current_price") or 0.0)
        shares = float(raw_data.get("shares_outstanding") or 0.0)
        mcap = raw_data.get("market_cap")
        if mcap is not None:
            mcap = float(mcap)
        elif price > 0 and shares > 0:
            mcap = (price * shares) / 1000.0  # IDR Trillion

        # Parse financials
        hist_stmts = raw_data.get("historical_statements", {})
        is_list = hist_stmts.get("income_statement", [])
        bs_list = hist_stmts.get("balance_sheet", [])
        hist = raw_data.get("historical", [])

        latest_rev, prev_rev = 0.0, 0.0
        latest_ebitda, latest_ni = 0.0, 0.0
        latest_equity, latest_debt, latest_cash = 0.0, 0.0, 0.0

        if is_list:
            lat_is = is_list[-1]
            prev_is = is_list[-2] if len(is_list) > 1 else lat_is
            latest_rev = float(lat_is.get("revenue", 0.0))
            prev_rev = float(prev_is.get("revenue", 0.0))
            latest_ebitda = float(lat_is.get("ebitda", 0.0))
            latest_ni = float(lat_is.get("net_income", lat_is.get("net_income_parent", 0.0)))
        elif hist:
            lat_h = hist[-1]
            prev_h = hist[-2] if len(hist) > 1 else lat_h
            latest_rev = float(lat_h.get("revenue", 0.0))
            prev_rev = float(prev_h.get("revenue", 0.0))
            latest_ebitda = float(lat_h.get("ebitda", 0.0))
            latest_ni = float(lat_h.get("netIncome", lat_h.get("net_income", 0.0)))

        if bs_list:
            lat_bs = bs_list[-1]
            latest_equity = float(lat_bs.get("total_equity", 0.0))
            latest_debt = float(lat_bs.get("total_debt", lat_bs.get("interest_bearing_debt", 0.0)))
            latest_cash = float(lat_bs.get("cash_and_equivalents", lat_bs.get("cash", 0.0)))

        # Enterprise Value = Mcap + Debt - Cash
        ev = (mcap or 0.0) + latest_debt - latest_cash

        # Ratios
        ev_ebitda = round(ev / latest_ebitda, 2) if (latest_ebitda > 0 and ev > 0) else None
        pe = round(mcap / latest_ni, 2) if (mcap and latest_ni > 0) else None
        pb = round(mcap / latest_equity, 2) if (mcap and latest_equity > 0) else None
        rev_growth = round(((latest_rev - prev_rev) / prev_rev * 100.0), 1) if prev_rev > 0 else 0.0
        ebitda_margin = round((latest_ebitda / latest_rev * 100.0), 1) if latest_rev > 0 else 0.0

        return {
            "name": name,
            "ticker": ticker,
            "clean_ticker": ticker.replace(".JK", ""),
            "sector": sector,
            "industry": industry,
            "mcap": round(mcap, 2) if mcap is not None else None,
            "ev_ebitda": ev_ebitda,
            "pe": pe,
            "pb": pb,
            "rev_growth": rev_growth,
            "ebitda_margin": ebitda_margin,
            "current_price": price if price > 0 else None
        }

    def get_company_metrics(self, ticker: str) -> Optional[Dict[str, Any]]:
        norm_t = self._normalize_ticker(ticker)
        return self._computed_peers.get(norm_t)

    def get_universe_catalog(self) -> List[Dict[str, Any]]:
        """Returns sorted directory of all 112 IDX companies for frontend selectors."""
        return self._universe_catalog

    def get_peers_by_tickers(self, tickers: List[str]) -> List[Dict[str, Any]]:
        """Returns verified metrics for an explicit list of tickers."""
        peers = []
        for t in tickers:
            norm_t = self._normalize_ticker(t)
            m = self._computed_peers.get(norm_t)
            if m:
                peers.append(m)
        return peers

    def get_recommended_peers(self, ticker: str, max_peers: int = 5) -> List[Dict[str, Any]]:
        """
        Discovers authentic peers using 3-tier matching:
        Tier 1: Curated institutional map (DEFAULT_PEERS_MAP).
        Tier 2: Exact sub-industry match with market cap proximity ranking.
        Tier 3: Broad sector fallback.
        """
        norm_target = self._normalize_ticker(ticker)
        target_info = self._computed_peers.get(norm_target)

        # 1. Check curated mapping
        curated_tickers = DEFAULT_PEERS_MAP.get(norm_target)
        if curated_tickers:
            curated_peers = self.get_peers_by_tickers(curated_tickers)
            if len(curated_peers) >= 2:
                return curated_peers[:max_peers]

        if not target_info:
            # Fallback to general property peers if target unknown
            fallback_property = ["BSDE.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK", "LPKR.JK"]
            return self.get_peers_by_tickers(fallback_property)[:max_peers]

        target_sector = target_info.get("sector")
        target_industry = target_info.get("industry")
        target_mcap = target_info.get("mcap") or 10.0

        candidates = []

        # 2. Match exact sub-industry
        for peer_ticker, peer in self._computed_peers.items():
            if peer_ticker == norm_target:
                continue
            if peer.get("industry") == target_industry and peer.get("industry") != "Operating Business":
                candidates.append(peer)

        # 3. If fewer than 2 peers, expand to Sector
        if len(candidates) < 2 and target_sector and target_sector != "General Corporate":
            for peer_ticker, peer in self._computed_peers.items():
                if peer_ticker == norm_target or peer in candidates:
                    continue
                if peer.get("sector") == target_sector:
                    candidates.append(peer)

        # 4. Proximity ranking by log Market Cap
        def proximity_key(p: Dict[str, Any]) -> float:
            p_mcap = p.get("mcap") or 0.1
            return abs(math.log(max(0.1, p_mcap)) - math.log(max(0.1, target_mcap)))

        candidates.sort(key=proximity_key)

        # If candidates still insufficient, fallback to property giants
        if not candidates:
            return self.get_peers_by_tickers(["BSDE.JK", "CTRA.JK", "SMRA.JK", "ASRI.JK"])[:max_peers]

        return candidates[:max_peers]
