
!pip install twelvedata pandas

from twelvedata import TDClient
import pandas as pd

API_KEY = ""   

td = TDClient(API_KEY)

symbols = ["MSFT", "NFLX", "SPY"]  
start_date = "2019-12-01"
end_date = "2024-12-31"
interval = "1day"

results = {}
for sym in symbols:
    print(f"Fetching {sym}...")
    ts = td.time_series(
        symbol=sym,
        interval=interval,
        start_date=start_date,
        end_date=end_date,
        outputsize=5000  
    ).as_pandas()
    ts.index = pd.to_datetime(ts.index)
    ts = ts.sort_index()
    month_end = ts['close'].resample('M').last().dropna()
    month_end.name = sym
    results[sym] = month_end

df_month_end = pd.concat(results.values(), axis=1)
df_month_end.columns = results.keys()
df_month_end.index.name = "month_end"
print(df_month_end.tail())

df_month_end.to_csv("month_end_closes_MSFT_NFLX_SPY_201912_202412.csv")
print("Saved CSV: month_end_closes_MSFT_NFLX_SPY_201912_202412.csv")
