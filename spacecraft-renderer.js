/**
 * Space Mission Design Game - Spacecraft Schematic Visualizer
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.SpacecraftRenderer = function(canvasElement) {
  this.canvas = canvasElement;
  this.ctx = canvasElement.getContext('2d');
};

window.SpaceMissionGame.SpacecraftRenderer.prototype = {
  render: function(model, telemetry) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear blueprint grid background
    ctx.fillStyle = '#0a101d';
    ctx.fillRect(0, 0, w, h);

    // Draw technical grid lines
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const cx = w * 0.5;
    const cy = h * 0.52;

    const C = window.SpaceMissionGame.COMPONENTS;
    const bus = C.buses[model.busId] || C.buses['smallsat-150'];
    const pwr = C.powerGeneration[model.powerGenId] || C.powerGeneration['solar-deploy-gaas'];
    const prop = C.propulsion[model.propulsionId] || C.propulsion['prop-monoprop'];
    const comm = C.communications[model.commsId] || C.communications['comm-xband'];

    // 1. Draw Solar Panels or RTG
    if (pwr.isNuclear) {
      // Nuclear MMRTG: Glowing thermal cylinder with cooling fins
      const rtgW = 28;
      const rtgH = 46;
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(cx - 75, cy - 23, rtgW, rtgH);
      // Thermal radioactive core glow
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(cx - 70, cy - 18, 18, 36);

      // Label
      ctx.fillStyle = '#f39c12';
      ctx.font = '10px monospace';
      ctx.fillText('MMRTG (Pu-238)', cx - 110, cy - 30);
    } else {
      // Solar wings: scale based on array area
      const wingSpan = Math.min(180, Math.max(45, pwr.areaM2 * 7.5));
      const wingHeight = Math.min(65, Math.max(25, pwr.areaM2 * 2.8));

      // Left Solar Wing
      this.drawSolarWing(ctx, cx - 45 - wingSpan, cy - wingHeight * 0.5, wingSpan, wingHeight);
      // Right Solar Wing
      this.drawSolarWing(ctx, cx + 45, cy - wingHeight * 0.5, wingSpan, wingHeight);

      // Cross booms
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 45, cy);
      ctx.lineTo(cx - 30, cy);
      ctx.moveTo(cx + 30, cy);
      ctx.lineTo(cx + 45, cy);
      ctx.stroke();
    }

    // 2. Draw Main Spacecraft Bus Structure
    let busW = 60;
    let busH = 80;
    if (model.busId === 'cubesat-12u') {
      busW = 40;
      busH = 65;
    } else if (model.busId === 'flagship-bus') {
      busW = 85;
      busH = 115;
    }

    // Gold/Titanium Foil Bus
    const busGrad = ctx.createLinearGradient(cx - busW/2, cy, cx + busW/2, cy);
    busGrad.addColorStop(0, '#cda34f');
    busGrad.addColorStop(0.5, '#e5c158');
    busGrad.addColorStop(1, '#9e792f');
    ctx.fillStyle = busGrad;
    ctx.fillRect(cx - busW/2, cy - busH/2, busW, busH);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - busW/2, cy - busH/2, busW, busH);

    // 3. Propulsion Thruster Nozzle at bottom
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + busH/2);
    ctx.lineTo(cx + 14, cy + busH/2);
    ctx.lineTo(cx + 20, cy + busH/2 + 22);
    ctx.lineTo(cx - 20, cy + busH/2 + 22);
    ctx.closePath();
    ctx.fill();

    // Thruster exhaust flame (pulsing)
    if (telemetry && (telemetry.isThrusting || Math.random() < 0.15)) {
      ctx.fillStyle = prop.id === 'prop-hall-electric' ? '#00e5ff' : '#ff9800';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + busH/2 + 22);
      ctx.lineTo(cx + 10, cy + busH/2 + 22);
      ctx.lineTo(cx, cy + busH/2 + 38 + Math.random() * 8);
      ctx.closePath();
      ctx.fill();
    }

    // 4. Draw Antenna (Top deck or offset)
    if (comm.id === 'comm-kaband' || comm.id === 'comm-xband') {
      // Parabolic Dish
      const dishRadius = comm.id === 'comm-kaband' ? 32 : 22;
      ctx.save();
      ctx.translate(cx, cy - busH/2);
      ctx.strokeStyle = '#bdc3c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -dishRadius * 0.7, dishRadius, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Feed horn
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(0, -dishRadius * 1.2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -dishRadius * 0.4);
      ctx.lineTo(0, -dishRadius * 1.2);
      ctx.stroke();
      ctx.restore();
    } else if (comm.id === 'comm-optical-laser') {
      // Optical Laser Telescope aperture
      ctx.fillStyle = '#1abc9c';
      ctx.fillRect(cx - 8, cy - busH/2 - 24, 16, 24);
      ctx.beginPath();
      ctx.arc(cx, cy - busH/2 - 24, 8, Math.PI, 0);
      ctx.fill();
    } else {
      // S-band omni whip
      ctx.strokeStyle = '#ecf0f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - busH/2);
      ctx.lineTo(cx + 18, cy - busH/2 - 25);
      ctx.stroke();
    }

    // 5. Scientific Instruments mounted to Payload Deck
    const instList = model.selectedInstrumentIds;
    instList.forEach((instId, idx) => {
      const offsetX = (idx - (instList.length - 1) / 2) * 22;
      const instY = cy - busH/2 + 10;

      if (instId === 'inst-optical-imager' || instId === 'inst-ir-spectrometer') {
        // Optical telescope cylinder pointing downwards
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(cx + offsetX - 6, instY, 12, 18);
        ctx.fillStyle = '#3498db'; // Lens glass
        ctx.beginPath();
        ctx.arc(cx + offsetX, instY + 18, 5, 0, Math.PI);
        ctx.fill();
      } else if (instId === 'inst-sar-radar') {
        // Folded planar SAR antenna boom
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(cx - busW/2 - 14, cy - 8, 12, 35);
      } else if (instId === 'inst-plasma-magnetometer') {
        // Extended magnetometer boom
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + busW/2 + 35, cy - 35);
        ctx.stroke();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(cx + busW/2 + 35, cy - 35, 3.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // General sensor housing
        ctx.fillStyle = '#9b59b6';
        ctx.fillRect(cx + offsetX - 5, instY, 10, 10);
      }
    });

    // 6. ADCS Star Tracker Baffle & Reaction Wheel schematic markers
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - busW/2 + 4, cy - 12, 8, 14); // Star tracker baffle
    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2); // Reaction wheel hub
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 7. Spacecraft Name & Subsystem Labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(model.spacecraftName.toUpperCase(), cx, 28);

    ctx.fillStyle = '#8fa3bf';
    ctx.font = '10px monospace';
    ctx.fillText(`${bus.name} | ${pwr.tech} | ${prop.name}`, cx, 44);
    ctx.textAlign = 'left';
  },

  drawSolarWing: function(ctx, x, y, w, h) {
    // Solar cell substrate
    ctx.fillStyle = '#0f2444';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Grid cells
    const cellW = 12;
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.4)';
    ctx.lineWidth = 1;
    for (let cx = x + cellW; cx < x + w; cx += cellW) {
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(cx, y + h);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.5);
    ctx.lineTo(x + w, y + h * 0.5);
    ctx.stroke();
  }
};
