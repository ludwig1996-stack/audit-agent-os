import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'production') {
    console.warn('Missing GEMINI_API_KEY! AI features will be disabled.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const getModel = (modelName: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-pro') => {
    if (!genAI) return null;
    return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Audit Agent Reasoning Orchestrator
 */
export async function auditReasoning(prompt: string, context: string) {
    const model = getModel('gemini-1.5-pro');
    if (!model) throw new Error('AI Engine not initialized');

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `Context: ${context}\n\nTask: ${prompt}` }] }],
        generationConfig: {
            temperature: 0.1, // High precision for auditing
            topP: 0.8,
            topK: 40,
        }
    });

    return result.response.text();
}
