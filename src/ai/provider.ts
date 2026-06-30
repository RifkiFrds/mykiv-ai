export interface AIProvider {
  generateResponse(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string>;
}

class MockProvider implements AIProvider {
  async generateResponse(prompt: string): Promise<string> {
    const lower = prompt.toLowerCase();
    if (lower.includes('sleep')) return 'Based on your recent sleep logs, you\'ve averaged 7.2 hours with a quality score of 7.5/10. Try maintaining a consistent bedtime between 10-11 PM.';
    if (lower.includes('water') || lower.includes('hydration')) return 'You\'ve been doing great with hydration! Your average is 2,200ml daily. Consider increasing to 2,500ml on workout days.';
    if (lower.includes('exercise') || lower.includes('workout')) return 'You completed 4 workouts this week. That\'s consistent! Try adding one more cardio session for balanced fitness.';
    if (lower.includes('mood') || lower.includes('feeling')) return 'Your mood has been stable around 7/10 this week. I noticed it improves after exercise - keep that routine!';
    if (lower.includes('meal') || lower.includes('food') || lower.includes('eat')) return 'Your meal patterns look balanced. You\'re averaging 1,850 calories with good protein intake. Consider more vegetables at dinner.';
    if (lower.includes('date') || lower.includes('activity') || lower.includes('couple')) return 'You have 2 planned activities coming up! The cooking class sounds fun. Would you like me to suggest a recipe to practice beforehand?';
    if (lower.includes('expense') || lower.includes('money') || lower.includes('spend')) return 'Your shared expenses this month total $340. Food is your biggest category at 45%. Consider meal prepping to reduce dining out costs.';
    if (lower.includes('medicine') || lower.includes('vitamin') || lower.includes('pill')) return 'You\'ve been consistent with your vitamins! Remember to take Vitamin D with a meal for better absorption.';
    return `I understand you're asking about: "${prompt.slice(0, 100)}..." As your health companion, I can help track your wellness, suggest activities with your partner, and provide insights. What would you like to focus on today?`;
  }
}

class ReplicateProvider implements AIProvider {
  private apiToken: string;
  private model: string;

  constructor(apiToken: string, model = 'google/gemini-2.5-flash-preview') {
    this.apiToken = apiToken;
    this.model = model;
  }

  async generateResponse(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    const response = await fetch('https://api.replicate.com/v1/models/' + this.model + '/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.output?.join?.('') || data.output || '';
  }
}

class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 2048,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
}

export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'mock';
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (provider === 'replicate' && replicateToken) {
    return new ReplicateProvider(replicateToken);
  }
  if (provider === 'gemini' && geminiKey) {
    return new GeminiProvider(geminiKey);
  }
  return new MockProvider();
}
