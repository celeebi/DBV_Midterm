import os

server_path = os.path.join("server.py")
with open(server_path, "r", encoding="utf-8") as f:
    text = f.read()

# Add import if needed
if "from src.data.adapters.idx_scraper.proforma.dispatcher import is_banking_or_financial, RECOMMENDED_NON_FINANCIAL_ALTERNATIVES" not in text:
    text = text.replace(
        "from src.data.loader import FinancialDataLoader",
        "from src.data.loader import FinancialDataLoader, UnsupportedFinancialInstitutionError\nfrom src.data.adapters.idx_scraper.proforma.dispatcher import is_banking_or_financial, RECOMMENDED_NON_FINANCIAL_ALTERNATIVES"
    )

old_get_company = """async def get_company(request):
    \"\"\"Fetches normalized audited financials and market metrics for a ticker.\"\"\"
    ticker = request.query_params.get("ticker", "PWON.JK").strip().upper()
    source = request.query_params.get("source", "idx").strip().lower()
    try:
        data = FinancialDataLoader.fetch_company_data(ticker, source=source)
        return JSONResponse({"status": "success", "data": data})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)"""

new_get_company = """async def get_company(request):
    \"\"\"Fetches normalized audited financials and market metrics for a ticker.\"\"\"
    ticker = request.query_params.get("ticker", "ASII.JK").strip().upper()
    source = request.query_params.get("source", "idx").strip().lower()
    
    clean_sym = ticker.replace(".JK", "").strip()
    if is_banking_or_financial(clean_sym):
        return JSONResponse({
            "status": "error",
            "error_type": "banking_unsupported",
            "message": (
                f"Methodology Scope Limitation: {ticker} is a commercial bank or financial institution. "
                "Financial institutions operate with customer deposits as inventory and interest as COGS, "
                "requiring Asset-Liability Management (ALM) modeling and Basel III / OJK regulatory capital constraints. "
                "Top-down corporate valuation models (EBITDA, FCFF, 3-Statement articulation) strictly require non-financial enterprises."
            ),
            "ticker": ticker,
            "recommended_alternatives": RECOMMENDED_NON_FINANCIAL_ALTERNATIVES
        }, status_code=400)
        
    try:
        data = FinancialDataLoader.fetch_company_data(ticker, source=source)
        return JSONResponse({"status": "success", "data": data})
    except UnsupportedFinancialInstitutionError as e:
        return JSONResponse({
            "status": "error",
            "error_type": "banking_unsupported",
            "message": str(e),
            "ticker": ticker,
            "recommended_alternatives": RECOMMENDED_NON_FINANCIAL_ALTERNATIVES
        }, status_code=400)
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)"""

old_recalculate_top = """async def recalculate(request):
    \"\"\"
    Executes full multi-stage valuation recalculation:
    WACC -> Pro Forma -> DCF -> Comps -> RIM -> Triangulation -> Audit Proofs.
    \"\"\"
    try:
        payload = await request.json()
        ticker = payload.get("ticker", "PWON.JK")"""

new_recalculate_top = """async def recalculate(request):
    \"\"\"
    Executes full multi-stage valuation recalculation:
    WACC -> Pro Forma -> DCF -> Comps -> RIM -> Triangulation -> Audit Proofs.
    \"\"\"
    try:
        payload = await request.json()
        ticker = payload.get("ticker", "ASII.JK")
        clean_sym = ticker.replace(".JK", "").strip().upper()
        if is_banking_or_financial(clean_sym):
            return JSONResponse({
                "status": "error",
                "error_type": "banking_unsupported",
                "message": (
                    f"Methodology Scope Limitation: {ticker} is a commercial bank or financial institution. "
                    "Financial institutions require Asset-Liability Management (ALM) modeling and are outside "
                    "the non-financial corporate finance scope of this platform."
                ),
                "ticker": ticker,
                "recommended_alternatives": RECOMMENDED_NON_FINANCIAL_ALTERNATIVES
            }, status_code=400)"""

text_norm = text.replace("\r\n", "\n")
old_get_company_norm = old_get_company.replace("\r\n", "\n")
new_get_company_norm = new_get_company.replace("\r\n", "\n")
old_recalculate_top_norm = old_recalculate_top.replace("\r\n", "\n")
new_recalculate_top_norm = new_recalculate_top.replace("\r\n", "\n")

if old_get_company_norm in text_norm:
    text_norm = text_norm.replace(old_get_company_norm, new_get_company_norm, 1)
    print("[+] Updated get_company in server.py")
else:
    print("[!] old_get_company not found in server.py")

if old_recalculate_top_norm in text_norm:
    text_norm = text_norm.replace(old_recalculate_top_norm, new_recalculate_top_norm, 1)
    print("[+] Updated recalculate top in server.py")
else:
    print("[!] old_recalculate_top not found in server.py")

with open(server_path, "w", encoding="utf-8") as f:
    f.write(text_norm.replace("\n", "\r\n"))

print("[OK] server.py patched successfully")
