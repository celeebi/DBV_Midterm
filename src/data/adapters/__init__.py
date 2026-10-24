"""
Data Adapters package for multi-source financial ingestion.
Exposes IDXAdapter for official audited Indonesian Stock Exchange filings.
"""

from src.data.adapters.idx_adapter import IDXAdapter

__all__ = ["IDXAdapter"]
