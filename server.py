"""

MM6026 Digital Business Valuation Application Server.

High-performance asynchronous backend powering the institutional fintech web platform.

Uses Starlette & Uvicorn (zero external node.js or npm dependencies).

"""



import os
import math

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

from src.data.loader import FinancialDataLoader, UnsupportedFinancialInstitutionError

from src.data.adapters.idx_scraper.proforma.dispatcher import is_banking_or_financial, RECOMMENDED_NON_FINANCIAL_ALTERNATIVES

from src.data.country_data import INDONESIA_MACRO

from src.data.coverage import COVERAGE_UNIVERSE
from src.data.peers import PeerUniverseService
from src.data.news_service import InstitutionalNewsService

from src.rules.sanity_checks import ModelSanityChecker

from src.rules.recommendations import ValuationRecommender

from src.models.parameters import CapitalStructureModel

from src.models.pro_forma import ProFormaModel

from src.models.dcf import DCFModel

from src.models.multiples import RelativeValuationModel

from src.models.rim import ResidualIncomeModel

from src.models.ddm import DividendDiscountModel

from src.models.rnav import RNAVModel

from src.models.monte_carlo import MonteCarloEngine

from src.models.eva import EVAModel

from src.models.scenarios import ScenarioForecaster

from src.models.ensemble import ValuationEnsemble

from src.models.three_statement import ThreeStatementModel

from src.analytics.audit_trail import ValuationAuditTrail

from src.analytics.sensitivity import SensitivityMatrix

from src.analytics.tornado import TornadoEngine

from src.analytics.dupont import DuPontEngine

from src.analytics.exporter import ExcelModelExporter



BASE_DIR = os.path.dirname(os.path.abspath(__file__))

STATIC_DIR = os.path.join(BASE_DIR, "static")
news_service = InstitutionalNewsService()





async def index(request):

    """Serves the main institutional web frontend."""

    index_file = os.path.join(STATIC_DIR, "index.html")

    if os.path.exists(index_file):

        with open(index_file, "r", encoding="utf-8") as f:

            content = f.read()

        return HTMLResponse(content, headers={"Cache-Control": "no-cache, no-store, must-revalidate"})

    return HTMLResponse("<h1>Loading Valuation Platform...</h1>")





async def get_company(request):

    """Fetches normalized audited financials and market metrics for a ticker."""

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
        try:
            svc = PeerUniverseService.get_instance()
            data["comps"] = svc.get_recommended_peers(ticker)
            data["universe_catalog"] = svc.get_universe_catalog()
        except Exception:
            pass

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

        return JSONResponse({"status": "error", "message": str(e)}, status_code=400)





async def get_coverage(request):

    """Returns the pre-configured coverage universe for Indonesian property equities and conglomerates."""

    return JSONResponse({"status": "success", "data": COVERAGE_UNIVERSE})


async def get_peers(request):
    """Returns recommended authentic peers and universe catalog for a given ticker."""
    ticker = request.query_params.get("ticker", "PWON.JK").strip().upper()
    try:
        svc = PeerUniverseService.get_instance()
        rec_peers = svc.get_recommended_peers(ticker)
        catalog = svc.get_universe_catalog()
        return JSONResponse({
            "status": "success",
            "ticker": ticker,
            "recommended_peers": rec_peers,
            "universe_catalog": catalog
        })
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def recalculate(request):

    """

    Executes full multi-stage valuation recalculation:

    WACC -> Pro Forma -> DCF -> Comps -> RIM -> Triangulation -> Audit Proofs.

    """

    try:

        payload = await request.json()

        ticker = payload.get("ticker", "PWON.JK")

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

            }, status_code=400)

        source = payload.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company["historical"]

        base_revenue = float(hist["revenue"][-1])

        cash = float(hist.get("cash_and_equivalents", 9.20))

        debt = float(hist.get("total_debt", 6.44))

        mi = float(hist.get("minority_interest", 4.77))

        trailing_ebitda = float(hist.get("ebitda", [3.38])[-1])

        shares_b = float(company["shares_outstanding"])

        market_price = float(company["current_price"])



        # 1. WACC Parameters

        w_params = payload.get("wacc_params", {})

        rf = float(w_params.get("rf", 6.60)) / 100.0

        beta = float(w_params.get("beta", company.get("beta", 0.75)))

        mature_erp = float(w_params.get("mature_erp", 5.00)) / 100.0

        crp = float(w_params.get("crp", 2.16)) / 100.0

        erp_val = float(w_params["erp"]) / 100.0 if "erp" in w_params and w_params["erp"] is not None else None

        kd_pre = float(w_params.get("kd_pre", 6.50)) / 100.0

        wd = float(w_params.get("wd", 20.0)) / 100.0

        tax_rate = float(w_params.get("tax_rate", 22.0)) / 100.0



        wacc_res = CapitalStructureModel.calculate_wacc(

            rf=rf, beta=beta, erp=erp_val, mature_erp=mature_erp, crp=crp, kd_pre=kd_pre, tax_rate=tax_rate, wd=wd

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
        user_peers = comps_params.get("peers")

        

        comps_res = RelativeValuationModel.calculate_comps(

            peers_data=payload.get("comps_params", {}).get("peers"),
            ticker=ticker,
            target_ebitda=float(pf_res["schedule"].iloc[0]["ebit"] + pf_res["schedule"].iloc[0]["depr"]),

            target_net_income=float(hist.get("net_income", [2.42])[-1]),

            target_equity=float(hist.get("total_equity", [24.74])[-1]),

            shares_outstanding=shares_b,

            cash=cash,

            debt=debt,

            minority_interest=mi,

            stat_method=stat_method,

            filter_outliers=filter_outliers

        )



        # 5. RIM

        rim_res = ResidualIncomeModel.calculate_rim(

            book_value_equity=float(hist.get("total_equity", [24.74])[-1]),

            base_net_income=float(hist.get("net_income", [2.42])[-1]),

            ke=wacc_res["ke"],

            shares_outstanding=shares_b

        )



        # 6. DDM (Dividend Discount Model)

        ddm_params = payload.get("ddm_params", {})

        payout_ratio = float(ddm_params.get("payout_ratio", 35.0)) / 100.0

        ddm_res = DividendDiscountModel.calculate_ddm(

            base_net_income=float(hist.get("net_income", [2.42])[-1]),

            shares_outstanding=shares_b,

            ke=wacc_res["ke"],

            growth_rates=growth_rates,

            terminal_g=terminal_g,

            payout_ratio=payout_ratio

        )



        # 7. Ensemble Triangulation

        weights = payload.get("method_weights", {})

        w_dcf = float(weights.get("w_dcf", 0.50))

        w_comps = float(weights.get("w_comps", 0.25))

        w_rim = float(weights.get("w_rim", 0.15))

        w_ddm = float(weights.get("w_ddm", 0.10))

        inc_dcf = bool(weights.get("inc_dcf", True))

        inc_comps = bool(weights.get("inc_comps", True))

        inc_rim = bool(weights.get("inc_rim", True))

        inc_ddm = bool(weights.get("inc_ddm", True))



        ensemble_res = ValuationEnsemble.calculate_composite_target(

            dcf_price=dcf_res["dcf_price"],

            comps_price=comps_res["comps_target_price"],

            rim_price=rim_res["rim_target_price"],

            ddm_price=ddm_res["ddm_price"],

            weight_dcf=w_dcf,

            weight_comps=w_comps,

            weight_rim=w_rim,

            weight_ddm=w_ddm,

            include_dcf=inc_dcf,

            include_comps=inc_comps,

            include_rim=inc_rim,

            include_ddm=inc_ddm

        )



        # 8. Scenarios

        scenarios_res = ScenarioForecaster.run_scenarios(

            base_revenue=base_revenue,

            base_growth=growth_rates,

            base_margins=margins,

            base_wacc=live_wacc,

            base_terminal_g=terminal_g,

            cash=cash,

            debt=debt,

            minority_interest=mi,

            shares_outstanding=shares_b,

            tax_rate=tax_rate,

            has_tax_holiday=has_tax_holiday,

            capex_pct=capex_pct,

            nwc_pct=nwc_pct,

            exit_multiple=exit_multiple

        )



        # 9. Recommendation

        recommender_res = ValuationRecommender.evaluate_recommendation(

            current_price=market_price,

            central_target=ensemble_res["composite_target"],

            bear_target=scenarios_res["bear"]["price"],

            bull_target=scenarios_res["bull"]["price"]

        )



        # 10. Sanity Checks

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



        # 11. Audit Proofs

        audit_trail = ValuationAuditTrail.generate_full_audit_trail(

            wacc_data=wacc_res,

            dcf_data=dcf_res,

            comps_data=comps_res,

            ensemble_data=ensemble_res,

            ddm_data=ddm_res

        )



        # 12. Sensitivity Matrix

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



        # 13. Integrated 3-Statement Model

        # Ingest authentic audited statement baseline from official IDX filings

        hist_bs_list = company.get("historical_statements", {}).get("balance_sheet", [])

        hist_is_list = company.get("historical_statements", {}).get("income_statement", [])

        hist_drv_list = company.get("historical_statements", {}).get("drivers", [])



        if hist_bs_list and hist_is_list:

            lat_bs = hist_bs_list[-1]

            lat_is = hist_is_list[-1]

            lat_drv = hist_drv_list[-1] if hist_drv_list else {}



            tot_eq_val = float(lat_bs.get("total_equity", 0.0))

            sh_cap = float(lat_bs.get("share_capital", 0.0))

            ret_earn = float(lat_bs.get("retained_earnings", 0.0))

            min_int = float(lat_bs.get("minority_interest", 0.0))

            other_eq = float(lat_bs.get("other_equity", max(0.0, round(tot_eq_val - sh_cap - ret_earn - min_int, 4))))



            company_actuals = {

                # Income Statement

                "revenue": float(lat_is.get("revenue", base_revenue)),

                "cogs": float(lat_is.get("cogs", base_revenue * 0.446)),

                "gross_profit": float(lat_is.get("gross_profit", base_revenue - float(lat_is.get("cogs", 0.0)))),

                "sga": float(lat_is.get("sga", 0.0)),

                "ebit": float(lat_is.get("ebit", hist.get("ebit", [base_revenue * 0.35])[-1])),

                "interest_expense": float(lat_is.get("finance_costs") or debt * 0.065),

                "interest_income": float(lat_is.get("finance_income") or cash * 0.040),

                "ebt": float(lat_is.get("ebt") or lat_is.get("ebit", 0.0)),

                "tax": float(lat_is.get("tax") or max(0.0, float(lat_is.get("ebt", 0.0)) * tax_rate)),

                "net_income": float(lat_is.get("net_income", hist.get("net_income", [2.35])[-1])),

                # Balance Sheet - Assets

                "cash": float(lat_bs.get("cash", cash)),

                "ar": float(lat_bs.get("ar", 0.0)),

                "inventory": float(lat_bs.get("inventory", 0.0)),

                "other_current_assets": float(lat_bs.get("other_current_assets", 0.0)),

                "total_current_assets": float(lat_bs.get("total_current_assets", 0.0)),

                "net_ppe": float(lat_bs.get("net_ppe", 0.0)),

                "other_non_current_assets": float(lat_bs.get("other_non_current_assets", 0.0)),

                "total_non_current_assets": float(lat_bs.get("total_non_current_assets", 0.0)),

                "total_assets": float(lat_bs.get("total_assets", 0.0)),

                # Balance Sheet - Liabilities

                "ap": float(lat_bs.get("ap", 0.0)),

                "short_term_debt": float(lat_bs.get("short_term_debt", 0.0)),

                "other_current_liabilities": float(lat_bs.get("other_current_liabilities", 0.0)),

                "total_current_liabilities": float(lat_bs.get("total_current_liabilities", 0.0)),

                "long_term_debt": float(lat_bs.get("long_term_debt", debt)),

                "total_debt": float(lat_bs.get("total_debt", debt)),

                "other_non_current_liabilities": float(lat_bs.get("other_non_current_liabilities", 0.0)),

                "total_non_current_liabilities": float(lat_bs.get("total_non_current_liabilities", 0.0)),

                "total_liabilities": float(lat_bs.get("total_liabilities", 0.0)),

                # Balance Sheet - Equity

                "share_capital": sh_cap,

                "retained_earnings": ret_earn,

                "other_equity": other_eq,

                "minority_interest": min_int,

                "total_equity": tot_eq_val,

                "total_liabilities_equity": float(lat_bs.get("total_liabilities_equity", lat_bs.get("total_assets", 0.0))),

                # Operating Drivers

                "dso_days": float(lat_drv.get("dso_days") or 15.0),

                "dio_days": float(lat_drv.get("dio_days") or 30.0),

                "dpo_days": float(lat_drv.get("dpo_days") or 30.0),

                "depr_rate_ppe": float(lat_is.get("depr", 0.0)) / max(0.5, float(lat_bs.get("net_ppe", 1.0))) if float(lat_bs.get("net_ppe", 0.0)) > 0 else 0.10,

                "effective_tax_rate": tax_rate,

                "dividend_payout_ratio": payout_ratio

            }

        elif ticker == "PWON.JK":

            company_actuals = ThreeStatementModel.BASE_2025_ACTUALS.copy()

        else:

            company_actuals = ThreeStatementModel.BASE_2025_ACTUALS.copy()

            company_actuals["revenue"] = base_revenue

            company_actuals["cash"] = cash

            company_actuals["total_debt"] = debt



        three_stmt_res = ThreeStatementModel.generate_three_statements(

            base_actuals=company_actuals,

            growth_rates=growth_rates,

            margins=margins,

            tax_rate=tax_rate,

            dividend_payout=payout_ratio,

            capex_pct=capex_pct,

            nwc_pct=nwc_pct,

            dso_days=company_actuals.get("dso_days"),

            dio_days=company_actuals.get("dio_days"),

            dpo_days=company_actuals.get("dpo_days")

        )

        bs_df = three_stmt_res["balance_sheet"]

        is_balanced = bool((bs_df["balance_check"].abs() < 0.05).all())



        # Build response JSON

        ddm_out = {

            "ddm_price": ddm_res["ddm_price"],

            "base_eps": ddm_res["base_eps"],

            "base_dps": ddm_res["base_dps"],

            "total_pv_dividends": ddm_res["total_pv_dividends"],

            "terminal_value": ddm_res["terminal_value"],

            "pv_terminal_value": ddm_res["pv_terminal_value"],

            "payout_ratio": ddm_res["payout_ratio"],

            "proofs": ddm_res["proofs"],

            "schedule": ddm_res["schedule"].to_dict(orient="records")

        }



        # 14. Advanced Institutional Valuation & Risk Analytics (Option A)

        m0 = margins[0] if margins else 0.50

        eff_m0 = (m0 / 100.0) if m0 > 1.0 else m0

        audited_ic = (float(hist.get("total_equity", [24.74])[-1]) + debt - cash) * 1000.0

        rnav_res = RNAVModel.calculate_rnav(

            shares_outstanding=shares_b,

            cash_and_equivalents=cash * 1000.0,

            total_debt=debt * 1000.0,

            other_liabilities=mi * 1000.0

        )

        monte_carlo_res = MonteCarloEngine.run_simulation(

            base_revenue=base_revenue * 1000.0,

            shares_outstanding=shares_b,

            net_debt=(debt - cash) * 1000.0,

            mean_wacc=live_wacc,

            mean_terminal_g=terminal_g,

            mean_ebitda_margin=eff_m0,

            current_market_price=float(company.get("current_price", 280.0)),

            num_simulations=int(payload.get("monte_carlo_runs", 10000))

        )

        eva_res = EVAModel.calculate_eva(

            base_revenue=base_revenue * 1000.0,

            ebitda_margin=eff_m0,

            wacc=live_wacc,

            initial_invested_capital=audited_ic,

            shares_outstanding=shares_b,

            net_debt=(debt - cash) * 1000.0,

            current_market_price=float(company.get("current_price", 280.0))

        )

        tornado_res = TornadoEngine.calculate_tornado(

            base_revenue=base_revenue * 1000.0,

            base_wacc=live_wacc,

            base_terminal_g=terminal_g,

            base_ebitda_margin=eff_m0,

            shares_outstanding=shares_b,

            net_debt=(debt - cash) * 1000.0

        )

        dupont_res = DuPontEngine.calculate_5stage(

            revenue=base_revenue * 1000.0,

            ebit=float(hist.get("ebit", [2.90])[-1]) * 1000.0,

            ebt=float(hist.get("ebit", [2.90])[-1]) * 0.841 * 1000.0,

            net_income=float(hist.get("net_income", [2.42])[-1]) * 1000.0,

            total_assets=float(hist.get("total_assets", [34.61])[-1]) * 1000.0,

            total_equity=float(hist.get("total_equity", [24.74])[-1]) * 1000.0,

            ticker=ticker

        )



        return JSONResponse({

            "status": "success",

            "company": company,

            "wacc": wacc_res,

            "pro_forma_schedule": pf_res["schedule"].to_dict(orient="records"),

            "three_statement": {

                "income_statement": three_stmt_res["income_statement"].to_dict(orient="records"),

                "balance_sheet": bs_df.to_dict(orient="records"),

                "cash_flow": three_stmt_res["cash_flow_statement"].to_dict(orient="records"),

                "is_balanced": is_balanced,

                "historical": {
                    **company.get("historical_statements", {}),
                    "source": company.get("source", "IDX Official XBRL (idx.co.id)")
                }

            },

            "dcf": dcf_res,

            "comps": {

                "comps_target_price": comps_res["comps_target_price"],

                "price_ev_ebitda": comps_res["price_ev_ebitda"],

                "price_pe": comps_res["price_pe"],

                "price_pb": comps_res["price_pb"],

                "benchmark_ev_ebitda": comps_res["benchmark_ev_ebitda"],

                "benchmark_pe": comps_res["benchmark_pe"],

                "benchmark_pb": comps_res["benchmark_pb"],

                "peers": [
                    {k: (None if (isinstance(v, float) and (math.isnan(v) or math.isinf(v))) else v) for k, v in row.items()}
                    for row in (comps_res["peers_table"].to_dict(orient="records") if hasattr(comps_res["peers_table"], "to_dict") else comps_res["peers_table"])
                ]

            },

            "rim": rim_res,

            "ddm": ddm_out,

            "rnav": rnav_res,

            "monte_carlo": monte_carlo_res,

            "eva": eva_res,

            "tornado": tornado_res,

            "dupont": dupont_res,

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

        source = payload.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company["historical"]

        base_revenue = float(hist["revenue"][-1])

        cash = float(hist.get("cash_and_equivalents", 9.20))

        debt = float(hist.get("total_debt", 6.44))

        mi = float(hist.get("minority_interest", 4.77))

        shares_b = float(company["shares_outstanding"])



        w_params = payload.get("wacc_params", {})

        mature_erp = float(w_params.get("mature_erp", 5.00)) / 100.0

        crp = float(w_params.get("crp", 2.16)) / 100.0

        erp_val = float(w_params["erp"]) / 100.0 if "erp" in w_params and w_params["erp"] is not None else None

        live_wacc = CapitalStructureModel.calculate_wacc(

            rf=float(w_params.get("rf", 6.60)) / 100.0,

            beta=float(w_params.get("beta", company.get("beta", 0.75))),

            erp=erp_val,

            mature_erp=mature_erp,

            crp=crp,

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

            peers_data=payload.get("comps_params", {}).get("peers"),
            ticker=ticker,
            target_ebitda=float(pf_res["schedule"].iloc[0]["ebit"] + pf_res["schedule"].iloc[0]["depr"]),

            shares_outstanding=shares_b, cash=cash, debt=debt, minority_interest=mi

        )



        payout_ratio = float(payload.get("payout_ratio", 35.0)) / 100.0 if "payout_ratio" in payload else 0.35

        ddm_res = DividendDiscountModel.calculate_ddm(

            base_net_income=float(hist.get("net_income", [2.42])[-1]),

            shares_outstanding=shares_b,

            ke=live_wacc["ke"],

            growth_rates=pf_res["schedule"]["growth_pct"].tolist(),

            terminal_g=float(payload.get("terminal_g", 1.5)) / 100.0,

            payout_ratio=payout_ratio

        )



        ensemble_res = ValuationEnsemble.calculate_composite_target(

            dcf_price=dcf_res["dcf_price"],

            comps_price=comps_res["comps_target_price"],

            rim_price=dcf_res["dcf_price"] * 0.92,

            ddm_price=ddm_res["ddm_price"]

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

            wacc_data=live_wacc,

            ddm_result=ddm_res

        )



        filename = f"{ticker}_Valuation_Model_MM6026.xlsx"

        return Response(

            content=xlsx_bytes,

            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

            headers={"Content-Disposition": f'attachment; filename="{filename}"'}

        )

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_rnav(request):

    """Calculates Revalued Net Asset Value (RNAV) for property equities."""

    try:

        if request.method == "POST":

            payload = await request.json()

        else:

            payload = dict(request.query_params)

        ticker = payload.get("ticker", "PWON.JK")

        source = payload.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company.get("historical", {})

        cash = float(hist.get("cash_and_equivalents", 9.20)) * 1000.0

        debt = float(hist.get("total_debt", 6.44)) * 1000.0

        shares = float(company.get("shares_outstanding", 48.16))

        res = RNAVModel.calculate_rnav(

            investment_properties_noi=float(payload.get("noi", 2450.0)),

            cap_rate=float(payload.get("cap_rate", 0.08)),

            land_bank_hectares=float(payload.get("hectares", 285.0)),

            cash_and_equivalents=cash,

            total_debt=debt,

            shares_outstanding=shares,

            target_nav_discount=float(payload.get("discount", 0.25))

        )

        return JSONResponse({"status": "success", "data": res})

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_monte_carlo(request):

    """Executes 10,000-run Monte Carlo DCF simulation with probabilistic confidence intervals."""

    try:

        if request.method == "POST":

            payload = await request.json()

        else:

            payload = dict(request.query_params)

        runs = int(payload.get("num_simulations", 10000))

        res = MonteCarloEngine.run_simulation(num_simulations=runs)

        return JSONResponse({"status": "success", "data": res})

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_eva(request):

    """Calculates Stern Stewart Economic Value Added (EVA) and Market Value Added (MVA)."""

    try:

        if request.method == "POST":

            payload = await request.json()

        else:

            payload = dict(request.query_params)

        ticker = payload.get("ticker", "PWON.JK")

        source = payload.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company.get("historical", {})

        rev = float(hist.get("revenue", [6.67])[-1]) * 1000.0

        cash = float(hist.get("cash_and_equivalents", 9.20)) * 1000.0

        debt = float(hist.get("total_debt", 6.44)) * 1000.0

        shares = float(company.get("shares_outstanding", 48.16))

        price = float(company.get("current_price", 280.0))

        res = EVAModel.calculate_eva(

            base_revenue=rev,

            net_debt=debt - cash,

            shares_outstanding=shares,

            current_market_price=price

        )

        return JSONResponse({"status": "success", "data": res})

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_tornado(request):

    """Calculates two-sided valuation sensitivities sorted by swing in Tornado diagram format."""

    try:

        if request.method == "POST":

            payload = await request.json()

        else:

            payload = dict(request.query_params)

        ticker = payload.get("ticker", "PWON.JK")

        source = payload.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company.get("historical", {})

        rev = float(hist.get("revenue", [6.67])[-1]) * 1000.0

        cash = float(hist.get("cash_and_equivalents", 9.20)) * 1000.0

        debt = float(hist.get("total_debt", 6.44)) * 1000.0

        shares = float(company.get("shares_outstanding", 48.16))

        res = TornadoEngine.calculate_tornado(

            base_revenue=rev,

            net_debt=debt - cash,

            shares_outstanding=shares

        )

        return JSONResponse({"status": "success", "data": res})

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_dupont(request):

    """Decomposes ROE into 5 institutional stages with property peer benchmarking."""

    try:

        ticker = request.query_params.get("ticker", "ASII.JK")

        source = request.query_params.get("source", "idx")

        company = FinancialDataLoader.fetch_company_data(ticker, source=source)

        hist = company.get("historical", {})

        rev = float(hist.get("revenue", [6.67])[-1]) * 1000.0

        ebit = float(hist.get("ebit", [2.90])[-1]) * 1000.0

        ebt = ebit * 0.841

        ni = float(hist.get("net_income", [2.42])[-1]) * 1000.0

        assets = float(hist.get("total_assets", [34.61])[-1]) * 1000.0

        equity = float(hist.get("total_equity", [24.74])[-1]) * 1000.0

        res = DuPontEngine.calculate_5stage(

            revenue=rev,

            ebit=ebit,

            ebt=ebt,

            net_income=ni,

            total_assets=assets,

            total_equity=equity,

            ticker=ticker

        )

        return JSONResponse({"status": "success", "data": res})

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)





async def get_wacc(request):

    """Calculates granular fundamental CAPM WACC and returns step-by-step LaTeX proofs."""

    try:

        params = {}

        if request.method == "POST":

            params = await request.json()

        else:

            params = dict(request.query_params)

        

        rf = float(params.get("rf", 6.60)) / 100.0

        beta = float(params.get("beta", 0.75))

        mature_erp = float(params.get("mature_erp", 5.00)) / 100.0

        crp = float(params.get("crp", 2.16)) / 100.0

        erp_val = float(params["erp"]) / 100.0 if "erp" in params and params["erp"] is not None else None

        kd_pre = float(params.get("kd_pre", 6.50)) / 100.0

        wd = float(params.get("wd", 20.0)) / 100.0

        tax_rate = float(params.get("tax_rate", 22.0)) / 100.0



        res = CapitalStructureModel.calculate_wacc(

            rf=rf, beta=beta, erp=erp_val, mature_erp=mature_erp, crp=crp, kd_pre=kd_pre, tax_rate=tax_rate, wd=wd

        )

        return JSONResponse({

            "status": "success",

            "data": res,

            "provenance": INDONESIA_MACRO.get("provenance", {})

        })

    except Exception as e:

        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)







async def get_live_news(request):
    """Serves real-time live Indonesian macroeconomic and IHSG news wire."""
    try:
        force = request.query_params.get("refresh", "false").lower() == "true"
        headlines = news_service.fetch_macro_headlines(limit=10, force_refresh=force)
        return JSONResponse({
            "status": "success",
            "count": len(headlines),
            "data": headlines
        })
    except Exception as e:
        return JSONResponse({"status": "error", "message": str(e)}, status_code=500)


routes = [

    Route("/", endpoint=index, methods=["GET"]),

    Route("/api/coverage", endpoint=get_coverage, methods=["GET"]),
    Route("/api/peers", endpoint=get_peers, methods=["GET"]),

    Route("/api/company", endpoint=get_company, methods=["GET"]),

    Route("/api/recalculate", endpoint=recalculate, methods=["POST"]),

    Route("/api/export-excel", endpoint=export_excel, methods=["POST"]),

    Route("/api/rnav", endpoint=get_rnav, methods=["GET", "POST"]),

    Route("/api/monte-carlo", endpoint=get_monte_carlo, methods=["GET", "POST"]),

    Route("/api/eva", endpoint=get_eva, methods=["GET", "POST"]),

    Route("/api/tornado", endpoint=get_tornado, methods=["GET", "POST"]),

    Route("/api/dupont", endpoint=get_dupont, methods=["GET"]),

    Route("/api/wacc", endpoint=get_wacc, methods=["GET", "POST"]),
    Route("/api/news", endpoint=get_live_news, methods=["GET"]),

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

