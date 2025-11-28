import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import fetchMonthlyData from '../services/twelveDataService';
import '../styles/Dashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
const COLOR_TOKENS = {
  MSFT: '#4F8EF7',
  NFLX: '#EF4444',
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState('dashboard');
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mddData, setMddData] = useState({});
  const [mddLoading, setMddLoading] = useState(false);
  const [mddError, setMddError] = useState('');

  const refreshTimerRef = useRef(null);

  const loadMonthlySeries = useCallback(
    async (showRefreshing = false) => {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError('');

      try {
        const data = await fetchMonthlyData();
        setMonthlyData(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message || 'Unable to load TwelveData results at the moment.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  const fetchMDDData = useCallback(async () => {
    setMddLoading(true);
    setMddError('');
    
    try {
      const symbols = ['NFLX', 'MSFT'];
      const response = await fetch(' http://127.0.0.1:5000/api/stock-analysis/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbols })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMddData(data);
    } catch (err) {
      setMddError(err.message || 'Failed to fetch MDD data');
    } finally {
      setMddLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMonthlySeries();
    fetchMDDData(); // Load MDD data on component mount
    refreshTimerRef.current = setInterval(() => loadMonthlySeries(true), REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [loadMonthlySeries, fetchMDDData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hexToRgba = (hex, alpha) => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const formatMonthLabel = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const createLineData = useCallback(
    (symbol, color) => {
      if (!monthlyData.length) return null;

      const dataPoints = monthlyData.map((entry) => entry[symbol] ?? null);
      if (dataPoints.every((value) => value === null || value === undefined)) {
        return null;
      }

      const labels = monthlyData.map((entry) => formatMonthLabel(entry.month_end));

      return {
        labels,
        datasets: [
          {
            label: `${symbol} Close`,
            data: dataPoints,
            borderColor: color,
            borderWidth: 2,
            fill: true,
            pointRadius: 2,
            tension: 0.35,
            spanGaps: true,
            backgroundColor: (context) => {
              const { ctx, chartArea } = context.chart;
              if (!chartArea) return color;
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, hexToRgba(color, 0.25));
              gradient.addColorStop(1, hexToRgba(color, 0));
              return gradient;
            },
          },
        ],
      };
    },
    [monthlyData]
  );

  const baseChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: isDark ? '#0f1f35' : '#ffffff',
          titleColor: isDark ? '#f1f5f9' : '#0f172a',
          bodyColor: isDark ? '#cbd5f5' : '#334155',
          borderColor: isDark ? '#1d3354' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 10,
          displayColors: false,
          callbacks: {
            title: (items) => items[0]?.label ?? '',
            label: (item) => (item.parsed.y != null ? `$${item.parsed.y.toFixed(2)}` : ''),
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            drawBorder: false,
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: { family: 'DM Sans', size: 11 },
            maxTicksLimit: 8,
          },
        },
        y: {
          grid: {
            color: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
            drawBorder: false,
          },
          ticks: {
            color: isDark ? '#94a3b8' : '#475569',
            font: { family: 'DM Sans', size: 11 },
            callback: (value) => `$${value}`,
          },
        },
      },
    }),
    [isDark]
  );

  const getLatestPoint = useCallback(
    (symbol) => {
      for (let i = monthlyData.length - 1; i >= 0; i -= 1) {
        const value = monthlyData[i][symbol];
        if (value != null) {
          return { value, month_end: monthlyData[i].month_end };
        }
      }
      return null;
    },
    [monthlyData]
  );

  const msftSummary = useMemo(() => getLatestPoint('MSFT'), [getLatestPoint]);
  const nflxSummary = useMemo(() => getLatestPoint('NFLX'), [getLatestPoint]);

  const msftChartData = useMemo(
    () => createLineData('MSFT', COLOR_TOKENS.MSFT),
    [createLineData]
  );
  const nflxChartData = useMemo(
    () => createLineData('NFLX', COLOR_TOKENS.NFLX),
    [createLineData]
  );

  // MDD Chart Data
  const createMDDChartData = useCallback(() => {
    if (!mddData.stocks || Object.keys(mddData.stocks).length === 0) return null;

    const symbols = Object.keys(mddData.stocks);
    const datasets = [];
    
    symbols.forEach((symbol, index) => {
      const stockData = mddData.stocks[symbol];
      if (stockData.error) return;
      
      const color = symbol === 'MSFT' ? COLOR_TOKENS.MSFT : COLOR_TOKENS.NFLX;
      
      datasets.push({
        label: `${symbol} Drawdown`,
        data: stockData.monthly_data.map(item => ({
          x: item.date,
          y: item.drawdown_pct
        })),
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.1),
        borderWidth: 2,
        fill: false,
        pointRadius: 1,
        tension: 0.1,
      });
    });

    return {
      datasets
    };
  }, [mddData]);

  // Combined Price Chart Data
  const createCombinedPriceChartData = useCallback(() => {
    if (!mddData.stocks || Object.keys(mddData.stocks).length === 0) return null;

    const symbols = Object.keys(mddData.stocks);
    const datasets = [];
    
    symbols.forEach((symbol, index) => {
      const stockData = mddData.stocks[symbol];
      if (stockData.error) return;
      
      const color = symbol === 'MSFT' ? COLOR_TOKENS.MSFT : COLOR_TOKENS.NFLX;
      
      datasets.push({
        label: `${symbol} Price`,
        data: stockData.monthly_data.map(item => ({
          x: item.date,
          y: item.close_price
        })),
        borderColor: color,
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return color;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, hexToRgba(color, 0.25));
          gradient.addColorStop(1, hexToRgba(color, 0));
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        pointRadius: 2,
        tension: 0.35,
        spanGaps: true,
      });
    });

    return {
      datasets
    };
  }, [mddData]);

  const mddChartData = useMemo(() => createMDDChartData(), [createMDDChartData]);
  const combinedPriceChartData = useMemo(() => createCombinedPriceChartData(), [createCombinedPriceChartData]);

  return (
    <div className={`dashboard ${sidebarOpen ? '' : 'dashboard--sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <div className="dashboard__sidebar-header">
          <Link to="/" className="dashboard__logo">
            <div className="dashboard__logo-icon">
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M20 2L38 12V28L20 38L2 28V12L20 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M20 14L28 18V26L20 30L12 26V18L20 14Z" fill="currentColor"/>
              </svg>
            </div>
            <span className="dashboard__logo-text">INVEX</span>
          </Link>
          <button 
            className="dashboard__sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <nav className="dashboard__nav">
          <button 
            className={`dashboard__nav-item ${activePage === 'dashboard' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('dashboard')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Dashboard</span>
          </button>
          
          {/* <button 
            className={`dashboard__nav-item ${activePage === 'portfolio' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('portfolio')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Portfolio</span>
          </button> */}
          
          {/* <button 
            className={`dashboard__nav-item ${activePage === 'analytics' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('analytics')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Analytics</span>
          </button>
           */}
          <button 
            className={`dashboard__nav-item ${activePage === 'mdd' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => {
              setActivePage('mdd');
              if (Object.keys(mddData).length === 0) {
                fetchMDDData();
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10H21V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>MDD</span>
          </button>
          <button 
            className={`dashboard__nav-item ${activePage === 'mdd' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => {
              setActivePage('mdd');
              if (Object.keys(mddData).length === 0) {
                fetchMDDData();
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10H21V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>WACC</span>
          </button>
      
        </nav>
        
        <div className="dashboard__sidebar-footer">
          <div className="dashboard__user">
            <div className="dashboard__user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="dashboard__user-info">
              <span className="dashboard__user-name">{user?.name || 'User'}</span>
              <span className="dashboard__user-email">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          <button className="dashboard__logout" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard__main">
        {/* Top Bar */}
        <header className="dashboard__header">
          <div className="dashboard__header-left">
            <button 
              className="dashboard__menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="dashboard__title">
              <h1>{activePage === 'mdd' ? 'Maximum Drawdown Analysis' : 'Dashboard'}</h1>
              <p>{activePage === 'mdd' ? 'Stock drawdown comparison and analysis' : `Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}</p>
            </div>
          </div>
          <div className="dashboard__header-right">
            <button
              className="dashboard__refresh-btn"
              onClick={() => loadMonthlySeries(true)}
              disabled={isRefreshing}
            >
              <svg viewBox="0 0 24 24" fill="none" className={isRefreshing ? 'spinning' : ''}>
                <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Refresh Data
            </button>
            <button className="dashboard__theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? (
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard__content">
          {activePage === 'mdd' ? (
            <>
              {/* MDD Status */}
              <div className="dashboard__status">
                <div className="dashboard__status-info">
                  {mddLoading && (
                    <span className="dashboard__refreshing">
                      <span className="dashboard__spinner-small"></span>
                      Loading MDD data...
                    </span>
                  )}
                  <button
                    className="dashboard__refresh-btn"
                    onClick={fetchMDDData}
                    disabled={mddLoading}
                  >
                    <svg viewBox="0 0 24 24" fill="none" className={mddLoading ? 'spinning' : ''}>
                      <path d="M23 4V10H17M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1112 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Refresh MDD Data
                  </button>
                </div>
              </div>

              {/* MDD Error Message */}
              {mddError && (
                <div className="dashboard__error">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{mddError}</span>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Last Updated & Refresh Status */}
              <div className="dashboard__status">
                <div className="dashboard__status-info">
                  {lastUpdated && (
                    <>
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <span>Last updated: {formatTimestamp(lastUpdated)}</span>
                    </>
                  )}
                  {isRefreshing && (
                    <span className="dashboard__refreshing">
                      <span className="dashboard__spinner-small"></span>
                      Refreshing...
                    </span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="dashboard__error">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
            </>
          )}

          {/* Loading State */}
          {activePage === 'mdd' ? (
            mddLoading ? (
              <div className="dashboard__loading">
                <div className="dashboard__loading-spinner"></div>
                <p>Loading MDD analysis...</p>
              </div>
            ) : mddData.stocks ? (
              <>
                {/* MDD Stats Cards */}
                <div className="dashboard__stats">
                  {Object.entries(mddData.stocks).map(([symbol, data]) => (
                    !data.error && (
                      <div key={symbol} className="dashboard__stat-card">
                        <div className="dashboard__stat-header">
                          <span className="dashboard__stat-label">{symbol}</span>
                          <span className="dashboard__stat-badge dashboard__stat-badge--negative">
                            Max Drawdown
                          </span>
                        </div>
                        <div className="dashboard__stat-value">
                          {data.max_drawdown.toFixed(2)}%
                        </div>
                        <div className="dashboard__stat-change">
                          <span>Current: {data.current_drawdown.toFixed(2)}%</span>
                          <span>Total Return: {data.total_return_pct.toFixed(2)}%</span>
                        </div>
                      </div>
                    )
                  ))}
                  
                  {mddData.comparison_summary && (
                    <div className="dashboard__stat-card dashboard__stat-card--primary">
                      <div className="dashboard__stat-header">
                        <span className="dashboard__stat-label">Best Performer</span>
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="dashboard__stat-value">
                        {mddData.comparison_summary.best_performer}
                      </div>
                      <div className="dashboard__stat-sub">
                        Highest total return in comparison
                      </div>
                    </div>
                  )}
                </div>

                {/* MDD Chart */}
                <div className="dashboard__charts">
                  <div className="dashboard__chart-card dashboard__chart-card--full">
                    <div className="dashboard__chart-header">
                      <div>
                        <h3>Maximum Drawdown Comparison</h3>
                        <p>Drawdown percentage over time for MSFT vs NFLX</p>
                      </div>
                    </div>
                    <div className="dashboard__chart-container">
                      {mddChartData ? (
                        <Line 
                          data={mddChartData} 
                          options={{
                            ...baseChartOptions,
                            scales: {
                              ...baseChartOptions.scales,
                              y: {
                                ...baseChartOptions.scales.y,
                                ticks: {
                                  ...baseChartOptions.scales.y.ticks,
                                  callback: (value) => `${value}%`,
                                },
                              },
                            },
                            plugins: {
                              ...baseChartOptions.plugins,
                              legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                  color: isDark ? '#f1f5f9' : '#0f172a',
                                  font: { family: 'DM Sans', size: 12 },
                                  usePointStyle: true,
                                  pointStyle: 'line',
                                },
                              },
                            },
                          }} 
                        />
                      ) : (
                        <div className="dashboard__chart-empty">No MDD data available.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MDD Info Cards */}
                {/* <div className="dashboard__info-cards">
                  <div className="dashboard__info-card">
                    <div className="dashboard__info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="dashboard__info-content">
                      <h4>Maximum Drawdown</h4>
                      <p>Measures the largest peak-to-trough decline in portfolio value over the analysis period.</p>
                    </div>
                  </div>
                  
                  <div className="dashboard__info-card">
                    <div className="dashboard__info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="dashboard__info-content">
                      <h4>Risk Assessment</h4>
                      <p>Compare risk profiles between different stocks using drawdown analysis and volatility metrics.</p>
                    </div>
                  </div>
                  
                  <div className="dashboard__info-card">
                    <div className="dashboard__info-icon">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="dashboard__info-content">
                      <h4>Portfolio Optimization</h4>
                      <p>Use drawdown data to optimize portfolio allocation and risk management strategies.</p>
                    </div>
                  </div>
                </div> */}
              </>
            ) : (
              <div className="dashboard__chart-empty">Click "Refresh MDD Data" to load analysis.</div>
            )
          ) : isLoading ? (
            <div className="dashboard__loading">
              <div className="dashboard__loading-spinner"></div>
              <p>Loading market data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="dashboard__stats">
                <div className="dashboard__stat-card dashboard__stat-card--primary">
                  <div className="dashboard__stat-header">
                    <span className="dashboard__stat-label">MSFT</span>
                    <span className="dashboard__stat-badge dashboard__stat-badge--positive">
                      Latest Price
                    </span>
                  </div>
                  <div className="dashboard__stat-value">
                    {msftSummary ? `$${msftSummary.value.toFixed(2)}` : '—'}
                  </div>
                  <div className="dashboard__stat-change">
                    <span>{msftSummary ? formatMonthLabel(msftSummary.month_end) : 'Pending'}</span>
                    <span>Microsoft Corporation</span>
                  </div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-header">
                    <span className="dashboard__stat-label">NFLX</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-value">
                    {nflxSummary ? `$${nflxSummary.value.toFixed(2)}` : '—'}
                  </div>
                  <div className="dashboard__stat-sub">
                    {nflxSummary ? formatMonthLabel(nflxSummary.month_end) : 'Pending refresh'}
                  </div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-header">
                    <span className="dashboard__stat-label">Data Window</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-value">2019 – 2024</div>
                  <div className="dashboard__stat-sub">Month-end closing prices</div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-header">
                    <span className="dashboard__stat-label">Auto Refresh</span>
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__stat-value">30 Minutes</div>
                  <div className="dashboard__stat-sub">Next scheduled update</div>
                </div>
              </div>

              {/* Charts */}
              <div className="dashboard__charts">
                {/* Combined Price Chart */}
                <div className="dashboard__chart-card dashboard__chart-card--full">
                  <div className="dashboard__chart-header">
                    <div>
                      <h3>MSFT vs NFLX - Combined Price Comparison</h3>
                      <p>Monthly closing prices comparison · Real-time stock analysis</p>
                    </div>
                  </div>
                  <div className="dashboard__chart-container">
                    {combinedPriceChartData ? (
                      <Line 
                        data={combinedPriceChartData} 
                        options={{
                          ...baseChartOptions,
                          plugins: {
                            ...baseChartOptions.plugins,
                            legend: {
                              display: true,
                              position: 'top',
                              labels: {
                                color: isDark ? '#f1f5f9' : '#0f172a',
                                font: { family: 'DM Sans', size: 12 },
                                usePointStyle: true,
                                pointStyle: 'line',
                              },
                            },
                          },
                          scales: {
                            ...baseChartOptions.scales,
                            y: {
                              ...baseChartOptions.scales.y,
                              ticks: {
                                ...baseChartOptions.scales.y.ticks,
                                callback: (value) => `$${value}`,
                              },
                            },
                          },
                        }} 
                      />
                    ) : (
                      <div className="dashboard__chart-empty">Loading combined price data...</div>
                    )}
                  </div>
                </div>

                {/* <div className="dashboard__chart-card dashboard__chart-card--full">
                  <div className="dashboard__chart-header">
                    <div>
                      <h3>Individual Stock Performance</h3>
                      <p>Separate analysis for detailed comparison</p>
                    </div>
                  </div>
                  <div className="dashboard__chart-container" style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: COLOR_TOKENS.MSFT, marginBottom: '10px' }}>Microsoft (MSFT)</h4>
                      {msftChartData ? (
                        <Line data={msftChartData} options={baseChartOptions} />
                      ) : (
                        <div className="dashboard__chart-empty">No Microsoft data available.</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: COLOR_TOKENS.NFLX, marginBottom: '10px' }}>Netflix (NFLX)</h4>
                      {nflxChartData ? (
                        <Line data={nflxChartData} options={baseChartOptions} />
                      ) : (
                        <div className="dashboard__chart-empty">No Netflix data available.</div>
                      )}
                    </div>
                  </div>
                </div> */}
              </div>

              {/* Info Cards */}
              {/* <div className="dashboard__info-cards">
                <div className="dashboard__info-card">
                  <div className="dashboard__info-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__info-content">
                    <h4>TwelveData Integration</h4>
                    <p>Live market intelligence sourced directly from TwelveData REST APIs.</p>
                  </div>
                </div>
                
                <div className="dashboard__info-card">
                  <div className="dashboard__info-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__info-content">
                    <h4>Build-Time JSON</h4>
                    <p>Daily feeds are converted into reusable month-end JSON for analytics.</p>
                  </div>
                </div>
                
                <div className="dashboard__info-card">
                  <div className="dashboard__info-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="dashboard__info-content">
                    <h4>Benchmarks Ready</h4>
                    <p>SPY series is cached for future peer analysis and performance attribution.</p>
                  </div>
                </div>
              </div> */}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

