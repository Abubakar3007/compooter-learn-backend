
import axios from "axios";

// Create Judge0 client when a request is made
const getJudge0 = () => {
    const baseURL = process.env.JUDGE0_URL?.trim();

    if (!baseURL) {
        throw new Error("JUDGE0_URL is missing from .env");
    }

    return axios.create({
        baseURL,
        timeout: 15000,
    });
};

// Submit code
export const submitCode = async (req, res) => {
    try {
        const { code, languageId, stdin = "" } = req.body;

        if (
            typeof code !== "string" ||
            !code.trim() ||
            !Number.isInteger(languageId)
        ) {
            return res.status(400).json({
                message: "Invalid code or language",
            });
        }

        const response = await getJudge0().post("/submissions?base64_encoded=false&wait=false",
            {
                source_code: code,
                language_id: languageId,
                stdin,
                cpu_time_limit: 2,
                wall_time_limit: 5,
                memory_limit: 128000,
            }
        );

        res.status(202).json({
            token: response.data.token,
        });

    } catch (error) {
        console.error("CODE SUBMISSION ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "Code submission failed",
        });
    }
};

// Get execution result
export const getCode = async (req, res) => {
    try {
        const response = await getJudge0().get(
            `/submissions/${encodeURIComponent(req.params.token)}?base64_encoded=false`
        );

        res.json(response.data);

    } catch (error) {
        console.error("CODE RESULT ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "Could not fetch execution result",
        });
    }
};

// Supported languages
export const getLanguages = async (req, res) => {
    try {
        const response = await getJudge0().get("/languages");

        const supportedLanguages = [
            { id: 103, name: "C", version: "GCC 14.1.0", slug: "c" },
            { id: 105, name: "C++", version: "GCC 14.1.0", slug: "cpp" },
            { id: 51, name: "C#", version: "Mono 6.6.0", slug: "csharp" },
            { id: 91, name: "Java", version: "JDK 17", slug: "java" },
            { id: 102, name: "JavaScript", version: "Node.js 22", slug: "javascript" },
            { id: 109, name: "Python", version: "3.13.2", slug: "python" },
            { id: 107, name: "Go", version: "1.23.5", slug: "go" },
        ];

        const availableIds = new Set(
            response.data.map(lang => lang.id)
        );

        const languages = supportedLanguages.filter(
            lang => availableIds.has(lang.id)
        );

        res.status(200).json(languages);

    } catch (error) {
        console.error("JUDGE0 LANGUAGES ERROR:", error.response?.data || error.message);

        res.status(500).json({
            message: "Failed to fetch languages",
        });
    }
};
