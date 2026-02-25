import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates a mood summary based on session questions
 * @param questions Array of question strings
 * @returns A brief textual summary of the class mood/engagement
 */
export const generateMoodSummary = async (questions: string[]): Promise<string> => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('GEMINI_API_KEY is missing. Returning placeholder summary.');
        return "AI Summary is unavailable (API key missing). Based on volume, the class seems engaged.";
    }

    const modelNames = ['gemma-2-9b-it', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-pro'];

    const prompt = `
      You are an AI teaching assistant. Analyze the following list of questions asked by students during a live classroom session.
      Your goal is to provide a brief (1-2 sentences) summary of the "Class Mood" or "Collective Understanding". 
      Focus on whether the students seem engaged, confused, curious, or overwhelmed. 
      Keep it encouraging and professional for the teacher to read.

      Questions:
      ${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

      Summary:
    `;

    for (const name of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error: any) {
            console.warn(`Mood summary with ${name} failed: ${error.message}`);
            continue;
        }
    }

    return "The class was active with several questions. The general mood appears curious and engaged.";
};

/**
 * Analyzes a single question for complexity, sentiment, and cognitive level.
 * Generates an answer if the question is simple.
 * @param questionText The text of the question
 * @returns Object containing complexity, aiAnswer, sentiment, and cognitiveLevel
 */
export const analyzeQuestion = async (questionText: string) => {
    if (!process.env.GEMINI_API_KEY) {
        return {
            complexity: 'simple',
            sentiment: 'Neutral',
            cognitiveLevel: 'Recall',
            aiAnswer: 'AI features are currently unavailable. The teacher will address your question shortly.'
        };
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log(`AI Analysis started for: "${questionText.substring(0, 20)}..." using Key starting with: ${apiKey.substring(0, 4)}`);

    // UPDATED: Prioritize Gemma models as diagnostics confirmed they are WORKING while Gemini is Quota Limited
    const modelNames = [
        'gemma-3-4b-it',
        'gemma-3-1b-it',
        'gemma-2-9b-it',
        'gemini-2.0-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-flash',
        'gemini-pro'
    ];

    const prompt = `
      You are an AI Teaching Assistant for a platform called Vi-SlideS.
      Analyze the following student question and provide a structured JSON response based on these EXACT criteria:

      1. CLASSIFICATION RULES:
         - SET complexity to "simple" and PROVIDE aiAnswer if:
           A. Factual/Direct Questions (Definitions, facts, formulas, capitals, laws).
           B. Procedural/How-to (Standard steps, coding syntax, math solutions).
         - SET complexity to "complex" AND STRICTLY SET aiAnswer to null if:
           C. Conceptual/Why (Reasoning, analogies, deep explanations, comparisons).
           D. Personal/Performance (Grades, marks, checking individual projects).
           E. Ambiguous/Opinion (Subjective bests, open-ended debate).

      CRITICAL: For "complex" questions, the "aiAnswer" MUST be null. DO NOT try to be helpful. The teacher wants to handle these personally.

      2. FIELDS TO RETURN:
         - complexity: "simple" | "complex"
         - aiAnswer: A brief (1-3 sentences) helpful answer ONLY if simple. If complex, this MUST be the literal value null.
         - sentiment: One descriptive word (e.g., Curious, Confused, Frustrated, Proactive).
         - cognitiveLevel: One word from Bloom's Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create).

      Student Question: "${questionText}"

      Respond ONLY with a valid JSON object. No markdown, no extra text.
      Format:
      {
        "complexity": "simple" | "complex",
        "aiAnswer": "string" | null,
        "sentiment": "string",
        "cognitiveLevel": "string"
      }
    `;

    for (const name of modelNames) {
        try {
            console.log(`Attempting analysis with model: ${name}...`);
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(prompt);
            const response = await result.response;

            let responseText = "";
            try {
                responseText = response.text().trim();
            } catch (innerError) {
                console.warn(`Model ${name} returned a safety block or empty response.`);
                continue;
            }

            console.log(`--- RAW RESPONSE FROM ${name} ---`);
            console.log(responseText);
            console.log('---------------------------');

            try {
                const cleanJson = responseText.replace(/^```json\s*|```$/g, '').trim();
                const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
                const jsonStr = jsonMatch ? jsonMatch[0] : cleanJson;
                const parsed = JSON.parse(jsonStr);
                console.log(`Successfully parsed analysis using ${name}`);
                return parsed;
            } catch (parseError) {
                console.error(`JSON Parse Error with ${name}:`, responseText);
                continue;
            }
        } catch (error: any) {
            console.warn(`Analysis with ${name} failed: ${error.message}`);
            // Retry on 404 (Not Found) OR 429 (Quota Exceeded)
            if (
                error.message.includes('404') ||
                error.message.includes('not found') ||
                error.message.includes('429') ||
                error.message.includes('quota') ||
                error.message.includes('Too Many Requests')
            ) {
                continue;
            }
        }
    }

    // If we get here, all models failed
    const finalError = `AI Error: All tried models failed. Common causes: 1) API Key has no 'Generative Language API' enabled (404), or 2) Free tier quota exhausted (429). Please check Google AI Studio.`;

    return {
        complexity: 'complex',
        sentiment: 'Setup Required',
        cognitiveLevel: 'N/A',
        aiAnswer: finalError
    };
};

/**
 * Clusters a list of questions into logical topic groups
 * @param questions Object array with id and content
 * @returns Map of Topic Name to Array of Question IDs
 */
export const clusterQuestions = async (questions: { id: string, text: string }[]) => {
    if (!process.env.GEMINI_API_KEY || questions.length === 0) {
        return { "General": questions.map(q => q.id) };
    }

    const modelNames = ['gemma-2-9b-it', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const prompt = `
      You are an AI teaching assistant. Cluster the following student questions into 3-5 logical "Topic Groups".
      Return ONLY a valid JSON object where the keys are the Topic Names (brief, 1-3 words) and the values are arrays of IDs belonging to that topic.

      Questions:
      ${questions.map(q => `ID: ${q.id} | Question: ${q.text}`).join('\n')}

      Format:
      {
        "React Hooks": ["id1", "id3"],
        "Performance": ["id2"]
      }
    `;

    for (const name of modelNames) {
        try {
            const model = genAI.getGenerativeModel({ model: name });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const responseText = response.text().trim();

            const cleanJson = responseText.replace(/^```json\s*|```$/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
        } catch (error) {
            console.warn(`Clustering with ${name} failed, trying next...`);
            continue;
        }
    }

    return { "General": questions.map(q => q.id) };
};
