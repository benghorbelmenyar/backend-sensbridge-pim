const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Basic .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const match = line.match(/^\s*([^=]+?)\s*=\s*(.*)?\s*$/);
            if (match) {
                const key = match[1];
                let value = match[2] || '';
                if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                    value = value.replace(/^"|"$/g, '');
                }
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.error('Error loading .env file:', e.message);
    }
}

loadEnv();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        // Note: listModels is a method on the GoogleGenerativeAI instance? 
        // Wait, the SDK exposes it on the GenerativeModel or maybe directly?
        // Let's check the docs or try usually it's on the client.
        // Actually, in the newer SDK versions, it might be different.
        // But let's try a simple generation with a known model first to prove connectivity,
        // or use the list models feature if available.

        // For v1beta, there is a model service.
        // The SDK might not expose listModels directly on the main class easily in all versions.
        // Let's assume we want to just test 'gemini-1.5-flash' and 'gemini-1.5-pro' and see specifically which one works.

        const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest'];

        console.log('Testing models...');

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Hello');
                const response = await result.response;
                console.log(`✅ Model ${modelName} works! Response: ${response.text()}`);
            } catch (error) {
                console.log(`❌ Model ${modelName} failed: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

listModels();
