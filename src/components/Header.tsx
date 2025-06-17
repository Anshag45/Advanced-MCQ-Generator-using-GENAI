import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Home, PlusCircle, FileText, Moon, Sun, Key } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useMCQContext } from '../context/MCQContext';
import ApiKeyModal from './ApiKeyModal';

const Header: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { apiKey, setApiKey } = useMCQContext();
  const [showApiModal, setShowApiModal] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/generate', label: 'Generate', icon: PlusCircle },
    { path: '/results', label: 'Results', icon: FileText },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className={`backdrop-blur-lg border-b sticky top-0 z-40 transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-800' 
            : 'bg-white/90 border-gray-200/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI MCQ Generator
                </span>
                <p className={`text-xs -mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Powered by Gemini AI
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === path
                      ? isDarkMode
                        ? 'bg-blue-900/30 text-blue-300 shadow-sm'
                        : 'bg-blue-50 text-blue-700 shadow-sm'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowApiModal(true)}
                className={`p-2 rounded-lg transition-colors ${
                  apiKey
                    ? isDarkMode
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={apiKey ? 'API Key Set' : 'Set API Key'}
              >
                <Key className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="md:hidden">
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                  }`}
                >
                  <Brain className={`w-5 h-5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        apiKey={apiKey}
        onSave={setApiKey}
      />
    </>
  );
};

export default Header;