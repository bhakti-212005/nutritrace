import { describe, it, expect, beforeEach } from "vitest";
import { IncidentAgent } from "../agents/IncidentAgent";
import { globalEventBus } from "../events/EventBus";
import { Incident } from "../domain/incident";

describe("INCIDENT AGENT: Rule-Based Safety Triage & Deduplication", () => {
  let agent: IncidentAgent;

  beforeEach(() => {
    agent = new IncidentAgent();
    globalEventBus.clearHistory();
    globalEventBus.clearListeners();
  });

  it("Auto-triages acute allergen reaction with neutral causation and provisional hold", () => {
    let holdEventFired = false;
    let holdPayload: any = null;

    globalEventBus.subscribe("BATCH_HOLD_APPLIED", (evt) => {
      holdEventFired = true;
      holdPayload = evt.payload;
    });

    const incident = agent.triage({
      batchNumber: "BATCH-2026-904",
      title: "Suspected Undeclared Tree Nut Reaction",
      description: "Consumer reported severe hives and facial swelling after consuming batch."
    });

    expect(incident.priority).toBe("CRITICAL");
    expect(incident.status).toBe("PROVISIONAL_HOLD");
    expect(incident.autoAction).toBe("PROVISIONAL_BATCH_HOLD");
    expect(incident.category).toBe("ALLERGEN_ADVERSE_REACTION");
    expect(incident.occurrenceCount).toBe(1);
    expect(incident.reportsHistory.length).toBe(1);

    // Verify neutral phrasing: no definitive claim of product guilt
    expect(incident.reasoning.some(r => r.includes("Consumer reported an adverse reaction — urgent safety review required"))).toBe(true);
    expect(incident.reasoning.some(r => r.includes("no definitive causation established"))).toBe(true);

    expect(holdEventFired).toBe(true);
    expect(holdPayload.batchNumber).toBe("BATCH-2026-904");
  });

  it("Deduplicates repeated complaints for the same batch without creating duplicate incident", () => {
    const existingIncidents: Incident[] = [];

    // First submission
    const firstReport = agent.triage({
      batchNumber: "BATCH-2026-904",
      title: "Suspected Undeclared Tree Nut Reaction",
      description: "First consumer complaint regarding hives."
    }, existingIncidents);

    existingIncidents.push(firstReport);

    let secondHoldFired = false;
    globalEventBus.subscribe("BATCH_HOLD_APPLIED", () => {
      secondHoldFired = true;
    });

    // Second repeated submission for same batch and category
    const secondReport = agent.triage({
      batchNumber: "BATCH-2026-904",
      title: "Allergic Reaction Follow-up",
      description: "Second consumer reporting facial swelling on same batch."
    }, existingIncidents);

    // Stable ID preserved
    expect(secondReport.id).toBe(firstReport.id);
    expect(secondReport.occurrenceCount).toBe(2);
    expect(secondReport.reportsHistory.length).toBe(2);
    expect(secondReport.reportsHistory[1].description).toContain("Second consumer reporting");

    // Must NOT fire a duplicate batch hold event
    expect(secondHoldFired).toBe(false);
  });

  it("Triages packaging and statutory warning label mismatch as HIGH priority", () => {
    const incident = agent.triage({
      batchNumber: "BATCH-2026-319",
      title: "Missing Red 40 Warning Label",
      description: "Shipment arrived lacking statutory EU hyperactivity advisory on packaging."
    });

    expect(incident.category).toBe("PACKAGING_LABEL_MISMATCH");
    expect(incident.priority).toBe("HIGH");
    expect(incident.autoAction).toBe("FLAG_FOR_PACKAGING_QA_INSPECTION");
  });

  it("Triages physical sensory anomaly as MEDIUM priority and escalates after 3 recurrences", () => {
    const incidentsList: Incident[] = [];

    // Report 1
    const rep1 = agent.triage({
      batchNumber: "BATCH-2026-402",
      title: "Phase separation in cream",
      description: "Product texture was separated and watery."
    }, incidentsList);
    expect(rep1.priority).toBe("MEDIUM");
    expect(rep1.occurrenceCount).toBe(1);
    incidentsList.push(rep1);

    // Report 2
    const rep2 = agent.triage({
      batchNumber: "BATCH-2026-402",
      title: "Separated texture",
      description: "Another customer reported lumpy texture."
    }, incidentsList);
    expect(rep2.occurrenceCount).toBe(2);
    expect(rep2.priority).toBe("MEDIUM");
    incidentsList[0] = rep2;

    // Report 3 (should escalate to HIGH)
    const rep3 = agent.triage({
      batchNumber: "BATCH-2026-402",
      title: "Viscosity defect",
      description: "Third customer reported watery consistency."
    }, incidentsList);

    expect(rep3.occurrenceCount).toBe(3);
    expect(rep3.priority).toBe("HIGH");
    expect(rep3.autoAction).toBe("ESCALATED_REPEATED_COMPLAINTS");
    expect(rep3.reasoning.some(r => r.includes("Repeated complaint threshold reached"))).toBe(true);
  });
});
