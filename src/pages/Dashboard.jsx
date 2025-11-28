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

  useEffect(() => {
    loadMonthlySeries();
    refreshTimerRef.current = setInterval(() => loadMonthlySeries(true), REFRESH_INTERVAL);

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [loadMonthlySeries]);

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
            <span className="dashboard__logo-text">APEX</span>
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
          
          <button 
            className={`dashboard__nav-item ${activePage === 'MDD' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('MDD')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>MDD</span>
          </button>
          
          <button 
            className={`dashboard__nav-item ${activePage === 'WACC' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('WACC')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>WACC</span>
          </button>
          <button 
            className={`dashboard__nav-item ${activePage === 'Compare' ? 'dashboard__nav-item--active' : ''}`}
            onClick={() => setActivePage('Compare')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Compare</span>
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
              <h1>Dashboard</h1>
              <p>Welcome back, {user?.name?.split(' ')[0] || 'User'}</p>
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

          {/* Loading State */}
          {isLoading ? (
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
                      Monthly Close
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
                  </div>
                  <div className="dashboard__stat-value">2019 – 2024</div>
                  <div className="dashboard__stat-sub">Month-end closing prices</div>
                </div>

                <div className="dashboard__stat-card">
                  <div className="dashboard__stat-header">
                    <span className="dashboard__stat-label">Auto Refresh</span>
                   
                  </div>
                  <div className="dashboard__stat-value">30 Minutes</div>
                  <div className="dashboard__stat-sub">Next scheduled update</div>
                </div>
              </div>

              {/* Charts */}
              <div className="dashboard__charts">
                <div className="dashboard__chart-card dashboard__chart-card--full">
                  <div className="dashboard__chart-header">
                    <div>
                      <h3>Microsoft (MSFT) Monthly Closing Price</h3>
                      <p>Resampled TwelveData series · Month-end closing values</p>
                    </div>
                  </div>
                  <div className="dashboard__chart-container">
                    {msftChartData ? (
                      <Line data={msftChartData} options={baseChartOptions} />
                    ) : (
                      <div className="dashboard__chart-empty">No Microsoft data available.</div>
                    )}
                  </div>
                </div>

                <div className="dashboard__chart-card dashboard__chart-card--full">
                  <div className="dashboard__chart-header">
                    <div>
                      <h3>Netflix (NFLX) Monthly Closing Price</h3>
                      <p>Comparison markers highlight long-term momentum</p>
                    </div>
                  </div>
                  <div className="dashboard__chart-container">
                    {nflxChartData ? (
                      <Line data={nflxChartData} options={baseChartOptions} />
                    ) : (
                      <div className="dashboard__chart-empty">No Netflix data available.</div>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

