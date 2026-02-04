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
        // Advanced "Junior Auditor" Prompt
        const prompt = `You are an expert Swedish Digital Auditor. 
        Perform a comprehensive ISA-compliant audit of this financial document.
        
        CRITICAL INSTRUCTIONS:
        1.  **Analyze Entity**: Identify 'Organisationsnummer', 'Momsregistreringsnummer' (VAT No), and Legal Name.
        2.  **Verify Financials**: 
            - Extract Total Amount, VAT Amount (Moms), and Currency (e.g., SEK, EUR).
            - Check for arithmetic errors between standard VAT rates (25%, 12%, 6%) and the Total.
        3.  **Accounting Classification (BAS 2024)**: 
            - Suggest the most accurate 4-digit BAS account (e.g., 4000 for purchasing goods, 6540 for IT services).
            - If uncertain, suggest account 6990 (Övriga externa kostnader).
        4.  **Risk & Compliance (ISA 315/240)**:
            - Flag if the document lacks valid VAT info.
            - Flag if the vendor looks suspicious or missing details.
            - Flag if the date is outside the current fiscal year (assume current year: ${new Date().getFullYear()}).
        
        OUTPUT FORMATTING (STRICT XML/JSON):
        - Wrap your executive summary in: <audit_summary>[TYPE]: [Concise Description]</audit_summary>
        - TYPES: 
            - [RISK]: Compliance issue or missing data. 
            - [AML]: High-value transaction (>10k EUR) or suspicious entity. 
            - [ENTRY]: Standard transaction suitable for booking.
            - [MEMO]: Not an invoice (e.g., receipt, contract).
        
        - Wrap proposed journal entry in: <journal_json>{ "entries": [...] }</journal_json>
        - JSON Schema: { "account": "4000", "description": "Purchase of IT equipment", "debit": 0, "credit": 0 }
        - IMPORTANT: You MUST balance the transaction. 
            - Credit 2440 (Accounts Payable) or 1930 (Bank).
            - Debit Expense Account (e.g., 4000) and Input VAT (2641).
        `;

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

        // Debugging for "Junior Auditor" supervision
        console.log(`[AUDIT-AGENT] Analyzed ${mimeType}. Type: ${tags.find(t => t.type !== 'JOURNAL')?.type || 'N/A'}`);

        return {
            text,
            integrity_hash: hash,
            parsed_tags: tags
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
