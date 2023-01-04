# Investment Strategies
A tool for evaluating historical investment strategies and for writing your own investment plans and evaluating them on historical market data. The tool can be used for evaluating and comparing many different long term investment strategies, for example, exploring the returns from dollar cost averaging vs a large initial lump sum on historical index or stock data. There is also a GUI for comparing the results from different strategies. New investment strategies can be added easily by extending the examples available.

## Key Features
* Quickly view the price of different markets or stocks over time.
* Evaluate different investment strategies on these markets or stocks, for example, dollar cost averaging.
* Compare different investment strategies.
* Several sample investment strategies are included, for example, dollar cost averaging, initial lump sum investment and dripfeeding in a bear market.
* Extend by writing your own investment strategies.

![Screenshot of application](app_screenshot.png?raw=true "Investment Strategies")

# Project Structure

## Investment Strategy Evaluator (investment_strategy))
The investment strategy evaluator is built using the [yfinance](https://github.com/ranaroussi/yfinance) library for retrieving data and pandas for processing it.

## Flask Application
The [app.py](app.py) script runs the Flask server, serving the frontend application and providing an API to the investment strategy evaluator functions.

## Frontend
The frontend is built using React and queries the Flask app for data and evaluation of investment strategies.

# Getting Started

## Envionment
Python 3.10.6

## Installation
1. Clone the repository
```
git clone https://github.com/alfiebeard/investment-strategies.git
```
2. Create virtual environment
```
virtualenv investment_strategies_venv
source investment_strategies_venv/bin/activate
```
Or with conda
```
conda create --name investment_strategies python=3.10.6
conda activate investment_strategies
```
3. Install requirements.txt
```
cd investment-strategies
pip install -r requirements.txt
```

4. Build the frontend
```
cd src/frontend
npm run build
```

## Running
```
cd ..
python app.py
```
Navigate to http://127.0.0.1:8080/

## Modifying the GUI
The GUI is a React app, it's best modified in development mode. Keep the backend running with the instructions above and then run the following commands.
```
npm install
npm run start
```
Navigate to http://localhost:3000 and follow any changes from here.

# Next Steps
* Develop more strategies.
* Add the functionality for creating a portfolio containing a range of investments and evaluating these.
* Train a transformer on the data as an investment strategy.

# License
Licensed under the [MIT License](LICENSE.md).