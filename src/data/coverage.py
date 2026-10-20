"""
Coverage Universe Module for Indonesian Listed Equities.
Provides institutional metadata, actuals, price histories, and peer comps
for the MM6026 Digital Business Valuation platform.
Primary Benchmark: PWON.JK (PT Pakuwon Jati Tbk).
"""

from typing import Dict, List, Any

COVERAGE_UNIVERSE: List[Dict[str, Any]] = [
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
        "sharesOutstanding": 48.16,  # Billions
        "totalDebt": 5580.0,  # in IDR Billions
        "cashAndEquivalents": 5190.0,  # in IDR Billions
        "lastUpdated": "2026-10-21 09:00 WIB",
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
            "revGrowthY1": 12.0,
            "revGrowthY2": 14.0,
            "revGrowthY3": 10.0,
            "revGrowthY4": 8.0,
            "revGrowthY5": 7.0,
            "ebitdaMargin": 51.5,
            "taxRate": 22.0,
            "capexPercentRev": 8.0,
            "daPercentRev": 7.3,
            "nwcPercentRevChange": 5.0,
            "wacc": 10.42,
            "terminalGrowth": 1.5,
            "exitEbitdaMultiple": 6.0,
            "targetPeMultiple": 10.5,
            "payoutRatio": 30.0,
            "dcfWeight": 50,
            "compsWeight": 25,
            "rimWeight": 15,
            "ddmWeight": 10
        },
        "comps": [
            {"name": "Bumi Serpong Damai", "ticker": "BSDE", "mcap": 21590, "evEbitda": 6.97, "pe": 5.33, "revGrowth": 10.5, "ebitdaMargin": 42.0},
            {"name": "Ciputra Development", "ticker": "CTRA", "mcap": 22550, "evEbitda": 3.04, "pe": 4.01, "revGrowth": 9.2, "ebitdaMargin": 38.5},
            {"name": "Summarecon Agung", "ticker": "SMRA", "mcap": 9580, "evEbitda": 6.67, "pe": 6.77, "revGrowth": 8.8, "ebitdaMargin": 36.4},
            {"name": "Alam Sutera Realty", "ticker": "ASRI", "mcap": 3240, "evEbitda": 6.20, "pe": 6.70, "revGrowth": 6.5, "ebitdaMargin": 33.2},
            {"name": "Lippo Karawaci", "ticker": "LPKR", "mcap": 7800, "evEbitda": 5.80, "pe": 7.50, "revGrowth": 5.4, "ebitdaMargin": 29.8}
        ],
        "thesis": [
            "Dominant retail mall footprint with 96%+ occupancy across Jakarta and Surabaya producing reliable recurring lease cash flows.",
            "Conservative financial structure with net debt of only IDR 0.39T supporting unhindered hospitality and retail expansions.",
            "Substantial discount to NAV and peer multiples: stock trades at 5.4x EV/EBITDA vs peer average of 6.9x."
        ],
        "risks": [
            "Prolonged elevated domestic interest rates could soften high-rise condominium presales.",
            "Retail discretionary spending vulnerability to general consumer sentiment shifts.",
            "Escalation in land acquisition costs for future mixed-use pipeline development."
        ]
    },
    {
        "id": "bsde",
        "ticker": "BSDE.JK",
        "name": "PT Bumi Serpong Damai Tbk",
        "exchange": "IDX",
        "sector": "Real Estate",
        "industry": "Integrated Township & Land Banking",
        "currency": "IDR",
        "referencePrice": 1020.0,
        "priceChange1D": 0.50,
        "priceChangeYTD": 8.50,
        "sharesOutstanding": 21.17,
        "totalDebt": 12850.0,
        "cashAndEquivalents": 8420.0,
        "lastUpdated": "2026-10-21 09:00 WIB",
        "analyst": "E. Rostova, PhD",
        "confidence": "High",
        "description": "Flagship developer of BSD City, the largest master-planned township in Greater Jakarta spanning over 6,000 hectares with extensive residential, commercial, and tech-cluster development.",
        "historical": [
            {"year": "2021A", "revenue": 7650, "ebitda": 3120, "netIncome": 1350, "fcf": 1420, "eps": 63.77, "capex": 850},
            {"year": "2022A", "revenue": 10240, "ebitda": 4350, "netIncome": 2430, "fcf": 2100, "eps": 114.78, "capex": 980},
            {"year": "2023A", "revenue": 11540, "ebitda": 4980, "netIncome": 2740, "fcf": 2450, "eps": 129.43, "capex": 1100},
            {"year": "2024A", "revenue": 12890, "ebitda": 5420, "netIncome": 3120, "fcf": 2850, "eps": 147.38, "capex": 1250},
            {"year": "2025A", "revenue": 13950, "ebitda": 5860, "netIncome": 3410, "fcf": 3100, "eps": 161.08, "capex": 1320}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 940.0, "intrinsic": 1350.0},
            {"month": "Dec 25", "price": 960.0, "intrinsic": 1350.0},
            {"month": "Jan 26", "price": 980.0, "intrinsic": 1350.0},
            {"month": "Feb 26", "price": 970.0, "intrinsic": 1350.0},
            {"month": "Mar 26", "price": 995.0, "intrinsic": 1380.0},
            {"month": "Apr 26", "price": 1010.0, "intrinsic": 1380.0},
            {"month": "May 26", "price": 1030.0, "intrinsic": 1380.0},
            {"month": "Jun 26", "price": 1015.0, "intrinsic": 1380.0},
            {"month": "Jul 26", "price": 1025.0, "intrinsic": 1420.0},
            {"month": "Aug 26", "price": 1005.0, "intrinsic": 1420.0},
            {"month": "Sep 26", "price": 1015.0, "intrinsic": 1420.0},
            {"month": "Oct 26", "price": 1020.0, "intrinsic": 1420.0}
        ],
        "defaultAssumptions": {
            "revGrowthY1": 10.5,
            "revGrowthY2": 9.5,
            "revGrowthY3": 9.0,
            "revGrowthY4": 8.0,
            "revGrowthY5": 7.0,
            "ebitdaMargin": 42.0,
            "taxRate": 22.0,
            "capexPercentRev": 9.5,
            "daPercentRev": 5.5,
            "nwcPercentRevChange": 7.5,
            "wacc": 10.85,
            "terminalGrowth": 1.8,
            "exitEbitdaMultiple": 7.0,
            "targetPeMultiple": 7.5,
            "payoutRatio": 25.0,
            "dcfWeight": 50,
            "compsWeight": 30,
            "rimWeight": 10,
            "ddmWeight": 10
        },
        "comps": [
            {"name": "Pakuwon Jati", "ticker": "PWON", "mcap": 13000, "evEbitda": 5.40, "pe": 5.53, "revGrowth": 12.0, "ebitdaMargin": 51.5},
            {"name": "Ciputra Development", "ticker": "CTRA", "mcap": 22550, "evEbitda": 3.04, "pe": 4.01, "revGrowth": 9.2, "ebitdaMargin": 38.5},
            {"name": "Summarecon Agung", "ticker": "SMRA", "mcap": 9580, "evEbitda": 6.67, "pe": 6.77, "revGrowth": 8.8, "ebitdaMargin": 36.4}
        ],
        "thesis": [
            "Vast low-cost raw land bank exceeding 3,800 hectares ensures decades of development runway with structural gross margin protection.",
            "Joint-venture partnerships with Mitsubishi Corp and Aeon accelerate high-density transit-oriented commercial zones.",
            "Robust commercial plot sales to international data center operators unlocking premium lump-sum cash flows."
        ],
        "risks": [
            "Infrastructure execution delays on toll road connectivity to outer BSD phases.",
            "Large inventory carrying costs in the event of macro mortgage demand contraction."
        ]
    },
    {
        "id": "ctra",
        "ticker": "CTRA.JK",
        "name": "PT Ciputra Development Tbk",
        "exchange": "IDX",
        "sector": "Real Estate",
        "industry": "Geographically Diversified Residential & Commercial",
        "currency": "IDR",
        "referencePrice": 1215.0,
        "priceChange1D": -0.80,
        "priceChangeYTD": 12.4,
        "sharesOutstanding": 18.56,
        "totalDebt": 9650.0,
        "cashAndEquivalents": 7820.0,
        "lastUpdated": "2026-10-21 09:00 WIB",
        "analyst": "D. Thorne, CFA",
        "confidence": "High",
        "description": "Pioneering residential property powerhouse with active developments across 33 Indonesian cities, operating low-capital partner-cooperation schemes.",
        "historical": [
            {"year": "2021A", "revenue": 9730, "ebitda": 3520, "netIncome": 1730, "fcf": 1850, "eps": 93.21, "capex": 620},
            {"year": "2022A", "revenue": 9130, "ebitda": 3410, "netIncome": 1860, "fcf": 1920, "eps": 100.21, "capex": 680},
            {"year": "2023A", "revenue": 9260, "ebitda": 3580, "netIncome": 1850, "fcf": 2010, "eps": 99.68, "capex": 710},
            {"year": "2024A", "revenue": 10320, "ebitda": 3980, "netIncome": 2180, "fcf": 2340, "eps": 117.45, "capex": 780},
            {"year": "2025A", "revenue": 11250, "ebitda": 4330, "netIncome": 2420, "fcf": 2580, "eps": 130.38, "capex": 820}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 1080.0, "intrinsic": 1580.0},
            {"month": "Dec 25", "price": 1110.0, "intrinsic": 1580.0},
            {"month": "Jan 26", "price": 1145.0, "intrinsic": 1580.0},
            {"month": "Feb 26", "price": 1160.0, "intrinsic": 1580.0},
            {"month": "Mar 26", "price": 1190.0, "intrinsic": 1620.0},
            {"month": "Apr 26", "price": 1220.0, "intrinsic": 1620.0},
            {"month": "May 26", "price": 1205.0, "intrinsic": 1620.0},
            {"month": "Jun 26", "price": 1230.0, "intrinsic": 1620.0},
            {"month": "Jul 26", "price": 1245.0, "intrinsic": 1650.0},
            {"month": "Aug 26", "price": 1195.0, "intrinsic": 1650.0},
            {"month": "Sep 26", "price": 1210.0, "intrinsic": 1650.0},
            {"month": "Oct 26", "price": 1215.0, "intrinsic": 1650.0}
        ],
        "defaultAssumptions": {
            "revGrowthY1": 9.2,
            "revGrowthY2": 8.8,
            "revGrowthY3": 8.0,
            "revGrowthY4": 7.5,
            "revGrowthY5": 6.8,
            "ebitdaMargin": 38.5,
            "taxRate": 22.0,
            "capexPercentRev": 7.3,
            "daPercentRev": 4.2,
            "nwcPercentRevChange": 6.0,
            "wacc": 10.60,
            "terminalGrowth": 1.6,
            "exitEbitdaMultiple": 5.5,
            "targetPeMultiple": 9.0,
            "payoutRatio": 28.0,
            "dcfWeight": 50,
            "compsWeight": 30,
            "rimWeight": 10,
            "ddmWeight": 10
        },
        "comps": [
            {"name": "Pakuwon Jati", "ticker": "PWON", "mcap": 13000, "evEbitda": 5.40, "pe": 5.53, "revGrowth": 12.0, "ebitdaMargin": 51.5},
            {"name": "Bumi Serpong Damai", "ticker": "BSDE", "mcap": 21590, "evEbitda": 6.97, "pe": 5.33, "revGrowth": 10.5, "ebitdaMargin": 42.0},
            {"name": "Summarecon Agung", "ticker": "SMRA", "mcap": 9580, "evEbitda": 6.67, "pe": 6.77, "revGrowth": 8.8, "ebitdaMargin": 36.4}
        ],
        "thesis": [
            "Unrivaled geographic footprint mitigating single-region economic downturns across Java, Sumatra, Sulawesi, and Kalimantan.",
            "Joint-operation (KSO) development structure delivers 28%+ ROE with minimal upfront capital expenditure.",
            "Industry-leading presales execution reaching record annual bookings supported by middle-income housing incentives."
        ],
        "risks": [
            "Regional permitting bottlenecks and infrastructure pacing in tier-2 cities.",
            "Secondary market supply overhang in select Surabaya suburban clusters."
        ]
    },
    {
        "id": "smra",
        "ticker": "SMRA.JK",
        "name": "PT Summarecon Agung Tbk",
        "exchange": "IDX",
        "sector": "Real Estate",
        "industry": "Integrated Townships & Destination Retail",
        "currency": "IDR",
        "referencePrice": 580.0,
        "priceChange1D": 0.0,
        "priceChangeYTD": 3.5,
        "sharesOutstanding": 16.51,
        "totalDebt": 8920.0,
        "cashAndEquivalents": 3150.0,
        "lastUpdated": "2026-10-21 09:00 WIB",
        "analyst": "L. Chen, CFA",
        "confidence": "Medium",
        "description": "Developer of premier integrated townships in Kelapa Gading, Serpong, Bekasi, Bandung, and Karawang, anchored by iconic regional lifestyle retail malls.",
        "historical": [
            {"year": "2021A", "revenue": 5560, "ebitda": 1940, "netIncome": 550, "fcf": 680, "eps": 33.31, "capex": 620},
            {"year": "2022A", "revenue": 5720, "ebitda": 2080, "netIncome": 770, "fcf": 820, "eps": 46.64, "capex": 710},
            {"year": "2023A", "revenue": 6650, "ebitda": 2420, "netIncome": 1060, "fcf": 1120, "eps": 64.20, "capex": 840},
            {"year": "2024A", "revenue": 7240, "ebitda": 2640, "netIncome": 1280, "fcf": 1290, "eps": 77.53, "capex": 920},
            {"year": "2025A", "revenue": 7890, "ebitda": 2870, "netIncome": 1420, "fcf": 1440, "eps": 86.01, "capex": 980}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 540.0, "intrinsic": 780.0},
            {"month": "Dec 25", "price": 555.0, "intrinsic": 780.0},
            {"month": "Jan 26", "price": 570.0, "intrinsic": 780.0},
            {"month": "Feb 26", "price": 560.0, "intrinsic": 780.0},
            {"month": "Mar 26", "price": 585.0, "intrinsic": 800.0},
            {"month": "Apr 26", "price": 590.0, "intrinsic": 800.0},
            {"month": "May 26", "price": 575.0, "intrinsic": 800.0},
            {"month": "Jun 26", "price": 585.0, "intrinsic": 800.0},
            {"month": "Jul 26", "price": 595.0, "intrinsic": 810.0},
            {"month": "Aug 26", "price": 570.0, "intrinsic": 810.0},
            {"month": "Sep 26", "price": 575.0, "intrinsic": 810.0},
            {"month": "Oct 26", "price": 580.0, "intrinsic": 810.0}
        ],
        "defaultAssumptions": {
            "revGrowthY1": 8.8,
            "revGrowthY2": 8.4,
            "revGrowthY3": 7.8,
            "revGrowthY4": 7.0,
            "revGrowthY5": 6.5,
            "ebitdaMargin": 36.4,
            "taxRate": 22.0,
            "capexPercentRev": 12.4,
            "daPercentRev": 6.8,
            "nwcPercentRevChange": 6.8,
            "wacc": 11.20,
            "terminalGrowth": 1.7,
            "exitEbitdaMultiple": 6.7,
            "targetPeMultiple": 9.5,
            "payoutRatio": 25.0,
            "dcfWeight": 50,
            "compsWeight": 30,
            "rimWeight": 10,
            "ddmWeight": 10
        },
        "comps": [
            {"name": "Pakuwon Jati", "ticker": "PWON", "mcap": 13000, "evEbitda": 5.40, "pe": 5.53, "revGrowth": 12.0, "ebitdaMargin": 51.5},
            {"name": "Bumi Serpong Damai", "ticker": "BSDE", "mcap": 21590, "evEbitda": 6.97, "pe": 5.33, "revGrowth": 10.5, "ebitdaMargin": 42.0},
            {"name": "Ciputra Development", "ticker": "CTRA", "mcap": 22550, "evEbitda": 3.04, "pe": 4.01, "revGrowth": 9.2, "ebitdaMargin": 38.5}
        ],
        "thesis": [
            "Expanding recurring revenue base from Summarecon Mall Bandung and Summarecon Villaggio Outlets.",
            "Master-planned community loyalty commanding pricing premiums over neighboring developments.",
            "High cash visibility from staggered handover cycles in Serpong and Crown Gading."
        ],
        "risks": [
            "Higher net debt leverage (Net Debt/EBITDA ~2.0x) makes earnings sensitive to interest rate hikes.",
            "Intense township competition in East Jakarta corridor."
        ]
    },
    {
        "id": "asii",
        "ticker": "ASII.JK",
        "name": "PT Astra International Tbk",
        "exchange": "IDX",
        "sector": "Industrials",
        "industry": "Automotive, Heavy Equipment & Infrastructure Conglomerate",
        "currency": "IDR",
        "referencePrice": 5250.0,
        "priceChange1D": -0.45,
        "priceChangeYTD": 2.1,
        "sharesOutstanding": 40.48,
        "totalDebt": 58200.0,
        "cashAndEquivalents": 64900.0,
        "lastUpdated": "2026-10-21 09:00 WIB",
        "analyst": "M. Vance, CFA",
        "confidence": "High",
        "description": "Indonesia's preeminent diversified conglomerate, holding 54%+ market share in national automotive sales alongside heavy mining equipment, financial services, agribusiness, and toll road concessions.",
        "historical": [
            {"year": "2021A", "revenue": 233500, "ebitda": 41400, "netIncome": 20200, "fcf": 18200, "eps": 499.01, "capex": 12500},
            {"year": "2022A", "revenue": 301400, "ebitda": 56300, "netIncome": 28900, "fcf": 25100, "eps": 713.93, "capex": 17800},
            {"year": "2023A", "revenue": 316500, "ebitda": 58600, "netIncome": 33800, "fcf": 24800, "eps": 834.98, "capex": 19200},
            {"year": "2024A", "revenue": 312800, "ebitda": 57900, "netIncome": 30100, "fcf": 22100, "eps": 743.58, "capex": 17500},
            {"year": "2025A", "revenue": 316400, "ebitda": 58500, "netIncome": 31200, "fcf": 22500, "eps": 770.75, "capex": 17400}
        ],
        "priceHistory": [
            {"month": "Nov 25", "price": 5050.0, "intrinsic": 6800.0},
            {"month": "Dec 25", "price": 5125.0, "intrinsic": 6800.0},
            {"month": "Jan 26", "price": 5200.0, "intrinsic": 6800.0},
            {"month": "Feb 26", "price": 5175.0, "intrinsic": 6800.0},
            {"month": "Mar 26", "price": 5225.0, "intrinsic": 7000.0},
            {"month": "Apr 26", "price": 5300.0, "intrinsic": 7000.0},
            {"month": "May 26", "price": 5250.0, "intrinsic": 7000.0},
            {"month": "Jun 26", "price": 5350.0, "intrinsic": 7000.0},
            {"month": "Jul 26", "price": 5400.0, "intrinsic": 7100.0},
            {"month": "Aug 26", "price": 5150.0, "intrinsic": 7100.0},
            {"month": "Sep 26", "price": 5200.0, "intrinsic": 7100.0},
            {"month": "Oct 26", "price": 5250.0, "intrinsic": 7100.0}
        ],
        "defaultAssumptions": {
            "revGrowthY1": 6.5,
            "revGrowthY2": 6.0,
            "revGrowthY3": 5.5,
            "revGrowthY4": 5.0,
            "revGrowthY5": 4.5,
            "ebitdaMargin": 18.5,
            "taxRate": 22.0,
            "capexPercentRev": 5.5,
            "daPercentRev": 4.5,
            "nwcPercentRevChange": 5.0,
            "wacc": 10.15,
            "terminalGrowth": 2.0,
            "exitEbitdaMultiple": 6.5,
            "targetPeMultiple": 8.5,
            "payoutRatio": 50.0,
            "dcfWeight": 45,
            "compsWeight": 35,
            "rimWeight": 10,
            "ddmWeight": 10
        },
        "comps": [
            {"name": "United Tractors", "ticker": "UNTR", "mcap": 102000, "evEbitda": 4.20, "pe": 5.10, "revGrowth": 5.2, "ebitdaMargin": 22.5},
            {"name": "Indomobil Sukses", "ticker": "IMAS", "mcap": 5800, "evEbitda": 6.80, "pe": 8.40, "revGrowth": 4.1, "ebitdaMargin": 11.2}
        ],
        "thesis": [
            "Pristine net cash balance sheet ($64.9T cash vs $58.2T debt) paying generous 7%+ dividend yields.",
            "Structural proxy for Indonesian middle-class consumerization and mining commodity cycles.",
            "Aggressive investment into nickel processing, healthcare, and renewable geothermal energy."
        ],
        "risks": [
            "Electric Vehicle (EV) competition from Chinese automotive OEMs pressuring 4W market share.",
            "Thermal coal volume slowdown impacting mining contracting margins at subsidiary UNTR."
        ]
    }
]
