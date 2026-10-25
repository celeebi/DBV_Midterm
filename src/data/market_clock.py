"""
IDX (Indonesia Stock Exchange) Market Clock Service.
Accurately evaluates Jakarta trading sessions (Asia/Jakarta, UTC+7).
"""

from datetime import datetime, time, timedelta, timezone
from typing import Optional, Dict, Any
import logging

try:
    import zoneinfo
    JAKARTA_TZ = zoneinfo.ZoneInfo("Asia/Jakarta")
except Exception:
    JAKARTA_TZ = timezone(timedelta(hours=7))

logger = logging.getLogger("idx_market_clock")

class IDXMarketClock:
    """
    Evaluates current IDX trading status according to official exchange hours:
    Mon-Thu:
      - 08:45 - 08:59: Pre-Opening
      - 09:00 - 12:00: Session 1 (OPEN)
      - 12:00 - 13:30: Lunch Break
      - 13:30 - 15:50: Session 2 (OPEN)
      - 15:50 - 16:15: Pre-Closing / Post-Trading
      - 16:15 - 08:45: Closed (After Hours)
    Friday:
      - 08:45 - 08:59: Pre-Opening
      - 09:00 - 11:30: Session 1 (OPEN)
      - 11:30 - 14:00: Friday Break
      - 14:00 - 15:50: Session 2 (OPEN)
      - 15:50 - 16:15: Pre-Closing / Post-Trading
      - 16:15 - Mon 08:45: Closed (Weekend / After Hours)
    """

    @classmethod
    def get_jakarta_now(cls, custom_dt: Optional[datetime] = None) -> datetime:
        if custom_dt is not None:
            if custom_dt.tzinfo is None:
                return custom_dt.replace(tzinfo=JAKARTA_TZ)
            return custom_dt.astimezone(JAKARTA_TZ)
        return datetime.now(JAKARTA_TZ)

    @classmethod
    def get_status(cls, custom_dt: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Determines market status for a given datetime (or current time if None).
        Returns structured dictionary with is_open flag, labels, and timestamps.
        """
        now = cls.get_jakarta_now(custom_dt)
        weekday = now.weekday()  # Monday is 0, Sunday is 6
        t = now.time()
        time_str = now.strftime("%H:%M:%S WIB")
        date_str = now.strftime("%Y-%m-%d")

        # Weekend Check
        if weekday == 5:  # Saturday
            return {
                "is_open": False,
                "status": "CLOSED",
                "session": "WEEKEND",
                "label": "Market Closed (Weekend)",
                "next_open": "Monday 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": "Saturday"
            }
        elif weekday == 6:  # Sunday
            return {
                "is_open": False,
                "status": "CLOSED",
                "session": "WEEKEND",
                "label": "Market Closed (Weekend)",
                "next_open": "Monday 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": "Sunday"
            }

        is_friday = (weekday == 4)

        # Boundaries
        t_preopen = time(8, 45)
        t_s1_start = time(9, 0)
        t_s1_end = time(11, 30) if is_friday else time(12, 0)
        t_s2_start = time(14, 0) if is_friday else time(13, 30)
        t_s2_end = time(15, 50)
        t_post_end = time(16, 15)

        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        day_name = day_names[weekday]

        if t < t_preopen:
            return {
                "is_open": False,
                "status": "CLOSED",
                "session": "PRE_MARKET",
                "label": "Market Closed (Pre-Market)",
                "next_open": "Today 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        elif t < t_s1_start:
            return {
                "is_open": False,
                "status": "PRE_OPEN",
                "session": "PRE_OPENING",
                "label": "Pre-Opening Auction",
                "next_open": "Today 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        elif t < t_s1_end:
            return {
                "is_open": True,
                "status": "OPEN",
                "session": "SESSION_1",
                "label": "Session 1 (Trading)",
                "next_event": f"Lunch Break at {t_s1_end.strftime('%H:%M')} WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        elif t < t_s2_start:
            break_label = "Friday Mid-Day Break" if is_friday else "Lunch Break"
            return {
                "is_open": False,
                "status": "BREAK",
                "session": "MIDDAY_BREAK",
                "label": break_label,
                "next_open": f"Today {t_s2_start.strftime('%H:%M')} WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        elif t < t_s2_end:
            return {
                "is_open": True,
                "status": "OPEN",
                "session": "SESSION_2",
                "label": "Session 2 (Trading)",
                "next_event": "Pre-Closing at 15:50 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        elif t < t_post_end:
            return {
                "is_open": False,
                "status": "CLOSING",
                "session": "POST_TRADING",
                "label": "Closing Auction / Post-Trading",
                "next_open": "Monday 09:00 WIB" if is_friday else "Tomorrow 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
        else:
            return {
                "is_open": False,
                "status": "CLOSED",
                "session": "AFTER_HOURS",
                "label": "Market Closed (After Hours)",
                "next_open": "Monday 09:00 WIB" if is_friday else "Tomorrow 09:00 WIB",
                "time_wib": time_str,
                "date_wib": date_str,
                "day_name": day_name
            }
