import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class LLMService {
  private client: GoogleGenAI;

  constructor() {
    this.client = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
  }

  async call(prompt: string): Promise<string> {
    if (!prompt || !prompt.trim()) {
      throw new Error('Prompt is empty');
    }

    const result = await this.client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return result.text ?? '';
  }
}
