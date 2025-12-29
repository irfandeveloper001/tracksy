const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const TILE_SOURCES = {
  online: {
    // OpenStreetMap tiles are free and require no API keys.
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      attribution: OSM_ATTRIBUTION,
      maxZoom: 19,
      crossOrigin: true,
    },
  },
  offline: {
    // Offline/demo ready: point this to a locally hosted tile folder.
    url: "/tiles/{z}/{x}/{y}.png",
    options: {
      attribution: "Offline tiles (local)",
      maxZoom: 19,
    },
  },
} as const;

export type TileSourceKey = keyof typeof TILE_SOURCES;

// Swap this to "offline" for fully disconnected demos using local tiles.
export const DEFAULT_TILE_SOURCE: TileSourceKey = "online";

export const tileLayerConfig = TILE_SOURCES[DEFAULT_TILE_SOURCE];
