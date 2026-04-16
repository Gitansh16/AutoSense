import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Battery, Mail, Lock, Eye, EyeOff, User, Building, Car,
  Users, ArrowRight, ArrowLeft, CheckCircle, Chrome, Sparkles, Truck
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    carName: "",
    carCompany: "",
    fleetSize: null,
    primaryUseCase: [],
    agreeTerms: false,
    newsletter: false,
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false,
  });

  const validatePassword = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    validatePassword(password);
  };

  const toggleUseCase = (useCase) => {
    const current = formData.primaryUseCase;
    if (current.includes(useCase)) {
      setFormData({
        ...formData,
        primaryUseCase: current.filter((c) => c !== useCase),
      });
    } else {
      setFormData({ ...formData, primaryUseCase: [...current, useCase] });
    }
  };

  const nextStep = () => {
    setError("");
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      if (
        !passwordStrength.length ||
        !passwordStrength.number ||
        !passwordStrength.special
      ) {
        setError("Password does not meet all requirements");
        return;
      }
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setError("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signup(formData.fullName, formData.email, formData.password, {
        car_name: formData.carName,
        car_company: formData.carCompany,
        fleet_size: formData.fleetSize,
        primary_use_case: formData.primaryUseCase,
        newsletter: formData.newsletter,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup — not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-600 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 animated-bg opacity-30" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary-500/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <Battery className="w-10 h-10 text-primary-500" />
          <span className="text-5xl font-outfit font-bold gradient-text">
            AutoSense
          </span>
        </Link>

        {/* Main Card */}
        <div className="glass-card p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <motion.div
                    animate={{
                      scale: currentStep === step ? 1.1 : 1,
                      backgroundColor:
                        currentStep >= step
                          ? "rgb(0, 217, 255)"
                          : "rgba(255, 255, 255, 0.1)",
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold relative"
                  >
                    {currentStep > step ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span
                        className={
                          currentStep >= step ? "text-white" : "text-gray-500"
                        }
                      >
                        {step}
                      </span>
                    )}
                    {currentStep === step && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-primary-500 rounded-full"
                      />
                    )}
                  </motion.div>
                  {step < 3 && (
                    <div className="flex-1 h-1 mx-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: currentStep > step ? "100%" : "0%" }}
                        className="h-full bg-primary-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span
                className={
                  currentStep >= 1 ? "text-primary-500" : "text-gray-500"
                }
              >
                Account
              </span>
              <span
                className={
                  currentStep >= 2 ? "text-primary-500" : "text-gray-500"
                }
              >
                Company
              </span>
              <span
                className={
                  currentStep >= 3 ? "text-primary-500" : "text-gray-500"
                }
              >
                Confirm
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-outfit font-bold mb-2">
                      Create Your Account
                    </h2>
                    <p className="text-gray-400">
                      Get started with AutoSense
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-3 glass-card p-4 hover:bg-white/5 transition-colors group"
                  >
                    <Chrome className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                    <span>Sign up with Google</span>
                  </button>

                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="input-field pl-12"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input-field pl-12"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handlePasswordChange}
                        className="input-field pl-12 pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-500 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[
                        { key: "length", label: "8+ characters" },
                        { key: "number", label: "1 number" },
                        { key: "special", label: "1 special character" },
                      ].map((rule) => (
                        <div
                          key={rule.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <CheckCircle
                            className={`w-4 h-4 ${passwordStrength[rule.key] ? "text-success" : "text-gray-600"}`}
                          />
                          <span
                            className={
                              passwordStrength[rule.key]
                                ? "text-gray-300"
                                : "text-gray-600"
                            }
                          >
                            {rule.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="input-field pl-12 pr-12"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-primary-500 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {formData.password &&
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="mt-2 text-sm text-danger">
                          Passwords don't match
                        </p>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full btn-primary"
                  >
                    Next Step{" "}
                    <ArrowRight className="inline-block ml-2 w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Company Info */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-3xl font-outfit font-bold mb-2">
                      Tell Us About Your Vehicle
                    </h2>
                    <p className="text-gray-400">
                      Help us customize your experience
                    </p>
                  </div>

                  {/* Car Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Car Name{" "}
                      <span className="text-gray-500">
                        (e.g. Tesla Model 3)
                      </span>
                    </label>
                    <div className="relative">
                      <Car className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.carName}
                        onChange={(e) =>
                          setFormData({ ...formData, carName: e.target.value })
                        }
                        className="input-field pl-12"
                        placeholder="e.g. Model 3, Civic, Fortuner"
                      />
                    </div>
                  </div>

                  {/* Car Company Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Car Company{" "}
                      <span className="text-gray-500">
                        (e.g. Tesla, Toyota)
                      </span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        value={formData.carCompany}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            carCompany: e.target.value,
                          })
                        }
                        className="input-field pl-12"
                        placeholder="e.g. Tesla, Toyota, Honda"
                      />
                    </div>
                  </div>

                  {/* Fleet Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fleet Size
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, fleetSize: num })
                          }
                          className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                            formData.fleetSize === num
                              ? "border-primary-500 bg-primary-500/20 text-primary-400"
                              : "border-white/10 hover:border-white/20 text-gray-400"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    {formData.fleetSize && (
                      <p className="text-xs text-primary-400 mt-2">
                        Selected: {formData.fleetSize}{" "}
                        {formData.fleetSize === 1 ? "vehicle" : "vehicles"}
                      </p>
                    )}
                  </div>

                  {/* Primary Use Case */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Primary Use Case{" "}
                      <span className="text-gray-500">
                        (Select all that apply)
                      </span>
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          value: "Electric Vehicles (EV)",
                          label: "Electric Vehicles (EV)",
                          icon: Battery,
                          desc: "Tesla, Rivian, Nissan Leaf",
                        },
                        {
                          value: "Petrol / Diesel Vehicles",
                          label: "Petrol / Diesel Vehicles",
                          icon: Car,
                          desc: "Fuel-Powered Vehicles, Conventional Vehicles, ICE engines",
                        },
                        {
                          value: "Truck / Bus",
                          label: "Truck / Bus",
                          icon: Truck,
                          desc: "Commercial vehicles, Heavy transport, Fleet trucks",
                        },
                        {
                          value: "Both EV and Normal",
                          label: "Both EV and Petrol / Diesel Vehicles",
                          icon: Sparkles,
                          desc: "Mixed fleet support",
                        },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.primaryUseCase.includes(option.value)
                              ? "border-primary-500 bg-primary-500/10"
                              : "border-white/10 hover:border-white/20"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.primaryUseCase.includes(
                              option.value,
                            )}
                            onChange={() => toggleUseCase(option.value)}
                            className="w-4 h-4 rounded border-white/10 bg-dark-500 text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                          />
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              formData.primaryUseCase.includes(option.value)
                                ? "bg-primary-500/20"
                                : "bg-white/5"
                            }`}
                          >
                            <option.icon className="w-4 h-4 text-primary-500" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {option.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {option.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 btn-secondary"
                    >
                      <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 btn-primary"
                    >
                      Next Step{" "}
                      <ArrowRight className="inline-block ml-2 w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-outfit font-bold mb-2">
                      You're Almost There!
                    </h2>
                    <p className="text-gray-400">
                      Review and confirm your details
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        checked={formData.agreeTerms}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            agreeTerms: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 rounded border-white/10 bg-dark-500 text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        I agree to the{" "}
                        <a
                          href="#"
                          className="text-primary-500 hover:text-primary-400"
                        >
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a
                          href="#"
                          className="text-primary-500 hover:text-primary-400"
                        >
                          Privacy Policy
                        </a>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            newsletter: e.target.checked,
                          })
                        }
                        className="mt-1 w-5 h-5 rounded border-white/10 bg-dark-500 text-primary-500 focus:ring-2 focus:ring-primary-500/20"
                      />
                      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                        Send me product updates and tips (optional)
                      </span>
                    </label>
                  </div>

                  {/* Account Summary */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold text-lg mb-4">
                      Your Account Includes:
                    </h3>
                    {[
                      "2 ML Models (EV + Normal vehicles)",
                      "Unlimited predictions",
                      "Historical analytics dashboard",
                      "Export reports (CSV/PDF)",
                      "SHAP feature importance analysis",
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 btn-secondary"
                    >
                      <ArrowLeft className="inline-block mr-2 w-5 h-5" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.agreeTerms}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mx-auto"
                        />
                      ) : (
                        <>
                          Create Account{" "}
                          <CheckCircle className="inline-block ml-2 w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <p className="mt-8 text-center text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-500 hover:text-primary-400 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <Link
          to="/"
          className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors"
        >
          ← Back to Homepage
        </Link>
      </motion.div>
    </div>
  );
};

export default Signup;
