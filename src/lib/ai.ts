import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey && process.env.NODE_ENV !== 'production') {
    console.warn('Missing GEMINI_API_KEY! AI features will be disabled.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Audit Agent Reasoning Engine (Digital Auditor)
 * Specialized in BAS-kontoplanen & ISA Compliance.
 */
export class AuditAgentService {
    private model: any;
    private visionModel: any;

    constructor() {
        if (!genAI) throw new Error('AI Engine not initialized');

        // Main reasoning model
        this.model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
        });

        // Vision/OCR model
        this.visionModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
        });
    }

    /**
     * Generate a unique SHA-256 hash for data integrity
     */
    static generateIntegrityHash(content: string): string {
        return require('crypto')
            .createHash('sha256')
            .update(content)
            .digest('hex');
    }

    async analyzeAuditTask(prompt: string, context: string) {
        const systemInstruction = `You are a 'Senior Digital Auditor' specialized in Swedish 'BAS-kontoplanen' and International Standards on Auditing (ISA).
        
        RULES:
        1. Always output findings using structured tags: [RISK: description], [AML: description], [MEMO: notes].
        2. Ensure all analysis aligns with ISA 230, 240, and 315.
        3. Use Google Search Grounding to verify external vendors and latest tax laws when necessary.
        4. Focus on Swedish accounting standards.`;

        const result = await this.model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `System Instruction: ${systemInstruction}\n\nContext: ${context}\n\nTask: ${prompt}` }]
            }],
            tools: [{ googleSearchRetrieval: {} } as any],
            generationConfig: {
                temperature: 0.1,
                topP: 0.8,
                topK: 40,
            }
        });

        const text = result.response.text();
        const hash = AuditAgentService.generateIntegrityHash(text);

        return {
            text,
            integrity_hash: hash,
            parsed_tags: this.parseAuditTags(text)
        };
    }

    /**
     * Multimodal Document Analysis (OCR + Audit)
     */
    async analyzeDocument(fileBuffer: Buffer, mimeType: string) {
        const prompt = `Perform a high-precision audit scan of this document. 
        Focus on:
        1. Identifying the entity and org.nr.
        2. Detecting transaction amounts and dates.
        3. Mapping to Swedish 'BAS-kontoplanen' (e.g., 1930, 3001, 2641).
        4. Highlighting any ISA-315 compliance risks.
        
        Rules: Output MUST include at least one tag: [RISK:...], [AML:...], [ENTRY:...], or [MEMO:...].`;

        const result = await this.visionModel.generateContent([
            prompt,
            {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType
                }
            }
        ]);

        const text = result.response.text();
        const hash = AuditAgentService.generateIntegrityHash(text);

        return {
            text,
            integrity_hash: hash,
            parsed_tags: this.parseAuditTags(text)
        };
    }

    private parseAuditTags(text: string) {
        const tags: { type: string, content: string }[] = [];
        const regex = /\[(RISK|AML|ENTRY|MEMO): (.*?)\]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            tags.push({ type: match[1], content: match[2] });
        }
        return tags;
    }
}

export const auditAgent = genAI ? new AuditAgentService() : null;
