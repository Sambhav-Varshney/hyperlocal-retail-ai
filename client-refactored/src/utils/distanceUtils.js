// Reusable Haversine distance utility for hyperlocal retail calculations

export const DEFAULT_MARKET_LOCATION = {
  lat: 28.6139,
  lon: 77.2090,
};

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const nLat1 = Number(lat1);
  const nLon1 = Number(lon1);
  const nLat2 = Number(lat2);
  const nLon2 = Number(lon2);

  if ([nLat1, nLon1, nLat2, nLon2].some((v) => Number.isNaN(v))) return null;

  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth's mean radius in km

  const dLat = toRad(nLat2 - nLat1);
  const dLon = toRad(nLon2 - nLon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(nLat1)) * Math.cos(toRad(nLat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function formatDistance(distKm) {
  if (distKm === undefined || distKm === null || Number.isNaN(Number(distKm))) return null;
  const num = Number(distKm);
  return `${num.toFixed(1)} km`;
}
