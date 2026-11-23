import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
    },

    options: {
        type: [String],
        required: true,
    },

    correctAnswer: {
        type: String,
        required: true,
    },

    explanation: {
        type: String,
        required: true,
    },

    hint: {
        type: String,
        required: true,
    },

    xp: {
        type: Number,
        default: 5,
    },
});

const dailyChallengeSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true,
        },
        questions: {
            type: [questionSchema],
            validate: (v) => v.length === 6,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("DailyChallenge", dailyChallengeSchema);