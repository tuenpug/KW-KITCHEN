
import { GoogleGenAI, Type } from "@google/genai";
import { CuisineType, Recipe, Language, CookingMethod, CookingTime, GenerationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecipe = async (
  ingredients: string[], 
  excludedIngredients: string[],
  cuisine: CuisineType, 
  method: CookingMethod | undefined, 
  time: CookingTime | undefined,
  servings: number,
  isFineDining: boolean,
  language: Language
): Promise<GenerationResult> => {
  const langPrompt = language === 'zh' ? 'Respond in Traditional Chinese.' : 'Respond in English.';
  const methodPrompt = method ? `The primary cooking method must be ${method}.` : '';
  const timePrompt = time ? `The estimated total preparation and cooking time should be around ${time}.` : '';
  const servingsPrompt = `The recipe should be portioned for ${servings} person(s).`;
  const fineDiningPrompt = isFineDining 
    ? "This is a 'Fine Dining' request. Create a recipe with highest creativity, professional culinary techniques, and sophisticated plating." 
    : "Create a delicious, accessible recipe.";
  
  const excludedPrompt = excludedIngredients.length > 0 && excludedIngredients[0] !== ''
    ? `CRITICAL RESTRICTION: Do NOT use any of these ingredients: ${excludedIngredients.join(', ')}.`
    : '';
  
  const prompt = `Task: Create a professional ${cuisine} recipe using these ingredients: ${ingredients.join(', ')}.
  ${excludedPrompt}
  
  CRITICAL COMPATIBILITY CHECK: 
  If the ingredients are fundamentally incompatible with the requested style (e.g., using meat for a birthday cake, or other nonsensical combinations), set "isValid" to false and provide a professional explanation in the "incompatibilityMessage" field.
  
  If valid:
  - ${methodPrompt}
  - ${timePrompt}
  - ${servingsPrompt}
  - ${fineDiningPrompt}
  - Assign a difficulty score from 1 to 10.
  - For EACH step, provide a highly descriptive "imagePrompt" in English for what a close-up visual illustration of that specific step would look like.
  - ${langPrompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          incompatibilityMessage: { type: Type.STRING },
          recipe: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              difficulty: { type: Type.NUMBER },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  },
                  required: ["item", "amount"]
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING, description: "Description for an image of this cooking step (in English)." }
                  },
                  required: ["text", "imagePrompt"]
                }
              },
              previewPrompt: { type: Type.STRING }
            },
            required: ["title", "description", "difficulty", "ingredients", "steps", "previewPrompt"]
          }
        },
        required: ["isValid"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, style: 'main' | 'step'): Promise<string> => {
  const refinedPrompt = style === 'main' 
    ? `Professional food photography, ${prompt}, high-end restaurant presentation, soft lighting.`
    : `Close-up macro culinary shot, ${prompt}, realistic textures, vibrant natural colors, professional kitchen lighting.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: refinedPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};

export const critiqueFinishedDish = async (recipe: Recipe, userPhotoBase64: string, language: Language): Promise<Recipe['aiReview']> => {
  const langPrompt = language === 'zh' ? 'Respond in Traditional Chinese.' : 'Respond in English.';
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: userPhotoBase64.split(',')[1], mimeType: 'image/jpeg' } },
        { text: `Critique this dish based on recipe: ${recipe.title}. Rate 1-10. ${langPrompt}` }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          comment: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["score", "comment", "suggestions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
