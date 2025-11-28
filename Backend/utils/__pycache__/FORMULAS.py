import requests
import pandas as pd
import matplotlib.pyplot as plt

API_KEY = "fc858759c6e24378a02282099a072a7e"
BASE_URL = "https://api.twelvedata.com/time_series"

START = "2020-01-01"
END   = "2024-12-31"

def fetch_monthly(symbol):
    params = {
        "symbol": symbol,
        "interval": "1month",
        "start_date": START,
        "end_date": END,
        "apikey": API_KEY,
        "outputsize": 5000
    }
    r = requests.get(BASE_URL, params=params)
    data = r.json()

    df = pd.DataFrame(data["values"])
    df["datetime"] = pd.to_datetime(df["datetime"])
    df = df.sort_values("datetime")
    df.set_index("datetime", inplace=True)
    df["close"] = df["close"].astype(float)
    return df


def compute_drawdown(df):
    running_max = df["close"].cummax()
    drawdown = (df["close"] - running_max) / running_max
    df["drawdown_pct"] = drawdown * 100
    return df


def plot_drawdown(df, symbol):
    plt.figure(figsize=(12,5))
    plt.plot(df.index, df["drawdown_pct"], marker='o')
    plt.axhline(0, color='black', linewidth=0.8)

    plt.title(f"{symbol} — Monthly Drawdown % (2020–2024)")
    plt.xlabel("Month")
    plt.ylabel("Drawdown (%)")
    plt.grid(True, linestyle='--', alpha=0.4)

    plt.tight_layout()
    plt.show()


# === RUN FOR BOTH STOCKS ===
for symbol in ["NFLX", "MSFT"]:
    print(f"Processing {symbol}...")
    
    df = fetch_monthly(symbol)
    df = compute_drawdown(df)
    plot_drawdown(df, symbol)
