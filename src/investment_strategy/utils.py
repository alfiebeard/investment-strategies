import json
import numpy as np
import pandas as pd
from .date_utils import convert_datetime_index_to_str


class NpEncoder(json.JSONEncoder):
    """Encode numpy values for JSON"""
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


def to_dict(df, datetime_format="short"):
    """Convert df to a dict"""
    convert_datetime_index_to_str(df, format=datetime_format)
    df['Date'] = df.index
    return df.to_dict(orient="list")
