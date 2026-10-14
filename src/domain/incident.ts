export type IncidentPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type IncidentStatus = "OPEN" | "INVESTIGATING" | "QUARANTINED" | "RESOLVED";

export interface Incident {
  id: string;
  productId?: string;
  batchNumber: string;
  title: string;
  description: string;
  reportedBy: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  autoAction: string;
  reasoning: string[];
  createdAt: string;
}
