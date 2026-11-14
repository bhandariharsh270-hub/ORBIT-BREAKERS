/**
 * Space Mission Design Game - Mission Scenarios
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.SCENARIOS = {
  'earth-climate': {
    id: 'earth-climate',
    name: 'Earth Climate Sentinel',
    subtitle: 'Polar Ice & Sea Level Monitoring',
    targetBody: 'Earth',
    difficulty: 'Beginner',
    difficultyBadge: 'badge-beginner',
    summary: 'Design a Low Earth Orbit (LEO) Sun-Synchronous observatory to monitor global ice sheets, sea levels, and vegetation health. High data volumes and repeated eclipse cycles test your power and storage buffers.',
    budget: 180, // Millions USD
    minScienceScore: 1200,
    targetDataVolumeGb: 10000,
    nominalDurationDays: 30, // simulated days (compressed to orbital simulation)
    orbitsToSimulate: 24, // simulated orbits
    primaryGoal: 'High-Resolution Cryosphere & Sea Surface Topography',
    secondaryGoals: [
      'Atmospheric Aerosol & Cloud Fraction Profiling',
      'Global Vegetation Normalized Difference (NDVI) Mapping'
    ],
    recommendedOrbit: 'leo-sso',
    allowedOrbits: ['leo-400', 'leo-sso', 'meo-gps', 'geo'],
    environment: {
      solarConstant: 1361, // W/m^2 at 1 AU
      radiationLevel: 'Low',
      radiationFactor: 1.0,
      eclipseFraction: 0.36, // ~35 minutes in shadow per 98 min orbit
      lightDelaySec: 0.05,
      orbitalPeriodMin: 98
    },
    educationalFocus: 'Balancing battery depth-of-discharge during frequent orbital eclipses with high instrument data generation rates.'
  },

  'artemis-lunar': {
    id: 'artemis-lunar',
    name: 'Artemis Lunar Polar Prospector',
    subtitle: 'Water-Ice Reconnaissance at the Lunar South Pole',
    targetBody: 'Moon',
    difficulty: 'Intermediate',
    difficultyBadge: 'badge-intermediate',
    summary: 'Survey permanently shadowed craters at the lunar south pole for volatile water ice deposits ahead of crewed Artemis surface missions. Long communication blackouts on the lunar far side require dedicated telemetry management.',
    budget: 340,
    minScienceScore: 1800,
    targetDataVolumeGb: 6000,
    nominalDurationDays: 45,
    orbitsToSimulate: 24,
    primaryGoal: 'Neutron & Radar Mapping of South Pole Volatile Water Deposits',
    secondaryGoals: [
      'Permanently Shadowed Region (PSR) Laser Altimetry',
      'Surface Geochemical & Mineral Abundance Mapping'
    ],
    recommendedOrbit: 'llo-polar',
    allowedOrbits: ['llo-polar', 'llo-equatorial', 'halo-nrho'],
    environment: {
      solarConstant: 1361,
      radiationLevel: 'Moderate',
      radiationFactor: 1.4,
      eclipseFraction: 0.45, // Lunar occultation / far side
      lightDelaySec: 1.3,
      orbitalPeriodMin: 118
    },
    educationalFocus: 'Managing far-side communication blackouts with onboard data storage and balancing delta-v for lunar capture.'
  },

  'mars-scout': {
    id: 'mars-scout',
    name: 'Mars Atmospheric & Surface Scout',
    subtitle: 'Orbital Biosignature & Subsurface Stratigraphy',
    targetBody: 'Mars',
    difficulty: 'Advanced',
    difficultyBadge: 'badge-advanced',
    summary: 'Travel across deep space to place an exploration satellite around the Red Planet. Solar flux drops to 43% of Earth, round-trip communication takes up to 20 minutes, and dust storms present harsh operational trade-offs.',
    budget: 680,
    minScienceScore: 2600,
    targetDataVolumeGb: 4000,
    nominalDurationDays: 90,
    orbitsToSimulate: 24,
    primaryGoal: 'Trace Gas & Methane Detection in Mars Atmosphere',
    secondaryGoals: [
      'Subsurface Ice Sounding with Radar Waves',
      'Global Dust Storm Monitoring & Surface Imaging'
    ],
    recommendedOrbit: 'lmo-polar',
    allowedOrbits: ['lmo-polar', 'lmo-equatorial', 'areostationary'],
    environment: {
      solarConstant: 589, // W/m^2 at 1.52 AU (1/r^2 law!)
      radiationLevel: 'High',
      radiationFactor: 2.2,
      eclipseFraction: 0.40,
      lightDelaySec: 720, // 12 minutes one way
      orbitalPeriodMin: 112
    },
    educationalFocus: 'Inverse-square law of solar power (1/r²), high delta-v propulsion requirements, and autonomous anomaly management.'
  },

  'europa-explorer': {
    id: 'europa-explorer',
    name: 'Europa Deep Ocean Prober',
    subtitle: 'Jupiter System Astrobiology & Subsurface Ocean Sounding',
    targetBody: 'Europa',
    difficulty: 'Expert',
    difficultyBadge: 'badge-expert',
    summary: 'Brave Jupiter’s ferocious ionizing radiation belts to probe Europa’s icy crust and investigate conditions for subsurface life. Solar power is virtually non-existent; high-gain DSN antennas and RTG nuclear power are required.',
    budget: 1350,
    minScienceScore: 3800,
    targetDataVolumeGb: 2800,
    nominalDurationDays: 120,
    orbitsToSimulate: 20,
    primaryGoal: 'Ice Shell Thickness Sounding & Ocean-Surface Plume Detection',
    secondaryGoals: [
      'Biosignature Precursor Detection (Organics & Salts)',
      'Jovian Magnetosphere & Plasma Particle Characterization'
    ],
    recommendedOrbit: 'jovian-europa-res',
    allowedOrbits: ['jovian-europa-res', 'europa-orbit'],
    environment: {
      solarConstant: 50.3, // W/m^2 at 5.2 AU (~3.7% of Earth!)
      radiationLevel: 'Extreme',
      radiationFactor: 6.5,
      eclipseFraction: 0.25,
      lightDelaySec: 2700, // 45 minutes one way
      orbitalPeriodMin: 210
    },
    educationalFocus: 'Radioisotope Thermoelectric Generators (RTG) vs gigantic solar arrays, extreme radiation shielding, and Deep Space Network link budgets.'
  },

  'sandbox': {
    id: 'sandbox',
    name: 'Architect Free Sandbox',
    subtitle: 'Unrestricted Experimental Laboratory',
    targetBody: 'Earth',
    difficulty: 'Sandbox',
    difficultyBadge: 'badge-sandbox',
    summary: 'Free engineering sandbox with unlimited budget and arbitrary orbital destinations. Test hypothetical megasatellites, push ion engines to their limits, or engineer the ultimate multi-spectral flagship.',
    budget: 9999,
    minScienceScore: 0,
    targetDataVolumeGb: 50000,
    nominalDurationDays: 30,
    orbitsToSimulate: 24,
    primaryGoal: 'Open Engineering Exploration',
    secondaryGoals: ['Experiment with any payload combination', 'Stress-test power and mass constraints'],
    recommendedOrbit: 'leo-sso',
    allowedOrbits: ['leo-400', 'leo-sso', 'meo-gps', 'geo', 'llo-polar', 'lmo-polar', 'jovian-europa-res'],
    environment: {
      solarConstant: 1361,
      radiationLevel: 'Configurable',
      radiationFactor: 1.0,
      eclipseFraction: 0.35,
      lightDelaySec: 0.5,
      orbitalPeriodMin: 95
    },
    educationalFocus: 'Freedom to test extreme subsystem combinations without penalties.'
  }
};
