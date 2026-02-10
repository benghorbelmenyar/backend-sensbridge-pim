const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Basic .env parser (reused)
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../../.env'); // Adjusted path from scripts/ to root
        if (!fs.existsSync(envPath)) {
            // Fallback to checking one level up in case I'm running from root
            const envPathRoot = path.resolve(__dirname, '../.env');
            if (fs.existsSync(envPathRoot)) {
                // Load from root
                const envContent = fs.readFileSync(envPathRoot, 'utf8');
                parseEnv(envContent);
                return;
            }
        }
        const envContent = fs.readFileSync(envPath, 'utf8');
        parseEnv(envContent);
    } catch (e) {
        console.error('Error loading .env file:', e.message);
    }
}

function parseEnv(content) {
    content.split('\n').forEach(line => {
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
}


loadEnv();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    // The GoogleGenerativeAI class doesn't seem to have listModels directly in the simplified usage.
    // We need to use the ModelService usually, or a different entry point.
    // However, looking at the source for 0.24.1, it should be available via the API or a manager.
    // Actually, let's try to just fetch the model listing via REST if the SDK is obscure about it,
    // but better to try the SDK first.

    // Wait, the error message says: "Call ListModels to see the list of available models"
    // This implies there is a way.

    try {
        // In typical usage, it might not be exposed on the main helper class directly.
        // Let's try to use the raw API via fetch if we can't find it in the SDK easily without types.

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('Available models:');
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log('No models found or error:', data);
        }

    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
