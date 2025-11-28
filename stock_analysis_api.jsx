from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import pandas as pd
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# API Configuration
API_KEY = "fc858759c6e24378a02282099a072a7e"
BASE_URL = "https://api.twelvedata.com/time_series"
START = "2020-01-01"
END = "2024-12-31"

def fetch_monthly_data(symbol):
    """Fetch monthly stock data from TwelveData API"""
    params = {
        "symbol": symbol,
        "interval": "1month",
        "start_date": START,
        "end_date": END,
        "apikey": API_KEY,
        "outputsize": 5000
    }
    
    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if "values" not in data:
            return None, f"No data found for symbol {symbol}"
            
        df = pd.DataFrame(data["values"])
        df["datetime"] = pd.to_datetime(df["datetime"])
        df = df.sort_values("datetime")
        df.set_index("datetime", inplace=True)
        df["close"] = df["close"].astype(float)
        
        return df, None
        
    except Exception as e:
        return None, str(e)

def compute_drawdown(df):
    """Calculate drawdown percentage for the stock data"""
    running_max = df["close"].cummax()
    drawdown = (df["close"] - running_max) / running_max
    df["drawdown_pct"] = drawdown * 100
    return df


@app.route('/api/stock-analysis/', methods=['GET'])
def get_stock_analysis(symbol):
 
    try:
        # Fetch stock data
        df, error = fetch_monthly_data(symbol.upper())
        
        if error:
            return jsonify({
                "error": error,
                "symbol": symbol.upper()
            }), 400
            
        # Compute drawdown
        df = compute_drawdown(df)
        
        # Prepare response data
        response_data = {
            "symbol": symbol.upper(),
            "period": f"{START} to {END}",
            "data": []
        }
        
        # Convert DataFrame to list of dictionaries
        for date, row in df.iterrows():
            response_data["data"].append({
                "date": date.strftime("%Y-%m-%d"),
                "close_price": float(row["close"]),
                "drawdown_pct": float(row["drawdown_pct"]),
                "open": float(row["open"]) if "open" in row else None,
                "high": float(row["high"]) if "high" in row else None,
                "low": float(row["low"]) if "low" in row else None,
                "volume": int(row["volume"]) if "volume" in row else None
            })
        
        # Add summary statistics
        response_data["summary"] = {
            "max_drawdown": float(df["drawdown_pct"].min()),
            "current_drawdown": float(df["drawdown_pct"].iloc[-1]),
            "total_return_pct": float(((df["close"].iloc[-1] / df["close"].iloc[0]) - 1) * 100),
            "data_points": len(df)
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            "error": f"Internal server error: {str(e)}",
            "symbol": symbol.upper()
        }), 500

@app.route('/api/stock-analysis/compare', methods=['POST'])
def compare_stocks():
    """
    Compare multiple stocks' drawdown analysis
    
    Request body:
        {
            "symbols": ["NFLX", "MSFT", "AAPL"]
        }
    
    Returns:
        JSON response with comparison data for all symbols
    """
    try:
        data = request.get_json()
        
        if not data or "symbols" not in data:
            return jsonify({
                "error": "Request must include 'symbols' array"
            }), 400
            
        symbols = data["symbols"]
        
        if not isinstance(symbols, list) or len(symbols) == 0:
            return jsonify({
                "error": "Symbols must be a non-empty array"
            }), 400
            
        comparison_data = {
            "symbols": symbols,
            "period": f"{START} to {END}",
            "stocks": {},
            "comparison_summary": {}
        }
        
        # Process each symbol
        for symbol in symbols:
            df, error = fetch_monthly_data(symbol.upper())
            
            if error:
                comparison_data["stocks"][symbol.upper()] = {
                    "error": error
                }
                continue
                
            df = compute_drawdown(df)
            
            # Store data for this symbol
            comparison_data["stocks"][symbol.upper()] = {
                "max_drawdown": float(df["drawdown_pct"].min()),
                "current_drawdown": float(df["drawdown_pct"].iloc[-1]),
                "total_return_pct": float(((df["close"].iloc[-1] / df["close"].iloc[0]) - 1) * 100),
                "data_points": len(df),
                "monthly_data": [
                    {
                        "date": date.strftime("%Y-%m-%d"),
                        "close_price": float(row["close"]),
                        "drawdown_pct": float(row["drawdown_pct"])
                    }
                    for date, row in df.iterrows()
                ]
            }
        
        # Calculate comparison summary
        valid_stocks = {k: v for k, v in comparison_data["stocks"].items() if "error" not in v}
        
        if valid_stocks:
            comparison_data["comparison_summary"] = {
                "best_performer": max(valid_stocks.keys(), key=lambda x: valid_stocks[x]["total_return_pct"]),
                "worst_drawdown": min(valid_stocks.keys(), key=lambda x: valid_stocks[x]["max_drawdown"]),
                "least_drawdown": max(valid_stocks.keys(), key=lambda x: valid_stocks[x]["max_drawdown"])
            }
        
        return jsonify(comparison_data)
        
    except Exception as e:
        return jsonify({
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "api_key_configured": bool(API_KEY)
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
