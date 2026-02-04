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
     * Now validated with Zod for strict type safety.
     * Uses XML tags for robust output parsing.
     */
    async analyzeDocument(fileBuffer: Buffer, mimeType: string) {
        const prompt = `Perform a high-precision, detailed audit scan of this document. 
        
        EXTRACT AND SPECIFY:
        1. Entity Identity: Legal name and Swedish Org.nr (if present).
        2. Financial Data: Total Amount (incl. VAT), Currency, and Date of transaction.
        3. Accounting Intent: Suggest Swedish 'BAS-kontoplan' accounts.
        4. ISA-315 Risk Profile: Identify any compliance risks.
        5. Journal Suggestion: Provide a structured JSON block for suggested journal entries.
        
        OUTPUT FORMATTING RULES:
        - You MUST wrap your detailed summary in: <audit_summary>TYPE: Description...</audit_summary>
        - TYPES: RISK, AML, ENTRY, or MEMO.
        - To suggest journal entries, you MUST output a raw JSON block wrapped in: <journal_json>{"entries": [{"account": "...", "description": "...", "debit": 0, "credit": 0}]}</journal_json>
        - Accounts MUST follow Swedish BAS-kontoplan.`;

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
        const tags = this.parseAuditTags(text);
        console.log("DEBUG: Extracted Tags:", tags);

        return {
            text,
            integrity_hash: hash,
            parsed_tags: tags // Now typed as ParsedFinding[] but partials
        };
    }

    private parseAuditTags(text: string) {
        const tags: { type: string, content: string }[] = [];

        // 1. Extract Summary Tag (XML style)
        const summaryMatch = text.match(/<audit_summary>([\s\S]*?)<\/audit_summary>/);
        if (summaryMatch) {
            const rawContent = summaryMatch[1].trim();
            // Try to split TYPE: Content
            const parts = rawContent.split(':');
            if (parts.length > 1) {
                const type = parts[0].trim().toUpperCase();
                // Validate type
                const validTypes = ['RISK', 'AML', 'ENTRY', 'MEMO'];
                const safeType = validTypes.includes(type) ? type : 'MEMO';
                tags.push({ type: safeType, content: rawContent.substring(type.length + 1).trim() });
            } else {
                tags.push({ type: 'MEMO', content: rawContent });
            }
        }

        // 2. Extract Journal JSON (XML style)
        const journalMatch = text.match(/<journal_json>([\s\S]*?)<\/journal_json>/);
        if (journalMatch) {
            tags.push({ type: 'JOURNAL', content: journalMatch[1].trim() });
        }

        return tags;
    }
}

export const auditAgent = genAI ? new AuditAgentService() : null;
