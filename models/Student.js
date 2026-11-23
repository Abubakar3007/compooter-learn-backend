import mongoose from "mongoose";
const studentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },

        classes: {
            type: String,
            required: true,
        },

        enjoy: {
            type: [String],
            required: true,
        },

        level: {
            type: String,
            required: true,
            enum: [
                "Complete Beginner",
                "I have tried coding",
                "Beginner",
                "Intermediate",
            ],
        },

        build: {
            type: String,
            required: true,
            enum: ["Games", "Websites", "Apps", "AI", "Robots", "Animations"],
        },
    },
    { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;