import LessonProgress from "../models/LessonProgress.js";

export const completeLesson = async (req, res) => {
    try {
        const { courseId, lessonId } = req.body;
        if (!courseId || !lessonId) {
            return res.status(400).json({
                success: false,
                message: "Course ID and Lesson ID are required",
            });
        };

        const progress = await LessonProgress.findOneAndUpdate(
            {
                userId: req.user._id,
                courseId,
                lessonId,
            },
            {
                $set: {
                    completed: true,
                    completedAt: new Date(),
                },
            },
            {
                upsert: true,
                new: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Lesson completed successfully",
            progress,
        });
    } catch (error) {
        console.error("Complete Lesson Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update lesson progress",
        });
    }
};

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const progress = await LessonProgress.find({
            userId: req.user._id,
            courseId,
            completed: true,
        }).select("lessonId completed completedAt");
        
        return res.status(200).json({
            success: true,
            progress,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to fetch progress",
        });
    }
};