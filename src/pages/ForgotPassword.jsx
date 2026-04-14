import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-dark-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8"
      >
        <h1 className="text-3xl font-outfit font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Password reset API is not enabled in this build. This page prevents broken navigation and can be connected later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full btn-primary">
            Request Reset
          </button>
        </form>

        {submitted && (
          <p className="text-xs text-gray-400 mt-4">
            Request captured locally for demo. Connect backend endpoint to send actual reset links.
          </p>
        )}

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm"
        >
          Back to Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
