import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import routeService from '../../lib/api/routeService';

export default function StopsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Fetch all stops
  const { data, isLoading } = useQuery({
    queryKey: ['stops', page],
    queryFn: () => routeService.getAllStops(page, 50),
  });

  const stops = data?.stops || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-200/70 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <MapPinIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Stops Management</h1>
              <p className="text-sm text-slate-500">
                {total} {total === 1 ? 'stop' : 'stops'} in the system
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/routes/new')}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Route
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
        </div>
      ) : stops.length === 0 ? (
        <div className="rounded-3xl bg-white/80 p-10 text-center shadow-sm ring-1 ring-slate-200/70">
          <MapPinIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No stops found</h3>
          <p className="text-sm text-slate-500">Create a route to add stops and assign them.</p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate('/routes/new')}
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Route
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200/70">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stops.map((stop: any) => (
              <div
                key={stop.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{stop.name}</h3>
                    <p className="text-sm text-slate-600">{stop.address}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <MapPinIcon className="h-4 w-4" />
                  </div>
                </div>
                {stop.latitude && stop.longitude && (
                  <p className="mt-3 text-xs font-medium text-slate-500">
                    {Number(stop.latitude).toFixed(4)}, {Number(stop.longitude).toFixed(4)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
