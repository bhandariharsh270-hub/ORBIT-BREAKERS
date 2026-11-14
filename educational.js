/**
 * Space Mission Design Game - Educational Engineering Handbook & NASA Concepts
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.EDUCATIONAL_GUIDES = [
  {
    id: 'tsiolkovsky-rocket-equation',
    title: 'The Rocket Equation & Delta-V (Δv)',
    category: 'Astrodynamics & Propulsion',
    formula: 'Δv = Isp · g₀ · ln(m₀ / mf)',
    summary: 'The fundamental law governing all spaceflight maneuverability.',
    content: `
      <p>In space, there is nothing to push against except the propellant you expel out of your rocket nozzle. The <strong>Tsiolkovsky Rocket Equation</strong> dictates how much velocity change (<strong>Δv</strong>, delta-v) a spacecraft can achieve:</p>
      <div class="handbook-equation">Δv = I_{sp} \\cdot g_0 \\cdot \\ln\\left(\\frac{m_0}{m_f}\\right)</div>
      <ul>
        <li><strong>m₀ (Initial / Wet Mass):</strong> Total mass of the spacecraft including dry structure, science instruments, and all propellant.</li>
        <li><strong>mf (Final / Dry Mass):</strong> Mass remaining after burning propellant.</li>
        <li><strong>Isp (Specific Impulse):</strong> Fuel efficiency of the thruster in seconds. A higher Isp means you get far more push per kilogram of fuel!</li>
        <li><strong>g₀ (Standard Gravity):</strong> 9.80665 m/s².</li>
      </ul>
      <p><strong>The Engineering Trade-off:</strong> Chemical thrusters (like Hydrazine, Isp ≈ 230-320s) deliver fast, powerful thrust to enter orbit quickly, but require enormous amounts of fuel. Electric Hall-effect ion thrusters (Isp ≈ 3100s) use 10x less fuel for the same Δv, but produce tiny micro-thrust and demand huge electrical power from your solar panels!</p>
    `
  },

  {
    id: 'orbital-mechanics-eclipses',
    title: 'Orbits, Velocities & The Day/Night Eclipse Cycle',
    category: 'Orbital Mechanics',
    formula: 'T = 2π √(a³ / μ)',
    summary: 'Why Low Earth satellites spend over a third of every orbit in total darkness.',
    content: `
      <p>An orbit is not a place with zero gravity—it is a continuous state of freefall where horizontal velocity matches the curvature of the planet beneath you.</p>
      <ul>
        <li><strong>Low Earth Orbit (LEO, 400-800 km):</strong> Orbital velocity is ~7.6 km/s (27,000 km/h). One complete revolution takes only ~90 to 98 minutes.</li>
        <li><strong>Orbital Eclipses (Umbra):</strong> Because Earth is a solid sphere blocking the Sun, a LEO satellite enters planetary shadow once every orbit. For ~35 minutes out of every 98-minute orbit, solar panels produce <strong>exactly 0 Watts</strong>!</li>
        <li><strong>Geostationary Orbit (GEO, 35,786 km):</strong> At this altitude, the orbital period exactly matches Earth’s 24-hour rotation, keeping the satellite stationary relative to the ground. Eclipses here only occur briefly during spring and autumn equinoxes.</li>
      </ul>
      <p><strong>The Engineering Trade-off:</strong> If your mission flies in LEO or low lunar orbit, your batteries must store enough energy during the sunny pass to keep all heaters, computers, and sensors alive during the long eclipse without draining below safe limits!</p>
    `
  },

  {
    id: 'inverse-square-law',
    title: 'Solar Power & The Inverse-Square Law (1/r²)',
    category: 'Power Systems',
    formula: 'Φ_solar = Φ₀ / r_AU²',
    summary: 'Why sunlight diminishes rapidly as you journey outward through the solar system.',
    content: `
      <p>Sunlight spreads outward in a spherical shell from the Sun. As the distance (<em>r</em>) increases, the energy per square meter drops by the square of that distance (<strong>1/r²</strong>):</p>
      <div class="handbook-equation">\\Phi_{solar} = \\frac{1361 \\text{ W/m}^2}{r_{AU}^2}</div>
      <ul>
        <li><strong>Earth (1.0 AU):</strong> Solar constant ≈ <strong>1,361 W/m²</strong>. Modest deployable solar arrays provide abundant power.</li>
        <li><strong>Mars (1.52 AU):</strong> Solar constant ≈ <strong>589 W/m²</strong> (only ~43% of Earth!). Solar panels must be more than twice as large to deliver the same power.</li>
        <li><strong>Jupiter / Europa (5.2 AU):</strong> Solar constant ≈ <strong>50.3 W/m²</strong> (only ~3.7% of Earth!). Solar panels must be over 27 times larger, or you must switch to a <strong>Radioisotope Thermoelectric Generator (RTG)</strong>.</li>
      </ul>
      <p><strong>The Engineering Trade-off:</strong> While an RTG powered by Plutonium-238 provides continuous, eclipse-proof electricity anywhere in the cosmos, it is exceptionally expensive ($70M+) and heavy.</p>
    `
  },

  {
    id: 'battery-depth-of-discharge',
    title: 'Battery Depth-of-Discharge (DoD) & Thermal Health',
    category: 'Energy Storage',
    formula: 'DoD (%) = (E_consumed / E_capacity) · 100',
    summary: 'How aggressive battery usage can shorten a multi-million-dollar spacecraft lifetime.',
    content: `
      <p>Spacecraft batteries do not operate like smartphone batteries. While you might drain your phone to 5% without immediate catastrophe, an orbital satellite undergoes <strong>5,500 eclipse charge/discharge cycles every single year</strong> in LEO!</p>
      <ul>
        <li><strong>Depth-of-Discharge (DoD):</strong> The percentage of total battery capacity consumed during an eclipse pass.</li>
        <li><strong>Safe Operational Margin:</strong> Standard space-grade Lithium-Ion batteries are rated for DoD ≤ 25-40% for missions lasting 5-10 years.</li>
        <li><strong>Critical Limit (DoD > 65-70%):</strong> Repeated deep discharges cause internal cathode micro-cracking, lithium dendrite formation, and permanent cell capacity collapse.</li>
      </ul>
      <p><strong>The Engineering Trade-off:</strong> Choosing a larger battery pack adds dry mass, which reduces propellant margin or forces an upgrade to a more expensive launch vehicle.</p>
    `
  },

  {
    id: 'link-budgets-and-downlink',
    title: 'Data Telemetry, Frequency Bands & Ground Networks',
    category: 'Communications',
    formula: 'E_b / N_0 = P_t + G_t + G_r - FSPL - k - T - R',
    summary: 'How data generated by scientific instruments reaches scientists on the ground.',
    content: `
      <p>Collecting scientific discoveries is pointless if the data cannot be beamed back to Earth. The rate at which bits can travel depends on transmitter power, antenna diameter, carrier frequency, and distance:</p>
      <ul>
        <li><strong>S-Band (2-4 GHz):</strong> Wide beam angle, very reliable, but low bandwidth (1-5 Mbps). Great for command uplinks and health telemetry.</li>
        <li><strong>X-Band (8-12 GHz):</strong> Balanced workhorse for deep space imaging and planetary orbiters (20-50 Mbps).</li>
        <li><strong>Ka-Band (26-40 GHz):</strong> Ultra-high bandwidth (100-300+ Mbps), but highly sensitive to atmospheric rain attenuation and demands precision spacecraft pointing.</li>
        <li><strong>Optical Laser Communications (DSOC):</strong> Beams infrared laser photons across space at gigabit speeds, but requires sub-arcsecond pointing accuracy with star trackers.</li>
      </ul>
      <p><strong>The Solid-State Recorder (SSR) Bottleneck:</strong> If your instruments (like radar and multispectral cameras) generate data faster than your antenna downlinks it during ground station contact passes, your onboard buffer fills up. Once full, new science data is dropped and lost forever!</p>
    `
  },

  {
    id: 'systems-engineering-tradeoffs',
    title: 'The Systems Engineering Ripple Effect',
    category: 'Systems Engineering',
    formula: 'ΔM_total = ΔM_payload · (1 + k_structure + k_power + k_propellant)',
    summary: 'Why adding a 10 kg camera can snowball into a $50 million cost overrun.',
    content: `
      <p>Real-world aerospace engineering is ruled by the interconnected <strong>Systems Ripple Effect</strong>:</p>
      <ol>
        <li>You decide to add an advanced <strong>Synthetic Aperture Radar</strong> (+75 kg, +450 W).</li>
        <li>To power 450 W continuously, you must upgrade your solar panels (+50 kg).</li>
        <li>To survive the 35-minute eclipse while powering that radar, you must install a larger battery (+30 kg).</li>
        <li>To support that extra weight, the primary bus structure must be reinforced (+40 kg).</li>
        <li>Now that dry mass increased by ~195 kg, you need <strong>300 kg more propellant</strong> to achieve the required Delta-V to reach Mars!</li>
        <li>The total wet mass now exceeds the payload capacity of your budget rocket, forcing an upgrade to a Heavy-Lift rocket (+ $55M cost)!</li>
      </ol>
      <p><strong>Key Takeaway:</strong> Successful mission designers don’t just maximize capability—they ruthlessly optimize balance and margin.</p>
    `
  }
];
