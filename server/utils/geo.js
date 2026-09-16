const axios = require("axios");

// =====================================
// HAVERSINE DISTANCE (in km) between two lat/lng points
// =====================================
function haversineKm(lat1, lng1, lat2, lng2) {
  if (
    [lat1, lng1, lat2, lng2].some(
      (v) => v === null || v === undefined || Number.isNaN(Number(v))
    )
  ) {
    return null;
  }

  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 10) / 10; // one decimal place
}

// =====================================
// GEOCODE AN ADDRESS (best-effort fallback)
// Uses OpenStreetMap's free Nominatim API - no API key required.
// If the network call fails (e.g. offline dev environment) it
// resolves to null so callers can degrade gracefully instead of
// throwing.
// =====================================
async function geocodeAddress(address) {
  if (!address || !address.trim()) return null;

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          "User-Agent": "FeedLink-Platform/1.0",
        },
        timeout: 5000,
      }
    );

    const first = response.data && response.data[0];
    if (!first) return null;

    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
    };
  } catch (error) {
    console.warn("Geocoding fallback failed:", error.message);
    return null;
  }
}

// =====================================
// RESOLVE THE BEST-KNOWN COORDINATES FOR A DONATION
// Priority: donation.pickupLocation -> restaurant.location -> geocode(pickupAddress)
// =====================================
async function resolveDonationLocation(donation, restaurant) {
  if (
    donation?.pickupLocation?.lat != null &&
    donation?.pickupLocation?.lng != null
  ) {
    return { ...donation.pickupLocation, source: "donation" };
  }

  if (restaurant?.location?.lat != null && restaurant?.location?.lng != null) {
    return { ...restaurant.location, source: "restaurant-profile" };
  }

  const geocoded = await geocodeAddress(
    donation?.pickupAddress || restaurant?.address
  );

  if (geocoded) {
    return { ...geocoded, source: "geocoded" };
  }

  return null;
}

module.exports = { haversineKm, geocodeAddress, resolveDonationLocation };
