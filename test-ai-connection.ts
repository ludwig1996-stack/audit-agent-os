import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('Testing Gemini API with key starting with:', apiKey?.substring(0, 10));

    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is not defined in .env.local');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        console.log('Sending test prompt...');
        const result = await model.generateContent('Say "Connection Successful!" if you can read this.');
        const response = await result.response;
        const text = response.text();

        console.log('AI Response:', text);

        if (text.includes('Connection Successful')) {
            console.log('SUCCESS: Gemini AI is correctly configured.');
        } else {
            console.log('WARNING: AI responded but with unexpected content.');
        }
    } catch (error: any) {
        console.error('FAILED: Error connecting to Gemini API:');
        console.error(error.message);
    }
}

testGemini();
