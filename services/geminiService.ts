import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedTopicNode, GeneratedContentPayload } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

export const generateConceptMapStructure = async (text: string): Promise<GeneratedTopicNode[]> => {
    const prompt = `Based on the following study material, generate a hierarchical concept map of topics and sub-topics.

    **RULES:**
    1.  **Hierarchical Structure**: Analyze the text to identify main topics and sub-topics. Organize them into a logical parent-child hierarchy.
    2.  **Unique IDs**: Assign a unique string ID to every single topic node (e.g., 'topic-1712345678-0').
    3.  **STRUCTURE ONLY**: The output must ONLY contain the hierarchical structure of 'id' and 'label' for each node. Do NOT generate any flashcards or Q&A content in this step.
    4.  **Output Format**: The final output must be a JSON object matching the provided schema, with an array of main topic nodes at the root.

    Study Material:
    """
    ${text}
    """`;

    const baseNodeProps = {
        id: { type: Type.STRING },
        label: { type: Type.STRING },
    };
    
    const requiredProps = ["id", "label"];

    // Recursive schema definition up to 4 levels deep
    const topicNodeSchemaL4 = { type: Type.OBJECT, properties: baseNodeProps, required: requiredProps };
    const topicNodeSchemaL3 = { type: Type.OBJECT, properties: { ...baseNodeProps, children: { type: Type.ARRAY, items: topicNodeSchemaL4 } }, required: requiredProps };
    const topicNodeSchemaL2 = { type: Type.OBJECT, properties: { ...baseNodeProps, children: { type: Type.ARRAY, items: topicNodeSchemaL3 } }, required: requiredProps };
    const topicNodeSchemaL1 = { type: Type.OBJECT, properties: { ...baseNodeProps, children: { type: Type.ARRAY, items: topicNodeSchemaL2 } }, required: requiredProps };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            studyTopics: {
                type: Type.ARRAY,
                items: topicNodeSchemaL1,
                description: "The root of the structured study materials."
            }
        },
        required: ["studyTopics"]
    };

    try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema },
        });

        const jsonString = result.text?.trim();

        if (!jsonString) {
            const finishReason = result.candidates?.[0]?.finishReason;
            const safetyRatings = result.promptFeedback?.safetyRatings;
            
            let detailedError = "The AI returned an empty response, which may be due to the input document's content, length, or a temporary API issue.";
            if (finishReason === 'SAFETY') {
                detailedError = "The response was blocked due to safety concerns. This can happen if the source material contains sensitive content.";
                if (safetyRatings && safetyRatings.length > 0) {
                    detailedError += ` Details: ${safetyRatings.map(r => `${r.category}: ${r.probability}`).join(', ')}`;
                }
            } else if (finishReason) {
                detailedError = `The response was stopped for reason: ${finishReason}.`;
            }
            
            console.error("Gemini API call for concept map structure failed to return content.", { detailedError, fullResponse: result });
            throw new Error(detailedError);
        }

        const parsed = JSON.parse(jsonString) as { studyTopics: GeneratedTopicNode[] };
        return parsed.studyTopics;
    } catch (error) {
        console.error("Error processing concept map structure from Gemini:", error);
        throw error;
    }
};

export const populateTopicWithContent = async (topicLabel: string, context: string): Promise<GeneratedContentPayload> => {
    const prompt = `Based on the full study material provided, generate study aids ONLY for the topic: "${topicLabel}" and its sub-topics.

    **RULES:**
    1.  **Content per Topic**: For this specific topic block, you MUST generate:
        a.  **Flashcards**: 1-5 key definitions or core concepts.
        b.  **Knowledge Q&A**: 1-5 fact-based or conceptual questions.
        c.  **Scenario Q&A**: At least one scenario-based question applying the information.
    2.  **Content Focus**: All generated content must be strictly derived from the provided text.
    3.  **Output Format**: The final output must be a single JSON object matching the schema, containing the three content arrays.

    Full Study Material:
    """
    ${context}
    """`;

    const baseItemSchema = {
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
            flashcards: { type: Type.ARRAY, items: baseItemSchema },
            knowledgeQA: { type: Type.ARRAY, items: baseItemSchema },
            scenarioQA: { type: Type.ARRAY, items: baseItemSchema }
        },
        required: ["flashcards", "knowledgeQA", "scenarioQA"]
    };

     try {
        const result = await ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema },
        });

        const jsonString = result.text?.trim();

        if (!jsonString) {
            const finishReason = result.candidates?.[0]?.finishReason;
            let detailedError = `The AI returned empty content for topic "${topicLabel}".`;
            if (finishReason) {
                 detailedError += ` Reason: ${finishReason}.`;
            }

            console.error(`Gemini API call for topic content "${topicLabel}" failed to return content.`, { detailedError, fullResponse: result });
            throw new Error(detailedError);
        }

        return JSON.parse(jsonString) as GeneratedContentPayload;
    } catch (error) {
        console.error(`Gemini API call failed for topic content "${topicLabel}":`, error);
        throw error;
    }
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