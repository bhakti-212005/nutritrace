import { Incident, IncidentStatus, ReviewDecision } from "../domain/incident";
import { ProductStatus } from "../domain/product";
import { repository, LocalStorageRepository } from "../repositories/LocalStorageRepository";
import { incidentAgent, IncidentAgent, TriageInput } from "../agents/IncidentAgent";
import { globalEventBus, EventBus } from "../events/EventBus";

export class IncidentService {
  constructor(
    private repo: LocalStorageRepository = repository,
    private agent: IncidentAgent = incidentAgent,
    private bus: EventBus = globalEventBus
  ) {}

  getAllIncidents(): Incident[] {
    return this.repo.getIncidents();
  }

  logIncident(input: TriageInput): Incident {
    if (!input.title?.trim() || !input.description?.trim()) {
      throw new Error("Validation Error: Incident title and description are required.");
    }
    if (!input.batchNumber?.trim()) {
      throw new Error("Validation Error: Target batch number is required.");
    }

    const existingIncidents = this.getAllIncidents();
    const triaged = this.agent.triage(input, existingIncidents);

    this.repo.saveIncident(triaged);

    // Audit Logging
    const isRecurrence = (triaged.occurrenceCount || 1) > 1;
    this.repo.addAuditRecord({
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      eventType: isRecurrence ? "INCIDENT_RECURRENCE_RECORDED" : "INCIDENT_LOGGED",
      entityType: "INCIDENT",
      entityId: triaged.id,
      batchNumber: triaged.batchNumber,
      action: triaged.autoAction,
      reason: isRecurrence 
        ? `Recurrent complaint recorded (Occurrence #${triaged.occurrenceCount}) for batch ${triaged.batchNumber}.`
        : triaged.reasoning[0] || "Quality complaint triaged.",
      actor: this.agent.agentName,
      newStatus: triaged.status
    });

    return triaged;
  }

  releaseBatchHold(batchNumber: string, review: {
    reviewer: string;
    decisionNote: string;
    targetStatus?: ProductStatus;
  }): void {
    if (!review.reviewer?.trim()) {
      throw new Error("Validation Error: Reviewer identity/credentials are required.");
    }
    if (!review.decisionNote?.trim()) {
      throw new Error("Validation Error: Formal review justification note is required to release hold.");
    }

    const normalizedBatch = batchNumber.trim().toUpperCase();
    const allIncidents = this.getAllIncidents();

    // Mark matching active incidents for this batch as RESOLVED with ReviewDecision
    const updatedIncidents = allIncidents.map(inc => {
      if (inc.batchNumber.toUpperCase() === normalizedBatch && inc.status !== "RESOLVED") {
        const decision: ReviewDecision = {
          reviewer: review.reviewer.trim(),
          decisionNote: review.decisionNote.trim(),
          decidedAt: new Date().toISOString(),
          previousStatus: inc.status,
          newStatus: "RESOLVED"
        };
        return {
          ...inc,
          status: "RESOLVED" as IncidentStatus,
          reviewDecision: decision,
          updatedAt: new Date().toISOString()
        };
      }
      return inc;
    });

    this.repo.saveIncidents(updatedIncidents);

    const targetProductStatus: ProductStatus = review.targetStatus || "APPROVED";

    // Publish event to EventBus (ProductService will update product catalog & audit trail)
    this.bus.publish("BATCH_HOLD_RELEASED", {
      batchNumber: normalizedBatch,
      newStatus: targetProductStatus,
      reason: review.decisionNote.trim(),
      reviewer: review.reviewer.trim()
    });
  }
}

export const incidentService = new IncidentService();
