import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number | number[];
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  explanation?: string;
  type: 'single' | 'multiple';
}

export interface GenerationSettings {
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  numAnswers: number;
  temperature: number;
  includeHints: boolean;
  includeExplanations: boolean;
  allowMultipleCorrect: boolean;
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

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const MCQProvider: React.FC<MCQProviderProps> = ({ children }) => {
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [sourceText, setSourceText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const extractContentFromUrl = async (url: string): Promise<string> => {
    const strategies = [
      async () => {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        return data.contents;
      },

      async () => {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        return await response.text();
      },

      async () => {
        const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl);
        return await response.text();
      },

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
        const timeoutId = setTimeout(() => controller.abort(), 15000);

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

        let cleanContent = content;

        cleanContent = cleanContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        cleanContent = cleanContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

        cleanContent = cleanContent.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
        cleanContent = cleanContent.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
        cleanContent = cleanContent.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
        cleanContent = cleanContent.replace(/<aside\b[^<]*(?:(?!<\/aside>)<[^<]*)*<\/aside>/gi, '');

        const mainContentRegex = /<main\b[^>]*>(.*?)<\/main>/gis;
        const articleRegex = /<article\b[^>]*>(.*?)<\/article>/gis;
        const contentRegex = /<div[^>]*(?:class|id)="[^"]*(?:content|article|post|main)[^"]*"[^>]*>(.*?)<\/div>/gis;

        let extractedContent = '';

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

        if (!extractedContent) {
          extractedContent = cleanContent;
        }

        extractedContent = extractedContent.replace(/<[^>]*>/g, ' ');

        extractedContent = extractedContent
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();

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

        return finalContent.substring(0, 8000);

      } catch (error) {
        lastError = error as Error;
        console.warn(`Strategy ${i + 1} failed:`, error);
        continue;
      }
    }

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
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    setIsLoading(true);
    setSourceUrl(url);
    setSourceText('');

    try {
      console.log('Starting content extraction from URL:', url);
      const content = await extractContentFromUrl(url);
      console.log('Content extracted successfully, generating MCQs...');
      await generateMCQsWithEdgeFunction(content, settings);
    } catch (error) {
      console.error('Error generating MCQs from URL:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateMCQsFromText = async (text: string, settings: GenerationSettings) => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.');
    }

    setIsLoading(true);
    setSourceText(text);
    setSourceUrl('');

    try {
      await generateMCQsWithEdgeFunction(text, settings);
    } catch (error) {
      console.error('Error generating MCQs from text:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateMCQsWithEdgeFunction = async (content: string, settings: GenerationSettings) => {
    try {
      const apiUrl = `${SUPABASE_URL}/functions/v1/generate-mcqs`;

      console.log('Sending request to Edge Function...');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.mcqs || !Array.isArray(data.mcqs)) {
        throw new Error('Invalid response format from server');
      }

      console.log(`Successfully generated ${data.mcqs.length} MCQs`);
      setMcqs(data.mcqs);

    } catch (error) {
      console.error('Error generating MCQs:', error);

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
      throw new Error(`Failed to generate MCQs with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
