import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

async function test() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log('No API KEY');
        return;
    }

    console.log('--- Scanning for Working Models ---');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data: any = await response.json();

        if (response.ok && data.models) {
            // Filter for generation models
            const genModels = data.models.filter((m: any) => m.supportedGenerationMethods.includes('generateContent'));

            console.log(`Found ${genModels.length} candidates. Testing each...`);

            const genAI = new GoogleGenerativeAI(apiKey);

            for (const m of genModels) {
                const name = m.name.replace('models/', '');
                process.stdout.write(`Testing ${name}... `);

                try {
                    const model = genAI.getGenerativeModel({ model: name });
                    const result = await model.generateContent('Hi');
                    const text = await result.response.text(); // Await text to ensure full success
                    console.log(`✅ WORKING!`);
                } catch (err: any) {
                    if (err.message.includes('429')) console.log(`❌ 429 (Quota)`);
                    else if (err.message.includes('404')) console.log(`❌ 404 (Not Found)`);
                    else console.log(`❌ Error: ${err.message.substring(0, 30)}...`);
                }
            }
        } else {
            console.error('Error listing models:', data);
        }
    } catch (err: any) {
        console.error('Test error:', err.message);
    }
}

test();
