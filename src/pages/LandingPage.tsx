import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Brain, 
  FileText, 
  Settings, 
  Download, 
  Sparkles,
  Clock,
  Target,
  Users,
  Globe,
  Type
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Generation',
      description: 'Advanced Gemini AI creates intelligent, contextual questions from any content.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: Globe,
      title: 'URL & Text Support',
      description: 'Generate MCQs from web articles or paste your own text content directly.',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: Settings,
      title: 'Customizable Settings',
      description: 'Control difficulty levels, question count, and AI creativity to match your needs.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Download,
      title: 'PDF Export',
      description: 'Export beautifully formatted MCQs with or without answers for offline use.',
      color: 'from-orange-500 to-red-600'
    }
  ];

  const stats = [
    { label: 'Questions Generated', value: '10K+', icon: Target },
    { label: 'Active Users', value: '2.5K+', icon: Users },
    { label: 'Time Saved', value: '500hrs+', icon: Clock },
    { label: 'Success Rate', value: '98%', icon: Sparkles }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDarkMode 
                  ? 'bg-blue-900/30 text-blue-300' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                <Sparkles className="w-4 h-4" />
                <span>Powered by Gemini AI</span>
              </div>
              
              <h1 className={`text-4xl md:text-6xl lg:text-7xl font-bold leading-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Transform Content into
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                  Interactive Quizzes
                </span>
              </h1>
              
              <p className={`text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Generate intelligent Multiple Choice Questions from web articles or your own text using advanced AI. 
                Perfect for educators, students, and trainers who want to create engaging assessments effortlessly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/generate">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <span>Start Generating</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-8 py-4 rounded-xl text-lg font-semibold border transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600' 
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>View Examples</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-600/20 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 backdrop-blur-sm ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30' 
                    : 'bg-gradient-to-br from-blue-100 to-purple-100'
                }`}>
                  <stat.icon className={`w-6 h-6 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <div className={`text-3xl font-bold mb-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Powerful Features for Modern Education
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to create professional, engaging assessments from any content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border ${
                  isDarkMode 
                    ? 'bg-gray-800/80 border-gray-700' 
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-4 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`leading-relaxed ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Input Methods Section */}
      <section className={`py-20 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Multiple Input Methods
            </h2>
            <p className={`text-xl max-w-3xl mx-auto ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Generate MCQs from web articles or your own text content
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`p-8 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/80' : 'bg-white'
              } shadow-lg`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  From URLs
                </h3>
              </div>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Simply paste any article URL and our AI will extract the content and generate relevant questions automatically.
              </p>
              <ul className={`space-y-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <li>• Automatic content extraction</li>
                <li>• Smart text processing</li>
                <li>• Works with most websites</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`p-8 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/80' : 'bg-white'
              } shadow-lg`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                  <Type className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  From Text
                </h3>
              </div>
              <p className={`text-lg mb-6 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Paste your own content directly into the text area for complete control over the source material.
              </p>
              <ul className={`space-y-2 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <li>• Direct text input</li>
                <li>• No URL limitations</li>
                <li>• Perfect for custom content</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Ready to Transform Your Teaching?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of educators who are already creating better assessments with AI
            </p>
            <Link to="/generate">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;