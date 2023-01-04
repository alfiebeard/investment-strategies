import pytz
from dateutil.relativedelta import relativedelta


def convert_datetime_index_to_str(df, format="long"):
    """Convert datetime index to string time in the required format"""
    dt_format = get_datetime_format(format)
    df.index = df.index.strftime(dt_format)
    return df


def get_datetime_format(format="long"):
    """Return a datetime format, either short (date) or long (data and time)"""
    if format == "short":
        return '%Y-%m-%d'
    else:
        return '%Y-%m-%d %H:%M:%S %Z'


def add_timezone_to_datetime(date):
    """Add timezone information to a datetime"""
    tz = pytz.timezone('Europe/London')
    return tz.localize(date, is_dst=True)


def date_frequency_to_schedule_intervals(frequency="months"):
    """Create a schedule dict from a date frequency (string)"""
    schedule = {"years": 0, "months": 0, "weeks": 0, "days": 0}
    if frequency == "months":
        schedule["months"] = 1
    elif frequency == "quarters":
        schedule["months"] = 3
    elif frequency == "years":
        schedule["years"] = 1
    elif frequency == "weeks":
        schedule["weeks"] = 1
    elif frequency == "fortnights":
        schedule["weeks"] = 2
    elif frequency == "days":
        schedule["days"] = 1
    return schedule


def get_schedule(start, end, intervals, ignore_first_date=False):
    """Get a datetime schedule from a start and end date and a set of intervals"""
    schedule = []
    date = start

    if ignore_first_date:
        date += relativedelta(years=intervals["years"], months=intervals["months"], weeks=intervals["weeks"], days=intervals["days"])

    while date <= end:
        schedule.append(date)
        date += relativedelta(years=intervals["years"], months=intervals["months"], weeks=intervals["weeks"], days=intervals["days"])
        
    return schedule


def get_nearest_date(dates, date):
    """Get the nearest date to a specified date from a list of dates"""
    return min(dates, key=lambda x: abs(x - date))

def get_nearest_date_past(dates, date):
    """Get the nearest date in the past only to a specified date from a list of dates"""
    return min(dates, key=lambda x: (date - x).total_seconds() if (x - date).total_seconds() < 0 else 1e10)

def get_nearest_date_future(dates, date):
    """Get the nearest date in the future only to a specified date from a list of dates"""
    return min(dates, key=lambda x: (x - date).total_seconds() if (x - date).total_seconds() > 0 else 1e10)


def get_nearest_date_in_df(df, date, past_only=False, future_only=False):
    """Get the nearest date in a df with dates as the index"""
    if future_only:
        return df.loc[df.index == get_nearest_date_future(df.index.to_list(), date)].index[0]
    elif past_only:
        return df.loc[df.index == get_nearest_date_past(df.index.to_list(), date)].index[0]
    else:
        return df.loc[df.index == get_nearest_date(df.index.to_list(), date)].index[0]
