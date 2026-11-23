import mongoose from "mongoose";
const lessonProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        courseId: {
            type: String,
            required: true,
        },

        lessonId: {
            type: String,
            required: true,
        },

        completed: {
            type: Boolean,
            default: false,
        },

        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

lessonProgressSchema.index(
    { userId: 1, courseId: 1, lessonId: 1 },
    { unique: true }
);

const LessonProgress = mongoose.models.LessonProgress || mongoose.model("LessonProgress", lessonProgressSchema);
export default LessonProgress;