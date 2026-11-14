/**
 * Space Mission Design Game - Mission Model & Systems Engineering Engine
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.MissionModel = function(scenarioId) {
  this.scenarioId = scenarioId || 'earth-climate';
  this.scenario = window.SpaceMissionGame.SCENARIOS[this.scenarioId];

  // Default design baseline configuration
  this.busId = 'smallsat-150';
  this.powerGenId = 'solar-deploy-gaas';
  this.batteryId = 'bat-li-1200';
  this.propulsionId = 'prop-monoprop';
  this.adcsId = 'adcs-wheels';
  this.commsId = 'comm-xband';
  this.groundNetworkId = 'net-near-space';
  this.thermalId = 'thermal-standard';
  this.selectedInstrumentIds = ['inst-optical-imager'];
  this.launchVehicleId = 'lv-falcon9-reusable';
  this.orbitId = this.scenario.recommendedOrbit || 'leo-sso';

  // Mission custom name
  this.spacecraftName = 'Sentinel-Alpha';
  this.teamLeadName = 'Commander / Lead Architect';
};

window.SpaceMissionGame.MissionModel.prototype = {
  setScenario: function(scenarioId) {
    if (window.SpaceMissionGame.SCENARIOS[scenarioId]) {
      this.scenarioId = scenarioId;
      this.scenario = window.SpaceMissionGame.SCENARIOS[scenarioId];
      this.orbitId = this.scenario.recommendedOrbit;
      
      // Auto-tune ground network based on body
      if (this.scenario.targetBody !== 'Earth') {
        this.groundNetworkId = 'net-dsn';
      } else {
        this.groundNetworkId = 'net-near-space';
      }
    }
  },

  toggleInstrument: function(instId) {
    const idx = this.selectedInstrumentIds.indexOf(instId);
    const bus = window.SpaceMissionGame.COMPONENTS.buses[this.busId];
    if (idx >= 0) {
      this.selectedInstrumentIds.splice(idx, 1);
    } else {
      if (this.selectedInstrumentIds.length < (bus.allowedInstrumentsMax || 3)) {
        this.selectedInstrumentIds.push(instId);
      }
    }
  },

  // 1. MASS BUDGET & PROPULSION DELTA-V
  computeMassBudget: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const bus = C.buses[this.busId] || C.buses['smallsat-150'];
    const pwr = C.powerGeneration[this.powerGenId] || C.powerGeneration['solar-deploy-gaas'];
    const bat = C.batteries[this.batteryId] || C.batteries['bat-li-1200'];
    const prop = C.propulsion[this.propulsionId] || C.propulsion['prop-monoprop'];
    const adcs = C.adcs[this.adcsId] || C.adcs['adcs-wheels'];
    const comm = C.communications[this.commsId] || C.communications['comm-xband'];
    const therm = C.thermalShielding[this.thermalId] || C.thermalShielding['thermal-standard'];
    const orbit = C.orbits[this.orbitId] || C.orbits['leo-sso'];
    const lv = C.launchVehicles[this.launchVehicleId] || C.launchVehicles['lv-falcon9-reusable'];

    // Instruments Mass
    let instrumentsMass = 0;
    this.selectedInstrumentIds.forEach(id => {
      const inst = C.instruments[id];
      if (inst) instrumentsMass += inst.mass;
    });

    // Dry Mass Sum
    const dryMass = bus.dryMass + pwr.mass + bat.mass + prop.dryMass + 
                    adcs.mass + comm.mass + therm.mass + instrumentsMass;

    // Delta-V required (m/s)
    const deltaV = orbit.deltaVRequiredMs;
    const isp = prop.isp; // seconds
    const g0 = 9.80665; // m/s^2

    // Tsiolkovsky propellant calculation: m_p = m_dry * (exp(deltaV / (Isp * g0)) - 1)
    // Add 12% flight reserve margin
    const massRatio = Math.exp(deltaV / (isp * g0));
    const propellantMass = Math.max(2.0, (dryMass * (massRatio - 1.0)) * 1.12);

    const wetMass = dryMass + propellantMass;

    // Launch Vehicle capacity to target body
    let lvCapacityKg = lv.payloadToLEOKg;
    if (this.scenario.targetBody === 'Moon') {
      lvCapacityKg = lv.payloadToMoonKg;
    } else if (this.scenario.targetBody === 'Mars') {
      lvCapacityKg = lv.payloadToMarsKg;
    } else if (this.scenario.targetBody === 'Europa') {
      lvCapacityKg = lv.payloadToJupiterKg;
    }

    const massMarginKg = lvCapacityKg - wetMass;
    const massMarginPercent = lvCapacityKg > 0 ? ((massMarginKg / lvCapacityKg) * 100) : -100;
    const isMassFeasible = (massMarginKg >= 0 && lvCapacityKg > 0);

    return {
      dryMass: Math.round(dryMass * 10) / 10,
      propellantMass: Math.round(propellantMass * 10) / 10,
      wetMass: Math.round(wetMass * 10) / 10,
      instrumentsMass: Math.round(instrumentsMass * 10) / 10,
      deltaVRequired: deltaV,
      isp: isp,
      lvCapacityKg: lvCapacityKg,
      massMarginKg: Math.round(massMarginKg * 10) / 10,
      massMarginPercent: Math.round(massMarginPercent * 10) / 10,
      isMassFeasible: isMassFeasible,
      busCapacityWarning: instrumentsMass > bus.maxPayloadMass
    };
  },

  // 2. POWER BUDGET & BATTERY DEPTH OF DISCHARGE (DoD)
  computePowerBudget: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const bus = C.buses[this.busId];
    const pwr = C.powerGeneration[this.powerGenId];
    const bat = C.batteries[this.batteryId];
    const adcs = C.adcs[this.adcsId];
    const comm = C.communications[this.commsId];
    const therm = C.thermalShielding[this.thermalId];
    const prop = C.propulsion[this.propulsionId];
    const orbit = C.orbits[this.orbitId] || C.orbits['leo-sso'];

    // Base continuous consumption
    let baseLoadWatts = bus.basePowerConsumption + adcs.powerRequired + therm.powerRequired + prop.powerRequired;

    // Instrument Power
    let instrumentPowerWatts = 0;
    this.selectedInstrumentIds.forEach(id => {
      const inst = C.instruments[id];
      if (inst) instrumentPowerWatts += inst.powerDraw;
    });

    // Total active daylight power demand
    const dayConsumptionWatts = baseLoadWatts + comm.powerRequired + instrumentPowerWatts;

    // Eclipse consumption: payload duty cycle reduced to 40% during eclipse, comms standby
    const eclipseConsumptionWatts = baseLoadWatts + (comm.powerRequired * 0.3) + (instrumentPowerWatts * 0.4);

    // Solar Irradiance at target body
    const solarFlux = window.SpaceMissionGame.OrbitPhysics.getSolarIrradiance(this.scenario.targetBody);

    // Generation in Sunlight
    let generationWatts = 0;
    if (pwr.isNuclear) {
      generationWatts = pwr.fixedPowerWatts; // RTG generates steady power regardless of Sun
    } else {
      // P = Area * Efficiency * Flux * orientation factor (~0.85 average cos)
      generationWatts = pwr.areaM2 * pwr.efficiency * solarFlux * 0.85;
    }

    // Eclipse and Orbital Times
    const periodMin = orbit.orbitalPeriodMin;
    const eclipseFraction = orbit.eclipseFraction;
    const eclipseDurationMin = periodMin * eclipseFraction;
    const daylightDurationMin = periodMin * (1.0 - eclipseFraction);

    // Energy consumed during eclipse in Watt-hours (Wh)
    const eclipseEnergyWh = eclipseConsumptionWatts * (eclipseDurationMin / 60.0);

    // Battery Depth of Discharge (DoD)
    const dodPercent = (eclipseEnergyWh / bat.capacityWh) * 100;

    // Daylight net energy generated (for recharging battery and powering bus)
    const netDaylightWatts = generationWatts - dayConsumptionWatts;
    const rechargeEnergyWh = Math.max(0, netDaylightWatts) * (daylightDurationMin / 60.0);
    const rechargeRatio = eclipseEnergyWh > 0 ? (rechargeEnergyWh / eclipseEnergyWh) : 2.0;

    const isDoDSafe = dodPercent <= (bat.maxDoDRecommended * 100);
    const isPowerSurplus = netDaylightWatts > 0;
    const isRechargeSufficient = rechargeRatio >= 1.15; // Needs at least 15% margin to fully top up battery

    return {
      dayConsumptionWatts: Math.round(dayConsumptionWatts),
      eclipseConsumptionWatts: Math.round(eclipseConsumptionWatts),
      generationWatts: Math.round(generationWatts),
      netDaylightWatts: Math.round(netDaylightWatts),
      solarFlux: Math.round(solarFlux),
      batteryCapacityWh: bat.capacityWh,
      eclipseDurationMin: Math.round(eclipseDurationMin * 10) / 10,
      daylightDurationMin: Math.round(daylightDurationMin * 10) / 10,
      eclipseEnergyWh: Math.round(eclipseEnergyWh * 10) / 10,
      rechargeEnergyWh: Math.round(rechargeEnergyWh * 10) / 10,
      dodPercent: Math.round(dodPercent * 10) / 10,
      maxRecommendedDoD: Math.round(bat.maxDoDRecommended * 100),
      isDoDSafe: isDoDSafe,
      isPowerSurplus: isPowerSurplus,
      isRechargeSufficient: isRechargeSufficient,
      isBlackout: dodPercent >= 100
    };
  },

  // 3. COMMUNICATIONS & DATA DOWNLINK BUDGET
  computeDataBudget: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const comm = C.communications[this.commsId];
    const net = C.groundNetworks[this.groundNetworkId] || C.groundNetworks['net-near-space'];
    const orbit = C.orbits[this.orbitId] || C.orbits['leo-sso'];

    // Instrument Data Generation Rate (Mbps)
    let totalDataRateMbps = 0;
    this.selectedInstrumentIds.forEach(id => {
      const inst = C.instruments[id];
      if (inst) totalDataRateMbps += inst.dataGenRateMbps;
    });

    // Assuming average 45% instrument operational duty cycle across an orbit
    const activeSecondsPerDay = 86400 * 0.45;
    const dailyGenGigabits = (totalDataRateMbps * activeSecondsPerDay) / 1000;
    const dailyGenGB = dailyGenGigabits / 8.0;

    // Contact time per day (minutes)
    const contactMinPerDay = net.contactWindowMinPerOrbit * orbit.groundPassesPerDay;
    const contactSecPerDay = contactMinPerDay * 60;

    // Downlink throughput capacity per day
    const dailyDownlinkGigabits = (comm.maxDataRateMbps * contactSecPerDay) / 1000;
    const dailyDownlinkGB = dailyDownlinkGigabits / 8.0;

    const dataMarginGB = dailyDownlinkGB - dailyGenGB;
    const downlinkCoverageRatio = dailyGenGB > 0 ? (dailyDownlinkGB / dailyGenGB) : 10.0;
    const isBufferHealthy = downlinkCoverageRatio >= 1.0;

    // Target total data collection over simulated mission
    const totalMissionDataGB = dailyDownlinkGB * this.scenario.nominalDurationDays;

    return {
      totalDataRateMbps: totalDataRateMbps,
      downlinkRateMbps: comm.maxDataRateMbps,
      contactMinPerDay: contactMinPerDay,
      dailyGenGB: Math.round(dailyGenGB * 10) / 10,
      dailyDownlinkGB: Math.round(dailyDownlinkGB * 10) / 10,
      dataMarginGB: Math.round(dataMarginGB * 10) / 10,
      downlinkCoverageRatio: Math.round(downlinkCoverageRatio * 100) / 100,
      totalMissionDataGB: Math.round(totalMissionDataGB),
      isBufferHealthy: isBufferHealthy
    };
  },

  // 4. FINANCIAL BUDGET & COST ANALYSIS
  computeFinancialBudget: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const bus = C.buses[this.busId];
    const pwr = C.powerGeneration[this.powerGenId];
    const bat = C.batteries[this.batteryId];
    const prop = C.propulsion[this.propulsionId];
    const adcs = C.adcs[this.adcsId];
    const comm = C.communications[this.commsId];
    const therm = C.thermalShielding[this.thermalId];
    const lv = C.launchVehicles[this.launchVehicleId];
    const net = C.groundNetworks[this.groundNetworkId] || C.groundNetworks['net-near-space'];

    // Instruments cost
    let instrumentsCost = 0;
    this.selectedInstrumentIds.forEach(id => {
      const inst = C.instruments[id];
      if (inst) instrumentsCost += inst.cost;
    });

    const spacecraftHardwareCost = bus.cost + pwr.cost + bat.cost + prop.cost +
                                   adcs.cost + comm.cost + therm.cost + instrumentsCost;
    
    // Mission Ground Operations (years based on duration)
    const missionYears = Math.max(0.5, this.scenario.nominalDurationDays / 365.25);
    const operationsCost = net.annualCost * missionYears;

    const launchCost = lv.cost;

    const totalCost = spacecraftHardwareCost + operationsCost + launchCost;
    const scenarioCap = this.scenario.budget;
    const costMargin = scenarioCap - totalCost;
    const isWithinBudget = costMargin >= 0;

    return {
      spacecraftHardwareCost: Math.round(spacecraftHardwareCost * 10) / 10,
      launchCost: Math.round(launchCost * 10) / 10,
      operationsCost: Math.round(operationsCost * 10) / 10,
      totalCost: Math.round(totalCost * 10) / 10,
      scenarioCap: scenarioCap,
      costMargin: Math.round(costMargin * 10) / 10,
      isWithinBudget: isWithinBudget
    };
  },

  // 5. SCIENCE OUTPUT & MISSION PERFORMANCE METRICS
  computeScienceOutput: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const orbit = C.orbits[this.orbitId] || C.orbits['leo-sso'];

    let baseSciencePoints = 0;
    this.selectedInstrumentIds.forEach(id => {
      const inst = C.instruments[id];
      if (inst) {
        let pts = inst.sciencePoints;
        // Bonus if instrument is well matched to target body
        if (inst.preferredTargets && inst.preferredTargets.includes(this.scenario.targetBody)) {
          pts *= 1.25; // 25% synergy bonus!
        }
        baseSciencePoints += pts;
      }
    });

    // Orbit efficiency multiplier
    const totalScienceScore = Math.round(baseSciencePoints * orbit.scienceEfficiency);
    const targetScore = this.scenario.minScienceScore;
    const goalRatio = targetScore > 0 ? (totalScienceScore / targetScore) : 1.0;

    return {
      baseSciencePoints: Math.round(baseSciencePoints),
      totalScienceScore: totalScienceScore,
      targetScore: targetScore,
      goalRatio: Math.round(goalRatio * 100) / 100,
      meetsScienceTarget: totalScienceScore >= targetScore
    };
  },

  // 6. RELIABILITY & SUBSYSTEM COMPATIBILITY
  computeReliability: function() {
    const C = window.SpaceMissionGame.COMPONENTS;
    const therm = C.thermalShielding[this.thermalId];
    const adcs = C.adcs[this.adcsId];
    const comm = C.communications[this.commsId];
    const env = this.scenario.environment;

    // Radiation Shielding vs Environmental Radiation
    const radScore = therm.radiationToleranceRating / env.radiationFactor;
    const hasRadiationRisk = radScore < 0.85;

    // ADCS Pointing Compatibility
    // Optical/Laser comms and high-res cameras need precision pointing
    let requiresPrecisionPointing = comm.requiresPrecisionPointing;
    this.selectedInstrumentIds.forEach(id => {
      if (id === 'inst-optical-imager' || id === 'inst-laser-altimeter') {
        requiresPrecisionPointing = true;
      }
    });

    const isPointingAdequate = (!requiresPrecisionPointing || adcs.supportsTargeting);

    // Deep Space Comms check
    let deepSpaceViolation = false;
    if (this.scenario.targetBody !== 'Earth' && !comm.deepSpaceCapable) {
      deepSpaceViolation = true;
    }

    return {
      radiationScore: Math.round(radScore * 100) / 100,
      hasRadiationRisk: hasRadiationRisk,
      isPointingAdequate: isPointingAdequate,
      deepSpaceViolation: deepSpaceViolation
    };
  },

  // 7. COMPREHENSIVE FLIGHT VALIDATION REPORT & TEAM GO/NO-GO
  getValidationReport: function() {
    const mass = this.computeMassBudget();
    const power = this.computePowerBudget();
    const data = this.computeDataBudget();
    const finance = this.computeFinancialBudget();
    const science = this.computeScienceOutput();
    const rel = this.computeReliability();

    const criticalViolations = [];
    const warnings = [];
    const greenPasses = [];

    // Mass checks
    if (!mass.isMassFeasible) {
      criticalViolations.push({
        subsystem: 'Launch & Mass',
        message: `Spacecraft Wet Mass (${mass.wetMass} kg) exceeds Launch Vehicle capacity (${mass.lvCapacityKg} kg) to ${this.scenario.targetBody}!`
      });
    } else {
      greenPasses.push({
        subsystem: 'Launch & Mass',
        message: `Wet mass (${mass.wetMass} kg) is well within rocket capacity (${mass.lvCapacityKg} kg). Mass margin: ${mass.massMarginPercent}%`
      });
    }

    if (mass.busCapacityWarning) {
      warnings.push({
        subsystem: 'Structure',
        message: `Instrument payload mass (${mass.instrumentsMass} kg) exceeds bus structural envelope.`
      });
    }

    // Power checks
    if (power.isBlackout) {
      criticalViolations.push({
        subsystem: 'Power & Battery',
        message: `Catastrophic power blackout! Eclipse energy demand (${power.eclipseEnergyWh} Wh) exceeds total battery capacity (${power.batteryCapacityWh} Wh).`
      });
    } else if (!power.isDoDSafe) {
      warnings.push({
        subsystem: 'Power & Battery',
        message: `High Battery Depth-of-Discharge (${power.dodPercent}% vs max recommended ${power.maxRecommendedDoD}%). Cells may degrade over repeated orbits.`
      });
    } else {
      greenPasses.push({
        subsystem: 'Power & Battery',
        message: `Battery DoD during eclipse is ${power.dodPercent}%, safely under maximum threshold (${power.maxRecommendedDoD}%).`
      });
    }

    if (!power.isPowerSurplus) {
      criticalViolations.push({
        subsystem: 'Solar Arrays',
        message: `Negative net power during daylight pass (${power.netDaylightWatts} W). Solar panels cannot recharge batteries!`
      });
    } else if (!power.isRechargeSufficient) {
      warnings.push({
        subsystem: 'Solar Arrays',
        message: `Solar array daylight generation is tight. Battery may not fully recharge before the next eclipse.`
      });
    }

    // Finance checks
    if (!finance.isWithinBudget) {
      criticalViolations.push({
        subsystem: 'Budget & Finance',
        message: `Total Mission Cost ($${finance.totalCost}M) exceeds scenario funding cap ($${finance.scenarioCap}M) by $${Math.abs(finance.costMargin)}M!`
      });
    } else {
      greenPasses.push({
        subsystem: 'Budget & Finance',
        message: `Fiscal design is sound. Total cost: $${finance.totalCost}M (Remaining reserve: $${finance.costMargin}M).`
      });
    }

    // Science checks
    if (!science.meetsScienceTarget) {
      warnings.push({
        subsystem: 'Science Goals',
        message: `Projected science return (${science.totalScienceScore} pts) is below primary mission requirement (${science.targetScore} pts).`
      });
    } else {
      greenPasses.push({
        subsystem: 'Science Goals',
        message: `Science objectives satisfied! Projected science score: ${science.totalScienceScore} / ${science.targetScore} target.`
      });
    }

    // Comms & Data checks
    if (rel.deepSpaceViolation) {
      criticalViolations.push({
        subsystem: 'Communications',
        message: `Selected antenna (S-Band Low-Gain) lacks RF gain to transmit signals across interplanetary distances to Earth!`
      });
    }

    if (!data.isBufferHealthy) {
      warnings.push({
        subsystem: 'Telemetry & Downlink',
        message: `Daily instrument data (${data.dailyGenGB} GB) exceeds downlink capacity (${data.dailyDownlinkGB} GB). Onboard buffer will overflow.`
      });
    } else {
      greenPasses.push({
        subsystem: 'Telemetry & Downlink',
        message: `Downlink throughput (${data.dailyDownlinkGB} GB/day) safely clears daily science data generation (${data.dailyGenGB} GB/day).`
      });
    }

    // ADCS & Thermal checks
    if (!rel.isPointingAdequate) {
      warnings.push({
        subsystem: 'ADCS Pointing',
        message: `High-resolution instruments or laser comms require 3-axis reaction wheel pointing; coarse sun sensors will smear observations.`
      });
    }

    if (rel.hasRadiationRisk) {
      warnings.push({
        subsystem: 'Thermal & Shielding',
        message: `Harsh radiation environment (${this.scenario.environment.radiationLevel}) exceeds shielding tolerance. Consider adding a Radiation Vault.`
      });
    }

    const isGoForLaunch = criticalViolations.length === 0;

    return {
      isGoForLaunch: isGoForLaunch,
      criticalViolations: criticalViolations,
      warnings: warnings,
      greenPasses: greenPasses,
      overallHealthScore: Math.max(0, 100 - (criticalViolations.length * 35) - (warnings.length * 10))
    };
  }
};
