'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, DollarSign, Users, TrendingUp, Percent } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { MetricsData, ProductMetrics, TrialConversionData } from '@/types/dashboard';

interface DashboardData {
  metrics: MetricsData;
  productMetrics: ProductMetrics;
  trialConversions: TrialConversionData[];
  lastUpdated: string;
  cached: boolean;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Helper function to set preset date ranges
  const setPresetDateRange = (days: number | 'all') => {
    if (days === 'all') {
      setStartDate('');
      setEndDate('');
      return;
    }
    
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for date filtering
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await fetch(`/api/metrics?${params.toString()}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch data');
      }
      
      setData(result.data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budgetdog Analytics</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Real-time subscription metrics and insights</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right">
                Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : 'Loading...'}
                {data?.cached && <span className="ml-2 text-primary-600">• Cached</span>}
              </div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Metric */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-lg">Total Monthly Recurring Revenue</p>
                <p className="text-4xl font-bold mt-2">
                  ${loading ? '...' : data?.metrics.total_mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
                <p className="text-primary-200 mt-2">
                  Across {loading ? '...' : data?.metrics.active || 0} active subscriptions
                </p>
              </div>
              <div className="text-primary-200">
                <DollarSign className="h-16 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700 font-medium">Date Range:</span>
              </div>
              
              {/* Preset Buttons */}
              <div className="grid grid-cols-2 sm:flex gap-2">
                <button
                  onClick={() => setPresetDateRange(7)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-md transition-colors text-center"
                >
                  7 Days
                </button>
                <button
                  onClick={() => setPresetDateRange(30)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-md transition-colors text-center"
                >
                  30 Days
                </button>
                <button
                  onClick={() => setPresetDateRange(90)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-md transition-colors text-center"
                >
                  90 Days
                </button>
                <button
                  onClick={() => setPresetDateRange('all')}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-primary-100 hover:text-primary-700 rounded-md transition-colors text-center"
                >
                  All Time
                </button>
              </div>
              
              {/* Custom Date Inputs */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start date"
                />
                <span className="text-gray-500 text-sm">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="End date"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium px-2 py-1 rounded-md hover:bg-primary-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Display current filter */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-600 text-center sm:text-left">
              {startDate && endDate ? (
                <span>Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}</span>
              ) : (
                <span>Showing all-time data</span>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title={startDate && endDate ? "New Subscriptions" : "Active Subscriptions"}
            value={data?.metrics.active || 0}
            icon={<Users className="h-6 w-6" />}
            loading={loading}
          />
          <MetricCard
            title={startDate && endDate ? "New Trials" : "Active Trials"}
            value={data?.metrics.trialing || 0}
            icon={<TrendingUp className="h-6 w-6" />}
            loading={loading}
          />
          <MetricCard
            title="Conversion Rate"
            value={`${data?.metrics.conversion_rate.toFixed(1) || '0.0'}%`}
            icon={<Percent className="h-6 w-6" />}
            loading={loading}
          />
          <MetricCard
            title="Predictive LTV"
            value={`$${data?.metrics.predictive_ltv.toLocaleString() || '0'}`}
            icon={<DollarSign className="h-6 w-6" />}
            loading={loading}
          />
        </div>

        {/* Product Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Product Performance</h2>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="animate-pulse space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {data && Object.entries(data.productMetrics).map(([productName, metrics]) => (
                  <div key={productName}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 text-center sm:text-left">{productName}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.active}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Active</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">${metrics.mrr.toFixed(2)}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">MRR</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.trialing}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Trials</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.conversion_rate.toFixed(1)}%</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">Conversion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Take Rate Analysis Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Take Rate Analysis</h2>
            <p className="text-gray-600 text-sm mt-1">Budgetdog Academy → Avery trial conversion rates</p>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Month Summary */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary-700">{data?.metrics.take_rate_data.take_rate}%</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Current Take Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-primary-600">{data?.metrics.take_rate_data.avery_signups}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">Avery Signups</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-gray-700">{data?.metrics.take_rate_data.new_bda_students}</div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">New BDA Members</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-3 text-center px-2">
                    {data?.metrics.take_rate_data.calculation_note}
                  </div>
                </div>

                {/* Monthly History */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Monthly History</h3>
                  <div className="space-y-3">
                    {data?.metrics.take_rate_data.monthly_history.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="font-medium text-gray-900">{month.month}</div>
                          <div className="text-sm text-gray-600">
                            {month.signups} signups from {month.newMembers} members
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${index === data.metrics.take_rate_data.monthly_history.length - 1 ? 'text-primary-600' : 'text-gray-700'}`}>
                          {month.rate}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Trial to Paid Conversion Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Trial to Paid Conversion</h2>
            <p className="text-gray-600 text-sm mt-1">Conversion rates from free trial to paid subscription</p>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">Overall Conversion Rate:</span>
                    <span className="text-2xl font-bold text-primary-600">{data?.metrics.conversion_rate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {data?.trialConversions.map(trial => {
                    const productName = Object.entries({
                      'prod_S9H5fDgFs9Lv7y': 'Millionaire Club',
                      'prod_S8Y6cYg18JDFLG': 'Network',
                      'prod_RslgGi1t7MBOE6': 'Academy'
                    }).find(([id]) => id === trial.productId)?.[1] || 'Unknown';
                    return (
                      <div key={trial.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-700 font-medium">{productName}:</span>
                        <span className="font-semibold text-gray-900">{trial.conversion_rate.toFixed(1)}% ({trial.conversions}/{trial.total_trials})</span>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-500 mt-4 text-center">
                  Based on trial-to-paid conversions over the last 12 months
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            <div>
              Data source: Stripe API • Products: Budgetdog Millionaire Club, Network, Academy
            </div>
            <div>
              Excludes test accounts • Updates every 30 minutes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}