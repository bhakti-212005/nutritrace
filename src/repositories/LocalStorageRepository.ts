import { Product } from "../domain/product";
import { Incident } from "../domain/incident";
import { AuditRecord } from "../domain/audit";

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    sku: "BEV-ALMO-1042",
    name: "Vitalize Pro Almond Oat Shake",
    category: "Beverage",
    brand: "Vitalize Organics",
    batchNumber: "BATCH-2026-881",
    shelfLifeMonths: 14,
    packagingType: "Aseptic Tetra Pak",
    netWeight: "330 ml",
    description: "Plant-based recovery beverage with almond paste, gluten-free oats, and vanilla.",
    ingredients: ["Water", "Almond paste", "Gluten-free oats", "Pea protein", "Sunflower lecithin", "Sea salt"],
    allergens: [{ id: "tree_nuts", name: "Tree Nuts (Almond)", icon: "🌰" }],
    status: "APPROVED",
    nutrition: {
      servingSize: "330ml",
      calories: 180,
      totalFat: 5.0,
      sodium: 140,
      totalCarbs: 24,
      sugars: 9,
      protein: 12
    },
    createdAt: "2026-10-10T09:00:00.000Z",
    updatedAt: "2026-10-10T09:00:00.000Z"
  },
  {
    id: "prod-002",
    sku: "COS-WHIT-9921",
    name: "LuminaGlow Brightening Cream",
    category: "Cosmetics",
    brand: "Lumina DermaLabs",
    batchNumber: "BATCH-2026-402",
    shelfLifeMonths: 24,
    packagingType: "Airless Pump Jar",
    netWeight: "50 ml",
    description: "Topical skin brightening formulation with titanium dioxide and parabens.",
    ingredients: ["Deionized water", "Glycerin", "Niacinamide", "Titanium Dioxide", "Propylparaben", "Xanthan gum"],
    allergens: [],
    status: "REVIEW_REQUIRED",
    nutrition: {
      servingSize: "Topical",
      calories: 0,
      totalFat: 0,
      sodium: 0,
      totalCarbs: 0,
      sugars: 0,
      protein: 0
    },
    createdAt: "2026-10-11T11:30:00.000Z",
    updatedAt: "2026-10-11T11:30:00.000Z"
  },
  {
    id: "prod-003",
    sku: "BEV-BERR-5520",
    name: "Sparkle Burst Wild Berry Soda",
    category: "Beverage",
    brand: "Aura Fizz Co.",
    batchNumber: "BATCH-2026-319",
    shelfLifeMonths: 9,
    packagingType: "Slim Aluminum Can",
    netWeight: "355 ml",
    description: "Carbonated fruit beverage colored with Red 40 additive.",
    ingredients: ["Carbonated water", "Cane sugar", "Citric acid", "Red 40", "Natural berry flavor"],
    allergens: [],
    status: "REVIEW_REQUIRED",
    nutrition: {
      servingSize: "355ml",
      calories: 110,
      totalFat: 0,
      sodium: 35,
      totalCarbs: 28,
      sugars: 27,
      protein: 0
    },
    createdAt: "2026-10-12T14:15:00.000Z",
    updatedAt: "2026-10-12T14:15:00.000Z"
  },
  {
    id: "prod-004",
    sku: "BAK-CRST-7712",
    name: "Artisan Garlic Herb Crostini",
    category: "Food",
    brand: "Panificio Heritage",
    batchNumber: "BATCH-2026-904",
    shelfLifeMonths: 6,
    packagingType: "Kraft Paper Bag",
    netWeight: "200 g",
    description: "Double-baked sourdough toasts with roasted garlic and sesame seed coating.",
    ingredients: ["Wheat flour", "Water", "Extra virgin olive oil", "Sesame seeds", "Garlic powder", "Sea salt"],
    allergens: [
      { id: "wheat", name: "Wheat & Gluten", icon: "🌾" },
      { id: "sesame", name: "Sesame", icon: "🥯" }
    ],
    status: "APPROVED",
    nutrition: {
      servingSize: "30g",
      calories: 130,
      totalFat: 4.0,
      sodium: 210,
      totalCarbs: 20,
      sugars: 1,
      protein: 3.5
    },
    createdAt: "2026-10-13T08:45:00.000Z",
    updatedAt: "2026-10-13T08:45:00.000Z"
  }
];

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "INC-INIT-001",
    productId: "prod-003",
    batchNumber: "BATCH-2026-319",
    category: "PACKAGING_LABEL_MISMATCH",
    title: "EU Import Regulatory Hold (Red 40 Warning Label Verification)",
    description: "Customs authorities requested packaging verification regarding mandatory statutory warning label for Red 40 coloring.",
    reportedBy: "EU Customs Broker",
    priority: "HIGH",
    status: "INVESTIGATING",
    autoAction: "FLAG_FOR_PACKAGING_QA_INSPECTION",
    reasoning: [
      "Regulation (EC) No 1333/2008 Annex V requires statutory warning label for Red 40.",
      "Assigned HIGH priority for packaging compliance review prior to distribution clearance."
    ],
    occurrenceCount: 1,
    reportsHistory: [
      {
        reportId: "REP-INIT-001",
        timestamp: "2026-10-14T08:15:00.000Z",
        description: "Customs authorities requested packaging verification regarding mandatory statutory warning label for Red 40 coloring.",
        reportedBy: "EU Customs Broker"
      }
    ],
    createdAt: "2026-10-14T08:15:00.000Z",
    updatedAt: "2026-10-14T08:15:00.000Z"
  }
];

const INITIAL_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: "AUD-INIT-001",
    timestamp: "2026-10-14T08:15:00.000Z",
    eventType: "INCIDENT_LOGGED",
    entityType: "INCIDENT",
    entityId: "INC-INIT-001",
    batchNumber: "BATCH-2026-319",
    action: "FLAG_FOR_PACKAGING_QA_INSPECTION",
    reason: "Mandatory EU Red 40 packaging warning compliance verification.",
    actor: "IncidentAgent-v2 (Automated Rule Triage)"
  },
  {
    id: "AUD-INIT-002",
    timestamp: "2026-10-13T08:45:00.000Z",
    eventType: "PRODUCT_CREATED",
    entityType: "PRODUCT",
    entityId: "prod-004",
    batchNumber: "BATCH-2026-904",
    action: "CREATED_INITIAL_FORMULATION",
    reason: "Canonical master record pre-seeded.",
    actor: "PIM System Administrator"
  }
];

/**
 * REPOSITORY PATTERN: LocalStorageRepository
 * Abstracts data persistence with automatic seeding, error recovery, and synchronization.
 */
export class LocalStorageRepository {
  private readonly PRODUCTS_KEY = "nutritrace_products_v1";
  private readonly INCIDENTS_KEY = "nutritrace_incidents_v1";
  private readonly AUDIT_KEY = "nutritrace_audit_v1";

  // --- PRODUCTS ---
  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(this.PRODUCTS_KEY);
      if (!data) {
        this.saveProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error("Products payload is not an array");
      return parsed;
    } catch (e) {
      console.warn("[LocalStorageRepository] Corrupted or missing products data, using initial seed.", e);
      return INITIAL_PRODUCTS;
    }
  }

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("[LocalStorageRepository] Failed to save products to LocalStorage", e);
    }
  }

  saveProduct(product: Product): Product {
    const list = this.getProducts();
    const index = list.findIndex(p => p.id === product.id);
    if (index >= 0) {
      list[index] = product;
    } else {
      list.unshift(product);
    }
    this.saveProducts(list);
    return product;
  }

  updateProductBatchStatus(batchNumber: string, status: Product["status"]): void {
    const list = this.getProducts();
    const updated = list.map(p => p.batchNumber === batchNumber ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    this.saveProducts(updated);
  }

  // --- INCIDENTS ---
  getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(this.INCIDENTS_KEY);
      if (!data) {
        this.saveIncidents(INITIAL_INCIDENTS);
        return INITIAL_INCIDENTS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error("Incidents payload is not an array");
      return parsed;
    } catch (e) {
      console.warn("[LocalStorageRepository] Corrupted or missing incidents data, using initial seed.", e);
      return INITIAL_INCIDENTS;
    }
  }

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(this.INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error("[LocalStorageRepository] Failed to save incidents to LocalStorage", e);
    }
  }

  saveIncident(incident: Incident): Incident {
    const list = this.getIncidents();
    const index = list.findIndex(i => i.id === incident.id);
    if (index >= 0) {
      list[index] = incident;
    } else {
      list.unshift(incident);
    }
    this.saveIncidents(list);
    return incident;
  }

  // --- AUDIT TRAIL ---
  getAuditRecords(): AuditRecord[] {
    try {
      const data = localStorage.getItem(this.AUDIT_KEY);
      if (!data) {
        this.saveAuditRecords(INITIAL_AUDIT_RECORDS);
        return INITIAL_AUDIT_RECORDS;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) throw new Error("Audit records payload is not an array");
      return parsed;
    } catch (e) {
      console.warn("[LocalStorageRepository] Corrupted or missing audit data, using initial seed.", e);
      return INITIAL_AUDIT_RECORDS;
    }
  }

  saveAuditRecords(records: AuditRecord[]): void {
    try {
      localStorage.setItem(this.AUDIT_KEY, JSON.stringify(records));
    } catch (e) {
      console.error("[LocalStorageRepository] Failed to save audit records", e);
    }
  }

  addAuditRecord(record: AuditRecord): AuditRecord {
    const list = this.getAuditRecords();
    list.unshift(record);
    if (list.length > 200) list.pop(); // keep latest 200
    this.saveAuditRecords(list);
    return record;
  }

  // Helper for tests/resets
  clearAll(): void {
    try {
      localStorage.removeItem(this.PRODUCTS_KEY);
      localStorage.removeItem(this.INCIDENTS_KEY);
      localStorage.removeItem(this.AUDIT_KEY);
    } catch {}
  }
}

export const repository = new LocalStorageRepository();
