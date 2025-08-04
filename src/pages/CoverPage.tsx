import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CoverPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center p-8 relative z-10">
        <Link 
          to="/about"
          className="text-black text-lg font-medium hover:opacity-70 transition-opacity"
        >
          关于我们
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10">
        {/* Title */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-2xl font-bold text-black mb-4">
            女性友好社区
          </h1>
          <h2 className="text-4xl font-bold text-black mb-8">
            Sheart
          </h2>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-4 w-full max-w-sm"
        >
          <Link 
            to="/register"
            className="bg-black text-white py-4 px-8 rounded-xl text-center text-lg font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95"
          >
            注册
          </Link>
          <Link 
            to="/login"
            className="bg-black text-white py-4 px-8 rounded-xl text-center text-lg font-medium hover:bg-gray-800 transition-all duration-200 active:scale-95"
          >
            登录
          </Link>
        </motion.div>
      </div>

      {/* Bottom Tagline */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-center pb-8"
      >
        <p className="text-black text-lg">她至关重要</p>
      </motion.div>

      {/* Artistic Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Minimalist line art illustrations */}
        <div className="absolute left-1/4 top-1/4 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M20 50 C20 20, 50 20, 50 50 C50 80, 80 80, 80 50" 
                  stroke="currentColor" 
                  fill="none" 
                  strokeWidth="1.5" 
                  className="text-black"/>
          </svg>
        </div>
        
        <div className="absolute right-1/4 bottom-1/3 w-24 h-24 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="30" r="15" 
                    stroke="currentColor" 
                    fill="none" 
                    strokeWidth="1.5" 
                    className="text-black"/>
            <path d="M35 60 C35 45, 50 45, 50 60 L50 85" 
                  stroke="currentColor" 
                  fill="none" 
                  strokeWidth="1.5" 
                  className="text-black"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CoverPage;