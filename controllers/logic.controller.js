import DailyChallenge from "../models/DailyLogicChallenges.js";

export const getDailyChallenge = async (req, res) => {
    try {
        const date = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
        }).format(new Date());

        const challenge = await DailyChallenge.findOne({
            date,
            isPublished: true,
        }).select("-questions.correctAnswer");

        if (!challenge) {
            return res.status(404).json({
                success: false,
                message: "Today's challenge is not available",
            });
        }

        return res.status(200).json({
            success: true,
            challenge,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch daily challenge",
        });
    }
};
