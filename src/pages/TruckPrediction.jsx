import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, RefreshCw, Wifi, AlertTriangle, CheckCircle,
  Gauge, Wind, Activity, Truck, Clock,
  BarChart2, Shield, Settings, AlertCircle, TrendingUp, Info
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import trucks from '../mock/truckMockData';
import {
  buildTruckFeatureVector, getTruckRiskLevel, getTruckSectionHealth,
  isOutOfRange, getAlertCount,
} from '../mock/truckFeatureEngineering';
import { apiFetch } from '../utils/api';

const RISK_STEPS = [
  { cls: 0, short: 'Healthy',  window: '>48h',   color: '#00d9ff' },
  { cls: 1, short: 'Warning',  window: '24–48h', color: '#f59e0b' },
  { cls: 2, short: 'Alert',    window: '12–24h', color: '#f97316' },
  { cls: 3, short: 'Critical', window: '6–12h',  color: '#ef4444' },
  { cls: 4, short: 'Imminent', window: '<6h',    color: '#dc2626' },
];
const SECTION_ICONS  = { aps: Wind, engine: Activity, brakes: Shield, compressor: Gauge, drivetrain: Settings };
const SECTION_LABELS = { aps: 'APS', engine: 'Engine', brakes: 'Brakes', compressor: 'Compressor', drivetrain: 'Drivetrain' };
const TABS = ['Engine', 'APS', 'Brakes & Air', 'Load & Ops'];
const SENSOR_TABS = {
  'Engine':       ['engineOilPressure', 'exhaustTemp', 'coolantTemp', 'transmissionTemp', 'operatingHours'],
  'APS':          ['airTankPressure', 'apsIndex', 'airDryerCycles'],
  'Brakes & Air': ['brakeAirPressure', 'airDryerCycles', 'compressorLoad'],
  'Load & Ops':   ['loadWeight', 'oilConsumption', 'apsIndex'],
};
const MIN_REFRESH_INDICATOR_MS = 900;

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
const STATUS_TO_CLASS = {
  healthy: 0,
  warning: 1,
  alert: 2,
  critical: 3,
  imminent: 4,
};
const STATUS_TO_RISK = {
  healthy: { label: 'Healthy (>48 h)', short: 'Healthy' },
  warning: { label: 'Warning (48–24 h)', short: 'Warning' },
  alert: { label: 'Alert (24–12 h)', short: 'Alert' },
  critical: { label: 'Critical (12–6 h)', short: 'Critical' },
  imminent: { label: 'Imminent (<6 h)', short: 'Imminent' },
};

const DEMO_PROBABILITIES = {
  healthy: [92, 4, 2, 1, 1],
  warning: [8, 78, 8, 4, 2],
  alert: [3, 10, 68, 14, 5],
  critical: [2, 4, 12, 68, 14],
  imminent: [1, 2, 5, 12, 80],
};

const buildDemoPrediction = (truck) => {
  const status = truck?.status || 'healthy';
  const predictedClass = STATUS_TO_CLASS[status] ?? 0;
  const risk = STATUS_TO_RISK[status] ?? STATUS_TO_RISK.healthy;
  const probabilities = DEMO_PROBABILITIES[status] ?? DEMO_PROBABILITIES.healthy;
  return {
    vehicle_id: truck?.id || 'unknown',
    predicted_class: predictedClass,
    risk_label: risk.label,
    risk_short: risk.short,
    confidence_pct: Math.max(...probabilities),
    probabilities,
    model: 'Demo mode (mock)',
    sequence_length: 50,
    n_features: 105,
  };
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const HealthRing = ({ score, label, icon: Icon, delay = 0 }) => {
  const r = 30, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  const color = score >= 75 ? '#00d9ff' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}
      className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <motion.circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, delay, ease: 'easeOut' }} transform="rotate(-90 40 40)"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-bold" style={{ color }}>{score}%</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </motion.div>
  );
};

const RiskTimeline = ({ predictedClass, probabilities }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-1">
      {RISK_STEPS.map((step, idx) => {
        const isActive = step.cls === predictedClass;
        const isPast   = step.cls < predictedClass;
        return (
          <React.Fragment key={step.cls}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: idx * 0.1 + 0.3 }}
              className="flex flex-col items-center gap-1 flex-1">
              <div className="relative flex justify-center">
                {isActive && (
                  <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full" style={{ backgroundColor: step.color }} />
                )}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 relative z-10"
                  style={{
                    borderColor: step.color,
                    backgroundColor: isActive ? step.color : isPast ? `${step.color}30` : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#000' : step.color,
                    boxShadow: isActive ? `0 0 16px ${step.color}80` : 'none',
                  }}>
                  {step.cls}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold" style={{ color: isActive ? step.color : 'rgb(107 114 128)' }}>{step.short}</div>
                <div className="text-[10px] text-gray-600">{step.window}</div>
              </div>
            </motion.div>
            {idx < RISK_STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-6 rounded-full" style={{
                background: idx < predictedClass
                  ? `linear-gradient(90deg, ${RISK_STEPS[idx].color}, ${RISK_STEPS[idx + 1].color})`
                  : 'rgba(255,255,255,0.08)'
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
    {probabilities && (
      <div className="space-y-2 mt-4">
        {RISK_STEPS.map((step, idx) => (
          <div key={step.cls} className="flex items-center gap-3">
            <div className="text-xs text-gray-400 w-16 text-right">{step.short}</div>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${probabilities[idx] ?? 0}%` }}
                transition={{ duration: 0.8, delay: 0.4 + idx * 0.08, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: step.cls === predictedClass ? `linear-gradient(90deg, ${step.color}80, ${step.color})` : `${step.color}50`,
                  boxShadow:  step.cls === predictedClass ? `0 0 8px ${step.color}60` : 'none',
                }} />
            </div>
            <div className="text-xs text-gray-400 w-12">{(probabilities[idx] ?? 0).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const SensorTile = ({ sensor, delay = 0 }) => {
  const out = isOutOfRange(sensor);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}
      className={`p-4 rounded-xl border transition-all ${out ? 'bg-red-500/5 border-red-500/30' : 'bg-white/3 border-white/8 hover:border-white/15'}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500">{sensor.label}</span>
        {out && <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
      </div>
      <div className={`text-xl font-bold font-mono ${out ? 'text-red-400' : 'text-white'}`}>
        {sensor.value}<span className="text-sm font-normal text-gray-400 ml-1">{sensor.unit}</span>
      </div>
      {sensor.normal && <div className="text-[10px] text-gray-600 mt-1">Normal: {sensor.normal[0]} – {sensor.normal[1]} {sensor.unit}</div>}
    </motion.div>
  );
};

const ConfidenceBar = ({ pct, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">Model Confidence</span>
      <span className="font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
    </div>
    <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.0, delay: 0.6, ease: 'easeOut' }}
        className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${color}60, ${color})`, boxShadow: `0 0 12px ${color}60` }} />
    </div>
  </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
const TruckPrediction = () => {
  const { truckId } = useParams();
  const navigate    = useNavigate();

  const [truck,      setTruck]      = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab,  setActiveTab]  = useState(0);
  const [runCount,   setRunCount]   = useState(0);
  const refreshStartedAtRef = useRef(0);
  const manualRefreshRef = useRef(false);

  useEffect(() => {
    const found = trucks.find((t) => t.id === truckId);
    if (!found) { setError(`Truck "${truckId}" not found.`); setLoading(false); return; }
    setTruck(found);
  }, [truckId]);

  const runPrediction = useCallback(async (t) => {
    if (!t) return;
    setLoading(true); setError('');
    try {
      if (DEMO_MODE) {
        setPrediction(buildDemoPrediction(t));
        return;
      }
      const features = buildTruckFeatureVector(t);
      const res = await apiFetch('/predict/truck', {
        method: 'POST',
        body:   JSON.stringify({ features, vehicle_id: t.id }),
      });
      if (!res) return;
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || 'Prediction failed'); }
      setPrediction(await res.json());
    } catch (e) { setError(e.message); }
    finally {
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
  }, []);

  useEffect(() => { if (truck) runPrediction(truck); }, [truck, runCount]);

  const handleRefresh = () => {
    if (loading || refreshing) return;
    manualRefreshRef.current = true;
    refreshStartedAtRef.current = Date.now();
    setRefreshing(true);
    setRunCount((c) => c + 1);
  };

  const riskMeta      = prediction ? getTruckRiskLevel(prediction.predicted_class) : null;
  const sectionHealth = truck      ? getTruckSectionHealth(truck)                  : null;
  const alertCount    = truck      ? getAlertCount(truck)                           : 0;
  const tabSensors    = truck
    ? (SENSOR_TABS[TABS[activeTab]] ?? []).map((k) => ({ key: k, ...truck.sensors[k] })).filter(Boolean)
    : [];

  if (!truck && !error) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full" />
    </div>
  );

  if (error && !truck) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 btn-secondary">← Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-600 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-primary-500" />
                <h1 className="text-xl md:text-2xl font-outfit font-bold">
                  {truck.name}
                  <span className="text-gray-500 font-normal ml-2 text-base">{truck.year} · {truck.company}</span>
                </h1>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5">
                  <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-gray-400">Live CAN-bus</span>
                </div>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-500">{truck.route}</span>
                <span className="text-gray-700">·</span>
                <span className="text-xs text-gray-500">Synced {truck.lastSync}</span>
              </div>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={loading || refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
            <motion.div animate={loading || refreshing ? { rotate: 360 } : {}} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            <span className="text-sm font-medium">{loading || refreshing ? 'Re-running...' : 'Re-run Model'}</span>
          </button>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Odometer',      value: `${(truck.odometer / 1000).toFixed(0)}k km`,    icon: TrendingUp },
            { label: 'Engine Hours',  value: `${truck.engineHours.toLocaleString()} h`,       icon: Clock      },
            { label: 'Current Load',  value: `${truck.currentLoad}/${truck.loadCapacity}t`,   icon: BarChart2  },
            { label: 'Sensor Alerts', value: alertCount, icon: AlertTriangle, alert: alertCount > 0 },
          ].map((stat) => (
            <div key={stat.label} className={`glass-card p-4 flex items-center gap-3 ${stat.alert ? 'border-red-500/30' : ''}`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.alert ? 'bg-red-500/15' : 'bg-primary-500/10'}`}>
                <stat.icon className={`w-4 h-4 ${stat.alert ? 'text-red-400' : 'text-primary-500'}`} />
              </div>
              <div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className={`font-bold text-sm ${stat.alert ? 'text-red-400' : ''}`}>{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">

            {/* Risk Classification */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-outfit font-bold text-lg">Failure Risk Classification</h2>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Wifi className="w-3.5 h-3.5" />BiLSTM + Attention
                </div>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full" />
                </div>
              ) : prediction ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border"
                    style={{ backgroundColor: riskMeta.bgColor, borderColor: riskMeta.borderColor }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                      style={{ backgroundColor: `${riskMeta.color}20`, color: riskMeta.color, boxShadow: `0 0 20px ${riskMeta.color}40` }}>
                      {prediction.predicted_class}
                    </div>
                    <div>
                      <div className="text-xl font-bold font-outfit" style={{ color: riskMeta.color }}>{riskMeta.label}</div>
                      <div className="text-sm text-gray-400">{riskMeta.sublabel}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Failure window: <span className="font-semibold" style={{ color: riskMeta.color }}>{riskMeta.window}</span>
                      </div>
                    </div>
                  </div>
                  <RiskTimeline predictedClass={prediction.predicted_class} probabilities={prediction.probabilities} />
                  <ConfidenceBar pct={prediction.confidence_pct} color={riskMeta.color} />
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
              ) : null}
            </motion.div>

            {/* Status Banner */}
            {prediction && riskMeta && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl border flex items-start gap-3"
                style={{ backgroundColor: riskMeta.bgColor, borderColor: riskMeta.borderColor }}>
                {prediction.predicted_class === 0 && (<>
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: riskMeta.color }} />
                  <div><div className="font-semibold text-sm" style={{ color: riskMeta.color }}>Vehicle operating normally</div>
                    <div className="text-xs text-gray-400 mt-0.5">No failure expected within 48 hours. Schedule next inspection per routine plan.</div></div>
                </>)}
                {prediction.predicted_class === 1 && (<>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: riskMeta.color }} />
                  <div><div className="font-semibold text-sm" style={{ color: riskMeta.color }}>Elevated risk — schedule inspection</div>
                    <div className="text-xs text-gray-400 mt-0.5">APS sensors showing abnormal patterns. Recommend inspection within 24 hours.</div></div>
                </>)}
                {prediction.predicted_class === 2 && (<>
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: riskMeta.color }} />
                  <div><div className="font-semibold text-sm" style={{ color: riskMeta.color }}>Alert — limit operations and inspect today</div>
                    <div className="text-xs text-gray-400 mt-0.5">Multiple systems showing degraded readings. Reduce payload and inspect immediately.</div></div>
                </>)}
                {prediction.predicted_class === 3 && (<>
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: riskMeta.color }} /></motion.div>
                  <div><div className="font-semibold text-sm" style={{ color: riskMeta.color }}>Critical — suspend operations immediately</div>
                    <div className="text-xs text-gray-400 mt-0.5">Failure likely within 12 hours. Do not dispatch. Contact maintenance urgently.</div></div>
                </>)}
                {prediction.predicted_class === 4 && (<>
                  <motion.div animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: riskMeta.color }} /></motion.div>
                  <div><div className="font-bold text-sm" style={{ color: riskMeta.color }}>IMMINENT FAILURE — STOP VEHICLE NOW</div>
                    <div className="text-xs text-gray-400 mt-0.5">Pull over safely. Do not continue driving. Emergency maintenance required.</div></div>
                </>)}
              </motion.div>
            )}

            {/* Model Info */}
            {prediction && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-primary-500" />
                  <span className="text-sm font-semibold">Model Details</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Architecture',   value: 'BiLSTM + Attention'               },
                    { label: 'Input features', value: `${prediction.n_features} sensors`  },
                    { label: 'Sequence',       value: `${prediction.sequence_length} steps` },
                    { label: 'Classes',        value: '5 failure windows'                },
                  ].map((item) => (
                    <div key={item.label} className="p-3 rounded-xl bg-white/3">
                      <div className="text-[10px] text-gray-500 mb-1">{item.label}</div>
                      <div className="text-xs font-semibold text-primary-400">{item.value}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Health + Profile */}
          <div className="lg:col-span-2 space-y-6">
            {sectionHealth && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-outfit font-bold text-lg">System Health</h2>
                  <div className="text-sm font-bold text-primary-400">
                    {Math.round(Object.values(sectionHealth).reduce((a, b) => a + b, 0) / Object.values(sectionHealth).length)}% Overall
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 place-items-center">
                  {Object.entries(sectionHealth).map(([key, score], i) => (
                    <HealthRing key={key} score={score} label={SECTION_LABELS[key] ?? key} icon={SECTION_ICONS[key] ?? Activity} delay={0.25 + i * 0.08} />
                  ))}
                  <div className="col-span-3 flex justify-center mt-2">
                    <HealthRing score={Math.round(Object.values(sectionHealth).reduce((a, b) => a + b, 0) / Object.values(sectionHealth).length)}
                      label="Overall" icon={Shield} delay={0.65} />
                  </div>
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
              <h3 className="font-outfit font-bold mb-4 text-base">Vehicle Profile</h3>
              <div className="space-y-3">
                {[
                  { label: 'Model',         value: truck.name },
                  { label: 'Manufacturer',  value: truck.company },
                  { label: 'Year',          value: truck.year },
                  { label: 'Odometer',      value: `${truck.odometer.toLocaleString()} km` },
                  { label: 'Engine Hours',  value: `${truck.engineHours.toLocaleString()} h` },
                  { label: 'Capacity',      value: `${truck.loadCapacity} tonnes` },
                  { label: 'Current Route', value: truck.route },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sensor Readings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-outfit font-bold text-lg">Live Sensor Readings</h2>
            {alertCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-xs text-red-400 font-semibold">{alertCount} alert{alertCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map((tab, idx) => {
              const cnt = truck ? (SENSOR_TABS[tab] ?? []).filter((k) => truck.sensors[k] && isOutOfRange(truck.sensors[k])).length : 0;
              return (
                <button key={tab} onClick={() => setActiveTab(idx)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === idx ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
                  }`}>
                  {tab}
                  {cnt > 0 && <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">{cnt}</span>}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {tabSensors.length > 0
                ? tabSensors.map((sensor, i) => <SensorTile key={sensor.key} sensor={sensor} delay={i * 0.04} />)
                : <div className="col-span-full text-center py-8 text-gray-500 text-sm">No sensors for this tab.</div>}
            </motion.div>
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default TruckPrediction;