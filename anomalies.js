/**
 * Space Mission Design Game - Mission Anomalies & Dynamic Events
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.ANOMALIES = [
  {
    id: 'solar-storm',
    name: 'Solar Energetic Particle (SEP) Storm',
    icon: '☀️',
    severity: 'High',
    description: 'A Coronal Mass Ejection (CME) is sweeping past the spacecraft. Highly ionized solar protons are impacting the hull, threatening unprotected avionics and degrading solar array efficiency.',
    appliesTo: ['Earth', 'Moon', 'Mars', 'Europa'],
    triggerOrbitRange: [3, 10],
    choices: [
      {
        id: 'safe-mode',
        label: 'Orient Panels Edge-On & Enter Safe Mode (2 Orbits)',
        description: 'Protects the spacecraft from ionizing radiation and memory corruption. Science collection is suspended during the storm.',
        effect: {
          sciencePenalty: -80,
          powerDamage: 0,
          message: 'Spacecraft entered Safe Mode. Electronics shielded; science data was paused for 2 orbits.'
        }
      },
      {
        id: 'brave-storm',
        label: 'Maintain Full Science Observation Campaign',
        description: 'Harness the storm to collect rare space weather radiation data (+250 Science), but risk 15% solar array degradation if shielding is low.',
        effect: {
          scienceBonus: 250,
          powerDamage: 12, // 12% solar efficiency reduction
          requiresShieldingCheck: true,
          message: 'Valuable space-weather data downlinked! Solar array suffered minor degradation due to energetic proton bombardment.'
        }
      }
    ]
  },

  {
    id: 'debris-conjunction',
    name: 'Orbital Debris Conjunction Warning',
    icon: '🛰️',
    severity: 'Critical',
    description: 'Flight dynamics reports an uncatalogued rocket fragment or meteoroid on an intersecting orbital trajectory with a 1-in-20 probability of catastrophic impact in 40 minutes.',
    appliesTo: ['Earth', 'Moon'],
    triggerOrbitRange: [6, 15],
    choices: [
      {
        id: 'burn-rcs',
        label: 'Execute Prograde Collision Avoidance Burn',
        description: 'Fire propulsion thrusters to alter orbital phase by 3 km. Consumes 15 kg of propellant, guaranteeing 100% safety.',
        effect: {
          propellantCostKg: 15,
          damage: 0,
          message: 'Collision avoidance burn successful! Spacecraft cleared debris field with 100% mission safety.'
        }
      },
      {
        id: 'hold-course',
        label: 'Hold Course to Conserve Fuel',
        description: 'Save valuable propellant for end-of-mission disposal. 95% chance of near-miss; 5% chance of solar panel micrometeoroid puncture.',
        effect: {
          propellantCostKg: 0,
          riskChance: 0.15,
          failurePenalty: {
            powerDamage: 25,
            message: 'Near miss! However, high-velocity fragments peppered the secondary solar wing (-25% power).'
          },
          successMessage: 'Debris passed harmlessly 420 meters away. Propellant was preserved.'
        }
      }
    ]
  },

  {
    id: 'reaction-wheel-saturation',
    name: 'Reaction Wheel Momentum Saturation',
    icon: '🔄',
    severity: 'Medium',
    description: 'Continuous gravity gradient torque has spun the internal reaction wheels up to 98% of maximum allowable RPM. The spacecraft is losing fine pointing stability for imaging.',
    appliesTo: ['Earth', 'Moon', 'Mars', 'Europa'],
    triggerOrbitRange: [9, 18],
    choices: [
      {
        id: 'thruster-dump',
        label: 'Rapid Thruster Momentum Dump',
        description: 'Fire short counter-acting RCS thruster pulses to dump angular momentum in 5 minutes. Consumes 6 kg propellant.',
        effect: {
          propellantCostKg: 6,
          pointingDegraded: false,
          message: 'RCS thrusters fired; reaction wheel speeds successfully reset to 0 RPM.'
        }
      },
      {
        id: 'passive-damping',
        label: 'Magnetic Torque / Gravitational Drift Damping',
        description: 'Shed momentum gradually over 2 orbits without using propellant, accepting blurry imaging pointing during the maneuver.',
        effect: {
          propellantCostKg: 0,
          pointingDegraded: true,
          sciencePenalty: -120,
          message: 'Momentum slowly dissipated. Propellant saved, but imaging data was smeared during stabilization.'
        }
      }
    ]
  },

  {
    id: 'target-of-opportunity',
    name: 'Target of Opportunity Detected!',
    icon: '✨',
    severity: 'Bonus',
    description: 'Onboard autonomous novelty detection spotted a transient high-value event (active ice plume / dust devil / auroral burst) directly beneath the flight path!',
    appliesTo: ['Earth', 'Moon', 'Mars', 'Europa'],
    triggerOrbitRange: [12, 22],
    choices: [
      {
        id: 'rapid-target',
        label: 'Slew Spacecraft & Initiate Emergency High-Res Campaign',
        description: 'Rapidly slew ADCS, fire all primary instruments at maximum duty cycle. Yields +350 bonus science, but drains 35% battery reserve.',
        effect: {
          scienceBonus: 350,
          batteryDrainPercent: 35,
          message: 'Phenomenal science return! High-resolution imagery captured the transient event in unprecedented detail.'
        }
      },
      {
        id: 'maintain-routine',
        label: 'Adhere to Baseline Power & Thermal Flight Plan',
        description: 'Maintain scheduled nominal operations to guarantee battery health and prevent thermal spike.',
        effect: {
          scienceBonus: 0,
          batteryDrainPercent: 0,
          message: 'Target passed. Nominal mission timeline preserved with maximum battery margin.'
        }
      }
    ]
  },

  {
    id: 'transmitter-thermal-trip',
    name: 'High-Power Downlink Thermal Warning',
    icon: '📡',
    severity: 'Medium',
    description: 'Prolonged high-speed radio transmission during continuous ground station contact has driven the RF power amplifier temperature to 64°C.',
    appliesTo: ['Earth', 'Moon', 'Mars', 'Europa'],
    triggerOrbitRange: [14, 21],
    choices: [
      {
        id: 'buffer-data',
        label: 'Throttle Downlink Power & Buffer Data to Solid-State Storage',
        description: 'Cuts transmitter thermal output by 50% to protect the amplifier. Science data will be stored onboard until the next orbit pass.',
        effect: {
          bufferStrain: 25, // % buffer usage
          hardwareDamage: 0,
          message: 'Transmitter cooled to safe 38°C. Science data buffered safely in solid-state recorder.'
        }
      },
      {
        id: 'radiator-boost',
        label: 'Re-orient Radiators & Maximize Heat Dissipation',
        description: 'Slew spacecraft to cast thermal radiators into deep-space shadow, sustaining full downlink throughput.',
        effect: {
          bufferStrain: 0,
          hardwareDamage: 0,
          message: 'Radiators dumped excess heat into space; downlink maintained at full bandwidth.'
        }
      }
    ]
  }
];
