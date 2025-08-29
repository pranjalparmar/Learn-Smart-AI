import { GoogleGenAI, Type } from "@google/genai";
import { Flashcard, QA } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const generateContent = async <T,>(prompt: string, responseSchema: object): Promise<T> => {
    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema },
        });
        const jsonString = result.text.trim();
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate content from AI. The model may have returned an invalid response.");
    }
};

export const generateFlashcards = async (text: string): Promise<Omit<Flashcard, 'studyStatus'>[]> => {
    const prompt = `Based on the following study material, generate a set of high-quality, exam-relevant flashcards. Your output must strictly focus on core academic content.

    **RULES:**
    1.  **Focus exclusively on**: key definitions, core concepts, important facts, processes, and principles.
    2.  **Generate questions that would plausibly appear on a test or exam.**
    3.  **STRICTLY EXCLUDE**: any questions about the document's structure, metadata, lecturer's name, page numbers, generic instructions (e.g., "see figure 1.2"), or any other non-subject matter content. The output should be purely academic.
    4.  Each flashcard must have a clear question and a concise, accurate answer.

    Study Material:
    """
    ${text}
    """`;

    const flashcardSchema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "The question for the front of the flashcard." },
            answer: { type: Type.STRING, description: "The answer for the back of the flashcard." }
        },
        required: ["question", "answer"]
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            flashcards: {
                type: Type.ARRAY,
                items: flashcardSchema,
                description: "An array of flashcard objects."
            }
        },
        required: ["flashcards"]
    };
    
    const result = await generateContent<{ flashcards: { question: string; answer: string }[] }>(prompt, responseSchema);
    return result.flashcards.map((fc, index) => ({ ...fc, id: `fc-${Date.now()}-${index}` }));
};

export const generateKnowledgeQA = async (text: string): Promise<Omit<QA, 'studyStatus'>[]> => {
    const prompt = `From the provided text, create a list of exam-style, fact-based, and conceptual knowledge questions. The quality should be suitable for a university-level exam.

    **RULES:**
    1.  **Focus on**: Key concepts, definitions, processes, and factual recall that are central to the subject.
    2.  **Ensure each question has a direct, accurate answer found within the text.**
    3.  **STRICTLY EXCLUDE**: Questions about the document's author, course logistics, page numbers, formatting, or any non-academic "fluff". The goal is to create a realistic practice test.

    Text:
    """
    ${text}
    """`;

    const qaSchema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
        },
        required: ["question", "answer"]
    };
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            questions: {
                type: Type.ARRAY,
                items: qaSchema
            }
        },
        required: ["questions"]
    };
    
    const result = await generateContent<{ questions: { question: string, answer: string }[] }>(prompt, responseSchema);
    return result.questions.map((qa, index) => ({ ...qa, id: `kq-${Date.now()}-${index}` }));
};

export const generateScenarioQA = async (text: string): Promise<Omit<QA, 'studyStatus'>[]> => {
    const prompt = `Analyze the provided content to generate high-quality, application-based scenario questions suitable for an academic or professional exam.

    **RULES:**
    1.  **Create scenarios that require applying key concepts, principles, or formulas from the text.** The questions should test for deeper understanding, not just recall.
    2.  **Provide a clear, concise model answer for each scenario.**
    3.  **The scenarios and answers must be derived strictly from the provided content.** Do not introduce external information.
    4.  **STRICTLY EXCLUDE**: Any scenarios related to the document itself, its creation, or its author. Focus only on applying the subject matter.

    Content:
    """
    ${text}
    """`;

    const qaSchema = {
        type: Type.OBJECT,
        properties: {
            question: { type: Type.STRING, description: "A scenario-based question." },
            answer: { type: Type.STRING, description: "A model answer applying concepts from the text." }
        },
        required: ["question", "answer"]
    };
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            scenarios: {
                type: Type.ARRAY,
                items: qaSchema
            }
        },
        required: ["scenarios"]
    };

    const result = await generateContent<{ scenarios: { question: string, answer: string }[] }>(prompt, responseSchema);
    return result.scenarios.map((qa, index) => ({ ...qa, id: `sq-${Date.now()}-${index}` }));
};

export const generateChatResponse = async (question: string, context: string): Promise<string> => {
    const prompt = `You are an AI study assistant. Your sole purpose is to answer the user's question based strictly on the provided "Study Material". Do not use any external knowledge or make assumptions.

Follow these rules exactly:
1. Analyze the "Study Material" to find the most relevant information to answer the "User's Question".
2. If a direct answer is present, synthesize it into a clear and concise response. You may quote parts of the material directly using markdown blockquotes (e.g., > "quote from material").
3. If the material contains relevant information but does not directly answer the question, explain what you found and why it's not a complete answer.
4. If the "Study Material" does not contain any relevant information to answer the question, you MUST respond with EXACTLY this phrase and nothing else: "I could not find an answer to that question in the provided materials."

Study Material:
"""
${context}
"""

User's Question:
"""
${question}
"""

Answer:`;

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return result.text;
    } catch (error) {
        console.error("Gemini chat API call failed:", error);
        throw new Error("Failed to get a response from the AI assistant.");
    }
};