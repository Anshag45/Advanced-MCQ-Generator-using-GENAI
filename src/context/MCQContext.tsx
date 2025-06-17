import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
}

export interface GenerationSettings {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  numAnswers: number;
  temperature: number;
  includeHints: boolean;
  includeExplanations: boolean;
}

interface MCQContextType {
  mcqs: MCQ[];
  sourceUrl: string;
  sourceText: string;
  isLoading: boolean;
  generateMCQsFromUrl: (url: string, settings: GenerationSettings) => Promise<void>;
  generateMCQsFromText: (text: string, settings: GenerationSettings) => Promise<void>;
}

const MCQContext = createContext<MCQContextType | undefined>(undefined);

export const useMCQContext = () => {
  const context = useContext(MCQContext);
  if (!context) {
    throw new Error('useMCQContext must be used within an MCQProvider');
  }
  return context;
};

interface MCQProviderProps {
  children: ReactNode;
}

// TODO: Replace with your actual Gemini API key
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

export const MCQProvider: React.FC<MCQProviderProps> = ({ children }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourceText, setSourceText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateMCQPrompt = (content: string, settings: GenerationSettings) => {
    return `
You are an expert educator and assessment creator. Generate ${settings.numQuestions} multiple choice questions based on the following content. 

Content: "${content}"

Requirements:
- Difficulty level: ${settings.difficulty}
- Each question should have exactly ${settings.numAnswers} options
- Questions should test understanding, not just memorization
- ${settings.includeHints ? 'Include helpful hints for each question' : 'Do not include hints'}
- ${settings.includeExplanations ? 'Include detailed explanations for correct answers' : 'Do not include explanations'}
- Ensure questions are diverse and cover different aspects of the content
- Make questions clear and unambiguous

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "difficulty": "${settings.difficulty}",
    ${settings.includeHints ? '"hint": "Helpful hint here",' : ''}
    ${settings.includeExplanations ? '"explanation": "Detailed explanation here"' : ''}
  }
]

Important: Return ONLY the JSON array, no additional text or formatting.
`;
  };

  const generateMCQsFromUrl = async (url: string, settings: GenerationSettings) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured. Please add your API key to the code.');
    }

    setIsLoading(true);
    setSourceUrl(url);
    setSourceText('');
    
    try {
      // Extract content from URL (simplified - in production, use a proper web scraping service)
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      // Simple content extraction (in production, use proper HTML parsing)
      const content = data.contents.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 4000);
      
      await generateMCQsWithGemini(content, settings);
    } catch (error) {
      console.error('Error generating MCQs from URL:', error);
      throw new Error('Failed to extract content from URL or generate MCQs');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMCQsFromText = async (text: string, settings: GenerationSettings) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured. Please add your API key to the code.');
    }

    setIsLoading(true);
    setSourceText(text);
    setSourceUrl('');
    
    try {
      await generateMCQsWithGemini(text, settings);
    } catch (error) {
      console.error('Error generating MCQs from text:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateMCQsWithGemini = async (content: string, settings: GenerationSettings) => {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = generateMCQPrompt(content, settings);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const generatedMCQs = JSON.parse(cleanedText);

      if (!Array.isArray(generatedMCQs)) {
        throw new Error('Invalid response format from AI');
      }

      setMcqs(generatedMCQs.slice(0, settings.numQuestions));
    } catch (error) {
      console.error('Error with Gemini API:', error);
      
      // Fallback to mock data if API fails
      const mockMCQs: MCQ[] = [
        {
          question: "What is the primary purpose of artificial intelligence in modern web development?",
          options: [
            "To replace human developers entirely",
            "To enhance user experience and automate repetitive tasks",
            "To make websites more expensive to build",
            "To slow down the development process"
          ],
          correctAnswer: 1,
          difficulty: settings.difficulty,
          hint: settings.includeHints ? "Think about how AI tools help developers be more productive and create better user experiences." : undefined,
          explanation: settings.includeExplanations ? "AI in web development primarily serves to enhance user experience through personalization, automate repetitive coding tasks, and provide intelligent features like chatbots and recommendation systems." : undefined
        }
      ];
      
      setMcqs(mockMCQs.slice(0, settings.numQuestions));
      throw new Error('Failed to generate MCQs with AI. Using fallback questions.');
    }
  };

  const value: MCQContextType = {
    mcqs,
    sourceUrl,
    sourceText,
    isLoading,
    generateMCQsFromUrl,
    generateMCQsFromText
  };

  return (
    <MCQContext.Provider value={value}>
      {children}
    </MCQContext.Provider>
  );
};