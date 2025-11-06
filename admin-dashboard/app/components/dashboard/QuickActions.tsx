import { useNavigate } from 'react-router';
import {
  TruckIcon,
  MapIcon,
  BellIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Add New Bus',
      icon: TruckIcon,
      color: 'blue',
      onClick: () => navigate('/buses/new'),
    },
    {
      name: 'Create Route',
      icon: MapIcon,
      color: 'green',
      onClick: () => navigate('/routes/new'),
    },
    {
      name: 'Send Announcement',
      icon: BellIcon,
      color: 'yellow',
      onClick: () => navigate('/alerts'),
    },
    {
      name: 'Generate Report',
      icon: DocumentArrowDownIcon,
      color: 'purple',
      onClick: () => navigate('/reports'),
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200',
    green: 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 hover:bg-purple-100 text-purple-600 border-purple-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={action.onClick}
              className={`
                flex items-center justify-center p-4 rounded-lg border-2
                transition-all duration-200 hover:scale-105
                ${colorClasses[action.color as keyof typeof colorClasses]}
              `}
            >
              <Icon className="h-6 w-6 mr-2" />
              <span className="text-sm font-medium">{action.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


