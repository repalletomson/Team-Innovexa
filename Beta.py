# Beta is the measure of volatility of a security compared to the market as a whole
import requests
import pandas as pd
import numpy as np

API_KEY = "e37ed7892f3440188ddc65a4098a2541"

BASE_URL = "https://api.twelvedata.com/time_series"
START = "2019-12-31"
END = "2024-12-31"

def fetch(symbol):
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
    return df["close"]

msft = fetch("MSFT")
spy = fetch("SPY")

df = pd.concat([msft, spy], axis=1)
df.columns = ["MSFT", "SPY"]
df = df.loc["2020-01-31":"2024-12-31"]

monthly_returns = df.pct_change().dropna()
n = len(monthly_returns)

rm = (1 + monthly_returns["SPY"]).prod() ** (12 / n) - 1
rf = 0.04
mrp = 0.1116
tax = 0.30

rows = []

for i in range(0, 99):
    d = i / 100
    e = 1 - d

    beta_l = beta_u * (1 + (1 - tax) * (d / e))

    Re = rf + beta_l * mrp

    Rd = 0.04 + (i * 0.001)

    WACC = (e * Re) + (d * Rd * (1 - tax))

    rows.append([
        round(d * 100, 2),
        round(e * 100, 2),
        round(d / e, 5),
        round(Rd * 100, 4),
        beta_l,
        round(Re * 100, 6),
        round(WACC * 100, 6)
    ])

wacc_df = pd.DataFrame(rows, columns=[
    "Debt %",
    "Equity %",
    "D/E Ratio",
    "Cost of Debt",
    "Relevered Beta",
    "Cost of Equity",
    "WACC"
])

print(wacc_df.head(15))
print(wacc_df.loc[wacc_df["WACC"].idxmin()])
