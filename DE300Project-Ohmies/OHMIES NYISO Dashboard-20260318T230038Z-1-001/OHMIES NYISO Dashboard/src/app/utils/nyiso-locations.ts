// NYISO utility zone coordinates (approximate center of each zone)
export const NYISO_ZONES = {
  CAPITL: {
    name: "Capital",
    lat: 42.6526,
    lng: -73.7562,
    color: "#3b82f6",
  },
  HUD: {
    name: "Hudson Valley",
    lat: 41.7,
    lng: -73.92,
    color: "#10b981",
  },
  MILLWD: {
    name: "Millwood",
    lat: 41.2,
    lng: -73.79,
    color: "#f59e0b",
  },
  CENTRL: {
    name: "Central",
    lat: 43.0481,
    lng: -76.1474,
    color: "#8b5cf6",
  },
  WEST: {
    name: "West",
    lat: 42.8864,
    lng: -78.8784,
    color: "#ef4444",
  },
  MHK: {
    name: "Mohawk Valley",
    lat: 43.0009,
    lng: -75.0,
    color: "#06b6d4",
  },
  NORTH: {
    name: "North",
    lat: 44.6995,
    lng: -74.9742,
    color: "#ec4899",
  },
  GENESE: {
    name: "Genesee",
    lat: 43.0,
    lng: -77.6,
    color: "#14b8a6",
  },
  NYC: {
    name: "New York City",
    lat: 40.7128,
    lng: -74.006,
    color: "#f97316",
  },
  DUNWOD: {
    name: "Dunwoodie",
    lat: 40.9176,
    lng: -73.8629,
    color: "#a855f7",
  },
  LONGIL: {
    name: "Long Island",
    lat: 40.7891,
    lng: -73.135,
    color: "#84cc16",
  },
} as const;

export type UtilityZone = keyof typeof NYISO_ZONES;

export const UTILITY_LIST = Object.keys(
  NYISO_ZONES,
) as UtilityZone[];

export function getUtilityInfo(utility: string) {
  return NYISO_ZONES[utility as UtilityZone] || null;
}