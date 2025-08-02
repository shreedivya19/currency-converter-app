import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Calendar, DollarSign } from 'lucide-react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(100);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('30d');
  const [lastUpdated, setLastUpdated] = useState(null);

  // Popular currencies with their symbols
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' }
  ];

  // Mock historical data generator (in real app, fetch from API)
  const generateMockHistoricalData = (days) => {
    const data = [];
    const baseRate = 0.85 + Math.random() * 0.3; // Random base rate
    const today = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic fluctuation
      const fluctuation = (Math.sin(i * 0.1) + Math.random() - 0.5) * 0.05;
      const rate = Math.max(0.1, baseRate + fluctuation);
      
      data.push({
        date: date.toISOString().split('T')[0],
        rate: parseFloat(rate.toFixed(4)),
        displayDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return data;
  };

  // Mock exchange rate fetch (in real app, use actual API)
  const fetchExchangeRate = async () => {
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock rate calculation
      const mockRate = 0.5 + Math.random() * 1.5;
      setExchangeRate(mockRate);
      setConvertedAmount(amount * mockRate);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load historical data
  const loadHistoricalData = () => {
    const days = chartPeriod === '7d' ? 7 : chartPeriod === '30d' ? 30 : 90;
    const data = generateMockHistoricalData(days);
    setHistoricalData(data);
  };

  useEffect(() => {
    fetchExchangeRate();
    loadHistoricalData();
  }, [fromCurrency, toCurrency, chartPeriod]);

  useEffect(() => {
    if (exchangeRate) {
      setConvertedAmount(amount * exchangeRate);
    }
  }, [amount, exchangeRate]);

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrentSymbol = (currencyCode) => {
    return currencies.find(c => c.code === currencyCode)?.symbol || currencyCode;
  };

  const calculateTrend = () => {
    if (historicalData.length < 2) return { trend: 'neutral', percentage: 0 };
    
    const latest = historicalData[historicalData.length - 1].rate;
    const previous = historicalData[historicalData.length - 2].rate;
    const change = ((latest - previous) / previous) * 100;
    
    return {
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(change).toFixed(2)
    };
  };

  const trend = calculateTrend();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <DollarSign className="text-blue-600" size={40} />
            Currency Converter
          </h1>
          <p className="text-gray-600">Real-time exchange rates with historical charts</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Converter Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Convert Currency</h2>
              <button
                onClick={fetchExchangeRate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={handleSwapCurrencies}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                title="Swap currencies"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Result */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">
                  {getCurrentSymbol(fromCurrency)}{amount.toLocaleString()} {fromCurrency} =
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {loading ? (
                    <div className="animate-pulse">Loading...</div>
                  ) : (
                    `${getCurrentSymbol(toCurrency)}${convertedAmount?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })} ${toCurrency}`
                  )}
                </div>
                {exchangeRate && (
                  <div className="text-sm text-gray-600">
                    1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                  </div>
                )}
                {lastUpdated && (
                  <div className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>

            {/* Trend Indicator */}
            {trend.percentage > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                {trend.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.percentage}% {trend.trend === 'up' ? 'increase' : 'decrease'} from yesterday
                </span>
              </div>
            )}
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Historical Rates</h2>
              <div className="flex gap-2">
                {['7d', '30d', '90d'].map(period => (
                  <button
                    key={period}
                    onClick={() => setChartPeriod(period)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      chartPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                {fromCurrency} to {toCurrency} Exchange Rate
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    domain={['dataMin - 0.01', 'dataMax + 0.01']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [value.toFixed(4), 'Exchange Rate']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 text-xs text-gray-500 text-center">
              * Historical data is for demonstration purposes
            </div>
          </div>
        </div>

        {/* Currency Info Cards */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currencies.slice(0, 4).map(currency => (
            <div key={currency.code} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{currency.code}</div>
                  <div className="text-sm text-gray-600">{currency.name}</div>
                </div>
                <div className="text-2xl">{currency.symbol}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <CurrencyConverter />
    </div>
  );
}

export default App;