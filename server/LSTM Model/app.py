from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import daily_predict
import os

app = Flask(__name__)
CORS(app)  

@app.route('/calculate', methods=['GET'])
def run_model_api():
    ticker = request.args.get('ticker', 'NVDA')
    result = daily_predict.predict_next_day_price(ticker)
    return jsonify({"result": result})

if __name__ == '__main__':
    port = 5000
    app.run(port=port, debug=True)
