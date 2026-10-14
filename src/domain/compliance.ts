export type RegulatoryRegion = "US_FDA" | "EU_EFSA" | "IN_FSSAI";
export type ComplianceStatus = "COMPLIANT" | "WARNING" | "NON_COMPLIANT";

export interface ComplianceViolation {
  substance: string;
  severity: "CRITICAL" | "WARNING" | "MODERATE";
  status: "BANNED" | "WARNING_REQUIRED" | "RESTRICTED";
  message: string;
}

export interface RegionalAuditReport {
  region: RegulatoryRegion;
  regionName: string;
  status: ComplianceStatus;
  score: number;
  violations: ComplianceViolation[];
}

export interface ProductComplianceResult {
  averageScore: number;
  isGloballyCompliant: boolean;
  reports: Record<RegulatoryRegion, RegionalAuditReport>;
}
