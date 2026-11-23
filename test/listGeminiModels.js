import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

async function listModels() {
    try {
        console.log("Checking available Gemini models...\n");

        const models = await ai.models.list();

        for await (const model of models) {
            const actions = model.supportedActions || [];

            if (actions.includes("generateContent")) {
                console.log("Model:", model.name);
                console.log("Supported:", actions.join(", "));
                console.log("----------------------------");
            }
        }
    } catch (error) {
        console.error("Model listing failed:", error.message);
    }
}

listModels();