# 🧠 AI MCQ Generator

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue.svg)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Powered-green.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Transform any content into intelligent Multiple Choice Questions using advanced AI technology. Perfect for educators, students, and trainers who want to create engaging assessments effortlessly.

## ✨ Features

### 🤖 AI-Powered Generation
- **Advanced Gemini AI Integration**: Leverages Google's Gemini 1.5 Flash model for intelligent question generation
- **Contextual Understanding**: Creates questions that test comprehension, not just memorization
- **Multiple Question Types**: Supports both single and multiple correct answer questions
- **Adaptive Difficulty**: Generates questions at Easy, Medium, or Hard difficulty levels

### 🌐 Flexible Input Methods
- **URL Content Extraction**: Automatically scrapes and processes content from web articles
- **Direct Text Input**: Paste your own content for complete control
- **Smart Content Processing**: Advanced web scraping with multiple fallback strategies
- **Large Content Support**: Handles up to 8,000 characters of source material

### ⚙️ Customizable Settings
- **Question Count**: Generate 3-50 questions per session
- **Answer Options**: Choose 3-6 answer choices per question
- **AI Creativity Control**: Adjust temperature settings for varied question styles
- **Multiple Correct Answers**: Enable questions with more than one correct option
- **Hints & Explanations**: Optional educational enhancements

### 📄 Export & Sharing
- **PDF Export**: Beautiful, formatted PDFs with or without answers
- **Copy to Clipboard**: Quick text copying for easy sharing
- **Print-Ready Format**: Professional layouts suitable for classroom use
- **Answer Key Generation**: Separate answer sheets for educators

### 🎨 Modern User Experience
- **Dark/Light Mode**: Seamless theme switching with system preference detection
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-mcq-generator.git
   cd ai-mcq-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Open `src/context/MCQContext.tsx` and replace the API key:
   ```typescript
   const GEMINI_API_KEY = 'your-gemini-api-key-here';
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173`

## 🛠️ Technology Stack

### Frontend Framework
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development with enhanced IDE support
- **Vite 5.4.2** - Lightning-fast build tool and development server

### Styling & UI
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Framer Motion 11.5.0** - Production-ready motion library
- **Lucide React 0.344.0** - Beautiful, customizable icons

### AI & APIs
- **Google Generative AI 0.2.1** - Official Gemini AI SDK
- **Multiple Proxy Services** - Robust web scraping with fallback strategies

### Export & Utilities
- **jsPDF 2.5.1** - Client-side PDF generation
- **html2canvas 1.4.1** - HTML to canvas conversion for PDF export
- **React Router DOM 6.26.0** - Declarative routing

## 📖 Usage Guide

### Basic Usage

1. **Choose Input Method**
   - **URL**: Paste a web article URL for automatic content extraction
   - **Text**: Directly input your content for processing

2. **Configure Settings**
   - Set number of questions (3-50)
   - Choose difficulty level (Easy/Medium/Hard)
   - Select answer options (3-6 choices)
   - Enable multiple correct answers if needed
   - Add hints and explanations

3. **Generate Questions**
   - Click "Generate MCQs" to process your content
   - Wait for AI processing (typically 10-30 seconds)
   - Review generated questions

4. **Export & Share**
   - Export to PDF with or without answers
   - Copy questions to clipboard
   - Share with students or colleagues

### Advanced Features

#### Multiple Correct Answers
Enable the "Allow multiple correct answers" option to generate questions where students must select all applicable answers:

```
Question: Which of the following are benefits of React? (Select all that apply)
A) Component reusability ✓
B) Virtual DOM performance ✓  
C) Automatic SEO optimization
D) Built-in state management ✓
```

#### AI Creativity Control
Adjust the temperature setting to control AI creativity:
- **Low (10-30%)**: Conservative, factual questions
- **Medium (40-70%)**: Balanced approach (recommended)
- **High (80-100%)**: Creative, varied question styles

#### Web Scraping Strategies
The application uses multiple scraping strategies for maximum reliability:
1. AllOrigins CORS proxy
2. CorsProxy.io service
3. CodeTabs proxy API
4. Scrape-it.cloud service

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header with theme toggle
│   └── Footer.tsx      # Application footer
├── context/            # React Context providers
│   ├── MCQContext.tsx  # MCQ generation and state management
│   └── ThemeContext.tsx # Dark/light mode management
├── pages/              # Main application pages
│   ├── LandingPage.tsx # Homepage with features and examples
│   ├── GeneratorPage.tsx # MCQ generation interface
│   └── ResultsPage.tsx # Generated questions display
├── utils/              # Utility functions
│   └── pdfExport.ts    # PDF generation logic
└── styles/
    └── index.css       # Global styles and Tailwind imports
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_APP_NAME=AI MCQ Generator
VITE_APP_VERSION=1.0.0
```

### Customization Options

#### Modify Question Limits
In `src/pages/GeneratorPage.tsx`:
```typescript
// Change maximum questions
max="50" // Increase to desired limit

// Modify answer options
<option value={7}>7 Options</option> // Add more options
```

#### Customize AI Prompts
In `src/context/MCQContext.tsx`, modify the `generateMCQPrompt` function to adjust AI behavior:
```typescript
const generateMCQPrompt = (content: string, settings: GenerationSettings) => {
  // Customize prompt instructions here
  return `Your custom prompt instructions...`;
};
```

## 🚀 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard

### Vercel
1. Connect your GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables

### Self-Hosted
1. Build: `npm run build`
2. Serve the `dist` folder with any static file server
3. Configure reverse proxy if needed

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Test on multiple browsers and devices

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI** for the powerful Gemini API
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Framer Motion** for smooth animations
- **Open Source Community** for inspiration and tools

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via [GitHub Issues](https://github.com/yourusername/ai-mcq-generator/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/ai-mcq-generator/discussions)
- **Email**: contact@yourdomain.com

## 🔮 Roadmap

### Upcoming Features
- [ ] **Question Banks**: Save and organize generated questions
- [ ] **Collaboration**: Share question sets with team members
- [ ] **Analytics**: Track question performance and difficulty
- [ ] **More AI Models**: Support for Claude, GPT-4, and others
- [ ] **Bulk Processing**: Generate questions from multiple sources
- [ ] **API Access**: RESTful API for integration with LMS platforms
- [ ] **Mobile App**: Native iOS and Android applications

### Version History
- **v1.0.0** - Initial release with core MCQ generation
- **v1.1.0** - Added multiple correct answers support
- **v1.2.0** - Enhanced web scraping and PDF export
- **v1.3.0** - Dark mode and accessibility improvements

---

<div align="center">

**Made with ❤️ by educators, for educators**

[⭐ Star this repo](https://github.com/yourusername/ai-mcq-generator) | [🐛 Report Bug](https://github.com/yourusername/ai-mcq-generator/issues) | [💡 Request Feature](https://github.com/yourusername/ai-mcq-generator/issues)

</div>