import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { apiService } from '../../lib/api';
import { AnimatedGridPattern } from '@/components/ui/animated-grid-pattern';
import { cn } from '@/lib/utils';

// Default empty orders structure
const defaultOrders = [];

const statusColors = {
  paid: { bg: 'bg-green-100', text: 'text-green-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  abandoned: { bg: 'bg-orange-100', text: 'text-orange-800' },
  fulfilled: { bg: 'bg-blue-100', text: 'text-blue-800' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800' }
};

export default function Orders() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await apiService.getOrders();
        const ordersData = response.data.data?.orders || defaultOrders;
        
        // Transform Shopify order data to match UI expectations
        const transformedOrders = ordersData.map(order => ({
          id: order.orderNumber || order.id,
          date: order.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          status: (order.financialStatus === 'paid') ? 'paid' : (order.financialStatus === 'abandoned' ? 'abandoned' : (order.fulfillmentStatus || 'pending')),
          amount: order.totalPrice || 0,
          customer: order.customer ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim() || order.email || 'Guest' : (order.email || 'Guest'),
          email: order.email || '',
          currency: order.currency || 'INR',
          financialStatus: order.financialStatus || 'pending',
          lineItems: order.lineItems || []
        }));
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error.message);
        setOrders(defaultOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredAndSortedOrders = orders
    .filter(order => statusFilter === 'all' || order.status === statusFilter)
    .sort((a, b) => {
      const [field, direction] = sortBy.split('-');
      const multiplier = direction === 'desc' ? -1 : 1;
      
      if (field === 'date') {
        return multiplier * (new Date(a.date) - new Date(b.date));
      }
      return multiplier * (a[field] - b[field]);
    });

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
              <div className="bg-white shadow rounded-lg p-6">
                <div className="sm:flex sm:items-center mb-6">
                  <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
                    <p className="mt-2 text-sm text-gray-700">
                      View and manage all orders from your Shopify store
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="fulfilled">Fulfilled</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="date-desc">Newest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="amount-desc">Amount: High to Low</option>
                      <option value="amount-asc">Amount: Low to High</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col">
                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Order ID</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Customer</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                              <tr>
                                <td colSpan="5" className="text-center py-4">Loading...</td>
                              </tr>
                            ) : filteredAndSortedOrders.map((order) => (
                              <tr key={order.id}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{order.id}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm">
                                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status].bg} ${statusColors[order.status].text}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                  {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR'
                                  }).format(order.amount)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                                  {new Date(order.date).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">{order.customer}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
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