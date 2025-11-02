import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.2.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerationSettings {
  numQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  numAnswers: number;
  temperature: number;
  includeHints: boolean;
  includeExplanations: boolean;
  allowMultipleCorrect: boolean;
}

interface MCQ {
  question: string;
  options: string[];
  correctAnswer: number | number[];
  difficulty: "easy" | "medium" | "hard";
  hint?: string;
  explanation?: string;
  type: "single" | "multiple";
}

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
- ${settings.includeHints ? "Include helpful hints for each question" : "Do not include hints"}
- ${settings.includeExplanations ? "Include detailed explanations for correct answers" : "Do not include explanations"}
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
  ${settings.includeHints ? '"hint": "Helpful hint here",' : ""}
  ${settings.includeExplanations ? '"explanation": "Detailed explanation here"' : ""}
}

For multiple correct answer questions (if enabled):
{
  "question": "Select all that apply: Question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": [0, 2],
  "type": "multiple",
  "difficulty": "${settings.difficulty}",
  ${settings.includeHints ? '"hint": "Helpful hint here",' : ""}
  ${settings.includeExplanations ? '"explanation": "Detailed explanation here"' : ""}
}

Important: Return ONLY the JSON array, no additional text or formatting.
`;
};

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { content, settings } = await req.json();

    if (!content || !settings) {
      return new Response(
        JSON.stringify({ error: "Missing content or settings" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured in environment" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: settings.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });

    const prompt = generateMCQPrompt(content, settings);
    console.log("Generating MCQs with Gemini...");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    let generatedMCQs;

    try {
      generatedMCQs = JSON.parse(cleanedText);
    } catch (parseError) {
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedMCQs = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse JSON response from AI");
      }
    }

    if (!Array.isArray(generatedMCQs)) {
      throw new Error("Invalid response format from AI - expected array");
    }

    const validatedMCQs: MCQ[] = generatedMCQs
      .slice(0, settings.numQuestions)
      .map((mcq: any) => {
        if (!mcq.type) {
          mcq.type = Array.isArray(mcq.correctAnswer) ? "multiple" : "single";
        }

        if (mcq.type === "multiple" && !Array.isArray(mcq.correctAnswer)) {
          mcq.correctAnswer = [mcq.correctAnswer];
        } else if (mcq.type === "single" && Array.isArray(mcq.correctAnswer)) {
          mcq.correctAnswer = mcq.correctAnswer[0];
        }

        return mcq;
      });

    console.log(`Successfully generated ${validatedMCQs.length} MCQs`);

    return new Response(
      JSON.stringify({ mcqs: validatedMCQs }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
