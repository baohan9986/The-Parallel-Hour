import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.post("/api/universe-text", async (req, res) => {
    try {
        const { prompt } = req.body;

        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a highly creative writer. Output exactly one short sentence under 10 words. No quotes, no explanations. The sentence MUST clearly state WHO (randomly switching between ordinary everyday jobs and highly niche/unusual professions), DOING WHAT (an action fitting the time), and WHERE (a specific location). Always choose completely different professions and locations. Output in English only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 1.2
        });

        res.json({
            text: response.choices[0].message.content
        });
    } catch (error) {
        console.error("OpenAI error:", error);
        res.status(500).json({
            error: "OpenAI request failed"
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});