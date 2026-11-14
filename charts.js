/**
 * Space Mission Design Game - Canvas Telemetry Timeline Charting Engine
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.ChartRenderer = {
  renderTelemetryChart: function(canvas, history) {
    if (!canvas || !history || history.length < 2) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    // Background
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 25;
    const padBottom = 30;

    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    // 1. Draw horizontal grid lines (0%, 25%, 50%, 75%, 100%)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#657786';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    for (let p = 0; p <= 100; p += 25) {
      const y = padTop + plotH - (p / 100.0) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();
      ctx.fillText(`${p}%`, padLeft - 6, y + 3);
    }

    // 2. Draw Eclipse bands in background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    for (let i = 0; i < history.length - 1; i++) {
      if (history[i].inEclipse) {
        const x1 = padLeft + (i / (history.length - 1)) * plotW;
        const x2 = padLeft + ((i + 1) / (history.length - 1)) * plotW;
        ctx.fillRect(x1, padTop, (x2 - x1) + 1, plotH);
      }
    }

    // 3. Draw Battery SOC Curve (Gold Line)
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = padLeft + (i / (history.length - 1)) * plotW;
      const y = padTop + plotH - (Math.max(0, Math.min(100, history[i].batterySOC)) / 100.0) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 4. Draw Buffer Occupied % Curve (Cyan Line)
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let i = 0; i < history.length; i++) {
      const x = padLeft + (i / (history.length - 1)) * plotW;
      const y = padTop + plotH - (Math.max(0, Math.min(100, history[i].bufferPercent)) / 100.0) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 5. Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(padLeft + 10, 10, 10, 10);
    ctx.fillText('Battery SOC (%)', padLeft + 25, 18);

    ctx.fillStyle = '#00ffcc';
    ctx.fillRect(padLeft + 140, 10, 10, 10);
    ctx.fillText('SSR Data Buffer (%)', padLeft + 155, 18);

    ctx.fillStyle = '#888888';
    ctx.fillRect(padLeft + 290, 10, 10, 10);
    ctx.fillText('Shaded = Planetary Eclipse', padLeft + 305, 18);

    // X-Axis Label
    ctx.fillStyle = '#657786';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION ORBITS TIMELINE →', padLeft + plotW * 0.5, h - 8);
  }
};
