
import { auditAgent } from '../src/lib/ai';
import * as fs from 'fs';
import * as path from 'path';

async function runTest() {
    console.log("🚀 Starting Junior Auditor Verification...");

    if (!auditAgent) {
        console.error("❌ AI Agent not initialized (Check GEMINI_API_KEY)");
        process.exit(1);
    }

    try {
        // Mock a "buffer" - normally this would be an image/pdf. 
        // We'll trust the AI to hallucinate based on the prompt if the image is noise, 
        // OR we can try to feed it a text file as a buffer if the model supports it.
        // Better: Let's use a simple text buffer that describes an invoice, 
        // forcing the AI to 'read' the text content from the buffer.

        const mockInvoiceText = `
            INVOICE #9921
            Seller: Best IT Consulting AB
            Org.nr: 556012-3456
            VAT No: SE556012345601
            
            Date: 2024-02-04
            
            Item:
            1. Cloud Server Setup ... 10,000 SEK
            2. Support ............. 5,000 SEK
            
            Subtotal: 15,000 SEK
            VAT (25%): 3,750 SEK
            TOTAL: 18,750 SEK
        `;

        const mockBuffer = Buffer.from(mockInvoiceText);

        console.log("📤 Sending mock invoice data to Audit AI...");
        const result = await auditAgent.analyzeDocument(mockBuffer, 'text/plain'); // Using text/plain to see if vision model handles text buffer fallback or if we need to trick it. 
        // Note: Gemini Vision expects images/pdfs usually. If this fails, we might need a real image.
        // Let's try 'application/pdf' mime type even if it's text, it might try to read bytes.
        // ACTUALLY: The safest for a quick test without an image is to ask the text model directly OR just trust the prompt. 
        // But let's try calling the actual function.

        console.log("\n--- 🤖 AI RESPONSE (Junior Auditor) ---");
        console.log(result.text);
        console.log("---------------------------------------\n");

        console.log("✅ Parsed Tags:", JSON.stringify(result.parsed_tags, null, 2));

        // Validation Checks
        const hasSummary = result.parsed_tags.some(t => ['RISK', 'AML', 'ENTRY', 'MEMO'].includes(t.type));
        const hasJournal = result.parsed_tags.some(t => t.type === 'JOURNAL');

        if (hasSummary && hasJournal) {
            console.log("\n✨ VERIFICATION PASSED: smart AI detected.");
        } else {
            console.error("\n⚠️ VERIFICATION WARNING: Missing expected tags.");
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    }
}

runTest();
