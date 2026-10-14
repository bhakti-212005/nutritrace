import { describe, it, expect, beforeEach } from "vitest";
import { LocalStorageRepository } from "../repositories/LocalStorageRepository";
import { ProductService } from "../services/ProductService";
import { IncidentService } from "../services/IncidentService";
import { ComplianceService } from "../services/ComplianceService";
import { EventBus } from "../events/EventBus";
import { IncidentAgent } from "../agents/IncidentAgent";
import { FoodValidator } from "../validators/FoodValidator";
import { CosmeticsValidator } from "../validators/CosmeticsValidator";

/**
 * COMPREHENSIVE END-TO-END TEST SUITE: NUTRITRACE PIM & SAFETY PLATFORM
 * 
 * Verifies all architectural patterns and core business features:
 * 1. Strategy Pattern: Food & Cosmetics formulation compliance auditing
 * 2. Allergen Intelligence: Heuristic allergen detection (Milk, Tree Nuts, etc.)
 * 3. Repository Pattern: Master formulation catalog persistence & recovery
 * 4. Observer Pattern: Decoupled typed EventBus publishing and subscription
 * 5. IncidentAgent Heuristic Triage: Neutral causation standard & severity assessment
 * 6. Idempotent Deduplication: Recurring reports aggregate into occurrence timeline
 * 7. Reversible Batch Safety Holds: Containment & authorized reviewer release
 * 8. Tamper-Evident Audit Trail: Immutable chronological operational log
 */
describe("NUTRITRACE MASTER SUITE: Comprehensive End-to-End Feature Test", () => {
  let mockStorage: Record<string, string>;
  let repo: LocalStorageRepository;
  let eventBus: EventBus;
  let complianceService: ComplianceService;
  let productService: ProductService;
  let incidentAgent: IncidentAgent;
  let incidentService: IncidentService;

  beforeEach(() => {
    mockStorage = {};
    // In-memory mock for LocalStorage persistence
    globalThis.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      removeItem: (key: string) => { delete mockStorage[key]; },
      clear: () => { mockStorage = {}; },
      length: 0,
      key: () => null
    } as any;

    eventBus = new EventBus();
    repo = new LocalStorageRepository();
    complianceService = new ComplianceService();
    productService = new ProductService(repo, complianceService, eventBus);
    incidentAgent = new IncidentAgent();
    incidentService = new IncidentService(repo, incidentAgent, eventBus);
  });

  it("Executes the complete NutriTrace lifecycle covering all architectural features", () => {
    // =========================================================================
    // FEATURE 1: STRATEGY PATTERN & ALLERGEN EXTRACTION
    // =========================================================================
    const foodValidator = new FoodValidator();
    const cosmeticValidator = new CosmeticsValidator();

    // 1A. Validate Food Strategy: Checks statutory warning for Red 40 & allergen detection
    const beverageIngredients = ["Almond Milk", "Raw Agave Nectar", "Red 40", "Filtered Water"];
    const foodAudit = foodValidator.validate(beverageIngredients);
    const extractedAllergens = complianceService.extractAllergens(beverageIngredients);

    expect(foodAudit.status).toBe("REVIEW_REQUIRED");
    expect(foodAudit.notes).toContain("Red 40 (Allura Red AC) requires EU statutory warning");
    expect(extractedAllergens).toContain("Tree Nuts"); // Detected Almond Milk

    // 1B. Validate Cosmetics Strategy: Checks restricted preservatives
    const cosmeticAudit = cosmeticValidator.validate(["Water", "Glycerin", "Propylparaben"]);
    expect(cosmeticAudit.status).toBe("REVIEW_REQUIRED");
    expect(cosmeticAudit.notes).toContain("Propylparaben is restricted in EU leave-on cosmetics");

    // =========================================================================
    // FEATURE 2: REPOSITORY PATTERN & OBSERVER EVENTBUS CATALOG CREATION
    // =========================================================================
    let productCreatedEventFired = false;
    eventBus.subscribe("PRODUCT_STATUS_CHANGED", (payload) => {
      if (payload.batchNumber === "BATCH-2026-X77") {
        productCreatedEventFired = true;
      }
    });

    const newProduct = productService.createProduct({
      name: "SuperBerry Botanical Elixir",
      category: "Beverage",
      brand: "Vitalize Organics",
      batchNumber: "BATCH-2026-X77",
      ingredients: ["Filtered Water", "Pomegranate Juice", "Red 40", "Almond Milk"]
    });

    expect(newProduct.id).toBeDefined();
    expect(newProduct.allergens).toContain("Tree Nuts");
    expect(newProduct.status).toBe("REVIEW_REQUIRED"); // Because of Red 40 advisory requirement

    // Verify persistence in repository
    const storedProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-X77");
    expect(storedProduct).toBeDefined();
    expect(storedProduct?.name).toBe("SuperBerry Botanical Elixir");

    // =========================================================================
    // FEATURE 3: DETERMINISTIC INCIDENT TRIAGE & NEUTRAL CAUSATION
    // =========================================================================
    // Ingest severe allergic reaction report for batch BATCH-2026-904
    const firstReport = incidentService.logIncident({
      batchNumber: "BATCH-2026-904",
      title: "Acute Facial Edema",
      description: "Consumer reported severe hives, facial swelling, and anaphylaxis after consuming batch.",
      reportedBy: "Consumer Safety Helpline"
    });

    // Verification of triage logic:
    expect(firstReport.priority).toBe("CRITICAL");
    expect(firstReport.status).toBe("PROVISIONAL_HOLD");
    // Standard of neutral causation: must NOT declare conclusive fault before lab assay
    expect(firstReport.analysis).toContain("Consumer reported an adverse reaction — urgent safety review required");
    expect(firstReport.autoAction).toBe("PROVISIONAL_BATCH_HOLD");
    expect(firstReport.occurrenceCount).toBe(1);

    // Observer Pattern Verification: Product in catalog must be automatically moved to PROVISIONAL_HOLD
    const heldCatalogProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-904");
    expect(heldCatalogProduct?.status).toBe("PROVISIONAL_HOLD");

    // =========================================================================
    // FEATURE 4: IDEMPOTENT DEDUPLICATION & RECURRENCE TIMELINE
    // =========================================================================
    // A second consumer calls in about the same batch
    const duplicateReport = incidentService.logIncident({
      batchNumber: "BATCH-2026-904",
      title: "Allergic Rash & Difficulty Breathing",
      description: "Second consumer experienced allergic reaction after drinking from batch BATCH-2026-904.",
      reportedBy: "Retailer Portal"
    });

    // Must deduplicate into existing open incident ticket rather than creating duplicates
    expect(duplicateReport.id).toBe(firstReport.id);
    expect(duplicateReport.occurrenceCount).toBe(2);
    expect(duplicateReport.reportsHistory).toHaveLength(2);
    expect(duplicateReport.reportsHistory[1].description).toContain("Second consumer experienced");

    // =========================================================================
    // FEATURE 5: AUTHORIZED REVIEWER HOLD RELEASE WORKFLOW
    // =========================================================================
    // 5A. Validation failure when mandatory reviewer credentials are missing
    expect(() => {
      incidentService.releaseBatchHold("BATCH-2026-904", {
        reviewer: "",
        decisionNote: "Testing completed."
      });
    }).toThrow("Validation Error: Reviewer identity/credentials are required.");

    // 5B. Validation failure when justification note is missing
    expect(() => {
      incidentService.releaseBatchHold("BATCH-2026-904", {
        reviewer: "Dr. Marcus Brody (Director QA)",
        decisionNote: ""
      });
    }).toThrow("Validation Error: A formal decision note explaining lab testing or rationale is mandatory.");

    // 5C. Authorized release with complete laboratory assay documentation
    incidentService.releaseBatchHold("BATCH-2026-904", {
      reviewer: "Dr. Elena Vance (VP Quality & Safety)",
      decisionNote: "Retention sample mass-spec and ELISA assays confirmed zero allergen cross-contact. Provisional hold cleared for distribution.",
      targetStatus: "APPROVED"
    });

    // Verify catalog product restored to APPROVED
    const releasedProduct = repo.getProducts().find(p => p.batchNumber === "BATCH-2026-904");
    expect(releasedProduct?.status).toBe("APPROVED");

    // Verify incident ticket marked RESOLVED with full sign-off metadata
    const resolvedIncident = repo.getIncidents().find(i => i.id === firstReport.id);
    expect(resolvedIncident?.status).toBe("RESOLVED");
    expect(resolvedIncident?.reviewDecision?.reviewer).toBe("Dr. Elena Vance (VP Quality & Safety)");
    expect(resolvedIncident?.reviewDecision?.decisionNote).toContain("ELISA assays confirmed");
    expect(resolvedIncident?.reviewDecision?.releasedAt).toBeDefined();

    // =========================================================================
    // FEATURE 6: IMMUTABLE AUDIT TRAIL LOGGING
    // =========================================================================
    const auditRecords = repo.getAuditRecords();
    expect(auditRecords.length).toBeGreaterThan(0);

    // Verify PROVISIONAL_HOLD_APPLIED audit entry
    const holdAudit = auditRecords.find(a => 
      a.eventType === "PROVISIONAL_HOLD_APPLIED" && a.batchNumber === "BATCH-2026-904"
    );
    expect(holdAudit).toBeDefined();
    expect(holdAudit?.newStatus).toBe("PROVISIONAL_HOLD");
    expect(holdAudit?.reason).toContain("Consumer reported an adverse reaction");

    // Verify HOLD_RELEASED audit entry
    const releaseAudit = auditRecords.find(a => 
      a.eventType === "HOLD_RELEASED" && a.batchNumber === "BATCH-2026-904"
    );
    expect(releaseAudit).toBeDefined();
    expect(releaseAudit?.actor).toBe("Dr. Elena Vance (VP Quality & Safety)");
    expect(releaseAudit?.previousStatus).toBe("PROVISIONAL_HOLD");
    expect(releaseAudit?.newStatus).toBe("APPROVED");
    expect(releaseAudit?.details?.reviewNote).toContain("ELISA assays confirmed");

    // =========================================================================
    // FEATURE 7: STORAGE CORRUPTION RESILIENCE & SEED FALLBACK
    // =========================================================================
    // Corrupt the storage keys with invalid JSON
    mockStorage["nutritrace_products"] = "{ malformed [ json";
    mockStorage["nutritrace_incidents"] = "unexpected_token_raw";
    mockStorage["nutritrace_audit"] = JSON.stringify({ notAnArray: true });

    // Repository must catch parsing errors and seamlessly fallback to default seeds without crashing
    const resilientRepo = new LocalStorageRepository();
    const fallbackProducts = resilientRepo.getProducts();
    const fallbackIncidents = resilientRepo.getIncidents();
    const fallbackAudits = resilientRepo.getAuditRecords();

    expect(Array.isArray(fallbackProducts)).toBe(true);
    expect(fallbackProducts.length).toBeGreaterThan(0);
    expect(Array.isArray(fallbackIncidents)).toBe(true);
    expect(Array.isArray(fallbackAudits)).toBe(true);
  });
});
