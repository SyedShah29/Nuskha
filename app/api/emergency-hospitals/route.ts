/**
 * Emergency Hospital Finder API Route
 * Uses FREE OpenStreetMap Overpass API — no key required
 * Returns nearest hospitals within a given radius
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, radiusKm = 10 } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const radiusMeters = radiusKm * 1000;

    // Overpass API query for hospitals, clinics, emergency facilities
    const overpassQuery = `
      [out:json][timeout:10];
      (
        node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
        node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        node["amenity"="emergency"](around:${radiusMeters},${lat},${lng});
        way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
      );
      out center 10;
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error('Overpass API request failed');
    }

    const data = await response.json();

    // Parse results and calculate distances
    const hospitals = data.elements
      .map((el: any) => {
        const elLat = el.lat || el.center?.lat;
        const elLng = el.lon || el.center?.lon;

        if (!elLat || !elLng) return null;

        const distanceKm = haversineDistance(lat, lng, elLat, elLng);

        return {
          id: el.id,
          name: el.tags?.name || el.tags?.['name:en'] || 'Hospital',
          type: el.tags?.amenity || 'hospital',
          lat: elLat,
          lng: elLng,
          distanceKm: Math.round(distanceKm * 10) / 10,
          phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
          address: [
            el.tags?.['addr:street'],
            el.tags?.['addr:city'],
          ]
            .filter(Boolean)
            .join(', ') || null,
          emergency: el.tags?.emergency === 'yes',
          googleMapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLng}`,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
      .slice(0, 5); // Return top 5 nearest

    // If no hospitals found via API, return well-known Pakistan emergency contacts
    if (hospitals.length === 0) {
      return NextResponse.json({
        success: true,
        hospitals: [],
        emergencyContacts: getPakistanEmergencyContacts(),
        message: 'No hospitals found in your area via map. Use emergency numbers below.',
      });
    }

    return NextResponse.json({
      success: true,
      hospitals,
      emergencyContacts: getPakistanEmergencyContacts(),
    });
  } catch (error) {
    console.error('Emergency hospitals API error:', error);
    // Always return emergency contacts even if API fails
    return NextResponse.json({
      success: true,
      hospitals: [],
      emergencyContacts: getPakistanEmergencyContacts(),
      message: 'Location lookup unavailable. Use emergency numbers below.',
    });
  }
}

/**
 * Haversine formula — distance in km between two lat/lng points
 */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getPakistanEmergencyContacts() {
  return [
    { name: 'Rescue (Police & Emergency)', number: '1122', icon: '🚔' },
    { name: 'Edhi Foundation Ambulance', number: '115', icon: '🚑' },
    { name: 'Aman Foundation (Karachi)', number: '115', icon: '🏥' },
    { name: 'Chhipa Welfare (Karachi)', number: '1020', icon: '🚑' },
    { name: 'Rescue Fire Brigade', number: '16', icon: '🚒' },
    { name: 'Pakistan Emergency Hotline', number: '115', icon: '📞' },
  ];
}
