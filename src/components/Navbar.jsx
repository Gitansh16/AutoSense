import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Battery, Home, Activity, BarChart3, History, Settings, 
  Bell, User, LogOut, Menu, X, Sun, Moon, ChevronDown, Clock, CheckCircle, Truck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [mobileMenuOpen,    setMobileMenuOpen]    = useState(false);
  const [darkMode,          setDarkMode]          = useState(true);
  const [userMenuOpen,      setUserMenuOpen]      = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [scrolled,          setScrolled]          = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuOpen || notificationsOpen) {
        const target = event.target;
        if (!target.closest('.user-menu') && !target.closest('.notifications-menu')) {
          setUserMenuOpen(false);
          setNotificationsOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen, notificationsOpen]);

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: Home,
      description: 'Fleet overview'
    },
    { 
      path: '/predict', 
      label: 'Predict', 
      icon: Activity,
      description: 'Run predictions',
      submenu: [
        { label: 'EV Battery',  icon: Battery,  modal: 'ev'    },
        { label: 'Truck / Bus', icon: Truck,    modal: 'truck' },
        { label: 'ICE Car',     icon: Activity, modal: 'ice'   },
      ]
    },
    { 
      path: '/history', 
      label: 'History', 
      icon: History,
      description: 'Past predictions'
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Insights & reports'
    },
  ];

  const notifications = [
    { 
      id: 1, type: 'warning', title: 'Battery Low Alert',
      message: 'Vehicle #EV-1234 needs attention',
      time: '5m ago', icon: Battery, color: 'warning'
    },
    { 
      id: 2, type: 'success', title: 'Prediction Complete',
      message: 'Batch analysis finished',
      time: '1h ago', icon: CheckCircle, color: 'success'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmenuClick = (modal) => {
    navigate('/dashboard', { state: { openModal: modal } });
  };

  const handleMobileSubmenuClick = (modal) => {
    setMobileMenuOpen(false);
    navigate('/dashboard', { state: { openModal: modal } });
  };

  const handleNotificationToggle = () => {
    setNotificationsOpen(!notificationsOpen);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass-card mx-2 md:mx-4 mt-2 md:mt-4 px-3 md:px-6 py-2 shadow-2xl' 
            : 'bg-dark-600/80 backdrop-blur-xl px-3 md:px-6 py-2 md:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 group relative">
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Battery className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-primary-500 group-hover:text-primary-400 transition-colors" />
                </motion.div>
                <motion.div
                  className="hidden md:block absolute inset-0 bg-primary-500/30 rounded-full blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <span className="text-lg md:text-xl lg:text-2xl font-outfit font-bold gradient-text">
                  AutoSense
                </span>
                <span className="text-xs text-gray-500 hidden xl:block">
                  AI-Powered Fleet Management
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const isActive    = location.pathname.startsWith(item.path);
                const hasSubmenu  = item.submenu && item.submenu.length > 0;

                return (
                  <div key={item.path} className="relative group">
                    <Link
                      to={!hasSubmenu ? item.path : '#'}
                      onClick={(e) => hasSubmenu && e.preventDefault()}
                      className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-xl transition-all relative overflow-hidden ${
                        isActive ? 'text-primary-400' : 'text-gray-400 hover:text-primary-500'
                      }`}
                    >
                      <motion.div
                        className="absolute inset-0 bg-primary-500/10 rounded-xl"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      <item.icon className="w-4 h-4 xl:w-5 xl:h-5 relative z-10" />
                      <div className="relative z-10">
                        <div className="font-medium text-sm xl:text-base">{item.label}</div>
                        <div className="text-xs text-gray-500 hidden 2xl:block">{item.description}</div>
                      </div>
                      {hasSubmenu && (
                        <ChevronDown className="w-3 h-3 xl:w-4 xl:h-4 relative z-10 transition-transform group-hover:rotate-180" />
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeNavTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>

                    {/* Desktop Dropdown Submenu */}
                    {hasSubmenu && (
                      <div className="absolute top-full mt-2 left-0 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50">
                        <div className="glass-card p-2 min-w-[200px] shadow-xl">
                          {item.submenu.map((subitem) => (
                            <button
                              key={subitem.label}
                              onClick={() => handleSubmenuClick(subitem.modal)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm"
                            >
                              <subitem.icon className="w-4 h-4 text-primary-500" />
                              <span className="text-gray-300">{subitem.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 md:gap-3">

              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="hidden sm:flex w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 items-center justify-center transition-colors relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {darkMode ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications */}
              <div className="relative notifications-menu">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNotificationToggle}
                  className="relative w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                  {notifications.length > 0 && (
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-danger rounded-full flex items-center justify-center text-xs font-bold"
                    >
                      {notifications.length}
                    </motion.span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {notificationsOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setNotificationsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/20 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 sm:w-80 glass-card p-3 md:p-4 max-h-96 overflow-y-auto custom-scrollbar z-50"
                      >
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <h3 className="font-outfit font-bold text-base md:text-lg">Notifications</h3>
                          <button className="text-xs text-primary-500 hover:text-primary-400 transition-colors">Mark all read</button>
                        </div>
                        {notifications.length > 0 ? (
                          <div className="space-y-2">
                            {notifications.map((notif, index) => (
                              <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-${notif.color}/10 flex items-center justify-center flex-shrink-0`}>
                                    <notif.icon className={`w-4 h-4 md:w-5 md:h-5 text-${notif.color}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-xs md:text-sm">{notif.title}</div>
                                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{notif.message}</div>
                                    <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />{notif.time}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        )}
                        <button className="w-full mt-3 md:mt-4 text-xs md:text-sm text-primary-500 hover:text-primary-400 font-medium transition-colors">
                          View all notifications
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative user-menu hidden sm:block">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="User menu"
                >
                  <div className="relative">
                    <div className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg md:rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-success rounded-full border-2 border-dark-600" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-xs md:text-sm font-semibold">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{user?.email || ''}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-400 hidden md:block" />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setUserMenuOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/20 z-40"
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 md:w-64 glass-card p-2 z-50"
                      >
                        <div className="px-3 md:px-4 py-2 md:py-3 border-b border-white/10 mb-2">
                          <div className="font-semibold text-sm md:text-base">{user?.name || 'User'}</div>
                          <div className="text-xs md:text-sm text-gray-400 truncate">{user?.email || ''}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="badge-success text-xs">Pro Plan</span>
                            <span className="text-xs text-gray-500">• 1 vehicle</span>
                          </div>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        >
                          <User className="w-4 h-4 text-primary-500" />
                          <span>Profile Settings</span>
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm"
                        >
                          <Settings className="w-4 h-4 text-primary-500" />
                          <span>Preferences</span>
                        </Link>
                        <div className="border-t border-white/10 my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-danger/10 text-danger transition-colors text-sm"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Toggle mobile menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-5 h-5 text-gray-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm glass-card z-50 lg:hidden overflow-y-auto custom-scrollbar"
            >
              <div className="p-4 md:p-6">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                  <Battery className="w-7 h-7 md:w-8 md:h-8 text-primary-500" />
                  <span className="text-lg md:text-xl font-outfit font-bold gradient-text">AutoSense</span>
                </div>

                <div className="space-y-1 md:space-y-2 mb-6">
                  {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <div key={item.path}>
                        <Link
                          to={item.submenu ? '#' : item.path}
                          onClick={(e) => {
                            if (item.submenu) { e.preventDefault(); return; }
                            setMobileMenuOpen(false);
                          }}
                          className={`flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all ${
                            isActive
                              ? 'bg-primary-500/10 text-primary-500'
                              : 'text-gray-400 hover:text-primary-500 hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <div className="flex-1">
                            <div className="font-medium text-sm md:text-base">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.description}</div>
                          </div>
                          {item.submenu && <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </Link>

                        {item.submenu && (
                          <div className="ml-3 md:ml-4 mt-1 md:mt-2 space-y-1">
                            {item.submenu.map((sub) => (
                              <button
                                key={sub.label}
                                onClick={() => handleMobileSubmenuClick(sub.modal)}
                                className="w-full flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm text-gray-400 hover:text-primary-500 hover:bg-white/5 transition-colors"
                              >
                                <sub.icon className="w-4 h-4" />
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 pt-4 md:pt-6">
                  <div className="flex items-center gap-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm md:text-base">{user?.name || 'User'}</div>
                      <div className="text-xs md:text-sm text-gray-400">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="mt-3 md:mt-4 space-y-1 md:space-y-2">
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 md:px-4 py-2 md:py-2.5 rounded-lg hover:bg-danger/10 text-danger transition-colors text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;