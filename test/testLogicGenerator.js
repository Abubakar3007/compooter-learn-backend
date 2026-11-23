
import "dotenv/config";
import { generateLogicQuestions } from "../services/logicQuestionGenerator.js";

async function testLogicGenerator() {
    console.log("🚀 Starting Logic Generator Test...\n");

    try {
        const questions = await generateLogicQuestions({
            date: new Date().toISOString().slice(0, 10),
            previousQuestions: [],
        });

        console.log("✅ Generated Questions:", questions.length);

        questions.forEach((q, index) => {
            console.log("\n================================");
            console.log(`QUESTION ${index + 1}`);
            console.log("================================");

            console.log("Question:", q.question);
            console.log("Category:", q.category);
            console.log("Difficulty:", q.difficulty);

            console.log("\nOptions:");

            q.options.forEach((option, i) => {
                console.log(`${String.fromCharCode(65 + i)}. ${option}`);
            });

            console.log("\nCorrect Answer:", q.correctAnswer);
            console.log("Hint:", q.hint);
            console.log("Explanation:", q.explanation);
            console.log("XP:", q.xp);
        });

        console.log("\n🎉 TEST COMPLETED SUCCESSFULLY!");
    } catch (error) {
        console.error("\n❌ TEST FAILED!");
        console.error(error);
    }
}

testLogicGenerator();