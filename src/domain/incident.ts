export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "PROVISIONAL_HOLD" | "QUARANTINED" | "RESOLVED";

export type IncidentCategory = 
  | "ALLERGEN_ADVERSE_REACTION" 
  | "FOREIGN_MATERIAL" 
  | "PACKAGING_LABEL_MISMATCH" 
  | "BATCH_QUALITY_ANOMALY"
  | "GENERAL_INQUIRY";

export interface IncidentReportEntry {
  reportId: string;
  timestamp: string;
  description: string;
  reportedBy: string;
}

export interface ReviewDecision {
  reviewer: string;
  decisionNote: string;
  decidedAt: string;
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
}

export interface Incident {
  id: string;
  productId?: string;
  batchNumber: string;
  category: IncidentCategory;
  title: string;
  description: string;
  reportedBy: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  autoAction: string;
  reasoning: string[];
  occurrenceCount: number;
  reportsHistory: IncidentReportEntry[];
  reviewDecision?: ReviewDecision;
  createdAt: string;
  updatedAt: string;
}
