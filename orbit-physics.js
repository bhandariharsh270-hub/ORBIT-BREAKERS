/**
 * Space Mission Design Game - Orbit Physics & Astrodynamics Engine
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.OrbitPhysics = {
  // Planetary Gravitational Parameters (μ = G*M in km^3 / s^2) and radii (km)
  BODIES: {
    'Earth': {
      mu: 398600.4418,
      radiusKm: 6371.0,
      distanceFromSunAU: 1.0,
      color: '#2a75d3',
      atmosphereHeightKm: 100,
      rotationPeriodHours: 24.0
    },
    'Moon': {
      mu: 4902.8,
      radiusKm: 1737.4,
      distanceFromSunAU: 1.0,
      color: '#a0aab2',
      atmosphereHeightKm: 0,
      rotationPeriodHours: 708.7
    },
    'Mars': {
      mu: 42828.37,
      radiusKm: 3389.5,
      distanceFromSunAU: 1.524,
      color: '#d65b32',
      atmosphereHeightKm: 120,
      rotationPeriodHours: 24.6
    },
    'Europa': {
      mu: 3202.7,
      radiusKm: 1560.8,
      distanceFromSunAU: 5.204, // Jovian distance
      color: '#d8c29d',
      atmosphereHeightKm: 0,
      rotationPeriodHours: 85.2
    }
  },

  /**
   * Calculates the orbital velocity for a circular orbit
   * v = sqrt(mu / r) in km/s
   */
  getCircularOrbitalVelocity: function(bodyName, altitudeKm) {
    const body = this.BODIES[bodyName] || this.BODIES['Earth'];
    const r = body.radiusKm + altitudeKm;
    return Math.sqrt(body.mu / r); // km/s
  },

  /**
   * Calculates the orbital period in minutes
   * T = 2 * pi * sqrt(a^3 / mu)
   */
  getOrbitalPeriodMinutes: function(bodyName, altitudeKm) {
    const body = this.BODIES[bodyName] || this.BODIES['Earth'];
    const a = body.radiusKm + altitudeKm;
    const periodSec = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / body.mu);
    return periodSec / 60.0;
  },

  /**
   * Calculates the fraction of orbit spent in planetary shadow (eclipse/umbra)
   * cos(theta / 2) = R / (R + h)
   */
  getEclipseFraction: function(bodyName, altitudeKm) {
    const body = this.BODIES[bodyName] || this.BODIES['Earth'];
    const R = body.radiusKm;
    const r = R + altitudeKm;
    if (r <= R) return 0.5;

    // Half-angle of the eclipse cone
    const halfAngle = Math.asin(Math.min(1.0, R / r));
    // Fraction of 2*pi
    const fraction = (2 * halfAngle) / (2 * Math.PI);
    return Math.max(0.02, Math.min(0.48, fraction));
  },

  /**
   * Calculates solar irradiance (W/m^2) using inverse-square law
   */
  getSolarIrradiance: function(bodyName) {
    const body = this.BODIES[bodyName] || this.BODIES['Earth'];
    const rAU = body.distanceFromSunAU;
    // Base solar constant at 1 AU = 1361 W/m^2
    return 1361.0 / (rAU * rAU);
  },

  /**
   * Calculates instantaneous spacecraft status during an orbit
   * @param {number} orbitalPhase - 0 to 1 representing position in orbit (0 = noon / subsolar)
   * @param {number} eclipseFraction - fraction of orbit in shadow
   * @param {number} groundPassFraction - fraction of orbit with ground contact
   */
  getOrbitStateAtPhase: function(orbitalPhase, eclipseFraction, groundPassFraction) {
    // Normalise phase to 0..1
    const phase = ((orbitalPhase % 1.0) + 1.0) % 1.0;

    // Eclipse occurs around phase 0.5 (anti-solar side)
    const eclipseStart = 0.5 - (eclipseFraction / 2);
    const eclipseEnd = 0.5 + (eclipseFraction / 2);
    const inEclipse = (phase >= eclipseStart && phase <= eclipseEnd);

    // Ground station contact window occurs around sub-stations (e.g. phases 0.1 to 0.25 and 0.75 to 0.85)
    // For simplicity, let contact window be distributed across the daylight pass
    const inContact = (phase <= groundPassFraction);

    return {
      phase: phase,
      trueAnomalyDeg: phase * 360,
      inEclipse: inEclipse,
      inSunlight: !inEclipse,
      inGroundContact: inContact,
      sunlightMultiplier: inEclipse ? 0.0 : 1.0
    };
  }
};
