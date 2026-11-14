/**
 * Space Mission Design Game - 2D Canvas Orbital Simulation Visualizer
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.OrbitRenderer = function(canvasElement) {
  this.canvas = canvasElement;
  this.ctx = canvasElement.getContext('2d');
  this.stars = [];
  this.initStars();
};

window.SpaceMissionGame.OrbitRenderer.prototype = {
  initStars: function() {
    this.stars = [];
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  },

  render: function(telemetry, model) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear background (Deep Space void)
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, w, h);

    // Draw twinkling starfield
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      ctx.globalAlpha = s.alpha * (0.8 + 0.2 * Math.sin(Date.now() * 0.003 + i));
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    const centerX = w * 0.5;
    const centerY = h * 0.5;

    // Direction of sunlight: coming from the left
    const sunAngle = Math.PI; // coming from -x (left)

    // Orbital radius on canvas
    const bodyRadius = Math.min(w, h) * 0.16;
    const orbitRadius = Math.min(w, h) * 0.36;

    // 1. Draw Sunlight Rays from the left
    const sunGrad = ctx.createLinearGradient(0, centerY, centerX, centerY);
    sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.15)');
    sunGrad.addColorStop(1, 'rgba(255, 235, 180, 0.0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, centerY - orbitRadius * 1.1, centerX, orbitRadius * 2.2);

    // 2. Draw Planet Shadow Umbra Cone (on the right)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - bodyRadius * 0.98);
    ctx.lineTo(w, centerY - bodyRadius * 1.3);
    ctx.lineTo(w, centerY + bodyRadius * 1.3);
    ctx.lineTo(centerX, centerY + bodyRadius * 0.98);
    ctx.closePath();
    const shadowGrad = ctx.createLinearGradient(centerX, centerY, w, centerY);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.90)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();
    ctx.restore();

    // 3. Draw Orbit Path Ellipse/Circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, orbitRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(74, 144, 226, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 4. Draw Central Celestial Body
    this.drawPlanet(ctx, centerX, centerY, bodyRadius, model.scenario.targetBody);

    // 5. Draw Ground Tracking Station on planet surface
    const gsAngle = (Date.now() * 0.0003) % (Math.PI * 2);
    const gsX = centerX + Math.cos(gsAngle) * bodyRadius;
    const gsY = centerY + Math.sin(gsAngle) * bodyRadius;

    ctx.fillStyle = '#00ffcc';
    ctx.beginPath();
    ctx.arc(gsX, gsY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 6. Calculate Spacecraft Position from orbitalPhase
    // phase = 0 is left (subsolar point), phase = 0.5 is right (deep eclipse)
    const phase = telemetry.orbitalPhase || 0;
    const satAngle = Math.PI - (phase * Math.PI * 2); // counter-clockwise orbit
    const satX = centerX + Math.cos(satAngle) * orbitRadius;
    const satY = centerY + Math.sin(satAngle) * orbitRadius;

    // 7. Draw RF Telemetry Link beam if in ground contact
    if (telemetry.orbitState && telemetry.orbitState.inGroundContact) {
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(gsX, gsY);
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.75)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Signal wave circle
      ctx.beginPath();
      ctx.arc(satX, satY, 14 + (Math.sin(Date.now() * 0.015) * 4), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 8. Draw Spacecraft Icon
    ctx.save();
    ctx.translate(satX, satY);
    ctx.rotate(satAngle + Math.PI / 2); // point prograde

    // Solar panels (blue rectangles)
    ctx.fillStyle = '#1c6dd0';
    ctx.fillRect(-14, -3, 8, 6);
    ctx.fillRect(6, -3, 8, 6);

    // Main bus body (gold/silver foil)
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-5, -6, 10, 12);

    // Antenna dish
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.arc(0, -7, 4, Math.PI, 0);
    ctx.fill();

    // Eclipse status halo
    if (telemetry.orbitState && telemetry.orbitState.inEclipse) {
      ctx.strokeStyle = '#e74c3c'; // Red ring when in dark eclipse
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeStyle = '#2ecc71'; // Green ring when in sunlight
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // 9. Overlay HUD Telemetry Text
    ctx.fillStyle = '#8fa3bf';
    ctx.font = '12px "Space Mono", monospace, sans-serif';
    ctx.fillText(`TARGET BODY: ${model.scenario.targetBody.toUpperCase()}`, 15, 25);
    ctx.fillText(`ALTITUDE: ${window.SpaceMissionGame.COMPONENTS.orbits[model.orbitId].altitudeKm} KM`, 15, 42);

    const statusText = telemetry.orbitState && telemetry.orbitState.inEclipse ? '🌑 IN PLANETARY ECLIPSE (UMBRA)' : '☀️ IN FULL SUNLIGHT';
    const statusColor = telemetry.orbitState && telemetry.orbitState.inEclipse ? '#ff6b6b' : '#51cf66';
    ctx.fillStyle = statusColor;
    ctx.fillText(statusText, 15, 60);

    const commText = telemetry.orbitState && telemetry.orbitState.inGroundContact ? '📡 DSN LINK: ACTIVE DOWNLINK' : '📶 DSN LINK: STANDBY / ACQUISITION';
    ctx.fillStyle = telemetry.orbitState && telemetry.orbitState.inGroundContact ? '#00ffcc' : '#8fa3bf';
    ctx.fillText(commText, 15, 78);
  },

  drawPlanet: function(ctx, x, y, r, bodyName) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();

    if (bodyName === 'Earth') {
      // Oceans
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#3a88e9');
      grad.addColorStop(0.7, '#1b4b8a');
      grad.addColorStop(1, '#0e2444');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Continents (stylized green/brown patches)
      ctx.fillStyle = 'rgba(76, 175, 80, 0.75)';
      ctx.beginPath();
      ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + r * 0.3, y + r * 0.2, r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(x - r * 0.1, y + r * 0.3, r * 0.5, 0, Math.PI * 2);
      ctx.fill();

    } else if (bodyName === 'Moon') {
      // Moon surface
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#c2c9d1');
      grad.addColorStop(1, '#565f69');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Craters
      ctx.fillStyle = 'rgba(40, 45, 52, 0.35)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + r * 0.2, y + r * 0.3, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x - r * 0.1, y + r * 0.4, r * 0.15, 0, Math.PI * 2);
      ctx.fill();

    } else if (bodyName === 'Mars') {
      // Red Planet
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#e67e45');
      grad.addColorStop(0.7, '#c0392b');
      grad.addColorStop(1, '#782015');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Dark volcanic maria
      ctx.fillStyle = 'rgba(74, 25, 18, 0.45)';
      ctx.beginPath();
      ctx.ellipse(x, y + r * 0.1, r * 0.6, r * 0.3, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // White polar ice cap
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y - r * 0.85, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

    } else if (bodyName === 'Europa') {
      // Ice surface with brown fracture lineaments
      const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      grad.addColorStop(0, '#f5efe6');
      grad.addColorStop(0.7, '#d5c4a1');
      grad.addColorStop(1, '#8c7b60');
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);

      // Cycloidal ridge cracks
      ctx.strokeStyle = 'rgba(168, 86, 48, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y - r * 0.3);
      ctx.bezierCurveTo(x - r * 0.2, y - r * 0.6, x + r * 0.2, y + r * 0.2, x + r * 0.8, y + r * 0.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - r * 0.7, y + r * 0.5);
      ctx.bezierCurveTo(x, y + r * 0.1, x + r * 0.4, y - r * 0.4, x + r * 0.6, y - r * 0.7);
      ctx.stroke();
    }

    // Shadow on the right side of the planet (day/night line)
    const dayNightGrad = ctx.createLinearGradient(x - r * 0.4, y, x + r, y);
    dayNightGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    dayNightGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.4)');
    dayNightGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
    ctx.fillStyle = dayNightGrad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);

    ctx.restore();

    // Atmosphere halo
    if (bodyName === 'Earth' || bodyName === 'Mars') {
      ctx.beginPath();
      ctx.arc(x, y, r * 1.04, 0, Math.PI * 2);
      ctx.strokeStyle = bodyName === 'Earth' ? 'rgba(74, 144, 226, 0.35)' : 'rgba(230, 126, 34, 0.25)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
};
