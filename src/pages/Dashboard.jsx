import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Battery, Car, AlertTriangle, CheckCircle,
  Upload, BarChart3, Clock, Activity, ArrowRight, X, Zap, Truck
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ResponsiveContainer, Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import evMockData from '../mock/evmockData';
import trucks from '../mock/truckMockData';

// ─── Shared status config ────────────────────────────────────────────────────

const statusConfig = {
  healthy:  { label: 'Healthy',  dotColor: '#1D9E75', textColor: 'text-green-400',  borderColor: 'border-green-500/50',  bg: 'bg-green-500/10'  },
  warning:  { label: 'Warning',  dotColor: '#BA7517', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
  critical: { label: 'Critical', dotColor: '#E24B4A', textColor: 'text-red-400',    borderColor: 'border-red-500/50',    bg: 'bg-red-500/10'    },
};

// ─── EV Car Selector Modal ───────────────────────────────────────────────────

const EVCarSelectorModal = ({ onClose }) => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (selected) navigate(`/predict/${selected.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Battery className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-outfit font-bold">EV Prediction</h2>
          </div>
          <p className="text-sm text-gray-400 ml-12">Select a vehicle to run the health model</p>
        </div>

        <div className="space-y-3 mb-6">
          {evMockData.map(car => {
            const s = statusConfig[car.status];
            const isSelected = selected?.id === car.id;
            return (
              <motion.button
                key={car.id}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(car)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected ? `${s.borderColor} ${s.bg}` : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.dotColor }} />
                    <div>
                      <div className="font-outfit font-semibold text-sm">{car.carName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{car.carCompany} · {car.year}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-400">SoC <span className="text-white font-mono font-semibold">{car.SoC}%</span></div>
                      <div className="text-xs text-gray-400 mt-0.5">SoH <span className="text-white font-mono font-semibold">{car.SoH}%</span></div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.textColor} ${s.bg} border ${s.borderColor}`}>
                      {s.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2"
                    >
                      {[
                        { label: 'Battery Temp',  value: `${car.Battery_Temperature}°C` },
                        { label: 'Charge Cycles', value: car.Charge_Cycles },
                        { label: 'Motor RPM',     value: car.Motor_RPM },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <div className="text-xs text-gray-400">{m.label}</div>
                          <div className="text-sm font-mono font-bold mt-0.5">{m.value}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={selected ? { scale: 1.02 } : {}} whileTap={selected ? { scale: 0.98 } : {}}
          onClick={handleStart} disabled={!selected}
          className={`w-full py-3 rounded-xl font-outfit font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            selected
              ? 'bg-gradient-to-r from-primary-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-primary-500/25'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4" />
          {selected ? `Run prediction — ${selected.carName}` : 'Select a vehicle to continue'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Truck Selector Modal ────────────────────────────────────────────────────

const TruckSelectorModal = ({ onClose }) => {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const handleStart = () => {
    if (selected) navigate(`/predict/truck/${selected.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="glass-card w-full max-w-md p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <X className="w-4 h-4 text-gray-400" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-outfit font-bold">Truck / Bus Prediction</h2>
          </div>
          <p className="text-sm text-gray-400 ml-12">Select a vehicle to run the failure model</p>
        </div>

        <div className="space-y-3 mb-6">
          {trucks.map(truck => {
            const s = statusConfig[truck.status];
            const isSelected = selected?.id === truck.id;
            return (
              <motion.button
                key={truck.id}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(truck)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected ? `${s.borderColor} ${s.bg}` : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.dotColor }} />
                    <div>
                      <div className="font-outfit font-semibold text-sm">{truck.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{truck.company} · {truck.year}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs text-gray-400">Hours <span className="text-white font-mono font-semibold">{truck.engineHours.toLocaleString()}</span></div>
                      <div className="text-xs text-gray-400 mt-0.5">Load <span className="text-white font-mono font-semibold">{truck.currentLoad}t</span></div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.textColor} ${s.bg} border ${s.borderColor}`}>
                      {s.label}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 grid grid-cols-3 gap-2"
                    >
                      {[
                        { label: 'Odometer',   value: `${(truck.odometer / 1000).toFixed(0)}k km` },
                        { label: 'Engine Hrs', value: truck.engineHours.toLocaleString() },
                        { label: 'Route',      value: truck.route.split('→')[0].trim() },
                      ].map(m => (
                        <div key={m.label} className="text-center">
                          <div className="text-xs text-gray-400">{m.label}</div>
                          <div className="text-sm font-mono font-bold mt-0.5">{m.value}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={selected ? { scale: 1.02 } : {}} whileTap={selected ? { scale: 0.98 } : {}}
          onClick={handleStart} disabled={!selected}
          className={`w-full py-3 rounded-xl font-outfit font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            selected
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:shadow-lg hover:shadow-orange-500/25'
              : 'bg-white/5 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Truck className="w-4 h-4" />
          {selected ? `Run prediction — ${selected.name}` : 'Select a vehicle to continue'}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user }  = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const [showEVModal,    setShowEVModal]    = useState(false);
  const [showTruckModal, setShowTruckModal] = useState(false);

  // Auto-open modal when navigated here from Navbar submenu
  useEffect(() => {
    const modal = location.state?.openModal;
    if (modal === 'ev')    setShowEVModal(true);
    if (modal === 'truck') setShowTruckModal(true);
    window.history.replaceState({}, '');
  }, [location.state]);

  const statsData = [
    { value: '524', label: 'Total Fleet',   sublabel: '+12% this month', trend: 'up',   icon: Car,           color: 'primary' },
    { value: '487', label: 'Healthy Units', sublabel: '93% of fleet',    trend: 'up',   icon: CheckCircle,   color: 'success' },
    { value: '28',  label: 'Warning',       sublabel: '5% of fleet',     trend: 'up',   icon: AlertTriangle, color: 'warning' },
    { value: '9',   label: 'Critical',      sublabel: '2% of fleet',     trend: 'down', icon: Activity,      color: 'danger'  },
  ];

  const chartData = [
    { date: 'Jan 10', health: 92, soh: 88 },
    { date: 'Jan 11', health: 91, soh: 87 },
    { date: 'Jan 12', health: 93, soh: 89 },
    { date: 'Jan 13', health: 90, soh: 86 },
    { date: 'Jan 14', health: 92, soh: 88 },
    { date: 'Jan 15', health: 91, soh: 87 },
    { date: 'Today',  health: 93, soh: 89 },
  ];

  const recentPredictions = [
    { id: 'EV-1234',  type: 'EV',    rul: 127, status: 'Good',     time: '2h ago' },
    { id: 'TRK-5678', type: 'Truck', rul: 89,  status: 'Good',     time: '3h ago' },
    { id: 'EV-9012',  type: 'EV',    rul: 45,  status: 'Warning',  time: '5h ago' },
    { id: 'TRK-3456', type: 'Truck', rul: 15,  status: 'Critical', time: '1d ago' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good':     return 'success';
      case 'Warning':  return 'warning';
      case 'Critical': return 'danger';
      default:         return 'gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EV':    return <Battery className="w-5 h-5 text-primary-500" />;
      case 'Truck': return <Truck   className="w-5 h-5 text-orange-400"  />;
      default:      return <Car     className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'EV':    return 'bg-primary-500/10 text-primary-500 border-primary-500/30';
      case 'Truck': return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:      return 'bg-secondary-500/10 text-secondary-500 border-secondary-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-dark-600 pt-20 md:pt-24 px-4 md:px-6 pb-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-outfit font-bold">
              Welcome back, <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm md:text-base">{user?.email}</p>
          </div>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="hidden sm:block">
            <Battery className="w-10 h-10 md:w-12 md:h-12 text-primary-500" />
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {statsData.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
              className="glass-card p-4 md:p-6 card-hover"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`w-9 h-9 md:w-12 md:h-12 bg-${stat.color}/10 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 md:w-6 md:h-6 text-${stat.color}`} />
                </div>
                <span className={`text-xs hidden sm:block ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  {stat.trend === 'up' ? '↑' : '↓'} {stat.sublabel}
                </span>
              </div>
              <div className="text-2xl md:text-4xl font-bold font-mono gradient-text mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs md:text-sm">{stat.label}</div>
              <span className={`text-xs sm:hidden ${stat.trend === 'up' ? 'text-success' : 'text-danger'}`}>
                {stat.trend === 'up' ? '↑' : '↓'} {stat.sublabel}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-xl md:text-2xl font-outfit font-bold mb-3 md:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            {/* EV Predict */}
            <button onClick={() => setShowEVModal(true)} className="glass-card p-4 md:p-6 card-hover group text-center w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Battery className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-outfit font-bold text-sm md:text-lg mb-1 md:mb-2">Predict EV</h3>
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 hidden sm:block">Battery Health Analysis</p>
              <div className="text-primary-500 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1 md:gap-2 text-sm">
                Start <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </button>

            {/* Truck Predict */}
            <button onClick={() => setShowTruckModal(true)} className="glass-card p-4 md:p-6 card-hover group text-center w-full">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-outfit font-bold text-sm md:text-lg mb-1 md:mb-2">Predict Truck</h3>
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 hidden sm:block">Commercial Vehicle Analysis</p>
              <div className="text-orange-400 group-hover:translate-x-2 transition-transform inline-flex items-center gap-1 md:gap-2 text-sm">
                Start <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </button>

            {/* Batch Upload */}
            <button className="glass-card p-4 md:p-6 card-hover group text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-success to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-outfit font-bold text-sm md:text-lg mb-1 md:mb-2">Batch Upload</h3>
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 hidden sm:block">Multiple Vehicles</p>
              <div className="text-success group-hover:translate-x-2 transition-transform inline-flex items-center gap-1 md:gap-2 text-sm">
                Upload CSV <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </button>

            {/* Analytics */}
            <Link to="/analytics" className="glass-card p-4 md:p-6 card-hover group text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-warning to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="font-outfit font-bold text-sm md:text-lg mb-1 md:mb-2">Analytics</h3>
              <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 hidden sm:block">Detailed Insights</p>
              <div className="text-warning group-hover:translate-x-2 transition-transform inline-flex items-center gap-1 md:gap-2 text-sm">
                View <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </Link>

          </div>
        </motion.div>

        {/* Fleet Health Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-outfit font-bold">Fleet Health Overview</h2>
            <select className="bg-dark-500/50 border border-white/10 rounded-lg px-2 md:px-4 py-1.5 md:py-2 text-xs md:text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-48 sm:h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00D9FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1E2433', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', fontSize: '12px' }} />
                <Area type="monotone" dataKey="health" stroke="#00D9FF" strokeWidth={2} fill="url(#healthGradient)" name="Health Score" />
                <Area type="monotone" dataKey="soh"    stroke="#6366F1" strokeWidth={2} fill="url(#sohGradient)"    name="SoH" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 md:gap-8 mt-3 md:mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-primary-500 rounded-full" />
              <span className="text-xs md:text-sm text-gray-400">Health Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-secondary-500 rounded-full" />
              <span className="text-xs md:text-sm text-gray-400">State of Health</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Predictions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-outfit font-bold">Recent Predictions</h2>
            <Link to="/history" className="text-primary-500 hover:text-primary-400 text-xs md:text-sm flex items-center gap-1 md:gap-2">
              View All <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            </Link>
          </div>

          {/* Mobile */}
          <div className="space-y-3 md:hidden">
            {recentPredictions.map((prediction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }}
                className="p-3 rounded-xl bg-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {getTypeIcon(prediction.type)}
                  <div>
                    <div className="font-mono font-semibold text-sm">{prediction.id}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {prediction.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-sm">{prediction.rul}d</div>
                  <span className={`badge-${getStatusColor(prediction.status)} text-xs`}>{prediction.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Vehicle ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">RUL</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Updated</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentPredictions.map((prediction, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + index * 0.1 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(prediction.type)}
                        <span className="font-mono font-semibold">{prediction.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeBadge(prediction.type)}`}>
                        {prediction.type}
                      </span>
                    </td>
                    <td className="py-4 px-4"><span className="font-mono font-bold">{prediction.rul} days</span></td>
                    <td className="py-4 px-4">
                      <span className={`badge-${getStatusColor(prediction.status)}`}>
                        {prediction.status === 'Good'     && <CheckCircle   className="w-3 h-3" />}
                        {prediction.status === 'Warning'  && <AlertTriangle className="w-3 h-3" />}
                        {prediction.status === 'Critical' && <Activity      className="w-3 h-3" />}
                        {prediction.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      <Clock className="inline-block w-4 h-4 mr-1" />{prediction.time}
                    </td>
                    <td className="py-4 px-4">
                      <button className="text-primary-500 hover:text-primary-400 text-sm font-semibold">View Details</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEVModal    && <EVCarSelectorModal onClose={() => setShowEVModal(false)}    />}
        {showTruckModal && <TruckSelectorModal onClose={() => setShowTruckModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;