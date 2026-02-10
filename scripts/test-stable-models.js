const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

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

async function testModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found');
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Testing models that appeared in the list and might be more stable/generous
    const modelsToTest = [
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-2.0-flash-lite-001'
    ];

    console.log('Testing models for 200 OK...');

    for (const modelName of modelsToTest) {
        try {
            console.log(`\n👉 Testing: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say "OK"');
            const response = await result.response;
            console.log(`✅ ${modelName} SUCCESS: ${response.text()}`);
        } catch (error) {
            console.log(`❌ ${modelName} FAILED: ${error.message}`);
        }
    }
}

testModels();
