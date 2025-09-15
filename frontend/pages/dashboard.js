import { useState, useEffect } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import EmailVerificationGuard from '../components/EmailVerificationGuard';
import Sidebar from '../components/Sidebar';
import MetricsCard from '../components/MetricsCard';
import OrdersChart from '../components/OrdersChart';
import TopCustomers from '../components/TopCustomers';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from '../components/ProfileModal';
import { apiService } from '../lib/api';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';
import { 
  UsersIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TrendingUpIcon,
  CalendarIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register chart.js components once for this page
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Default empty metrics structure for when no data is available
const defaultMetrics = {
  summary: {
    totalCustomers: 0,
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    conversionRate: 0,
    returningCustomers: 0
  },
  ordersChartData: [],
  topCustomers: [],
  revenueByCategory: [],
  monthlyTrends: []
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMetrics();
      setMetrics(response.data.data || defaultMetrics);
    } catch (error) {
      console.error('Failed to fetch metrics:', error.message);
      // Show empty state instead of mock data
      setMetrics(defaultMetrics);
    } finally {
      setLoading(false);
    }
  };



  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  // Compute simple week-over-week deltas from ordersChartData
  const computeWoW = () => {
    const data = (metrics?.ordersChartData || []).slice();
    const last7 = data.slice(-7);
    const prev7 = data.slice(-14, -7);
    const sum = (arr, key) => arr.reduce((s, x) => s + (x?.[key] || 0), 0);
    const revenueNow = sum(last7, 'revenue');
    const revenuePrev = sum(prev7, 'revenue') || 0.0001;
    const ordersNow = sum(last7, 'orders');
    const ordersPrev = sum(prev7, 'orders') || 0.0001;
    const aovNow = ordersNow > 0 ? revenueNow / ordersNow : 0;
    const aovPrev = ordersPrev > 0 ? revenuePrev / ordersPrev : 0.0001;
    const pct = (now, prev) => Math.round(((now - prev) / prev) * 100);
    return {
      revenuePct: pct(revenueNow, revenuePrev),
      ordersPct: pct(ordersNow, ordersPrev),
      aovPct: pct(aovNow, aovPrev)
    };
  };

  const wow = computeWoW();

  return (
    <ProtectedRoute>
      <EmailVerificationGuard>
        <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.06}
          duration={3}
          repeatDelay={1}
          className={cn(
            "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
          )}
        />
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top navigation */}
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Dashboard Header */}
          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
                  <p className="text-xl text-gray-700 mt-1">Welcome back, {user?.displayName || user?.email}</p>
                </div>
                
                {/* Account Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                  >
                    👤
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <button
                        onClick={() => {
                          setShowProfile(true);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <span className="mr-2">👤</span>
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <span className="mr-2">🚪</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

          {metrics && (
            <>
              {/* Main Metrics Cards */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <MetricsCard
                  title="Total Customers"
                  value={metrics.summary.totalCustomers.toLocaleString()}
                  icon={UsersIcon}
                  trend="+12.5%"
                  trendUp={true}
                />
                <MetricsCard
                  title="Total Revenue"
                  value={`₹${metrics.summary.totalRevenue.toLocaleString()}`}
                  icon={CurrencyDollarIcon}
                  trend="+8.2%"
                  trendUp={true}
                  wow={wow.revenuePct}
                />
                <MetricsCard
                  title="Total Orders"
                  value={metrics.summary.totalOrders.toLocaleString()}
                  icon={ShoppingBagIcon}
                  trend="+15.3%"
                  trendUp={true}
                  wow={wow.ordersPct}
                />
              </div>

              {/* Secondary Metrics */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
                <MetricsCard
                  title="Average Order Value"
                  value={`₹${metrics.summary.averageOrderValue.toFixed(2)}`}
                  icon={ChartBarIcon}
                  trend="+3.1%"
                  trendUp={true}
                  wow={wow.aovPct}
                />
                <MetricsCard
                  title="Conversion Rate"
                  value={`${metrics.summary.conversionRate}%`}
                  icon={TrendingUpIcon}
                  trend="+0.8%"
                  trendUp={true}
                />
                <MetricsCard
                  title="Returning Customers"
                  value={metrics.summary.returningCustomers.toLocaleString()}
                  icon={CalendarIcon}
                  trend="+18.7%"
                  trendUp={true}
                />
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Orders & Revenue over time (existing) */}
                <div className="lg:col-span-2">
                  <OrdersChart data={metrics.ordersChartData} />
                </div>
              </div>

              {/* New Mini-Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Orders per day (bars) */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Orders per Day</h3>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: (metrics.ordersChartData || []).map(d => d.date),
                        datasets: [{
                          label: 'Orders',
                          data: (metrics.ordersChartData || []).map(d => d.orders),
                          backgroundColor: 'rgba(59, 130, 246, 0.7)'
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                      }}
                    />
                  </div>
                </div>

                {/* AOV Trend (line) */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Average Order Value Trend</h3>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: (metrics.ordersChartData || []).map(d => d.date),
                        datasets: [{
                          label: 'AOV (₹)',
                          data: (metrics.ordersChartData || []).map(d => d.orders > 0 ? (d.revenue / d.orders) : 0),
                          borderColor: 'rgb(16, 185, 129)',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          tension: 0.2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } }
                      }}
                    />
                  </div>
                </div>

                {/* Customers breakdown (doughnut) */}
                <div className="bg-white overflow-hidden shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Customers Breakdown</h3>
                  <div className="h-64 flex items-center">
                    <Doughnut
                      data={{
                        labels: ['New', 'Returning'],
                        datasets: [{
                          data: [
                            Math.max((metrics.summary.totalCustomers || 0) - (metrics.summary.returningCustomers || 0), 0),
                            metrics.summary.returningCustomers || 0
                          ],
                          backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(99, 102, 241, 0.8)']
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Revenue by Category */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
                    <div className="space-y-4">
                      {metrics.revenueByCategory.map((category, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-900">{category.category}</span>
                              <span className="text-gray-500">₹{category.revenue.toLocaleString()}</span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${category.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Trends */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Trends</h3>
                    <div className="space-y-4">
                      {metrics.monthlyTrends.map((month, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium text-gray-900">{month.month}</span>
                          <div className="flex space-x-4 text-sm text-gray-600">
                            <span>₹{(month.revenue / 1000).toFixed(0)}k</span>
                            <span>{month.orders} orders</span>
                            <span>{month.customers} customers</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Customers */}
              <div className="mb-8">
                <TopCustomers customers={metrics.topCustomers} />
              </div>
            </>
          )}

              {!metrics && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No data available. Please use the Sync Data page to connect your Shopify store.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfile && (
          <ProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        )}
        </div>
      </EmailVerificationGuard>
    </ProtectedRoute>
  );
}