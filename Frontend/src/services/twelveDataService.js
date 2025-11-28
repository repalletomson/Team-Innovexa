const DEFAULT_API_KEY = '2bf1176979a44a008cf7bac61728661a';
const BASE_URL = 'https://api.twelvedata.com/time_series';

const DEFAULT_CONFIG = {
  symbols: ['MSFT', 'NFLX', 'SPY'],
  startDate: '2019-12-01',
  endDate: '2024-12-31',
  interval: '1day',
  outputsize: 5000,
};

const toQueryString = (params) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

const normalizeToMonthlySeries = (values = []) => {
  const monthMap = new Map();

  values.forEach((point) => {
    if (!point?.datetime || !point?.close) return;
    const date = new Date(point.datetime);
    const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const currentEntry = monthMap.get(monthKey);

    if (!currentEntry || date > currentEntry.date) {
      monthMap.set(monthKey, { date, close: Number(point.close), month_end: point.datetime.slice(0, 10) });
    }
  });

  return Array.from(monthMap.values())
    .sort((a, b) => a.date - b.date)
    .map(({ month_end, close }) => ({ month_end, close }));
};

const mergeSymbolSeries = (seriesBySymbol) => {
  const monthMap = new Map();

  Object.entries(seriesBySymbol).forEach(([symbol, series]) => {
    series.forEach(({ month_end, close }) => {
      if (!month_end) return;
      const entry = monthMap.get(month_end) || { month_end };
      entry[symbol] = close;
      monthMap.set(month_end, entry);
    });
  });

  return Array.from(monthMap.values()).sort(
    (a, b) => new Date(a.month_end) - new Date(b.month_end)
  );
};

const fetchSymbolSeries = async (symbol, config) => {
  const apiKey = process.env.REACT_APP_TWELVE_DATA_KEY || DEFAULT_API_KEY;
  const query = toQueryString({
    symbol,
    interval: config.interval,
    start_date: config.startDate,
    end_date: config.endDate,
    apikey: apiKey,
    outputsize: config.outputsize,
    order: 'asc',
    format: 'JSON',
  });

  const response = await fetch(`${BASE_URL}?${query}`);

  if (!response.ok) {
    throw new Error(`Unable to reach TwelveData for ${symbol}`);
  }

  const payload = await response.json();

  if (payload.status && payload.status !== 'ok') {
    throw new Error(payload.message || `TwelveData error for ${symbol}`);
  }

  if (!payload.values) {
    throw new Error(`Missing time-series data for ${symbol}`);
  }

  return payload.values;
};

/**
 * Fetches daily time-series data from TwelveData and converts it into
 * a consolidated month-end JSON structure:
 * [
 *   { month_end: '2020-01-31', MSFT: 180.12, NFLX: 350.22, SPY: 320.4 },
 *   ...
 * ]
 */
export const fetchMonthlyData = async (overrides = {}) => {
  const config = { ...DEFAULT_CONFIG, ...overrides };
  const results = {};

  await Promise.all(
    config.symbols.map(async (symbol) => {
      const rawSeries = await fetchSymbolSeries(symbol, config);
      results[symbol] = normalizeToMonthlySeries(rawSeries);
    })
  );

  return mergeSymbolSeries(results);
};

export const fetchMonthlyDataAsJson = async (overrides = {}) => {
  const data = await fetchMonthlyData(overrides);
  return JSON.stringify(data, null, 2);
};

export default fetchMonthlyData;

