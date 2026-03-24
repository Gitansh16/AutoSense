import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import EVPrediction from './pages/EVPrediction';
import TruckPrediction from './pages/TruckPrediction';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { startKeepAlive } from './utils/keepAlive';
startKeepAlive();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-600 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

const ProtectedLayout = ({ children }) => (
  <div className="min-h-screen bg-dark-600">
    <Navbar />
    <main>{children}</main>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected */}
      <Route path="/dashboard" element={
        <ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>
      } />

      {/* Truck — must be BEFORE the generic :carId catch-all */}
      <Route path="/predict/truck/:truckId" element={
        <ProtectedRoute><ProtectedLayout><TruckPrediction /></ProtectedLayout></ProtectedRoute>
      } />

      {/* EV */}
      <Route path="/predict/:carId" element={
        <ProtectedRoute><ProtectedLayout><EVPrediction /></ProtectedLayout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;