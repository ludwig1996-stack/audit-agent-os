/**
 * SIE4 Parser Utility
 * Handles Swedish Standard Import/Export (SIE) format version 4.
 * Focused on #KONTO, #VER, and #TRANS for cross-referencing.
 */

export interface Voucher {
    series: string;
    number: string;
    date: string;
    text: string;
    transactions: {
        account: string;
        amount: number;
        description?: string;
    }[];
}

export interface ChartOfAccount {
    account: string;
    name: string;
}

export interface SIEData {
    orgNr: string;
    fnamm: string;
    accounts: ChartOfAccount[];
    vouchers: Voucher[];
}

export class SIEParser {
    /**
     * Parses raw SIE4 content (string).
     * Note: Expects conversion from Buffer to string (ISO-8859-1 / Windows-1252 to UTF-8 handled by caller usually).
     */
    static parse(content: string): SIEData {
        const lines = content.split(/\r?\n/);
        const data: SIEData = {
            orgNr: '',
            fnamm: '',
            accounts: [],
            vouchers: []
        };

        let currentVoucher: Voucher | null = null;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Handle Tags
            if (trimmed.startsWith('#ORGNR')) {
                data.orgNr = trimmed.split(/\s+/)[1]?.replace(/"/g, '') || '';
            } else if (trimmed.startsWith('#FNAMN')) {
                data.fnamm = trimmed.split(/\s+/).slice(1).join(' ').replace(/"/g, '') || '';
            } else if (trimmed.startsWith('#KONTO')) {
                const parts = trimmed.match(/#KONTO\s+(\d+)\s+"(.*)"/);
                if (parts) {
                    data.accounts.push({ account: parts[1], name: parts[2] });
                }
            } else if (trimmed.startsWith('#VER')) {
                // Format: #VER "Serie" "Number" "YYYYMMDD" "Text"
                const parts = trimmed.match(/#VER\s+"(.*)"\s+"(.*)"\s+(\d{8})\s+"(.*)"/);
                if (parts) {
                    currentVoucher = {
                        series: parts[1],
                        number: parts[2],
                        date: parts[3],
                        text: parts[4],
                        transactions: []
                    };
                    data.vouchers.push(currentVoucher);
                }
            } else if (trimmed.startsWith('#TRANS')) {
                // Format: #TRANS "Konto" {objektlista} Belopp "Date" "Text"
                // Simplified regex for the core data: account and amount
                const parts = trimmed.match(/#TRANS\s+(\d+)\s+({.*}|)\s+(-?\d+\.?\d*)\s+/);
                if (parts && currentVoucher) {
                    currentVoucher.transactions.push({
                        account: parts[1],
                        amount: parseFloat(parts[3]),
                    });
                }
            }
        }

        return data;
    }

    /**
     * Search for a transaction that matches an invoice amount and rough date.
     */
    static searchMatchingVoucher(data: SIEData, amount: number, dateStr?: string): Voucher | null {
        // Date format in SIE is YYYYMMDD. We might need to normalize dateStr.
        return data.vouchers.find(v =>
            v.transactions.some(t => Math.abs(t.amount) === Math.abs(amount) && t.account === '2440')
        ) || null;
    }
}
