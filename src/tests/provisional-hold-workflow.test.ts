import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageRepository } from "../repositories/LocalStorageRepository";
import { ProductService } from "../services/ProductService";
import { IncidentService } from "../services/IncidentService";
import { EventBus } from "../events/EventBus";
import { IncidentAgent } from "../agents/IncidentAgent";
import { ComplianceService } from "../services/ComplianceService";

describe("SYSTEM INTEGRATION: Safety Holds, Reviewer Release & Audit Trail", () => {
  let mockStorage: Record<string, string>;
  let repo: LocalStorageRepository;
  let testBus: EventBus;
  let compService: ComplianceService;
  let prodService: ProductService;
  let incService: IncidentService;
  let incAgent: IncidentAgent;

  beforeEach(() => {
    mockStorage = {};
    // Mock localStorage
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
      length: 0,
      key: () => null
    } as any;

    testBus = new EventBus();
    repo = new LocalStorageRepository();
    compService = new ComplianceService();
    prodService = new ProductService(repo, compService, testBus);
    incAgent = new IncidentAgent();
    incService = new IncidentService(repo, incAgent, testBus);
  });

  it("Executes end-to-end provisional hold and authorized reviewer release workflow", () => {
    // 1. Initial product state for batch BATCH-2026-904
    const initialProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-904");
    expect(initialProduct).toBeDefined();
    expect(initialProduct?.status).toBe("APPROVED");

    // 2. Triage serious adverse reaction complaint
    const incident = incService.logIncident({
      batchNumber: "BATCH-2026-904",
      title: "Acute Allergen Swelling",
      description: "Consumer reported severe swelling after consumption."
    });

    expect(incident.priority).toBe("CRITICAL");
    expect(incident.status).toBe("PROVISIONAL_HOLD");

    // Product status should automatically update to PROVISIONAL_HOLD via EventBus subscription
    const heldProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-904");
    expect(heldProduct?.status).toBe("PROVISIONAL_HOLD");

    // Verify audit trail record for provisional hold
    const audits = repo.getAuditRecords();
    const holdAudit = audits.find(a => a.eventType === "PROVISIONAL_HOLD_APPLIED");
    expect(holdAudit).toBeDefined();
    expect(holdAudit?.batchNumber).toBe("BATCH-2026-904");
    expect(holdAudit?.newStatus).toBe("PROVISIONAL_HOLD");

    // 3. Authorized reviewer releases provisional hold with mandatory justification
    incService.releaseBatchHold("BATCH-2026-904", {
      reviewer: "Dr. Marcus Brody (Director QA)",
      decisionNote: "Retention sample mass-spec testing confirmed zero cross-contamination; release approved.",
      targetStatus: "APPROVED"
    });

    // 4. Verify product status restored to APPROVED
    const releasedProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-904");
    expect(releasedProduct?.status).toBe("APPROVED");

    // 5. Verify incident status updated to RESOLVED with review decision metadata
    const resolvedIncident = repo.getIncidents().find(i => i.id === incident.id);
    expect(resolvedIncident?.status).toBe("RESOLVED");
    expect(resolvedIncident?.reviewDecision?.reviewer).toBe("Dr. Marcus Brody (Director QA)");
    expect(resolvedIncident?.reviewDecision?.decisionNote).toContain("Retention sample");

    // 6. Verify audit trail records the hold release
    const releaseAudit = repo.getAuditRecords().find(a => a.eventType === "HOLD_RELEASED");
    expect(releaseAudit).toBeDefined();
    expect(releaseAudit?.actor).toBe("Dr. Marcus Brody (Director QA)");
    expect(releaseAudit?.previousStatus).toBe("PROVISIONAL_HOLD");
    expect(releaseAudit?.newStatus).toBe("APPROVED");
  });

  it("Rejects hold release without reviewer identity or decision note", () => {
    expect(() => {
      incService.releaseBatchHold("BATCH-2026-904", {
        reviewer: "",
        decisionNote: "Some note"
      });
    }).toThrow("Validation Error: Reviewer identity/credentials are required.");

    expect(() => {
      incService.releaseBatchHold("BATCH-2026-904", {
        reviewer: "Reviewer Name",
        decisionNote: "   "
      });
    }).toThrow("Validation Error: Formal review justification note is required");
  });

  it("ProductService: Allows editing existing products with validation and audit logging", () => {
    const existing = repo.getProducts()[0];
    const originalId = existing.id;

    const updated = prodService.updateProduct(originalId, {
      name: "Vitalize Pro Ultra Shake",
      shelfLifeMonths: 18,
      ingredients: ["Water", "Almond paste", "Gluten-free oats", "Pea protein", "Cocoa powder"]
    });

    expect(updated.id).toBe(originalId);
    expect(updated.name).toBe("Vitalize Pro Ultra Shake");
    expect(updated.shelfLifeMonths).toBe(18);

    // Verify audit record logged
    const updateAudit = repo.getAuditRecords().find(a => a.eventType === "PRODUCT_UPDATED" && a.entityId === originalId);
    expect(updateAudit).toBeDefined();
    expect(updateAudit?.action).toBe("UPDATE_PRODUCT_RECORD");
  });

  it("ProductService: Rejects product creation and update with invalid data", () => {
    expect(() => {
      prodService.createProduct({
        name: "   ",
        category: "Beverage",
        ingredients: ["Water"]
      });
    }).toThrow("Validation Error: Product name is required.");

    expect(() => {
      prodService.createProduct({
        name: "Valid Name",
        category: "Beverage",
        ingredients: []
      });
    }).toThrow("Validation Error: At least one ingredient is required.");

    expect(() => {
      prodService.updateProduct("non-existent-id", { name: "Test" });
    }).toThrow("Product with ID 'non-existent-id' not found.");
  });

  it("LocalStorageRepository: Gracefully recovers from corrupted or malformed data in storage", () => {
    // Inject corrupt JSON into storage
    mockStorage["nutritrace_products_v1"] = "{ malformed json }";
    mockStorage["nutritrace_incidents_v1"] = "invalid_string";
    mockStorage["nutritrace_audit_v1"] = "12345";

    // Should not throw, should fall back to valid seed arrays
    const prods = repo.getProducts();
    const incs = repo.getIncidents();
    const audits = repo.getAuditRecords();

    expect(Array.isArray(prods)).toBe(true);
    expect(prods.length).toBeGreaterThan(0);
    expect(Array.isArray(incs)).toBe(true);
    expect(Array.isArray(audits)).toBe(true);
  });

  it("EventBus: Correctly cleans up listener subscriptions on unsubscribe", () => {
    let callCount = 0;
    const unsub = testBus.subscribe("PRODUCT_CREATED", () => {
      callCount++;
    });

    testBus.publish("PRODUCT_CREATED", { sku: "TEST" });
    expect(callCount).toBe(1);

    // Unsubscribe and publish again
    unsub();
    testBus.publish("PRODUCT_CREATED", { sku: "TEST-2" });
    expect(callCount).toBe(1); // Should not increment
  });
});
