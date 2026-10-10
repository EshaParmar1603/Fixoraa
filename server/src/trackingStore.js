// In-Memory Live Tracking Store & Telemetry Simulator for Fixora Technicians

// Default Bengaluru Route Waypoints for realistic simulation
const DEFAULT_ROUTE_WAYPOINTS = [
  { lat: 12.9784, lng: 77.5925, landmark: 'Fixora Central Hub, MG Road' },
  { lat: 12.9742, lng: 77.6033, landmark: 'Trinity Circle Junction' },
  { lat: 12.9689, lng: 77.6167, landmark: 'Command Hospital Crossing' },
  { lat: 12.9615, lng: 77.6321, landmark: 'Domlur Flyover Ramp' },
  { lat: 12.9550, lng: 77.6410, landmark: 'Indiranagar 100ft Road' },
  { lat: 12.9482, lng: 77.6495, landmark: 'Customer Residential Gate, Indiranagar' }
];

// Active tracking sessions by bookingId
const trackingSessions = new Map();

function getOrCreateTracking(bookingId, customProvider) {
  if (trackingSessions.has(bookingId)) {
    return trackingSessions.get(bookingId);
  }

  const defaultTech = {
    id: 'tech-gps-1',
    name: 'Rajesh Sharma',
    phone: '+91 98450 77122',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
    rating: 4.92,
    completedJobs: 340,
    vehicleModel: 'Hero Electric Optima CX',
    vehicleNumber: 'KA 03 HL 9824',
    batteryPercentage: 88,
    isGpsLive: true
  };

  const session = {
    bookingId,
    technician: customProvider ? { ...defaultTech, ...customProvider } : defaultTech,
    status: 'ON_THE_WAY', // 'DISPATCHED' | 'ON_THE_WAY' | 'NEAR_DOORSTEP' | 'ARRIVED'
    stepIndex: 1, // current waypoint index
    currentProgressPercent: 35, // 0 to 100%
    currentLat: DEFAULT_ROUTE_WAYPOINTS[1].lat,
    currentLng: DEFAULT_ROUTE_WAYPOINTS[1].lng,
    speedKmH: 32,
    heading: 124,
    distanceRemainingKm: 2.3,
    etaMinutes: 8,
    routeWaypoints: DEFAULT_ROUTE_WAYPOINTS,
    customerAddress: 'Apartment 402, Prestige Palms, Indiranagar, Bengaluru',
    lastUpdatedAt: new Date().toISOString()
  };

  trackingSessions.set(bookingId, session);
  return session;
}

function updateTrackingLocation(bookingId, updateData) {
  const session = getOrCreateTracking(bookingId);
  Object.assign(session, updateData, { lastUpdatedAt: new Date().toISOString() });
  trackingSessions.set(bookingId, session);
  return session;
}

function advanceSimulationStep(bookingId) {
  const session = getOrCreateTracking(bookingId);
  const totalSteps = session.routeWaypoints.length - 1;

  if (session.stepIndex < totalSteps) {
    session.stepIndex += 1;
    const currentWp = session.routeWaypoints[session.stepIndex];
    session.currentLat = currentWp.lat;
    session.currentLng = currentWp.lng;
    session.currentProgressPercent = Math.round((session.stepIndex / totalSteps) * 100);

    const remainingSteps = totalSteps - session.stepIndex;
    session.distanceRemainingKm = Math.max(0, Math.round((remainingSteps * 0.7) * 10) / 10);
    session.etaMinutes = Math.max(1, remainingSteps * 3);
    session.speedKmH = Math.floor(25 + Math.random() * 15);

    if (session.stepIndex === totalSteps) {
      session.status = 'ARRIVED';
      session.distanceRemainingKm = 0;
      session.etaMinutes = 0;
      session.speedKmH = 0;
    } else if (remainingSteps === 1) {
      session.status = 'NEAR_DOORSTEP';
    } else {
      session.status = 'ON_THE_WAY';
    }
  }

  session.lastUpdatedAt = new Date().toISOString();
  return session;
}

module.exports = {
  getOrCreateTracking,
  updateTrackingLocation,
  advanceSimulationStep,
  DEFAULT_ROUTE_WAYPOINTS
};
