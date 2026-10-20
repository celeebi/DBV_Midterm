import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Search,
  TrendingUp,
  TrendingDown,
  Sliders,
  FileText,
  Bookmark,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  RefreshCw,
  Layers,
  Scale,
  DollarSign,
  Percent,
  Activity,
  ChevronRight,
  Plus,
  Trash2,
  Eye,
  Printer,
  Share2,
  Lock,
  Unlock,
  Filter,
  ArrowUpDown,
  Briefcase,
  ShieldAlert,
  Target,
  Clock,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
  BarChart,
  Cell
} from 'recharts';

const INITIAL_COMPANIES = [
  {
    id: 'apex',
    ticker: 'APX',
    name: 'Apex Semiconductor Corp.',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Semiconductors & AI Infrastructure',
    currency: 'USD',
    referencePrice: 142.50,
    priceChange1D: 2.35,
    priceChangeYTD: 28.4,
    sharesOutstanding: 850, // in Millions
    totalDebt: 12400, // in $M
    cashAndEquivalents: 18900, // in $M
    lastUpdated: '2025-05-14 08:30 EST',
    analyst: 'M. Vance, CFA',
    confidence: 'High',
    description: 'Leading designer of high-performance compute interconnects, custom silicon accelerators, and optical networking subsystems for hyperscale data centers.',
    historical: [
      { year: '2021A', revenue: 21400, ebitda: 7490, netIncome: 5120, fcf: 4850, eps: 6.02, capex: 1500 },
      { year: '2022A', revenue: 24800, ebitda: 8928, netIncome: 6350, fcf: 6100, eps: 7.47, capex: 1680 },
      { year: '2023A', revenue: 28900, ebitda: 10982, netIncome: 7890, fcf: 7420, eps: 9.28, capex: 1920 },
      { year: '2024A', revenue: 34500, ebitda: 13800, netIncome: 10150, fcf: 9650, eps: 11.94, capex: 2210 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 112.4, intrinsic: 148.0 },
      { month: 'Jul 24', price: 118.2, intrinsic: 148.0 },
      { month: 'Aug 24', price: 115.8, intrinsic: 152.0 },
      { month: 'Sep 24', price: 124.5, intrinsic: 152.0 },
      { month: 'Oct 24', price: 129.0, intrinsic: 156.5 },
      { month: 'Nov 24', price: 134.2, intrinsic: 161.0 },
      { month: 'Dec 24', price: 131.8, intrinsic: 161.0 },
      { month: 'Jan 25', price: 138.4, intrinsic: 165.0 },
      { month: 'Feb 25', price: 145.1, intrinsic: 168.0 },
      { month: 'Mar 25', price: 139.6, intrinsic: 171.0 },
      { month: 'Apr 25', price: 140.2, intrinsic: 174.5 },
      { month: 'May 25', price: 142.5, intrinsic: 176.2 },
    ],
    defaultAssumptions: {
      revGrowthY1: 18.0,
      revGrowthY2: 16.5,
      revGrowthY3: 15.0,
      revGrowthY4: 13.5,
      revGrowthY5: 12.0,
      ebitdaMargin: 41.5,
      taxRate: 19.0,
      capexPercentRev: 6.2,
      daPercentRev: 4.8,
      nwcPercentRevChange: 8.0,
      wacc: 9.2,
      terminalGrowth: 3.2,
      exitEbitdaMultiple: 16.5,
      targetPeMultiple: 21.0,
      dcfWeight: 50,
      compsWeight: 30,
      precedentWeight: 20,
    },
    comps: [
      { name: 'Broadcom Inc. (Illustrative)', ticker: 'AVGO', mcap: 615000, evEbitda: 19.4, pe: 24.8, revGrowth: 16.2, ebitdaMargin: 44.0 },
      { name: 'Marvell Technology (Illustrative)', ticker: 'MRVL', mcap: 64000, evEbitda: 17.8, pe: 23.1, revGrowth: 14.8, ebitdaMargin: 35.2 },
      { name: 'Monolithic Power (Illustrative)', ticker: 'MPWR', mcap: 38000, evEbitda: 21.2, pe: 27.5, revGrowth: 18.5, ebitdaMargin: 38.4 },
      { name: 'Qualcomm Inc. (Illustrative)', ticker: 'QCOM', mcap: 188000, evEbitda: 13.5, pe: 16.9, revGrowth: 9.4, ebitdaMargin: 34.8 },
    ],
    precedents: [
      { date: '2024-01', acquirer: 'Synopsys', target: 'Ansys (Illustrative)', ev: 35000, evEbitda: 22.4, premium: 29.0 },
      { date: '2023-11', acquirer: 'Broadcom', target: 'VMware (Illustrative)', ev: 69000, evEbitda: 16.8, premium: 32.5 },
      { date: '2022-02', acquirer: 'AMD', target: 'Xilinx (Illustrative)', ev: 49000, evEbitda: 20.1, premium: 24.8 },
    ],
    thesis: [
      'Dominant 65% market share in 800G/1.6T optical DSP interconnects driving structural gross margin expansion.',
      'Custom AI ASIC design wins with three tier-1 hyperscalers ramping into volume production in FY25-FY26.',
      'Net cash balance sheet ($6.5B net cash) supports aggressive share repurchase program and dividend growth.'
    ],
    risks: [
      'Customer concentration: Top 4 cloud service providers account for 52% of total FY24 revenue.',
      'Geopolitical export restrictions could constrain high-end networking switch shipments into APAC markets.',
      'Cyclical inventory digestion in enterprise campus networking segment.'
    ]
  },
  {
    id: 'meridian',
    ticker: 'MRDN',
    name: 'Meridian MedTech Systems',
    exchange: 'NYSE',
    sector: 'Healthcare',
    industry: 'Robotic Surgery & Medical Devices',
    currency: 'USD',
    referencePrice: 284.00,
    priceChange1D: -1.15,
    priceChangeYTD: 11.2,
    sharesOutstanding: 320,
    totalDebt: 4800,
    cashAndEquivalents: 3100,
    lastUpdated: '2025-05-13 16:45 EST',
    analyst: 'E. Rostova, PhD',
    confidence: 'High',
    description: 'Global manufacturer of minimally invasive robotic surgical platforms, consumables, and AI-assisted diagnostic imaging systems.',
    historical: [
      { year: '2021A', revenue: 8200, ebitda: 2624, netIncome: 1810, fcf: 1650, eps: 5.66, capex: 520 },
      { year: '2022A', revenue: 9150, ebitda: 2973, netIncome: 2040, fcf: 1920, eps: 6.38, capex: 580 },
      { year: '2023A', revenue: 10350, ebitda: 3467, netIncome: 2410, fcf: 2290, eps: 7.53, capex: 640 },
      { year: '2024A', revenue: 11800, ebitda: 4071, netIncome: 2890, fcf: 2740, eps: 9.03, capex: 710 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 245.0, intrinsic: 295.0 },
      { month: 'Jul 24', price: 252.0, intrinsic: 295.0 },
      { month: 'Aug 24', price: 258.5, intrinsic: 302.0 },
      { month: 'Sep 24', price: 261.0, intrinsic: 302.0 },
      { month: 'Oct 24', price: 269.4, intrinsic: 308.0 },
      { month: 'Nov 24', price: 275.0, intrinsic: 312.0 },
      { month: 'Dec 24', price: 271.2, intrinsic: 312.0 },
      { month: 'Jan 25', price: 279.8, intrinsic: 318.0 },
      { month: 'Feb 25', price: 286.4, intrinsic: 320.0 },
      { month: 'Mar 25', price: 281.0, intrinsic: 322.0 },
      { month: 'Apr 25', price: 285.5, intrinsic: 325.0 },
      { month: 'May 25', price: 284.0, intrinsic: 326.8 },
    ],
    defaultAssumptions: {
      revGrowthY1: 14.0,
      revGrowthY2: 13.5,
      revGrowthY3: 13.0,
      revGrowthY4: 12.0,
      revGrowthY5: 11.5,
      ebitdaMargin: 36.0,
      taxRate: 20.5,
      capexPercentRev: 5.8,
      daPercentRev: 4.2,
      nwcPercentRevChange: 6.5,
      wacc: 8.4,
      terminalGrowth: 3.0,
      exitEbitdaMultiple: 21.0,
      targetPeMultiple: 28.5,
      dcfWeight: 55,
      compsWeight: 30,
      precedentWeight: 15,
    },
    comps: [
      { name: 'Intuitive Surgical (Illustrative)', ticker: 'ISRG', mcap: 142000, evEbitda: 26.5, pe: 34.2, revGrowth: 15.4, ebitdaMargin: 37.8 },
      { name: 'Stryker Corp (Illustrative)', ticker: 'SYK', mcap: 128000, evEbitda: 19.8, pe: 26.4, revGrowth: 10.8, ebitdaMargin: 28.5 },
      { name: 'Boston Scientific (Illustrative)', ticker: 'BSX', mcap: 112000, evEbitda: 20.4, pe: 27.9, revGrowth: 12.2, ebitdaMargin: 30.1 },
    ],
    precedents: [
      { date: '2024-04', acquirer: 'J&J', target: 'Shockwave Medical (Illustrative)', ev: 13100, evEbitda: 25.2, premium: 27.0 },
      { date: '2023-09', acquirer: 'Danaher', target: 'Abcam (Illustrative)', ev: 5700, evEbitda: 21.8, premium: 26.0 },
    ],
    thesis: [
      'Recurring instrument and accessory revenue now represents 76% of total sales, providing high cash flow visibility.',
      'FDA clearance of next-gen M5 Surgical Suite expected to trigger a multi-year hospital upgrade cycle.',
      'High switching costs with over 14,500 surgeons certified globally on Meridian architecture.'
    ],
    risks: [
      'Hospital capital expenditure budget constraints in European markets.',
      'Increasing regulatory scrutiny on robotic surgical device pricing.'
    ]
  },
  {
    id: 'vanguard_ind',
    ticker: 'VGRI',
    name: 'Vanguard Grid & Power Corp.',
    exchange: 'NYSE',
    sector: 'Industrials',
    industry: 'Electrical Equipment & Grid Automation',
    currency: 'USD',
    referencePrice: 96.40,
    priceChange1D: 0.85,
    priceChangeYTD: 19.6,
    sharesOutstanding: 410,
    totalDebt: 6200,
    cashAndEquivalents: 1950,
    lastUpdated: '2025-05-12 14:15 EST',
    analyst: 'D. Thorne, CFA',
    confidence: 'Medium',
    description: 'Tier-1 supplier of high-voltage transformers, utility-scale switchgear, and smart grid management software across North America and EMEA.',
    historical: [
      { year: '2021A', revenue: 11200, ebitda: 1904, netIncome: 1120, fcf: 980, eps: 2.73, capex: 490 },
      { year: '2022A', revenue: 12100, ebitda: 2178, netIncome: 1310, fcf: 1190, eps: 3.20, capex: 530 },
      { year: '2023A', revenue: 13450, ebitda: 2555, netIncome: 1580, fcf: 1450, eps: 3.85, capex: 610 },
      { year: '2024A', revenue: 15100, ebitda: 3020, netIncome: 1920, fcf: 1790, eps: 4.68, capex: 680 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 78.5, intrinsic: 82.0 },
      { month: 'Jul 24', price: 81.2, intrinsic: 82.0 },
      { month: 'Aug 24', price: 84.0, intrinsic: 84.5 },
      { month: 'Sep 24', price: 86.8, intrinsic: 84.5 },
      { month: 'Oct 24', price: 89.2, intrinsic: 86.0 },
      { month: 'Nov 24', price: 92.5, intrinsic: 87.5 },
      { month: 'Dec 24', price: 90.1, intrinsic: 87.5 },
      { month: 'Jan 25', price: 93.4, intrinsic: 89.0 },
      { month: 'Feb 25', price: 95.8, intrinsic: 89.0 },
      { month: 'Mar 25', price: 97.2, intrinsic: 90.5 },
      { month: 'Apr 25', price: 95.1, intrinsic: 91.0 },
      { month: 'May 25', price: 96.4, intrinsic: 91.2 },
    ],
    defaultAssumptions: {
      revGrowthY1: 11.0,
      revGrowthY2: 10.0,
      revGrowthY3: 9.0,
      revGrowthY4: 8.0,
      revGrowthY5: 7.0,
      ebitdaMargin: 21.0,
      taxRate: 22.0,
      capexPercentRev: 4.5,
      daPercentRev: 3.5,
      nwcPercentRevChange: 7.0,
      wacc: 8.9,
      terminalGrowth: 2.5,
      exitEbitdaMultiple: 13.5,
      targetPeMultiple: 18.0,
      dcfWeight: 50,
      compsWeight: 35,
      precedentWeight: 15,
    },
    comps: [
      { name: 'Eaton Corp (Illustrative)', ticker: 'ETN', mcap: 132000, evEbitda: 18.2, pe: 24.5, revGrowth: 9.8, ebitdaMargin: 23.4 },
      { name: 'Hubbell Inc (Illustrative)', ticker: 'HUBB', mcap: 21000, evEbitda: 15.6, pe: 21.2, revGrowth: 8.4, ebitdaMargin: 21.8 },
      { name: 'Schneider Electric (Illustrative)', ticker: 'SU', mcap: 140000, evEbitda: 16.1, pe: 22.0, revGrowth: 8.9, ebitdaMargin: 20.9 },
    ],
    precedents: [
      { date: '2023-10', acquirer: 'Hubbell', target: 'Systems Control (Illustrative)', ev: 1100, evEbitda: 14.2, premium: 21.5 },
    ],
    thesis: [
      'Order backlog at record $18.4B (1.2x annual revenue) driven by utility grid hardening and data center power demand.',
      'Pricing power offsetting electrical steel and copper raw material inflation.'
    ],
    risks: [
      'Current valuation reflects peak cycle multiples; limited margin of safety at 20.5x P/E.',
      'Skilled labor bottlenecks delaying factory capacity expansion in Texas and Ohio.'
    ]
  },
  {
    id: 'kestrel',
    ticker: 'KSTL',
    name: 'Kestrel Cloud Security',
    exchange: 'NASDAQ',
    sector: 'Technology',
    industry: 'Enterprise Cybersecurity Software',
    currency: 'USD',
    referencePrice: 218.00,
    priceChange1D: -3.40,
    priceChangeYTD: -6.8,
    sharesOutstanding: 240,
    totalDebt: 1500,
    cashAndEquivalents: 3800,
    lastUpdated: '2025-05-14 09:15 EST',
    analyst: 'M. Vance, CFA',
    confidence: 'Medium',
    description: 'Zero-trust identity governance, cloud workload protection, and autonomous SOC telemetry platform for Fortune 2000 enterprises.',
    historical: [
      { year: '2021A', revenue: 1850, ebitda: 333, netIncome: 195, fcf: 410, eps: 0.81, capex: 65 },
      { year: '2022A', revenue: 2420, ebitda: 508, netIncome: 340, fcf: 620, eps: 1.42, capex: 82 },
      { year: '2023A', revenue: 3080, ebitda: 739, netIncome: 520, fcf: 890, eps: 2.17, capex: 98 },
      { year: '2024A', revenue: 3790, ebitda: 985, netIncome: 740, fcf: 1180, eps: 3.08, capex: 115 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 240.0, intrinsic: 182.0 },
      { month: 'Jul 24', price: 248.0, intrinsic: 182.0 },
      { month: 'Aug 24', price: 235.0, intrinsic: 179.0 },
      { month: 'Sep 24', price: 229.0, intrinsic: 179.0 },
      { month: 'Oct 24', price: 242.0, intrinsic: 181.0 },
      { month: 'Nov 24', price: 238.0, intrinsic: 178.0 },
      { month: 'Dec 24', price: 234.0, intrinsic: 178.0 },
      { month: 'Jan 25', price: 228.0, intrinsic: 176.0 },
      { month: 'Feb 25', price: 225.0, intrinsic: 175.0 },
      { month: 'Mar 25', price: 221.0, intrinsic: 174.0 },
      { month: 'Apr 25', price: 224.0, intrinsic: 173.5 },
      { month: 'May 25', price: 218.0, intrinsic: 172.4 },
    ],
    defaultAssumptions: {
      revGrowthY1: 21.0,
      revGrowthY2: 19.0,
      revGrowthY3: 17.5,
      revGrowthY4: 16.0,
      revGrowthY5: 14.5,
      ebitdaMargin: 28.5,
      taxRate: 18.0,
      capexPercentRev: 3.0,
      daPercentRev: 2.5,
      nwcPercentRevChange: -4.0, // Deferred revenue benefit
      wacc: 10.2,
      terminalGrowth: 3.5,
      exitEbitdaMultiple: 22.0,
      targetPeMultiple: 32.0,
      dcfWeight: 60,
      compsWeight: 25,
      precedentWeight: 15,
    },
    comps: [
      { name: 'Palo Alto Networks (Illustrative)', ticker: 'PANW', mcap: 105000, evEbitda: 27.5, pe: 38.0, revGrowth: 16.5, ebitdaMargin: 29.0 },
      { name: 'CrowdStrike (Illustrative)', ticker: 'CRWD', mcap: 78000, evEbitda: 31.0, pe: 44.5, revGrowth: 26.0, ebitdaMargin: 25.4 },
      { name: 'Zscaler (Illustrative)', ticker: 'ZS', mcap: 28000, evEbitda: 24.8, pe: 35.2, revGrowth: 23.0, ebitdaMargin: 22.1 },
    ],
    precedents: [
      { date: '2023-09', acquirer: 'Cisco', target: 'Splunk (Illustrative)', ev: 28000, evEbitda: 23.5, premium: 31.0 },
    ],
    thesis: [
      'Strong net retention rate (119%) and module cross-selling across identity and cloud telemetry.',
      'Free cash flow conversion exceeds 30% of revenue due to multi-year upfront enterprise billings.'
    ],
    risks: [
      'Stock trades at 52x NTM P/E and 38x EV/EBITDA, pricing in perfection despite elongating CISO sales cycles.',
      'Intense platform bundling competition from Microsoft E5 security suite.',
      'High stock-based compensation (14% of revenue) dilutes GAAP shareholder returns.'
    ]
  },
  {
    id: 'sterling',
    ticker: 'STRL',
    name: 'Sterling Consumer Brands',
    exchange: 'NYSE',
    sector: 'Consumer Staples',
    industry: 'Packaged Foods & Beverages',
    currency: 'USD',
    referencePrice: 64.20,
    priceChange1D: 0.30,
    priceChangeYTD: 4.1,
    sharesOutstanding: 620,
    totalDebt: 14500,
    cashAndEquivalents: 2100,
    lastUpdated: '2025-05-10 11:20 EST',
    analyst: 'L. Chen, CFA',
    confidence: 'High',
    description: 'Multinational portfolio of premium hydration, functional nutrition, and household staple brands distributed across 90+ countries.',
    historical: [
      { year: '2021A', revenue: 22400, ebitda: 4928, netIncome: 2950, fcf: 2680, eps: 4.76, capex: 850 },
      { year: '2022A', revenue: 23500, ebitda: 5052, netIncome: 3020, fcf: 2790, eps: 4.87, capex: 890 },
      { year: '2023A', revenue: 24400, ebitda: 5368, netIncome: 3240, fcf: 3010, eps: 5.23, capex: 920 },
      { year: '2024A', revenue: 25300, ebitda: 5692, netIncome: 3480, fcf: 3250, eps: 5.61, capex: 950 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 60.5, intrinsic: 71.0 },
      { month: 'Jul 24', price: 61.2, intrinsic: 71.0 },
      { month: 'Aug 24', price: 62.0, intrinsic: 72.0 },
      { month: 'Sep 24', price: 61.8, intrinsic: 72.0 },
      { month: 'Oct 24', price: 62.5, intrinsic: 72.5 },
      { month: 'Nov 24', price: 63.1, intrinsic: 73.0 },
      { month: 'Dec 24', price: 61.9, intrinsic: 73.0 },
      { month: 'Jan 25', price: 62.8, intrinsic: 73.5 },
      { month: 'Feb 25', price: 63.4, intrinsic: 74.0 },
      { month: 'Mar 25', price: 63.9, intrinsic: 74.2 },
      { month: 'Apr 25', price: 63.8, intrinsic: 74.5 },
      { month: 'May 25', price: 64.2, intrinsic: 74.8 },
    ],
    defaultAssumptions: {
      revGrowthY1: 4.2,
      revGrowthY2: 4.0,
      revGrowthY3: 3.8,
      revGrowthY4: 3.5,
      revGrowthY5: 3.5,
      ebitdaMargin: 23.0,
      taxRate: 21.0,
      capexPercentRev: 3.7,
      daPercentRev: 3.2,
      nwcPercentRevChange: 3.0,
      wacc: 7.4,
      terminalGrowth: 2.2,
      exitEbitdaMultiple: 11.8,
      targetPeMultiple: 14.5,
      dcfWeight: 50,
      compsWeight: 35,
      precedentWeight: 15,
    },
    comps: [
      { name: 'PepsiCo Inc (Illustrative)', ticker: 'PEP', mcap: 235000, evEbitda: 14.8, pe: 20.5, revGrowth: 4.5, ebitdaMargin: 19.2 },
      { name: 'Mondelez Intl (Illustrative)', ticker: 'MDLZ', mcap: 94000, evEbitda: 14.2, pe: 19.8, revGrowth: 5.1, ebitdaMargin: 20.4 },
      { name: 'Kraft Heinz (Illustrative)', ticker: 'KHC', mcap: 42000, evEbitda: 9.8, pe: 11.9, revGrowth: 1.8, ebitdaMargin: 24.1 },
    ],
    precedents: [
      { date: '2024-08', acquirer: 'Mars', target: 'Kellanova (Illustrative)', ev: 35900, evEbitda: 16.4, premium: 33.0 },
    ],
    thesis: [
      'Defensive cash flow compounder trading at an attractive 11.4x P/E with a 3.8% dividend yield.',
      'Supply chain automation program expected to unlock $400M in structural gross margin savings by FY26.'
    ],
    risks: [
      'Private label market share encroachment in value-conscious North American grocery channels.',
      'Net debt/EBITDA of 2.18x limits near-term M&A flexibility.'
    ]
  },
  {
    id: 'aether',
    ticker: 'AETH',
    name: 'Aether Renewable Infrastructure',
    exchange: 'NYSE',
    sector: 'Energy & Utilities',
    industry: 'Grid-Scale Storage & Clean Power',
    currency: 'USD',
    referencePrice: 48.80,
    priceChange1D: 1.95,
    priceChangeYTD: 14.8,
    sharesOutstanding: 510,
    totalDebt: 11200,
    cashAndEquivalents: 1450,
    lastUpdated: '2025-05-11 17:00 EST',
    analyst: 'D. Thorne, CFA',
    confidence: 'Medium',
    description: 'Independent power producer operating 18 GW of contracted solar, wind, and battery energy storage assets under long-term PPAs.',
    historical: [
      { year: '2021A', revenue: 4100, ebitda: 2255, netIncome: 680, fcf: 1120, eps: 1.33, capex: 1450 },
      { year: '2022A', revenue: 4650, ebitda: 2604, netIncome: 810, fcf: 1340, eps: 1.59, capex: 1620 },
      { year: '2023A', revenue: 5280, ebitda: 3010, netIncome: 960, fcf: 1590, eps: 1.88, capex: 1780 },
      { year: '2024A', revenue: 6050, ebitda: 3509, netIncome: 1150, fcf: 1890, eps: 2.25, capex: 1920 },
    ],
    priceHistory: [
      { month: 'Jun 24', price: 41.0, intrinsic: 55.0 },
      { month: 'Jul 24', price: 42.5, intrinsic: 55.0 },
      { month: 'Aug 24', price: 40.8, intrinsic: 56.0 },
      { month: 'Sep 24', price: 43.2, intrinsic: 56.0 },
      { month: 'Oct 24', price: 44.0, intrinsic: 57.5 },
      { month: 'Nov 24', price: 45.1, intrinsic: 58.0 },
      { month: 'Dec 24', price: 43.9, intrinsic: 58.0 },
      { month: 'Jan 25', price: 45.8, intrinsic: 59.0 },
      { month: 'Feb 25', price: 46.5, intrinsic: 59.5 },
      { month: 'Mar 25', price: 47.2, intrinsic: 60.0 },
      { month: 'Apr 25', price: 47.9, intrinsic: 60.5 },
      { month: 'May 25', price: 48.8, intrinsic: 61.2 },
    ],
    defaultAssumptions: {
      revGrowthY1: 13.5,
      revGrowthY2: 12.5,
      revGrowthY3: 11.5,
      revGrowthY4: 10.5,
      revGrowthY5: 9.5,
      ebitdaMargin: 58.5,
      taxRate: 15.0,
      capexPercentRev: 26.0,
      daPercentRev: 18.0,
      nwcPercentRevChange: 2.0,
      wacc: 7.8,
      terminalGrowth: 2.5,
      exitEbitdaMultiple: 11.2,
      targetPeMultiple: 22.0,
      dcfWeight: 55,
      compsWeight: 25,
      precedentWeight: 20,
    },
    comps: [
      { name: 'NextEra Energy (Illustrative)', ticker: 'NEE', mcap: 152000, evEbitda: 13.4, pe: 21.8, revGrowth: 10.2, ebitdaMargin: 54.0 },
      { name: 'Constellation Energy (Illustrative)', ticker: 'CEG', mcap: 68000, evEbitda: 14.8, pe: 24.5, revGrowth: 11.5, ebitdaMargin: 38.0 },
      { name: 'AES Corp (Illustrative)', ticker: 'AES', mcap: 13500, evEbitda: 9.2, pe: 10.8, revGrowth: 6.4, ebitdaMargin: 42.0 },
    ],
    precedents: [
      { date: '2024-05', acquirer: 'Brookfield', target: 'Neoen (Illustrative)', ev: 6600, evEbitda: 15.1, premium: 26.9 },
    ],
    thesis: [
      'Direct corporate PPA contracts with hyperscale data centers repricing 35% higher upon renewal.',
      '92% of project debt is fixed-rate with average maturity of 8.4 years, insulating cash flows.'
    ],
    risks: [
      'Capital intensive growth requires continuous access to project finance markets.',
      'Interconnection queue delays in ERCOT and PJM regions.'
    ]
  }
];

function calculateCompanyValuation(company, assumptions, scenarioMultiplier = 1.0) {
  const lastHist = company.historical[company.historical.length - 1];
  const baseRev = lastHist.revenue;

  // Apply scenario multiplier to growth & margins
  const growthRates = [
    assumptions.revGrowthY1 * scenarioMultiplier,
    assumptions.revGrowthY2 * scenarioMultiplier,
    assumptions.revGrowthY3 * scenarioMultiplier,
    assumptions.revGrowthY4 * scenarioMultiplier,
    assumptions.revGrowthY5 * scenarioMultiplier,
  ];

  const marginAdj = scenarioMultiplier === 1 ? 0 : (scenarioMultiplier > 1 ? 1.8 : -2.2);
  const effectiveEbitdaMargin = Math.max(5, Math.min(80, assumptions.ebitdaMargin + marginAdj));
  const effectiveWacc = Math.max(4.5, assumptions.wacc + (scenarioMultiplier === 1 ? 0 : (scenarioMultiplier > 1 ? -0.6 : 0.8)));
  const effectiveTgr = Math.min(effectiveWacc - 1.0, Math.max(0.5, assumptions.terminalGrowth + (scenarioMultiplier === 1 ? 0 : (scenarioMultiplier > 1 ? 0.3 : -0.4))));

  const projections = [];
  let prevRev = baseRev;
  let sumPvFcf = 0;

  for (let i = 0; i < 5; i++) {
    const g = growthRates[i] / 100;
    const rev = prevRev * (1 + g);
    const revChange = rev - prevRev;
    const ebitda = rev * (effectiveEbitdaMargin / 100);
    const da = rev * (assumptions.daPercentRev / 100);
    const ebit = ebitda - da;
    const taxes = Math.max(0, ebit * (assumptions.taxRate / 100));
    const nopat = ebit - taxes;
    const capex = rev * (assumptions.capexPercentRev / 100);
    const nwcChange = revChange * (assumptions.nwcPercentRevChange / 100);
    const fcf = nopat + da - capex - nwcChange;
    const discountFactor = Math.pow(1 + effectiveWacc / 100, i + 1);
    const pvFcf = fcf / discountFactor;

    sumPvFcf += pvFcf;
    prevRev = rev;

    projections.push({
      year: `${2025 + i}E`,
      revenue: Math.round(rev),
      growth: +(g * 100).toFixed(1),
      ebitda: Math.round(ebitda),
      ebitdaMargin: +effectiveEbitdaMargin.toFixed(1),
      ebit: Math.round(ebit),
      nopat: Math.round(nopat),
      da: Math.round(da),
      capex: Math.round(capex),
      nwcChange: Math.round(nwcChange),
      fcf: Math.round(fcf),
      pvFcf: Math.round(pvFcf)
    });
  }

  const finalYear = projections[4];
  // Terminal Value via Perpetuity Growth
  const tvPerpetuity = (finalYear.fcf * (1 + effectiveTgr / 100)) / ((effectiveWacc - effectiveTgr) / 100);
  // Terminal Value via Exit Multiple
  const tvMultiple = finalYear.ebitda * assumptions.exitEbitdaMultiple;
  // Blended Terminal Value (50/50)
  const terminalValue = (tvPerpetuity * 0.5) + (tvMultiple * 0.5);
  const pvTerminalValue = terminalValue / Math.pow(1 + effectiveWacc / 100, 5);

  const dcfEnterpriseValue = sumPvFcf + pvTerminalValue;
  const netDebt = company.totalDebt - company.cashAndEquivalents;
  const dcfEquityValue = Math.max(0, dcfEnterpriseValue - netDebt);
  const dcfSharePrice = dcfEquityValue / company.sharesOutstanding;

  // Comparable Company Valuation
  const avgCompEvEbitda = company.comps.reduce((acc, c) => acc + c.evEbitda, 0) / company.comps.length;
  const ntmEbitda = projections[0].ebitda;
  const compsEnterpriseValue = ntmEbitda * avgCompEvEbitda;
  const compsEquityValue = Math.max(0, compsEnterpriseValue - netDebt);
  const compsSharePrice = compsEquityValue / company.sharesOutstanding;

  // Precedent Transactions Valuation
  const avgPrecEvEbitda = company.precedents.reduce((acc, p) => acc + p.evEbitda, 0) / company.precedents.length;
  const precEnterpriseValue = lastHist.ebitda * avgPrecEvEbitda;
  const precEquityValue = Math.max(0, precEnterpriseValue - netDebt);
  const precSharePrice = precEquityValue / company.sharesOutstanding;

  // Weighted Composite Intrinsic Value
  const totalWeight = (assumptions.dcfWeight + assumptions.compsWeight + assumptions.precedentWeight) || 100;
  const compositeIntrinsicValue = (
    (dcfSharePrice * assumptions.dcfWeight) +
    (compsSharePrice * assumptions.compsWeight) +
    (precSharePrice * assumptions.precedentWeight)
  ) / totalWeight;

  // Market Cap and Current EV
  const marketCap = company.referencePrice * company.sharesOutstanding;
  const currentEnterpriseValue = marketCap + netDebt;
  const impliedUpside = ((compositeIntrinsicValue / company.referencePrice) - 1) * 100;

  // Recommendation logic
  let recommendation = 'HOLD';
  if (impliedUpside >= 12.0) recommendation = 'BUY';
  else if (impliedUpside <= -10.0) recommendation = 'SELL';

  return {
    projections,
    sumPvFcf: Math.round(sumPvFcf),
    terminalValue: Math.round(terminalValue),
    pvTerminalValue: Math.round(pvTerminalValue),
    dcfEnterpriseValue: Math.round(dcfEnterpriseValue),
    netDebt: Math.round(netDebt),
    dcfEquityValue: Math.round(dcfEquityValue),
    dcfSharePrice: +dcfSharePrice.toFixed(2),
    compsSharePrice: +compsSharePrice.toFixed(2),
    precSharePrice: +precSharePrice.toFixed(2),
    compositeIntrinsicValue: +compositeIntrinsicValue.toFixed(2),
    marketCap: Math.round(marketCap),
    currentEnterpriseValue: Math.round(currentEnterpriseValue),
    impliedUpside: +impliedUpside.toFixed(1),
    recommendation,
    avgCompEvEbitda: +avgCompEvEbitda.toFixed(1),
    avgPrecEvEbitda: +avgPrecEvEbitda.toFixed(1),
    tvPctOfEv: +((pvTerminalValue / dcfEnterpriseValue) * 100).toFixed(1)
  };
}

const fmtCurrency = (val, decimals = 0, prefix = '$') => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const absVal = Math.abs(val);
  const formatted = absVal.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${val < 0 ? '-' : ''}${prefix}${formatted}`;
};

const fmtCompact = (valInMillions) => {
  if (valInMillions === undefined || valInMillions === null || isNaN(valInMillions)) return '—';
  if (Math.abs(valInMillions) >= 1000) {
    return `$${(valInMillions / 1000).toFixed(2)}B`;
  }
  return `$${valInMillions.toLocaleString('en-US', { maximumFractionDigits: 0 })}M`;
};

const fmtPct = (val, decimals = 1, showPlus = true) => {
  if (val === undefined || val === null || isNaN(val)) return '—';
  const sign = val > 0 && showPlus ? '+' : '';
  return `${sign}${val.toFixed(decimals)}%`;
};

const RecommendationBadge = ({ rec, size = 'md' }) => {
  const styles = {
    BUY: 'bg-emerald-950/10 text-emerald-800 border-emerald-700/30 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    HOLD: 'bg-amber-950/10 text-amber-800 border-amber-700/30 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    SELL: 'bg-rose-950/10 text-rose-800 border-rose-700/30 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  };
  const sz = size === 'lg' ? 'px-3 py-1 text-xs font-bold tracking-wider' : 'px-2 py-0.5 text-[11px] font-bold tracking-wider';
  return (
    <span className={`inline-flex items-center border rounded-sm uppercase font-mono ${styles[rec] || styles.HOLD} ${sz}`}>
      {rec === 'BUY' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />}
      {rec === 'HOLD' && <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />}
      {rec === 'SELL' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mr-1.5" />}
      {rec}
    </span>
  );
};

const INITIAL_MACRO_BENCHMARKS = [
  { id: 'spx', symbol: 'S&P 500', price: 5892.45, changePct: 0.64 },
  { id: 'ndx', symbol: 'NASDAQ 100', price: 20640.10, changePct: 1.12 },
  { id: 'sox', symbol: 'PHLX SEMI', price: 5418.80, changePct: 2.18 },
  { id: 'us10y', symbol: 'UST 10Y YIELD', price: 4.35, changePct: -0.95, isYield: true },
  { id: 'vix', symbol: 'CBOE VIX', price: 13.85, changePct: -4.20 },
  { id: 'dxy', symbol: 'USD INDEX', price: 104.22, changePct: -0.18 },
];

const BREAKING_WIRE_HEADLINES = [
  { id: 1, ticker: 'APX', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'APX: Hyperscale 1.6T optical interconnect orders tracking +14% above Q3 street consensus; house DCF reiterates BUY ($176.20 IV).' },
  { id: 2, ticker: 'KSTL', sentiment: 'BEARISH', time: 'LIVE WIRE', headline: 'KSTL: Enterprise CISO survey indicates elongated deal cycles; shares trade at +26% premium to house DCF intrinsic value.' },
  { id: 3, ticker: 'MRDN', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'MRDN: Next-gen M5 Robotic Surgical Suite hospital utilization rises +19% YoY across North American tier-1 centers.' },
  { id: 4, ticker: 'VGRI', sentiment: 'NEUTRAL', time: 'LIVE WIRE', headline: 'VGRI: High-voltage transformer backlog reaches record $18.4B, though current 20.5x P/E reflects peak-cycle margin assumptions.' },
  { id: 5, ticker: 'AETH', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'AETH: Signs 450 MW 15-year baseload clean power PPA with hyperscale data center operator at +35% re-contracting spread.' },
  { id: 6, ticker: 'STRL', sentiment: 'BULLISH', time: 'LIVE WIRE', headline: 'STRL: Supply chain automation Phase II ahead of schedule; gross margin expansion catalyst supports +16.5% implied upside.' },
];

export default function App() {
  const [activeNav, setActiveNav] = useState('dashboard'); // dashboard, discovery, valuation, decision, modeler, watchlist, reports
  const [selectedCompanyId, setSelectedCompanyId] = useState('apex');
  const [watchlistIds, setWatchlistIds] = useState(['apex', 'meridian', 'vanguard_ind', 'kestrel', 'aether']);
  const [compareIds, setCompareIds] = useState(['apex', 'meridian', 'vanguard_ind']);
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  const [isLiveFeedActive, setIsLiveFeedActive] = useState(true);
  const [livePricesMap, setLivePricesMap] = useState(() => {
    const map = {};
    INITIAL_COMPANIES.forEach(c => {
      map[c.id] = {
        price: c.referencePrice,
        change1D: c.priceChange1D,
        lastDirection: null, // 'up' | 'down' | null
        lastTickTime: Date.now()
      };
    });
    return map;
  });
  const [macroBenchmarks, setMacroBenchmarks] = useState(INITIAL_MACRO_BENCHMARKS);
  const [activeHeadlineIdx, setActiveHeadlineIdx] = useState(0);

  // Simulate real-time price ticks for covered companies and macro benchmarks
  useEffect(() => {
    if (!isLiveFeedActive) return;

    const tickInterval = setInterval(() => {
      // Pick 2 random covered equities to tick
      const randomIds = [...INITIAL_COMPANIES]
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .map(c => c.id);

      setLivePricesMap(prev => {
        const next = { ...prev };
        INITIAL_COMPANIES.forEach(c => {
          if (randomIds.includes(c.id)) {
            const currentObj = prev[c.id] || { price: c.referencePrice, change1D: c.priceChange1D };
            // Random delta between -0.65% and +0.70%
            const pctDelta = (Math.random() - 0.485) * 0.85;
            const rawNewPrice = Math.max(5, currentObj.price * (1 + pctDelta / 100));
            const newPrice = +rawNewPrice.toFixed(2);
            const newChange1D = +(currentObj.change1D + pctDelta * 0.45).toFixed(2);
            const direction = newPrice > currentObj.price ? 'up' : newPrice < currentObj.price ? 'down' : null;

            next[c.id] = {
              price: newPrice,
              change1D: newChange1D,
              lastDirection: direction,
              lastTickTime: Date.now()
            };
          } else if (prev[c.id]?.lastDirection) {
            // Clear flash state on non-ticking stocks
            next[c.id] = { ...prev[c.id], lastDirection: null };
          }
        });
        return next;
      });

      // Also micro-tick one macro benchmark
      setMacroBenchmarks(prev =>
        prev.map((b, idx) => {
          if (idx === Math.floor(Math.random() * prev.length)) {
            const delta = (Math.random() - 0.49) * 0.18;
            const newPrice = +(b.price * (1 + delta / 100)).toFixed(2);
            const newChange = +(b.changePct + delta * 0.5).toFixed(2);
            return { ...b, price: newPrice, changePct: newChange, flash: delta >= 0 ? 'up' : 'down' };
          }
          return { ...b, flash: null };
        })
      );
    }, 2000);

    return () => clearInterval(tickInterval);
  }, [isLiveFeedActive]);

  // Rotate live financial breaking news wire
  useEffect(() => {
    if (!isLiveFeedActive) return;
    const wireInterval = setInterval(() => {
      setActiveHeadlineIdx(prev => (prev + 1) % BREAKING_WIRE_HEADLINES.length);
    }, 5500);
    return () => clearInterval(wireInterval);
  }, [isLiveFeedActive]);

  // Store custom assumptions per company ID
  const [customAssumptionsMap, setCustomAssumptionsMap] = useState(() => {
    const initial = {};
    INITIAL_COMPANIES.forEach(c => {
      initial[c.id] = { ...c.defaultAssumptions };
    });
    return initial;
  });

  // Track recent assumption activity log
  const [activityLog, setActivityLog] = useState([
    { id: 1, timestamp: '10:42 EST', ticker: 'APX', parameter: 'WACC', oldVal: '9.5%', newVal: '9.2%', user: 'M. Vance' },
    { id: 2, timestamp: '09:18 EST', ticker: 'MRDN', parameter: 'FY25 Rev Growth', oldVal: '13.0%', newVal: '14.0%', user: 'E. Rostova' },
    { id: 3, timestamp: 'Yesterday', ticker: 'KSTL', parameter: 'Exit EBITDA Mult.', oldVal: '24.0x', newVal: '22.0x', user: 'M. Vance' },
    { id: 4, timestamp: 'May 12', ticker: 'VGRI', parameter: 'EBITDA Margin', oldVal: '20.2%', newVal: '21.0%', user: 'D. Thorne' },
  ]);

  // Decision workspace state per company
  const [decisionState, setDecisionState] = useState({
    apex: { action: 'BUY', targetEntry: 138.00, targetExit: 175.00, horizon: '12-18 Months', marginOfSafety: 15, notes: 'Accumulate on any pullback below $140 ahead of Q3 hyperscale ASIC ramp.' },
    meridian: { action: 'BUY', targetEntry: 278.00, targetExit: 325.00, horizon: '24 Months', marginOfSafety: 12, notes: 'Core healthcare compounder; initiate 3.5% institutional sleeve.' },
    vanguard_ind: { action: 'HOLD', targetEntry: 82.50, targetExit: 98.00, horizon: '12 Months', marginOfSafety: 15, notes: 'Fundamentals intact but valuation multiples stretched above historical 5Y band.' },
    kestrel: { action: 'SELL', targetEntry: 155.00, targetExit: 175.00, horizon: '6-12 Months', marginOfSafety: 20, notes: 'Trim overweight position; NTM multiple compression risk elevated.' },
    sterling: { action: 'BUY', targetEntry: 63.00, targetExit: 74.00, horizon: '18-24 Months', marginOfSafety: 10, notes: 'Defensive yield anchor with self-help margin catalyst.' },
    aether: { action: 'BUY', targetEntry: 46.50, targetExit: 60.00, horizon: '24-36 Months', marginOfSafety: 15, notes: 'Undervalued contracted cash flows; PPA repricing tailwind.' },
  });

  // Simulated order blotter history
  const [simulatedOrders, setSimulatedOrders] = useState([
    { id: 'ORD-9042', time: '09:34:12 EST', ticker: 'APX', side: 'BUY', qty: 15000, type: 'LIMIT', price: 141.50, notional: 2122500, status: 'SIMULATED / STAGED' },
    { id: 'ORD-8991', time: 'Yesterday', ticker: 'KSTL', side: 'SELL', qty: 8500, type: 'VWAP', price: 218.40, notional: 1856400, status: 'SIMULATED / LOGGED' },
  ]);

  // Notification banner state
  const [toastMessage, setToastMessage] = useState(null);
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Compute live valuation models for all companies
  const enrichedCompanies = useMemo(() => {
    return INITIAL_COMPANIES.map(comp => {
      const liveTick = livePricesMap[comp.id];
      const liveComp = liveTick
        ? {
            ...comp,
            referencePrice: liveTick.price,
            priceChange1D: liveTick.change1D,
            tickDirection: liveTick.lastDirection
          }
        : comp;

      const assumptions = customAssumptionsMap[comp.id] || comp.defaultAssumptions;
      const baseVal = calculateCompanyValuation(liveComp, assumptions, 1.0);
      const bullVal = calculateCompanyValuation(liveComp, assumptions, 1.18);
      const bearVal = calculateCompanyValuation(liveComp, assumptions, 0.82);

      return {
        ...liveComp,
        assumptions,
        valuation: baseVal,
        bullCase: bullVal.compositeIntrinsicValue,
        bearCase: bearVal.compositeIntrinsicValue,
        bullDetails: bullVal,
        bearDetails: bearVal,
        inWatchlist: watchlistIds.includes(comp.id),
      };
    });
  }, [customAssumptionsMap, watchlistIds, livePricesMap]);

  const activeCompany = useMemo(() => {
    return enrichedCompanies.find(c => c.id === selectedCompanyId) || enrichedCompanies[0];
  }, [enrichedCompanies, selectedCompanyId]);

  const updateAssumption = (companyId, key, value, label) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;

    const oldVal = customAssumptionsMap[companyId]?.[key];
    setCustomAssumptionsMap(prev => ({
      ...prev,
      [companyId]: {
        ...prev[companyId],
        [key]: numVal
      }
    }));

    if (label && oldVal !== numVal) {
      const ticker = INITIAL_COMPANIES.find(c => c.id === companyId)?.ticker || 'SYS';
      setActivityLog(prev => [
        {
          id: Date.now(),
          timestamp: 'Just now',
          ticker,
          parameter: label,
          oldVal: `${oldVal}`,
          newVal: `${numVal}`,
          user: 'Current Analyst'
        },
        ...prev.slice(0, 9)
      ]);
    }
  };

  const resetAssumptions = (companyId) => {
    const comp = INITIAL_COMPANIES.find(c => c.id === companyId);
    if (!comp) return;
    setCustomAssumptionsMap(prev => ({
      ...prev,
      [companyId]: { ...comp.defaultAssumptions }
    }));
    triggerToast(`Reset ${comp.ticker} valuation model to institutional baseline defaults.`);
  };

  const toggleWatchlist = (companyId) => {
    const comp = INITIAL_COMPANIES.find(c => c.id === companyId);
    setWatchlistIds(prev => {
      const exists = prev.includes(companyId);
      const updated = exists ? prev.filter(id => id !== companyId) : [...prev, companyId];
      triggerToast(exists ? `Removed ${comp?.ticker} from Institutional Watchlist.` : `Added ${comp?.ticker} to Institutional Watchlist.`);
      return updated;
    });
  };

  const openCompanyWorkspace = (companyId, targetScreen = 'valuation') => {
    setSelectedCompanyId(companyId);
    setActiveNav(targetScreen);
    setGlobalSearchOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: BarChart3, shortcut: '⌘1' },
    { id: 'discovery', label: 'Company Discovery', icon: Search, shortcut: '⌘2' },
    { id: 'valuation', label: 'Valuation Workspace', icon: Scale, shortcut: '⌘3' },
    { id: 'modeler', label: 'Model Assumptions', icon: Sliders, shortcut: '⌘4' },
    { id: 'decision', label: 'Buy / Sell Decision', icon: Target, shortcut: '⌘5' },
    { id: 'watchlist', label: 'Watchlist & Comps', icon: Bookmark, shortcut: '⌘6' },
    { id: 'reports', label: 'Research Report & Export', icon: FileText, shortcut: '⌘7' },
  ];

  const currentWire = BREAKING_WIRE_HEADLINES[activeHeadlineIdx];

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {}
      <style>{`
        @keyframes tickerMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-marquee {
          display: flex;
          width: max-content;
          animation: tickerMarquee 42s linear infinite;
        }
        .animate-ticker-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Top Live Market Ticker Ribbon & Breaking Institutional Wire */}
      <div className="bg-[#050912] text-slate-200 border-b border-slate-800/90 sticky top-0 z-50 select-none">
        {/* Row 1: Continuous Live Equity & Macro Ticker Tape */}
        <div className="h-8 flex items-center justify-between border-b border-slate-800/80 overflow-hidden">
          {/* Left Live Status Badge */}
          <div className="flex items-center space-x-2 px-3 h-full bg-[#0A1120] border-r border-slate-800 shrink-0 z-10">
            <span className="relative flex h-2 w-2">
              {isLiveFeedActive && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveFeedActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-slate-200">
              {isLiveFeedActive ? 'LIVE MARKET TAPE' : 'TAPE PAUSED'}
            </span>
          </div>

          {/* Scrolling Ticker Strip (Duplicated for seamless loop) */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className={isLiveFeedActive ? 'animate-ticker-marquee items-center' : 'flex items-center overflow-x-auto no-scrollbar'}>
              {[0, 1].map(loopIdx => (
                <div key={loopIdx} className="flex items-center divide-x divide-slate-800/80">
                  {/* Covered Institutional Equities */}
                  {enrichedCompanies.map(comp => {
                    const isPositive = comp.priceChange1D >= 0;
                    const isFlashingUp = comp.tickDirection === 'up';
                    const isFlashingDown = comp.tickDirection === 'down';
                    const isSelected = comp.id === selectedCompanyId;

                    return (
                      <button
                        key={`${loopIdx}-${comp.id}`}
                        onClick={() => openCompanyWorkspace(comp.id, 'valuation')}
                        title={`Click to open ${comp.name} (${comp.ticker}) Valuation Workspace`}
                        className={`px-3.5 py-1 flex items-center space-x-2 text-[11px] font-mono transition-colors duration-300 cursor-pointer ${
                          isFlashingUp
                            ? 'bg-emerald-500/25'
                            : isFlashingDown
                            ? 'bg-rose-500/25'
                            : isSelected
                            ? 'bg-slate-800/90'
                            : 'hover:bg-slate-900'
                        }`}
                      >
                        <span className="font-bold text-white tracking-tight">{comp.ticker}</span>
                        <span className={`font-semibold transition-colors duration-300 ${
                          isFlashingUp ? 'text-emerald-300' : isFlashingDown ? 'text-rose-300' : 'text-slate-200'
                        }`}>
                          ${comp.referencePrice.toFixed(2)}
                        </span>
                        <span
                          className={`inline-flex items-center px-1 py-0.2 rounded-xs font-bold text-[10px] ${
                            isPositive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isPositive ? '▲' : '▼'} {Math.abs(comp.priceChange1D).toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-slate-400 hidden sm:inline">
                          IV: <strong className={comp.valuation.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            ${comp.valuation.compositeIntrinsicValue.toFixed(0)}
                          </strong>
                        </span>
                      </button>
                    );
                  })}

                  {/* Macro Market Benchmarks */}
                  {macroBenchmarks.map(macro => {
                    const isPos = macro.changePct >= 0;
                    return (
                      <div
                        key={`${loopIdx}-${macro.id}`}
                        className={`px-3.5 py-1 flex items-center space-x-2 text-[11px] font-mono transition-colors duration-300 ${
                          macro.flash === 'up'
                            ? 'bg-emerald-500/20'
                            : macro.flash === 'down'
                            ? 'bg-rose-500/20'
                            : 'bg-[#070C18]'
                        }`}
                      >
                        <span className="text-slate-400 font-semibold">{macro.symbol}</span>
                        <span className="text-slate-200">
                          {macro.isYield ? `${macro.price.toFixed(2)}%` : macro.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`font-bold text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '▲' : '▼'}{Math.abs(macro.changePct).toFixed(2)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Right Feed Controls */}
          <div className="flex items-center space-x-2 px-3 h-full bg-[#0A1120] border-l border-slate-800 shrink-0 z-10 font-mono text-[10px]">
            <button
              onClick={() => setIsLiveFeedActive(!isLiveFeedActive)}
              className={`px-2 py-0.5 rounded-xs border transition cursor-pointer ${
                isLiveFeedActive
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                  : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              {isLiveFeedActive ? '● LIVE FEED' : '❚❚ PAUSED'}
            </button>
          </div>
        </div>

        {/* Row 2: Breaking Institutional Research & Valuation Dislocation Wire */}
        <div className="h-6 bg-[#080E1C] px-3 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center space-x-2.5 overflow-hidden pr-4">
            <span className="px-1.5 py-0.2 bg-blue-600/20 border border-blue-500/40 text-blue-300 font-bold text-[10px] rounded-xs shrink-0">
              RESEARCH FLASH
            </span>
            <span
              className={`px-1.5 py-0.2 rounded-xs font-bold text-[10px] shrink-0 ${
                currentWire.sentiment === 'BULLISH'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : currentWire.sentiment === 'BEARISH'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {currentWire.sentiment}
            </span>
            <button
              onClick={() => {
                const target = INITIAL_COMPANIES.find(c => c.ticker === currentWire.ticker);
                if (target) openCompanyWorkspace(target.id, 'valuation');
              }}
              className="text-slate-300 hover:text-white truncate text-left cursor-pointer"
            >
              {currentWire.headline}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-3 shrink-0 text-[10px] text-slate-400">
            <div className="flex items-center space-x-1">
              <span>ADVANCING:</span>
              <span className="text-emerald-400 font-bold">
                {enrichedCompanies.filter(c => c.priceChange1D >= 0).length}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span>DECLINING:</span>
              <span className="text-rose-400 font-bold">
                {enrichedCompanies.filter(c => c.priceChange1D < 0).length}
              </span>
            </div>
            <div className="flex items-center space-x-1 border-l border-slate-800 pl-2">
              <button
                onClick={() => setActiveHeadlineIdx((prev) => (prev + 1) % BREAKING_WIRE_HEADLINES.length)}
                className="text-slate-400 hover:text-white"
                title="Next Flash Headline"
              >
                NEXT WIRE ▸
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top Institutional Terminal Bar */}
      <header className="h-12 bg-[#0A1120] text-slate-200 border-b border-slate-800 px-4 flex items-center justify-between sticky top-14 z-40">
        <div className="flex items-center space-x-6">
          <div
            onClick={() => setActiveNav('dashboard')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-6 h-6 bg-blue-600 flex items-center justify-center rounded-sm font-mono font-bold text-xs text-white tracking-tighter">
              VX
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-bold tracking-wider text-sm text-white">VALUEX</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest border-l border-slate-700 pl-1.5">
                INSTITUTIONAL EQUITY RESEARCH
              </span>
            </div>
          </div>

          {/* Active Security Context Pill */}
          <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-sm px-2.5 py-1 text-xs space-x-3">
            <span className="text-slate-400 font-mono text-[11px]">ACTIVE SECURITY:</span>
            <span className="font-mono font-bold text-white">{activeCompany.ticker}</span>
            <span className="text-slate-300 truncate max-w-[160px]">{activeCompany.name}</span>
            <span className={`font-mono font-bold px-1.5 py-0.2 rounded-xs transition-colors duration-300 ${
              activeCompany.tickDirection === 'up'
                ? 'bg-emerald-500/30 text-emerald-300'
                : activeCompany.tickDirection === 'down'
                ? 'bg-rose-500/30 text-rose-300'
                : 'text-slate-200'
            }`}>
              ${activeCompany.referencePrice.toFixed(2)}
            </span>
            <span className={`font-mono text-[11px] font-bold ${
              activeCompany.priceChange1D >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              ({activeCompany.priceChange1D >= 0 ? '▲+' : '▼'}{activeCompany.priceChange1D.toFixed(2)}%)
            </span>
            <span className={`font-mono font-semibold border-l border-slate-700 pl-2.5 ${activeCompany.valuation.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              IV: ${activeCompany.valuation.compositeIntrinsicValue.toFixed(2)} ({fmtPct(activeCompany.valuation.impliedUpside)})
            </span>
          </div>
        </div>

        {/* Quick Command Search & Status */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setGlobalSearchOpen(!globalSearchOpen)}
              className="flex items-center space-x-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 rounded-sm px-3 py-1 text-xs transition"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Jump to Ticker or Model...</span>
              <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">CTRL+K</span>
            </button>

            {globalSearchOpen && (
              <div className="absolute right-0 mt-1.5 w-96 bg-white text-slate-900 rounded-sm shadow-2xl border border-slate-300 z-50 overflow-hidden">
                <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center">
                  <Search className="w-4 h-4 text-slate-400 mr-2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Filter by ticker (APX, MRDN...) or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs bg-transparent focus:outline-none"
                  />
                  <button onClick={() => setGlobalSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {enrichedCompanies
                    .filter(c =>
                      c.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      c.sector.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(c => (
                      <div
                        key={c.id}
                        onClick={() => openCompanyWorkspace(c.id, 'valuation')}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-slate-900">{c.ticker}</span>
                            <span className="text-slate-700 font-medium">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{c.exchange} • {c.industry}</span>
                        </div>
                        <div className="text-right font-mono">
                          <div className="text-slate-900 font-semibold">${c.referencePrice.toFixed(2)}</div>
                          <div className={`text-[10px] ${c.valuation.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            IV: ${c.valuation.compositeIntrinsicValue.toFixed(2)} ({fmtPct(c.valuation.impliedUpside)})
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-sm text-[11px] font-mono">
            <Info className="w-3 h-3 shrink-0" />
            <span>ILLUSTRATIVE MOCK DATA</span>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Institutional Sidebar Navigation */}
        <aside className="w-60 bg-[#0F172A] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0">
          <div className="p-3 space-y-4">
            {/* Active Company Switcher inside Sidebar */}
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-sm">
              <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                Active Coverage Security
              </label>
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="w-full bg-slate-950 text-white border border-slate-700 rounded-sm px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-blue-500"
              >
                {enrichedCompanies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.ticker} — {c.name.slice(0, 18)}
                  </option>
                ))}
              </select>
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Signal:</span>
                <RecommendationBadge rec={activeCompany.valuation.recommendation} />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                Core Workflows
              </div>
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNav(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-sm text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${isActive ? 'text-blue-200' : 'text-slate-500'}`}>
                      {item.shortcut}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Coverage List */}
            <div className="pt-2 border-t border-slate-800">
              <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <span>Coverage Universe</span>
                <span>Upside</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {enrichedCompanies.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompanyId(comp.id);
                      if (activeNav === 'dashboard' || activeNav === 'discovery') {
                        setActiveNav('valuation');
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-mono transition ${
                      selectedCompanyId === comp.id
                        ? 'bg-slate-800 text-white border-l-2 border-blue-500'
                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200 w-10 text-left">{comp.ticker}</span>
                      <span className="text-[11px] text-slate-400">${comp.referencePrice.toFixed(0)}</span>
                    </div>
                    <span className={comp.valuation.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {fmtPct(comp.valuation.impliedUpside)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer Disclaimer */}
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between font-mono text-slate-300">
              <span>ENGINE: DCF + MULTIPLES</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <p className="leading-relaxed text-slate-500">
              Illustrative institutional terminal. All financial figures and valuations are simulated for analytical demonstration.
            </p>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Toast feedback banner */}
          {toastMessage && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white border border-slate-700 px-4 py-2.5 rounded-sm shadow-xl flex items-center space-x-2.5 text-xs z-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {activeNav === 'dashboard' && (
            <ExecutiveDashboard
              companies={enrichedCompanies}
              activityLog={activityLog}
              onSelectCompany={openCompanyWorkspace}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'discovery' && (
            <CompanyDiscovery
              companies={enrichedCompanies}
              onSelectCompany={openCompanyWorkspace}
              onToggleWatchlist={toggleWatchlist}
            />
          )}

          {activeNav === 'valuation' && (
            <ValuationWorkspace
              company={activeCompany}
              onUpdateAssumption={(key, val, label) => updateAssumption(activeCompany.id, key, val, label)}
              onResetAssumptions={() => resetAssumptions(activeCompany.id)}
              onToggleWatchlist={() => toggleWatchlist(activeCompany.id)}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'modeler' && (
            <ValuationModelEditor
              company={activeCompany}
              onUpdateAssumption={(key, val, label) => updateAssumption(activeCompany.id, key, val, label)}
              onResetAssumptions={() => resetAssumptions(activeCompany.id)}
              onNavigate={setActiveNav}
            />
          )}

          {activeNav === 'decision' && (
            <BuySellDecisionWorkspace
              company={activeCompany}
              decision={decisionState[activeCompany.id]}
              onUpdateDecision={(updated) => {
                setDecisionState(prev => ({
                  ...prev,
                  [activeCompany.id]: { ...prev[activeCompany.id], ...updated }
                }));
                triggerToast(`Updated investment thesis & decision parameters for ${activeCompany.ticker}.`);
              }}
              simulatedOrders={simulatedOrders}
              onStageOrder={(newOrder) => {
                setSimulatedOrders(prev => [newOrder, ...prev]);
                triggerToast(`Staged simulated ${newOrder.side} ticket (${newOrder.qty.toLocaleString()} shs ${newOrder.ticker}).`);
              }}
            />
          )}

          {activeNav === 'watchlist' && (
            <WatchlistAndComparison
              companies={enrichedCompanies}
              watchlistIds={watchlistIds}
              compareIds={compareIds}
              setCompareIds={setCompareIds}
              onToggleWatchlist={toggleWatchlist}
              onSelectCompany={openCompanyWorkspace}
            />
          )}

          {activeNav === 'reports' && (
            <ReportsAndExport
              company={activeCompany}
              decision={decisionState[activeCompany.id]}
              onTriggerToast={triggerToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ExecutiveDashboard({ companies, activityLog, onSelectCompany, onNavigate }) {
  const totalTrackedMcap = companies.reduce((sum, c) => sum + c.valuation.marketCap, 0);
  const totalImpliedEv = companies.reduce((sum, c) => sum + c.valuation.dcfEnterpriseValue, 0);
  const avgUpside = companies.reduce((sum, c) => sum + c.valuation.impliedUpside, 0) / companies.length;

  const buyCount = companies.filter(c => c.valuation.recommendation === 'BUY').length;
  const holdCount = companies.filter(c => c.valuation.recommendation === 'HOLD').length;
  const sellCount = companies.filter(c => c.valuation.recommendation === 'SELL').length;

  const sortedByUpside = [...companies].sort((a, b) => b.valuation.impliedUpside - a.valuation.impliedUpside);

  const chartData = sortedByUpside.map(c => ({
    ticker: c.ticker,
    referencePrice: c.referencePrice,
    intrinsicValue: c.valuation.compositeIntrinsicValue,
    upside: c.valuation.impliedUpside
  }));

  return (
    <div className="space-y-5">
      {/* Page Title & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Executive Coverage & Valuation Overview</h1>
            <span className="text-[11px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-sm">FY25E CONSENSUS + HOUSE DCF</span>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time intrinsic valuation surveillance, implied margin-of-safety rankings, and coverage universe rating distribution.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('discovery')}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded-sm flex items-center space-x-1.5 shadow-2xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>Screen Coverage</span>
          </button>
          <button
            onClick={() => onNavigate('valuation')}
            className="px-3 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white text-xs font-medium rounded-sm flex items-center space-x-1.5 shadow-2xs"
          >
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Open Active Valuation Model</span>
          </button>
        </div>
      </div>

      {/* Top Compact Institutional Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-sm p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Tracked Market Cap</span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">{fmtCompact(totalTrackedMcap)}</span>
            <span className="text-xs font-mono text-slate-500">{companies.length} Active Names</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Implied DCF EV Total:</span>
            <span className="font-mono font-semibold text-slate-800">{fmtCompact(totalImpliedEv)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Coverage Avg. Implied Upside</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${avgUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(avgUpside)}
            </span>
            <span className="text-xs font-mono text-slate-500">vs. Ref Prices</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Top Conviction Idea:</span>
            <span className="font-mono font-bold text-emerald-700">
              {sortedByUpside[0].ticker} ({fmtPct(sortedByUpside[0].valuation.impliedUpside)})
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>Signal Distribution</span>
            <Activity className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1.5 flex items-center space-x-3">
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-emerald-700">{buyCount}</span>
              <span className="text-[11px] font-mono text-slate-500">BUY</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-amber-700">{holdCount}</span>
              <span className="text-[11px] font-mono text-slate-500">HOLD</span>
            </div>
            <span className="text-slate-300">/</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold font-mono text-rose-700">{sellCount}</span>
              <span className="text-[11px] font-mono text-slate-500">SELL</span>
            </div>
          </div>
          <div className="mt-2.5 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
            <div style={{ width: `${(buyCount / companies.length) * 100}%` }} className="bg-emerald-600 h-full" />
            <div style={{ width: `${(holdCount / companies.length) * 100}%` }} className="bg-amber-500 h-full" />
            <div style={{ width: `${(sellCount / companies.length) * 100}%` }} className="bg-rose-600 h-full" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-sm p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 uppercase">
            <span>House Cost of Capital (WACC)</span>
            <Percent className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900">
              {(companies.reduce((s, c) => s + c.assumptions.wacc, 0) / companies.length).toFixed(2)}%
            </span>
            <span className="text-xs font-mono text-slate-500">Median: 8.65%</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Risk-Free Rate Benchmark:</span>
            <span className="font-mono font-semibold text-slate-800">4.35% (UST 10Y)</span>
          </div>
        </div>
      </div>

      {/* Main Valuation Surveillance Table + Dislocation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns: Institutional Coverage Valuation Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                Coverage Universe Valuation Matrix
              </h2>
              <p className="text-[11px] text-slate-500">
                Click any row to launch the company’s full DCF, multiples, and sensitivity workspace.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Values in USD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                  <th className="py-2.5 px-3">Ticker / Company</th>
                  <th className="py-2.5 px-3 text-right">Ref. Price</th>
                  <th className="py-2.5 px-3 text-right">Intrinsic Val</th>
                  <th className="py-2.5 px-3 text-right">Upside / Downside</th>
                  <th className="py-2.5 px-3 text-center">Bear / Base / Bull Range</th>
                  <th className="py-2.5 px-3 text-right">EV/EBITDA</th>
                  <th className="py-2.5 px-3 text-center">Signal</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70 text-xs">
                {sortedByUpside.map(comp => {
                  const v = comp.valuation;
                  const evEbitda = (v.currentEnterpriseValue / comp.historical[3].ebitda).toFixed(1);
                  return (
                    <tr
                      key={comp.id}
                      onClick={() => onSelectCompany(comp.id, 'valuation')}
                      className="hover:bg-blue-50/40 cursor-pointer transition group"
                    >
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-blue-700">{comp.ticker}</span>
                          <span className="text-slate-700 font-medium truncate max-w-[150px]">{comp.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{comp.sector} • {comp.exchange}</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                        ${comp.referencePrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ${v.compositeIntrinsicValue.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={`inline-flex items-center ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {v.impliedUpside >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                          {fmtPct(v.impliedUpside)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-center text-slate-600">
                        <span className="text-rose-700">${comp.bearCase.toFixed(0)}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="font-bold text-slate-900">${v.compositeIntrinsicValue.toFixed(0)}</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span className="text-emerald-700">${comp.bullCase.toFixed(0)}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {evEbitda}x
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <RecommendationBadge rec={v.recommendation} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCompany(comp.id, 'decision');
                          }}
                          className="text-[11px] font-mono text-blue-700 hover:text-blue-900 font-medium underline"
                        >
                          Trade / Thesis
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Implied Upside / Downside Ranking Chart */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Implied Valuation Dislocation (%)
                </h2>
                <p className="text-[11px] text-slate-500">Composite Intrinsic Value vs. Reference Share Price</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 25, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis dataKey="ticker" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: '#0F172A' }} width={48} />
                  <Tooltip
                    formatter={(val) => [`${val > 0 ? '+' : ''}${val}%`, 'Implied Upside']}
                    contentStyle={{ fontSize: '11px', borderRadius: '2px', border: '1px solid #CBD5E1' }}
                  />
                  <ReferenceLine x={0} stroke="#0F172A" strokeWidth={1} />
                  <Bar dataKey="upside" radius={[0, 2, 2, 0]} barSize={20}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.upside >= 0 ? '#059669' : '#E11D48'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Hurdle for BUY Signal: <strong className="font-mono text-emerald-700">+12.0%</strong></span>
            <span>SELL Threshold: <strong className="font-mono text-rose-700">-10.0%</strong></span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Model Assumption Changes & Sector Multiples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Model Revisions Log */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Recent Model Assumption Revisions
            </h3>
            <span className="text-[10px] font-mono text-slate-500">LIVE AUDIT TRAIL</span>
          </div>
          <div className="divide-y divide-slate-100">
            {activityLog.slice(0, 5).map(item => (
              <div key={item.id} className="px-4 py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono font-bold bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded-sm text-slate-900">
                    {item.ticker}
                  </span>
                  <div>
                    <span className="font-medium text-slate-800">{item.parameter}</span>
                    <span className="text-slate-500 ml-2 text-[11px]">by {item.user}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className="text-slate-400 line-through">{item.oldVal}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-blue-700">{item.newVal}</span>
                  <span className="text-[10px] text-slate-400 w-16 text-right">{item.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Valuation & Multiple Context */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              Sector Benchmark Multiples & WACC Reference
            </h3>
            <span className="text-[10px] font-mono text-slate-500">HOUSE RESEARCH BENCHMARKS</span>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2 px-3">Sector</th>
                <th className="py-2 px-3 text-right">Median EV/EBITDA</th>
                <th className="py-2 px-3 text-right">Median NTM P/E</th>
                <th className="py-2 px-3 text-right">Benchmark WACC</th>
                <th className="py-2 px-3 text-right">House Stance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">Semiconductors & AI Infra</td>
                <td className="py-2 px-3 text-right">18.4x</td>
                <td className="py-2 px-3 text-right">24.2x</td>
                <td className="py-2 px-3 text-right">9.3%</td>
                <td className="py-2 px-3 text-right text-emerald-700 font-bold">OVERWEIGHT</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">MedTech & Robotic Devices</td>
                <td className="py-2 px-3 text-right">21.2x</td>
                <td className="py-2 px-3 text-right">28.5x</td>
                <td className="py-2 px-3 text-right">8.4%</td>
                <td className="py-2 px-3 text-right text-emerald-700 font-bold">OVERWEIGHT</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">Industrial Grid & Power</td>
                <td className="py-2 px-3 text-right">15.8x</td>
                <td className="py-2 px-3 text-right">21.0x</td>
                <td className="py-2 px-3 text-right">8.8%</td>
                <td className="py-2 px-3 text-right text-amber-700 font-bold">NEUTRAL</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-medium text-slate-800">Enterprise Cloud Security</td>
                <td className="py-2 px-3 text-right">27.8x</td>
                <td className="py-2 px-3 text-right">39.5x</td>
                <td className="py-2 px-3 text-right">10.1%</td>
                <td className="py-2 px-3 text-right text-rose-700 font-bold">UNDERWEIGHT</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompanyDiscovery({ companies, onSelectCompany, onToggleWatchlist }) {
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [signalFilter, setSignalFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('upside');

  const sectors = ['ALL', ...Array.from(new Set(companies.map(c => c.sector)))];

  const filtered = useMemo(() => {
    return companies
      .filter(c => {
        const matchesText =
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.ticker.toLowerCase().includes(search.toLowerCase()) ||
          c.industry.toLowerCase().includes(search.toLowerCase());
        const matchesSector = sectorFilter === 'ALL' || c.sector === sectorFilter;
        const matchesSignal = signalFilter === 'ALL' || c.valuation.recommendation === signalFilter;
        return matchesText && matchesSector && matchesSignal;
      })
      .sort((a, b) => {
        if (sortBy === 'upside') return b.valuation.impliedUpside - a.valuation.impliedUpside;
        if (sortBy === 'mcap') return b.valuation.marketCap - a.valuation.marketCap;
        if (sortBy === 'ytd') return b.priceChangeYTD - a.priceChangeYTD;
        return a.ticker.localeCompare(b.ticker);
      });
  }, [companies, search, sectorFilter, signalFilter, sortBy]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Security Screener & Discovery</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Search covered public equities by ticker, industry vertical, or valuation signal. All metrics reflect illustrative house models.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-sm p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticker (e.g. APX, MRDN), company name, or sub-industry..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-mono text-[11px]">SECTOR:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="border border-slate-300 rounded-sm px-2.5 py-1.5 bg-white text-xs font-medium"
            >
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-mono text-[11px]">SIGNAL:</span>
            <select
              value={signalFilter}
              onChange={(e) => setSignalFilter(e.target.value)}
              className="border border-slate-300 rounded-sm px-2.5 py-1.5 bg-white text-xs font-mono"
            >
              <option value="ALL">ALL SIGNALS</option>
              <option value="BUY">BUY ONLY</option>
              <option value="HOLD">HOLD ONLY</option>
              <option value="SELL">SELL ONLY</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-slate-500 font-mono text-[11px]">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-slate-300 rounded-sm px-2.5 py-1.5 bg-white text-xs"
            >
              <option value="upside">Implied Upside (High → Low)</option>
              <option value="mcap">Market Cap (High → Low)</option>
              <option value="ytd">YTD Return (High → Low)</option>
              <option value="ticker">Ticker (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Discovery Grid / Cards + Table View */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-sm p-12 text-center space-y-2">
          <Search className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="text-sm font-semibold text-slate-800">No Covered Companies Match Your Filter Criteria</div>
          <p className="text-xs text-slate-500">Try clearing the sector or signal filter to restore the full coverage universe.</p>
          <button
            onClick={() => { setSearch(''); setSectorFilter('ALL'); setSignalFilter('ALL'); }}
            className="mt-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(comp => {
            const v = comp.valuation;
            const lastHist = comp.historical[comp.historical.length - 1];
            return (
              <div
                key={comp.id}
                className="bg-white border border-slate-200 hover:border-slate-400 rounded-sm shadow-2xs flex flex-col justify-between transition"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded-sm">
                          {comp.ticker}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">{comp.exchange}</span>
                        <RecommendationBadge rec={v.recommendation} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1.5">{comp.name}</h3>
                      <p className="text-[11px] text-slate-500">{comp.sector} • {comp.industry}</p>
                    </div>
                    <button
                      onClick={() => onToggleWatchlist(comp.id)}
                      title={comp.inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      className={`p-1.5 rounded-sm border ${
                        comp.inWatchlist
                          ? 'bg-blue-50 border-blue-200 text-blue-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>

                  {/* Core Pricing & Intrinsic Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-200/80 p-2.5 rounded-sm font-mono">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Ref Price</div>
                      <div className="text-sm font-bold text-slate-900">${comp.referencePrice.toFixed(2)}</div>
                      <div className={`text-[10px] ${comp.priceChangeYTD >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        YTD: {fmtPct(comp.priceChangeYTD)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Intrinsic Val</div>
                      <div className="text-sm font-bold text-blue-900">${v.compositeIntrinsicValue.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">DCF: ${v.dcfSharePrice.toFixed(0)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Implied Diff</div>
                      <div className={`text-sm font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {fmtPct(v.impliedUpside)}
                      </div>
                      <div className="text-[10px] text-slate-500">Conf: {comp.confidence}</div>
                    </div>
                  </div>

                  {/* Fundamental Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Market Cap</span>
                      <span className="font-semibold text-slate-800">{fmtCompact(v.marketCap)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">FY24 Revenue</span>
                      <span className="font-semibold text-slate-800">{fmtCompact(lastHist.revenue)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">FY24 EBITDA</span>
                      <span className="font-semibold text-slate-800">
                        {fmtCompact(lastHist.ebitda)} ({((lastHist.ebitda / lastHist.revenue) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">Analyst: {comp.analyst}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectCompany(comp.id, 'modeler')}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-300 bg-white rounded-sm"
                    >
                      Assumptions
                    </button>
                    <button
                      onClick={() => onSelectCompany(comp.id, 'valuation')}
                      className="px-3 py-1 text-xs font-medium bg-[#0A1120] hover:bg-slate-800 text-white rounded-sm flex items-center space-x-1"
                    >
                      <span>Valuation Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ValuationWorkspace({ company, onUpdateAssumption, onResetAssumptions, onToggleWatchlist, onNavigate }) {
  const [activeTab, setActiveTab] = useState('dcf'); // dcf, comps, precedents, financials, sensitivity
  const v = company.valuation;
  const a = company.assumptions;
  const lastHist = company.historical[company.historical.length - 1];

  // Combine Historical + Projected for Charting
  const combinedFinancials = useMemo(() => {
    const histFormatted = company.historical.map(h => ({
      year: h.year,
      revenue: h.revenue,
      ebitda: h.ebitda,
      fcf: h.fcf,
      ebitdaMargin: +((h.ebitda / h.revenue) * 100).toFixed(1),
      type: 'Historical'
    }));
    const projFormatted = v.projections.map(p => ({
      year: p.year,
      revenue: p.revenue,
      ebitda: p.ebitda,
      fcf: p.fcf,
      ebitdaMargin: p.ebitdaMargin,
      type: 'Projected'
    }));
    return [...histFormatted, ...projFormatted];
  }, [company, v]);

  // Football field valuation range data
  const footballField = [
    {
      method: '5-Year DCF Analysis',
      low: +(v.dcfSharePrice * 0.85).toFixed(2),
      base: v.dcfSharePrice,
      high: +(v.dcfSharePrice * 1.16).toFixed(2),
    },
    {
      method: 'Trading Comparables (EV/EBITDA)',
      low: +(v.compsSharePrice * 0.88).toFixed(2),
      base: v.compsSharePrice,
      high: +(v.compsSharePrice * 1.12).toFixed(2),
    },
    {
      method: 'Precedent M&A Transactions',
      low: +(v.precSharePrice * 0.90).toFixed(2),
      base: v.precSharePrice,
      high: +(v.precSharePrice * 1.15).toFixed(2),
    },
    {
      method: 'House Composite Range',
      low: company.bearCase,
      base: v.compositeIntrinsicValue,
      high: company.bullCase,
    }
  ];

  // Generate 5x5 WACC vs Terminal Growth Rate Sensitivity Matrix for DCF Share Price
  const waccSteps = [-1.0, -0.5, 0, 0.5, 1.0].map(d => +(a.wacc + d).toFixed(1));
  const tgrSteps = [-0.6, -0.3, 0, 0.3, 0.6].map(d => +(a.terminalGrowth + d).toFixed(1));

  return (
    <div className="space-y-5">
      {/* Institutional Security Header Banner */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-base bg-[#0A1120] text-white px-2.5 py-0.5 rounded-sm">
                {company.ticker}
              </span>
              <h1 className="text-lg font-bold text-slate-900">{company.name}</h1>
              <span className="text-xs font-mono text-slate-500">({company.exchange} • {company.industry})</span>
              <RecommendationBadge rec={v.recommendation} size="lg" />
            </div>
            <p className="text-xs text-slate-600 max-w-3xl">{company.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onToggleWatchlist}
              className={`px-3 py-1.5 border rounded-sm text-xs font-medium flex items-center space-x-1.5 ${
                company.inWatchlist
                  ? 'bg-blue-50 border-blue-300 text-blue-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{company.inWatchlist ? 'Watchlisted' : 'Watchlist'}</span>
            </button>
            <button
              onClick={() => onNavigate('modeler')}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-sm text-xs font-medium flex items-center space-x-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>Model Editor</span>
            </button>
            <button
              onClick={() => onNavigate('decision')}
              className="px-3.5 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white rounded-sm text-xs font-medium flex items-center space-x-1.5"
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Buy / Sell Decision Ticket</span>
            </button>
          </div>
        </div>

        {/* Valuation Executive Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 font-mono">
          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Reference Share Price</span>
            <span className="text-lg font-bold text-slate-900">${company.referencePrice.toFixed(2)}</span>
            <span className={`block text-[11px] ${company.priceChange1D >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              1D: {fmtPct(company.priceChange1D)} | YTD: {fmtPct(company.priceChangeYTD)}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Intrinsic Value (Base)</span>
            <span className="text-lg font-bold text-blue-700">${v.compositeIntrinsicValue.toFixed(2)}</span>
            <span className="block text-[11px] text-slate-500">
              DCF: ${v.dcfSharePrice.toFixed(2)} | Comps: ${v.compsSharePrice.toFixed(2)}
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Implied Upside / Downside</span>
            <span className={`text-lg font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(v.impliedUpside)}
            </span>
            <span className="block text-[11px] text-slate-500">
              Spread: ${(v.compositeIntrinsicValue - company.referencePrice).toFixed(2)} / sh
            </span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Scenario Range (Bear / Bull)</span>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              <span className="text-rose-700">${company.bearCase.toFixed(2)}</span>
              <span className="mx-1.5 text-slate-400">—</span>
              <span className="text-emerald-700">${company.bullCase.toFixed(2)}</span>
            </div>
            <span className="block text-[11px] text-slate-500 mt-0.5">Confidence: {company.confidence}</span>
          </div>

          <div className="border-r border-slate-100 pr-2">
            <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value (Current)</span>
            <span className="text-lg font-bold text-slate-900">{fmtCompact(v.currentEnterpriseValue)}</span>
            <span className="block text-[11px] text-slate-500">
              MCap: {fmtCompact(v.marketCap)} | Net Debt: {fmtCompact(v.netDebt)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 uppercase block">FY24A Core Actuals</span>
            <span className="text-sm font-bold text-slate-900 block mt-0.5">
              Rev: {fmtCompact(lastHist.revenue)}
            </span>
            <span className="block text-[11px] text-slate-500 mt-0.5">
              EBITDA: {fmtCompact(lastHist.ebitda)} | NI: {fmtCompact(lastHist.netIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* Visualizations Row: Historical Price vs Intrinsic Value + Football Field */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Share Price vs Intrinsic Value Track */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                12M Share Price vs. Estimated Intrinsic Value ($)
              </h2>
              <p className="text-[11px] text-slate-500">Tracking market price dislocation against house intrinsic value estimates</p>
            </div>
            <span className="text-[11px] font-mono text-blue-700 font-semibold">
              Current Spread: {fmtPct(v.impliedUpside)}
            </span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={company.priceHistory} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '2px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="intrinsic" name="House Intrinsic Value ($)" fill="#DBEAFE" stroke="#1D4ED8" strokeWidth={2} strokeDasharray="4 4" />
                <Line type="monotone" dataKey="price" name="Reference Market Price ($)" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Valuation Football Field Range */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                  Valuation Methodology Football Field ($ / Share)
                </h2>
                <p className="text-[11px] text-slate-500">Implied share price ranges across DCF, Trading Multiples, and M&A Precedents</p>
              </div>
              <span className="text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded-sm text-slate-800">
                Ref: ${company.referencePrice.toFixed(2)}
              </span>
            </div>

            <div className="space-y-3.5 py-1">
              {footballField.map((item, idx) => {
                const minScale = Math.min(...footballField.map(f => f.low), company.referencePrice) * 0.85;
                const maxScale = Math.max(...footballField.map(f => f.high), company.referencePrice) * 1.1;
                const leftPct = ((item.low - minScale) / (maxScale - minScale)) * 100;
                const widthPct = ((item.high - item.low) / (maxScale - minScale)) * 100;
                const basePct = ((item.base - minScale) / (maxScale - minScale)) * 100;
                const refPct = ((company.referencePrice - minScale) / (maxScale - minScale)) * 100;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">{item.method}</span>
                      <span className="font-mono text-[11px] text-slate-600">
                        ${item.low.toFixed(2)} — <strong className="text-slate-900">${item.base.toFixed(2)}</strong> — ${item.high.toFixed(2)}
                      </span>
                    </div>
                    <div className="relative h-5 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                      {/* Range Bar */}
                      <div
                        style={{ left: `${Math.max(0, leftPct)}%`, width: `${Math.min(100, widthPct)}%` }}
                        className={`absolute top-1 bottom-1 rounded-xs ${
                          idx === 3 ? 'bg-blue-600/80' : 'bg-slate-700/75'
                        }`}
                      />
                      {/* Base Marker */}
                      <div
                        style={{ left: `${basePct}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-white z-10"
                      />
                      {/* Reference Price Vertical Line */}
                      <div
                        style={{ left: `${refPct}%` }}
                        title={`Reference Price: $${company.referencePrice}`}
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-20"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="flex items-center">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block mr-1.5 rounded-xs" />
              Amber Line = Current Reference Price (${company.referencePrice.toFixed(2)})
            </span>
            <span>Weights: {a.dcfWeight}% DCF / {a.compsWeight}% Comps / {a.precedentWeight}% M&A</span>
          </div>
        </div>
      </div>

      {/* Analytical Methodology Tabs */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 flex flex-wrap items-center justify-between">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dcf', label: '1. Discounted Cash Flow (DCF)' },
              { id: 'comps', label: '2. Comparable Companies (Multiples)' },
              { id: 'precedents', label: '3. Precedent Transactions' },
              { id: 'financials', label: '4. Historical & Projected Financials' },
              { id: 'sensitivity', label: '5. Scenarios & WACC Sensitivity' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-mono font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            onClick={onResetAssumptions}
            className="text-[11px] font-mono text-slate-500 hover:text-slate-900 flex items-center space-x-1 py-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Model Inputs</span>
          </button>
        </div>

        {/* TAB 1: DCF MODEL */}
        {activeTab === 'dcf' && (
          <div className="p-4 space-y-5">
            {/* Interactive Quick DCF Drivers Strip */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase font-mono text-slate-800 flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-blue-600" />
                  <span>Interactive DCF Key Drivers (Adjust to Recalculate Live)</span>
                </span>
                <span className="text-xs font-mono text-blue-700 font-bold">
                  Implied DCF Value: ${v.dcfSharePrice.toFixed(2)} / sh
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">FY25 Rev Growth (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a.revGrowthY1}
                    onChange={(e) => onUpdateAssumption('revGrowthY1', e.target.value, 'FY25 Rev Growth')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">EBITDA Margin (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a.ebitdaMargin}
                    onChange={(e) => onUpdateAssumption('ebitdaMargin', e.target.value, 'Target EBITDA Margin')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">WACC (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={a.wacc}
                    onChange={(e) => onUpdateAssumption('wacc', e.target.value, 'WACC')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Terminal Growth (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={a.terminalGrowth}
                    onChange={(e) => onUpdateAssumption('terminalGrowth', e.target.value, 'Terminal Growth')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Exit EBITDA Mult (x)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a.exitEbitdaMultiple}
                    onChange={(e) => onUpdateAssumption('exitEbitdaMultiple', e.target.value, 'Exit EBITDA Mult.')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase">Effective Tax (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={a.taxRate}
                    onChange={(e) => onUpdateAssumption('taxRate', e.target.value, 'Effective Tax Rate')}
                    className="mt-1 w-full bg-white border border-blue-300 focus:border-blue-600 rounded-sm px-2 py-1 text-xs font-mono font-bold text-blue-900"
                  />
                </div>
              </div>
            </div>

            {/* 5-Year Explicit Cash Flow Schedule Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                    <th className="py-2 px-3 font-sans">DCF Line Item ($ Millions)</th>
                    <th className="py-2 px-3 text-right bg-slate-200/60">2024A Base</th>
                    {v.projections.map(p => (
                      <th key={p.year} className="py-2 px-3 text-right">{p.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">Projected Revenue</td>
                    <td className="py-2 px-3 text-right bg-slate-50">{fmtCurrency(lastHist.revenue)}</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right font-semibold">{fmtCurrency(p.revenue)}</td>
                    ))}
                  </tr>
                  <tr className="text-slate-500 text-[11px]">
                    <td className="py-1.5 px-3 font-sans italic">YoY Revenue Growth (%)</td>
                    <td className="py-1.5 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-1.5 px-3 text-right text-blue-700">{p.growth.toFixed(1)}%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-semibold text-slate-900">EBITDA</td>
                    <td className="py-2 px-3 text-right bg-slate-50">{fmtCurrency(lastHist.ebitda)}</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right">{fmtCurrency(p.ebitda)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">(-) Depreciation & Amortization</td>
                    <td className="py-2 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right text-slate-600">({fmtCurrency(p.da)})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-900">Operating Income (EBIT)</td>
                    <td className="py-2 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right">{fmtCurrency(p.ebit)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">NOPAT (Post-Tax Operating Profit)</td>
                    <td className="py-2 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right">{fmtCurrency(p.nopat)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">(-) Capital Expenditures (CapEx)</td>
                    <td className="py-2 px-3 text-right bg-slate-50">({fmtCurrency(lastHist.capex)})</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right text-slate-600">({fmtCurrency(p.capex)})</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans text-slate-700">(-/+) Change in Net Working Capital</td>
                    <td className="py-2 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right text-slate-600">{fmtCurrency(-p.nwcChange)}</td>
                    ))}
                  </tr>
                  <tr className="bg-blue-50/50 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2.5 px-3 font-sans">Unlevered Free Cash Flow (UFCF)</td>
                    <td className="py-2.5 px-3 text-right bg-slate-100">{fmtCurrency(lastHist.fcf)}</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2.5 px-3 text-right text-blue-900">{fmtCurrency(p.fcf)}</td>
                    ))}
                  </tr>
                  <tr className="text-slate-600">
                    <td className="py-2 px-3 font-sans">Present Value of Free Cash Flow (@ {a.wacc}% WACC)</td>
                    <td className="py-2 px-3 text-right bg-slate-50">—</td>
                    {v.projections.map(p => (
                      <td key={p.year} className="py-2 px-3 text-right font-semibold">{fmtCurrency(p.pvFcf)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Enterprise-to-Equity Bridge Summary Box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2 font-mono text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                <span className="text-[10px] text-slate-500 uppercase block">Cumulative PV of 5Y FCF</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(v.sumPvFcf)}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{(100 - v.tvPctOfEv).toFixed(1)}% of Implied EV</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                <span className="text-[10px] text-slate-500 uppercase block">PV of Terminal Value</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(v.pvTerminalValue)}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">{v.tvPctOfEv}% of Implied EV</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm">
                <span className="text-[10px] text-slate-500 uppercase block">Implied Enterprise Value</span>
                <span className="text-base font-bold text-slate-900">{fmtCompact(v.dcfEnterpriseValue)}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Less Net Debt: {fmtCompact(v.netDebt)}</span>
              </div>
              <div className="bg-blue-950 text-white p-3 rounded-sm">
                <span className="text-[10px] text-blue-300 uppercase block">Implied DCF Value / Share</span>
                <span className="text-lg font-bold text-white">${v.dcfSharePrice.toFixed(2)}</span>
                <span className="text-[11px] text-blue-200 block mt-0.5">
                  Implied Equity: {fmtCompact(v.dcfEquityValue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARABLE COMPANIES */}
        {activeTab === 'comps' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                  Public Peer Trading Multiples Benchmark (Illustrative)
                </h3>
                <p className="text-xs text-slate-500">
                  Implied valuation derived from peer group average EV/EBITDA ({v.avgCompEvEbitda}x) applied to FY25E EBITDA.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Implied Comps Share Price</span>
                <span className="text-base font-bold text-blue-700">${v.compsSharePrice.toFixed(2)}</span>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3 font-sans">Peer Company</th>
                  <th className="py-2.5 px-3">Ticker</th>
                  <th className="py-2.5 px-3 text-right">Market Cap</th>
                  <th className="py-2.5 px-3 text-right">EV / NTM EBITDA</th>
                  <th className="py-2.5 px-3 text-right">NTM P / E</th>
                  <th className="py-2.5 px-3 text-right">Rev Growth (%)</th>
                  <th className="py-2.5 px-3 text-right">EBITDA Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {company.comps.map((peer, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{peer.name}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-700">{peer.ticker}</td>
                    <td className="py-2.5 px-3 text-right">{fmtCompact(peer.mcap)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold">{peer.evEbitda.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right">{peer.pe.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">{peer.revGrowth.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right">{peer.ebitdaMargin.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                  <td className="py-2.5 px-3 font-sans">Peer Group Mean</td>
                  <td className="py-2.5 px-3">—</td>
                  <td className="py-2.5 px-3 text-right">
                    {fmtCompact(company.comps.reduce((s, c) => s + c.mcap, 0) / company.comps.length)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-blue-700">{v.avgCompEvEbitda}x</td>
                  <td className="py-2.5 px-3 text-right">
                    {(company.comps.reduce((s, c) => s + c.pe, 0) / company.comps.length).toFixed(1)}x
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(company.comps.reduce((s, c) => s + c.revGrowth, 0) / company.comps.length).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {(company.comps.reduce((s, c) => s + c.ebitdaMargin, 0) / company.comps.length).toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-blue-50/60 font-bold text-slate-900">
                  <td className="py-2.5 px-3 font-sans">{company.name} (Subject)</td>
                  <td className="py-2.5 px-3 text-blue-700">{company.ticker}</td>
                  <td className="py-2.5 px-3 text-right">{fmtCompact(v.marketCap)}</td>
                  <td className="py-2.5 px-3 text-right">{(v.currentEnterpriseValue / v.projections[0].ebitda).toFixed(1)}x</td>
                  <td className="py-2.5 px-3 text-right">{(company.referencePrice / lastHist.eps).toFixed(1)}x</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700">{a.revGrowthY1.toFixed(1)}%</td>
                  <td className="py-2.5 px-3 text-right">{a.ebitdaMargin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: PRECEDENT TRANSACTIONS */}
        {activeTab === 'precedents' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800">
                  Precedent M&A Transactions Analysis (Illustrative)
                </h3>
                <p className="text-xs text-slate-500">
                  Control transaction multiples observed in sector M&A. Mean EV/LTM EBITDA: {v.avgPrecEvEbitda}x.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-slate-500 block uppercase">Implied M&A Precedent Value</span>
                <span className="text-base font-bold text-blue-700">${v.precSharePrice.toFixed(2)}</span>
              </div>
            </div>

            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                  <th className="py-2.5 px-3">Announcement Date</th>
                  <th className="py-2.5 px-3 font-sans">Acquirer</th>
                  <th className="py-2.5 px-3 font-sans">Target</th>
                  <th className="py-2.5 px-3 text-right">Transaction EV</th>
                  <th className="py-2.5 px-3 text-right">EV / LTM EBITDA</th>
                  <th className="py-2.5 px-3 text-right">Control Premium (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {company.precedents.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-600">{tx.date}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{tx.acquirer}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-900">{tx.target}</td>
                    <td className="py-2.5 px-3 text-right">{fmtCompact(tx.ev)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">{tx.evEbitda.toFixed(1)}x</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700">+{tx.premium.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: HISTORICAL & PROJECTED FINANCIALS */}
        {activeTab === 'financials' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="border border-slate-200 p-3 rounded-sm">
                <h4 className="text-xs font-bold uppercase font-mono text-slate-700 mb-2">
                  Revenue & EBITDA Trajectory (2021A – 2029E, $M)
                </h4>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={combinedFinancials}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}B`} />
                      <Tooltip contentStyle={{ fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="revenue" name="Revenue ($M)" fill="#1E293B" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="ebitda" name="EBITDA ($M)" fill="#2563EB" radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="fcf" name="Free Cash Flow ($M)" stroke="#059669" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="border border-slate-200 p-3 rounded-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-700 mb-2">
                    Balance Sheet & Capital Structure Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3 font-mono text-xs mt-3">
                    <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Cash & Marketable Sec.</span>
                      <span className="text-base font-bold text-emerald-700">{fmtCompact(company.cashAndEquivalents)}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Total Gross Debt</span>
                      <span className="text-base font-bold text-slate-900">{fmtCompact(company.totalDebt)}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Net Debt / (Net Cash)</span>
                      <span className="text-base font-bold text-slate-900">{fmtCompact(v.netDebt)}</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">Net Leverage (Net Debt/EBITDA)</span>
                      <span className="text-base font-bold text-slate-900">
                        {(v.netDebt / lastHist.ebitda).toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                  Enterprise Value Formula Applied: <code className="font-mono text-slate-800">EV = Equity Value + Total Debt - Cash & Equivalents</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SENSITIVITY MATRIX & SCENARIOS */}
        {activeTab === 'sensitivity' && (
          <div className="p-4 space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 2D Sensitivity Matrix: WACC vs TGR */}
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800 mb-1">
                  DCF Implied Share Price Sensitivity: WACC vs. Terminal Growth Rate
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Highlighted center cell represents current Base Case DCF output (${v.dcfSharePrice.toFixed(2)}). Green cells indicate upside vs. Reference Price (${company.referencePrice.toFixed(2)}).
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse font-mono text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 text-[10px] text-slate-600">
                        <th className="py-2 px-2 border-r border-slate-300">WACC \ TGR</th>
                        {tgrSteps.map(tgr => (
                          <th key={tgr} className="py-2 px-2">{tgr.toFixed(1)}%</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {waccSteps.map((waccVal, rIdx) => (
                        <tr key={waccVal}>
                          <td className="py-2 px-2 font-bold bg-slate-100 border-r border-slate-300 text-slate-700">
                            {waccVal.toFixed(1)}%
                          </td>
                          {tgrSteps.map((tgrVal, cIdx) => {
                            const tempVal = calculateCompanyValuation(company, {
                              ...a,
                              wacc: waccVal,
                              terminalGrowth: tgrVal
                            });
                            const price = tempVal.dcfSharePrice;
                            const isCenter = rIdx === 2 && cIdx === 2;
                            const isAboveRef = price >= company.referencePrice;
                            return (
                              <td
                                key={tgrVal}
                                className={`py-2 px-2 ${
                                  isCenter
                                    ? 'bg-blue-900 text-white font-bold ring-2 ring-blue-500'
                                    : isAboveRef
                                    ? 'bg-emerald-50/70 text-emerald-900'
                                    : 'bg-rose-50/70 text-rose-900'
                                }`}
                              >
                                ${price.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bear / Base / Bull Scenario Breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase font-mono text-slate-800 mb-1">
                  Bear / Base / Bull Scenario Output Comparison
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Scenario stress-testing across growth trajectory, operating leverage, and discount rate assumptions.
                </p>

                <table className="w-full text-left border-collapse font-mono text-xs border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-[10px] uppercase text-slate-600">
                      <th className="py-2 px-3 font-sans">Scenario Metric</th>
                      <th className="py-2 px-3 text-right text-rose-700">Bear Case (-18% Vol)</th>
                      <th className="py-2 px-3 text-right text-blue-800">Base Case (House)</th>
                      <th className="py-2 px-3 text-right text-emerald-700">Bull Case (+18% Vol)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-700">FY25E Revenue Growth</td>
                      <td className="py-2 px-3 text-right">{(a.revGrowthY1 * 0.82).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right font-bold">{a.revGrowthY1.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">{(a.revGrowthY1 * 1.18).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-700">Steady-State EBITDA Margin</td>
                      <td className="py-2 px-3 text-right">{(a.ebitdaMargin - 2.2).toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right font-bold">{a.ebitdaMargin.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">{(a.ebitdaMargin + 1.8).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-700">Implied DCF Share Value</td>
                      <td className="py-2 px-3 text-right">${company.bearDetails.dcfSharePrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold">${v.dcfSharePrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right">${company.bullDetails.dcfSharePrice.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="py-2.5 px-3 font-sans text-slate-900">Composite Intrinsic Value</td>
                      <td className="py-2.5 px-3 text-right text-rose-700">${company.bearCase.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-blue-700">${v.compositeIntrinsicValue.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-700">${company.bullCase.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-sans text-slate-700">Implied Return vs. Ref Price</td>
                      <td className="py-2 px-3 text-right text-rose-700">
                        {fmtPct(((company.bearCase / company.referencePrice) - 1) * 100)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        {fmtPct(v.impliedUpside)}
                      </td>
                      <td className="py-2 px-3 text-right text-emerald-700">
                        {fmtPct(((company.bullCase / company.referencePrice) - 1) * 100)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ValuationModelEditor({ company, onUpdateAssumption, onResetAssumptions, onNavigate }) {
  const a = company.assumptions;
  const v = company.valuation;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-sm">{company.ticker}</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Valuation Model Assumptions & Parameter Editor</h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Institutional convention: <span className="text-blue-700 font-mono font-semibold">Blue inputs</span> represent editable analyst assumptions; <span className="text-slate-900 font-mono font-semibold">Black figures</span> represent calculated model outputs.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onResetAssumptions}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-sm flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restore House Defaults</span>
          </button>
          <button
            onClick={() => onNavigate('valuation')}
            className="px-3 py-1.5 bg-[#0A1120] text-white text-xs font-medium rounded-sm"
          >
            Return to Valuation Workspace
          </button>
        </div>
      </div>

      {/* Live Output Monitor Bar */}
      <div className="bg-[#0A1120] text-white p-4 rounded-sm grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Reference Price</span>
          <span className="text-lg font-bold">${company.referencePrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-blue-300 uppercase block">Composite Intrinsic Value</span>
          <span className="text-lg font-bold text-blue-400">${v.compositeIntrinsicValue.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">DCF Share Value</span>
          <span className="text-lg font-bold">${v.dcfSharePrice.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Implied Upside / Downside</span>
          <span className={`text-lg font-bold ${v.impliedUpside >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {fmtPct(v.impliedUpside)}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block">Implied House Rating</span>
          <div className="mt-1">
            <RecommendationBadge rec={v.recommendation} size="lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Top-Line Growth Trajectory */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
            1. Explicit 5-Year Revenue Growth Curve (%)
          </h2>
          {[
            { key: 'revGrowthY1', label: 'Year 1 (2025E) Revenue Growth %' },
            { key: 'revGrowthY2', label: 'Year 2 (2026E) Revenue Growth %' },
            { key: 'revGrowthY3', label: 'Year 3 (2027E) Revenue Growth %' },
            { key: 'revGrowthY4', label: 'Year 4 (2028E) Revenue Growth %' },
            { key: 'revGrowthY5', label: 'Year 5 (2029E) Revenue Growth %' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between text-xs py-1">
              <label className="text-slate-700 font-medium">{item.label}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="-10"
                  max="45"
                  step="0.5"
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-24 accent-blue-600"
                />
                <input
                  type="number"
                  step="0.5"
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-16 text-right font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-300 rounded-sm px-1.5 py-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: Operating Margins & Cash Flow Conversion */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
            2. Profitability & Reinvestment Intensity
          </h2>
          {[
            { key: 'ebitdaMargin', label: 'Target EBITDA Margin (%)', min: 5, max: 75, step: 0.5 },
            { key: 'taxRate', label: 'Effective Corporate Tax Rate (%)', min: 5, max: 35, step: 0.5 },
            { key: 'capexPercentRev', label: 'CapEx (% of Revenue)', min: 1, max: 35, step: 0.2 },
            { key: 'daPercentRev', label: 'D&A (% of Revenue)', min: 1, max: 25, step: 0.2 },
            { key: 'nwcPercentRevChange', label: 'Chg in NWC (% of Incremental Rev)', min: -15, max: 25, step: 0.5 },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between text-xs py-1">
              <label className="text-slate-700 font-medium">{item.label}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-24 accent-blue-600"
                />
                <input
                  type="number"
                  step={item.step}
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-16 text-right font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-300 rounded-sm px-1.5 py-1"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Column 3: Cost of Capital & Methodology Weights */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
            3. Discount Rate (WACC) & Methodology Weights
          </h2>
          {[
            { key: 'wacc', label: 'Weighted Avg Cost of Capital (WACC %)', min: 5.0, max: 16.0, step: 0.1 },
            { key: 'terminalGrowth', label: 'Perpetuity Terminal Growth Rate (%)', min: 0.5, max: 5.0, step: 0.1 },
            { key: 'exitEbitdaMultiple', label: 'Terminal Exit EV/EBITDA Multiple (x)', min: 6.0, max: 35.0, step: 0.5 },
            { key: 'dcfWeight', label: 'DCF Methodology Weight (%)', min: 0, max: 100, step: 5 },
            { key: 'compsWeight', label: 'Trading Comps Weight (%)', min: 0, max: 100, step: 5 },
            { key: 'precedentWeight', label: 'Precedent M&A Weight (%)', min: 0, max: 100, step: 5 },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between text-xs py-1">
              <label className="text-slate-700 font-medium">{item.label}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-24 accent-blue-600"
                />
                <input
                  type="number"
                  step={item.step}
                  value={a[item.key]}
                  onChange={(e) => onUpdateAssumption(item.key, e.target.value, item.label)}
                  className="w-16 text-right font-mono font-bold text-blue-700 bg-blue-50/50 border border-blue-300 rounded-sm px-1.5 py-1"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BuySellDecisionWorkspace({ company, decision, onUpdateDecision, simulatedOrders, onStageOrder }) {
  const v = company.valuation;
  const [orderSide, setOrderSide] = useState(v.recommendation === 'SELL' ? 'SELL' : 'BUY');
  const [orderQty, setOrderQty] = useState(5000);
  const [orderType, setOrderType] = useState('LIMIT');
  const [limitPrice, setLimitPrice] = useState(company.referencePrice);

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    const notional = orderQty * limitPrice;
    onStageOrder({
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      time: 'Just now',
      ticker: company.ticker,
      side: orderSide,
      qty: Number(orderQty),
      type: orderType,
      price: Number(limitPrice),
      notional,
      status: 'SIMULATED / STAGED'
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-sm">{company.ticker}</span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Investment Committee Decision & Simulated Execution</h1>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Translate intrinsic valuation outputs into structured buy/hold/sell recommendations, price targets, and simulated institutional order tickets.
          </p>
        </div>
      </div>

      {/* Top Valuation vs Target Price Decision Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 block">Model Signal & Conviction</span>
          <div className="mt-2 flex items-center justify-between">
            <RecommendationBadge rec={v.recommendation} size="lg" />
            <span className="font-mono text-xs text-slate-600">Conf: {company.confidence}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Driven by {fmtPct(v.impliedUpside)} spread to composite intrinsic value.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs font-mono">
          <span className="text-[10px] uppercase text-slate-500 block">Intrinsic Value vs. Market</span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-xl font-bold text-blue-700">${v.compositeIntrinsicValue.toFixed(2)}</span>
            <span className="text-xs text-slate-500">vs. ${company.referencePrice.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Margin of Safety Target: {decision.marginOfSafety}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs font-mono">
          <span className="text-[10px] uppercase text-slate-500 block">Target Entry / Target Exit</span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-base font-bold text-emerald-700">In: ${decision.targetEntry.toFixed(2)}</span>
            <span className="text-slate-300">/</span>
            <span className="text-base font-bold text-slate-900">Out: ${decision.targetExit.toFixed(2)}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Horizon: {decision.horizon}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-2xs font-mono">
          <span className="text-[10px] uppercase text-slate-500 block">Risk / Reward Ratio</span>
          <div className="mt-1.5 text-xl font-bold text-slate-900">
            {Math.abs((company.bullCase - company.referencePrice) / Math.max(1, company.referencePrice - company.bearCase)).toFixed(2)}x
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Bull (+${(company.bullCase - company.referencePrice).toFixed(0)}) vs Bear (-${Math.abs(company.referencePrice - company.bearCase).toFixed(0)})
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Left = Thesis, Risks & Decision Parameters | Right = Simulated Order Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Investment Thesis, Risks & Editable Decision Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
              Investment Thesis & Key Catalysts ({company.ticker})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-emerald-800 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Core Bullish Pillars</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {company.thesis.map((t, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-sm">
                      <span className="font-mono font-bold text-emerald-700">0{i + 1}.</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-rose-800 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Key Downside Risks & Sensitivities</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  {company.risks.map((r, i) => (
                    <li key={i} className="flex items-start space-x-2 bg-rose-50/40 border border-rose-100 p-2.5 rounded-sm">
                      <span className="font-mono font-bold text-rose-700">R{i + 1}.</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Committee Decision Parameter Editor */}
          <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase font-mono text-slate-800 border-b border-slate-200 pb-2">
              Analyst Decision Parameters & PM Rationale
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Committee Action</label>
                <select
                  value={decision.action}
                  onChange={(e) => onUpdateDecision({ action: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono font-bold"
                >
                  <option value="BUY">BUY / ACCUMULATE</option>
                  <option value="HOLD">HOLD / NEUTRAL</option>
                  <option value="SELL">SELL / TRIM</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Target Entry ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={decision.targetEntry}
                  onChange={(e) => onUpdateDecision({ targetEntry: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Target Exit ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={decision.targetExit}
                  onChange={(e) => onUpdateDecision({ targetExit: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-slate-500">Investment Horizon</label>
                <input
                  type="text"
                  value={decision.horizon}
                  onChange={(e) => onUpdateDecision({ horizon: e.target.value })}
                  className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">
                Portfolio Manager Decision Notes & Execution Conditions
              </label>
              <textarea
                rows={2}
                value={decision.notes}
                onChange={(e) => onUpdateDecision({ notes: e.target.value })}
                className="w-full border border-slate-300 rounded-sm p-2 text-xs text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Institutional Order Staging Ticket */}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="bg-[#0A1120] text-white px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Simulated Order Ticket (EMS Preview)
              </span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-sm">
                SIMULATION ONLY
              </span>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('BUY')}
                  className={`py-2 font-mono font-bold rounded-sm border transition ${
                    orderSide === 'BUY'
                      ? 'bg-emerald-700 text-white border-emerald-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('SELL')}
                  className={`py-2 font-mono font-bold rounded-sm border transition ${
                    orderSide === 'SELL'
                      ? 'bg-rose-700 text-white border-rose-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  SELL / REDUCE
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Security</label>
                  <input
                    type="text"
                    disabled
                    value={`${company.ticker} (${company.exchange})`}
                    className="mt-1 w-full bg-slate-100 border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono font-bold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Order Strategy</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono"
                  >
                    <option value="LIMIT">LIMIT</option>
                    <option value="VWAP">INSTITUTIONAL VWAP</option>
                    <option value="TWAP">ALGO TWAP</option>
                    <option value="MARKET">MARKET</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Share Quantity</label>
                  <input
                    type="number"
                    step="500"
                    min="100"
                    value={orderQty}
                    onChange={(e) => setOrderQty(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-500">Indicative Limit ($)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="mt-1 w-full border border-slate-300 rounded-sm px-2.5 py-1.5 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-sm font-mono space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Estimated Gross Notional:</span>
                  <span className="font-bold text-slate-900">{fmtCurrency(orderQty * limitPrice, 2)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Implied Discount to Intrinsic:</span>
                  <span className="text-emerald-700 font-semibold">
                    {fmtPct(((v.compositeIntrinsicValue / limitPrice) - 1) * 100)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-sm font-mono font-bold text-xs text-white shadow-sm transition ${
                  orderSide === 'BUY' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                STAGE SIMULATED {orderSide} TICKET ({company.ticker})
              </button>
            </form>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
            Notice: Frontend workflow simulation only. Orders are logged locally to the blotter below and never routed to an exchange.
          </div>
        </div>
      </div>

      {/* Simulated Order Blotter Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase font-mono text-slate-800">Simulated Order Staging Blotter</h3>
          <span className="text-[10px] font-mono text-slate-500">LOCAL SESSION LOG</span>
        </div>
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
              <th className="py-2 px-3">Order ID</th>
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3">Ticker</th>
              <th className="py-2 px-3">Side</th>
              <th className="py-2 px-3 text-right">Quantity</th>
              <th className="py-2 px-3">Order Type</th>
              <th className="py-2 px-3 text-right">Indicative Price</th>
              <th className="py-2 px-3 text-right">Estimated Notional</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {simulatedOrders.map(ord => (
              <tr key={ord.id}>
                <td className="py-2 px-3 font-bold text-slate-700">{ord.id}</td>
                <td className="py-2 px-3 text-slate-500">{ord.time}</td>
                <td className="py-2 px-3 font-bold text-slate-900">{ord.ticker}</td>
                <td className="py-2 px-3">
                  <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold ${
                    ord.side === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ord.side}
                  </span>
                </td>
                <td className="py-2 px-3 text-right">{ord.qty.toLocaleString()}</td>
                <td className="py-2 px-3">{ord.type}</td>
                <td className="py-2 px-3 text-right">${ord.price.toFixed(2)}</td>
                <td className="py-2 px-3 text-right font-semibold">{fmtCurrency(ord.notional)}</td>
                <td className="py-2 px-3 text-right text-[10px] text-amber-700 font-semibold">{ord.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WatchlistAndComparison({ companies, watchlistIds, compareIds, setCompareIds, onToggleWatchlist, onSelectCompany }) {
  const watchlistedCompanies = companies.filter(c => watchlistIds.includes(c.id));
  const comparedCompanies = companies.filter(c => compareIds.includes(c.id));

  const toggleCompare = (id) => {
    if (compareIds.includes(id)) {
      if (compareIds.length > 1) setCompareIds(compareIds.filter(i => i !== id));
    } else {
      setCompareIds([...compareIds, id]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Watchlist & Cross-Company Benchmarking</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Monitor watchlisted equities and conduct side-by-side fundamental & valuation multiple comparisons.
          </p>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800">
            Monitored Institutional Watchlist ({watchlistedCompanies.length})
          </h2>
          <span className="text-[11px] text-slate-500">Select checkboxes to include in Side-by-Side Comparison below</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-mono uppercase text-slate-500">
                <th className="py-2.5 px-3">Compare</th>
                <th className="py-2.5 px-3">Ticker / Company</th>
                <th className="py-2.5 px-3 text-right">Ref. Price</th>
                <th className="py-2.5 px-3 text-right">Composite Intrinsic</th>
                <th className="py-2.5 px-3 text-right">Implied Upside</th>
                <th className="py-2.5 px-3 text-right">DCF Value</th>
                <th className="py-2.5 px-3 text-right">Comps Value</th>
                <th className="py-2.5 px-3 text-center">Signal</th>
                <th className="py-2.5 px-3 text-right">Last Model Update</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 font-mono">
              {watchlistedCompanies.map(comp => {
                const v = comp.valuation;
                return (
                  <tr key={comp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <input
                        type="checkbox"
                        checked={compareIds.includes(comp.id)}
                        onChange={() => toggleCompare(comp.id)}
                        className="accent-blue-600 w-3.5 h-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{comp.ticker}</span>
                        <span className="font-medium text-slate-800">{comp.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">${comp.referencePrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-700">${v.compositeIntrinsicValue.toFixed(2)}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {fmtPct(v.impliedUpside)}
                    </td>
                    <td className="py-2.5 px-3 text-right">${v.dcfSharePrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right">${v.compsSharePrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <RecommendationBadge rec={v.recommendation} />
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-slate-500">{comp.lastUpdated}</td>
                    <td className="py-2.5 px-3 text-right space-x-2 font-sans">
                      <button
                        onClick={() => onSelectCompany(comp.id, 'valuation')}
                        className="text-blue-700 hover:underline font-medium"
                      >
                        Open
                      </button>
                      <button
                        onClick={() => onToggleWatchlist(comp.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase font-mono text-slate-800">
            Side-by-Side Fundamental & Valuation Comparison Matrix
          </h2>
          <div className="flex items-center space-x-2">
            {companies.map(c => (
              <button
                key={c.id}
                onClick={() => toggleCompare(c.id)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-sm border ${
                  compareIds.includes(c.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-300'
                }`}
              >
                {c.ticker}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-[11px] text-slate-700">
                <th className="py-2.5 px-4 font-sans w-60">Metric / Valuation Output</th>
                {comparedCompanies.map(c => (
                  <th key={c.id} className="py-2.5 px-4 text-right">
                    <div className="text-slate-900 font-bold">{c.ticker}</div>
                    <div className="text-[10px] font-sans font-normal text-slate-500">{c.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2 px-4 font-sans font-medium text-slate-700">Recommendation Signal</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">
                    <RecommendationBadge rec={c.valuation.recommendation} />
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans font-medium text-slate-700">Reference Share Price</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">${c.referencePrice.toFixed(2)}</td>
                ))}
              </tr>
              <tr className="bg-blue-50/40 font-bold">
                <td className="py-2 px-4 font-sans text-slate-900">Composite Intrinsic Value / Sh</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right text-blue-700">
                    ${c.valuation.compositeIntrinsicValue.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans font-medium text-slate-700">Implied Upside / (Downside)</td>
                {comparedCompanies.map(c => (
                  <td
                    key={c.id}
                    className={`py-2 px-4 text-right font-bold ${
                      c.valuation.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {fmtPct(c.valuation.impliedUpside)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">Enterprise Value (Current)</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{fmtCompact(c.valuation.currentEnterpriseValue)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">EV / FY25E EBITDA</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">
                    {(c.valuation.currentEnterpriseValue / c.valuation.projections[0].ebitda).toFixed(1)}x
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">FY25E Revenue Growth Assumption</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{c.assumptions.revGrowthY1.toFixed(1)}%</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">Target EBITDA Margin Assumption</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{c.assumptions.ebitdaMargin.toFixed(1)}%</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 px-4 font-sans text-slate-700">House WACC Assumption</td>
                {comparedCompanies.map(c => (
                  <td key={c.id} className="py-2 px-4 text-right">{c.assumptions.wacc.toFixed(1)}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportsAndExport({ company, decision, onTriggerToast }) {
  const v = company.valuation;
  const a = company.assumptions;
  const lastHist = company.historical[company.historical.length - 1];

  const handleExportCSV = () => {
    const headers = ['Year,Revenue ($M),EBITDA ($M),Free Cash Flow ($M),PV of FCF ($M)'];
    const rows = v.projections.map(p => `${p.year},${p.revenue},${p.ebitda},${p.fcf},${p.pvFcf}`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${company.ticker}_DCF_Valuation_Schedule.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast(`Exported ${company.ticker} 5-Year DCF Model Schedule to CSV.`);
  };

  return (
    <div className="space-y-5">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Equity Research Tear Sheet & Export</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Publication-ready investment banking valuation memo dynamically synchronized with your active model assumptions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-medium rounded-sm flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export DCF Schedule (.CSV)</span>
          </button>
          <button
            onClick={() => {
              onTriggerToast(`Prepared print-ready PDF layout for ${company.name} (${company.ticker}).`);
              window.print();
            }}
            className="px-3.5 py-1.5 bg-[#0A1120] hover:bg-slate-800 text-white text-xs font-medium rounded-sm flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Print / Save Research PDF</span>
          </button>
        </div>
      </div>

      {/* Institutional Report Document Sheet */}
      <div className="bg-white border border-slate-300 rounded-sm shadow-md max-w-5xl mx-auto p-8 space-y-6 text-slate-900">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500">
              VALUEX INSTITUTIONAL EQUITY RESEARCH // GLOBAL VALUATION & ADVISORY
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {company.name} ({company.exchange}: {company.ticker})
            </h2>
            <p className="text-xs text-slate-600">{company.sector} • {company.industry}</p>
          </div>
          <div className="text-right font-mono">
            <div className="text-xs text-slate-500">Date: {company.lastUpdated}</div>
            <div className="text-xs text-slate-700 font-semibold">Lead Analyst: {company.analyst}</div>
          </div>
        </div>

        {/* Key Rating & Target Box */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 p-3.5 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">House Rating</span>
            <div className="mt-1"><RecommendationBadge rec={v.recommendation} size="lg" /></div>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Reference Price</span>
            <span className="text-base font-bold text-slate-900">${company.referencePrice.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Intrinsic Value</span>
            <span className="text-base font-bold text-blue-700">${v.compositeIntrinsicValue.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Implied Return</span>
            <span className={`text-base font-bold ${v.impliedUpside >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {fmtPct(v.impliedUpside)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Enterprise Value</span>
            <span className="text-base font-bold text-slate-900">{fmtCompact(v.currentEnterpriseValue)}</span>
          </div>
        </div>

        {/* Executive Summary & Investment Thesis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Executive Summary & Investment Thesis
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {company.description} Based on our blended valuation framework ({a.dcfWeight}% 5-Year DCF, {a.compsWeight}% Public Trading Comparables, {a.precedentWeight}% Precedent M&A Transactions), we estimate an intrinsic equity value of <strong>${v.compositeIntrinsicValue.toFixed(2)} per share</strong> compared to the current reference price of <strong>${company.referencePrice.toFixed(2)}</strong>, implying <strong>{fmtPct(v.impliedUpside)}</strong> upside/downside.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
              {company.thesis.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 border-b border-slate-200 pb-1 pt-2">
              2. Key Risks & Valuation Sensitivities
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700">
              {company.risks.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Right Sidebar in Report: Model Assumptions Snapshot */}
          <div className="bg-slate-50 border border-slate-200 p-3.5 space-y-2.5 text-xs font-mono">
            <h4 className="font-bold uppercase text-slate-800 border-b border-slate-200 pb-1">
              Key Model Assumptions
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-500">FY25E Rev Growth:</span>
              <span className="font-bold">{a.revGrowthY1.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Target EBITDA Margin:</span>
              <span className="font-bold">{a.ebitdaMargin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Effective Tax Rate:</span>
              <span className="font-bold">{a.taxRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Discount Rate (WACC):</span>
              <span className="font-bold">{a.wacc.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Terminal Growth Rate:</span>
              <span className="font-bold">{a.terminalGrowth.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Exit EBITDA Multiple:</span>
              <span className="font-bold">{a.exitEbitdaMultiple.toFixed(1)}x</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-blue-800">
              <span>DCF Implied Value:</span>
              <span className="font-bold">${v.dcfSharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Trading Comps Value:</span>
              <span className="font-bold">${v.compsSharePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Precedent M&A Value:</span>
              <span className="font-bold">${v.precSharePrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Summary Financial Table inside Report */}
        <div>
          <h3 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-800 border-b border-slate-200 pb-1.5 mb-2">
            3. Explicit 5-Year Financial & Cash Flow Forecast ($ Millions)
          </h3>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-[10px] uppercase text-slate-600">
                <th className="py-1.5 px-2 font-sans">Metric</th>
                <th className="py-1.5 px-2 text-right">2024A</th>
                {v.projections.map(p => (
                  <th key={p.year} className="py-1.5 px-2 text-right">{p.year}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-1.5 px-2 font-sans font-medium">Revenue ($M)</td>
                <td className="py-1.5 px-2 text-right">{fmtCurrency(lastHist.revenue)}</td>
                {v.projections.map(p => (
                  <td key={p.year} className="py-1.5 px-2 text-right">{fmtCurrency(p.revenue)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans font-medium">EBITDA ($M)</td>
                <td className="py-1.5 px-2 text-right">{fmtCurrency(lastHist.ebitda)}</td>
                {v.projections.map(p => (
                  <td key={p.year} className="py-1.5 px-2 text-right">{fmtCurrency(p.ebitda)}</td>
                ))}
              </tr>
              <tr className="font-bold bg-slate-50">
                <td className="py-1.5 px-2 font-sans">Unlevered Free Cash Flow ($M)</td>
                <td className="py-1.5 px-2 text-right">{fmtCurrency(lastHist.fcf)}</td>
                {v.projections.map(p => (
                  <td key={p.year} className="py-1.5 px-2 text-right text-blue-800">{fmtCurrency(p.fcf)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Institutional Disclaimer Footer */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 leading-relaxed">
          <strong>IMPORTANT INSTITUTIONAL DISCLOSURE:</strong> This report and all associated financial figures, projections, multiples, and intrinsic value calculations are illustrative mock data generated within the VALUEX prototype environment. Nothing herein constitutes investment advice or a solicitation to buy or sell any security. PM Rationale Note: "{decision.notes}"
        </div>
      </div>
    </div>
  );
}