"""
Plotly Visualizer module for interactive fintech charts.
Generates Football Field distributions, 10-Year multi-stage fan charts,
and capital structure composition graphs.
"""

from typing import Dict, List, Any
import plotly.graph_objects as go
import pandas as pd
import numpy as np


class ValuationVisualizer:
    """Generates high-performance Plotly charts for Streamlit frontend."""

    @staticmethod
    def create_football_field(
        current_price: float,
        composite_target: float,
        dcf_price: float,
        comps_price: float,
        rim_price: float,
        bear_price: float,
        bull_price: float,
        ddm_price: float = None
    ) -> go.Figure:
        """
        Builds the Valuation Football Field Spread chart.
        """
        methods = [
            "1. DCF (10Y Pro Forma FCFF)",
            "2. Relative Comps (EV/EBITDA)",
            "3. Residual Income Model (RIM)"
        ]

        lows = [
            round(dcf_price * 0.85, 0),
            round(comps_price * 0.88, 0),
            round(rim_price * 0.90, 0)
        ]

        highs = [
            round(dcf_price * 1.15, 0),
            round(comps_price * 1.12, 0),
            round(rim_price * 1.10, 0)
        ]

        if ddm_price is not None and ddm_price > 0:
            methods.append("4. Dividend Discount (DDM)")
            lows.append(round(ddm_price * 0.88, 0))
            highs.append(round(ddm_price * 1.12, 0))

        scenario_num = 5 if (ddm_price is not None and ddm_price > 0) else 4
        methods.append(f"{scenario_num}. Multi-Scenario Spread (Bear/Bull)")
        lows.append(bear_price)
        highs.append(bull_price)

        bases = [low for low in lows]
        spans = [high - low for high, low in zip(highs, lows)]

        fig = go.Figure()

        # Invisible base to float the bars
        fig.add_trace(go.Bar(
            y=methods,
            x=bases,
            orientation='h',
            marker=dict(color='rgba(0,0,0,0)'),
            hoverinfo='none',
            showlegend=False
        ))

        # Floating range bars
        bar_colors = ['#06b6d4', '#a855f7', '#10b981', '#3b82f6']
        fig.add_trace(go.Bar(
            y=methods,
            x=spans,
            orientation='h',
            marker=dict(
                color=bar_colors,
                line=dict(color='rgba(255,255,255,0.4)', width=1.5)
            ),
            text=[f"IDR {l:,.0f} — {h:,.0f}" for l, h in zip(lows, highs)],
            textposition='inside',
            insidetextanchor='middle',
            textfont=dict(color='white', size=11, family='JetBrains Mono, monospace'),
            name="Valuation Range",
            hoverinfo='text'
        ))

        # Add vertical line for Current Market Price
        fig.add_vline(
            x=current_price,
            line_width=2.5,
            line_dash="dash",
            line_color="#f43f5e",
            annotation_text=f"Market: IDR {current_price:,.0f}",
            annotation_position="top left",
            annotation_font=dict(color="#f43f5e", size=11, family='JetBrains Mono, monospace')
        )

        # Add vertical line for Central Composite Target
        fig.add_vline(
            x=composite_target,
            line_width=2.5,
            line_color="#38bdf8",
            annotation_text=f"Target: IDR {composite_target:,.0f}",
            annotation_position="bottom right",
            annotation_font=dict(color="#38bdf8", size=11, family='JetBrains Mono, monospace')
        )

        fig.update_layout(
            barmode='stack',
            title=dict(
                text="<b>Valuation Football Field: Method Spreads vs. Observed Price</b>",
                font=dict(size=15, color='#f8fafc')
            ),
            plot_bgcolor='rgba(15, 23, 42, 0.4)',
            paper_bgcolor='rgba(0,0,0,0)',
            xaxis=dict(
                title="Equity Value per Share (IDR)",
                gridcolor='rgba(51, 65, 85, 0.4)',
                tickfont=dict(color='#94a3b8', family='JetBrains Mono, monospace'),
                title_font=dict(color='#cbd5e1', size=12)
            ),
            yaxis=dict(
                autorange="reversed",
                tickfont=dict(color='#e2e8f0', size=12, family='Plus Jakarta Sans, sans-serif')
            ),
            margin=dict(l=20, r=20, t=50, b=40),
            height=320,
            showlegend=False
        )

        return fig

    @staticmethod
    def create_fan_chart(
        historical_years: List[int],
        historical_rev: List[float],
        bear_schedule: pd.DataFrame,
        base_schedule: pd.DataFrame,
        bull_schedule: pd.DataFrame
    ) -> go.Figure:
        """
        Creates the 10-Year Multi-Stage Fan Chart (Hist actuals + Explicit + Fade).
        """
        fig = go.Figure()

        # 1. Historical Actuals
        fig.add_trace(go.Scatter(
            x=historical_years,
            y=historical_rev,
            mode='lines+markers',
            name="Audited Actuals",
            line=dict(color='#94a3b8', width=3),
            marker=dict(size=7, color='#f8fafc')
        ))

        forecast_years = list(base_schedule["year"])
        last_hist_year = historical_years[-1]
        last_hist_rev = historical_rev[-1]

        x_proj = [last_hist_year] + forecast_years

        y_bear = [last_hist_rev] + list(bear_schedule["revenue"])
        y_base = [last_hist_rev] + list(base_schedule["revenue"])
        y_bull = [last_hist_rev] + list(bull_schedule["revenue"])

        # 2. Bull Case Line
        fig.add_trace(go.Scatter(
            x=x_proj,
            y=y_bull,
            mode='lines',
            name="Bull Scenario",
            line=dict(color='#10b981', width=2.5, dash='dash')
        ))

        # 3. Base Case Line
        fig.add_trace(go.Scatter(
            x=x_proj,
            y=y_base,
            mode='lines+markers',
            name="Base Scenario",
            line=dict(color='#38bdf8', width=3.5),
            marker=dict(size=6, color='#38bdf8'),
            fill='tonexty',
            fillcolor='rgba(16, 185, 129, 0.08)'
        ))

        # 4. Bear Case Line
        fig.add_trace(go.Scatter(
            x=x_proj,
            y=y_bear,
            mode='lines',
            name="Bear Scenario",
            line=dict(color='#f43f5e', width=2.5, dash='dash'),
            fill='tonexty',
            fillcolor='rgba(244, 63, 94, 0.08)'
        ))

        # Phase 1 vs Phase 2 divider line
        phase_split_year = forecast_years[4]  # Year 5
        fig.add_vline(
            x=phase_split_year,
            line_width=1.5,
            line_dash="dot",
            line_color="rgba(148, 163, 184, 0.6)",
            annotation_text="Phase 1 (Explicit) ➔ Phase 2 (Fade)",
            annotation_position="top left",
            annotation_font=dict(color="#cbd5e1", size=10)
        )

        fig.update_layout(
            title=dict(
                text="<b>10-Year Multi-Stage Revenue Projection Fan Chart (Rp Trillion)</b>",
                font=dict(size=15, color='#f8fafc')
            ),
            plot_bgcolor='rgba(15, 23, 42, 0.4)',
            paper_bgcolor='rgba(0,0,0,0)',
            xaxis=dict(
                title="Fiscal Year",
                gridcolor='rgba(51, 65, 85, 0.4)',
                tickfont=dict(color='#94a3b8', family='JetBrains Mono, monospace'),
                dtick=1
            ),
            yaxis=dict(
                title="Revenue (Rp Trillion)",
                gridcolor='rgba(51, 65, 85, 0.4)',
                tickfont=dict(color='#94a3b8', family='JetBrains Mono, monospace')
            ),
            legend=dict(
                orientation='h',
                yanchor='bottom',
                y=1.02,
                xanchor='right',
                x=1,
                font=dict(color='#e2e8f0', size=11)
            ),
            margin=dict(l=20, r=20, t=60, b=40),
            height=360
        )

        return fig
