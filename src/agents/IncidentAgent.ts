import { Incident, IncidentPriority } from "../domain/incident";
import { globalEventBus } from "../events/EventBus";

export interface TriageInput {
  batchNumber: string;
  title: string;
  description: string;
  productId?: string;
  reportedBy?: string;
}

/**
 * AGENTIC AI ENGINE: IncidentAgent
 * Implements an autonomous decision loop to perceive, reason, and act
 * on consumer feedback and batch quality anomalies.
 */
export class IncidentAgent {
  readonly agentName = "IncidentAgent-v2";

  triage(input: TriageInput): Incident {
    const text = (input.description + " " + input.title).toLowerCase();
    const reasoning: string[] = [];
    let priority: IncidentPriority = "LOW";
    let autoAction = "LOGGED_FOR_AUDIT";

    // 1. PERCEIVE & REASON: Critical Health / Allergen Hazards
    const healthHazards = [
      "allergy", "allergic", "anaphylaxis", "hospital", "swelling",
      "vomiting", "rash", "reaction", "choking", "glass", "contamination"
    ];

    // 2. PERCEIVE & REASON: Critical Operational & Payment Failures (Hackathon Requirement)
    const paymentHazards = [
      "repeated payment failures", "payment failure", "billing error", 
      "double charge", "gateway timeout", "checkout failure"
    ];

    const isHealthEmergency = healthHazards.some(h => text.includes(h));
    const isPaymentEmergency = paymentHazards.some(p => text.includes(p));

    // 3. PLAN & ACT
    if (isHealthEmergency) {
      priority = "CRITICAL";
      autoAction = "AUTONOMOUS_BATCH_QUARANTINE";
      reasoning.push("Detected acute health hazard or severe allergen reaction.");
      reasoning.push(`Autonomous action triggered: Quarantine batch ${input.batchNumber}.`);
    } else if (isPaymentEmergency) {
      priority = "HIGH";
      autoAction = "AUTO_ESCALATE_BILLING_ALERT";
      reasoning.push("Detected repeated payment gateway or checkout transaction failure.");
      reasoning.push("Escalated ticket priority to HIGH with finance notification.");
    } else if (text.includes("leak") || text.includes("broken") || text.includes("defect") || text.includes("damaged")) {
      priority = "MEDIUM";
      autoAction = "ROUTE_TO_PACKAGING_QA";
      reasoning.push("Minor packaging defect identified.");
    } else {
      reasoning.push("Standard consumer inquiry processed.");
    }

    const incident: Incident = {
      id: `INC-${Date.now()}`,
      productId: input.productId,
      batchNumber: input.batchNumber,
      title: input.title,
      description: input.description,
      reportedBy: input.reportedBy || "Customer Care / Retail Portal",
      priority,
      status: priority === "CRITICAL" ? "QUARANTINED" : "OPEN",
      autoAction,
      reasoning,
      createdAt: new Date().toISOString()
    };

    // 4. DISPATCH OBSERVER EVENT
    globalEventBus.publish("INCIDENT_TRIAGED", incident);

    if (priority === "CRITICAL") {
      globalEventBus.publish("BATCH_QUARANTINED", {
        batchNumber: input.batchNumber,
        productId: input.productId,
        reason: reasoning.join(" | ")
      });
    }

    return incident;
  }
}

export const incidentAgent = new IncidentAgent();
