import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

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
        return crypto
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
     * Programmatic Benford's Law Anomaly Detection (Skill)
     * Calculates the probability of digit distribution to detect potential fraud.
     */
    static checkBenfordLaw(numbers: number[]): { isSuspicious: boolean, score: number, distribution: Record<number, number> } {
        if (numbers.length < 10) return { isSuspicious: false, score: 0, distribution: {} };

        const leadingDigits = numbers.map(n => parseInt(Math.abs(n).toString()[0])).filter(d => d > 0);
        const counts: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) counts[i] = 0;
        leadingDigits.forEach(d => counts[d]++);

        const total = leadingDigits.length;
        const observed = Object.values(counts).map(c => c / total);
        const expected = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];

        // Simple Mean Absolute Deviation (MAD) for detection
        let mad = 0;
        observed.forEach((obs, i) => mad += Math.abs(obs - expected[i]));
        mad = mad / 9;

        return {
            isSuspicious: mad > 0.015, // Threshold for potential anomaly
            score: mad,
            distribution: counts
        };
    }

    /**
     * Multimodal Document Analysis (OCR + Senior Audit)
     * Upgraded to 'Senior Auditor' capability with ISA 240 skepticism and Ledger Cross-Referencing.
     * Materiality Threshold: Contextual threshold for risk significance.
     */
    async analyzeDocument(fileBuffer: Buffer, mimeType: string, ledgerContext?: string, materialityThreshold: number = 50000) {
        // Senior Auditor "Skeptical" Prompt
        const prompt = `You are a Senior Digital Auditor with 10+ years of experience in ISA (International Standards on Auditing) and Swedish K3 GAAP.
        Perform a high-stakes audit scan of this document. Adopt a 'Professional Skepticism' mindset (ISA 240).
        
        MATERIALITY LEVEL: ${materialityThreshold} SEK. 
        Findings above this amount are considered material [MATERIAL] and must be prioritized.

        ${ledgerContext ? `
        LEDGER CROSS-REFERENCE (CRITICAL):
        The following segment from the Swedish General Ledger (SIE4) is provided for matching:
        ---
        ${ledgerContext}
        ---
        TASK: Compare the document data with the ledger. 
        1. Does an entry with the same Amount/Vendor already exist? 
        2. If yes, flag as [ENTRY: MATCH FOUND] and reference the voucher (#VER).
        3. If the amounts differ, flag as [RISK: LEDGER MISMATCH].
        ` : ''}

        CORE CONTROL OBJECTIVES:
        1.  **Fraud Detection (ISA 240)**: 
            - Look for 'Management Override' risks: Perfectly round numbers (e.g., 50,000.00), unusual fonts, or missing vendor data.
            - Apply **Benford's Law logic**: Are the leading digits of amounts in this document (and related items) distributed naturally?
        2.  **Compliance Verification (ISA 315)**:
            - Validate Org.nr (Swedish format: XXXXXX-XXXX) and VAT numbers.
            - Check if the VAT rates (25%, 12%, 6%) are mathematically consistent with the Total.
        3.  **Accounting Classification (BAS 2024)**:
            - Map line items to 4-digit BAS accounts. Use 2440 for Accounts Payable.
            - Balance the entry (Total Credit must equal Total Debit).
        
        OUTPUT FORMATTING:
        - Wrap executive finding in: <audit_summary>[TYPE]: [ISA Reference/Match Index] - [Observation]</audit_summary>
        - If finding is above ${materialityThreshold}, append [MATERIAL] to the summary.
        - TYPES: [RISK], [AML], [ENTRY], [MEMO].
        - Wrap journal in: <journal_json>{ "entries": [...] }</journal_json>
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
        const tags = this.parseAuditTags(text, materialityThreshold);

        // Logic check: Try to extract numbers from text for programmatic Benford check
        const amounts = text.match(/\b\d+[,.]\d{2}\b/g)?.map((s: string) => parseFloat(s.replace(',', '.'))) || [];
        const benfordResult = AuditAgentService.checkBenfordLaw(amounts);

        if (benfordResult.isSuspicious) {
            console.warn(`[AUDIT-AGENT] Benford Anomaly Detected: score ${benfordResult.score}`);
            tags.push({
                type: 'RISK',
                content: `ISA 240 Warning: Digit distribution anomaly detected (${(benfordResult.score * 100).toFixed(2)}% deviation). Potential manual manipulation of amounts.`
            });
        }

        console.log(`[AUDIT-AGENT] Senior Analysis Complete. Type: ${tags.find(t => t.type !== 'JOURNAL')?.type || 'N/A'}`);

        return {
            text,
            integrity_hash: hash,
            parsed_tags: tags
        };
    }

    private parseAuditTags(text: string, materialityThreshold: number = 50000) {
        const tags: { type: string, content: string, isMaterial?: boolean }[] = [];

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
                let content = rawContent.substring(type.length + 1).trim();

                // Materiality logic: check for [MATERIAL] flag in AI output or high amounts
                let isMaterial = content.includes('[MATERIAL]');
                const amountMatch = content.match(/\b\d+[,.]\d{2,}\b/);
                if (amountMatch) {
                    const amount = parseFloat(amountMatch[0].replace(',', '.'));
                    if (amount >= materialityThreshold) isMaterial = true;
                }

                tags.push({ type: safeType, content, isMaterial });
            } else {
                tags.push({ type: 'MEMO', content: rawContent, isMaterial: false });
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
