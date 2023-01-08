import warnings
import random
from investment_strategy.date_utils import get_schedule, date_frequency_to_schedule_intervals, get_nearest_date_in_df, get_datetime_format
from investment_strategy.strategies_utils import add_velocity_data, add_velocity_data_with_drag


class Investments:
    def __init__(self, initial_investment, regular_investment, regular_investment_frequency="months", allow_overdrawn=False):
        self.initial_investment = initial_investment
        self.regular_investment = regular_investment
        self.regular_investment_frequency = regular_investment_frequency
        self.allow_overdrawn = allow_overdrawn

    def summary(self):
        return {"initial_investment": self.initial_investment, "regular_investment": self.regular_investment, 
            "regular_investment_frequency": self.regular_investment_frequency}


class Strategy:
    def __init__(self, df, investments, strategy_parameters={}, start_date=None, end_date=None, plan=None):
        self.df = df
        self.investments = investments
        self.strategy_parameters = strategy_parameters
        self.plan = plan
        self.additional_parameters = self._get_additional_parameters()

        # Get start and end dates
        if start_date is None:
            start_date = self.df.index[0]
        else:
            start_date = get_nearest_date_in_df(df, start_date, future_only=True)

        if end_date is None:
            end_date = self.df.index[-1]

        # Set start and end dates
        if start_date <= end_date:
            self.start_date = start_date
            self.end_date = end_date
        else:
            self.start_date = end_date
            self.end_date = start_date
            warnings.warn("Start and end date are the wrong way round, so flipped them")

        # Validate start and end dates
        self.validate_start_date()
        self.validate_end_date()

    @staticmethod
    def _get_additional_parameters():
        """Return additional paramters for the strategy"""
        return []

    def validate_start_date(self):
        first_date = self.df.index[0]
        if first_date > self.start_date:
            self.start_date = first_date
            warnings.warn("Data does not exist before date given, using first date in data")

    def validate_end_date(self):
        last_date = self.df.index[-1]
        if last_date < self.end_date:
            self.end_date = last_date
            warnings.warn("Data does not exist after date given, using last date in data")

    def summarise(self, df):
        """Summarise a strategy"""
        investment_dates = [self.start_date.isoformat(), self.end_date.isoformat()]
        investment_time = self.end_date - self.start_date
        total_invested = df.loc[self.end_date, 'investment_cum']
        value = round(df.loc[self.end_date, 'total_value'], 2)
        returns = round(df.loc[self.end_date, 'returns'], 2)
        percentage_returns = round(df.loc[self.end_date, 'percentage_returns'], 2)
        return {"investment_date": investment_dates, "investment_time_days": investment_time.days, "total_invested": total_invested,
            "value": value, "returns": returns, "percentage_returns": percentage_returns}

    def evaluate(self):
        """Evaluate a strategy and return a summary of the strategy and the results"""
        if self.plan:
            # Add investments to df
            self.df['investment'] = 0
            for date, amount in self.plan.items():
                nearest_date = get_nearest_date_in_df(self.df, date)
                self.df.loc[nearest_date, 'investment'] = amount

            # Calculate value, returns, etc.
            self.df['investment_cum'] = self.df['investment'].cumsum()
            self.df['units'] = self.df['investment'] / self.df['Open']
            self.df['units_cum'] = self.df['units'].cumsum()
            self.df['total_value'] = self.df['units_cum'] * self.df['Open']
            self.df['returns'] = self.df['total_value'] - self.df['investment_cum']
            self.df['percentage_returns'] = ((self.df['total_value'] / self.df['investment_cum']) - 1) * 100
            self.df[['percentage_returns']] = self.df[['percentage_returns']].fillna(value=0)

            return self.summarise(self.df), self.df
        else:
            warnings.warn("No strategic plan loaded to evaluate")


class InitialInvestment(Strategy):
    """One single investment at the start date"""
    def __init__(self, *args, **kwargs):
        super(InitialInvestment, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    def strategy(self):
        return {self.start_date: self.investments.initial_investment}


class RegularInvestment(Strategy):
    """A series of regular investments"""
    def __init__(self, *args, **kwargs):
        super(RegularInvestment, self).__init__(*args, **kwargs)
        self.plan = self.strategy()
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}

        if self.investments.regular_investment != 0:
            # Create an investment schedule and invest according to it
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            for k in schd:
                investment[k] = self.investments.regular_investment

        return investment


class RandomInvestment(Strategy):
    """A series of regular but random investments"""
    def __init__(self, *args, **kwargs):
        super(RandomInvestment, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    @staticmethod
    def _get_additional_parameters():
        return [{"name": "randomness", "label": "Randomness Rate", "type": "number", "default": 0.5}]
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}
        
        if self.investments.regular_investment != 0:
            # Create an investment schedule and invest randomly according to it
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            for k in range(schd):
                if random.random() < 0.5:
                    investment[k] = self.investments.regular_investment

        return investment


class BearDripFeed(Strategy):
    """Start investing when the market has fallen for several consecutive periods"""
    def __init__(self, *args, **kwargs):
        super(BearDripFeed, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    @staticmethod
    def _get_additional_parameters():
        return [{"name": "number_down_periods", "label": "Down periods", "type": "integer", "default": 3}]
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}
        
        if self.investments.regular_investment != 0:
            # Create an investment schedule and invest according to it
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            schd_date_matches = [get_nearest_date_in_df(self.df, date, past_only=True) for date in schd]

            for k in range(self.strategy_parameters["number_down_periods"], len(schd_date_matches)):
                investment_date = schd_date_matches[k]
                # If previous number_down_periods periods are decreasing compared to current one then invest
                if all(self.df.loc[start_date].Open >= self.df.loc[end_date].Open for start_date, end_date in zip(schd_date_matches[k-self.strategy_parameters["number_down_periods"]: k], schd_date_matches[k-self.strategy_parameters["number_down_periods"] + 1: k+1])):
                    # # Do not invest if you are not allowed to go overdrawn and the total investment so far is greater than what is possible.
                    # if self.investments.allow_overdrawn or sum(investment.values()) < len(schd[:k]) * self.investments.regular_investment:
                    investment[investment_date] = self.investments.regular_investment

        return investment


class FallingMarket(Strategy):
    """Invest when the market has fallen below a certain threshold"""
    def __init__(self, *args, **kwargs):
        super(FallingMarket, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    @staticmethod
    def _get_additional_parameters():
        return [{"name": "search_range", "label": "Search range", "type": "integer", "default": 3}, {"name": "threshold_percentage", "label": "Threshold (%)", "type": "number", "default": 0.9}]
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}
        
        if self.investments.regular_investment != 0:
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            
            schd_date_matches = [get_nearest_date_in_df(self.df, date, past_only=True) for date in schd]

            available_funds = 0
            available_funds_base_investment_percentage = 0.2
            available_funds_investment_percentage = available_funds_base_investment_percentage

            for k in range(self.strategy_parameters["search_range"], len(schd_date_matches)):
                investment_date = schd_date_matches[k]
                # If investment date drops below threshold from search_range before.
                if self.df.loc[investment_date].Open < self.strategy_parameters["threshold_percentage"] * self.df.loc[schd_date_matches[k - self.strategy_parameters["search_range"]]].Open:
                    if available_funds > 0:
                        investment[investment_date] = available_funds
                        available_funds = 0
                else:
                    available_funds += self.investments.regular_investment
        return investment


class Velocity(Strategy):
    """Invest when the market is approaching maximum velocity (falling fast)"""
    def __init__(self, *args, **kwargs):
        super(Velocity, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    @staticmethod
    def _get_additional_parameters():
        return [{"name": "min_velocity", "label": "Min Velocity", "type": "number", "default": 0}, {"name": "velocity_threshold", "label": "V Threshold", "type": "number", "default": 4}]
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}
        
        if self.investments.regular_investment != 0:
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            schd_date_matches = [get_nearest_date_in_df(self.df, date, past_only=True) for date in schd]

            add_velocity_data(self.df, self.strategy_parameters["min_velocity"])

            for k in range(len(schd_date_matches)):
                v_factor = self.df.loc[schd_date_matches[k], 'v'] / self.strategy_parameters["velocity_threshold"]
                # Amount to spend on all previous months plus this month subtracting what has been invested so far
                available_funds = ((len(schd[:k]) + 1) * self.investments.regular_investment) - sum(investment.values())
                if v_factor > 1:
                    # Do not invest if you are not allowed to go overdrawn and the total investment so far is greater than what is possible.
                    investment_amount = (v_factor ** 4) * self.investments.regular_investment
                    if self.investments.allow_overdrawn or investment_amount <= available_funds:
                        investment[schd_date_matches[k]] = investment_amount
                elif available_funds > 10 * self.investments.regular_investment:
                    investment[schd_date_matches[k]] = (v_factor ** 1.5) * self.investments.regular_investment

        return investment


class VelocityMax(Strategy):
    """Invest when the market is approaching maximum velocity and starts to turn (falling fast) taking drag into account"""
    def __init__(self, *args, **kwargs):
        super(VelocityMax, self).__init__(*args, **kwargs)
        self.plan = self.strategy()

    @staticmethod
    def _get_additional_parameters():
        return [{"name": "velocity_threshold", "label": "V Threshold", "type": "number", "default": 4}, {"name": "power_threshold", "label": "P Threshold", "type": "number", "default": 0.01}]
    
    def strategy(self):
        investment = {self.start_date: self.investments.initial_investment}
        
        if self.investments.regular_investment != 0:
            add_velocity_data_with_drag(self.df)
            # Velocity tells when the marketing is falling fast.
            # Accceleration tells when the market is bouncing back up.
            # Power tells when the market is falling fast and bouncing back up, i.e., when there's a jolt.

            # Plan: when the velocity threshold is passed, start listening for investment opportunities.
            # Investments then occur when the power threshold is passed, with more invested for larger power values.
            # The investment window ends when the velocity threshold is passed below again.

            # Create an investment schedule, e.g., fixed amount to invest per month
            intervals = date_frequency_to_schedule_intervals(self.investments.regular_investment_frequency)
            schd = get_schedule(self.start_date, self.end_date, intervals, ignore_first_date=True)
            schd_date_matches = [get_nearest_date_in_df(self.df, date, past_only=True) for date in schd]

            date_index = 0
            available_funds = 0

            available_funds_base_investment_percentage = 0.1
            available_funds_investment_percentate = available_funds_base_investment_percentage
            temp_v_threshold = self.strategy_parameters["velocity_threshold"]
            temp_v_threshold_increment = 4
            for index, row in self.df.iterrows():
                # Add to available funds
                if date_index < len(schd_date_matches):
                    if index == schd_date_matches[date_index]:
                        available_funds += self.investments.regular_investment
                        date_index += 1

                # If investment window open
                if row['v'] > temp_v_threshold:
                    if row['p'] > self.strategy_parameters["power_threshold"]:
                        if available_funds_investment_percentate > 1:
                            available_funds_investment_percentage = 1
                        
                        investment_amount = available_funds_investment_percentage * available_funds

                        if investment_amount > available_funds:
                            investment_amount = available_funds
                        
                        if investment_amount > 0:
                            investment[index] = investment_amount
                            available_funds -= investment_amount
                            available_funds_investment_percentage += available_funds_base_investment_percentage

                            temp_v_threshold += temp_v_threshold_increment
                else:
                    available_funds_investment_percentage = available_funds_base_investment_percentage
                    temp_v_threshold = self.strategy_parameters["velocity_threshold"]

        return investment

