"""
Pre-caching Utility for Major Non-Financial IDX Equities.
Harmonizes and pre-caches multi-year audited financial statements for high-demand emiten
into data/idx_cache/{TICKER}_2021_2025.json so they load instantly (5ms).
"""

import sys
sys.path.insert(0, ".")
import os
import time
import random
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from src.data.loader import FinancialDataLoader
from src.data.adapters.idx_adapter import IDXAdapter, CACHE_DIR

# Universe of ~110 top non-financial IDX equities across all major sectors
UNIVERSE_NON_FINANCIAL_EMITEN = [
    # Conglomerate, Heavy Equipment & Industrials
    "ASII", "UNTR", "AUTO", "HEXA", "DRMA", "SMSM",
    # Consumer Staples (Food, Beverage, Agribusiness, Tobacco)
    "ICBP", "INDF", "UNVR", "KLBF", "MYOR", "CPIN", "JPFA", "CMRY", 
    "AMRT", "MIDI", "GGRM", "HMSP", "WIIM", "ROTI", "ULTJ", "CLEO", "STTP",
    "AALI", "LSIP", "SIMP", "DSNG", "TAPG", "SSMS", "TBLA",
    # Consumer Discretionary & Retail
    "ACES", "MAPI", "MAPA", "MAPB", "ERAA", "RALS", "LPPF",
    # Telecommunications, Media & Technology
    "TLKM", "ISAT", "EXCL", "TOWR", "TBIG", "MTEL", "GOTO", "BUKA", "MTDL", "EMTK", "SCMA", "MNCN",
    # Energy, Oil & Gas, Coal & Renewables
    "ADRO", "PTBA", "ITMG", "MEDC", "AKRA", "PGAS", "HRUM", "ESSA", "INDY", 
    "BUMI", "DOID", "ENRG", "ELSA", "PGEO", "BREN", "MBMA", "ARKO", "RAJA",
    # Mining & Metals
    "ANTM", "INCO", "MDKA", "TINS", "NCKL", "CITA", "PSAB",
    # Basic Materials, Chemicals, Cement, Pulp & Paper
    "BRPT", "TPIA", "INTP", "SMGR", "INKP", "TKIM", "AVIA", "AMMN", "SMBR",
    # Real Estate, Property & Construction
    "PWON", "BSDE", "CTRA", "SMRA", "ASRI", "SSIA", "DMAS", "DILD", "PTPP", "WIKA", "ADHI", "TOTL",
    # Healthcare, Pharmaceuticals & Hospitals
    "MIKA", "HEAL", "SILO", "TSPC", "PRDA", "SAME", "SIDO",
    # Logistics, Shipping & Transportation
    "BIRD", "SMDR", "ASSA", "TMAS", "PSSI",
    # Infrastructure & Utilities
    "JSMR", "POWR", "KEEN"
]

def cache_one_ticker(ticker: str):
    clean = ticker.upper().strip()
    sym = f"{clean}.JK"
    
    # Check if already cached with valid zero-balance check
    cache_2025 = os.path.join(CACHE_DIR, f"{clean}_2021_2025.json")
    pattern_files = [
        f for f in os.listdir(CACHE_DIR)
        if f.startswith(f"{clean}_") and f.endswith(".json")
    ] if os.path.isdir(CACHE_DIR) else []

    if os.path.isfile(cache_2025) or pattern_files:
        try:
            target = cache_2025 if os.path.isfile(cache_2025) else os.path.join(CACHE_DIR, pattern_files[0])
            with open(target, "r", encoding="utf-8") as f:
                d = json.load(f)
                bs = d.get("historical_statements", {}).get("balance_sheet", [])
                max_chk = max([abs(row.get("balance_check", 0.0)) for row in bs]) if bs else 0.0
                if max_chk <= 0.05:
                    rev = d.get("historical", {}).get("revenue", [0])[-1]
                    price = d.get("current_price", 0)
                    return clean, "CACHED", f"ALREADY CACHED - Rev: {rev:.2f}T, Price: IDR {price:,.0f}"
        except Exception:
            pass  # Re-cache if corrupted or imbalanced

    t0 = time.time()
    try:
        # Polite delay to prevent rate limiting
        time.sleep(random.uniform(0.1, 0.4))
        data = FinancialDataLoader.fetch_harmonized_fallback(sym)
        elapsed = time.time() - t0
        rev = data.get("historical", {}).get("revenue", [0])[-1]
        price = data.get("current_price", 0)
        return clean, "SUCCESS", f"CACHED ({elapsed:.1f}s) - Rev: {rev:.2f}T, Price: IDR {price:,.0f}"
    except Exception as e:
        elapsed = time.time() - t0
        return clean, "FAILED", f"FAILED ({elapsed:.1f}s) - {e}"

def main():
    print(f"============================================================")
    print(f" Starting Batch Pre-Caching for Universe of {len(UNIVERSE_NON_FINANCIAL_EMITEN)} IDX Equities")
    print(f" Target Directory: {CACHE_DIR}")
    print(f"============================================================")

    start_all = time.time()
    counts = {"CACHED": 0, "SUCCESS": 0, "FAILED": 0}

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(cache_one_ticker, t): t for t in UNIVERSE_NON_FINANCIAL_EMITEN}
        for future in as_completed(futures):
            ticker, status, msg = future.result()
            counts[status] += 1
            icon = "[=]" if status == "CACHED" else ("[+]" if status == "SUCCESS" else "[-]")
            print(f"  {icon} {ticker:5s}: {msg}")

    total_time = time.time() - start_all
    print(f"============================================================")
    print(f" Pre-caching Run Complete in {total_time:.1f}s!")
    print(f" Total Available in Cache: {counts['CACHED'] + counts['SUCCESS']}/{len(UNIVERSE_NON_FINANCIAL_EMITEN)}")
    print(f"   - Already Verified & Cached: {counts['CACHED']}")
    print(f"   - Re-Harmonized & Saved: {counts['SUCCESS']}")
    print(f"   - Failures: {counts['FAILED']}")
    print(f"============================================================")

if __name__ == "__main__":
    main()
