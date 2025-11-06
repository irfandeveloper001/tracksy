import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  TruckIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import alertService from '../../lib/api/alertService';
import AlertHistory from '../../components/alerts/AlertHistory';
import toast from 'react-hot-toast';

export default function AlertDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch alert details
  const { data: alert, isLoading, refetch } = useQuery({
    queryKey: ['alert', id],
    queryFn: () => alertService.getAlertById(id!),
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  // Fetch alert history
  const { data: history = [] } = useQuery({
    queryKey: ['alert-history', id],
    queryFn: () => alertService.getAlertHistory(id!),
    enabled: !!id,
  });

  // Acknowledge mutation
  const acknowledgeMutation = useMutation({
    mutationFn: (notes?: string) => alertService.acknowledgeAlert(id!, notes),
    onSuccess: () => {
      toast.success('Alert acknowledged');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to acknowledge alert');
    },
  });

  // Resolve mutation
  const resolveMutation = useMutation({
    mutationFn: (resolution?: string) => alertService.resolveAlert(id!, resolution),
    onSuccess: () => {
      toast.success('Alert resolved');
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alert', id] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resolve alert');
    },
  });

  const handleAcknowledge = () => {
    const notes = window.prompt('Enter acknowledgment notes (optional):');
    acknowledgeMutation.mutate(notes || undefined);
  };

  const handleResolve = () => {
    const resolution = window.prompt('Enter resolution notes:');
    if (resolution) {
      resolveMutation.mutate(resolution);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading alert details...</span>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Alert not found</p>
        <button
          onClick={() => navigate('/alerts')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/alerts')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{alert.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Alert ID: {alert.id.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {alert.status === 'new' && (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledgeMutation.isPending}
              className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Acknowledge
            </button>
          )}
          {alert.status !== 'resolved' && (
            <button
              onClick={handleResolve}
              disabled={resolveMutation.isPending}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <XCircleIcon className="h-5 w-5 mr-2" />
              Resolve
            </button>
          )}
          <button
            onClick={() => navigate(`/alerts/${alert.id}/forward`)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PaperAirplaneIcon className="h-5 w-5 mr-2" />
            Forward
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alert Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alert Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium text-gray-900 mt-1">{alert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {alert.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Severity</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(
                      alert.severity
                    )}`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      alert.status
                    )}`}
                  >
                    {alert.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="font-medium text-gray-900">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {(alert.bus_number || alert.route_name || alert.driver_name) && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Related To</h3>
                  <div className="space-y-2">
                    {alert.bus_number && (
                      <div className="flex items-center space-x-2">
                        <TruckIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">Bus: {alert.bus_number}</span>
                      </div>
                    )}
                    {alert.route_name && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">Route: {alert.route_name}</span>
                      </div>
                    )}
                    {alert.driver_name && (
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-700">Driver: {alert.driver_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {alert.acknowledged_at && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-500">Acknowledged At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(alert.acknowledged_at).toLocaleString()}
                      </p>
                      {alert.acknowledged_by && (
                        <p className="text-xs text-gray-500">By: {alert.acknowledged_by}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {alert.resolved_at && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Resolved At</p>
                      <p className="font-medium text-gray-900">
                        {new Date(alert.resolved_at).toLocaleString()}
                      </p>
                      {alert.resolved_by && (
                        <p className="text-xs text-gray-500">By: {alert.resolved_by}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert History</h2>
            <AlertHistory history={history} />
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {alert.status === 'new' && (
                <button
                  onClick={handleAcknowledge}
                  disabled={acknowledgeMutation.isPending}
                  className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Acknowledge Alert
                </button>
              )}
              {alert.status !== 'resolved' && (
                <button
                  onClick={handleResolve}
                  disabled={resolveMutation.isPending}
                  className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <XCircleIcon className="h-5 w-5 mr-2" />
                  Resolve Alert
                </button>
              )}
              <button
                onClick={() => navigate(`/alerts/${alert.id}/forward`)}
                className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                Forward Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

