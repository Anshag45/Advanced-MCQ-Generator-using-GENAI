import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
  const [key, setKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const { isDarkMode } = useTheme();

  const handleSave = () => {
    onSave(key);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Gemini API Key
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Enter your Gemini API key"
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-blue-900/20 border border-blue-800/30' : 'bg-blue-50 border border-blue-200'
              }`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  How to get your API key:
                </h3>
                <ol className={`text-sm space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                  <li>1. Visit Google AI Studio</li>
                  <li>2. Sign in with your Google account</li>
                  <li>3. Create a new API key</li>
                  <li>4. Copy and paste it here</li>
                </ol>
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-1 mt-2 text-sm font-medium transition-colors ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!key.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    key.trim()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Save Key
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApiKeyModal;