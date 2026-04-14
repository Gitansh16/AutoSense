import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  return (
    <div className="min-h-screen bg-dark-600 pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 md:p-10"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary-500" />
            </div>
            <h1 className="text-2xl md:text-3xl font-outfit font-bold">Prediction History</h1>
          </div>

          <p className="text-gray-400 mb-6">
            History tracking is not enabled yet for this build. Add prediction persistence in MongoDB to view past runs.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors"
          >
            Back to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default History;
