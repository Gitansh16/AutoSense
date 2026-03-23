/**
 * truckFeatureEngineering.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds the exact 105-feature vector the BiLSTMAttention model expects.
 *
 * Feature order (must match feature_columns.pkl exactly):
 *   [0]     171_0
 *   [1]     666_0
 *   [2]     427_0
 *   [3]     837_0
 *   [4–13]  167_0 … 167_9
 *   [14]    309_0
 *   [15–24] 272_0 … 272_9
 *   [25]    835_0
 *   [26]    370_0
 *   [27–37] 291_0 … 291_10
 *   [38–47] 158_0 … 158_9
 *   [48]    100_0
 *   [49–68] 459_0 … 459_19
 *   [69–104] 397_0 … 397_35
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Feature column names in exact order ──────────────────────────────────────
export const FEATURE_COLUMNS = [
  '171_0', '666_0', '427_0', '837_0',
  ...Array.from({ length: 10 }, (_, i) => `167_${i}`),
  '309_0',
  ...Array.from({ length: 10 }, (_, i) => `272_${i}`),
  '835_0', '370_0',
  ...Array.from({ length: 11 }, (_, i) => `291_${i}`),
  ...Array.from({ length: 10 }, (_, i) => `158_${i}`),
  '100_0',
  ...Array.from({ length: 20 }, (_, i) => `459_${i}`),
  ...Array.from({ length: 36 }, (_, i) => `397_${i}`),
];

/**
 * buildTruckFeatureVector(truck)
 * Extracts the 105 features from a truck object in the exact column order.
 * Returns a flat Float32Array ready to send to the backend.
 */
export function buildTruckFeatureVector(truck) {
  return FEATURE_COLUMNS.map((col) => {
    const val = truck.features[col];
    if (val === undefined) {
      console.warn(`[truckFeatureEngineering] Missing feature: ${col} — defaulting to 0`);
      return 0.0;
    }
    return val;
  });
}

/**
 * CLASS_LABELS — maps predicted_class (0–4) to display metadata.
 */
export const CLASS_LABELS = {
  0: {
    label:       'Healthy',
    sublabel:    'No failure within 48 h',
    window:      '> 48 h',
    color:       '#00d9ff',   // cyan
    bgColor:     'rgba(0, 217, 255, 0.12)',
    borderColor: 'rgba(0, 217, 255, 0.4)',
    severity:    0,
  },
  1: {
    label:       'Warning',
    sublabel:    'Potential failure in 24–48 h',
    window:      '24 – 48 h',
    color:       '#f59e0b',   // amber
    bgColor:     'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
    severity:    1,
  },
  2: {
    label:       'Alert',
    sublabel:    'Failure expected within 24 h',
    window:      '12 – 24 h',
    color:       '#f97316',   // orange
    bgColor:     'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.4)',
    severity:    2,
  },
  3: {
    label:       'Critical',
    sublabel:    'Failure expected within 12 h',
    window:      '6 – 12 h',
    color:       '#ef4444',   // red
    bgColor:     'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    severity:    3,
  },
  4: {
    label:       'Imminent',
    sublabel:    'Failure imminent — stop vehicle',
    window:      '< 6 h',
    color:       '#dc2626',   // deep red
    bgColor:     'rgba(220, 38, 38, 0.18)',
    borderColor: 'rgba(220, 38, 38, 0.6)',
    severity:    4,
  },
};

/**
 * getTruckRiskLevel(predictedClass) → CLASS_LABELS entry
 */
export function getTruckRiskLevel(predictedClass) {
  return CLASS_LABELS[predictedClass] ?? CLASS_LABELS[0];
}

/**
 * getSectionHealth(truck) → { aps, engine, brakes, compressor, drivetrain }
 * Already pre-computed in mock data; exposed here as a helper for consistency.
 */
export function getTruckSectionHealth(truck) {
  return truck.sectionHealth;
}

/**
 * isOutOfRange(sensor)
 * Returns true if the sensor value is outside its normal range.
 */
export function isOutOfRange(sensor) {
  if (!sensor.normal) return false;
  const [lo, hi] = sensor.normal;
  return sensor.value < lo || sensor.value > hi;
}

/**
 * getAlertCount(truck)
 * Counts how many sensors are out of normal range.
 */
export function getAlertCount(truck) {
  return Object.values(truck.sensors).filter(isOutOfRange).length;
}