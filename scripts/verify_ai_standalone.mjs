
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Load Env
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log("✅ Loaded .env.local");
    }
} catch (e) {
    console.warn("⚠️ Could not load .env.local:", e.message);
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// 2. Define Service (Copied/Adapted from src/lib/ai.ts for standalone test)
class AuditAgentService {
    constructor() {
        this.visionModel = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
        });
    }

    static generateIntegrityHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }

    parseAuditTags(text) {
        const tags = [];
        const summaryMatch = text.match(/<audit_summary>([\s\S]*?)<\/audit_summary>/);
        if (summaryMatch) {
            const rawContent = summaryMatch[1].trim();
            const parts = rawContent.split(':');
            if (parts.length > 1) {
                const type = parts[0].trim().toUpperCase();
                const validTypes = ['RISK', 'AML', 'ENTRY', 'MEMO'];
                const safeType = validTypes.includes(type) ? type : 'MEMO';
                tags.push({ type: safeType, content: rawContent.substring(type.length + 1).trim() });
            } else {
                tags.push({ type: 'MEMO', content: rawContent });
            }
        }
        const journalMatch = text.match(/<journal_json>([\s\S]*?)<\/journal_json>/);
        if (journalMatch) {
            tags.push({ type: 'JOURNAL', content: journalMatch[1].trim() });
        }
        return tags;
    }

    async analyzeDocument(fileBuffer, mimeType) {
        // --- JUNIOR AUDITOR PROMPT (EXACT COPY FROM SOURCE) ---
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
        // ------------------------------------------------------

        console.log("📤 Sending request to Gemini 2.5 Flash...");
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

        return {
            text,
            integrity_hash: hash,
            parsed_tags: tags
        };
    }
}

// 3. Run Test
async function run() {
    console.log("🚀 Starting Standalone Verification...");
    const agent = new AuditAgentService();

    // Mock Invoice
    const mockInvoiceText = `
        FAKTURA #2024-001
        Säljare: Stockholm Konsult AB
        Org.nr: 556000-1234
        Moms: SE556000123401
        
        Datum: 2024-02-04
        
        Beskrivning:
        1. IT-Konsultation (40h) ... 40 000 SEK
        
        Totalt exkl moms: 40 000 SEK
        Moms (25%): 10 000 SEK
        ATT BETALA: 50 000 SEK
    `;
    const buffer = Buffer.from(mockInvoiceText);

    try {
        const result = await agent.analyzeDocument(buffer, 'text/plain');

        console.log("\n--- 🤖 AI RESPONSE ---");
        console.log(result.text);
        console.log("----------------------\n");
        console.log("✅ Parsed Tags:", JSON.stringify(result.parsed_tags, null, 2));

        // Check specifics
        const jsonTag = result.parsed_tags.find(t => t.type === 'JOURNAL');
        if (jsonTag) {
            console.log("\n💰 Journal Entry Found:");
            console.log(jsonTag.content);
        } else {
            console.log("❌ No Journal Entry Generated");
        }

    } catch (e) {
        console.error("❌ Test Failed:", e);
    }
}

run();
