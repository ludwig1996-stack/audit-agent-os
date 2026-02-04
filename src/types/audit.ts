/**
 * ISA 230: Audit Documentation
 */
export interface AuditDocument {
    id: string;
    projectId: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
    status: 'draft' | 'reviewed' | 'finalized';
    referenceNumber: string; // e.g., "Ref: ISA 230 - A1"
}

/**
 * ISA 240: Fraud Risk Factors
 */
export interface FraudRiskFactor {
    id: string;
    categoryId: string;
    description: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mitigationStrategy?: string;
}

/**
 * ISA 315: Risk Assessment
 */
export interface EntityRisk {
    id: string;
    entityName: string;
    riskArea: string;
    inherentRisk: number; // 1-10
    controlRisk: number; // 1-10
    detectionRisk: number; // calculated
    overallRiskAssessment: 'low' | 'moderate' | 'high';
    lastAssessedAt: string;
}

export interface AuditProject {
    id: string;
    name: string;
    clientName: string;
    fiscalYear: number;
    documents: AuditDocument[];
    risks: EntityRisk[];
    fraudFactors: FraudRiskFactor[];
}
