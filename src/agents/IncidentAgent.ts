import { Incident, IncidentCategory, IncidentPriority, IncidentReportEntry } from "../domain/incident";
import { globalEventBus } from "../events/EventBus";

export interface TriageInput {
  batchNumber: string;
  title: string;
  description: string;
  productId?: string;
  reportedBy?: string;
}

/**
 * DETERMINISTIC RULE-BASED TRIAGE AGENT: IncidentAgent
 * 
 * Evaluates consumer feedback and retail quality reports against configured
 * safety thresholds. Provides neutral phrasing (no definitive claims of product causation),
 * automatic provisional holds for severe reports, and deduplication for repeated batch complaints.
 */
export class IncidentAgent {
  readonly agentName = "IncidentAgent-v2 (Rule-Based Triage)";

  /**
   * Categorizes complaint text into a domain safety category.
   */
  classifyCategory(title: string, description: string): IncidentCategory {
    const text = `${title} ${description}`.toLowerCase();

    // 1. Critical Health & Allergen Reactions
    const allergenKeywords = [
      "allergy", "allergic", "anaphylaxis", "hives", "swelling",
      "hospital", "rash", "reaction", "choking", "breath"
    ];
    if (allergenKeywords.some(kw => text.includes(kw))) {
      return "ALLERGEN_ADVERSE_REACTION";
    }

    // 2. Foreign Material Contamination
    const foreignMaterialKeywords = [
      "glass", "metal", "plastic", "foreign object", "insect",
      "contaminant", "wire", "shard", "mold", "mould", "spoilage"
    ];
    if (foreignMaterialKeywords.some(kw => text.includes(kw))) {
      return "FOREIGN_MATERIAL";
    }

    // 3. Packaging & Statutory Label Mismatch
    const packagingKeywords = [
      "label", "warning", "red 40", "missing allergen", "seal",
      "expiry", "misprint", "packaging mismatch", "barcode"
    ];
    if (packagingKeywords.some(kw => text.includes(kw))) {
      return "PACKAGING_LABEL_MISMATCH";
    }

    // 4. Batch Quality & Sensory Anomalies
    const qualityKeywords = [
      "taste", "smell", "odor", "texture", "color", "clumping",
      "viscosity", "separated", "leak", "damaged"
    ];
    if (qualityKeywords.some(kw => text.includes(kw))) {
      return "BATCH_QUALITY_ANOMALY";
    }

    return "GENERAL_INQUIRY";
  }

  /**
   * Triages incoming report with idempotency check against existing open incidents.
   */
  triage(input: TriageInput, existingIncidents: Incident[] = []): Incident {
    const normalizedBatch = input.batchNumber.trim().toUpperCase();
    const category = this.classifyCategory(input.title, input.description);
    const reporter = input.reportedBy?.trim() || "Customer Care Portal";

    // 1. DEDUPLICATION & IDEMPOTENCY CHECK
    // Find open, matching incident for same batch & category
    const matchingIncident = existingIncidents.find(
      inc => inc.batchNumber.toUpperCase() === normalizedBatch &&
             inc.category === category &&
             inc.status !== "RESOLVED"
    );

    if (matchingIncident) {
      // Update occurrence count and preserve report history
      const reportEntry: IncidentReportEntry = {
        reportId: `REP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString(),
        description: input.description,
        reportedBy: reporter
      };

      const updatedIncident: Incident = {
        ...matchingIncident,
        occurrenceCount: (matchingIncident.occurrenceCount || 1) + 1,
        reportsHistory: [...(matchingIncident.reportsHistory || []), reportEntry],
        updatedAt: new Date().toISOString()
      };

      // If recurrent complaints accumulate (>= 3) on an anomaly, escalate priority to HIGH
      if (updatedIncident.occurrenceCount >= 3 && updatedIncident.priority === "MEDIUM") {
        updatedIncident.priority = "HIGH";
        updatedIncident.autoAction = "ESCALATED_REPEATED_COMPLAINTS";
        if (!updatedIncident.reasoning.some(r => r.includes("Repeated complaint threshold reached"))) {
          updatedIncident.reasoning.push(
            `Repeated complaint threshold reached (${updatedIncident.occurrenceCount} reports for batch ${normalizedBatch}). Escalated to HIGH.`
          );
        }
      }

      globalEventBus.publish("INCIDENT_RECURRENCE_RECORDED", {
        incidentId: updatedIncident.id,
        batchNumber: normalizedBatch,
        category,
        totalOccurrences: updatedIncident.occurrenceCount
      });

      return updatedIncident;
    }

    // 2. NEW INCIDENT CREATION
    let priority: IncidentPriority = "LOW";
    let status: Incident["status"] = "OPEN";
    let autoAction = "LOGGED_FOR_AUDIT";
    const reasoning: string[] = [];

    switch (category) {
      case "ALLERGEN_ADVERSE_REACTION":
        priority = "CRITICAL";
        status = "PROVISIONAL_HOLD";
        autoAction = "PROVISIONAL_BATCH_HOLD";
        reasoning.push("Consumer reported an adverse reaction — urgent safety review required.");
        reasoning.push("Placed batch under provisional hold pending QA health risk assessment (no definitive causation established).");
        reasoning.push(`Immediate notification dispatched to Quality Director for batch ${normalizedBatch}.`);
        break;

      case "FOREIGN_MATERIAL":
        priority = "CRITICAL";
        status = "PROVISIONAL_HOLD";
        autoAction = "PROVISIONAL_BATCH_HOLD";
        reasoning.push("Potential foreign matter contamination reported by consumer.");
        reasoning.push("Placed batch on provisional hold to prevent distribution during investigation.");
        break;

      case "PACKAGING_LABEL_MISMATCH":
        priority = "HIGH";
        status = "INVESTIGATING";
        autoAction = "FLAG_FOR_PACKAGING_QA_INSPECTION";
        reasoning.push("Suspected packaging or statutory warning label discrepancy identified.");
        reasoning.push("Escalated to HIGH priority for regulatory label audit before secondary dispatch.");
        break;

      case "BATCH_QUALITY_ANOMALY":
        priority = "MEDIUM";
        status = "INVESTIGATING";
        autoAction = "ROUTE_TO_BATCH_QA";
        reasoning.push("Physical, sensory, or packaging defect feedback detected.");
        reasoning.push("Assigned MEDIUM priority for retention sample testing.");
        break;

      default:
        priority = "LOW";
        status = "OPEN";
        autoAction = "LOGGED_FOR_AUDIT";
        reasoning.push("Standard consumer feedback recorded for routine quality metric aggregation.");
        break;
    }

    // Reliable unique ID generation
    const uniqueSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const incidentId = `INC-${Date.now()}-${uniqueSuffix}`;

    const reportEntry: IncidentReportEntry = {
      reportId: `REP-${Date.now()}-1`,
      timestamp: new Date().toISOString(),
      description: input.description,
      reportedBy: reporter
    };

    const newIncident: Incident = {
      id: incidentId,
      productId: input.productId,
      batchNumber: normalizedBatch,
      category,
      title: input.title,
      description: input.description,
      reportedBy: reporter,
      priority,
      status,
      autoAction,
      reasoning,
      occurrenceCount: 1,
      reportsHistory: [reportEntry],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. BROADCAST OBSERVER EVENTS
    globalEventBus.publish("INCIDENT_TRIAGED", newIncident);

    if (status === "PROVISIONAL_HOLD") {
      globalEventBus.publish("BATCH_HOLD_APPLIED", {
        batchNumber: normalizedBatch,
        productId: input.productId,
        incidentId: newIncident.id,
        reason: reasoning[0]
      });
    }

    return newIncident;
  }
}

export const incidentAgent = new IncidentAgent();
