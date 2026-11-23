import { GoogleGenAI } from "@google/genai";
const QUESTION_COUNT = 6;

// Questions categories
const categories = [
    { category: "Number Pattern", difficulty: "Easy" },
    { category: "Mathematical Logic", difficulty: "Easy" },
    { category: "Reasoning Puzzle", difficulty: "Medium" },
    { category: "Odd One Out", difficulty: "Medium" },
    { category: "Sequence / Pattern", difficulty: "Medium" },
    { category: "Brain Teaser", difficulty: "Hard" },
];

// Questions Schema
const questionSchema = {
    type: "OBJECT",
    properties: {
        questions: {
            type: "ARRAY",
            minItems: 6,
            maxItems: 6,
            items: {
                type: "OBJECT",
                properties: {
                    question: {
                        type: "STRING",
                    },
                    category: {
                        type: "STRING",
                        enum: [
                            "Number Pattern",
                            "Mathematical Logic",
                            "Reasoning Puzzle",
                            "Odd One Out",
                            "Sequence / Pattern",
                            "Brain Teaser",
                        ],
                    },
                    difficulty: {
                        type: "STRING",
                        enum: ["Easy", "Medium", "Hard"],
                    },
                    options: {
                        type: "ARRAY",
                        minItems: 4,
                        maxItems: 4,
                        items: {
                            type: "STRING",
                        },
                    },
                    correctAnswer: {
                        type: "STRING",
                    },
                    explanation: {
                        type: "STRING",
                    },
                    hint: {
                        type: "STRING",
                    },
                    xp: {
                        type: "INTEGER",
                    },
                },
                required: [
                    "question",
                    "category",
                    "difficulty",
                    "options",
                    "correctAnswer",
                    "explanation",
                    "hint",
                    "xp",
                ],
            },
        },
    },
    required: ["questions"],
};

function validateQuestions(questions) {
    if (!Array.isArray(questions) || questions.length !== QUESTION_COUNT) {
        throw new Error("Gemini must generate exactly 6 questions.");
    }

    const seenQuestions = new Set();

    for (const [index, q] of questions.entries()) {
        if (
            !q.question?.trim() ||
            !q.category ||
            !q.difficulty ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            !q.correctAnswer ||
            !q.explanation?.trim() ||
            !q.hint?.trim()
        ) {
            throw new Error(`Question ${index + 1} has invalid fields.`);
        }

        // Ensure there are 4 unique options.
        const uniqueOptions = new Set(
            q.options.map((option) => option.trim().toLowerCase())
        );

        if (uniqueOptions.size !== 4) {
            throw new Error(`Question ${index + 1} has duplicate options.`);
        }

        // Ensure correct answer exists in options.
        if (!q.options.includes(q.correctAnswer)) {
            throw new Error(
                `Question ${index + 1} has an invalid correct answer.`
            );
        }

        // Prevent duplicate questions in the same challenge.
        const normalizedQuestion = q.question
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .replace(/\s+/g, " ");

        if (seenQuestions.has(normalizedQuestion)) {
            throw new Error("Duplicate questions generated.");
        }

        seenQuestions.add(normalizedQuestion);

        if (!Number.isInteger(q.xp) || q.xp < 1 || q.xp > 50) {
            throw new Error(`Question ${index + 1} has invalid XP.`);
        }
    }

    // Validate expected category and difficulty order.
    questions.forEach((q, index) => {
        const expected = categories[index];

        if (
            q.category !== expected.category ||
            q.difficulty !== expected.difficulty
        ) {
            throw new Error(
                `Question ${index + 1} must be ${expected.category} (${expected.difficulty}).`
            );
        }
    });

    return questions;
}

export async function generateLogicQuestions({
    previousQuestions = [],
    date = new Date().toISOString().slice(0, 10),
} = {}) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is missing from .env");
    }

    const ai = new GoogleGenAI({ apiKey });

    const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    const previousQuestionsText = previousQuestions.length
        ? previousQuestions
            .slice(-100)
            .map((q) => `- ${q}`)
            .join("\n")
        : "No previous questions provided.";

    const prompt = `
You are an expert educational puzzle creator for CodeQuest.

Generate exactly 6 ORIGINAL logic challenge questions for students
aged 10-16 (Class 5 and above).

Today's challenge date: ${date}

QUESTION REQUIREMENTS:

1. Number Pattern - Easy
2. Mathematical Logic - Easy
3. Reasoning Puzzle - Medium
4. Odd One Out - Medium
5. Sequence / Pattern - Medium
6. Brain Teaser - Hard

Every question must contain:
- question
- category
- difficulty
- exactly 4 options
- correctAnswer
- explanation
- hint
- xp

IMPORTANT RULES:

1. Use simple, student-friendly English.
2. Create original questions, not copied from common examples.
3. Do not repeat these previous questions:
${previousQuestionsText}

4. Each question must have exactly ONE correct answer.
5. The correctAnswer must exactly match one of the four options.
6. All four options must be different.
7. Check your answer mathematically and logically before responding.
8. Explanation must clearly explain why the answer is correct.
9. Hint should guide the student without revealing the answer.
10. Use different reasoning styles across the six questions.
11. Assign 5 XP to each question.
12. Avoid ambiguous wording or missing information.

Return only the JSON matching the provided schema.
`;

    // Retry temporary Gemini API failures with exponential backoff.
    const MAX_ATTEMPTS = 4;
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseJsonSchema: questionSchema,
                    temperature: 0.8,
                    maxOutputTokens: 5000,
                },
            });

            if (!response.text) {
                throw new Error("Gemini returned an empty response.");
            }

            const parsed = JSON.parse(response.text);
            const questions = validateQuestions(parsed.questions);

            console.log(
                `Successfully generated ${questions.length} logic questions.`
            );

            return questions;

        } catch (error) {
            lastError = error;

            const errorMessage = String(error.message || error);

            const isTemporaryError = /\b(429|500|502|503|504)\b/.test(errorMessage) || error.status === 429 || error.status === 503;

            console.error(`Generation attempt ${attempt}/${MAX_ATTEMPTS} failed:`, errorMessage);

            if (!isTemporaryError || attempt === MAX_ATTEMPTS) {
                break;
            }

            const delay = Math.pow(2, attempt) * 1000;
            const jitter = Math.floor(Math.random() * 1000);
            const waitTime = delay + jitter;

            console.log(
                `⏳ Retrying in ${Math.round(waitTime / 1000)} seconds...`
            );

            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
    }

    throw new Error(
        `Failed to generate valid logic questions: ${lastError?.message}`
    );
}
