'use server'

import { SIEParser } from "@/lib/sie-parser";
import { logAuditTrail } from "@/lib/supabase-server";

export async function processSIEUploadAction(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) throw new Error("No SIE file provided");

        // SIE files are traditionally CP437 or ISO-8859-1.
        // For a robust implementation, we'd use iconv-lite. 
        // Here we assume standard UTF-8 for the prototype or handled via FileReader.
        const text = await file.text();
        const parsedData = SIEParser.parse(text);

        await logAuditTrail({
            event_type: 'SIE_FILE_IMPORTED',
            metadata: {
                fnamm: parsedData.fnamm,
                orgNr: parsedData.orgNr,
                vouchers_count: parsedData.vouchers.length
            }
        });

        return { success: true, data: parsedData };
    } catch (error: any) {
        console.error("SIE Upload Error:", error);
        return { success: false, error: error.message };
    }
}
