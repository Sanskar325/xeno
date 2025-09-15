import { formatINR } from '../utils/formatters'; // You'll need to create this utility

export default function TopCustomers({ customers }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Customers by Spend</h3>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between py-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{customer.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{customer.orders} orders</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatINR(customer.totalSpent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}