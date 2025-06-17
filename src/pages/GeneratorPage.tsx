import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Link, 
  Settings, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Loader,
  Globe,
  FileText,
  Key
} from 'lucide-react';
import { useMCQContext } from '../context/MCQContext';
import { useTheme } from '../context/ThemeContext';
import ApiKeyModal from '../components/ApiKeyModal';

const GeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { generateMCQsFromUrl, generateMCQsFromText, isLoading, apiKey, setApiKey } = useMCQContext();
  const { isDarkMode } = useTheme();
  
  const [inputType, setInputType] = useState<'url' | 'text'>('url');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [settings, setSettings] = useState({
    numQuestions: 5,
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    numAnswers: 4,
    temperature: 0.7,
    includeHints: true,
    includeExplanations: true
  });
  
  const [urlStatus, setUrlStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [error, setError] = useState('');
  const [showApiModal, setShowApiModal] = useState(false);

  const validateUrl = async (inputUrl: string) => {
    if (!inputUrl) {
      setUrlStatus('idle');
      return;
    }

    setUrlStatus('validating');
    
    try {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(inputUrl)) {
        throw new Error('Invalid URL format');
      }
      
      const finalUrl = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`;
      setUrl(finalUrl);
      setUrlStatus('valid');
      setError('');
    } catch (err) {
      setUrlStatus('invalid');
      setError('Please enter a valid URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    if (inputType === 'url' && (urlStatus !== 'valid' || !url)) return;
    if (inputType === 'text' && !text.trim()) return;

    try {
      if (inputType === 'url') {
        await generateMCQsFromUrl(url, settings);
      } else {
        await generateMCQsFromText(text, settings);
      }
      navigate('/results');
    } catch (err: any) {
      setError(err.message || 'Failed to generate MCQs. Please try again.');
    }
  };

  const difficultyColors = {
    easy: 'from-green-500 to-teal-500',
    medium: 'from-yellow-500 to-orange-500',
    hard: 'from-red-500 to-pink-500'
  };

  const canSubmit = apiKey && (
    (inputType === 'url' && urlStatus === 'valid') || 
    (inputType === 'text' && text.trim().length > 0)
  );

  return (
    <>
      <div className={`min-h-screen py-8 transition-colors ${
        isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
              isDarkMode 
                ? 'bg-purple-900/30 text-purple-300' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>AI Question Generator</span>
            </div>
            
            <h1 className={`text-3xl md:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Generate MCQs with AI
            </h1>
            <p className={`text-xl max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Create intelligent questions from articles or your own text using Gemini AI
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Type Selection */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Choose Input Method
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    inputType === 'url'
                      ? isDarkMode
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDarkMode
                      ? 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Globe className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">From URL</h3>
                  <p className="text-sm opacity-80">Extract content from web articles</p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                    inputType === 'text'
                      ? isDarkMode
                        ? 'border-blue-500 bg-blue-900/20 text-blue-300'
                        : 'border-blue-500 bg-blue-50 text-blue-700'
                      : isDarkMode
                      ? 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">From Text</h3>
                  <p className="text-sm opacity-80">Paste your own content directly</p>
                </button>
              </div>

              {/* URL Input */}
              {inputType === 'url' && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        validateUrl(e.target.value);
                      }}
                      placeholder="https://example.com/article"
                      className={`w-full pl-12 pr-12 py-4 text-lg border rounded-xl transition-all duration-200 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                    />
                    
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      {urlStatus === 'validating' && (
                        <Loader className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {urlStatus === 'valid' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {urlStatus === 'invalid' && (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input */}
              {inputType === 'text' && (
                <div className="space-y-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste your article content here..."
                    rows={8}
                    className={`w-full p-4 text-lg border rounded-xl transition-all duration-200 resize-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                  />
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {text.length} characters
                  </div>
                </div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 text-sm mt-4"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Settings Section */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`backdrop-blur-sm rounded-2xl p-8 shadow-lg border ${
                isDarkMode 
                  ? 'bg-gray-800/80 border-gray-700' 
                  : 'bg-white/80 border-gray-200/50'
              }`}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Generation Settings
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Number of Questions */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Number of Questions
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="3"
                      max="15"
                      value={settings.numQuestions}
                      onChange={(e) => setSettings({...settings, numQuestions: parseInt(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                      isDarkMode 
                        ? 'bg-blue-900/30 text-blue-300' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {settings.numQuestions}
                    </div>
                  </div>
                </div>

                {/* Difficulty Level */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSettings({...settings, difficulty: level})}
                        className={`p-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          settings.difficulty === level
                            ? `bg-gradient-to-r ${difficultyColors[level]} text-white shadow-lg`
                            : isDarkMode
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Answer Options */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Answer Options
                  </label>
                  <select
                    value={settings.numAnswers}
                    onChange={(e) => setSettings({...settings, numAnswers: parseInt(e.target.value)})}
                    className={`w-full p-3 border rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                    } focus:ring-2 focus:ring-blue-500/20 focus:outline-none`}
                  >
                    <option value={3}>3 Options</option>
                    <option value={4}>4 Options</option>
                    <option value={5}>5 Options</option>
                  </select>
                </div>

                {/* AI Creativity */}
                <div>
                  <label className={`block text-sm font-semibold mb-3 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    AI Creativity
                  </label>
                  <div className="flex items-center space-x-4">
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Conservative
                    </span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={settings.temperature}
                      onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Creative
                    </span>
                  </div>
                  <div className={`text-center mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {(settings.temperature * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div className={`mt-8 pt-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Additional Features
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeHints}
                      onChange={(e) => setSettings({...settings, includeHints: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Include helpful hints
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeExplanations}
                      onChange={(e) => setSettings({...settings, includeExplanations: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Include explanations
                    </span>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Generate Button */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center"
            >
              {!apiKey && (
                <div className={`mb-4 p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-yellow-900/20 border-yellow-800/30 text-yellow-300' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <div className="flex items-center justify-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>Please set your Gemini API key to generate MCQs</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                  canSubmit && !isLoading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Generating MCQs...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    <span>Generate MCQs</span>
                  </>
                )}
              </button>
              
              {isLoading && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  This may take a few moments while our AI analyzes the content...
                </motion.p>
              )}
            </motion.div>
          </form>
        </div>
      </div>

      <ApiKeyModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        apiKey={apiKey}
        onSave={setApiKey}
      />
    </>
  );
};

export default GeneratorPage;