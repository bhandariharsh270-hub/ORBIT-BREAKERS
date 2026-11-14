/**
 * Space Mission Design Game - Spacecraft Components Catalog
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.COMPONENTS = {
  // 1. SPACECRAFT BUS / STRUCTURES
  buses: {
    'cubesat-12u': {
      id: 'cubesat-12u',
      name: '12U Nano-Bus',
      category: 'Structure',
      dryMass: 18, // kg
      maxPayloadMass: 24, // kg payload capacity
      basePowerConsumption: 12, // W (avionics, flight computer)
      cost: 3.5, // $M
      envelopeVolumeM3: 0.024,
      allowedInstrumentsMax: 2,
      description: 'Ultra-compact standard modular CubeSat bus. Low cost and fast build time, but strictly constrained in mass, volume, and instrument mounting.'
    },
    'smallsat-150': {
      id: 'smallsat-150',
      name: 'ESPA-Class SmallSat',
      category: 'Structure',
      dryMass: 130,
      maxPayloadMass: 180,
      basePowerConsumption: 45,
      cost: 16.0,
      envelopeVolumeM3: 0.65,
      allowedInstrumentsMax: 3,
      description: 'Flexible rideshare-compatible small spacecraft bus. Well balanced for single-focus Earth observation or modest lunar probes.'
    },
    'medium-bus': {
      id: 'medium-bus',
      name: 'Mid-Class Science Platform',
      category: 'Structure',
      dryMass: 420,
      maxPayloadMass: 650,
      basePowerConsumption: 130,
      cost: 45.0,
      envelopeVolumeM3: 2.8,
      allowedInstrumentsMax: 5,
      description: 'Sturdy planetary exploration platform with ample mounting space, redundant avionics, and high structural safety margins.'
    },
    'flagship-bus': {
      id: 'flagship-bus',
      name: 'Flagship Deep Space Bus',
      category: 'Structure',
      dryMass: 1100,
      maxPayloadMass: 1800,
      basePowerConsumption: 320,
      cost: 110.0,
      envelopeVolumeM3: 7.5,
      allowedInstrumentsMax: 7,
      description: 'Heavy exploration bus engineered for multi-instrument flagship science in harsh environments like Mars or the Jovian radiation belts.'
    }
  },

  // 2. POWER GENERATION
  powerGeneration: {
    'solar-body-small': {
      id: 'solar-body-small',
      name: 'Body-Mounted Silicon Cells',
      tech: 'Silicon 19%',
      areaM2: 0.9,
      efficiency: 0.19,
      mass: 5.5,
      cost: 1.2,
      isNuclear: false,
      description: 'Simple cells affixed to bus skin. Inexpensive and robust with no deployment risk, but low power output and dependent on orientation.'
    },
    'solar-deploy-gaas': {
      id: 'solar-deploy-gaas',
      name: 'Deployable Dual-Wing GaAs Arrays',
      tech: 'Triple-Junction GaAs 30%',
      areaM2: 3.8,
      efficiency: 0.30,
      mass: 24,
      cost: 6.8,
      isNuclear: false,
      description: 'Standard deployable solar panels with high-efficiency triple-junction cells. Excellent for Earth and Moon orbits.'
    },
    'solar-articulated-large': {
      id: 'solar-articulated-large',
      name: 'Articulated Tracking Solar Wings',
      tech: 'Multi-Junction GaAs 32% + Sun Trackers',
      areaM2: 11.5,
      efficiency: 0.32,
      mass: 68,
      cost: 19.5,
      isNuclear: false,
      description: 'Motorized dual solar wings that actively rotate to face the Sun. High continuous output, suitable for Mars orbits.'
    },
    'solar-ultraflex-deepspace': {
      id: 'solar-ultraflex-deepspace',
      name: 'UltraFlex Circular Solar Array (26m²)',
      tech: 'Ultra-Light Multi-Junction 33%',
      areaM2: 26.0,
      efficiency: 0.33,
      mass: 135,
      cost: 39.0,
      isNuclear: false,
      description: 'Massive circular folding arrays similar to NASA Lucy and Orion. Captures faint sunlight out to Jupiter, but large mass and moment of inertia.'
    },
    'rtg-plutonium': {
      id: 'rtg-plutonium',
      name: 'Next-Gen Multi-Mission RTG (MMRTG)',
      tech: 'Radioisotope Thermoelectric (Pu-238)',
      areaM2: 0,
      efficiency: 1.0,
      fixedPowerWatts: 275, // 275W steady day and night!
      mass: 48,
      cost: 78.0,
      isNuclear: true,
      description: 'Plutonium-238 decay generates steady electricity day and night, immune to eclipses, dust storms, and distance from Sun. Very costly and regulated.'
    }
  },

  // 3. ENERGY STORAGE (BATTERIES)
  batteries: {
    'bat-li-300': {
      id: 'bat-li-300',
      name: 'CubeSat Li-Ion Pack (300 Wh)',
      capacityWh: 300,
      maxDoDRecommended: 0.60, // 60% Depth of discharge for long life
      mass: 3.5,
      cost: 0.9,
      description: 'Lightweight battery pack for small payloads with short eclipse windows.'
    },
    'bat-li-1200': {
      id: 'bat-li-1200',
      name: 'High-Reliability Space Li-Ion (1,400 Wh)',
      capacityWh: 1400,
      maxDoDRecommended: 0.65,
      mass: 14.5,
      cost: 3.8,
      description: 'Balanced workhorse battery with cell balancing and thermal heating jackets for LEO or lunar orbits.'
    },
    'bat-li-4500': {
      id: 'bat-li-4500',
      name: 'Flagship Mission Battery Module (4,500 Wh)',
      capacityWh: 4500,
      maxDoDRecommended: 0.70,
      mass: 42.0,
      cost: 9.5,
      description: 'Substantial energy reserve designed for power-hungry radar instruments and long eclipse periods.'
    },
    'bat-solid-state': {
      id: 'bat-solid-state',
      name: 'Solid-State Lithium Matrix (9,000 Wh)',
      capacityWh: 9000,
      maxDoDRecommended: 0.85,
      mass: 62.0,
      cost: 22.0,
      description: 'Next-generation solid-state chemistry offering extreme energy density and high depth-of-discharge tolerance.'
    }
  },

  // 4. PROPULSION SYSTEMS
  propulsion: {
    'prop-coldgas': {
      id: 'prop-coldgas',
      name: 'Cold Gas Thruster System',
      propType: 'Nitrogen Gas',
      isp: 72, // seconds
      thrustN: 4.5,
      dryMass: 7.0,
      powerRequired: 5, // W
      cost: 1.8,
      description: 'Safest and simplest propulsion with zero contamination risk, but very low specific impulse (Isp = 72s). Suitable only for small orbit trims.'
    },
    'prop-monoprop': {
      id: 'prop-monoprop',
      name: 'Monopropellant Hydrazine System',
      propType: 'Hydrazine (N2H4)',
      isp: 228,
      thrustN: 22,
      dryMass: 19.0,
      powerRequired: 15,
      cost: 6.2,
      description: 'Standard space-proven hydrazine catalysed thruster system (Isp = 228s). Reliable for LEO de-orbiting and orbital plane maintenance.'
    },
    'prop-biprop': {
      id: 'prop-biprop',
      name: 'Dual-Mode Bipropellant System (MMH/NTO)',
      propType: 'Hypergolic Bipropellant',
      isp: 320,
      thrustN: 440,
      dryMass: 42.0,
      powerRequired: 35,
      cost: 16.5,
      description: 'High-thrust hypergolic liquid engine (Isp = 320s). Capable of major orbital insertion burns for lunar or Mars capture maneuvers.'
    },
    'prop-hall-electric': {
      id: 'prop-hall-electric',
      name: 'High-Isp Xenon Hall-Effect Thruster',
      propType: 'Ionized Xenon Gas',
      isp: 3100, // extreme fuel efficiency!
      thrustN: 0.22,
      dryMass: 34.0,
      powerRequired: 750, // Requires huge electrical power!
      cost: 28.0,
      description: 'Incredible specific impulse (Isp = 3100s) uses only a fraction of propellant, but requires massive continuous electrical power and produces micro-thrust.'
    }
  },

  // 5. ATTITUDE DETERMINATION & CONTROL (ADCS)
  adcs: {
    'adcs-basic': {
      id: 'adcs-basic',
      name: 'Coarse Sun Sensors & Magnetorquers',
      pointingAccuracyDeg: 2.5,
      mass: 5.5,
      powerRequired: 10,
      cost: 1.4,
      supportsTargeting: false,
      description: 'Magnetic coils and solar angle detectors. Lightweight but only works near Earth/magnetic bodies and lacks fine telescope pointing.'
    },
    'adcs-wheels': {
      id: 'adcs-wheels',
      name: '3-Axis Reaction Wheels + Horizon Sensor',
      pointingAccuracyDeg: 0.08,
      mass: 16.0,
      powerRequired: 32,
      cost: 5.8,
      supportsTargeting: true,
      description: 'Standard 3-axis stabilized platform with reaction wheels. Delivers steady pointing for high-res cameras and optical spectrometers.'
    },
    'adcs-star-cmg': {
      id: 'adcs-star-cmg',
      name: 'Dual Star Trackers & Control Moment Gyros',
      pointingAccuracyDeg: 0.003, // Arcsecond precision
      mass: 38.0,
      powerRequired: 85,
      cost: 15.0,
      supportsTargeting: true,
      description: 'Ultra-precise celestial orientation system. Mandatory for deep-space laser communications and sub-meter imaging payloads.'
    }
  },

  // 6. COMMUNICATIONS & TELEMETRY
  communications: {
    'comm-sband': {
      id: 'comm-sband',
      name: 'S-Band Transceiver + Low-Gain Patch Antenna',
      band: 'S-Band (2.2 GHz)',
      maxDataRateMbps: 2.5,
      mass: 5.0,
      powerRequired: 22,
      cost: 2.4,
      requiresPrecisionPointing: false,
      deepSpaceCapable: false,
      description: 'Robust wide-angle link for housekeeping telemetry and modest data in LEO. Low power, but easily overwhelmed by high-rate science.'
    },
    'comm-xband': {
      id: 'comm-xband',
      name: 'X-Band Transceiver + 0.9m Reflector Dish',
      band: 'X-Band (8.4 GHz)',
      maxDataRateMbps: 35.0,
      mass: 14.5,
      powerRequired: 65,
      cost: 7.2,
      requiresPrecisionPointing: true,
      deepSpaceCapable: true,
      description: 'NASA standard for lunar and planetary missions. Offers high data throughput when pointed accurately at ground stations.'
    },
    'comm-kaband': {
      id: 'comm-kaband',
      name: 'Ka-Band Deep Space High-Gain Dish (2.2m)',
      band: 'Ka-Band (32 GHz)',
      maxDataRateMbps: 180.0,
      mass: 38.0,
      powerRequired: 160,
      cost: 18.5,
      requiresPrecisionPointing: true,
      deepSpaceCapable: true,
      description: 'High-frequency narrow-beam transceiver providing tremendous downlink bandwidth from Moon, Mars, or Jupiter.'
    },
    'comm-optical-laser': {
      id: 'comm-optical-laser',
      name: 'Deep Space Optical Laser Terminal (DSOC)',
      band: 'Near-IR Laser (1550 nm)',
      maxDataRateMbps: 650.0,
      mass: 32.0,
      powerRequired: 130,
      cost: 36.0,
      requiresPrecisionPointing: true,
      deepSpaceCapable: true,
      description: 'Revolutionary photon-encoded laser transceiver delivering gigabit data rates across the solar system. Demands sub-arcsecond ADCS pointing.'
    }
  },

  // 7. GROUND TRACKING NETWORK
  groundNetworks: {
    'net-near-space': {
      id: 'net-near-space',
      name: 'Near Space Network (NSN - LEO Stations)',
      stations: 'Svalbard, Wallops, McMurdo, White Sands',
      contactWindowMinPerOrbit: 14,
      annualCost: 3.5,
      suitableFor: ['Earth']
    },
    'net-dsn': {
      id: 'net-dsn',
      name: 'NASA Deep Space Network (DSN 34m/70m)',
      stations: 'Goldstone (USA), Madrid (Spain), Canberra (Australia)',
      contactWindowMinPerOrbit: 42,
      annualCost: 14.0,
      suitableFor: ['Moon', 'Mars', 'Europa', 'Earth']
    }
  },

  // 8. THERMAL & RADIATION HARDENING
  thermalShielding: {
    'thermal-standard': {
      id: 'thermal-standard',
      name: 'Passive MLI Blankets & Heaters',
      mass: 8.0,
      powerRequired: 15,
      radiationToleranceRating: 1.0,
      cost: 1.5,
      description: 'Standard aluminized Mylar blankets. Adequate for benign low-radiation orbits around Earth.'
    },
    'thermal-active-radiator': {
      id: 'thermal-active-radiator',
      name: 'Active Heat-Pipe Loop Radiators',
      mass: 26.0,
      powerRequired: 30,
      radiationToleranceRating: 1.8,
      cost: 6.0,
      description: 'Actively transfers waste heat from high-power radar or RTG systems into space. Prevents payload overheating.'
    },
    'shielding-radiation-vault': {
      id: 'shielding-radiation-vault',
      name: 'Tantalum-Titanium Radiation Vault',
      mass: 75.0,
      powerRequired: 0,
      radiationToleranceRating: 6.5,
      cost: 26.0,
      description: 'Heavy physical shielding encasing critical avionics and sensors. Essential for surviving Jupiter’s destructive radiation belts.'
    }
  },

  // 9. SCIENTIFIC INSTRUMENT PAYLOADS
  instruments: {
    'inst-optical-imager': {
      id: 'inst-optical-imager',
      name: 'High-Resolution Multispectral Imager',
      sciencePoints: 360,
      mass: 16.5,
      powerDraw: 38, // W
      dataGenRateMbps: 80,
      cost: 14.5,
      category: 'Remote Sensing',
      preferredTargets: ['Earth', 'Moon', 'Mars'],
      description: 'Captures vivid multi-band visual and near-infrared surface imagery for ice, terrain topography, and vegetation monitoring.'
    },
    'inst-sar-radar': {
      id: 'inst-sar-radar',
      name: 'Synthetic Aperture Radar (L/C-Band SAR)',
      sciencePoints: 580,
      mass: 82.0,
      powerDraw: 480, // High power draw!
      dataGenRateMbps: 240, // High data generation!
      cost: 42.0,
      category: 'Radar Sensing',
      preferredTargets: ['Earth', 'Moon', 'Europa', 'Mars'],
      description: 'Active microwave radar penetrates through clouds, polar darkness, and dry surface dust to generate 3D relief and ice thickness maps.'
    },
    'inst-ir-spectrometer': {
      id: 'inst-ir-spectrometer',
      name: 'Fourier Transform Infrared Spectrometer',
      sciencePoints: 440,
      mass: 22.0,
      powerDraw: 45,
      dataGenRateMbps: 45,
      cost: 21.0,
      category: 'Spectroscopy',
      preferredTargets: ['Earth', 'Mars', 'Europa'],
      description: 'Dissects spectral absorption fingerprints to detect methane gas, carbon dioxide, water vapor, and hydrated surface minerals.'
    },
    'inst-neutron-spectrometer': {
      id: 'inst-neutron-spectrometer',
      name: 'Thermal & Epithermal Neutron Spectrometer',
      sciencePoints: 390,
      mass: 11.5,
      powerDraw: 16,
      dataGenRateMbps: 4,
      cost: 15.0,
      category: 'Nuclear Spectroscopy',
      preferredTargets: ['Moon', 'Mars'],
      description: 'Measures cosmic-ray neutron reflections to directly map hydrogen concentrations and buried water ice in shadowed craters.'
    },
    'inst-ice-sounder': {
      id: 'inst-ice-sounder',
      name: 'Subsurface Ice-Penetrating Radar Sounder',
      sciencePoints: 640,
      mass: 36.0,
      powerDraw: 140,
      dataGenRateMbps: 95,
      cost: 38.0,
      category: 'Subsurface Radar',
      preferredTargets: ['Europa', 'Mars', 'Moon'],
      description: 'Long-wavelength radar waves that penetrate hundreds of meters into polar glaciers or planetary ice shells to reveal ocean interfaces.'
    },
    'inst-plasma-magnetometer': {
      id: 'inst-plasma-magnetometer',
      name: 'Dual Fluxgate Magnetometer & Plasma Waves',
      sciencePoints: 290,
      mass: 7.5,
      powerDraw: 12,
      dataGenRateMbps: 6,
      cost: 8.8,
      category: 'Fields & Particles',
      preferredTargets: ['Jupiter', 'Europa', 'Earth', 'Moon'],
      description: 'Measures induction currents caused by subsurface conducting salty oceans, as well as space weather and radiation belts.'
    },
    'inst-laser-altimeter': {
      id: 'inst-laser-altimeter',
      name: 'Precision LIDAR Topographic Altimeter',
      sciencePoints: 370,
      mass: 19.0,
      powerDraw: 60,
      dataGenRateMbps: 30,
      cost: 18.0,
      category: 'Topography',
      preferredTargets: ['Earth', 'Moon', 'Mars'],
      description: 'Pulsed laser altimetry generates sub-meter vertical elevation profiles for sea level, polar slopes, and impact crater topography.'
    }
  },

  // 10. LAUNCH VEHICLES
  launchVehicles: {
    'lv-electron': {
      id: 'lv-electron',
      name: 'Rocket Lab Electron',
      payloadToLEOKg: 320,
      payloadToMoonKg: 40,
      payloadToMarsKg: 0,
      payloadToJupiterKg: 0,
      fairingDiameterM: 1.2,
      cost: 8.5,
      reliabilityFactor: 0.96,
      description: 'Dedicated small-launcher with 3D-printed Rutherford engines. Highly economical for CubeSats and light SmallSats to LEO.'
    },
    'lv-falcon9-reusable': {
      id: 'lv-falcon9-reusable',
      name: 'SpaceX Falcon 9 (Recoverable Mode)',
      payloadToLEOKg: 14500,
      payloadToMoonKg: 3800,
      payloadToMarsKg: 2100,
      payloadToJupiterKg: 350,
      fairingDiameterM: 5.2,
      cost: 58.0,
      reliabilityFactor: 0.99,
      description: 'The proven workhorse of orbital flight. Low cost per kilogram with high reliability for Earth and lunar missions.'
    },
    'lv-vulcan-centaur': {
      id: 'lv-vulcan-centaur',
      name: 'ULA Vulcan Centaur (High-Energy Centaur V)',
      payloadToLEOKg: 27200,
      payloadToMoonKg: 8500,
      payloadToMarsKg: 5800,
      payloadToJupiterKg: 1900,
      fairingDiameterM: 5.4,
      cost: 110.0,
      reliabilityFactor: 0.98,
      description: 'Heavy-lift rocket with high-energy cryogenic upper stage. Excellent for Mars transfers and direct deep-space insertions.'
    },
    'lv-sls-block1': {
      id: 'lv-sls-block1',
      name: 'NASA Space Launch System (SLS Block 1B)',
      payloadToLEOKg: 95000,
      payloadToMoonKg: 42000,
      payloadToMarsKg: 22000,
      payloadToJupiterKg: 9500,
      fairingDiameterM: 8.4,
      cost: 850.0,
      reliabilityFactor: 0.99,
      description: 'Super heavy-lift exploration rocket. Can inject massive flagship payloads directly onto high-speed interplanetary trajectories to the outer planets.'
    }
  },

  // 11. ORBIT TYPES & DELTA-V REQUIREMENTS
  orbits: {
    'leo-400': {
      id: 'leo-400',
      name: 'LEO Circular (400 km, 51.6° Inclination)',
      targetBody: 'Earth',
      altitudeKm: 400,
      deltaVRequiredMs: 150, // Station-keeping delta-v over 3 years
      orbitalPeriodMin: 92.5,
      eclipseFraction: 0.38,
      groundPassesPerDay: 15,
      radiationFactor: 1.0,
      scienceEfficiency: 0.85
    },
    'leo-sso': {
      id: 'leo-sso',
      name: 'LEO Sun-Synchronous (650 km, 98° Polar)',
      targetBody: 'Earth',
      altitudeKm: 650,
      deltaVRequiredMs: 220,
      orbitalPeriodMin: 97.7,
      eclipseFraction: 0.35,
      groundPassesPerDay: 14,
      radiationFactor: 1.1,
      scienceEfficiency: 1.25
    },
    'meo-gps': {
      id: 'meo-gps',
      name: 'MEO Medium Earth Orbit (20,200 km)',
      targetBody: 'Earth',
      altitudeKm: 20200,
      deltaVRequiredMs: 1450,
      orbitalPeriodMin: 718,
      eclipseFraction: 0.12,
      groundPassesPerDay: 2,
      radiationFactor: 3.5, // Traverses heart of Van Allen belts!
      scienceEfficiency: 0.90
    },
    'geo': {
      id: 'geo',
      name: 'Geostationary Orbit (35,786 km Equatorial)',
      targetBody: 'Earth',
      altitudeKm: 35786,
      deltaVRequiredMs: 1850,
      orbitalPeriodMin: 1436,
      eclipseFraction: 0.05,
      groundPassesPerDay: 24, // Continuous line of sight to ground station!
      radiationFactor: 1.6,
      scienceEfficiency: 1.10
    },
    'llo-polar': {
      id: 'llo-polar',
      name: 'Low Lunar Polar Orbit (100 km circular)',
      targetBody: 'Moon',
      altitudeKm: 100,
      deltaVRequiredMs: 3950, // Lunar transfer & insertion
      orbitalPeriodMin: 118,
      eclipseFraction: 0.44, // Far side + lunar shadow
      groundPassesPerDay: 12,
      radiationFactor: 1.5,
      scienceEfficiency: 1.30
    },
    'lmo-polar': {
      id: 'lmo-polar',
      name: 'Low Mars Polar Orbit (350 km circular)',
      targetBody: 'Mars',
      altitudeKm: 350,
      deltaVRequiredMs: 5400, // Trans-Mars Injection + Capture
      orbitalPeriodMin: 111,
      eclipseFraction: 0.41,
      groundPassesPerDay: 10,
      radiationFactor: 2.4,
      scienceEfficiency: 1.35
    },
    'jovian-europa-res': {
      id: 'jovian-europa-res',
      name: 'High-Elliptical Jovian Europa Resonant Orbit',
      targetBody: 'Europa',
      altitudeKm: 850, // Perijove flyby altitude
      deltaVRequiredMs: 7800, // Jupiter transfer, capture & resonance
      orbitalPeriodMin: 220,
      eclipseFraction: 0.22,
      groundPassesPerDay: 8,
      radiationFactor: 6.8, // Severe Jovian radiation!
      scienceEfficiency: 1.50
    }
  }
};
