"""
MM6026 Digital Business Valuation Application Server.
High-performance asynchronous backend powering the institutional fintech web platform.
Uses Starlette & Uvicorn (zero external node.js or npm dependencies).
"""

import os
import sys
import json
import webbrowser
from typing import Dict, Any

import uvicorn
from starlette.applications import Starlette
from starlette.responses import HTMLResponse, JSONResponse, Response
from starlette.routing import Route, Mount
from starlette.staticfiles import StaticFiles

# Core calculation and rule engines
from src.data.loader import FinancialDataLoader
from src.data.country_data import INDONESIA_MACRO
from src.rules.sanity_checks import ModelSanityChecker
from src.rules.recommendations import ValuationRecommender
from src.models.parameters import CapitalStructureModel
from src.models.pro_forma import ProFormaModel
from src.models.dcf import DCFModel
from src.models.multiples import RelativeValuationModel
from src.models.rim import ResidualIncomeModel
from src.models.scenarios import ScenarioForecaster
from src.models.ensemble import ValuationEnsemble
from src.analytics.audit_trail import ValuationAuditTrail
from src.analytics.sensitivity import SensitivityMatrix
from src.analytics.exporter import ExcelModelExporter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")


async def index(request):
    """Serves the main institutional web frontend."""
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        with open(index_file, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content)
    return HTMLResponse("<h1>Loading Valuation Platform...</h1>")


async def get_company(request):
    """Fetches normalized audited financials and market metrics for a ticker."""
    ticker = request.query_params.get("ticker", "PWON.JK").strip().upper()
    try:
        data = FinancialDataLoader.fetch_company_data(ticker)
        return JSONResponse({"status": "success", "data": data})
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)


async def recalculate(request):
    """
    Executes full multi-stage valuation recalculation:
    WACC -> Pro Forma -> DCF -> Comps -> RIM -> Triangulation -> Audit Proofs.
    """
    try:
        payload = await request.json()
        ticker = payload.get("ticker", "PWON.JK")
        company = FinancialDataLoader.fetch_company_data(ticker)
        hist = company["historical"]
        base_revenue = float(hist["revenue"][-1])
        cash = float(hist.get("cash_and_equivalents", 5.19))
        debt = float(hist.get("total_debt", 5.58))
        mi = float(hist.get("minority_interest", 4.15))
        shares_b = float(company["shares_outstanding"])
        market_price = float(company["current_price"])

        # 1. WACC Parameters
        w_params = payload.get("wacc_params", {})
        rf = float(w_params.get("rf", 6.60)) / 100.0
        beta = float(w_params.get("beta", company.get("beta", 0.75)))
        erp = float(w_params.get("erp", 7.20)) / 100.0
        kd_pre = float(w_params.get("kd_pre", 6.50)) / 100.0
        wd = float(w_params.get("wd", 20.0)) / 100.0
        tax_rate = float(w_params.get("tax_rate", 22.0)) / 100.0

        wacc_res = CapitalStructureModel.calculate_wacc(
            rf=rf, beta=beta, erp=erp, kd_pre=kd_pre, tax_rate=tax_rate, wd=wd
        )
        live_wacc = wacc_res["wacc"]

        # 2. Pro Forma Inputs
        growth_rates = payload.get("growth_rates", ProFormaModel.DEFAULT_GROWTH_RATES)
        margins = payload.get("margins", ProFormaModel.DEFAULT_MARGINS)
        notes = payload.get("notes", ProFormaModel.DEFAULT_NOTES)
        terminal_g = float(payload.get("terminal_g", 1.5)) / 100.0
        capex_pct = float(payload.get("capex_pct", 8.0)) / 100.0
        expansion_capex = float(payload.get("expansion_capex", 0.0))
        nwc_pct = float(payload.get("nwc_pct", 5.0)) / 100.0
        has_tax_holiday = bool(payload.get("has_tax_holiday", False))
        exit_multiple = float(payload.get("exit_multiple", 6.0))

        pf_res = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=growth_rates,
            margins=margins,
            wacc=live_wacc,
            terminal_g=terminal_g,
            tax_rate=tax_rate,
            has_tax_holiday=has_tax_holiday,
            capex_pct=capex_pct,
            expansion_capex_y2=expansion_capex,
            nwc_pct=nwc_pct,
            notes=notes
        )

        # 3. DCF
        dcf_res = DCFModel.calculate_dcf(
            pro_forma_result=pf_res,
            cash=cash,
            debt=debt,
            minority_interest=mi,
            shares_outstanding=shares_b,
            exit_multiple=exit_multiple
        )

        # 4. Comps
        comps_params = payload.get("comps_params", {})
        stat_method = comps_params.get("stat_method", "median")
        filter_outliers = comps_params.get("filter_outliers", True)
        
        comps_res = RelativeValuationModel.calculate_comps(
            target_ebitda=float(pf_res["schedule"].iloc[0]["ebit"] + pf_res["schedule"].iloc[0]["depr"]),
            target_net_income=float(hist.get("net_income", [2.35])[-1]),
            target_equity=float(hist.get("total_equity", [22.47])[-1]),
            shares_outstanding=shares_b,
            cash=cash,
            debt=debt,
            minority_interest=mi,
            stat_method=stat_method,
            filter_outliers=filter_outliers
        )

        # 5. RIM
        rim_res = ResidualIncomeModel.calculate_rim(
            book_value_equity=float(hist.get("total_equity", [22.47])[-1]),
            base_net_income=float(hist.get("net_income", [2.35])[-1]),
            ke=wacc_res["ke"],
            shares_outstanding=shares_b
        )

        # 6. Ensemble Triangulation
        weights = payload.get("method_weights", {})
        w_dcf = float(weights.get("w_dcf", 0.60))
        w_comps = float(weights.get("w_comps", 0.25))
        w_rim = float(weights.get("w_rim", 0.15))
        inc_dcf = bool(weights.get("inc_dcf", True))
        inc_comps = bool(weights.get("inc_comps", True))
        inc_rim = bool(weights.get("inc_rim", True))

        ensemble_res = ValuationEnsemble.calculate_composite_target(
            dcf_price=dcf_res["dcf_price"],
            comps_price=comps_res["comps_target_price"],
            rim_price=rim_res["rim_target_price"],
            weight_dcf=w_dcf,
            weight_comps=w_comps,
            weight_rim=w_rim,
            include_dcf=inc_dcf,
            include_comps=inc_comps,
            include_rim=inc_rim
        )

        # 7. Scenarios
        scenarios_res = ScenarioForecaster.run_scenarios(
            base_revenue=base_revenue,
            base_growth=growth_rates,
            base_margins=margins,
            base_wacc=live_wacc,
            base_terminal_g=terminal_g,
            cash=cash,
            debt=debt,
            minority_interest=mi,
            shares_outstanding=shares_b
        )

        # 8. Recommendation
        recommender_res = ValuationRecommender.evaluate_recommendation(
            current_price=market_price,
            central_target=ensemble_res["composite_target"],
            bear_target=scenarios_res["bear"]["price"],
            bull_target=scenarios_res["bull"]["price"]
        )

        # 9. Sanity Checks
        sanity_checks = ModelSanityChecker.run_all_checks(
            g=terminal_g,
            wacc=live_wacc,
            ev=dcf_res["enterprise_value"],
            cash=cash,
            debt=debt,
            minority_interest=mi,
            equity=dcf_res["equity_value"],
            peer_multiples={"EV/EBITDA": comps_res["benchmark_ev_ebitda"], "P/E": comps_res["benchmark_pe"]}
        )

        # 10. Audit Proofs
        audit_trail = ValuationAuditTrail.generate_full_audit_trail(
            wacc_data=wacc_res,
            dcf_data=dcf_res,
            comps_data=comps_res,
            ensemble_data=ensemble_res
        )

        # 11. Sensitivity Matrix
        sens_df = SensitivityMatrix.calculate_wacc_vs_g_matrix(
            base_wacc=live_wacc,
            base_terminal_g=terminal_g,
            last_fcff=pf_res["y10_fcff"],
            total_pv_explicit=pf_res["total_pv_explicit"],
            cash=cash,
            debt=debt,
            minority_interest=mi,
            shares_outstanding=shares_b
        )

        # Build response JSON
        return JSONResponse({
            "status": "success",
            "company": company,
            "wacc": wacc_res,
            "pro_forma_schedule": pf_res["schedule"].to_dict(orient="records"),
            "dcf": dcf_res,
            "comps": {
                "comps_target_price": comps_res["comps_target_price"],
                "price_ev_ebitda": comps_res["price_ev_ebitda"],
                "price_pe": comps_res["price_pe"],
                "price_pb": comps_res["price_pb"],
                "benchmark_ev_ebitda": comps_res["benchmark_ev_ebitda"],
                "benchmark_pe": comps_res["benchmark_pe"],
                "benchmark_pb": comps_res["benchmark_pb"],
                "peers": comps_res["peers_table"].to_dict(orient="records")
            },
            "rim": rim_res,
            "ensemble": ensemble_res,
            "scenarios": {
                "bear": {"price": scenarios_res["bear"]["price"], "schedule": scenarios_res["bear"]["schedule"].to_dict(orient="records")},
                "base": {"price": scenarios_res["base"]["price"], "schedule": scenarios_res["base"]["schedule"].to_dict(orient="records")},
                "bull": {"price": scenarios_res["bull"]["price"], "schedule": scenarios_res["bull"]["schedule"].to_dict(orient="records")}
            },
            "recommendation": recommender_res,
            "sanity_checks": sanity_checks,
            "audit_trail": audit_trail,
            "sensitivity": {
                "columns": list(sens_df.columns),
                "index": list(sens_df.index),
                "data": sens_df.values.tolist()
            }
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


async def export_excel(request):
    """Streams the formula-active Excel workbook (.xlsx) directly to the browser."""
    try:
        payload = await request.json()
        ticker = payload.get("ticker", "PWON.JK")
        company = FinancialDataLoader.fetch_company_data(ticker)
        hist = company["historical"]
        base_revenue = float(hist["revenue"][-1])
        cash = float(hist.get("cash_and_equivalents", 5.19))
        debt = float(hist.get("total_debt", 5.58))
        mi = float(hist.get("minority_interest", 4.15))
        shares_b = float(company["shares_outstanding"])

        w_params = payload.get("wacc_params", {})
        live_wacc = CapitalStructureModel.calculate_wacc(
            rf=float(w_params.get("rf", 6.60)) / 100.0,
            beta=float(w_params.get("beta", company.get("beta", 0.75))),
            erp=float(w_params.get("erp", 7.20)) / 100.0,
            kd_pre=float(w_params.get("kd_pre", 6.50)) / 100.0,
            tax_rate=float(w_params.get("tax_rate", 22.0)) / 100.0,
            wd=float(w_params.get("wd", 20.0)) / 100.0
        )

        pf_res = ProFormaModel.generate_pro_forma(
            base_revenue=base_revenue,
            growth_rates=payload.get("growth_rates", ProFormaModel.DEFAULT_GROWTH_RATES),
            margins=payload.get("margins", ProFormaModel.DEFAULT_MARGINS),
            wacc=live_wacc["wacc"],
            terminal_g=float(payload.get("terminal_g", 1.5)) / 100.0,
            tax_rate=live_wacc["tax_rate"],
            has_tax_holiday=bool(payload.get("has_tax_holiday", False)),
            capex_pct=float(payload.get("capex_pct", 8.0)) / 100.0,
            nwc_pct=float(payload.get("nwc_pct", 5.0)) / 100.0,
            notes=payload.get("notes", ProFormaModel.DEFAULT_NOTES)
        )

        dcf_res = DCFModel.calculate_dcf(
            pro_forma_result=pf_res,
            cash=cash,
            debt=debt,
            minority_interest=mi,
            shares_outstanding=shares_b
        )

        comps_res = RelativeValuationModel.calculate_comps(
            target_ebitda=float(pf_res["schedule"].iloc[0]["ebit"] + pf_res["schedule"].iloc[0]["depr"]),
            shares_outstanding=shares_b, cash=cash, debt=debt, minority_interest=mi
        )

        ensemble_res = ValuationEnsemble.calculate_composite_target(
            dcf_price=dcf_res["dcf_price"], comps_price=comps_res["comps_target_price"], rim_price=5900.0
        )

        rec_res = ValuationRecommender.evaluate_recommendation(
            current_price=float(company["current_price"]),
            central_target=ensemble_res["composite_target"],
            bear_target=dcf_res["dcf_price"] * 0.85,
            bull_target=dcf_res["dcf_price"] * 1.15
        )

        xlsx_bytes = ExcelModelExporter.export_workbook(
            company_data=company,
            pro_forma_result=pf_res,
            dcf_result=dcf_res,
            comps_result=comps_res,
            ensemble_result=ensemble_res,
            recommender_result=rec_res,
            wacc_data=live_wacc
        )

        filename = f"{ticker}_Valuation_Model_MM6026.xlsx"
        return Response(
            content=xlsx_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


routes = [
    Route("/", endpoint=index, methods=["GET"]),
    Route("/api/company", endpoint=get_company, methods=["GET"]),
    Route("/api/recalculate", endpoint=recalculate, methods=["POST"]),
    Route("/api/export-excel", endpoint=export_excel, methods=["POST"]),
]

app = Starlette(routes=routes)
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


def start_server():
    print("=" * 65)
    print("      MM6026 DIGITAL BUSINESS VALUATION PLATFORM (FINTECH UI)")
    print("=" * 65)
    print("Starting local asynchronous valuation server...")
    print("URL: http://localhost:8000")
    print("Press Ctrl+C to shut down.")
    print("=" * 65)
    
    # Auto-open browser
    try:
        webbrowser.open("http://localhost:8000")
    except Exception:
        pass

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")


if __name__ == "__main__":
    start_server()
