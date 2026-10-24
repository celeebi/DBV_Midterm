"""
HTTP client for communicating with IDX endpoints with anti-bot evasion and extended retry budget.
Uses curl_cffi to match browser TLS and HTTP/2 fingerprints, rotating across modern browsers
and backing off across an extended (~3 minutes) time window before yielding to fallback.
"""

import os
import time
import random
import logging
import zipfile
from typing import Optional, Dict, Any
from curl_cffi import requests

logger = logging.getLogger("idx_scraper.client")

BASE_URL = "https://www.idx.co.id"
DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    "Referer": "https://www.idx.co.id/id/perusahaan-tercatat/laporan-keuangan-dan-tahunan",
}

AVAILABLE_IMPERSONATIONS = [
    "chrome131",
    "safari17_0",
    "edge101",
    "chrome124",
    "safari15_5",
    "chrome120",
]


def is_valid_archive(file_path: str) -> bool:
    """
    Checks if a downloaded file is a genuine uncorrupted zip or OpenXML (.xlsx) archive.
    Rejects dummy text files, HTML error pages, and truncated files smaller than 512 bytes.
    """
    if not os.path.isfile(file_path):
        return False
    if os.path.getsize(file_path) < 512:
        return False
    return zipfile.is_zipfile(file_path)


class IDXCloudflareChallengeError(RuntimeError):
    """Raised when IDX portal is intercepted by Cloudflare WAF / CAPTCHA challenge after exhausting retry budget."""
    pass


class IDXClient:
    """
    Session-based HTTP client for IDX with anti-bot handling, session rotation,
    and extended ~3-minute retry window to maximize direct exchange data acquisition.
    """

    def __init__(
        self,
        request_delay: float = 0.6,
        max_retries: int = 8,
        max_duration_sec: float = 180.0,
        impersonate: str = "chrome131"
    ):
        self.request_delay = request_delay
        self.max_retries = max_retries
        self.max_duration_sec = max_duration_sec
        self.impersonate = impersonate
        self.session = requests.Session(impersonate=self.impersonate)
        self.session.headers.update(DEFAULT_HEADERS)
        self._last_request_time = 0.0

    def _throttle(self):
        """Enforce polite rate limiting between consecutive calls."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.request_delay:
            sleep_time = (self.request_delay - elapsed) + random.uniform(0.05, 0.2)
            time.sleep(sleep_time)

    def get(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: int = 25
    ) -> requests.Response:
        """
        Perform a GET request with automatic session rotation, rate-limiting,
        and up to ~3 minutes retry budget before falling back.
        """
        if not url.startswith("http"):
            url = BASE_URL + ("/" if not url.startswith("/") else "") + url

        import urllib.parse
        parts = urllib.parse.urlsplit(url)
        quoted_path = urllib.parse.quote(parts.path, safe="/:")
        url = urllib.parse.urlunsplit((parts.scheme, parts.netloc, quoted_path, parts.query, parts.fragment))

        request_headers = {}
        if headers:
            request_headers.update(headers)

        start_time = time.time()

        for attempt in range(1, self.max_retries + 1):
            self._throttle()
            elapsed = time.time() - start_time
            if attempt > 1 and elapsed >= self.max_duration_sec:
                logger.warning(f"Total time budget ({self.max_duration_sec:.0f}s / ~3 min) expired fetching {url}.")
                raise IDXCloudflareChallengeError(f"IDX fetch timed out after {elapsed:.1f}s across {attempt-1} attempts on {url}")

            try:
                self._last_request_time = time.time()
                resp = self.session.get(url, params=params, headers=request_headers, timeout=timeout)

                # Check status
                if resp.status_code == 200:
                    logger.info(f"IDX request succeeded for {url} on attempt {attempt} ({elapsed:.1f}s)")
                    return resp
                elif resp.status_code in (429, 500, 502, 503, 504):
                    wait = min(30.0, (2 ** attempt) + random.uniform(1.0, 3.0))
                    if elapsed + wait > self.max_duration_sec:
                        raise IDXCloudflareChallengeError(f"HTTP {resp.status_code} on {url}: budget exhausted")
                    logger.warning(f"HTTP {resp.status_code} received from {url}. Retrying in {wait:.1f}s (Attempt {attempt}/{self.max_retries}, elapsed {elapsed:.1f}s)...")
                    time.sleep(wait)
                elif resp.status_code == 403 or (resp.text and ("Just a moment..." in resp.text or "cf-turnstile" in resp.text)):
                    if attempt >= self.max_retries or (elapsed >= self.max_duration_sec):
                        logger.warning(
                            f"HTTP 403 / Cloudflare challenge persisted across {attempt} attempts "
                            f"({elapsed:.1f}s / {self.max_duration_sec:.0f}s budget) on {url}. "
                            f"Yielding to Universal Harmonizer fallback."
                        )
                        raise IDXCloudflareChallengeError(
                            f"Cloudflare WAF / CAPTCHA challenge on {url} persisted after {attempt} attempts ({elapsed:.1f}s)"
                        )

                    # Rotate browser impersonation and re-initialize session with fresh TLS fingerprint
                    next_imp = AVAILABLE_IMPERSONATIONS[attempt % len(AVAILABLE_IMPERSONATIONS)]
                    self.impersonate = next_imp
                    self.session = requests.Session(impersonate=self.impersonate)
                    self.session.headers.update(DEFAULT_HEADERS)

                    # Progressive backoff for 3-minute window (e.g. ~5s, 10s, 15s, 20s, 25s, 30s...)
                    wait = min(35.0, (5.0 * attempt) + random.uniform(0.5, 2.5))
                    logger.info(
                        f"Cloudflare WAF challenge on {url} (Attempt {attempt}/{self.max_retries}, elapsed {elapsed:.1f}s / {self.max_duration_sec:.0f}s). "
                        f"Rotating TLS fingerprint to {next_imp} and waiting {wait:.1f}s for IDX challenge window..."
                    )
                    time.sleep(wait)
                else:
                    resp.raise_for_status()

            except IDXCloudflareChallengeError:
                raise
            except Exception as e:
                elapsed = time.time() - start_time
                if attempt >= self.max_retries or elapsed >= self.max_duration_sec:
                    logger.error(f"Failed to fetch {url} after {attempt} attempts ({elapsed:.1f}s): {e}")
                    raise IDXCloudflareChallengeError(f"Failed to fetch {url} after {elapsed:.1f}s: {e}")
                wait = min(30.0, (2 ** attempt) + random.uniform(1.0, 3.0))
                logger.warning(f"Request error: {e}. Retrying in {wait:.1f}s (Attempt {attempt}/{self.max_retries}, elapsed {elapsed:.1f}s)...")
                time.sleep(wait)

        raise RuntimeError(f"Unable to complete GET request to {url} within {self.max_duration_sec}s budget")

    def download_file(self, file_path_or_url: str, dest_path: str, overwrite: bool = False) -> bool:
        """
        Download a remote file from IDX to local disk.
        Returns True if newly downloaded, False if skipped (already exists).
        """
        if os.path.exists(dest_path) and not overwrite:
            # Check if file exists and is uncorrupted
            if dest_path.endswith((".xlsx", ".zip")):
                if is_valid_archive(dest_path):
                    logger.info(f"File already exists and is valid archive: {dest_path}. Skipping.")
                    return False
                else:
                    logger.warning(f"File {dest_path} is corrupt/truncated ({os.path.getsize(dest_path)} bytes). Re-downloading...")
            elif os.path.getsize(dest_path) > 0:
                logger.info(f"File already exists: {dest_path}. Skipping.")
                return False

        os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
        resp = self.get(file_path_or_url)
        with open(dest_path, "wb") as f:
            f.write(resp.content)
        logger.info(f"Saved: {dest_path} ({len(resp.content):,} bytes)")
        return True
