import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

export default function MetricsCard({ title, value, subtitle, icon: Icon, trend, trendUp, wow }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && <Icon className="h-6 w-6 text-gray-400" />}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {trend && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trendUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trendUp ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                    )}
                    <span className="sr-only">{trendUp ? 'Increased' : 'Decreased'} by</span>
                    {trend}
                  </div>
                )}
                {typeof wow === 'number' && (
                  <div className={`ml-3 text-xs px-2 py-0.5 rounded-full ${wow >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {wow >= 0 ? '+' : ''}{wow}% vs last 7 days
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-500">
                  {subtitle}
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}