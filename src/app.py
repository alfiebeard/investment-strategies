from flask import Flask, request, render_template, send_from_directory, jsonify
from investment_strategy.api import get_all_strategies, get_data, get_info, run_strategy
from investment_strategy.utils import to_dict, NpEncoder
from investment_strategy.date_utils import add_timezone_to_datetime
import json
import copy
from datetime import datetime


app = Flask(__name__, static_folder="frontend/build/static", template_folder="frontend/build")


@app.route("/")
def home():
    return render_template('index.html')


@app.route("/manifest.json")
def manifest():
    return send_from_directory(app.template_folder, 'manifest.json')


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(app.template_folder, 'favicon.ico')


@app.route('/logo512.png')
def logo512():
    return send_from_directory(app.template_folder, 'logo512.png')


@app.route('/logo128.png')
def logo128():
    return send_from_directory(app.template_folder, 'logo128.png')


@app.route("/api/get_data/")
def get_data_():
    ticker = request.args.get('ticker')
    data = get_data(ticker)
    return jsonify({"info": get_info(ticker), "data": to_dict(data)})


@app.route("/api/get_all_strategies/")
def get_strategies():
    return jsonify({"strategies": get_all_strategies()})


@app.route("/api/post_strategy/", methods=["POST"])
def run_strategy_():
    df_base = get_data(request.json["ticker"])
    strategy_run_data = {}

    for strategy_i_name, strategy_i_data in request.json["strategy"].items():
        df = copy.deepcopy(df_base)
        initial_investment = float(strategy_i_data["initial_investment"])
        regular_investment = float(strategy_i_data["regular_investment"])
        regular_investment_frequency = strategy_i_data["regular_investment_frequency"]
        strategy = strategy_i_data["strategy"]
        start_date = add_timezone_to_datetime(datetime.fromisoformat(strategy_i_data["start_date"]))

        summary, df_results = run_strategy(df, strategy, initial_investment, regular_investment, regular_investment_frequency, start_date, strategy_parameters=strategy_i_data)
        strategy_run_data[strategy_i_name] = {"summary": summary, "data": to_dict(df_results)}

    # Note: strategy will fail if any value is NaN.
    return json.dumps(strategy_run_data, cls=NpEncoder)


if __name__ == "__main__":
    app.run(port=8080)