import matplotlib.pyplot as plt


def visualise_strategy(df):
    """Visualise a df and strategy"""
    x = list(df.index)
    y = [df.loc[xi]['Open'] for xi in x]
    plt.plot(x, y)

    x = df[df['investment'] > 0].index.tolist()
    y = [df.loc[xi]['Open'] for xi in x]
    plt.scatter(x, y)

    plt.show()