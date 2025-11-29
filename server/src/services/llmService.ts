import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateResponse = async (history: ChatMessage[]) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: history,
      // GANTI MODEL DI SINI:
      model: "llama-3.3-70b-versatile", 
      temperature: 0.7,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Maaf, saya tidak bisa menjawab saat ini.";
  } catch (error) {
    console.error("Error calling Groq:", error);
    return "Terjadi kesalahan pada server AI.";
  }
};