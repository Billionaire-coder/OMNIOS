
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIResponse {
    content: string;
    usage?: {
        inputTokens: number;
        outputTokens: number;
    };
    provider: 'openai' | 'anthropic' | 'mock';
}

export class AIGateway {
    private static instance: AIGateway;
    private openai?: OpenAI;
    private anthropic?: Anthropic;

    private constructor() {
        if (process.env.OPENAI_API_KEY) {
            this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        if (process.env.ANTHROPIC_API_KEY) {
            this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        }

        if (!this.openai && !this.anthropic) {
            console.warn('[AIGateway] No API keys found. AI features will run in MOCK mode.');
        }
    }

    public static getInstance(): AIGateway {
        if (!AIGateway.instance) {
            AIGateway.instance = new AIGateway();
        }
        return AIGateway.instance;
    }

    /**
     * Generates text response using the best available provider.
     * defaults to OpenAI if both available.
     */
    async generateText(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        if (this.openai) {
            return this.callOpenAI(prompt, systemPrompt);
        } else if (this.anthropic) {
            return this.callAnthropic(prompt, systemPrompt);
        } else {
            return this.mockResponse(prompt);
        }
    }

    /**
     * Generates a JSON object guaranteed to match the structure if possible.
     */
    async generateJSON(prompt: string, systemPrompt?: string): Promise<{ data: any; raw: AIResponse }> {
        const jsonSystemPrompt = `${systemPrompt || 'You are a JSON generator.'}\n\nIMPORTANT: Return ONLY valid JSON. No markdown formatting.`;

        const res = await this.generateText(prompt, jsonSystemPrompt);

        try {
            // Strip markdown code blocks if present
            let clean = res.content.trim();
            if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '').replace(/```$/, '');
            if (clean.startsWith('```')) clean = clean.replace(/^```/, '').replace(/```$/, '');

            return { data: JSON.parse(clean), raw: res };
        } catch (e) {
            console.error("[AIGateway] JSON Parse Error", res.content);
            throw new Error("AI failed to generate valid JSON");
        }
    }

    private async callOpenAI(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        try {
            const completion = await this.openai!.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
                    { role: 'user', content: prompt }
                ],
                model: 'gpt-4o', // Default to latest Omni
                temperature: 0.7,
            });

            return {
                content: completion.choices[0].message.content || '',
                usage: {
                    inputTokens: completion.usage?.prompt_tokens || 0,
                    outputTokens: completion.usage?.completion_tokens || 0
                },
                provider: 'openai'
            };
        } catch (e) {
            console.error("OpenAI Call Failed", e);
            throw e;
        }
    }

    private async callAnthropic(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        try {
            const msg = await this.anthropic!.messages.create({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 4096,
                system: systemPrompt,
                messages: [
                    { role: "user", content: prompt }
                ]
            });

            // Anthropic content is Block[], usually text block 0
            const textContent = (msg.content[0] as any).text || ''; // Simple cast

            return {
                content: textContent,
                usage: {
                    inputTokens: msg.usage.input_tokens,
                    outputTokens: msg.usage.output_tokens
                },
                provider: 'anthropic'
            };
        } catch (e) {
            console.error("Anthropic Call Failed", e);
            throw e;
        }
    }

    private async mockResponse(prompt: string): Promise<AIResponse> {
        await new Promise(r => setTimeout(r, 1000));
        return {
            content: `[MOCK AI] Processed: ${prompt.substring(0, 50)}...`,
            provider: 'mock'
        };
    }
}

export const aiGateway = AIGateway.getInstance();
