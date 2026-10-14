import { RegionalAuditReport } from "../domain/compliance";

/**
 * STRATEGY PATTERN: ComplianceStrategy Interface
 * Decouples category-specific regulatory auditing logic (Food vs Cosmetics).
 */
export interface ComplianceStrategy {
  readonly strategyName: string;
  validate(ingredients: string[]): RegionalAuditReport[];
}
