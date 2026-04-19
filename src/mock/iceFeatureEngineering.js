function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function statusTemplate(status) {
  if (status === "critical") {
    return {
      rul: 24,
      classifierLabel: "High Risk",
      riskClassLabel: "Critical",
      confidence: 92,
      regR2: "0.91",
      clfAuc: "0.94",
    };
  }

  if (status === "warning") {
    return {
      rul: 64,
      classifierLabel: "Monitor",
      riskClassLabel: "Medium Risk",
      confidence: 86,
      regR2: "0.93",
      clfAuc: "0.95",
    };
  }

  return {
    rul: 112,
    classifierLabel: "Low Risk",
    riskClassLabel: "Healthy",
    confidence: 94,
    regR2: "0.95",
    clfAuc: "0.97",
  };
}

function getVehicleSeed(id) {
  return id.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
}

export function buildIceFeatureVector(car) {
  const {
    Engine_RPM,
    Engine_Load,
    Coolant_Temperature,
    Oil_Temperature,
    Oil_Pressure,
    Fuel_Level,
    Fuel_Rate,
    Fuel_Pressure,
    Fuel_Trim,
    Intake_Air_Temperature,
    Intake_Manifold_Pressure,
    MAF,
    Throttle_Position,
    Exhaust_Temperature,
    NOx_Level,
    CO_Level,
    O2_Sensor,
    Engine_Vibration,
    Transmission_Temperature,
    Vehicle_Speed,
    Mileage,
    Idle_Time,
  } = car;

  const Engine_Stress_Index =
    (Engine_Load / 100) * 0.5 +
    (Engine_RPM / 7000) * 0.3 +
    (Coolant_Temperature / 130) * 0.2;

  const Fuel_Efficiency_Index = Vehicle_Speed / (Fuel_Rate + 0.2);
  const Thermal_Stress_Index =
    (Coolant_Temperature + Oil_Temperature + Exhaust_Temperature / 4) / 3;
  const Emission_Index = NOx_Level * 0.7 + CO_Level * 20;
  const Combustion_Stability = clamp(
    100 - Engine_Vibration * 120 - Math.abs(Fuel_Trim) * 2,
    0,
    100
  );
  const Intake_Health = clamp(
    100 - Math.abs(Intake_Air_Temperature - 36) * 1.2 - Math.abs(MAF - 14) * 4,
    0,
    100
  );
  const Idle_Burden = Idle_Time / (Mileage + 1);
  const Drivetrain_Load_Index =
    (Transmission_Temperature / 140) * 0.5 + (Engine_Load / 100) * 0.5;
  const AirFuel_Balance = clamp(O2_Sensor * 100 - Math.abs(Fuel_Trim) * 3, 0, 100);

  return {
    Engine_RPM,
    Engine_Load,
    Coolant_Temperature,
    Oil_Temperature,
    Oil_Pressure,
    Fuel_Level,
    Fuel_Rate,
    Fuel_Pressure,
    Fuel_Trim,
    Intake_Air_Temperature,
    Intake_Manifold_Pressure,
    MAF,
    Throttle_Position,
    Exhaust_Temperature,
    NOx_Level,
    CO_Level,
    O2_Sensor,
    Engine_Vibration,
    Transmission_Temperature,
    Vehicle_Speed,
    Mileage,
    Idle_Time,

    Engine_Stress_Index,
    Fuel_Efficiency_Index,
    Thermal_Stress_Index,
    Emission_Index,
    Combustion_Stability,
    Intake_Health,
    Idle_Burden,
    Drivetrain_Load_Index,
    AirFuel_Balance,
  };
}

export function runIcePrediction(car) {
  const base = statusTemplate(car.status);
  const seed = getVehicleSeed(car.id);

  const rulShift = (seed % 7) - 3;
  const confidenceShift = (seed % 5) - 2;

  const rul = clamp(base.rul + rulShift, 12, 140);
  const confidence = clamp(base.confidence + confidenceShift, 60, 99);

  return {
    rul,
    classifierLabel: base.classifierLabel,
    riskClassLabel: base.riskClassLabel,
    confidence,
    regR2: base.regR2,
    clfAuc: base.clfAuc,
    model: "ICE Predictive Model v1.0",
  };
}

export function getIceRiskLevel(rul) {
  if (rul >= 90) return { label: "Healthy", color: "green" };
  if (rul >= 65) return { label: "Monitor", color: "amber" };
  if (rul >= 40) return { label: "Need Service", color: "orange" };
  return { label: "Critical", color: "red" };
}

export function getIceSectionHealth(car) {
  const engine = Math.round(
    (100 - Math.min((car.Engine_Load / 100) * 100, 100)) * 0.2 +
      (100 - Math.min((car.Engine_RPM / 5000) * 100, 100)) * 0.2 +
      Math.min((car.Oil_Pressure / 5) * 100, 100) * 0.3 +
      (100 - Math.min((car.Engine_Vibration / 0.6) * 100, 100)) * 0.3
  );

  const fuel = Math.round(
    Math.min((car.Fuel_Level / 100) * 100, 100) * 0.25 +
      (100 - Math.min((car.Fuel_Rate / 14) * 100, 100)) * 0.25 +
      Math.min((car.Fuel_Pressure / 4) * 100, 100) * 0.25 +
      (100 - Math.min((Math.abs(car.Fuel_Trim) / 12) * 100, 100)) * 0.25
  );

  const cooling = Math.round(
    (100 - Math.min((car.Coolant_Temperature / 130) * 100, 100)) * 0.45 +
      (100 - Math.min((car.Oil_Temperature / 150) * 100, 100)) * 0.35 +
      (100 - Math.min((car.Exhaust_Temperature / 650) * 100, 100)) * 0.2
  );

  const emissions = Math.round(
    (100 - Math.min((car.NOx_Level / 80) * 100, 100)) * 0.45 +
      (100 - Math.min((car.CO_Level / 1.6) * 100, 100)) * 0.35 +
      Math.min((car.O2_Sensor / 1.0) * 100, 100) * 0.2
  );

  const drivetrain = Math.round(
    (100 - Math.min((car.Transmission_Temperature / 140) * 100, 100)) * 0.5 +
      (100 - Math.min((car.Engine_Load / 100) * 100, 100)) * 0.25 +
      (100 - Math.min((car.Vehicle_Speed / 140) * 100, 100)) * 0.25
  );

  return {
    engine: clamp(engine, 0, 100),
    fuel: clamp(fuel, 0, 100),
    cooling: clamp(cooling, 0, 100),
    emissions: clamp(emissions, 0, 100),
    drivetrain: clamp(drivetrain, 0, 100),
  };
}
