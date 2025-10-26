
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryGenerationResponse } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateStoryAndImagePrompts = async (topic: string, ageRange: string, gender: string, tone: string): Promise<StoryGenerationResponse> => {
  const ai = getAiClient();
  const prompt = `Generate an educational story for children aged ${ageRange} about "${topic}".

First, create a "styleGuide". This guide must define a single, consistent visual style for all illustrations (e.g., 'soft pastel watercolor', 'vibrant and playful cartoon', 'claymation style'). If there are recurring characters, the style guide must also describe their consistent appearance in detail (e.g., 'The main character is a small, curious fox named Finn, who wears a tiny green backpack.').

Then, break the story into 4 to 6 distinct paragraphs. For each paragraph, provide a simple, descriptive, G-rated "imagePrompt" for an illustration that matches that part of the story. These prompts should only describe the scene and action, not the style.

Next, provide a detailed "voiceDescription" of the ideal narrator's voice for this story. The narrator must be a ${gender}. The description should include pace and overall character, and MUST embody a "${tone}" tone.

Finally, create a "quiz" with 3 multiple-choice questions based on the story's educational content. Each question must have a 'question' text, an array of 4 string 'options', and a 'correctAnswer' which is the exact string of the correct option.

Return the result as a single JSON object with four keys:
1. "styleGuide": a string describing the consistent visual style and character designs.
2. "story": an array of objects, where each object has a "paragraph" (string) and an "imagePrompt" (string).
3. "voiceDescription": a string describing the ideal narrator voice.
4. "quiz": an array of 3 quiz question objects.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleGuide: {
              type: Type.STRING
            },
            story: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  paragraph: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ['paragraph', 'imagePrompt']
              }
            },
            voiceDescription: {
              type: Type.STRING
            },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING }
                },
                required: ['question', 'options', 'correctAnswer']
              }
            }
          },
          required: ['styleGuide', 'story', 'voiceDescription', 'quiz']
        }
      }
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as StoryGenerationResponse;
  } catch (error) {
    console.error("Error generating story:", error);
    throw new Error("Failed to generate the story. Please try again.");
  }
};

export const selectBestElevenLabsVoice = async (voices: any[], voiceDescription: string): Promise<string> => {
    const ai = getAiClient();
    const simplifiedVoices = voices.map(v => ({
      voice_id: v.voice_id,
      name: v.name,
      description: v.labels.description,
      accent: v.labels.accent,
      age: v.labels.age
    }));

    const prompt = `From the following list of available narrator voices, choose the single best voice that matches this description: "${voiceDescription}".
    Prioritize the voice that best fits the tone and character described.
    Only return the exact "voice_id" string of your chosen voice. Do not include any other text, explanation, or formatting.

    Available voices:
    ${JSON.stringify(simplifiedVoices, null, 2)}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const voiceId = response.text.trim().replace(/['"]+/g, '');
        
        if (voices.some(v => v.voice_id === voiceId)) {
            return voiceId;
        } else {
            console.warn("Gemini returned an invalid voice_id. Falling back to the first voice in the list.");
            return voices[0]?.voice_id;
        }
    } catch (error) {
        console.error("Error selecting best voice:", error);
        throw new Error("Failed to select a narrator voice.");
    }
};

export const generateImage = async (prompt: string, styleGuide: string): Promise<string> => {
  const ai = getAiClient();
  const fullPrompt = `A vibrant, child-friendly illustration. Follow this style guide strictly: "${styleGuide}". The scene to draw is: "${prompt}". Ensure any characters mentioned are consistent with the style guide's description.`;
  try {
    // FIX: The 'contents' field for this model should be an object with a 'parts' array, not an array of objects.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: fullPrompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
      }
    });

    const candidate = response.candidates?.[0];

    if (!candidate || !candidate.content || !candidate.content.parts) {
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Image generation was blocked. Reason: ${response.promptFeedback.blockReason}`);
      }
      throw new Error('Image generation failed: The AI returned an invalid response.');
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Image generation failed, no image data found in the response parts.');
  } catch (error) {
    console.error("Error generating image:", error);
    if (error instanceof Error) {
      // Re-throw the original error to preserve the specific message (e.g., from a blocked prompt)
      throw error;
    }
    throw new Error("Failed to generate an image. Please try another prompt.");
  }
};

export const editImage = async (base64DataUrl: string, mimeType: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  const base64Data = base64DataUrl.split(',')[1];
  try {
    // FIX: The 'contents' field for this model should be an object with a 'parts' array, not an array of objects.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate || !candidate.content || !candidate.content.parts) {
        if (response.promptFeedback?.blockReason) {
            throw new Error(`Image editing was blocked. Reason: ${response.promptFeedback.blockReason}`);
        }
        throw new Error('Image editing failed: The AI returned an invalid response.');
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error('Image editing failed, no image data found.');
  } catch (error) {
    console.error("Error editing image:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to edit the image. Please try again.");
  }
};
