import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { apiService } from '../../lib/api';
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
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

// Register ChartJS components
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

// Default empty analytics data
const defaultAnalytics = {
  revenueTrends: {
    labels: [],
    data: [],
  },
  topProducts: [],
  customerRetention: {
    returning: 0,
    new: 0,
  },
  cartAbandonment: {
    labels: [],
    data: [],
  },
};

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(defaultAnalytics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiService.getMetrics();
        const metrics = response.data.data || {};
        
        // Transform metrics data for charts
        const transformedData = {
          revenueTrends: {
            labels: metrics.ordersChartData?.map(item => item.date) || [],
            data: metrics.ordersChartData?.map(item => item.revenue) || [],
          },
          topProducts: metrics.topCustomers?.slice(0, 5).map(customer => ({
            name: `${customer.firstName} ${customer.lastName}`,
            sales: customer.ordersCount || 0
          })) || [],
          customerRetention: {
            returning: metrics.summary?.returningCustomers || 0,
            new: (metrics.summary?.totalCustomers || 0) - (metrics.summary?.returningCustomers || 0),
          },
          cartAbandonment: {
            labels: metrics.ordersChartData?.map(item => item.date) || [],
            data: metrics.ordersChartData?.map(() => Math.floor(Math.random() * 30) + 10) || [], // Placeholder data
          },
        };
        
        setAnalyticsData(transformedData);
      } catch (error) {
        console.error('Failed to fetch analytics:', error.message);
        setAnalyticsData(defaultAnalytics);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  const revenueChartData = {
    labels: analyticsData.revenueTrends.labels,
    datasets: [{
      label: 'Daily Revenue',
      data: analyticsData.revenueTrends.data,
      borderColor: 'rgb(79, 70, 229)',
      tension: 0.1,
    }],
  };

  const topProductsChartData = {
    labels: analyticsData.topProducts.map(product => product.name),
    datasets: [{
      label: 'Orders',
      data: analyticsData.topProducts.map(product => product.sales),
      backgroundColor: [
        'rgba(79, 70, 229, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
    }],
  };

  const customerRetentionData = {
    labels: ['Returning Customers', 'New Customers'],
    datasets: [{
      data: [analyticsData.customerRetention.returning, analyticsData.customerRetention.new],
      backgroundColor: ['rgba(79, 70, 229, 0.8)', 'rgba(59, 130, 246, 0.8)'],
    }],
  };

  return (
    <ProtectedRoute>
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
        
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Revenue Trends */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Trends</h2>
                  <div className="h-80">
                    <Line
                      data={revenueChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: value => `₹${value.toLocaleString()}`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Top-Selling Products */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Top-Selling Products</h2>
                  <div className="h-80">
                    <Bar
                      data={topProductsChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                      }}
                    />
                  </div>
                </div>

                {/* Customer Retention */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Retention</h2>
                  <div className="h-80">
                    <Doughnut
                      data={customerRetentionData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Cart Abandonment */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Cart Abandonment Rate</h2>
                  <div className="h-80">
                    <Line
                      data={{
                        labels: analyticsData.cartAbandonment.labels,
                        datasets: [{
                          label: 'Abandonment Rate (%)',
                          data: analyticsData.cartAbandonment.data,
                          borderColor: 'rgb(239, 68, 68)',
                          tension: 0.1,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                              callback: value => `${value}%`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}