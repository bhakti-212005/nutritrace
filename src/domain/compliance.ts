export type RegulatoryRegion = "US_FDA" | "EU_EFSA" | "IN_FSSAI";
export type ComplianceStatus = "COMPLIANT" | "WARNING" | "NON_COMPLIANT" | "NEEDS_REVIEW";

export type FindingClassification =
  | "CONFIGURED_VIOLATION"
  | "STATUTORY_WARNING"
  | "RESTRICTION_LIMIT"
  | "MISSING_INFORMATION"
  | "NEEDS_HUMAN_REVIEW";

export interface ComplianceViolation {
  ruleId: string;
  substance: string;
  classification: FindingClassification;
  severity: "CRITICAL" | "WARNING" | "MODERATE" | "INFO";
  status: "BANNED" | "WARNING_REQUIRED" | "RESTRICTED" | "NEEDS_REVIEW";
  message: string;
  jurisdiction: string;
  sourceRef: string;
  isDemoRule: boolean;
  requiresHumanReview: boolean;
  recommendedAction?: string;
  suggestedSubstitute?: string;
}

export interface RegionalAuditReport {
  region: RegulatoryRegion;
  regionName: string;
  status: ComplianceStatus;
  score: number;
  scoringRationale: string;
  violations: ComplianceViolation[];
}

export interface ProductComplianceResult {
  averageScore: number;
  isGloballyCompliant: boolean;
  requiresHumanReview: boolean;
  reports: Record<RegulatoryRegion, RegionalAuditReport>;
}
