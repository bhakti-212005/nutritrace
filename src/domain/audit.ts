export type AuditEventType =
  | "PRODUCT_CREATED"
  | "PRODUCT_UPDATED"
  | "COMPLIANCE_AUDITED"
  | "INCIDENT_LOGGED"
  | "INCIDENT_RECURRENCE_RECORDED"
  | "PROVISIONAL_HOLD_APPLIED"
  | "HOLD_RELEASED"
  | "BATCH_QUARANTINED";

export interface AuditRecord {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  entityType: "PRODUCT" | "BATCH" | "INCIDENT" | "COMPLIANCE";
  entityId: string;
  batchNumber?: string;
  incidentId?: string;
  action: string;
  reason: string;
  actor: string;
  previousStatus?: string;
  newStatus?: string;
  metadata?: Record<string, any>;
}
