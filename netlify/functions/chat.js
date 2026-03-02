// netlify/functions/chat.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function handler(event, context) {
  // Sirf POST requests allow karein
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { message, system_prompt } = JSON.parse(event.body);

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: system_prompt },
        { role: "user", content: message }
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
