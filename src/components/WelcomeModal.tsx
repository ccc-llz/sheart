import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleVentClick = () => {
    navigate('/confession');
    onClose();
  };

  const handleBrowseClick = () => {
    navigate('/confession-list');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-black text-white rounded-2xl p-8 max-w-sm w-full relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-3">今天也辛苦啦！</h2>
              <p className="text-gray-300">过得还顺利吗？</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleVentClick}
                className="w-full bg-white text-black py-4 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 active:scale-95"
              >
                不顺利 我要吐槽
              </button>
              
              <button
                onClick={handleBrowseClick}
                className="w-full bg-gray-700 text-white py-4 rounded-xl font-medium hover:bg-gray-600 transition-all duration-200 active:scale-95"
              >
                还可以 我先看看
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeModal;