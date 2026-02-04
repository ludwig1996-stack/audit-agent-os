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

        // Main reasoning model (High-precision advanced model)
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.5-pro',
        });

        // Vision / OCR model (Fast and intelligent multimodal model)
        this.visionModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
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
        const prompt = `Perform a high-precision, detailed audit scan of this document. 
        
        EXTRACT AND SPECIFY:
        1. Entity Identity: Legal name and Swedish Org.nr (if present).
        2. Financial Data: Total Amount (incl. VAT), Currency, and Date of transaction.
        3. Accounting Intent: Suggest Swedish 'BAS-kontoplan' accounts (e.g., 1930 Bank, 2641 Input VAT, 5xxx Expense).
        4. ISA-315 Risk Profile: Identify any compliance risks or irregularities.
        5. Journal Suggestion: Provide a structured JSON block for suggested journal entries.
        
        OUTPUT FORMATTING RULES:
        - You MUST include exactly one summary tag in the format: [TYPE: Summary Description]
        - TYPES: RISK, AML, ENTRY, or MEMO.
        - To suggest journal entries, you MUST include a tag: [JOURNAL: {"entries": [{"account": "...", "description": "...", "debit": 0, "credit": 0}]}]
        - Accounts MUST follow Swedish BAS-kontoplan.
        - The Summary Description should be at least 3-4 sentences long, detailing EVERYTHING you found (Entity, VAT, Amount, Accounts).
        - Example: [RISK: Entity: SkiStar AB (556093-6949). Total: 1,500 SEK. Accounts: 1930/6210. The VAT rate is 12% which matches travel services. However, the org.nr has a warning in local registries.]`;

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
        // Support multiline content inside tags
        const regex = /\[(RISK|AML|ENTRY|MEMO|JOURNAL): ([\s\S]*?)\]/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            tags.push({ type: match[1].trim(), content: match[2].trim() });
        }
        return tags;
    }
}

export const auditAgent = genAI ? new AuditAgentService() : null;
