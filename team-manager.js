/**
 * Space Mission Design Game - 4-Player Team Collaboration & Role Management
 * NASA Space Apps Challenge 2026
 */

window.SpaceMissionGame = window.SpaceMissionGame || {};

window.SpaceMissionGame.TeamManager = function() {
  this.isTeamMode = false;
  this.currentActiveRole = 'flight-director';

  this.roles = {
    'flight-director': {
      id: 'flight-director',
      title: 'Flight Director & Program Manager',
      callsign: 'FLIGHT',
      name: 'Dr. Evelyn Vance',
      subsystems: ['Mission Scenario', 'Financial Budget', 'Launch Vehicle Selection'],
      isGo: false,
      badgeClass: 'role-flight',
      description: 'Oversees total mission lifecycle cost, program milestones, and selects the launch vehicle.'
    },
    'science-pi': {
      id: 'science-pi',
      title: 'Payload & Science Specialist',
      callsign: 'SCIENCE PI',
      name: 'Dr. Marcus Thorne',
      subsystems: ['Scientific Instruments', 'Science Target Scores', 'Observation Duty Cycles'],
      isGo: false,
      badgeClass: 'role-science',
      description: 'Selects remote-sensing instruments and balances observation goals with payload mass.'
    },
    'bus-power': {
      id: 'bus-power',
      title: 'Spacecraft Bus & Power Engineer',
      callsign: 'SYS/PWR',
      name: 'Eng. Sarah Jenkins',
      subsystems: ['Bus Structure', 'Solar Arrays / RTG', 'Batteries', 'Propulsion & Delta-V'],
      isGo: false,
      badgeClass: 'role-bus',
      description: 'Ensures power balance in eclipse, structural envelope, and propellant mass fraction.'
    },
    'orbit-comms': {
      id: 'orbit-comms',
      title: 'Orbit & Communications Officer',
      callsign: 'FIDO/INCO',
      name: 'Lt. Tariq Al-Mansoor',
      subsystems: ['Orbit Trajectory', 'Ground Station Network', 'Antenna Link Budget', 'SSR Buffers'],
      isGo: false,
      badgeClass: 'role-comms',
      description: 'Determines orbital altitude, eclipse windows, downlink throughput, and ground tracking passes.'
    }
  };
};

window.SpaceMissionGame.TeamManager.prototype = {
  setTeamMode: function(enabled) {
    this.isTeamMode = enabled;
  },

  setActiveRole: function(roleId) {
    if (this.roles[roleId]) {
      this.currentActiveRole = roleId;
    }
  },

  setRoleName: function(roleId, name) {
    if (this.roles[roleId] && name) {
      this.roles[roleId].name = name;
    }
  },

  toggleRoleSignOff: function(roleId) {
    if (this.roles[roleId]) {
      this.roles[roleId].isGo = !this.roles[roleId].isGo;
      window.SpaceMissionGame.Audio.playClick();
      return this.roles[roleId].isGo;
    }
    return false;
  },

  allRolesGo: function() {
    if (!this.isTeamMode) return true;
    return (
      this.roles['flight-director'].isGo &&
      this.roles['science-pi'].isGo &&
      this.roles['bus-power'].isGo &&
      this.roles['orbit-comms'].isGo
    );
  },

  resetAllGo: function() {
    Object.keys(this.roles).forEach(r => {
      this.roles[r].isGo = false;
    });
  }
};
