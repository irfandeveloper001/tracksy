import rawLocations from "../../data/pakistan-map-locations.json";

export type MapLocationCategory = "City" | "University";

export interface MapLocation {
  id: string;
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  category: MapLocationCategory;
  details: string;
}

interface RawLocation {
  name: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  details?: string;
}

const toId = (prefix: string, name: string) =>
  `${prefix}${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;

// Curated subset extracted from backend/database/data/locations for an offline-friendly demo.
const cities = (rawLocations.cities as RawLocation[]).map((city) => ({
  id: toId("city-", city.name),
  name: city.name,
  city: city.city,
  province: city.province,
  lat: city.lat,
  lng: city.lng,
  category: "City" as const,
  details: city.details ?? `Major city in ${city.province}`,
}));

const universities = (rawLocations.universities as RawLocation[]).map((university) => ({
  id: toId("uni-", university.name),
  name: university.name,
  city: university.city,
  province: university.province,
  lat: university.lat,
  lng: university.lng,
  category: "University" as const,
  details: `Higher education institution in ${university.province}`,
}));

export const mapLocations: MapLocation[] = [...cities, ...universities];

export const simulatedLocation = {
  name: "Current Location (Simulated)",
  city: "Islamabad",
  province: "Islamabad Capital Territory",
  lat: 33.72148,
  lng: 73.04329,
};

export const pakistanMapDefaults = {
  center: [30.3753, 69.3451] as [number, number],
  zoom: 5,
};
