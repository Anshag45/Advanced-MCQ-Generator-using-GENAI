import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import GeneratorPage from './pages/GeneratorPage';
import ResultsPage from './pages/ResultsPage';
import { MCQProvider } from './context/MCQContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function AppContent() {
  const { isDarkMode } = useTheme();
  
  return (
    <MCQProvider>
      <Router>
        <div className={`min-h-screen transition-colors ${
          isDarkMode 
            ? 'bg-gray-900' 
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        }`}>
          <Header />
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/generate" element={<GeneratorPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </motion.main>
          <Footer />
        </div>
      </Router>
    </MCQProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;