import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Footer: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`backdrop-blur-lg border-t py-8 mt-16 transition-colors ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200/20'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className={`flex items-center space-x-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>using</span>
            <Code className="w-4 h-4 text-blue-500" />
            <span>React & Gemini AI</span>
            <Zap className="w-4 h-4 text-yellow-500 fill-current" />
          </div>
          
          <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © 2025 AI MCQ Generator. Empowering educators worldwide.
          </div>
          
          <div className={`flex space-x-6 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <a href="#" className={`transition-colors ${
              isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'
            }`}>
              Privacy
            </a>
            <a href="#" className={`transition-colors ${
              isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'
            }`}>
              Terms
            </a>
            <a href="#" className={`transition-colors ${
              isDarkMode ? 'hover:text-blue-400' : 'hover:text-blue-600'
            }`}>
              Support
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;