"""Utility functions"""

from datetime import datetime


def get_current_date():
    """Get the current date in the format YYYY-MM-DD"""

    return datetime.now().isoformat()
