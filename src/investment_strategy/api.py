from .filter import filter_df_by_date, remove_zero_open_data
import yfinance as yf
from .strategies import *


def get_all_strategies():
    """Get a dict of names and additional parameters of all strategies that are a subclass of Strategy."""
    strategies = [strategy.__name__ for strategy in Strategy.__subclasses__()]
    return {strategy: eval(strategy)._get_additional_parameters() for strategy in strategies}


def get_data(ticker, period="max", item="Open", start_date=None, end_date=None):
    """Get the data as a pandas dataframe for the given ticker"""
    tkr = yf.Ticker(ticker)
    history_df = tkr.history(period=period)
    if start_date or end_date:
        history_df = filter_df_by_date(history_df, start=start_date, end=end_date)
    history_df = remove_zero_open_data(history_df)   # Remove entries with a price of zero
    return history_df[[item]]


def get_info(ticker):
    """Get info on a ticker"""
    tkr = yf.Ticker(ticker)
    return tkr.info


def run_strategy(df, strategy, initial_investment, regular_investment, regular_investment_frequency, start_date=None, strategy_parameters={}):
    """Run a strategy (string name) on a df and investment"""

    # Create investment
    inv = Investments(initial_investment, regular_investment, regular_investment_frequency)

    # Check strategy exists and evaluate with df, investment and strategy parameters
    if strategy in get_all_strategies():
        i = eval(strategy + "(df, inv, strategy_parameters=strategy_parameters, start_date=start_date)")
        return i.evaluate()
    else:
        print("Not a possible strategy")

