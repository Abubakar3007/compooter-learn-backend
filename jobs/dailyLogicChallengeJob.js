import cron from "node-cron";
import DailyChallenge from "../models/DailyChallenge.js";
import { generateLogicQuestions } from "../services/logicQuestionGenerator.js";

function getToday() {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
    }).format(new Date());
}

export async function createDailyChallenge() {
    const date = getToday();

    // Already generated?
    const existing = await DailyChallenge.findOne({ date });

    if (existing) {
        console.log("Daily challenge already exists:", date);
        return existing;
    }

    // Generate using AI
    const questions = await generateLogicQuestions();

    if (!Array.isArray(questions) || questions.length !== 6) {
        throw new Error("AI must generate exactly 6 questions");
    }

    // Validate each question
    for (const q of questions) {
        if (
            !q.question ||
            !q.category ||
            !q.difficulty ||
            !Array.isArray(q.options) ||
            q.options.length !== 4 ||
            !q.options.includes(q.correctAnswer) ||
            !q.explanation ||
            !q.hint
        ) {
            throw new Error("Invalid generated question");
        }
    }

    const challenge = await DailyChallenge.create({
        date,
        questions,
        isPublished: true,
    });

    console.log("Daily challenge created:", date);
    return challenge;
}

// Run every day at midnight in India
export function startDailyChallengeJob() {
    cron.schedule(
        "0 0 * * *",
        async () => {
            try {
                await createDailyChallenge();
            } catch (error) {
                console.error("Daily Challenge Error:", error);
            }
        },
        {
            timezone: "Asia/Kolkata",
        }
    );
}
