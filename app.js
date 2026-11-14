/**
 * Space Mission Design Game - Application Controller
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

document.addEventListener('DOMContentLoaded', function() {
  const game = {
    model: new window.SpaceMissionGame.MissionModel('earth-climate'),
    team: new window.SpaceMissionGame.TeamManager(),
    simulator: null,
    orbitRenderer: null,
    spacecraftRenderer: null,

    init: function() {
      // Initialize renderers
      const orbitCanvas = document.getElementById('orbit-canvas');
      if (orbitCanvas) {
        this.orbitRenderer = new window.SpaceMissionGame.OrbitRenderer(orbitCanvas);
      }

      const scCanvas = document.getElementById('spacecraft-canvas');
      if (scCanvas) {
        this.spacecraftRenderer = new window.SpaceMissionGame.SpacecraftRenderer(scCanvas);
      }

      // Populate UI Catalogs
      this.populateScenarios();
      this.populateComponents();
      this.populateHandbook();
      this.initTeamUI();

      // Bind Event Listeners
      this.bindEvents();

      // Initial Refresh
      this.refreshAllUI();
    },

    bindEvents: function() {
      const self = this;

      // Tab navigation
      const navButtons = document.querySelectorAll('.nav-tab-btn');
      navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const tabId = this.getAttribute('data-tab');
          self.switchTab(tabId);
          window.SpaceMissionGame.Audio.playClick();
        });
      });

      // Audio Mute toggle
      const muteBtn = document.getElementById('btn-toggle-audio');
      if (muteBtn) {
        muteBtn.addEventListener('click', function() {
          const isMuted = window.SpaceMissionGame.Audio.toggleMute();
          muteBtn.innerHTML = isMuted ? '🔇 Audio: Muted' : '🔊 Audio: Active';
        });
      }

      // Team Mode toggle
      const teamToggle = document.getElementById('team-mode-toggle');
      if (teamToggle) {
        teamToggle.addEventListener('change', function() {
          self.team.setTeamMode(this.checked);
          self.updateTeamWorkstationVisibility();
          self.refreshValidation();
        });
      }

      // Spacecraft Name Input
      const scNameInput = document.getElementById('input-spacecraft-name');
      if (scNameInput) {
        scNameInput.addEventListener('input', function() {
          self.model.spacecraftName = this.value || 'Sentinel-Alpha';
          self.refreshSpacecraftView();
        });
      }

      // Launch Mission Button
      const launchBtn = document.getElementById('btn-launch-mission');
      if (launchBtn) {
        launchBtn.addEventListener('click', function() {
          self.initiateLaunch();
        });
      }

      // Simulation Controls
      const simPlayPauseBtn = document.getElementById('btn-sim-play-pause');
      if (simPlayPauseBtn) {
        simPlayPauseBtn.addEventListener('click', function() {
          if (!self.simulator) return;
          if (self.simulator.isPaused) {
            self.simulator.resume();
            this.textContent = '⏸ Pause Flight';
          } else {
            self.simulator.pause();
            this.textContent = '▶ Resume Flight';
          }
        });
      }

      // Sim Speed Buttons
      const speedBtns = document.querySelectorAll('.btn-sim-speed');
      speedBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          speedBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          const speed = parseInt(this.getAttribute('data-speed'), 10);
          if (self.simulator) self.simulator.setSpeed(speed);
        });
      });

      // Abort Flight
      const abortBtn = document.getElementById('btn-sim-abort');
      if (abortBtn) {
        abortBtn.addEventListener('click', function() {
          if (confirm('Authorize Emergency Flight Abort? Telemetry collected so far will be evaluated.')) {
            if (self.simulator) self.simulator.finish(false, 'Manual Mission Abort commanded by Flight Director.');
          }
        });
      }

      // Export Mission JSON
      const exportBtn = document.getElementById('btn-export-mission');
      if (exportBtn) {
        exportBtn.addEventListener('click', function() {
          self.exportMissionJSON();
        });
      }

      // Import Mission JSON
      const importInput = document.getElementById('input-import-mission');
      if (importInput) {
        importInput.addEventListener('change', function(e) {
          self.importMissionJSON(e);
        });
      }

      // Print Certificate Button
      const printBtn = document.getElementById('btn-print-certificate');
      if (printBtn) {
        printBtn.addEventListener('click', function() {
          window.print();
        });
      }
    },

    switchTab: function(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.nav-tab-btn').forEach(el => el.classList.remove('active'));

      const targetTab = document.getElementById(tabId);
      const targetBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabId}"]`);
      if (targetTab) targetTab.classList.add('active');
      if (targetBtn) targetBtn.classList.add('active');

      if (tabId === 'tab-spacecraft') {
        this.refreshSpacecraftView();
      }
    },

    populateScenarios: function() {
      const container = document.getElementById('scenarios-container');
      if (!container) return;
      container.innerHTML = '';

      const scenarios = window.SpaceMissionGame.SCENARIOS;
      const self = this;

      Object.keys(scenarios).forEach(key => {
        const sc = scenarios[key];
        const card = document.createElement('div');
        card.className = `scenario-card ${self.model.scenarioId === sc.id ? 'selected' : ''}`;
        card.setAttribute('data-id', sc.id);

        card.innerHTML = `
          <div class="card-header">
            <div>
              <span class="badge ${sc.difficultyBadge}">${sc.difficulty.toUpperCase()}</span>
              <h3 class="scenario-title">${sc.name}</h3>
              <div class="scenario-subtitle">${sc.subtitle}</div>
            </div>
            <div class="scenario-body-badge">🪐 ${sc.targetBody}</div>
          </div>
          <p class="scenario-desc">${sc.summary}</p>
          <div class="scenario-specs">
            <div class="spec-item"><span class="spec-label">Budget Cap:</span> <span class="spec-val">$${sc.budget}M</span></div>
            <div class="spec-item"><span class="spec-label">Science Goal:</span> <span class="spec-val">${sc.minScienceScore} pts</span></div>
            <div class="spec-item"><span class="spec-label">Solar Constant:</span> <span class="spec-val">${sc.environment.solarConstant} W/m²</span></div>
            <div class="spec-item"><span class="spec-label">Radiation:</span> <span class="spec-val">${sc.environment.radiationLevel}</span></div>
          </div>
        `;

        card.addEventListener('click', function() {
          document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          self.model.setScenario(sc.id);
          self.team.resetAllGo();
          self.refreshAllUI();
          window.SpaceMissionGame.Audio.playClick();
        });

        container.appendChild(card);
      });
    },

    populateComponents: function() {
      const C = window.SpaceMissionGame.COMPONENTS;
      const self = this;

      // 1. Buses
      this.renderRadioGroup('bus-options', C.buses, this.model.busId, function(id) {
        self.model.busId = id;
        self.refreshAllUI();
      });

      // 2. Power Gen
      this.renderRadioGroup('power-gen-options', C.powerGeneration, this.model.powerGenId, function(id) {
        self.model.powerGenId = id;
        self.refreshAllUI();
      });

      // 3. Batteries
      this.renderRadioGroup('battery-options', C.batteries, this.model.batteryId, function(id) {
        self.model.batteryId = id;
        self.refreshAllUI();
      });

      // 4. Propulsion
      this.renderRadioGroup('propulsion-options', C.propulsion, this.model.propulsionId, function(id) {
        self.model.propulsionId = id;
        self.refreshAllUI();
      });

      // 5. ADCS
      this.renderRadioGroup('adcs-options', C.adcs, this.model.adcsId, function(id) {
        self.model.adcsId = id;
        self.refreshAllUI();
      });

      // 6. Comms
      this.renderRadioGroup('comms-options', C.communications, this.model.commsId, function(id) {
        self.model.commsId = id;
        self.refreshAllUI();
      });

      // 7. Thermal
      this.renderRadioGroup('thermal-options', C.thermalShielding, this.model.thermalId, function(id) {
        self.model.thermalId = id;
        self.refreshAllUI();
      });

      // 8. Launch Vehicles
      this.renderRadioGroup('lv-options', C.launchVehicles, this.model.launchVehicleId, function(id) {
        self.model.launchVehicleId = id;
        self.refreshAllUI();
      });

      // 9. Orbits
      this.renderOrbitOptions();

      // 10. Instruments Checkboxes
      this.renderInstrumentOptions();
    },

    renderRadioGroup: function(containerId, items, selectedId, onSelect) {
      const container = document.getElementById(containerId);
      if (!container) return;
      container.innerHTML = '';

      Object.keys(items).forEach(key => {
        const item = items[key];
        const card = document.createElement('div');
        card.className = `component-card ${item.id === selectedId ? 'selected' : ''}`;
        card.setAttribute('data-id', item.id);

        let detailsHtml = '';
        if (item.mass !== undefined) detailsHtml += `<span class="badge badge-meta">Mass: ${item.mass} kg</span> `;
        if (item.dryMass !== undefined) detailsHtml += `<span class="badge badge-meta">Dry: ${item.dryMass} kg</span> `;
        if (item.cost !== undefined) detailsHtml += `<span class="badge badge-meta">$${item.cost}M</span> `;
        if (item.isp) detailsHtml += `<span class="badge badge-meta">Isp: ${item.isp}s</span> `;
        if (item.capacityWh) detailsHtml += `<span class="badge badge-meta">${item.capacityWh} Wh</span> `;
        if (item.maxDataRateMbps) detailsHtml += `<span class="badge badge-meta">${item.maxDataRateMbps} Mbps</span> `;
        if (item.payloadToLEOKg) detailsHtml += `<span class="badge badge-meta">LEO: ${item.payloadToLEOKg} kg</span> `;

        card.innerHTML = `
          <div class="comp-header">
            <strong>${item.name}</strong>
            <div class="comp-meta">${detailsHtml}</div>
          </div>
          <p class="comp-desc">${item.description || ''}</p>
        `;

        card.addEventListener('click', function() {
          container.querySelectorAll('.component-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          onSelect(item.id);
          window.SpaceMissionGame.Audio.playClick();
        });

        container.appendChild(card);
      });
    },

    renderInstrumentOptions: function() {
      const container = document.getElementById('instruments-options');
      if (!container) return;
      container.innerHTML = '';
      const self = this;
      const instruments = window.SpaceMissionGame.COMPONENTS.instruments;
      const bus = window.SpaceMissionGame.COMPONENTS.buses[this.model.busId];

      const limitNote = document.getElementById('instruments-limit-note');
      if (limitNote) {
        limitNote.textContent = `Selected: ${this.model.selectedInstrumentIds.length} / ${bus.allowedInstrumentsMax} max for ${bus.name}`;
      }

      Object.keys(instruments).forEach(key => {
        const inst = instruments[key];
        const isSelected = self.model.selectedInstrumentIds.includes(inst.id);

        const card = document.createElement('div');
        card.className = `component-card instrument-card ${isSelected ? 'selected' : ''}`;
        card.setAttribute('data-id', inst.id);

        // Check synergy
        const hasSynergy = inst.preferredTargets && inst.preferredTargets.includes(self.model.scenario.targetBody);
        const synergyBadge = hasSynergy ? '<span class="badge badge-synergy">⭐ +25% Primary Target Synergy</span>' : '';

        card.innerHTML = `
          <div class="comp-header">
            <div>
              <strong>${inst.name}</strong>
              ${synergyBadge}
            </div>
            <div class="comp-meta">
              <span class="badge badge-meta">${inst.sciencePoints} pts</span>
              <span class="badge badge-meta">${inst.mass} kg</span>
              <span class="badge badge-meta">${inst.powerDraw} W</span>
              <span class="badge badge-meta">${inst.dataGenRateMbps} Mbps</span>
              <span class="badge badge-meta">$${inst.cost}M</span>
            </div>
          </div>
          <p class="comp-desc">${inst.description}</p>
        `;

        card.addEventListener('click', function() {
          self.model.toggleInstrument(inst.id);
          self.renderInstrumentOptions();
          self.refreshAllUI();
          window.SpaceMissionGame.Audio.playClick();
        });

        container.appendChild(card);
      });
    },

    renderOrbitOptions: function() {
      const container = document.getElementById('orbit-options');
      if (!container) return;
      container.innerHTML = '';
      const self = this;
      const orbits = window.SpaceMissionGame.COMPONENTS.orbits;

      Object.keys(orbits).forEach(key => {
        const orb = orbits[key];
        // Filter orbits based on current target celestial body
        if (orb.targetBody !== self.model.scenario.targetBody && self.model.scenarioId !== 'sandbox') return;

        const card = document.createElement('div');
        card.className = `component-card ${orb.id === self.model.orbitId ? 'selected' : ''}`;
        card.setAttribute('data-id', orb.id);

        card.innerHTML = `
          <div class="comp-header">
            <strong>${orb.name}</strong>
            <div class="comp-meta">
              <span class="badge badge-meta">Δv: ${orb.deltaVRequiredMs} m/s</span>
              <span class="badge badge-meta">Period: ${orb.orbitalPeriodMin}m</span>
              <span class="badge badge-meta">Eclipse: ${Math.round(orb.eclipseFraction * 100)}%</span>
            </div>
          </div>
        `;

        card.addEventListener('click', function() {
          container.querySelectorAll('.component-card').forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          self.model.orbitId = orb.id;
          self.refreshAllUI();
          window.SpaceMissionGame.Audio.playClick();
        });

        container.appendChild(card);
      });
    },

    initTeamUI: function() {
      const container = document.getElementById('team-roles-container');
      if (!container) return;
      container.innerHTML = '';
      const self = this;
      const roles = this.team.roles;

      Object.keys(roles).forEach(key => {
        const r = roles[key];
        const card = document.createElement('div');
        card.className = `team-role-card ${r.badgeClass}`;
        card.setAttribute('data-role', r.id);

        card.innerHTML = `
          <div class="role-header">
            <div>
              <span class="badge badge-callsign">${r.callsign}</span>
              <h4 class="role-title">${r.title}</h4>
            </div>
            <button class="btn-role-signoff ${r.isGo ? 'btn-go' : 'btn-nogo'}" data-role="${r.id}">
              ${r.isGo ? '✅ GO FOR FLIGHT' : '🛑 NO-GO (REVIEWING)'}
            </button>
          </div>
          <div class="role-officer-field">
            <label>Officer Name:</label>
            <input type="text" class="input-officer-name" data-role="${r.id}" value="${r.name}">
          </div>
          <p class="role-desc">${r.description}</p>
          <div class="role-subsystems">
            <strong>Subsystems Supervised:</strong> ${r.subsystems.join(', ')}
          </div>
        `;

        // Officer name edit
        const nameInput = card.querySelector('.input-officer-name');
        nameInput.addEventListener('input', function() {
          self.team.setRoleName(r.id, this.value);
        });

        // Sign off toggle
        const signOffBtn = card.querySelector('.btn-role-signoff');
        signOffBtn.addEventListener('click', function() {
          const isGo = self.team.toggleRoleSignOff(r.id);
          this.className = `btn-role-signoff ${isGo ? 'btn-go' : 'btn-nogo'}`;
          this.textContent = isGo ? '✅ GO FOR FLIGHT' : '🛑 NO-GO (REVIEWING)';
          self.refreshValidation();
        });

        container.appendChild(card);
      });
    },

    updateTeamWorkstationVisibility: function() {
      const teamSection = document.getElementById('team-workstations-panel');
      if (teamSection) {
        teamSection.style.display = this.team.isTeamMode ? 'block' : 'none';
      }
    },

    populateHandbook: function() {
      const container = document.getElementById('handbook-articles-container');
      if (!container) return;
      container.innerHTML = '';

      const guides = window.SpaceMissionGame.EDUCATIONAL_GUIDES;
      guides.forEach(g => {
        const item = document.createElement('div');
        item.className = 'handbook-item';
        item.innerHTML = `
          <div class="handbook-title-bar">
            <div>
              <span class="badge badge-meta">${g.category}</span>
              <h4>${g.title}</h4>
            </div>
            <div class="handbook-formula-pill">${g.formula}</div>
          </div>
          <p class="handbook-summary"><em>${g.summary}</em></p>
          <div class="handbook-body">${g.content}</div>
        `;
        container.appendChild(item);
      });
    },

    // Refresh all HUD meters, validation indicators, and spacecraft canvas
    refreshAllUI: function() {
      this.refreshHUDMeters();
      this.refreshValidation();
      this.refreshSpacecraftView();
    },

    refreshHUDMeters: function() {
      const mass = this.model.computeMassBudget();
      const power = this.model.computePowerBudget();
      const data = this.model.computeDataBudget();
      const finance = this.model.computeFinancialBudget();
      const science = this.model.computeScienceOutput();

      // Mass HUD
      this.setElementText('hud-mass-val', `${mass.wetMass} kg / ${mass.lvCapacityKg} kg`);
      this.setElementText('hud-mass-sub', `Dry: ${mass.dryMass}kg | Fuel: ${mass.propellantMass}kg | Margin: ${mass.massMarginPercent}%`);
      this.setMeterBar('hud-mass-bar', Math.min(100, (mass.wetMass / Math.max(1, mass.lvCapacityKg)) * 100), mass.isMassFeasible);

      // Power HUD
      this.setElementText('hud-power-val', `Gen: ${power.generationWatts}W | Cons: ${power.dayConsumptionWatts}W`);
      this.setElementText('hud-power-sub', `Eclipse: ${power.eclipseDurationMin}m | DoD: ${power.dodPercent}% (Max: ${power.maxRecommendedDoD}%)`);
      this.setMeterBar('hud-power-bar', Math.min(100, power.dodPercent), power.isDoDSafe);

      // Finance HUD
      this.setElementText('hud-budget-val', `$${finance.totalCost}M / $${finance.scenarioCap}M`);
      this.setElementText('hud-budget-sub', `Reserve Margin: $${finance.costMargin}M`);
      this.setMeterBar('hud-budget-bar', Math.min(100, (finance.totalCost / Math.max(1, finance.scenarioCap)) * 100), finance.isWithinBudget);

      // Science HUD
      this.setElementText('hud-science-val', `${science.totalScienceScore} / ${science.targetScore} pts`);
      this.setElementText('hud-science-sub', `Goal Fulfillment: ${Math.round(science.goalRatio * 100)}%`);
      this.setMeterBar('hud-science-bar', Math.min(100, (science.totalScienceScore / Math.max(1, science.targetScore)) * 100), science.meetsScienceTarget);

      // Data HUD
      this.setElementText('hud-data-val', `Gen: ${data.dailyGenGB} GB/day | Downlink: ${data.dailyDownlinkGB} GB/day`);
      this.setElementText('hud-data-sub', `Throughput Ratio: ${data.downlinkCoverageRatio}x`);
    },

    refreshValidation: function() {
      const report = this.model.getValidationReport();
      const container = document.getElementById('validation-checklist-container');
      const launchBtn = document.getElementById('btn-launch-mission');
      const teamAllGo = this.team.allRolesGo();

      if (container) {
        container.innerHTML = '';

        // Critical Violations
        report.criticalViolations.forEach(v => {
          const item = document.createElement('div');
          item.className = 'val-item val-critical';
          item.innerHTML = `<strong>❌ [${v.subsystem}]</strong> ${v.message}`;
          container.appendChild(item);
        });

        // Warnings
        report.warnings.forEach(w => {
          const item = document.createElement('div');
          item.className = 'val-item val-warning';
          item.innerHTML = `<strong>⚠️ [${w.subsystem}]</strong> ${w.message}`;
          container.appendChild(item);
        });

        // Green Passes
        report.greenPasses.forEach(p => {
          const item = document.createElement('div');
          item.className = 'val-item val-pass';
          item.innerHTML = `<strong>✅ [${p.subsystem}]</strong> ${p.message}`;
          container.appendChild(item);
        });
      }

      // Check Launch Eligibility
      const canLaunch = report.isGoForLaunch && teamAllGo;
      if (launchBtn) {
        launchBtn.disabled = !canLaunch;
        if (!report.isGoForLaunch) {
          launchBtn.textContent = '⛔ NO-GO: RESOLVE CRITICAL VIOLATIONS';
          launchBtn.className = 'btn-launch btn-launch-blocked';
        } else if (!teamAllGo) {
          launchBtn.textContent = '🛑 NO-GO: AWAITING TEAM SPECIALIST POLL';
          launchBtn.className = 'btn-launch btn-launch-blocked';
        } else {
          launchBtn.textContent = '🚀 ALL SYSTEMS GO — INITIATE LAUNCH';
          launchBtn.className = 'btn-launch btn-launch-ready';
        }
      }
    },

    refreshSpacecraftView: function() {
      if (this.spacecraftRenderer) {
        this.spacecraftRenderer.render(this.model, null);
      }
    },

    setElementText: function(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    },

    setMeterBar: function(id, percent, isHealthy) {
      const el = document.getElementById(id);
      if (el) {
        el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
        el.className = `meter-fill ${isHealthy ? 'meter-healthy' : 'meter-warning'}`;
      }
    },

    // Initiate Flight Simulation
    initiateLaunch: function() {
      const self = this;
      this.switchTab('tab-simulation');

      window.SpaceMissionGame.Audio.playQuindarTone();

      // Create new simulator instance
      this.simulator = new window.SpaceMissionGame.Simulator(this.model, {
        onTick: function(telemetry) {
          self.updateSimDisplay(telemetry);
        },
        onAnomaly: function(anomaly) {
          self.showAnomalyModal(anomaly);
        },
        onAnomalyResolved: function(choice) {
          self.closeAnomalyModal();
        },
        onComplete: function(scorecard) {
          self.showDebriefModal(scorecard);
        }
      });

      this.simulator.start();
    },

    updateSimDisplay: function(telemetry) {
      // Update Orbit Canvas
      if (this.orbitRenderer) {
        this.orbitRenderer.render(telemetry, this.model);
      }

      // Update Spacecraft Canvas with thrust animation
      if (this.spacecraftRenderer) {
        this.spacecraftRenderer.render(this.model, telemetry);
      }

      // Update Live Sim HUD counters
      this.setElementText('sim-met-val', `${telemetry.missionElapsedHours}h (Orbit ${telemetry.currentOrbit} / ${telemetry.totalOrbits})`);
      this.setElementText('sim-battery-val', `${telemetry.batterySOC}%`);
      this.setMeterBar('sim-battery-bar', telemetry.batterySOC, telemetry.batterySOC > 35);

      this.setElementText('sim-power-val', `${telemetry.powerGenWatts}W / ${telemetry.powerConsWatts}W`);
      this.setElementText('sim-buffer-val', `${telemetry.bufferPercent}%`);
      this.setMeterBar('sim-buffer-bar', telemetry.bufferPercent, telemetry.bufferPercent < 85);

      this.setElementText('sim-data-val', `${telemetry.scienceDownlinkedGB} GB`);
      this.setElementText('sim-propellant-val', `${telemetry.propellantKg} kg`);
      this.setElementText('sim-health-val', `${telemetry.spacecraftHealth}%`);

      // Event log feed
      const logContainer = document.getElementById('sim-event-log-container');
      if (logContainer && this.simulator) {
        logContainer.innerHTML = '';
        this.simulator.eventLog.slice(0, 8).forEach(entry => {
          const div = document.createElement('div');
          div.className = `sim-log-entry log-${entry.type}`;
          div.innerHTML = `<span class="log-time">${entry.time}:</span> ${entry.text}`;
          logContainer.appendChild(div);
        });
      }
    },

    showAnomalyModal: function(anomaly) {
      const modal = document.getElementById('anomaly-modal');
      const title = document.getElementById('anomaly-title');
      const desc = document.getElementById('anomaly-desc');
      const choicesContainer = document.getElementById('anomaly-choices-container');
      if (!modal) return;

      title.innerHTML = `${anomaly.icon} ${anomaly.name}`;
      desc.textContent = anomaly.description;
      choicesContainer.innerHTML = '';

      const self = this;
      anomaly.choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'btn-anomaly-choice';
        btn.innerHTML = `<strong>${ch.label}</strong><p>${ch.description}</p>`;
        btn.addEventListener('click', function() {
          self.simulator.resolveAnomaly(ch.id);
        });
        choicesContainer.appendChild(btn);
      });

      modal.classList.add('visible');
    },

    closeAnomalyModal: function() {
      const modal = document.getElementById('anomaly-modal');
      if (modal) modal.classList.remove('visible');
    },

    showDebriefModal: function(scorecard) {
      const modal = document.getElementById('debrief-modal');
      if (!modal) return;

      this.setElementText('debrief-grade', scorecard.grade);
      const gradeEl = document.getElementById('debrief-grade');
      if (gradeEl) gradeEl.className = `grade-badge ${scorecard.gradeBadge}`;

      this.setElementText('debrief-grade-label', scorecard.gradeLabel);
      this.setElementText('debrief-total-score', `${scorecard.score} / 1000 PTS`);

      this.setElementText('debrief-science-pts', `+${scorecard.scienceScoreComponent} pts`);
      this.setElementText('debrief-budget-pts', `+${scorecard.budgetScoreComponent} pts`);
      this.setElementText('debrief-eng-pts', `+${scorecard.engineeringScoreComponent} pts`);
      this.setElementText('debrief-prop-pts', `+${scorecard.propellantScoreComponent} pts`);

      // Certificate details
      this.setElementText('cert-sc-name', this.model.spacecraftName);
      this.setElementText('cert-mission-type', `${this.model.scenario.name} (${this.model.scenario.targetBody})`);
      this.setElementText('cert-team-lead', this.team.roles['flight-director'].name);
      this.setElementText('cert-grade', `${scorecard.grade} — ${scorecard.gradeLabel}`);
      this.setElementText('cert-date', new Date().toLocaleDateString());

      // Debrief notes
      const notesContainer = document.getElementById('debrief-notes-list');
      if (notesContainer) {
        notesContainer.innerHTML = '';
        scorecard.debriefNotes.forEach(n => {
          const li = document.createElement('li');
          li.className = `debrief-note note-${n.type}`;
          li.textContent = n.text;
          notesContainer.appendChild(li);
        });
      }

      // Render timeline chart
      const chartCanvas = document.getElementById('debrief-telemetry-chart');
      if (chartCanvas && scorecard.telemetryHistory) {
        window.SpaceMissionGame.ChartRenderer.renderTelemetryChart(chartCanvas, scorecard.telemetryHistory);
      }

      modal.classList.add('visible');
    },

    // Export Mission Architecture to JSON
    exportMissionJSON: function() {
      const architecture = {
        meta: {
          app: 'NASA Space Apps Challenge 2026 - Space Mission Design Game',
          version: '1.0.0',
          exportedAt: new Date().toISOString()
        },
        spacecraftName: this.model.spacecraftName,
        scenarioId: this.model.scenarioId,
        configuration: {
          busId: this.model.busId,
          powerGenId: this.model.powerGenId,
          batteryId: this.model.batteryId,
          propulsionId: this.model.propulsionId,
          adcsId: this.model.adcsId,
          commsId: this.model.commsId,
          groundNetworkId: this.model.groundNetworkId,
          thermalId: this.model.thermalId,
          selectedInstrumentIds: this.model.selectedInstrumentIds,
          launchVehicleId: this.model.launchVehicleId,
          orbitId: this.model.orbitId
        },
        team: this.team.roles
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(architecture, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `${this.model.spacecraftName.toLowerCase().replace(/\\s+/g, '-')}-architecture.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    },

    // Import Mission Architecture from JSON
    importMissionJSON: function(e) {
      const file = e.target.files[0];
      if (!file) return;

      const self = this;
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          if (data && data.configuration) {
            self.model.spacecraftName = data.spacecraftName || 'Imported-Probe';
            self.model.setScenario(data.scenarioId || 'earth-climate');
            self.model.busId = data.configuration.busId;
            self.model.powerGenId = data.configuration.powerGenId;
            self.model.batteryId = data.configuration.batteryId;
            self.model.propulsionId = data.configuration.propulsionId;
            self.model.adcsId = data.configuration.adcsId;
            self.model.commsId = data.configuration.commsId;
            self.model.groundNetworkId = data.configuration.groundNetworkId;
            self.model.thermalId = data.configuration.thermalId;
            self.model.selectedInstrumentIds = data.configuration.selectedInstrumentIds || [];
            self.model.launchVehicleId = data.configuration.launchVehicleId;
            self.model.orbitId = data.configuration.orbitId;

            // Update inputs
            const nameInput = document.getElementById('input-spacecraft-name');
            if (nameInput) nameInput.value = self.model.spacecraftName;

            self.populateScenarios();
            self.populateComponents();
            self.refreshAllUI();
            alert('Mission Architecture loaded successfully!');
          }
        } catch (err) {
          alert('Failed to parse mission JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  window.SpaceMissionGame.app = game;
  game.init();
});
