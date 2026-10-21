"""
Revalued Net Asset Value (RNAV) Valuation Model.
Institutional valuation methodology specialized for real estate developers, REITs, 
and asset-heavy asset holders.

Revalues operating investment properties (commercial malls, prime office towers, hotels)
at prevailing capitalization rates, revalues strategic raw land banks at mark-to-market IDR/sqm,
incorporates discounted margin on unbilled contracted presales, reconciles net debt, and
applies institutional conglomerate/liquidity discounts to determine target price per share.
"""

from typing import Dict, List, Any, Optional


class RNAVModel:
    """Institutional Revalued Net Asset Value (RNAV) Engine."""

    DEFAULT_PROPERTY_PORTFOLIO = [
        {"name": "Kota Kasablanka Complex (Retail & Office)", "noi": 850.0, "cap_rate": 0.078, "city": "Jakarta Selatan"},
        {"name": "Gandaria City Retail Mall & Tower", "noi": 620.0, "cap_rate": 0.080, "city": "Jakarta Selatan"},
        {"name": "Tunjungan Plaza 1-6 Superblock", "noi": 580.0, "cap_rate": 0.082, "city": "Surabaya"},
        {"name": "Pakuwon Mall & PTC Superblock", "noi": 400.0, "cap_rate": 0.085, "city": "Surabaya Barat"},
    ]

    DEFAULT_LAND_BANK = [
        {"location": "Pakuwon City (East Surabaya)", "hectares": 120.0, "market_idr_sqm": 7500000},
        {"location": "Grand Pakuwon (West Surabaya)", "hectares": 95.0, "market_idr_sqm": 5000000},
        {"location": "Bekasi & Central Java Land Reserves", "hectares": 70.0, "market_idr_sqm": 3500000},
    ]

    @staticmethod
    def calculate_rnav(
        investment_properties_noi: Optional[float] = None,
        cap_rate: float = 0.080,
        land_bank_hectares: Optional[float] = None,
        land_market_price_per_sqm: float = 5500000.0,
        unbilled_presales: float = 1850.0,
        presales_ebit_margin: float = 0.35,
        cash_and_equivalents: float = 5190.0,
        total_debt: float = 5580.0,
        other_liabilities: float = 2100.0,
        shares_outstanding: float = 48.16,
        target_nav_discount: float = 0.25,
        portfolio_assets: Optional[List[Dict[str, Any]]] = None,
        land_assets: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Calculates the comprehensive RNAV for a property company.

        All currency amounts are denominated in IDR Billions unless explicitly specified.
        Shares outstanding is denominated in Billions.
        """
        # 1. Revalued Investment Properties
        if portfolio_assets:
            properties_detail = []
            revalued_properties_val = 0.0
            total_noi = 0.0
            for item in portfolio_assets:
                noi = float(item.get("noi", 0.0))
                c_rate = float(item.get("cap_rate", cap_rate))
                asset_val = (noi / c_rate) if c_rate > 0 else 0.0
                total_noi += noi
                revalued_properties_val += asset_val
                properties_detail.append({
                    "name": item.get("name", "Asset"),
                    "city": item.get("city", "Indonesia"),
                    "noi": round(noi, 2),
                    "cap_rate": round(c_rate, 4),
                    "gross_asset_value": round(asset_val, 2)
                })
        else:
            eff_noi = investment_properties_noi if investment_properties_noi is not None else 2450.0
            revalued_properties_val = (eff_noi / cap_rate) if cap_rate > 0 else 0.0
            total_noi = eff_noi
            properties_detail = [{
                "name": "Consolidated Commercial Investment Portfolio",
                "city": "Tier-1 Metro",
                "noi": round(eff_noi, 2),
                "cap_rate": round(cap_rate, 4),
                "gross_asset_value": round(revalued_properties_val, 2)
            }]

        # 2. Land Bank Mark-to-Market Valuation
        if land_assets:
            land_detail = []
            revalued_land_bank_val = 0.0
            total_hectares = 0.0
            for l in land_assets:
                ha = float(l.get("hectares", 0.0))
                sqm = ha * 10000.0
                price_sqm = float(l.get("market_idr_sqm", land_market_price_per_sqm))
                val_billion = (sqm * price_sqm) / 1e9
                total_hectares += ha
                revalued_land_bank_val += val_billion
                land_detail.append({
                    "location": l.get("location", "Land Reserve"),
                    "hectares": round(ha, 2),
                    "price_sqm": round(price_sqm, 0),
                    "market_value_billion": round(val_billion, 2)
                })
        else:
            eff_ha = land_bank_hectares if land_bank_hectares is not None else 285.0
            total_sqm = eff_ha * 10000.0
            revalued_land_bank_val = (total_sqm * land_market_price_per_sqm) / 1e9
            total_hectares = eff_ha
            land_detail = [{
                "location": "Total Consolidated Raw Land Bank",
                "hectares": round(eff_ha, 2),
                "price_sqm": round(land_market_price_per_sqm, 0),
                "market_value_billion": round(revalued_land_bank_val, 2)
            }]

        # 3. Development Pipeline & Unbilled Presales PV
        presales_contribution = max(0.0, unbilled_presales * presales_ebit_margin)

        # 4. Gross Asset Value (GAV)
        gav = revalued_properties_val + revalued_land_bank_val + presales_contribution + cash_and_equivalents

        # 5. Debt & Liabilities Deduction -> Net Asset Value (NAV)
        total_obligations = total_debt + other_liabilities
        net_asset_value = gav - total_obligations

        # 6. Target Institutional Discount to RNAV
        safe_discount = max(0.0, min(0.80, target_nav_discount))
        discount_amount = max(0.0, net_asset_value * safe_discount)
        target_equity_value = net_asset_value - discount_amount

        # 7. Per Share Calculations
        safe_shares = max(0.001, shares_outstanding)
        undiscounted_nav_per_share = round((net_asset_value * 1e9) / (safe_shares * 1e9), 0)
        target_share_price = round((target_equity_value * 1e9) / (safe_shares * 1e9), 0)

        return {
            "model": "RNAV (Revalued Net Asset Value)",
            "gross_asset_value": round(gav, 2),
            "revalued_investment_properties": round(revalued_properties_val, 2),
            "revalued_land_bank": round(revalued_land_bank_val, 2),
            "unbilled_presales_contribution": round(presales_contribution, 2),
            "cash_and_equivalents": round(cash_and_equivalents, 2),
            "total_debt": round(total_debt, 2),
            "other_liabilities": round(other_liabilities, 2),
            "total_obligations": round(total_obligations, 2),
            "net_asset_value": round(net_asset_value, 2),
            "target_nav_discount_pct": round(safe_discount * 100, 1),
            "discount_amount": round(discount_amount, 2),
            "target_equity_value": round(target_equity_value, 2),
            "undiscounted_nav_per_share": int(undiscounted_nav_per_share),
            "target_share_price": int(target_share_price),
            "total_noi": round(total_noi, 2),
            "total_hectares": round(total_hectares, 2),
            "properties_detail": properties_detail,
            "land_detail": land_detail
        }
