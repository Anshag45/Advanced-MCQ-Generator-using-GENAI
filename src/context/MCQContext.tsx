import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Support single or multiple correct answers
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
  type: 'single' | 'multiple'; // Question type
}

export interface GenerationSettings {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  numAnswers: number;
  temperature: number;
  includeHints: boolean;
  includeExplanations: boolean;
  allowMultipleCorrect: boolean; // New setting for multiple correct answers
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

// Your Gemini API key
const GEMINI_API_KEY = 'AIzaSyD3CIbAcTm14iQLVSHIDjex5K8EIC_iBiY';

export const MCQProvider: React.FC<MCQProviderProps> = ({ children }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourceText, setSourceText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generateMCQPrompt = (content: string, settings: GenerationSettings) => {
    const multipleCorrectInstruction = settings.allowMultipleCorrect 
      ? `
- Some questions can have multiple correct answers (mark as "type": "multiple" and provide correctAnswer as an array)
- Mix single correct answer questions (mark as "type": "single" with correctAnswer as a number) and multiple correct answer questions
- For multiple correct questions, ensure at least 2 options are correct
- Clearly indicate in the question when multiple answers are expected (e.g., "Select all that apply", "Which of the following are correct?")
      `
      : `
- Each question should have exactly one correct answer (mark as "type": "single" with correctAnswer as a number)
      `;

    return `
You are an expert educator and assessment creator. Generate ${settings.numQuestions} multiple choice questions based on the following content. 

Content: "${content}"

Requirements:
- Difficulty level: ${settings.difficulty}
- Each question should have exactly ${settings.numAnswers} options
- Questions should test understanding, not just memorization
${multipleCorrectInstruction}
- ${settings.includeHints ? 'Include helpful hints for each question' : 'Do not include hints'}
- ${settings.includeExplanations ? 'Include detailed explanations for correct answers' : 'Do not include explanations'}
- Ensure questions are diverse and cover different aspects of the content
- Make questions clear and unambiguous
- Vary question types (factual, conceptual, analytical, application-based)

Format your response as a JSON array with this exact structure:

For single correct answer questions:
{
  "question": "Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "type": "single",
  "difficulty": "${settings.difficulty}",
  ${settings.includeHints ? '"hint": "Helpful hint here",' : ''}
  ${settings.includeExplanations ? '"explanation": "Detailed explanation here"' : ''}
}

For multiple correct answer questions (if enabled):
{
  "question": "Select all that apply: Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": [0, 2],
  "type": "multiple",
  "difficulty": "${settings.difficulty}",
  ${settings.includeHints ? '"hint": "Helpful hint here",' : ''}
  ${settings.includeExplanations ? '"explanation": "Detailed explanation here"' : ''}
}

Important: Return ONLY the JSON array, no additional text or formatting.
`;
  };

  const extractContentFromUrl = async (url: string): Promise<string> => {
    // Enhanced web scraping with multiple strategies
    const strategies = [
      // Strategy 1: Direct fetch with CORS proxy
      async () => {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        return data.contents;
      },
      
      // Strategy 2: Alternative CORS proxy
      async () => {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        return await response.text();
      },
      
      // Strategy 3: Another proxy service
      async () => {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        return await response.text();
      },
      
      // Strategy 4: Scraping API service
      async () => {
        const proxyUrl = `https://scrape-it.cloud/api/scrape?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        return data.content || data.text || data.body;
      }
    ];

    let lastError: Error | null = null;

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`Trying scraping strategy ${i + 1}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const content = await Promise.race([
          strategies[i](),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Strategy timeout')), 15000)
          )
        ]) as string;

        clearTimeout(timeoutId);

        if (!content || typeof content !== 'string') {
          throw new Error('No content received or invalid content type');
        }

        // Enhanced content cleaning and extraction
        let cleanContent = content;

        // Remove script and style tags
        cleanContent = cleanContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        cleanContent = cleanContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        
        // Remove navigation, header, footer, sidebar elements
        cleanContent = cleanContent.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
        cleanContent = cleanContent.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
        cleanContent = cleanContent.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
        cleanContent = cleanContent.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');
        
        // Try to extract main content areas
        const mainContentRegex = /<main\b[^>]*>(.*?)<\/main>/gis;
        const articleRegex = /<article\b[^>]*>(.*?)<\/article>/gis;
        const contentRegex = /<div[^>]*(?:class|id)="[^"]*(?:content|article|post|main)[^"]*"[^>]*>(.*?)<\/div>/gis;
        
        let extractedContent = '';
        
        // Try to find main content
        let match = mainContentRegex.exec(cleanContent);
        if (match) {
          extractedContent = match[1];
        } else {
          match = articleRegex.exec(cleanContent);
          if (match) {
            extractedContent = match[1];
          } else {
            match = contentRegex.exec(cleanContent);
            if (match) {
              extractedContent = match[1];
            }
          }
        }
        
        // If no specific content area found, use the whole cleaned content
        if (!extractedContent) {
          extractedContent = cleanContent;
        }

        // Remove all HTML tags
        extractedContent = extractedContent.replace(/<[^>]*>/g, ' ');
        
        // Clean up whitespace and special characters
        extractedContent = extractedContent
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

        // Filter out common non-content text
        const lines = extractedContent.split('\n').filter(line => {
          const trimmed = line.trim().toLowerCase();
          return trimmed.length > 10 && 
                 !trimmed.includes('cookie') &&
                 !trimmed.includes('privacy policy') &&
                 !trimmed.includes('terms of service') &&
                 !trimmed.includes('subscribe') &&
                 !trimmed.includes('newsletter') &&
                 !trimmed.includes('advertisement');
        });

        const finalContent = lines.join('\n').trim();

        if (finalContent.length < 100) {
          throw new Error('Extracted content is too short (less than 100 characters)');
        }

        console.log(`Successfully extracted ${finalContent.length} characters using strategy ${i + 1}`);
        
        // Limit content to prevent API limits (increased limit)
        return finalContent.substring(0, 8000);

      } catch (error) {
        lastError = error as Error;
        console.warn(`Strategy ${i + 1} failed:`, error);
        continue;
      }
    }

    // If all strategies fail, throw a comprehensive error
    throw new Error(
      `Unable to extract content from URL after trying ${strategies.length} different methods.\n\n` +
      `This could be due to:\n` +
      `• The website blocking automated requests\n` +
      `• CORS restrictions\n` +
      `• The website requiring JavaScript to load content\n` +
      `• Network connectivity issues\n` +
      `• The URL requiring authentication\n\n` +
      `Please try:\n` +
      `• Copying and pasting the content directly using the "Text Input" option\n` +
      `• Checking if the URL is publicly accessible\n` +
      `• Trying a different article URL\n` +
      `• Waiting a few minutes and trying again\n\n` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  };

  const generateMCQsFromUrl = async (url: string, settings: GenerationSettings) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('Gemini API key not configured. Please add your API key to the code.');
    }

    setIsLoading(true);
    setSourceUrl(url);
    setSourceText('');
    
    try {
      console.log('Starting content extraction from URL:', url);
      const content = await extractContentFromUrl(url);
      console.log('Content extracted successfully, generating MCQs...');
      await generateMCQsWithGemini(content, settings);
    } catch (error) {
      console.error('Error generating MCQs from URL:', error);
      throw error;
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
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: settings.temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });

      const prompt = generateMCQPrompt(content, settings);
      console.log('Sending request to Gemini API...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Received response from Gemini API');

      // Parse the JSON response
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      let generatedMCQs;
      
      try {
        generatedMCQs = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('JSON parsing failed, attempting to extract JSON from response');
        // Try to extract JSON from the response if it's wrapped in other text
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          generatedMCQs = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse JSON response from AI');
        }
      }

      if (!Array.isArray(generatedMCQs)) {
        throw new Error('Invalid response format from AI - expected array');
      }

      // Validate and normalize the MCQs
      const validatedMCQs = generatedMCQs.slice(0, settings.numQuestions).map((mcq: any) => {
        // Ensure type is set
        if (!mcq.type) {
          mcq.type = Array.isArray(mcq.correctAnswer) ? 'multiple' : 'single';
        }
        
        // Validate correctAnswer format
        if (mcq.type === 'multiple' && !Array.isArray(mcq.correctAnswer)) {
          mcq.correctAnswer = [mcq.correctAnswer];
        } else if (mcq.type === 'single' && Array.isArray(mcq.correctAnswer)) {
          mcq.correctAnswer = mcq.correctAnswer[0];
        }
        
        return mcq;
      });

      console.log(`Successfully generated ${validatedMCQs.length} MCQs`);
      setMcqs(validatedMCQs);
      
    } catch (error) {
      console.error('Error with Gemini API:', error);
      
      // Enhanced fallback with multiple correct answer support
      const mockMCQs: MCQ[] = [
        {
          question: "What are the primary benefits of artificial intelligence in modern web development? (Select all that apply)",
          options: [
            "Enhanced user experience through personalization",
            "Automated code generation and testing",
            "Increased development costs",
            "Improved accessibility features"
          ],
          correctAnswer: settings.allowMultipleCorrect ? [0, 1, 3] : 0,
          type: settings.allowMultipleCorrect ? 'multiple' : 'single',
          difficulty: settings.difficulty,
          hint: settings.includeHints ? "Think about how AI tools help developers be more productive and create better user experiences." : undefined,
          explanation: settings.includeExplanations ? "AI in web development enhances user experience through personalization, automates repetitive tasks like code generation and testing, and can improve accessibility through automated alt-text generation and other features. It typically reduces costs rather than increases them." : undefined
        },
        {
          question: "Which programming language is primarily used for client-side web development?",
          options: [
            "Python",
            "JavaScript",
            "Java",
            "C++"
          ],
          correctAnswer: 1,
          type: 'single',
          difficulty: settings.difficulty,
          hint: settings.includeHints ? "This language runs in web browsers and is essential for interactive web pages." : undefined,
          explanation: settings.includeExplanations ? "JavaScript is the primary programming language for client-side web development, running in web browsers to create interactive and dynamic user interfaces." : undefined
        }
      ];
      
      setMcqs(mockMCQs.slice(0, settings.numQuestions));
      throw new Error('Failed to generate MCQs with AI. Using fallback questions for demonstration.');
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