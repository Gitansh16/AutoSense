import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, Car, BarChart3, Shield, Zap, TrendingUp, 
  CheckCircle, ArrowRight, Play, Users, Award, Clock,
  ChevronRight, Sparkles, Activity, Menu, X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  // Mouse position for interactive background gradient (desktop only)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Mobile menu toggle state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const openAutoPilotChat = () => {
    window.dispatchEvent(new Event('open-autopilot-chat'));
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  
  // Track mouse movement for gradient orb effect (desktop only)
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // ============================================================================
  // DATA CONFIGURATION
  // ============================================================================
  
  // Stats displayed in the stats section
  const statsData = [
    { value: '95%', label: 'Prediction Accuracy', icon: Award },
    { value: '2', label: 'ML Models', sublabel: 'EV + Normal', icon: BarChart3 },
    { value: '<12', label: 'Days MAE', sublabel: 'Mean Error', icon: Clock },
    { value: '500+', label: 'Fleet Vehicles', icon: Users },
  ];

  // Features displayed in the features section
  const featuresData = [
    {
      icon: Battery,
      title: 'EV Battery Intelligence',
      description: 'Lithium-ion battery health monitoring with RUL prediction and SoH analysis',
      gradient: 'from-primary-500 to-cyan-500',
      badge: 'Electric',
      stats: '95% Accuracy'
    },
    {
      icon: Car,
      title: 'Engine Analytics',
      description: 'ICE diagnostics covering engine wear, oil quality, and transmission health',
      gradient: 'from-secondary-500 to-purple-500',
      badge: 'Combustion',
      stats: '92% Accuracy'
    },
    {
      icon: Activity,
      title: 'Dual Powertrain',
      description: 'Unified platform supporting both electric and combustion engines',
      gradient: 'from-indigo-500 to-blue-500',
      badge: 'Hybrid Ready',
      stats: '2 Models'
    },
    {
      icon: BarChart3,
      title: 'Predictive Analytics',
      description: 'Real-time dashboards with SHAP explainability and trend visualization',
      gradient: 'from-success to-emerald-500',
      badge: 'AI-Powered',
      stats: 'Live Data'
    },
    {
      icon: Shield,
      title: 'Proactive Maintenance',
      description: 'Early warning system predicting failures weeks in advance',
      gradient: 'from-warning to-orange-500',
      badge: 'Smart Alerts',
      stats: '30 Days Ahead'
    },
    {
      icon: TrendingUp,
      title: 'Cost Optimization',
      description: 'Reduce expenses by 40% through predictive scheduling',
      gradient: 'from-danger to-pink-500',
      badge: 'ROI Focused',
      stats: '40% Savings'
    },
  ];

  // How it works steps
  const stepsData = [
    { step: '01', title: 'Sign Up', description: 'Create your account', icon: Users },
    { step: '02', title: 'Choose Vehicle', description: 'Select EV or Normal vehicle', icon: Car },
    { step: '03', title: 'Input Data', description: 'OBD Port 2 Data', icon: Activity },
    { step: '04', title: 'Get Predictions', description: 'Receive instant Car status', icon: CheckCircle },
  ];

  // EV Model features
  const evFeatures = [
    'Battery RUL Prediction',
    'State of Health (SoH) Analysis',
    'Charge Cycle Monitoring',
    'Temperature Impact Assessment',
    'Voltage & Current Tracking',
    'Range Estimation',
  ];

  // Normal Vehicle Model features
  const normalFeatures = [
    'Engine Health Monitoring',
    'Component Failure Prediction',
    'Oil & Fluid Analysis',
    'Brake System Assessment',
    'Transmission Health',
    'Scheduled Maintenance Alerts',
  ];

  // Orbiting icons configuration for hero 3D visual
  const orbitingIcons = [
    { icon: Shield, color: 'text-success', delay: 0 },
    { icon: Zap, color: 'text-warning', delay: 0.25 },
    { icon: Activity, color: 'text-danger', delay: 0.5 },
    { icon: TrendingUp, color: 'text-primary-500', delay: 0.75 },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-dark-600">
      
      {/* ========================================================================
          ANIMATED BACKGROUND
          - Gradient orbs and floating particles
          - Desktop only for performance
          - Pointer-events-none to avoid blocking clicks
      ======================================================================== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base animated background gradient */}
        <div className="absolute inset-0 animated-bg opacity-50" />
        
        {/* Floating Particles - Hidden on mobile for performance */}
        <div className="hidden md:block">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        {/* Gradient Orbs - Reduced on mobile */}
        {/* Mouse-following orb - Desktop only */}
        <motion.div
          className="hidden lg:block absolute w-[90px] h-[90px] bg-primary-500/20 rounded-full blur-lg"
          style={{
            left: mousePosition.x - 45,
            top: mousePosition.y - 45,
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        />
        
        {/* Static gradient orbs - Smaller on mobile */}
        <div className="absolute top-20 right-20 w-48 md:w-96 h-48 md:h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-20 left-20 w-48 md:w-96 h-48 md:h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* ========================================================================
          NAVIGATION BAR
          - Responsive with hamburger menu on mobile
          - Glass morphism effect
          - Sticky positioning
      ======================================================================== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 glass-card mx-2 md:mx-4 mt-1 md:mt-3 px-4 md:px-6 py-1.5 md:py-2"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-4 group">
            <div className="relative">
              <Battery className="w-6 h-6 md:w-8 md:h-8 text-primary-500 group-hover:text-primary-400 transition-colors" />
              {/* Pulsing glow effect */}
              <motion.div
                className="absolute inset-0 bg-primary-500/20 rounded-full blur-xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-lg md:text-3xl font-outfit font-bold gradient-text">
              AutoSense
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-md text-gray-300 hover:text-primary-500 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-md text-gray-300 hover:text-primary-500 transition-colors">
              How It Works
            </a>
            <button
              type="button"
              onClick={openAutoPilotChat}
              className="text-md text-gray-300 hover:text-primary-500 transition-colors"
            >
              AutoPilot
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-md text-gray-300 hover:text-primary-500 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="btn-primary text-sm">
              Get Started
              <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-300 hover:text-primary-500 transition-colors p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-col gap-3 border-t border-white/10 mt-4">
                <a 
                  href="#features" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-primary-500 transition-colors py-2"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-300 hover:text-primary-500 transition-colors py-2"
                >
                  How It Works
                </a>
                <button
                  type="button"
                  onClick={() => {
                    openAutoPilotChat();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-gray-300 hover:text-primary-500 transition-colors py-2"
                >
                  AutoPilot
                </button>
                <div className="flex flex-col gap-3 pt-3 border-t border-white/10">
                  <Link 
                    to="/login" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-center py-2 text-gray-300 hover:text-primary-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="btn-primary text-center"
                  >
                    Get Started
                    <ArrowRight className="inline-block ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ========================================================================
          HERO SECTION
          - Main headline and CTA
          - 3D visual on desktop, simplified on mobile
          - Responsive grid layout
      ======================================================================== */}
        <section className="relative z-10 pb-8 md:pb-16 px-4">
          <div className="max-w-7xl mx-auto mt-16 md:mt-28">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            
            {/* Left Content - Text and CTAs */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-primary-500/10 border border-primary-500/30 rounded-full mb-4 md:mb-6"
              >
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-primary-500" />
                <span className="text-xs md:text-sm text-primary-400">AI-Powered Predictions</span>
              </motion.div>

              {/* Main Headline - Reduced from text-5xl/7xl to text-3xl/5xl */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl lg:text-5xl font-outfit font-bold mb-4 md:mb-6 leading-relaxed"
              >
                Predict Vehicle{' '}
                <span className="gradient-text">Failures</span>
                <br />
                Before They Happen
              </motion.h1>

              {/* Subheadline - Reduced from text-xl to text-base/lg */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg text-gray-400 mb-6 md:mb-8 leading-relaxed"
              >
                AI-powered predictive maintenance for Electric Vehicles and Internal Combustion Engine vehicles.
                Prevent costly breakdowns, extend vehicle life, and optimize your fleet operations.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4"
              >
                <Link to="/signup" className="btn-primary text-sm md:text-base group">
                  Connect with your Vehicle
                  <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              {/* Vehicle Type Tags */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-3 md:gap-4 mt-6 md:mt-8"
              >
                <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 glass-card">
                  <Battery className="w-4 h-4 md:w-5 md:h-5 text-primary-500" />
                  <span className="text-xs md:text-sm">Electric Vehicles</span>
                </div>
                <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 glass-card">
                  <Car className="w-4 h-4 md:w-5 md:h-5 text-secondary-500" />
                  <span className="text-xs md:text-sm">Internal Combustion Engine Vehicles</span>
                </div>
              </motion.div>
            </motion.div>

            {/* 
              ================================================================
              RIGHT SIDE - 3D VISUAL
              FIXED: Separated desktop and mobile versions properly
              - Both have proper conditional rendering to prevent overlap
              ================================================================
            */}
            
            {/* RIGHT SIDE VISUAL - Desktop version only */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
                <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Rotating Circular Borders */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-primary-500/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 rounded-full border-2 border-secondary-500/30"
                />
                
               {/* Center Icon - Car */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="relative"
                    >
                      <div className="w-28 md:w-32 h-28 md:h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center electric-glow">
                       <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 md:w-24 h-20 md:h-24">
                          <path d="M6 30h36v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" fill="white" opacity=".9"/>
                          <path d="M8 30l4-10h24l4 10" fill="white" opacity=".6"/>
                          <path d="M13 20l3-6h16l3 6" fill="white" opacity=".3"/>
                          <circle cx="14" cy="34" r="4" fill="white" opacity=".95"/>
                          <circle cx="34" cy="34" r="4" fill="white" opacity=".95"/>
                          <circle cx="14" cy="34" r="2" fill="#1D9E75"/>
                          <circle cx="34" cy="34" r="2" fill="#1D9E75"/>
                          <rect x="16" y="21" width="16" height="7" rx="1" fill="white" opacity=".2"/>
                        </svg>
                      </div>
                      {/* Pulsing glow effect */}
                      <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary-500/30 rounded-3xl blur-xl"
                      />
                    </motion.div>
                  </div>

                {/* Orbiting Icons */}
                {orbitingIcons.map((item, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      top: '50%',
                      left: '50%',
                      marginTop: '-24px',
                      marginLeft: '-24px',
                    }}
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: item.delay * 10,
                    }}
                  >
                    <motion.div
                      style={{
                        transform: 'translateX(180px)',
                      }}
                      animate={{
                        rotate: -360,
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: item.delay * 10,
                      }}
                    >
                      
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ========================================================================
          FEATURES SECTION
          - Product features grid
          - 1 col mobile, 2 cols tablet, 3 cols desktop
          - Reduced text and padding for mobile
      ======================================================================== */}
      <section id="features" className="relative z-10 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-10"
          >
            {/* Reduced from text-4xl/5xl to text-2xl/3xl/4xl */}
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-outfit font-bold mb-3 md:mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            {/* Reduced from text-xl to text-sm/base/lg */}
            <p className="text-sm md:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
              Advanced AI algorithms combined with real-time monitoring to keep your fleet running smoothly
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {featuresData.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-4 card-hover group cursor-pointer relative overflow-hidden"
              >
                {/* Background Gradient on Hover */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />

                {/* Badge - Reduced size */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10">
                  <span className="text-xs font-bold px-2 md:px-3 py-1 rounded-full bg-white/10 text-primary-400 border border-primary-500/30">
                    {feature.badge}
                  </span>
                </div>

                {/* Icon Container - Reduced size */}
                <div className={`relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 z-10`}>
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  
                  {/* Icon Glow Effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-50`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Title - Reduced from text-2xl to text-lg/xl */}
                <h3 className="text-lg md:text-xl font-outfit font-bold mb-2 md:mb-3 group-hover:text-primary-400 transition-colors relative z-10">
                  {feature.title}
                </h3>

                {/* Description - Reduced from base to sm/base and shortened */}
                <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-3 md:mb-4 relative z-10">
                  {feature.description}
                </p>

                {/* Stats Badge */}
                <div className="flex items-center gap-2 text-xs md:text-sm relative z-10">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                  <span className="text-primary-500 font-semibold">{feature.stats}</span>
                </div>

                {/* Bottom Accent Line */}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ========================================================================
          HOW IT WORKS SECTION
          - 4-step process
          - Responsive: 1 col mobile, 2 cols tablet, 4 cols desktop
      ======================================================================== */}
      <section id="how-it-works" className="relative z-10 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-6"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-outfit font-bold mb-3 md:mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
              Get started in minutes with our simple 4-step process
            </p>
          </motion.div>

          {/* Steps Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stepsData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-6 md:p-8 text-center">
                  {/* Step Number - Reduced from text-6xl to text-4xl/5xl */}
                  <div className="text-4xl md:text-5xl font-bold font-mono text-primary-500/20 mb-3 md:mb-4">
                    {item.step}
                  </div>
                  
                  {/* Icon - Reduced size */}
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <item.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  
                  {/* Title - Reduced from text-xl to text-base/lg */}
                  <h3 className="text-base md:text-lg font-outfit font-bold mb-2 md:mb-3">{item.title}</h3>
                  
                  {/* Description - Reduced size */}
                  <p className="text-sm md:text-base text-gray-400">{item.description}</p>
                </div>
                
                {/* Arrow Between Steps - Hidden on mobile, shown on lg+ */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-primary-500/50" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      
      {/* ========================================================================
          STATS SECTION
          - Key metrics display
          - Responsive grid: 2 cols on mobile, 4 on desktop
      ======================================================================== */}
      <section className="relative z-10 py-4 md:py-4 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-4 md:p- grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          >
            {statsData.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                {/* Icon */}
                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-primary-500 mx-auto mb-3 md:mb-4" />
                
                {/* Value - Reduced from text-4xl to text-2xl/3xl */}
                <div className="text-2xl md:text-3xl font-bold font-mono gradient-text mb-1 md:mb-2">
                  {stat.value}
                </div>
                
                {/* Label - Reduced font size */}
                <div className="text-xs md:text-sm text-gray-300 font-semibold">{stat.label}</div>
                
                {/* Sublabel if exists */}
                {stat.sublabel && (
                  <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>


      {/* ========================================================================
          DUAL MODEL SHOWCASE SECTION
          - EV vs Normal Vehicle models comparison
          - Stacks on mobile, side-by-side on desktop
      ======================================================================== */}
      <section className="relative z-10 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-outfit font-bold mb-3 md:mb-4">
              Dual <span className="gradient-text">Model Support</span>
            </h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto">
              Specialized AI models for both electric and conventional vehicles
            </p>
          </motion.div>

          {/* Models Grid */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            
            {/* EV Model Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-10 card-hover group"
            >
              {/* Header */}
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Battery className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-outfit font-bold">EV Model</h3>
                  <p className="text-sm md:text-base text-primary-400">Electric Vehicles</p>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2 md:space-y-3">
                {evFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 md:gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-primary-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Normal Vehicle Model Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6 md:p-10 card-hover group"
            >
              {/* Header */}
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-secondary-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6 md:w-8 md:h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-outfit font-bold">Normal Model</h3>
                  <p className="text-sm md:text-base text-secondary-400">Internal Combustion Engine Vehicles</p>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2 md:space-y-3">
                {normalFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 md:gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-secondary-500 flex-shrink-0" />
                    <span className="text-sm md:text-base text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          CALL TO ACTION SECTION
          - Final conversion push
          - Prominent CTA button
      ======================================================================== */}
      <section className="relative z-10 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-8 md:p-12 text-center electric-glow"
          >
            {/* Headline - Reduced size */}
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-outfit font-bold mb-4 md:mb-6">
              Ready to Prevent <span className="gradient-text">Costly Breakdowns?</span>
            </h2>
            
            {/* Description - Reduced size */}
            <p className="text-sm md:text-base lg:text-lg text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto">
              Join hundreds of fleet managers who trust AutoSense to keep their vehicles running smoothly
            </p>
            
            {/* CTA Button */}
            <Link to="/signup" className="btn-primary text-sm md:text-base inline-flex items-center group">
              Login / SignUp
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            
            {/* Subtext */}
            <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">It's Completely Free</p>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================
          FOOTER
          - Site links and copyright
          - Responsive layout
      ======================================================================== */}
      <footer className="relative z-10 py-8 md:py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <Battery className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
              <span className="text-lg md:text-xl font-outfit font-bold gradient-text">
                AutoSense
              </span>
            </div>
            
            {/* Links - Reduced size */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-gray-400">
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
            </div>
            
            {/* Copyright - Reduced size */}
            <div className="text-xs md:text-sm text-gray-500">
              © 2026 AutoSense. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


export default Homepage;
