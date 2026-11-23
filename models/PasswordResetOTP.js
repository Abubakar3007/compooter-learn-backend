import mongoose from "mongoose";
const passwordResetOTPSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        otpHash: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        attempts: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Automatically delete expired OTP documents
passwordResetOTPSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

const PasswordResetOTP = mongoose.models.PasswordResetOTP || mongoose.model("PasswordResetOTP", passwordResetOTPSchema);
export default PasswordResetOTP;