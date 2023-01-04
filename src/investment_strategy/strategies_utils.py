import numpy as np


def add_velocity_data(df, min_velocity=0, g=10):
    """Add velocity data to the df"""

    # Calculate the difference between dates and Open prices, these are the x and y's. 
    df['Date'] = df.index
    df['x_diff'] = df.Date - df.Date.shift(1)
    df['x_diff'] = df['x_diff'].apply(lambda x: x.total_seconds())     # Convert to number
    df['y_diff'] = df.Open - df.Open.shift(1)

    # Normalise the x_diff so it's in proportion with the y_diff
    normalise_factor = df['y_diff'].mean() / df['x_diff'].mean()
    df['x_diff'] = df['x_diff'] * normalise_factor

    # Calculate theta, s and a for the equations
    df['theta'] = np.arctan(df['y_diff']/df['x_diff'])
    df['s'] = np.sqrt(df['x_diff'] ** 2 + df['y_diff'] ** 2)
    df['a'] = - g * np.sin(df['theta'])     # F = mgsin(theta) - where mg is weight - downwards so negative.
    
    # Calculate v by looping through the df
    # df.loc[df.index[0], 'a2'] = 0
    df.loc[df.index[0], 'v'] = min_velocity
    for i in range(1, len(df.index)):
        v2 = (df.iloc[i - 1].v ** 2) + 2 * df.iloc[i].a * df.iloc[i].s
        
        if v2 < 0:
            v2 = min_velocity
        
        df.loc[df.index[i], 'v'] = np.sqrt(v2)
        # df.loc[df.index[i], 'a2'] = (np.sqrt(v2) - df.iloc[i - 1].v) / df.iloc[i].x_diff

    df.drop(['x_diff', 'y_diff', 'theta', 's', 'a'], axis=1, inplace=True)


def add_velocity_data_with_drag(df, min_velocity=0, m=1e3, g=10, drag_coeff=1e-9, max_possible_gradient=0.9, moving_average_period=5, normalise_window=180):
    """Add velocity data to the df with drag adding resistance at high velocities"""

    # Calculate the difference between dates and Open prices, these are the x and y's. 
    df['Date'] = df.index
    df['x_diff'] = df.Date - df.Date.shift(1)
    df['x_diff'] = df['x_diff'].apply(lambda x: x.total_seconds())     # Convert to number
    df['Open_moving_average'] = df.Open.rolling(moving_average_period).mean()
    df['y_diff'] = df.Open - df.Open_moving_average.shift(1)

    # Normalise the x_diff so it's in proportion with the y_diff
    max_gradient_difference = (df['y_diff'] / df['x_diff']).max()
    normalise_factor = max_gradient_difference / max_possible_gradient
    df['x_diff'] = df['x_diff'] * normalise_factor

    # Calculate theta
    df['theta'] = np.arctan(df['y_diff']/df['x_diff'])

    # Calculate v, a by looping through the df
    df.loc[df.index[0], 'v'] = min_velocity
    df.loc[df.index[0], 'a'] = min_velocity
    for i in range(1, len(df.index)):
        # "Flat" (theta is very small, i.e., close to 0)
        if abs(df.loc[df.index[i], 'theta']) < 1e-2:
            v = df.iloc[i - 1].v / (drag_coeff * df.iloc[i - 1].v * df.loc[df.index[i], "x_diff"] + 1)
        # "Uphill" (theta is positive)
        elif df.loc[df.index[i], 'theta'] > 0:
            k1 = np.sqrt(m * g * np.sin(df.loc[df.index[i], 'theta']) / drag_coeff)
            k2 = np.sqrt((drag_coeff * g * np.sin(df.loc[df.index[i], 'theta']))/ m)
            c = np.arctan((1 / k1) * df.iloc[i - 1].v)
            v = k1 * np.tan(c - df.loc[df.index[i], "x_diff"] * k2)
        # "Downhill" (theta is negative)
        else:
            k1 = np.sqrt(m * g * np.sin(abs(df.loc[df.index[i], 'theta'])) / drag_coeff)
            k2 = np.sqrt((drag_coeff * g * np.sin(abs(df.loc[df.index[i], 'theta']))) / m)
            c = np.arctanh((1 / k1) * df.iloc[i - 1].v)
            v = k1 * np.tanh(c + df.loc[df.index[i], "x_diff"] * k2)

        # Reset small or NaN values
        if np.isnan(v) or v < min_velocity:
            v = min_velocity
        
        df.loc[df.index[i], 'v'] = v
        df.loc[df.index[i], 'a'] = ((v - df.iloc[i - 1].v) / df.iloc[i].x_diff) / m

    # Normalise velocity by the current price
    df['v'] = df.v / df.Open.rolling(normalise_window, min_periods=1).apply(lambda x: x.mean())

    # Normalise a and calculate p = av
    df['a'] = df.a.rolling(moving_average_period, min_periods=1).mean()
    df['p'] = df.v * df.a

    df.drop(['Open_moving_average', 'x_diff', 'y_diff', 'theta'], axis=1, inplace=True)

