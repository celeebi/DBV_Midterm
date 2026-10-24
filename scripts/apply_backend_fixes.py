"""
Script to apply XBRL parsing fixes and schema updates for 2021-2025 actual audited statements.
"""

import re
import os

# 1. Update schema.py
schema_path = "src/data/adapters/idx_scraper/proforma/schema.py"
with open(schema_path, "r", encoding="utf-8") as f:
    schema_code = f.read()

if "minority_interest: float = 0.0" not in schema_code:
    schema_code = schema_code.replace(
        "    other_equity: float = 0.0\n    total_equity: float = 0.0",
        "    other_equity: float = 0.0\n    minority_interest: float = 0.0\n    total_equity: float = 0.0"
    )
    schema_code = schema_code.replace(
        '            "Other Equity & Reserves": self.other_equity,\n            "TOTAL EQUITY": self.total_equity,',
        '            "Other Equity & Reserves": self.other_equity,\n            "Non-Controlling Interests": self.minority_interest,\n            "TOTAL EQUITY": self.total_equity,'
    )
    with open(schema_path, "w", encoding="utf-8") as f:
        f.write(schema_code)
    print("[+] schema.py updated with minority_interest")

# 2. Update xbrl_parser.py
xbrl_path = "src/data/adapters/idx_scraper/xbrl_parser.py"
with open(xbrl_path, "r", encoding="utf-8") as f:
    xbrl_code = f.read()

# Fix D&A extraction
old_dna = '''        # D&A - Scan all official PSAK / IFRS taxonomy variations (IS & Cash Flow adjustments)
        dna = (g("Depreciation") or 
               g("DepreciationExpense") or 
               g("DepreciationAndAmortisationExpenses") or 
               g("AdjustmentsForDepreciationAndAmortisationExpense") or 
               g("AdjustmentsForDepreciationExpense") or 
               g("DepreciationOfPropertyPlantAndEquipment") or 
               (g("DepreciationExpense") + g("AmortisationExpense")) or 
               g("Amortisation") or 
               g("Amortization") or 
               g("AmortisationExpense")) / m'''

new_dna = '''        # D&A - Scan all official PSAK / IFRS taxonomy variations (IS & Cash Flow adjustments)
        depr_val = (g("Depreciation") or g("DepreciationExpense") or g("DepreciationOfPropertyPlantAndEquipment") or 0.0)
        amort_val = (g("Amortisation") or g("Amortization") or g("AmortisationExpense") or g("AmortizationExpense") or 0.0)
        combo_val = (g("DepreciationAndAmortisationExpenses") or 
                     g("DepreciationAndAmortizationExpense") or 
                     g("AdjustmentsForDepreciationAndAmortisationExpense") or 
                     g("AdjustmentsForDepreciationAndAmortizationExpense") or 0.0)
        dna_total = combo_val if combo_val > 0 else (depr_val + amort_val)
        dna = dna_total / m'''

if old_dna.replace("\r\n", "\n") in xbrl_code.replace("\r\n", "\n"):
    xbrl_code = xbrl_code.replace("\r\n", "\n").replace(old_dna.replace("\r\n", "\n"), new_dna)
    print("[+] D&A logic updated in xbrl_parser.py")

# Fix Inventory and Share Capital extraction
old_bs_items = '''        inv = g("Inventories", "CurrentYearInstant") / m
        ca = g("CurrentAssets", "CurrentYearInstant") / m'''

new_bs_items = '''        inv = (g("CurrentInventories", "CurrentYearInstant") or 
               g("Inventories", "CurrentYearInstant") or 
               g("InventoriesGross", "CurrentYearInstant")) / m
        ca = g("CurrentAssets", "CurrentYearInstant") / m'''

if old_bs_items.replace("\r\n", "\n") in xbrl_code.replace("\r\n", "\n"):
    xbrl_code = xbrl_code.replace("\r\n", "\n").replace(old_bs_items.replace("\r\n", "\n"), new_bs_items)
    print("[+] Inventory logic updated in xbrl_parser.py")

old_equity_items = '''        share_cap = (g("ShareCapital", "CurrentYearInstant") or 
                     g("CapitalShare", "CurrentYearInstant") or 
                     g("IssuedAndFullyPaidCapital", "CurrentYearInstant")) / m

        re_unapp = g("UnappropriatedRetainedEarnings", "CurrentYearInstant") / m
        re_app = g("AppropriatedRetainedEarnings", "CurrentYearInstant") / m
        re_tot = (g("RetainedEarnings", "CurrentYearInstant") / m) or (re_unapp + re_app)

        tot_equity = g("Equity", "CurrentYearInstant") / m
        other_eq = tot_equity - (share_cap + re_tot) if tot_equity > 0 else 0.0'''

new_equity_items = '''        share_cap = (g("ShareCapital", "CurrentYearInstant") or 
                     g("CapitalShare", "CurrentYearInstant") or 
                     g("CommonStocks", "CurrentYearInstant") or 
                     g("CommonStock", "CurrentYearInstant") or 
                     g("IssuedAndFullyPaidCapital", "CurrentYearInstant")) / m

        apic = (g("AdditionalPaidInCapital", "CurrentYearInstant") or 
                g("AdditionalPaidInCapitalNet", "CurrentYearInstant") or 0.0) / m
        tot_share_capital = share_cap + apic

        re_unapp = g("UnappropriatedRetainedEarnings", "CurrentYearInstant") / m
        re_app = g("AppropriatedRetainedEarnings", "CurrentYearInstant") / m
        re_tot = (g("RetainedEarnings", "CurrentYearInstant") / m) or (re_unapp + re_app)

        tot_equity = g("Equity", "CurrentYearInstant") / m
        min_int = (g("NonControllingInterests", "CurrentYearInstant") or 
                   g("MinorityInterest", "CurrentYearInstant") or 0.0) / m
        other_eq = max(0.0, tot_equity - (tot_share_capital + re_tot + min_int)) if tot_equity > 0 else 0.0'''

if old_equity_items.replace("\r\n", "\n") in xbrl_code.replace("\r\n", "\n"):
    xbrl_code = xbrl_code.replace("\r\n", "\n").replace(old_equity_items.replace("\r\n", "\n"), new_equity_items)
    print("[+] Equity and Share Capital logic updated in xbrl_parser.py")

# Update NormalizedBS instantiation in xbrl_parser.py
old_bs_inst = '''            share_capital=share_cap,
            retained_earnings=re_tot,
            other_equity=other_eq,
            total_equity=tot_equity,'''

new_bs_inst = '''            share_capital=tot_share_capital,
            retained_earnings=re_tot,
            other_equity=other_eq,
            minority_interest=min_int,
            total_equity=tot_equity,'''

if old_bs_inst.replace("\r\n", "\n") in xbrl_code.replace("\r\n", "\n"):
    xbrl_code = xbrl_code.replace("\r\n", "\n").replace(old_bs_inst.replace("\r\n", "\n"), new_bs_inst)
    print("[+] NormalizedBS instantiation updated in xbrl_parser.py")

with open(xbrl_path, "w", encoding="utf-8") as f:
    f.write(xbrl_code)

# 3. Update normalizer.py for share_capital patterns
norm_path = "src/data/adapters/idx_scraper/proforma/normalizer.py"
with open(norm_path, "r", encoding="utf-8") as f:
    norm_code = f.read()

old_sc_pattern = '''        # Share Capital & Other Equity
        bs.share_capital = self._resolve_waterfall(
            df_bs,
            primary_patterns=[r"^modal saham\s*$", r"^share capital\s*$"],
            child_patterns=[r"tambahan modal disetor"],
            year_col=yr_str, scale=scale
        )'''

new_sc_pattern = '''        # Share Capital & Other Equity
        bs.share_capital = self._resolve_waterfall(
            df_bs,
            primary_patterns=[r"^modal saham\s*$", r"^share capital\s*$", r"^saham biasa\s*$", r"^common stocks?\s*$"],
            child_patterns=[r"saham biasa", r"tambahan modal disetor", r"additional paid-in capital"],
            year_col=yr_str, scale=scale
        )'''

if old_sc_pattern.replace("\r\n", "\n") in norm_code.replace("\r\n", "\n"):
    norm_code = norm_code.replace("\r\n", "\n").replace(old_sc_pattern.replace("\r\n", "\n"), new_sc_pattern)
    with open(norm_path, "w", encoding="utf-8") as f:
        f.write(norm_code)
    print("[+] normalizer.py updated with Saham biasa patterns")

print("[OK] Backend patch complete.")

# 4. Update idx_adapter.py to record minority_interest in hist_bs
adapter_path = "src/data/adapters/idx_adapter.py"
with open(adapter_path, "r", encoding="utf-8") as f:
    adapter_code = f.read()

old_adapter_target = '''                "share_capital": round(b.share_capital * mult_y, 2),
                "retained_earnings": round(b.retained_earnings * mult_y, 2),
                "other_equity": round(b.other_equity * mult_y, 2),
                "total_equity": round(b.total_equity * mult_y, 2),'''

new_adapter_target = '''                "share_capital": round(b.share_capital * mult_y, 2),
                "retained_earnings": round(b.retained_earnings * mult_y, 2),
                "other_equity": round(b.other_equity * mult_y, 2),
                "minority_interest": round(getattr(b, "minority_interest", 0.0) * mult_y, 2),
                "total_equity": round(b.total_equity * mult_y, 2),'''

if old_adapter_target.replace("\r\n", "\n") in adapter_code.replace("\r\n", "\n"):
    adapter_code = adapter_code.replace("\r\n", "\n").replace(old_adapter_target.replace("\r\n", "\n"), new_adapter_target)
    with open(adapter_path, "w", encoding="utf-8") as f:
        f.write(adapter_code)
    print("[+] idx_adapter.py updated with minority_interest")

# 5. Update server.py company_actuals
server_path = "server.py"
with open(server_path, "r", encoding="utf-8") as f:
    server_code = f.read()

old_server_target = '''            tot_eq_val = float(lat_bs.get("total_equity", 0.0))
            sh_cap = float(lat_bs.get("share_capital", 0.0))
            ret_earn = float(lat_bs.get("retained_earnings", 0.0))
            min_int = float(lat_bs.get("minority_interest") if lat_bs.get("minority_interest") is not None else mi)
            other_eq = max(0.0, round(tot_eq_val - sh_cap - ret_earn - min_int, 4))'''

new_server_target = '''            tot_eq_val = float(lat_bs.get("total_equity", 0.0))
            sh_cap = float(lat_bs.get("share_capital", 0.0))
            ret_earn = float(lat_bs.get("retained_earnings", 0.0))
            min_int = float(lat_bs.get("minority_interest", 0.0))
            other_eq = float(lat_bs.get("other_equity", max(0.0, round(tot_eq_val - sh_cap - ret_earn - min_int, 4))))'''

if old_server_target.replace("\r\n", "\n") in server_code.replace("\r\n", "\n"):
    server_code = server_code.replace("\r\n", "\n").replace(old_server_target.replace("\r\n", "\n"), new_server_target)
    with open(server_path, "w", encoding="utf-8") as f:
        f.write(server_code)
    print("[+] server.py updated company_actuals calibration")
