// frontend/src/pages/client/portfolio/PortfolioOverviewPage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { portfolioApi } from '../../../services/api/portfolioApi';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import './PortfolioOverviewPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface PortfolioSummary {
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  numberOfInvestments: number;
  cashBalance: number;
}

interface AssetAllocation {
  category: string;
  value: number;
  percentage: number;
}

export const PortfolioOverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, performance, allocation] = await Promise.all([
        portfolioApi.getPortfolioSummary(),
        portfolioApi.getPortfolioPerformance(),
        portfolioApi.getAssetAllocation(),
      ]);

      setSummary(summaryData);
      setPerformanceData(performance);
      setAssetAllocation(allocation);
    } catch (err) {
      setError('Failed to load portfolio data. Please try again later.');
      console.error('Error fetching portfolio data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getValueClass = (value: number): string => {
    return value >= 0 ? 'positive' : 'negative';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const doughnutData = {
    labels: assetAllocation.map(asset => asset.category),
    datasets: [
      {
        data: assetAllocation.map(asset => asset.value),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
        borderWidth: 0,
      },
    ],
  };

  const handleDownloadReport = () => {
    // TODO: Implement report download
    console.log('Downloading portfolio report...');
  };

  if (loading) {
    return (
      <div className="portfolio-overview-page">
        <div className="loading-container" role="status">
          <LoadingSpinner />
          <p>Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-overview-page">
        <div className="error-container" role="alert">
          <ErrorMessage message={error} onRetry={fetchPortfolioData} />
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="portfolio-overview-page">
      <main role="main">
        <div className="portfolio-header">
          <h1>Portfolio Overview</h1>
          <div className="header-actions">
            <Link to="/client/investments" className="action-link">
              View Investments
            </Link>
            <Link to="/client/investments/new" className="action-link action-link--primary">
              Add Investment
            </Link>
            <button 
              onClick={handleDownloadReport}
              className="action-button"
              aria-label="Download Report"
            >
              Download Report
            </button>
          </div>
        </div>

        <div className="portfolio-content">
          <div className="stats-grid">
            <div className="stat-card stat-card--primary">
              <h3>Total Portfolio Value</h3>
              <p className="stat-value">{formatCurrency(summary.totalValue)}</p>
            </div>

            <div className="stat-card">
              <h3>Total Gain/Loss</h3>
              <p className={`stat-value ${getValueClass(summary.totalGainLoss)}`}>
                {summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
              </p>
              <p className={`stat-percentage ${getValueClass(summary.totalGainLossPercentage)}`}>
                {formatPercentage(summary.totalGainLossPercentage)}
              </p>
            </div>

            <div className="stat-card">
              <h3>Day Change</h3>
              <p className={`stat-value ${getValueClass(summary.dayChange)}`}>
                {summary.dayChange >= 0 ? '+' : ''}{formatCurrency(summary.dayChange)}
              </p>
              <p className={`stat-percentage ${getValueClass(summary.dayChangePercentage)}`}>
                {formatPercentage(summary.dayChangePercentage)}
              </p>
            </div>

            <div className="stat-card">
              <h3>Investments</h3>
              <p className="stat-value">{summary.numberOfInvestments}</p>
            </div>

            <div className="stat-card">
              <h3>Cash Balance</h3>
              <p className="stat-value">{formatCurrency(summary.cashBalance)}</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h2>Performance History</h2>
              <div className="chart-container">
                {performanceData && (
                  <Line data={performanceData} options={chartOptions} />
                )}
              </div>
            </div>

            <div className="chart-card">
              <h2>Asset Allocation</h2>
              <div className="chart-container">
                <Doughnut data={doughnutData} options={chartOptions} />
              </div>
              <div className="allocation-breakdown">
                {assetAllocation.map((asset, index) => (
                  <div key={index} className="allocation-item">
                    <span className="allocation-category">{asset.category}</span>
                    <span className="allocation-percentage">{asset.percentage}%</span>
                    <span className="allocation-value">{formatCurrency(asset.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
