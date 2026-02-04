const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testGemini() {
    let apiKey = '';

    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
        }
    } catch (e) {
        console.error('Could not read .env.local manually');
    }

    if (!apiKey) {
        console.error('Error: GEMINI_API_KEY is not defined in .env.local');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using an available model from the list
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

        console.log('Sending test prompt with gemini-2.0-flash...');
        const result = await model.generateContent('Say "Connection Successful!" if you can read this.');
        const response = await result.response;
        const text = response.text();

        console.log('AI Response:', text);

        if (text.includes('Connection Successful')) {
            console.log('SUCCESS: Gemini AI is correctly configured.');
        } else {
            console.log('WARNING: AI responded but with unexpected content.');
        }
    } catch (error) {
        console.error('FAILED: Error connecting to Gemini API:');
        console.error(error.message);
    }
}

testGemini();
