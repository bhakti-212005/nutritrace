import { describe, it, expect } from "vitest";
import { IncidentAgent } from "../agents/IncidentAgent";
import { globalEventBus } from "../events/EventBus";

describe("AGENTIC AI: IncidentAgent Autonomous Triage", () => {
  const agent = new IncidentAgent();

  it("Auto-triages repeated payment failures to HIGH priority with alert action", () => {
    const incident = agent.triage({
      batchNumber: "BATCH-2026-881",
      title: "Checkout Gateway Timeout",
      description: "Customer faced repeated payment failures and double charge attempts on checkout."
    });

    expect(incident.priority).toBe("HIGH");
    expect(incident.autoAction).toBe("AUTO_ESCALATE_BILLING_ALERT");
    expect(incident.reasoning.some(r => r.includes("payment"))).toBe(true);
  });

  it("Auto-triages severe allergic reactions to CRITICAL and triggers batch quarantine", () => {
    let quarantineEventCaught = false;

    const unsubscribe = globalEventBus.subscribe("BATCH_QUARANTINED", (evt) => {
      if (evt.payload.batchNumber === "BATCH-2026-904") {
        quarantineEventCaught = true;
      }
    });

    const incident = agent.triage({
      batchNumber: "BATCH-2026-904",
      title: "Undeclared allergen anaphylaxis",
      description: "Consumer reported severe allergic reaction and hospital visit after consuming batch."
    });

    expect(incident.priority).toBe("CRITICAL");
    expect(incident.status).toBe("QUARANTINED");
    expect(incident.autoAction).toBe("AUTONOMOUS_BATCH_QUARANTINE");
    expect(quarantineEventCaught).toBe(true);

    unsubscribe();
  });

  it("Assigns MEDIUM priority for packaging defect feedback", () => {
    const incident = agent.triage({
      batchNumber: "BATCH-2026-319",
      title: "Damaged seal on delivery",
      description: "Carton arrived with weeping leak around aluminum can lid."
    });

    expect(incident.priority).toBe("MEDIUM");
    expect(incident.autoAction).toBe("ROUTE_TO_PACKAGING_QA");
  });
});
