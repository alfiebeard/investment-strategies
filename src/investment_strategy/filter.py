import pandas as pd
from datetime import datetime
from .date_utils import get_datetime_format, add_timezone_to_datetime


def filter_df_by_date(df, start, end, format="short"):
    """Filter a df by a start and end date"""
    dt_format = get_datetime_format(format)

    if start and end:
        start_dt = add_timezone_to_datetime(datetime.strptime(start, dt_format))
        end_dt = add_timezone_to_datetime(datetime.strptime(end, dt_format))
        return df.loc[start_dt: end_dt]
    elif start:
        start_dt = add_timezone_to_datetime(datetime.strptime(start, dt_format))
        return df.loc[start_dt:]
    elif end:
        end_dt = add_timezone_to_datetime(datetime.strptime(end, dt_format))
        return df.loc[: end_dt]


def remove_zero_open_data(df):
    """Remove Open entries in df equal to 0 and all previous entries"""
    zeros_in_df = df[df.Open == 0]
    if len(zeros_in_df) > 0:
        last_zero_date = zeros_in_df.iloc[-1].name  # Get last zero open price
        return df[df.index > last_zero_date]
    else:
        return df
    