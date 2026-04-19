import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Battery, Zap, Activity, AlertTriangle,
  CheckCircle, Clock, RefreshCw, Gauge, Wind, Weight, Radio,
} from "lucide-react";
import evMockData from "../mock/evmockData";
import { buildFeatureVector, getRiskLevel, getSectionHealth } from "../mock/featureEngineering";
import { apiFetch } from "../utils/api";

// ─── Animated counter ──────────────────────────────────────────────────────────
function AnimatedNumber({ target, duration = 1400, decimals = 0 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from  = val;
    const tick  = (now) => {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(from + ease * (target - from));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return <>{val.toFixed(decimals)}</>;
}

// ─── RUL Arc Gauge ─────────────────────────────────────────────────────────────
function RULArcGauge({ rul, loading }) {
  const MAX = 120;
  const pct = Math.min(rul / MAX, 1);
  const risk = getRiskLevel(rul);
  const colors = {
    green:  { stroke: "#00D9FF", glow: "rgba(0,217,255,0.35)",  badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
    amber:  { stroke: "#F59E0B", glow: "rgba(245,158,11,0.35)", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    orange: { stroke: "#F97316", glow: "rgba(249,115,22,0.35)", badge: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    red:    { stroke: "#EF4444", glow: "rgba(239,68,68,0.35)",  badge: "bg-red-500/20 text-red-400 border-red-500/30" },
  };
  const c = colors[risk.color] || colors.amber;
  const R = 80, cx = 100, cy = 100, sw = 12;
  const circ = 2 * Math.PI * R;
  const arc  = circ * 0.75;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={200} height={200} style={{ transform: "rotate(-225deg)" }}>
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}
            strokeDasharray={`${arc} ${circ}`} strokeLinecap="round" />
          {!loading && (
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={c.stroke} strokeWidth={sw}
              strokeDasharray={`${pct * arc} ${circ}`} strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1.6s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${c.glow})` }} />
          )}
          {[0, 25, 50, 75, 100].map((pv, i) => {
            const a = (-225 + pv * 2.7) * (Math.PI / 180);
            return <line key={i} x1={cx + (R - 18) * Math.cos(a)} y1={cy + (R - 18) * Math.sin(a)}
              x2={cx + (R - 10) * Math.cos(a)} y2={cy + (R - 10) * Math.sin(a)}
              stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
          ) : (
            <>
              <div className="text-5xl font-bold font-mono leading-none" style={{ color: c.stroke }}>
                <AnimatedNumber target={rul} />
              </div>
              <div className="text-xs text-gray-500 mt-1 tracking-widest uppercase">days</div>
              <span className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border ${c.badge}`}>{risk.label}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-xs text-gray-500 -mt-4">Remaining Useful Life</div>
      <div className="text-xs text-gray-600 mt-1">threshold: 56.1 days</div>
    </div>
  );
}

function ConfidenceMeter({ value }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Classifier confidence</span>
        <span className="text-sm font-mono font-bold text-white">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#00D9FF,#6366F1)" }} />
      </div>
    </div>
  );
}

function HealthRing({ label, value, icon: Icon }) {
  const color = value >= 75 ? "#00D9FF" : value >= 50 ? "#F59E0B" : "#EF4444";
  const R = 22, circ = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-14 h-14">
        <svg width={56} height={56} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={28} cy={28} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <circle cx={28} cy={28} r={R} fill="none" stroke={color} strokeWidth={4}
            strokeDasharray={`${(value / 100) * circ} ${circ}`} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1.4s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 4px ${color}66)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-mono font-bold" style={{ color }}>{value}%</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function SensorTile({ label, value, unit, warn, sub }) {
  return (
    <div className={`p-3 rounded-xl border transition-all ${warn ? "bg-red-500/5 border-red-500/20" : "bg-white/3 border-white/8 hover:border-white/15"}`}>
      <div className="text-xs text-gray-500 mb-1.5 truncate">{label}</div>
      <div className={`text-lg font-mono font-bold ${warn ? "text-red-400" : "text-white"}`}>
        {value}<span className="text-xs font-normal ml-1 text-gray-500">{unit}</span>
      </div>
      {sub && <div className="text-xs text-gray-600 mt-0.5">{sub}</div>}
      {warn && (
        <div className="flex items-center gap-1 mt-1.5">
          <AlertTriangle className="w-3 h-3 text-red-400" />
          <span className="text-xs text-red-400">Out of range</span>
        </div>
      )}
    </div>
  );
}

function StatusBanner({ rul }) {
  if (rul >= 80) return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/8 border border-cyan-500/20">
      <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-cyan-300">Vehicle in good health</div>
        <div className="text-xs text-cyan-400/70 mt-0.5">Continue regular maintenance. Next checkpoint in ~{Math.round(rul - 56)} days.</div>
      </div>
    </div>
  );
  if (rul >= 56) return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-yellow-500/8 border border-yellow-500/20">
      <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-yellow-300">Approaching service threshold</div>
        <div className="text-xs text-yellow-400/70 mt-0.5">Schedule maintenance within {Math.round(rul)} days.</div>
      </div>
    </div>
  );
  if (rul >= 30) return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-orange-500/8 border border-orange-500/20">
      <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
      <div>
        <div className="text-sm font-semibold text-orange-300">Service required soon</div>
        <div className="text-xs text-orange-400/70 mt-0.5">Only {Math.round(rul)} days remaining. Book a service appointment immediately.</div>
      </div>
    </div>
  );
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20">
      <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
      <div>
        <div className="text-sm font-semibold text-red-300">Critical — immediate service required</div>
        <div className="text-xs text-red-400/70 mt-0.5">Only {Math.round(rul)} days RUL remaining. Do not delay service.</div>
      </div>
    </div>
  );
}

function ErrorCard({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <div>
        <div className="text-sm font-semibold text-red-300 mb-1">Prediction failed</div>
        <div className="text-xs text-gray-500 max-w-xs">{error}</div>
      </div>
      <button onClick={onRetry} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 transition-all">
        Try again
      </button>
    </div>
  );
}

const SENSOR_TABS = [
  { id: "battery",     label: "Battery",        icon: Battery  },
  { id: "motor",       label: "Motor",          icon: Activity },
  { id: "brakes",      label: "Brakes & Tyres", icon: Gauge    },
  { id: "environment", label: "Environment",    icon: Wind     },
];
const MIN_REFRESH_INDICATOR_MS = 900;

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function EVPrediction() {
  const { carId }  = useParams();
  const navigate   = useNavigate();

  const car           = evMockData.find(c => c.id === carId) || evMockData[0];
  const sectionHealth = getSectionHealth(car);

  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState("battery");
  const refreshStartedAtRef = useRef(0);
  const manualRefreshRef = useRef(false);

  const runPrediction = async () => {
    setLoading(true); setError(null); setPrediction(null);
    try {
      const features = buildFeatureVector(car);
      const res = await apiFetch('/predict/ev', {
        method: 'POST',
        body:   JSON.stringify(features),
      });
      if (!res) return; // 401 redirect handled
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setPrediction({
        rul:             data.rul_days,
        risk:            getRiskLevel(data.rul_days),
        classifierLabel: data.risk_label,
        riskClassLabel:  data.risk_class_label,
        confidence:      data.confidence_pct ?? 0,
        regR2:           data.reg_r2,
        clfAuc:          data.clf_auc,
        model:           data.model,
      });
    } catch (e) {
      setError(e.message || "Could not connect to prediction server.");
    } finally {
      if (manualRefreshRef.current) {
        const elapsed = Date.now() - refreshStartedAtRef.current;
        const waitMs = Math.max(0, MIN_REFRESH_INDICATOR_MS - elapsed);
        if (waitMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
        manualRefreshRef.current = false;
        setRefreshing(false);
      }
      setLoading(false);
    }
  };

  useEffect(() => { runPrediction(); }, [car.id]);

  const handleRefresh = () => {
    if (loading || refreshing) return;
    manualRefreshRef.current = true;
    refreshStartedAtRef.current = Date.now();
    setRefreshing(true);
    runPrediction();
  };

  const sensorPanels = {
    battery: [
      { label: "State of Charge",    value: car.SoC,                 unit: "%",         warn: car.SoC < 25,                        sub: "Current charge level"  },
      { label: "State of Health",    value: car.SoH,                 unit: "%",         warn: car.SoH < 70,                        sub: "Degradation indicator" },
      { label: "Pack Voltage",       value: car.Battery_Voltage,     unit: "V",         warn: false,                                sub: "Pack terminal voltage" },
      { label: "Pack Current",       value: car.Battery_Current,     unit: "A",         warn: Math.abs(car.Battery_Current) > 45,  sub: "Discharge: negative"   },
      { label: "Pack Temperature",   value: car.Battery_Temperature, unit: "°C",        warn: car.Battery_Temperature > 50,        sub: "Thermal management"    },
      { label: "Charge Cycles",      value: car.Charge_Cycles,       unit: "cycles",    warn: car.Charge_Cycles > 700,             sub: "Full cycle count"      },
    ],
    motor: [
      { label: "Motor Temperature",  value: car.Motor_Temperature,   unit: "°C",        warn: car.Motor_Temperature > 85,          sub: "Stator winding temp"   },
      { label: "Vibration",          value: car.Motor_Vibration,     unit: "mm/s",      warn: car.Motor_Vibration > 0.5,           sub: "RMS vibration level"   },
      { label: "Output Torque",      value: car.Motor_Torque,        unit: "Nm",        warn: false,                                sub: "Shaft torque"          },
      { label: "Rotor Speed",        value: car.Motor_RPM,           unit: "RPM",       warn: car.Motor_RPM > 5000,                sub: "Electrical RPM"        },
      { label: "Energy Consumption", value: car.Power_Consumption,   unit: "kWh/100km", warn: car.Power_Consumption > 25,          sub: "Rolling average"       },
    ],
    brakes: [
      { label: "Pad Wear",           value: car.Brake_Pad_Wear,       unit: "%",        warn: car.Brake_Pad_Wear > 60,             sub: "Friction material worn" },
      { label: "Line Pressure",      value: car.Brake_Pressure,       unit: "MPa",      warn: car.Brake_Pressure > 3.2,            sub: "Hydraulic pressure"     },
      { label: "Regen Efficiency",   value: car.Reg_Brake_Efficiency, unit: "%",        warn: car.Reg_Brake_Efficiency < 60,       sub: "Energy recovered"       },
      { label: "Tyre Pressure",      value: car.Tire_Pressure,        unit: "PSI",      warn: car.Tire_Pressure < 28,              sub: "Avg across 4 tyres"     },
      { label: "Tyre Temperature",   value: car.Tire_Temperature,     unit: "°C",       warn: car.Tire_Temperature > 55,           sub: "Contact patch temp"     },
      { label: "Suspension Load",    value: car.Suspension_Load,      unit: "kg",       warn: car.Suspension_Load > 650,           sub: "Total sprung mass"      },
    ],
    environment: [
      { label: "Ambient Temp",       value: car.Ambient_Temperature,  unit: "°C",       warn: car.Ambient_Temperature > 36,        sub: "Outside air temp"      },
      { label: "Humidity",           value: car.Ambient_Humidity,     unit: "%",        warn: car.Ambient_Humidity > 80,           sub: "Relative humidity"     },
      { label: "Load Weight",        value: car.Load_Weight,          unit: "kg",       warn: car.Load_Weight > 400,               sub: "Cargo + passengers"    },
      { label: "Vehicle Speed",      value: car.Driving_Speed,        unit: "km/h",     warn: car.Driving_Speed > 90,              sub: "GPS speed"             },
      { label: "Distance Today",     value: car.Distance_Traveled,    unit: "km",       warn: false,                                sub: "Trip odometer"         },
      { label: "Idle Time",          value: car.Idle_Time,            unit: "min",      warn: car.Idle_Time > 18,                  sub: "Engine-off standby"    },
      { label: "Route Roughness",    value: car.Route_Roughness,      unit: "/ 1.0",    warn: car.Route_Roughness > 0.6,           sub: "Road quality index"    },
    ],
  };

  const warnCount = (sensorPanels[activeTab] || []).filter(s => s.warn).length;

  return (
    <div className="min-h-screen bg-dark-600 pt-20 md:pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-400 hover:text-white transition-all">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-outfit font-bold">{car.carName}</h1>
                {prediction && !loading && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    prediction.rul >= 80 ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                    : prediction.rul >= 56 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/30"
                    : prediction.rul >= 30 ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                    : "bg-red-500/15 text-red-400 border-red-500/30"
                  }`}>
                    {prediction.classifierLabel}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {car.carCompany} · {car.year} · EV · Updated {new Date(car.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-gray-400">OBD2 Live (demo)</span>
            </div>
            <button onClick={handleRefresh} disabled={loading || refreshing}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-400 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? "animate-spin" : ""}`} />
              {loading || refreshing ? "Re-running..." : "Re-run model"}
            </button>
          </div>
        </motion.div>

        {/* Top 3-col row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Gauge */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card p-6 flex flex-col items-center justify-between gap-4">
            <div className="w-full flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Regressor output</span>
              {prediction && <span className="text-xs text-gray-600 font-mono">R² = {prediction.regR2}</span>}
            </div>
            <RULArcGauge rul={prediction?.rul ?? 0} loading={loading} />
            {prediction && !loading && <ConfidenceMeter value={prediction.confidence} />}
          </motion.div>

          {/* Classifier */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Classifier output</span>
              {prediction && <span className="text-xs text-gray-600 font-mono">AUC = {prediction.clfAuc}</span>}
            </div>
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
                <div className="w-8 h-8 border-2 border-white/10 border-t-cyan-400 rounded-full animate-spin" />
                <span className="text-xs text-gray-500">Running model…</span>
              </div>
            )}
            {error && <ErrorCard error={error} onRetry={runPrediction} />}
            {prediction && !loading && !error && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Predicted RUL", value: `${prediction.rul}d`,       accent: true  },
                    { label: "Risk verdict",  value: prediction.classifierLabel, accent: false },
                    { label: "Model type",    value: prediction.model,           accent: false },
                    { label: "Clf verdict",   value: prediction.riskClassLabel,  accent: false },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-xl bg-white/4 border border-white/6">
                      <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                      <div className={`text-sm font-mono font-bold truncate ${m.accent ? "gradient-text" : "text-white"}`}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <StatusBanner rul={prediction.rul} />
              </>
            )}
          </motion.div>

          {/* Health rings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card p-6 flex flex-col gap-4">
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">System health</span>
            <div className="grid grid-cols-3 gap-4 place-items-center flex-1 py-2">
              <HealthRing label="Battery"    value={sectionHealth.battery}    icon={Battery}  />
              <HealthRing label="Motor"      value={sectionHealth.motor}      icon={Activity} />
              <HealthRing label="Brakes"     value={sectionHealth.brakes}     icon={Gauge}    />
              <HealthRing label="Tyres"      value={sectionHealth.tyres}      icon={Radio}    />
              <HealthRing label="Suspension" value={sectionHealth.suspension} icon={Weight}   />
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center bg-white/4">
                  <span className="text-sm font-mono font-bold text-white">
                    {Math.round(Object.values(sectionHealth).reduce((a, b) => a + b, 0) / 5)}
                  </span>
                </div>
                <div className="text-xs text-gray-500">Overall</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sensor readings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-white/8">
            <div className="flex gap-1">
              {SENSOR_TABS.map(t => {
                const Icon   = t.icon;
                const active = activeTab === t.id;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                      active ? "text-white border-cyan-400" : "text-gray-500 border-transparent hover:text-gray-300"
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{t.label}
                  </button>
                );
              })}
            </div>
            {warnCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 mr-1 mb-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-400 font-semibold">{warnCount} alert{warnCount > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
          <div className="p-5">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {(sensorPanels[activeTab] || []).map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <SensorTile {...s} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Derived features */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Derived features sent to model</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {(() => {
              const fv = buildFeatureVector(car);
              return [
                { label: "Battery Power",   value: fv.Battery_Power.toFixed(1),     unit: "kW" },
                { label: "SoC Level",       value: fv.SoC_Level.toFixed(2),         unit: ""   },
                { label: "Motor Power",     value: fv.Motor_Power.toFixed(1),       unit: "kW" },
                { label: "Motor Load",      value: fv.Motor_Load_Factor.toFixed(2), unit: ""   },
                { label: "Energy Eff.",     value: fv.Energy_Efficiency.toFixed(2), unit: ""   },
                { label: "Speed/Power",     value: fv.Speed_Power_Ratio.toFixed(2), unit: ""   },
                { label: "Weather Idx",     value: fv.Weather_Index.toFixed(2),     unit: ""   },
                { label: "Idle Ratio",      value: fv.Idle_Ratio.toFixed(3),        unit: ""   },
                { label: "Load Efficiency", value: fv.Load_Efficiency.toFixed(2),   unit: ""   },
              ].map(f => (
                <div key={f.label} className="p-2.5 rounded-lg bg-white/3 border border-white/6 text-center">
                  <div className="text-xs text-gray-600 truncate mb-1">{f.label}</div>
                  <div className="text-sm font-mono font-bold text-gray-300">
                    {f.value}<span className="text-gray-600 text-xs ml-0.5">{f.unit}</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </motion.div>

      </div>
    </div>
  );
}