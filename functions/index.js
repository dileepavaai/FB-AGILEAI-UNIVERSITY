/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const OpenAI = require("openai");

// Secure API key from Firebase config
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

// ===============================================
// 🔥 AI REPLY GENERATOR FUNCTION
// ===============================================
exports.generateReply = functions.https.onCall(async (data, context) => {
  try {
    const { message, name, role, company } = data;

    if (!message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Message is required"
      );
    }

    // 🧠 Prompt Engineering (Agile AI tone)
    const prompt = `
You are an expert in professional communication for Agile AI University.

Context:
- Lead Name: ${name || "Unknown"}
- Role: ${role || "Unknown"}
- Company: ${company || "Unknown"}

Incoming Message:
"${message}"

Task:
Generate a professional, warm, and concise reply.
- Keep it human (not robotic)
- Build trust
- Keep it short (max 4-5 lines)
- Slight consultative tone
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful business communication assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;

    return { reply };

  } catch (error) {
    console.error("AI ERROR:", error);

    throw new functions.https.HttpsError(
      "internal",
      "AI reply generation failed"
    );
  }
});