/**
 * Space Mission Design Game - Live Flight Simulation Engine
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.Simulator = function(missionModel, callbacks) {
  this.model = missionModel;
  this.callbacks = callbacks || {};

  this.isRunning = false;
  this.isPaused = false;
  this.isComplete = false;
  this.isAnomalyActive = false;
  this.activeAnomaly = null;

  this.simSpeed = 5; // 1x, 5x, 20x, 50x
  this.currentOrbit = 1;
  this.totalOrbits = this.model.scenario.orbitsToSimulate || 24;
  this.orbitalPhase = 0.0; // 0..1
  this.missionElapsedHours = 0.0;

  // Real-time telemetry state
  this.batterySOC = 100.0; // %
  this.minBatterySOC = 100.0;
  this.powerGenWatts = 0;
  this.powerConsWatts = 0;
  this.scienceGeneratedGB = 0;
  this.scienceDownlinkedGB = 0;
  this.bufferOccupiedGB = 0;
  this.bufferMaxGB = 128.0; // Standard 128GB SSR buffer
  this.bufferPercent = 0.0;
  this.propellantRemainingKg = 0;
  this.initialPropellantKg = 0;
  this.solarDegradation = 0.0; // 0..1
  this.spacecraftHealth = 100.0; // %
  this.thermalTempC = 22.0;

  this.triggeredAnomalyIds = {};
  this.telemetryHistory = [];
  this.eventLog = [];

  this.timerId = null;
  this.lastTickTime = null;

  this.initTelemetry();
};

window.SpaceMissionGame.Simulator.prototype = {
  initTelemetry: function() {
    const mass = this.model.computeMassBudget();
    this.initialPropellantKg = mass.propellantMass;
    this.propellantRemainingKg = mass.propellantMass;
    this.batterySOC = 100.0;
    this.minBatterySOC = 100.0;
    this.solarDegradation = 0.0;
    this.spacecraftHealth = 100.0;
    this.scienceGeneratedGB = 0;
    this.scienceDownlinkedGB = 0;
    this.bufferOccupiedGB = 0;
    this.currentOrbit = 1;
    this.orbitalPhase = 0.0;
    this.missionElapsedHours = 0.0;
    this.isComplete = false;
    this.telemetryHistory = [];
    this.eventLog = [];
    this.triggeredAnomalyIds = {};
  },

  start: function() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTickTime = performance.now();
    this.logEvent('Flight Execution Commenced: Spacecraft successfully separated from launch vehicle upper stage.');

    const self = this;
    this.timerId = setInterval(function() {
      self.tick();
    }, 50); // 20 updates per second
  },

  pause: function() {
    this.isPaused = true;
  },

  resume: function() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTickTime = performance.now();
  },

  setSpeed: function(speed) {
    this.simSpeed = speed;
  },

  stop: function() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
    this.isPaused = false;
  },

  logEvent: function(msg, type) {
    const timestamp = `Orbit ${this.currentOrbit} [MET ${Math.floor(this.missionElapsedHours)}h]`;
    this.eventLog.unshift({
      time: timestamp,
      text: msg,
      type: type || 'info'
    });
    if (this.eventLog.length > 50) this.eventLog.pop();
  },

  // Primary Simulation Tick
  tick: function() {
    if (!this.isRunning || this.isPaused || this.isAnomalyActive) return;

    const now = performance.now();
    const dtRealSec = (now - this.lastTickTime) / 1000.0;
    this.lastTickTime = now;

    // Compressed virtual time: 1 orbit nominal period ~95 minutes
    const orbit = window.SpaceMissionGame.COMPONENTS.orbits[this.model.orbitId] || window.SpaceMissionGame.COMPONENTS.orbits['leo-sso'];
    const periodMinutes = orbit.orbitalPeriodMin;
    const periodSeconds = periodMinutes * 60;

    // Virtual seconds elapsed this tick
    // Baseline: 1 full orbit takes ~18 seconds at 1x speed
    const virtualSecondsPerTick = (periodSeconds / 18.0) * this.simSpeed * dtRealSec;
    const virtualHours = virtualSecondsPerTick / 3600.0;

    this.missionElapsedHours += virtualHours;

    // Advance orbital phase
    const phaseDelta = virtualSecondsPerTick / periodSeconds;
    this.orbitalPhase += phaseDelta;

    if (this.orbitalPhase >= 1.0) {
      this.orbitalPhase -= 1.0;
      this.currentOrbit++;
      this.onOrbitCompleted();
    }

    if (this.currentOrbit > this.totalOrbits) {
      this.finish(true);
      return;
    }

    // Determine environmental & orbital state
    const net = window.SpaceMissionGame.COMPONENTS.groundNetworks[this.model.groundNetworkId] || window.SpaceMissionGame.COMPONENTS.groundNetworks['net-near-space'];
    const groundPassFraction = (net.contactWindowMinPerOrbit / periodMinutes);
    const orbitState = window.SpaceMissionGame.OrbitPhysics.getOrbitStateAtPhase(
      this.orbitalPhase,
      orbit.eclipseFraction,
      groundPassFraction
    );

    // Compute instantaneous power
    const powerBudget = this.model.computePowerBudget();
    const C = window.SpaceMissionGame.COMPONENTS;
    const pwr = C.powerGeneration[this.model.powerGenId];
    const bat = C.batteries[this.model.batteryId];

    if (orbitState.inEclipse) {
      // Eclipsed: Solar arrays generate 0 W, RTG continues
      this.powerGenWatts = pwr.isNuclear ? pwr.fixedPowerWatts : 0;
      this.powerConsWatts = powerBudget.eclipseConsumptionWatts;

      // Battery drains
      const energyDrainedWh = this.powerConsWatts * virtualHours;
      this.batterySOC -= (energyDrainedWh / bat.capacityWh) * 100.0;
      this.thermalTempC = Math.max(-15.0, this.thermalTempC - (0.4 * virtualHours * 60));
    } else {
      // Daylight: Generation active with solar degradation factor
      const nominalGen = pwr.isNuclear ? pwr.fixedPowerWatts : powerBudget.generationWatts;
      this.powerGenWatts = Math.round(nominalGen * (1.0 - this.solarDegradation));
      this.powerConsWatts = powerBudget.dayConsumptionWatts;

      const netSurplusWatts = this.powerGenWatts - this.powerConsWatts;
      if (netSurplusWatts > 0) {
        const energyRechargedWh = netSurplusWatts * virtualHours;
        this.batterySOC += (energyRechargedWh / bat.capacityWh) * 100.0;
        if (this.batterySOC > 100.0) this.batterySOC = 100.0;
      } else {
        // Deficit even in sunlight!
        const energyDrainedWh = Math.abs(netSurplusWatts) * virtualHours;
        this.batterySOC -= (energyDrainedWh / bat.capacityWh) * 100.0;
      }
      this.thermalTempC = Math.min(38.0, this.thermalTempC + (0.3 * virtualHours * 60));
    }

    // Track minimum battery state of charge
    if (this.batterySOC < this.minBatterySOC) {
      this.minBatterySOC = this.batterySOC;
    }

    // Catastrophic battery blackout check
    if (this.batterySOC <= 0.0) {
      this.batterySOC = 0.0;
      this.spacecraftHealth -= (15.0 * virtualHours * 60);
      if (this.spacecraftHealth <= 0.0) {
        this.spacecraftHealth = 0.0;
        this.logEvent('CRITICAL FAILURE: Complete electrical power depletion. Spacecraft lost in orbit.', 'danger');
        window.SpaceMissionGame.Audio.playAlarm();
        this.finish(false, 'Catastrophic battery depletion during orbital eclipse.');
        return;
      }
    }

    // Science generation & data downlink
    const dataBudget = this.model.computeDataBudget();
    // Daily rate converted to virtual tick rate
    const dailySec = 86400.0;
    const generatedThisTickGB = (dataBudget.dailyGenGB / dailySec) * virtualSecondsPerTick;
    this.scienceGeneratedGB += generatedThisTickGB;
    this.bufferOccupiedGB += generatedThisTickGB;

    if (orbitState.inGroundContact) {
      // Downlinking
      const downlinkThisTickGB = (dataBudget.dailyDownlinkGB / (dailySec * groundPassFraction)) * virtualSecondsPerTick;
      const downlinked = Math.min(this.bufferOccupiedGB, downlinkThisTickGB);
      this.bufferOccupiedGB -= downlinked;
      this.scienceDownlinkedGB += downlinked;

      if (Math.random() < 0.04) {
        window.SpaceMissionGame.Audio.playQuindarTone();
      }
    }

    // Buffer overflow check
    if (this.bufferOccupiedGB > this.bufferMaxGB) {
      const droppedData = this.bufferOccupiedGB - this.bufferMaxGB;
      this.bufferOccupiedGB = this.bufferMaxGB;
      if (Math.random() < 0.08) {
        this.logEvent(`Telemetry Warning: Solid-State Buffer overflow. ${Math.round(droppedData * 10) / 10} GB data dropped!`, 'warning');
      }
    }
    this.bufferPercent = Math.min(100.0, (this.bufferOccupiedGB / this.bufferMaxGB) * 100.0);

    // Propellant boiloff / micro station-keeping
    const propUsed = 0.005 * virtualHours;
    this.propellantRemainingKg = Math.max(0, this.propellantRemainingKg - propUsed);

    // Record telemetry slice for post-flight charts (every ~0.25 orbit)
    if (this.telemetryHistory.length === 0 || 
        Math.abs(this.orbitalPhase - (this.telemetryHistory[this.telemetryHistory.length - 1].phase || 0)) > 0.15) {
      this.telemetryHistory.push({
        orbit: this.currentOrbit,
        phase: this.orbitalPhase,
        hours: Math.round(this.missionElapsedHours * 10) / 10,
        batterySOC: Math.round(this.batterySOC * 10) / 10,
        powerGen: this.powerGenWatts,
        powerCons: this.powerConsWatts,
        bufferPercent: Math.round(this.bufferPercent),
        propellantKg: Math.round(this.propellantRemainingKg * 10) / 10,
        inEclipse: orbitState.inEclipse
      });
      // Cap history buffer
      if (this.telemetryHistory.length > 250) this.telemetryHistory.shift();
    }

    // Check for anomaly triggers
    this.checkAnomalyTriggers();

    // Notify UI
    if (this.callbacks.onTick) {
      this.callbacks.onTick({
        currentOrbit: this.currentOrbit,
        totalOrbits: this.totalOrbits,
        orbitalPhase: this.orbitalPhase,
        missionElapsedHours: Math.round(this.missionElapsedHours * 10) / 10,
        batterySOC: Math.round(this.batterySOC * 10) / 10,
        powerGenWatts: this.powerGenWatts,
        powerConsWatts: this.powerConsWatts,
        scienceDownlinkedGB: Math.round(this.scienceDownlinkedGB * 10) / 10,
        bufferPercent: Math.round(this.bufferPercent),
        propellantKg: Math.round(this.propellantRemainingKg * 10) / 10,
        spacecraftHealth: Math.round(this.spacecraftHealth),
        thermalTempC: Math.round(this.thermalTempC),
        orbitState: orbitState
      });
    }
  },

  onOrbitCompleted: function() {
    this.logEvent(`Orbit ${this.currentOrbit - 1} completed. Telemetry downlink verified.`);
    window.SpaceMissionGame.Audio.playClick();
  },

  checkAnomalyTriggers: function() {
    if (this.isAnomalyActive) return;

    const anomalies = window.SpaceMissionGame.ANOMALIES;
    for (let i = 0; i < anomalies.length; i++) {
      const a = anomalies[i];
      if (this.triggeredAnomalyIds[a.id]) continue;

      // Check if applicable to current celestial target
      if (a.appliesTo && !a.appliesTo.includes(this.model.scenario.targetBody)) continue;

      // Check orbit trigger window
      if (this.currentOrbit >= a.triggerOrbitRange[0] && this.currentOrbit <= a.triggerOrbitRange[1]) {
        // 25% chance per orbit window check to create dynamic variation
        if (Math.random() < 0.25 || this.currentOrbit === a.triggerOrbitRange[1]) {
          this.triggerAnomaly(a);
          break;
        }
      }
    }
  },

  triggerAnomaly: function(anomaly) {
    this.isAnomalyActive = true;
    this.activeAnomaly = anomaly;
    this.triggeredAnomalyIds[anomaly.id] = true;

    this.logEvent(`FLIGHT ANOMALY ALERT: ${anomaly.name}! Spacecraft awaits engineering command.`, 'danger');
    window.SpaceMissionGame.Audio.playAlarm();

    if (this.callbacks.onAnomaly) {
      this.callbacks.onAnomaly(anomaly);
    }
  },

  resolveAnomaly: function(choiceId) {
    if (!this.activeAnomaly) return;

    const choice = this.activeAnomaly.choices.find(c => c.id === choiceId);
    if (!choice) return;

    const effect = choice.effect;
    let logMsg = '';

    // Apply mechanical effects
    if (effect.propellantCostKg) {
      this.propellantRemainingKg = Math.max(0, this.propellantRemainingKg - effect.propellantCostKg);
      window.SpaceMissionGame.Audio.playThrusterBurn(0.8);
    }

    if (effect.powerDamage) {
      this.solarDegradation += (effect.powerDamage / 100.0);
    }

    if (effect.batteryDrainPercent) {
      this.batterySOC = Math.max(5.0, this.batterySOC - effect.batteryDrainPercent);
    }

    if (effect.riskChance && Math.random() < effect.riskChance) {
      // Risk trigger failed!
      if (effect.failurePenalty) {
        if (effect.failurePenalty.powerDamage) this.solarDegradation += (effect.failurePenalty.powerDamage / 100.0);
        logMsg = effect.failurePenalty.message;
      }
    } else {
      logMsg = effect.message || (choice.effect.successMessage || 'Anomaly commanded successfully.');
    }

    this.logEvent(`[Action Taken] ${choice.label}: ${logMsg}`, 'info');

    this.isAnomalyActive = false;
    this.activeAnomaly = null;

    if (this.callbacks.onAnomalyResolved) {
      this.callbacks.onAnomalyResolved(choice);
    }
  },

  finish: function(success, failureReason) {
    this.stop();
    this.isComplete = true;

    const scorecard = this.calculateFinalScorecard(success, failureReason);
    if (success && scorecard.score >= 550) {
      window.SpaceMissionGame.Audio.playVictory();
    } else {
      window.SpaceMissionGame.Audio.playAlarm();
    }

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete(scorecard);
    }
  },

  calculateFinalScorecard: function(isSuccess, failureReason) {
    const science = this.model.computeScienceOutput();
    const finance = this.model.computeFinancialBudget();
    const mass = this.model.computeMassBudget();
    const power = this.model.computePowerBudget();

    let sciencePoints = science.totalScienceScore;
    let scienceFulfillmentRatio = Math.min(1.5, sciencePoints / Math.max(1, science.targetScore));
    let scienceScoreComponent = Math.round(scienceFulfillmentRatio * 450); // Up to 450 pts

    // Financial efficiency component (up to 200 pts)
    let budgetRatio = finance.costMargin / Math.max(1, finance.scenarioCap);
    let budgetScoreComponent = finance.isWithinBudget ? Math.round(150 + (budgetRatio * 50)) : 40;

    // Reliability & Health component (up to 250 pts)
    let healthComponent = Math.round((this.spacecraftHealth / 100.0) * 150);
    let batteryHealthComponent = this.minBatterySOC > 40 ? 100 : Math.round((this.minBatterySOC / 40) * 100);
    let engineeringScoreComponent = healthComponent + batteryHealthComponent;

    // Propellant conservation bonus (up to 100 pts)
    let propRatio = this.initialPropellantKg > 0 ? (this.propellantRemainingKg / this.initialPropellantKg) : 1.0;
    let propellantScoreComponent = Math.round(propRatio * 100);

    let totalScore = scienceScoreComponent + budgetScoreComponent + engineeringScoreComponent + propellantScoreComponent;

    if (!isSuccess) {
      totalScore = Math.min(320, Math.round(totalScore * 0.35));
    }

    // Determine Letter Grade
    let grade = 'F';
    let gradeLabel = 'Mission Lost / Pre-mature Abort';
    let gradeBadge = 'grade-f';

    if (totalScore >= 900) {
      grade = 'S';
      gradeLabel = 'NASA Flagship Distinction';
      gradeBadge = 'grade-s';
    } else if (totalScore >= 750) {
      grade = 'A';
      gradeLabel = 'Full Mission Success';
      gradeBadge = 'grade-a';
    } else if (totalScore >= 550) {
      grade = 'B';
      gradeLabel = 'Primary Science Criteria Met';
      gradeBadge = 'grade-b';
    } else if (totalScore >= 350) {
      grade = 'C';
      gradeLabel = 'Degraded Operations / Partial Return';
      gradeBadge = 'grade-c';
    }

    // Lessons learned analysis
    const debriefNotes = [];
    if (scienceFulfillmentRatio >= 1.0) {
      debriefNotes.push({ type: 'good', text: `Primary science goals fully attained: ${sciencePoints} science score collected.` });
    } else {
      debriefNotes.push({ type: 'warn', text: `Science return fell short of scenario target (${sciencePoints} / ${science.targetScore}). Consider adding complementary spectrometers or radar.` });
    }

    if (this.minBatterySOC < 35.0) {
      debriefNotes.push({ type: 'warn', text: `Battery Depth-of-Discharge dipped to critical levels (${Math.round(this.minBatterySOC)}% SOC). Increasing battery capacity or shedding non-critical eclipse loads would improve longevity.` });
    } else {
      debriefNotes.push({ type: 'good', text: `Power subsystem operated cleanly: minimum battery reserve remained above ${Math.round(this.minBatterySOC)}%.` });
    }

    if (finance.isWithinBudget) {
      debriefNotes.push({ type: 'good', text: `Fiscal discipline preserved: Mission closed with $${finance.costMargin}M remaining in reserve funds.` });
    } else {
      debriefNotes.push({ type: 'bad', text: `Budget overrun by $${Math.abs(finance.costMargin)}M! NASA programmatic review penalised score.` });
    }

    if (this.bufferPercent >= 95.0) {
      debriefNotes.push({ type: 'warn', text: `Telemetry buffer nearly overflowed during peak science collection. Higher-gain Ka-Band or Optical Laser comms recommended.` });
    }

    if (!isSuccess && failureReason) {
      debriefNotes.unshift({ type: 'bad', text: `FATAL ANOMALY: ${failureReason}` });
    }

    return {
      success: isSuccess,
      score: totalScore,
      grade: grade,
      gradeLabel: gradeLabel,
      gradeBadge: gradeBadge,
      scienceScoreComponent: scienceScoreComponent,
      budgetScoreComponent: budgetScoreComponent,
      engineeringScoreComponent: engineeringScoreComponent,
      propellantScoreComponent: propellantScoreComponent,
      minBatterySOC: Math.round(this.minBatterySOC * 10) / 10,
      finalPropellantKg: Math.round(this.propellantRemainingKg * 10) / 10,
      totalScienceDataGB: Math.round(this.scienceDownlinkedGB * 10) / 10,
      debriefNotes: debriefNotes,
      telemetryHistory: this.telemetryHistory
    };
  }
};
