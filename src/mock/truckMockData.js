/**
 * truckMockData.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock OBD2 / CAN-bus sensor data for 3 commercial trucks.
 *
 * Feature space mirrors the Scania APS failure dataset (105 normalized features).
 * Values are already in standardized (z-score) space because the scaler was
 * fitted on pre-normalized training data (mean≈0, std≈1).
 *
 * Feature groups (105 total):
 *   Scalar sensors   (4)  : 171_0, 666_0, 427_0, 837_0
 *   APS pressure     (10) : 167_0 … 167_9
 *   Coolant          (1)  : 309_0
 *   Compressor load  (10) : 272_0 … 272_9
 *   Brake / Air      (2)  : 835_0, 370_0
 *   Comp. cycles     (11) : 291_0 … 291_10
 *   Oil consumption  (10) : 158_0 … 158_9
 *   Operating hours  (1)  : 100_0
 *   APS extended     (20) : 459_0 … 459_19
 *   Load operational (36) : 397_0 … 397_35
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Helper : build histogram bins ─────────────────────────────────────────────
// healthy:  activity concentrated in low bins → high val at bin-0, falls off
// warning:  distribution flattening → moderate across all bins
// critical: activity shifting to high bins → low at bin-0, high at last bins
const healthyHist  = (n) => Array.from({ length: n }, (_, i) => +(1.1 - i * (1.6 / n)).toFixed(3));
const warningHist  = (n) => Array.from({ length: n }, (_, i) => +(0.3 + (i / n) * 0.4).toFixed(3));
const criticalHist = (n) => Array.from({ length: n }, (_, i) => +(-0.4 + i * (2.2 / n)).toFixed(3));

// ── Truck definitions ─────────────────────────────────────────────────────────

const trucks = [
  // ── Truck 1: Volvo FH16 — Healthy ─────────────────────────────────────────
  {
    id:           'truck-001',
    name:         'Volvo FH16',
    company:      'Volvo',
    year:         2022,
    status:       'healthy',
    lastSync:     '2 min ago',
    odometer:     142_500,    // km
    engineHours:  4_820,
    loadCapacity: 25,         // tonnes
    currentLoad:  18,
    route:        'Mumbai → Pune',

    // ── Human-readable sensor readings (for UI tiles) ────────────────────────
    sensors: {
      engineOilPressure:  { value: 4.8,    unit: 'bar',  label: 'Engine Oil Pressure',   normal: [3.5, 5.5] },
      airTankPressure:    { value: 8.6,    unit: 'bar',  label: 'Air Tank Pressure',      normal: [7.5, 9.5] },
      exhaustTemp:        { value: 312,    unit: '°C',   label: 'Exhaust Temperature',    normal: [200, 450] },
      loadWeight:         { value: 18.0,   unit: 't',    label: 'Current Load',           normal: [0, 25]    },
      coolantTemp:        { value: 88,     unit: '°C',   label: 'Coolant Temperature',    normal: [70, 100]  },
      brakeAirPressure:   { value: 8.8,    unit: 'bar',  label: 'Brake Air Pressure',     normal: [7.5, 9.5] },
      airDryerCycles:     { value: 12,     unit: '/hr',  label: 'Air Dryer Cycles',       normal: [0, 30]    },
      compressorLoad:     { value: 28,     unit: '%',    label: 'Compressor Load',        normal: [0, 70]    },
      oilConsumption:     { value: 0.4,    unit: 'L/hr', label: 'Oil Consumption Rate',   normal: [0, 1.5]   },
      operatingHours:     { value: 4820,   unit: 'hrs',  label: 'Total Engine Hours',     normal: [0, 20000] },
      apsIndex:           { value: 94,     unit: '%',    label: 'APS Health Index',       normal: [60, 100]  },
      transmissionTemp:   { value: 72,     unit: '°C',   label: 'Transmission Temp',      normal: [50, 100]  },
    },

    // ── Section health (0–100) for UI rings ─────────────────────────────────
    sectionHealth: {
      aps:          94,
      engine:       91,
      brakes:       96,
      compressor:   89,
      drivetrain:   93,
    },

    // ── 105 normalized feature values (exact model input order) ─────────────
    features: {
      // Scalar sensors (indices 0–3)
      '171_0':  -0.42,   // engine oil pressure
      '666_0':  -0.31,   // air tank pressure
      '427_0':   0.08,   // exhaust temperature
      '837_0':  -0.18,   // load weight

      // APS pressure histogram (indices 4–13, 10 bins)
      ...Object.fromEntries(healthyHist(10).map((v, i) => [`167_${i}`, v])),

      // Coolant (index 14)
      '309_0':  -0.25,

      // Compressor load histogram (indices 15–24, 10 bins)
      ...Object.fromEntries(healthyHist(10).map((v, i) => [`272_${i}`, v])),

      // Brake air pressure, air dryer (indices 25–26)
      '835_0':  -0.28,
      '370_0':  -0.35,

      // Compressor cycles histogram (indices 27–37, 11 bins)
      ...Object.fromEntries(healthyHist(11).map((v, i) => [`291_${i}`, v])),

      // Oil consumption histogram (indices 38–47, 10 bins)
      ...Object.fromEntries(healthyHist(10).map((v, i) => [`158_${i}`, v])),

      // Operating hours (index 48)
      '100_0':  -0.30,

      // APS extended histogram (indices 49–68, 20 bins)
      ...Object.fromEntries(healthyHist(20).map((v, i) => [`459_${i}`, v])),

      // Operational load histogram (indices 69–104, 36 bins)
      ...Object.fromEntries(healthyHist(36).map((v, i) => [`397_${i}`, v])),
    },
  },

  // ── Truck 2: Scania R450 — Warning ────────────────────────────────────────
  {
    id:           'truck-002',
    name:         'Scania R450',
    company:      'Scania',
    year:         2019,
    status:       'warning',
    lastSync:     '8 min ago',
    odometer:     389_200,
    engineHours:  12_640,
    loadCapacity: 30,
    currentLoad:  27,
    route:        'Delhi → Jaipur',

    sensors: {
      engineOilPressure:  { value: 3.2,    unit: 'bar',  label: 'Engine Oil Pressure',   normal: [3.5, 5.5] },
      airTankPressure:    { value: 7.1,    unit: 'bar',  label: 'Air Tank Pressure',      normal: [7.5, 9.5] },
      exhaustTemp:        { value: 498,    unit: '°C',   label: 'Exhaust Temperature',    normal: [200, 450] },
      loadWeight:         { value: 27.0,   unit: 't',    label: 'Current Load',           normal: [0, 30]    },
      coolantTemp:        { value: 108,    unit: '°C',   label: 'Coolant Temperature',    normal: [70, 100]  },
      brakeAirPressure:   { value: 7.0,    unit: 'bar',  label: 'Brake Air Pressure',     normal: [7.5, 9.5] },
      airDryerCycles:     { value: 48,     unit: '/hr',  label: 'Air Dryer Cycles',       normal: [0, 30]    },
      compressorLoad:     { value: 62,     unit: '%',    label: 'Compressor Load',        normal: [0, 70]    },
      oilConsumption:     { value: 1.1,    unit: 'L/hr', label: 'Oil Consumption Rate',   normal: [0, 1.5]   },
      operatingHours:     { value: 12640,  unit: 'hrs',  label: 'Total Engine Hours',     normal: [0, 20000] },
      apsIndex:           { value: 61,     unit: '%',    label: 'APS Health Index',       normal: [60, 100]  },
      transmissionTemp:   { value: 112,    unit: '°C',   label: 'Transmission Temp',      normal: [50, 100]  },
    },

    sectionHealth: {
      aps:          61,
      engine:       58,
      brakes:       64,
      compressor:   55,
      drivetrain:   60,
    },

    features: {
      '171_0':   0.78,
      '666_0':   0.62,
      '427_0':   0.91,
      '837_0':   0.54,

      ...Object.fromEntries(warningHist(10).map((v, i) => [`167_${i}`, v])),

      '309_0':   0.69,

      ...Object.fromEntries(warningHist(10).map((v, i) => [`272_${i}`, v])),

      '835_0':   0.58,
      '370_0':   0.71,

      ...Object.fromEntries(warningHist(11).map((v, i) => [`291_${i}`, v])),

      ...Object.fromEntries(warningHist(10).map((v, i) => [`158_${i}`, v])),

      '100_0':   0.65,

      ...Object.fromEntries(warningHist(20).map((v, i) => [`459_${i}`, v])),

      ...Object.fromEntries(warningHist(36).map((v, i) => [`397_${i}`, v])),
    },
  },

  // ── Truck 3: MAN TGX — Critical ───────────────────────────────────────────
  {
    id:           'truck-003',
    name:         'MAN TGX',
    company:      'MAN',
    year:         2017,
    status:       'critical',
    lastSync:     '1 min ago',
    odometer:     712_800,
    engineHours:  24_190,
    loadCapacity: 28,
    currentLoad:  28,
    route:        'Chennai → Bengaluru',

    sensors: {
      engineOilPressure:  { value: 2.1,    unit: 'bar',  label: 'Engine Oil Pressure',   normal: [3.5, 5.5] },
      airTankPressure:    { value: 5.8,    unit: 'bar',  label: 'Air Tank Pressure',      normal: [7.5, 9.5] },
      exhaustTemp:        { value: 612,    unit: '°C',   label: 'Exhaust Temperature',    normal: [200, 450] },
      loadWeight:         { value: 28.0,   unit: 't',    label: 'Current Load',           normal: [0, 28]    },
      coolantTemp:        { value: 131,    unit: '°C',   label: 'Coolant Temperature',    normal: [70, 100]  },
      brakeAirPressure:   { value: 5.9,    unit: 'bar',  label: 'Brake Air Pressure',     normal: [7.5, 9.5] },
      airDryerCycles:     { value: 89,     unit: '/hr',  label: 'Air Dryer Cycles',       normal: [0, 30]    },
      compressorLoad:     { value: 94,     unit: '%',    label: 'Compressor Load',        normal: [0, 70]    },
      oilConsumption:     { value: 2.4,    unit: 'L/hr', label: 'Oil Consumption Rate',   normal: [0, 1.5]   },
      operatingHours:     { value: 24190,  unit: 'hrs',  label: 'Total Engine Hours',     normal: [0, 20000] },
      apsIndex:           { value: 22,     unit: '%',    label: 'APS Health Index',       normal: [60, 100]  },
      transmissionTemp:   { value: 148,    unit: '°C',   label: 'Transmission Temp',      normal: [50, 100]  },
    },

    sectionHealth: {
      aps:          22,
      engine:       31,
      brakes:       28,
      compressor:   19,
      drivetrain:   35,
    },

    features: {
      '171_0':   2.14,
      '666_0':   1.88,
      '427_0':   2.31,
      '837_0':   1.72,

      ...Object.fromEntries(criticalHist(10).map((v, i) => [`167_${i}`, v])),

      '309_0':   2.05,

      ...Object.fromEntries(criticalHist(10).map((v, i) => [`272_${i}`, v])),

      '835_0':   1.95,
      '370_0':   2.18,

      ...Object.fromEntries(criticalHist(11).map((v, i) => [`291_${i}`, v])),

      ...Object.fromEntries(criticalHist(10).map((v, i) => [`158_${i}`, v])),

      '100_0':   2.40,

      ...Object.fromEntries(criticalHist(20).map((v, i) => [`459_${i}`, v])),

      ...Object.fromEntries(criticalHist(36).map((v, i) => [`397_${i}`, v])),
    },
  },
];

export default trucks;