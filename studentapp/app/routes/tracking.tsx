import { useState, useEffect, useRef } from "react";
import type { Route } from "./+types/tracking";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import busService from "../lib/api/busService";
import authService from "../lib/api/authService";
import toast from "react-hot-toast";
import { TruckIcon, MapPinIcon, SignalIcon, ClockIcon } from "@heroicons/react/24/outline";
import { mapLocations, pakistanMapDefaults, simulatedLocation, type MapLocation } from "../lib/maps/mapData";
import { tileLayerConfig } from "../lib/maps/tileSources";
import type { Bus } from "../lib/api/busService";

// Leaflet assets are vendored in /public for offline/demo use.
export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: "/vendor/leaflet/leaflet.css" },
];

type LeafletMap = any;

declare global {
  interface Window {
    L?: any;
  }
}

const loadLeaflet = () =>
  new Promise<any>((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Leaflet requires a browser environment."));
      return;
    }

    if (window.L) {
      resolve(window.L);
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>("script[data-leaflet]");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.L));
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Leaflet.")));
      return;
    }

    const script = document.createElement("script");
    script.src = "/vendor/leaflet/leaflet.js";
    script.async = true;
    script.defer = true;
    script.dataset.leaflet = "true";
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Failed to load Leaflet."));
    document.body.appendChild(script);
  });

interface BusLocationInfo {
  lat: number;
  lng: number;
  isSimulated: boolean;
  city?: string;
  province?: string;
  sourceLabel: string;
  timestamp?: string;
}

type BusWithModel = Bus & { model?: string };

const buildPopupHtml = (location: MapLocation) => `
  <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
      ${location.name}
    </div>
    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
      ${location.city}, ${location.province}
    </div>
    <div style="font-size: 12px; color: #374151;">
      <div><span style="font-weight: 600;">Type:</span> ${location.category}</div>
      <div><span style="font-weight: 600;">Details:</span> ${location.details}</div>
    </div>
  </div>
`;

const buildBusPopupHtml = (bus: BusWithModel, location: BusLocationInfo) => {
  const name = bus.license_plate || bus.bus_number || `Bus #${bus.id ?? "N/A"}`;
  const status = bus.status || "Active";
  const capacity = bus.capacity ? `${bus.capacity} seats` : "N/A";
  const locationLabel = location.isSimulated
    ? `Near ${location.city ?? "city"}, ${location.province ?? "Pakistan"}`
    : `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  const timestamp = location.timestamp
    ? new Date(location.timestamp).toLocaleTimeString()
    : "Just now";

  return `
    <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
        ${name}
      </div>
      <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
        Status: ${status}
      </div>
      <div style="font-size: 12px; color: #374151;">
        <div><span style="font-weight: 600;">Capacity:</span> ${capacity}</div>
        <div><span style="font-weight: 600;">Location:</span> ${locationLabel}</div>
        <div><span style="font-weight: 600;">Source:</span> ${location.sourceLabel}</div>
        <div><span style="font-weight: 600;">Updated:</span> ${timestamp}</div>
      </div>
    </div>
  `;
};

const currentLocationPopup = `
  <div style="min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
    <div style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 4px;">
      ${simulatedLocation.name}
    </div>
    <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
      ${simulatedLocation.city}, ${simulatedLocation.province}
    </div>
    <div style="font-size: 12px; color: #374151;">
      <div><span style="font-weight: 600;">Mode:</span> Demo</div>
      <div><span style="font-weight: 600;">Source:</span> Fixed coordinates</div>
    </div>
  </div>
`;

export default function Tracking() {
  const [user, setUser] = useState<any>(null);
  const [buses, setBuses] = useState<BusWithModel[]>([]);
  const [loading, setLoading] = useState(true);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);
  const busLayerRef = useRef<any | null>(null);
  const busMarkersRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current || typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        if (!isMounted || !mapContainerRef.current) {
          return;
        }

        const map = L.map(mapContainerRef.current, {
          center: pakistanMapDefaults.center,
          zoom: pakistanMapDefaults.zoom,
          zoomControl: true,
          scrollWheelZoom: true,
          dragging: true,
          zoomSnap: 0.5,
          fadeAnimation: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          inertia: true,
        });

        mapRef.current = map;
        L.tileLayer(tileLayerConfig.url, tileLayerConfig.options).addTo(map);

        const layerGroup = L.layerGroup().addTo(map);
        const busLayer = L.layerGroup().addTo(map);
        busLayerRef.current = busLayer;

        const layers: any[] = [];

        mapLocations.forEach((location) => {
          const isUniversity = location.category === "University";
          const marker = L.circleMarker([location.lat, location.lng], {
            radius: isUniversity ? 7 : 6,
            color: isUniversity ? "#1d4ed8" : "#0f766e",
            fillColor: isUniversity ? "#3b82f6" : "#14b8a6",
            fillOpacity: 0.9,
            weight: 2,
          });

          marker.bindPopup(buildPopupHtml(location), { closeButton: true, offset: [0, -8] });
          marker.addTo(layerGroup);
          layers.push(marker);
        });

        const currentMarker = L.circleMarker([simulatedLocation.lat, simulatedLocation.lng], {
          radius: 8,
          color: "#059669",
          fillColor: "#34d399",
          fillOpacity: 0.95,
          weight: 2,
        }).addTo(layerGroup);

        const accuracyCircle = L.circle([simulatedLocation.lat, simulatedLocation.lng], {
          radius: 1200,
          color: "#10b981",
          fillColor: "#34d399",
          fillOpacity: 0.15,
          weight: 1,
        }).addTo(layerGroup);

        currentMarker.bindPopup(currentLocationPopup, { closeButton: true, offset: [0, -8] });
        layers.push(currentMarker, accuracyCircle);

        if (layers.length > 0) {
          const bounds = L.featureGroup(layers).getBounds().pad(0.2);
          map.fitBounds(bounds, { animate: true });
        }

        map.zoomControl.setPosition("bottomright");
        setTimeout(() => map.invalidateSize(), 0);
      } catch (error) {
        toast.error("Unable to load map assets for the demo.");
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [loading]);

  const getBusLocationInfo = (bus: BusWithModel, index: number): BusLocationInfo | null => {
    const liveLocation = bus.current_location;
    if (liveLocation?.latitude && liveLocation?.longitude) {
      return {
        lat: liveLocation.latitude,
        lng: liveLocation.longitude,
        isSimulated: false,
        sourceLabel: "Live (API)",
        timestamp: liveLocation.timestamp,
      };
    }

    if (mapLocations.length === 0) {
      return null;
    }

    const base = mapLocations[(bus.id ?? index) % mapLocations.length];
    const seed = (bus.id ?? index + 1) * 97;
    const offsetLat = ((seed % 7) - 3) * 0.018;
    const offsetLng = ((seed % 11) - 5) * 0.02;

    return {
      lat: base.lat + offsetLat,
      lng: base.lng + offsetLng,
      isSimulated: true,
      city: base.city,
      province: base.province,
      sourceLabel: "Simulated (demo)",
    };
  };

  useEffect(() => {
    if (!mapRef.current || !busLayerRef.current || typeof window === "undefined") {
      return;
    }

    let isMounted = true;

    const updateBusMarkers = async () => {
      const L = await loadLeaflet();
      if (!isMounted || !busLayerRef.current) {
        return;
      }

      busLayerRef.current.clearLayers();
      busMarkersRef.current.clear();

      buses.forEach((bus, index) => {
        const location = getBusLocationInfo(bus, index);
        if (!location) {
          return;
        }

        const marker = L.circleMarker([location.lat, location.lng], {
          radius: 7,
          color: location.isSimulated ? "#b45309" : "#7c3aed",
          fillColor: location.isSimulated ? "#f59e0b" : "#a855f7",
          fillOpacity: 0.95,
          weight: 2,
        });

        marker.bindPopup(buildBusPopupHtml(bus, location), { closeButton: true, offset: [0, -8] });
        marker.addTo(busLayerRef.current);
        busMarkersRef.current.set(bus.id ?? index, marker);
      });
    };

    updateBusMarkers();

    return () => {
      isMounted = false;
    };
  }, [buses]);

  const focusBusOnMap = (bus: BusWithModel, index: number) => {
    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (!mapRef.current) {
      return;
    }

    const marker = busMarkersRef.current.get(bus.id ?? index);
    if (!marker) {
      mapRef.current.flyTo(pakistanMapDefaults.center, pakistanMapDefaults.zoom, { duration: 0.8 });
      return;
    }

    const target = marker.getLatLng();
    mapRef.current.flyTo(target, bus.current_location ? 12 : 9, { duration: 0.8 });
    marker.openPopup();
  };

  const loadData = async () => {
    try {
      const [userData, busesData] = await Promise.all([
        authService.me(),
        busService.getBuses(),
      ]);
      setUser(userData);
      setBuses(busesData);
    } catch (error) {
      toast.error("Failed to load bus locations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <LoadingSpinner size="lg" text="Loading tracking information..." fullScreen />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
              <MapPinIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Track Bus
              </h1>
              <p className="text-lg text-gray-600">Real-time bus location tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <SignalIcon className="w-5 h-5 text-green-600 animate-pulse" />
            <span className="text-sm text-gray-600">Live updates every 10 seconds</span>
          </div>
        </div>

        {/* Map View */}
        <div ref={mapSectionRef}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900">Live Map View</h2>
          </CardHeader>
          <CardBody className="p-4">
            <div className="relative">
              <div
                ref={mapContainerRef}
                className="h-[420px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner bg-slate-100"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 shadow-md pointer-events-none">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Legend</div>
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-teal-500 border-2 border-teal-700"></span>
                  <span>City</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500 border-2 border-blue-700"></span>
                  <span>University</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-emerald-600"></span>
                  <span>Current Location</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-400 border-2 border-purple-700"></span>
                  <span>Bus (live/simulated)</span>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl px-3 py-2 text-[11px] text-gray-600 shadow-sm pointer-events-none">
                <div className="text-[10px] uppercase tracking-wider text-gray-500">Tiles</div>
                <div>OpenStreetMap (switchable to offline)</div>
              </div>
            </div>
          </CardBody>
        </Card>
        </div>

        {/* Active Buses List */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Active Buses</h2>
              <p className="text-sm text-gray-600 mt-1">{buses.length} bus(es) currently in service</p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">Live</span>
            </div>
          </CardHeader>
          <CardBody>
            {buses.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
                  <TruckIcon className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No active buses at the moment</p>
                <p className="text-gray-500 text-sm">Check back later for live tracking</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buses.map((bus, index) => (
                  <Card 
                    key={bus.id}
                    hover
                    gradient
                  >
                    <CardBody>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg">
                            <TruckIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{bus.license_plate}</h3>
                            <p className="text-sm text-gray-600">
                              {bus.model}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 rounded-full">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-700 font-bold">Active</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Capacity</p>
                          <p className="text-lg font-bold text-gray-900">{bus.capacity}</p>
                          <p className="text-xs text-gray-500">seats</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <p className="text-lg font-bold text-green-600">Online</p>
                          <p className="text-xs text-gray-500">tracking</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center space-x-2"
                        onClick={(event) => {
                          event.preventDefault();
                          focusBusOnMap(bus, index);
                        }}
                      >
                        <MapPinIcon className="w-4 h-4" />
                        <span>View on Map</span>
                      </button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Last Updated Info */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <ClockIcon className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
