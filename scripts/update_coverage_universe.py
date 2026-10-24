"""
Script to generate multi-sector non-financial coverage universe for:
- src/data/coverage.py
- static/coverage_data.js

Sectors represented:
1. ASII (Industrials / Automotive & Conglomerates)
2. ANTM (Basic Materials / Mining, Metals & Resources)
3. AKRA (Energy Logistics / Supply Chain & Industrial Estates)
4. ICBP (Consumer Staples / Food & Beverage)
5. TLKM (Telecommunications & Digital Infrastructure)
6. PWON (Real Estate / Retail Malls & Mixed-Use)
"""

import json
import os

COVERAGE = [
    {
        "id": "asii",
        "ticker": "ASII.JK",
        "name": "PT Astra International Tbk",
        "exchange": "IDX",
        "sector": "Industrials",
        "industry": "Automotive, Heavy Equipment & Infrastructure Conglomerate",
        "currency": "IDR",
        "referencePrice": 5250.0,
        "priceChange1D": 0.50,
        "priceChangeYTD": 2.10,
        "sharesOutstanding": 40.48,
        "totalDebt": 58200.0,
        "cashAndEquivalents": 64900.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Indonesia's preeminent diversified conglomerate, holding 54%+ national automotive market share alongside heavy mining equipment, infrastructure, agribusiness, and industrial concessions.",
        "historical": [
            {"year": "2021A", "revenue": 233500, "ebitda": 41400, "netIncome": 20200, "fcf": 18200, "eps": 499.01, "capex": 12500},
            {"year": "2022A", "revenue": 301400, "ebitda": 56300, "netIncome": 28900, "fcf": 25100, "eps": 713.93, "capex": 17800},
            {"year": "2023A", "revenue": 316500, "ebitda": 58600, "netIncome": 33800, "fcf": 24800, "eps": 834.98, "capex": 19200},
            {"year": "2024A", "revenue": 312800, "ebitda": 57900, "netIncome": 30100, "fcf": 22100, "eps": 743.58, "capex": 17500},
            {"year": "2025A", "revenue": 323400, "ebitda": 59800, "netIncome": 31800, "fcf": 23400, "eps": 785.57, "capex": 18100}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 5050.0, "intrinsic": 6820.0},
            {"month": "Dec 25", "price": 5125.0, "intrinsic": 6820.0},
            {"month": "Jan 26", "price": 5200.0, "intrinsic": 6820.0},
            {"month": "Feb 26", "price": 5175.0, "intrinsic": 6820.0},
            {"month": "Mar 26", "price": 5225.0, "intrinsic": 6820.0},
            {"month": "Apr 26", "price": 5300.0, "intrinsic": 6820.0},
            {"month": "May 26", "price": 5250.0, "intrinsic": 6820.0},
            {"month": "Jun 26", "price": 5350.0, "intrinsic": 6820.0},
            {"month": "Jul 26", "price": 5400.0, "intrinsic": 6820.0},
            {"month": "Aug 26", "price": 5150.0, "intrinsic": 6820.0},
            {"month": "Sep 26", "price": 5200.0, "intrinsic": 6820.0},
            {"month": "Oct 26", "price": 5250.0, "intrinsic": 6820.0}
        ],
        "defaultAssumptions": {
            "beta": 0.85, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.50, "wd": 21.5,
            "revGrowthY1": 6.5, "revGrowthY2": 6.0, "revGrowthY3": 5.5, "revGrowthY4": 5.0, "revGrowthY5": 4.5,
            "ebitdaMargin": 18.5, "taxRate": 22.0, "capexPercentRev": 5.5, "daPercentRev": 4.5, "nwcPercentRevChange": 5.0,
            "wacc": 10.15, "terminalGrowth": 2.0, "exitEbitdaMultiple": 6.5, "targetPeMultiple": 8.5, "payoutRatio": 50.0,
            "dcfWeight": 45, "compsWeight": 35, "rimWeight": 10, "ddmWeight": 10
        },
        "comps": [
            {"name": "United Tractors", "ticker": "UNTR", "mcap": 102000, "evEbitda": 4.20, "pe": 5.10, "revGrowth": 5.2, "ebitdaMargin": 22.5},
            {"name": "Indomobil Sukses", "ticker": "IMAS", "mcap": 5800, "evEbitda": 6.80, "pe": 8.40, "revGrowth": 4.1, "ebitdaMargin": 11.2}
        ],
        "thesis": [
            "Pristine net cash balance sheet supporting steady 7%+ dividend yields across economic cycles.",
            "Structural proxy for Indonesian middle-class consumerization and commodities logistics.",
            "Strategic pivot into nickel processing, healthcare, and renewable geothermal energy."
        ],
        "risks": [
            "EV competition from international electric vehicle brands pressuring 4W automotive margins.",
            "Commodity cycle volatility dampening heavy machinery sales at subsidiary UNTR."
        ]
    },
    {
        "id": "antm",
        "ticker": "ANTM.JK",
        "name": "PT Aneka Tambang Tbk",
        "exchange": "IDX",
        "sector": "Basic Materials",
        "industry": "Diversified Mining, Gold, Nickel & Bauxite",
        "currency": "IDR",
        "referencePrice": 1580.0,
        "priceChange1D": 1.95,
        "priceChangeYTD": 12.50,
        "sharesOutstanding": 24.03,
        "totalDebt": 10450.0,
        "cashAndEquivalents": 11850.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Leading Indonesian diversified mineral producer operating integrated gold refining, bauxite mining, and high-grade ferronickel smelters as a foundational pillar of Indonesia's national EV battery supply chain.",
        "historical": [
            {"year": "2021A", "revenue": 38450, "ebitda": 3640, "netIncome": 1860, "fcf": 2100, "eps": 77.40, "capex": 1450},
            {"year": "2022A", "revenue": 45930, "ebitda": 4120, "netIncome": 3820, "fcf": 2980, "eps": 158.97, "capex": 1620},
            {"year": "2023A", "revenue": 41050, "ebitda": 3960, "netIncome": 3080, "fcf": 2450, "eps": 128.17, "capex": 1800},
            {"year": "2024A", "revenue": 69190, "ebitda": 5210, "netIncome": 2850, "fcf": 3120, "eps": 118.60, "capex": 2100},
            {"year": "2025A", "revenue": 84640, "ebitda": 6420, "netIncome": 3910, "fcf": 3850, "eps": 162.71, "capex": 2350}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 1450.0, "intrinsic": 2150.0},
            {"month": "Dec 25", "price": 1480.0, "intrinsic": 2150.0},
            {"month": "Jan 26", "price": 1520.0, "intrinsic": 2150.0},
            {"month": "Feb 26", "price": 1500.0, "intrinsic": 2150.0},
            {"month": "Mar 26", "price": 1540.0, "intrinsic": 2150.0},
            {"month": "Apr 26", "price": 1560.0, "intrinsic": 2150.0},
            {"month": "May 26", "price": 1550.0, "intrinsic": 2150.0},
            {"month": "Jun 26", "price": 1570.0, "intrinsic": 2150.0},
            {"month": "Jul 26", "price": 1600.0, "intrinsic": 2200.0},
            {"month": "Aug 26", "price": 1560.0, "intrinsic": 2200.0},
            {"month": "Sep 26", "price": 1575.0, "intrinsic": 2200.0},
            {"month": "Oct 26", "price": 1580.0, "intrinsic": 2200.0}
        ],
        "defaultAssumptions": {
            "beta": 1.15, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.75, "wd": 18.0,
            "revGrowthY1": 10.5, "revGrowthY2": 9.0, "revGrowthY3": 8.0, "revGrowthY4": 7.0, "revGrowthY5": 6.0,
            "ebitdaMargin": 12.5, "taxRate": 22.0, "capexPercentRev": 3.8, "daPercentRev": 2.8, "nwcPercentRevChange": 4.5,
            "wacc": 11.20, "terminalGrowth": 1.5, "exitEbitdaMultiple": 6.8, "targetPeMultiple": 12.5, "payoutRatio": 40.0,
            "dcfWeight": 50, "compsWeight": 30, "rimWeight": 10, "ddmWeight": 10
        },
        "comps": [
            {"name": "Vale Indonesia", "ticker": "INCO", "mcap": 38500, "evEbitda": 7.40, "pe": 14.2, "revGrowth": 6.8, "ebitdaMargin": 24.5},
            {"name": "Merdeka Copper Gold", "ticker": "MDKA", "mcap": 52000, "evEbitda": 9.80, "pe": 28.5, "revGrowth": 14.2, "ebitdaMargin": 18.0}
        ],
        "thesis": [
            "Surging physical gold sales volume driven by sovereign retail wealth preservation and inflation hedging.",
            "Integral supply chain role in upstream high-pressure acid leach (HPAL) nickel battery joint ventures.",
            "Strong net cash position provides balance sheet resilience against global base metal cyclicality."
        ],
        "risks": [
            "Global spot gold and nickel price fluctuations impacting processing margins.",
            "Domestic mining royalty regulation or export tariff adjustments."
        ]
    },
    {
        "id": "akra",
        "ticker": "AKRA.JK",
        "name": "PT AKR Corporindo Tbk",
        "exchange": "IDX",
        "sector": "Energy & Infrastructure",
        "industry": "Petroleum Logistics, Supply Chain & Industrial Estates",
        "currency": "IDR",
        "referencePrice": 1450.0,
        "priceChange1D": 0.35,
        "priceChangeYTD": 5.40,
        "sharesOutstanding": 20.07,
        "totalDebt": 4820.0,
        "cashAndEquivalents": 5600.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Leading private supply chain logistics enterprise in Indonesia, distributing petroleum and basic chemicals alongside developing the flagship JIIPE integrated deep-sea port and special economic zone in Gresik.",
        "historical": [
            {"year": "2021A", "revenue": 25710, "ebitda": 1790, "netIncome": 1110, "fcf": 1250, "eps": 55.31, "capex": 480},
            {"year": "2022A", "revenue": 47540, "ebitda": 3530, "netIncome": 2400, "fcf": 2340, "eps": 119.58, "capex": 620},
            {"year": "2023A", "revenue": 42090, "ebitda": 3780, "netIncome": 2780, "fcf": 2680, "eps": 138.52, "capex": 710},
            {"year": "2024A", "revenue": 41920, "ebitda": 3850, "netIncome": 2810, "fcf": 2750, "eps": 140.01, "capex": 750},
            {"year": "2025A", "revenue": 46020, "ebitda": 4120, "netIncome": 2940, "fcf": 2890, "eps": 146.49, "capex": 820}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 1380.0, "intrinsic": 1720.0},
            {"month": "Dec 25", "price": 1400.0, "intrinsic": 1720.0},
            {"month": "Jan 26", "price": 1420.0, "intrinsic": 1720.0},
            {"month": "Feb 26", "price": 1410.0, "intrinsic": 1720.0},
            {"month": "Mar 26", "price": 1440.0, "intrinsic": 1720.0},
            {"month": "Apr 26", "price": 1450.0, "intrinsic": 1720.0},
            {"month": "May 26", "price": 1435.0, "intrinsic": 1720.0},
            {"month": "Jun 26", "price": 1460.0, "intrinsic": 1720.0},
            {"month": "Jul 26", "price": 1475.0, "intrinsic": 1750.0},
            {"month": "Aug 26", "price": 1430.0, "intrinsic": 1750.0},
            {"month": "Sep 26", "price": 1445.0, "intrinsic": 1750.0},
            {"month": "Oct 26", "price": 1450.0, "intrinsic": 1750.0}
        ],
        "defaultAssumptions": {
            "beta": 0.80, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.40, "wd": 15.0,
            "revGrowthY1": 8.0, "revGrowthY2": 7.5, "revGrowthY3": 7.0, "revGrowthY4": 6.5, "revGrowthY5": 6.0,
            "ebitdaMargin": 9.5, "taxRate": 22.0, "capexPercentRev": 2.2, "daPercentRev": 1.8, "nwcPercentRevChange": 3.5,
            "wacc": 9.85, "terminalGrowth": 1.8, "exitEbitdaMultiple": 7.5, "targetPeMultiple": 11.5, "payoutRatio": 55.0,
            "dcfWeight": 50, "compsWeight": 25, "rimWeight": 15, "ddmWeight": 10
        },
        "comps": [
            {"name": "Samudera Indonesia", "ticker": "SMDR", "mcap": 6200, "evEbitda": 4.10, "pe": 4.8, "revGrowth": 5.4, "ebitdaMargin": 21.0},
            {"name": "Surya Esa Perkasa", "ticker": "ESSA", "mcap": 12800, "evEbitda": 5.80, "pe": 8.9, "revGrowth": 8.2, "ebitdaMargin": 32.0}
        ],
        "thesis": [
            "Formula-based petroleum pricing mechanism shields distribution margins from crude oil volatility.",
            "JIIPE SEZ monetizing premium industrial land sales to multinational copper smelters and green tech tenancies.",
            "Consistent dividend payout exceeding 55% backed by minimal capital expenditure requirements."
        ],
        "risks": [
            "Industrial land sales recognition timing lumpy across quarterly reporting cycles.",
            "Subsidized diesel quota adjustments by regulatory energy bodies."
        ]
    },
    {
        "id": "icbp",
        "ticker": "ICBP.JK",
        "name": "PT Indofood CBP Sukses Makmur Tbk",
        "exchange": "IDX",
        "sector": "Consumer Non-Cyclicals",
        "industry": "Packaged Food, Instant Noodles & Dairy",
        "currency": "IDR",
        "referencePrice": 11200.0,
        "priceChange1D": -0.25,
        "priceChangeYTD": 4.80,
        "sharesOutstanding": 11.66,
        "totalDebt": 35400.0,
        "cashAndEquivalents": 18200.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Global consumer packaged goods powerhouse producing iconic Indomie instant noodles, dairy products, snack foods, and beverages across Indonesia, the Middle East, and Africa.",
        "historical": [
            {"year": "2021A", "revenue": 56800, "ebitda": 12600, "netIncome": 6390, "fcf": 6800, "eps": 548.03, "capex": 2800},
            {"year": "2022A", "revenue": 64800, "ebitda": 13400, "netIncome": 4580, "fcf": 5900, "eps": 392.80, "capex": 3100},
            {"year": "2023A", "revenue": 67900, "ebitda": 14900, "netIncome": 6990, "fcf": 8200, "eps": 599.49, "capex": 3400},
            {"year": "2024A", "revenue": 71500, "ebitda": 15800, "netIncome": 8250, "fcf": 9400, "eps": 707.55, "capex": 3650},
            {"year": "2025A", "revenue": 76200, "ebitda": 17100, "netIncome": 9120, "fcf": 10400, "eps": 782.16, "capex": 3900}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 10800.0, "intrinsic": 13800.0},
            {"month": "Dec 25", "price": 10950.0, "intrinsic": 13800.0},
            {"month": "Jan 26", "price": 11100.0, "intrinsic": 13800.0},
            {"month": "Feb 26", "price": 11050.0, "intrinsic": 13800.0},
            {"month": "Mar 26", "price": 11150.0, "intrinsic": 13800.0},
            {"month": "Apr 26", "price": 11300.0, "intrinsic": 13800.0},
            {"month": "May 26", "price": 11200.0, "intrinsic": 13800.0},
            {"month": "Jun 26", "price": 11350.0, "intrinsic": 13800.0},
            {"month": "Jul 26", "price": 11400.0, "intrinsic": 14000.0},
            {"month": "Aug 26", "price": 11150.0, "intrinsic": 14000.0},
            {"month": "Sep 26", "price": 11250.0, "intrinsic": 14000.0},
            {"month": "Oct 26", "price": 11200.0, "intrinsic": 14000.0}
        ],
        "defaultAssumptions": {
            "beta": 0.65, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.25, "wd": 22.0,
            "revGrowthY1": 7.0, "revGrowthY2": 6.5, "revGrowthY3": 6.0, "revGrowthY4": 5.5, "revGrowthY5": 5.0,
            "ebitdaMargin": 22.5, "taxRate": 22.0, "capexPercentRev": 5.0, "daPercentRev": 4.0, "nwcPercentRevChange": 3.8,
            "wacc": 9.45, "terminalGrowth": 2.0, "exitEbitdaMultiple": 10.5, "targetPeMultiple": 15.5, "payoutRatio": 50.0,
            "dcfWeight": 45, "compsWeight": 35, "rimWeight": 10, "ddmWeight": 10
        },
        "comps": [
            {"name": "Mayora Indah", "ticker": "MYOR", "mcap": 58000, "evEbitda": 11.2, "pe": 16.8, "revGrowth": 8.5, "ebitdaMargin": 14.5},
            {"name": "Unilever Indonesia", "ticker": "UNVR", "mcap": 76000, "evEbitda": 13.5, "pe": 18.2, "revGrowth": 2.1, "ebitdaMargin": 18.0}
        ],
        "thesis": [
            "Inelastic consumer demand and unrivalled brand equity in Indomie defending pricing power.",
            "Pinehill Middle East acquisition delivering compounding dollar-denominated export revenues.",
            "Softening global wheat and CPO input costs driving gross margin expansion."
        ],
        "risks": [
            "USD debt translation FX volatility associated with offshore bond obligations.",
            "Elevated commodity input inflation (wheat, milk powder, sugar)."
        ]
    },
    {
        "id": "tlkm",
        "ticker": "TLKM.JK",
        "name": "PT Telkom Indonesia Tbk",
        "exchange": "IDX",
        "sector": "Infrastructure",
        "industry": "Integrated Telecommunications, Fiber & Data Centers",
        "currency": "IDR",
        "referencePrice": 2950.0,
        "priceChange1D": -0.34,
        "priceChangeYTD": -7.80,
        "sharesOutstanding": 99.06,
        "totalDebt": 68400.0,
        "cashAndEquivalents": 32100.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "National telecommunications sovereign champion operating Telkomsel (mobile leader with 160M+ subscribers), IndiHome fiber-to-the-home broadband, and carrier-neutral data centers across Southeast Asia.",
        "historical": [
            {"year": "2021A", "revenue": 143210, "ebitda": 75720, "netIncome": 24760, "fcf": 28400, "eps": 249.95, "capex": 28500},
            {"year": "2022A", "revenue": 147310, "ebitda": 78990, "netIncome": 20750, "fcf": 24100, "eps": 209.47, "capex": 34200},
            {"year": "2023A", "revenue": 149220, "ebitda": 77580, "netIncome": 24560, "fcf": 27200, "eps": 247.93, "capex": 32800},
            {"year": "2024A", "revenue": 153400, "ebitda": 78200, "netIncome": 24800, "fcf": 28100, "eps": 250.35, "capex": 31500},
            {"year": "2025A", "revenue": 158200, "ebitda": 80400, "netIncome": 25600, "fcf": 29800, "eps": 258.43, "capex": 30200}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 2850.0, "intrinsic": 3750.0},
            {"month": "Dec 25", "price": 2900.0, "intrinsic": 3750.0},
            {"month": "Jan 26", "price": 2980.0, "intrinsic": 3750.0},
            {"month": "Feb 26", "price": 2920.0, "intrinsic": 3750.0},
            {"month": "Mar 26", "price": 2960.0, "intrinsic": 3750.0},
            {"month": "Apr 26", "price": 3020.0, "intrinsic": 3750.0},
            {"month": "May 26", "price": 2950.0, "intrinsic": 3750.0},
            {"month": "Jun 26", "price": 3000.0, "intrinsic": 3750.0},
            {"month": "Jul 26", "price": 3050.0, "intrinsic": 3800.0},
            {"month": "Aug 26", "price": 2910.0, "intrinsic": 3800.0},
            {"month": "Sep 26", "price": 2940.0, "intrinsic": 3800.0},
            {"month": "Oct 26", "price": 2950.0, "intrinsic": 3800.0}
        ],
        "defaultAssumptions": {
            "beta": 0.75, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.50, "wd": 25.0,
            "revGrowthY1": 4.5, "revGrowthY2": 4.0, "revGrowthY3": 4.0, "revGrowthY4": 3.5, "revGrowthY5": 3.0,
            "ebitdaMargin": 50.8, "taxRate": 22.0, "capexPercentRev": 19.5, "daPercentRev": 18.0, "nwcPercentRevChange": 3.0,
            "wacc": 9.60, "terminalGrowth": 1.8, "exitEbitdaMultiple": 5.5, "targetPeMultiple": 12.0, "payoutRatio": 70.0,
            "dcfWeight": 45, "compsWeight": 30, "rimWeight": 15, "ddmWeight": 10
        },
        "comps": [
            {"name": "Indosat Ooredoo Hutchison", "ticker": "ISAT", "mcap": 82000, "evEbitda": 4.8, "pe": 15.5, "revGrowth": 9.2, "ebitdaMargin": 47.5},
            {"name": "XL Axiata", "ticker": "EXCL", "mcap": 28000, "evEbitda": 4.1, "pe": 16.2, "revGrowth": 6.5, "ebitdaMargin": 49.0}
        ],
        "thesis": [
            "Fixed-Mobile Convergence (FMC) synergy unlocking churn reduction and recurring APRU expansion.",
            "Carrier-neutral hyper-scale data center spin-off unlocking hidden sum-of-the-parts valuation.",
            "High dividend payout ratio (70%+) underpinned by robust operating cash flow generation."
        ],
        "risks": [
            "Competitive price war among cellular operators in secondary regional markets.",
            "Heavy 5G infrastructure CapEx requirements dampening near-term free cash flow."
        ]
    },
    {
        "id": "pwon",
        "ticker": "PWON.JK",
        "name": "PT Pakuwon Jati Tbk",
        "exchange": "IDX",
        "sector": "Real Estate",
        "industry": "Commercial Malls & Mixed-Use High-Rise",
        "currency": "IDR",
        "referencePrice": 270.0,
        "priceChange1D": 1.50,
        "priceChangeYTD": -4.25,
        "sharesOutstanding": 48.16,
        "totalDebt": 5580.0,
        "cashAndEquivalents": 5190.0,
        "lastUpdated": "2026-10-23 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Premier Indonesian retail commercial developer operating iconic superblocks including Kota Kasablanka, Gandaria City, Blok M Plaza in Jakarta, and Tunjungan Plaza & Pakuwon Mall in Surabaya.",
        "historical": [
            {"year": "2021A", "revenue": 4710, "ebitda": 2060, "netIncome": 1380, "fcf": 1120, "eps": 28.65, "capex": 450},
            {"year": "2022A", "revenue": 5990, "ebitda": 2580, "netIncome": 1540, "fcf": 1450, "eps": 31.98, "capex": 520},
            {"year": "2023A", "revenue": 6200, "ebitda": 3200, "netIncome": 2110, "fcf": 1820, "eps": 43.81, "capex": 580},
            {"year": "2024A", "revenue": 6670, "ebitda": 3270, "netIncome": 2070, "fcf": 1850, "eps": 42.98, "capex": 650},
            {"year": "2025A", "revenue": 7110, "ebitda": 3660, "netIncome": 2350, "fcf": 2140, "eps": 48.80, "capex": 680}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 284.0, "intrinsic": 440.0},
            {"month": "Dec 25", "price": 278.0, "intrinsic": 440.0},
            {"month": "Jan 26", "price": 272.0, "intrinsic": 440.0},
            {"month": "Feb 26", "price": 266.0, "intrinsic": 440.0},
            {"month": "Mar 26", "price": 274.0, "intrinsic": 440.0},
            {"month": "Apr 26", "price": 268.0, "intrinsic": 440.0},
            {"month": "May 26", "price": 270.0, "intrinsic": 440.0},
            {"month": "Jun 26", "price": 276.0, "intrinsic": 440.0},
            {"month": "Jul 26", "price": 272.0, "intrinsic": 440.0},
            {"month": "Aug 26", "price": 265.0, "intrinsic": 440.0},
            {"month": "Sep 26", "price": 268.0, "intrinsic": 440.0},
            {"month": "Oct 26", "price": 270.0, "intrinsic": 440.0}
        ],
        "defaultAssumptions": {
            "beta": 0.75, "rf": 6.60, "matureErp": 5.00, "crp": 2.16, "sovereignSpread": 1.50, "kdPre": 6.50, "wd": 20.0,
            "revGrowthY1": 12.0, "revGrowthY2": 14.0, "revGrowthY3": 10.0, "revGrowthY4": 8.0, "revGrowthY5": 7.0,
            "ebitdaMargin": 51.5, "taxRate": 22.0, "capexPercentRev": 8.0, "daPercentRev": 7.3, "nwcPercentRevChange": 5.0,
            "wacc": 10.42, "terminalGrowth": 1.5, "exitEbitdaMultiple": 6.0, "targetPeMultiple": 10.5, "payoutRatio": 30.0,
            "dcfWeight": 50, "compsWeight": 25, "rimWeight": 15, "ddmWeight": 10
        },
        "comps": [
            {"name": "Bumi Serpong Damai", "ticker": "BSDE", "mcap": 21590, "evEbitda": 6.97, "pe": 5.33, "revGrowth": 10.5, "ebitdaMargin": 42.0},
            {"name": "Ciputra Development", "ticker": "CTRA", "mcap": 22550, "evEbitda": 3.04, "pe": 4.01, "revGrowth": 9.2, "ebitdaMargin": 38.5}
        ],
        "thesis": [
            "Dominant retail mall footprint with 96%+ occupancy generating predictable recurring rental cash flows.",
            "Prudent financial structure with net debt under IDR 0.4T supporting ongoing hospitality pipeline.",
            "Trading at a substantial discount to NAV and historical replacement cost."
        ],
        "risks": [
            "Elevated interest rates softening demand for high-rise residential presales.",
            "Retail discretionary spending vulnerability to macro consumer sentiment shifts."
        ]
    }
]

# Write src/data/coverage.py
coverage_py = '''"""
Coverage Universe Module for Indonesian Listed Equities.
Provides institutional metadata, actuals, price histories, and peer comps
for the MM6026 Digital Business Valuation platform.
Universal Multi-Sector Coverage across Indonesian Capital Markets.
"""

from typing import Dict, List, Any

COVERAGE_UNIVERSE: List[Dict[str, Any]] = ''' + json.dumps(COVERAGE, indent=4) + "\n"

with open(os.path.join("src", "data", "coverage.py"), "w", encoding="utf-8") as f:
    f.write(coverage_py)

print("[+] Updated src/data/coverage.py with 6 multi-sector blue chips")

# Write static/coverage_data.js
coverage_js = "window.INITIAL_COVERAGE = " + json.dumps(COVERAGE, indent=2) + ";\n"

with open(os.path.join("static", "coverage_data.js"), "w", encoding="utf-8") as f:
    f.write(coverage_js)

print("[+] Updated static/coverage_data.js with 6 multi-sector blue chips")
