import { Product, ProductCategory, ProductStatus } from "../domain/product";
import { repository, LocalStorageRepository } from "../repositories/LocalStorageRepository";
import { complianceService, ComplianceService } from "./ComplianceService";
import { globalEventBus, EventBus } from "../events/EventBus";

export class ProductService {
  private unsubs: (() => void)[] = [];

  constructor(
    private repo: LocalStorageRepository = repository,
    private compliance: ComplianceService = complianceService,
    private bus: EventBus = globalEventBus
  ) {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    // 1. Observer: Apply provisional hold
    const unsubHold = this.bus.subscribe("BATCH_HOLD_APPLIED", (evt) => {
      const { batchNumber, reason } = evt.payload;
      if (batchNumber) {
        this.repo.updateProductBatchStatus(batchNumber, "PROVISIONAL_HOLD");
        this.repo.addAuditRecord({
          id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          eventType: "PROVISIONAL_HOLD_APPLIED",
          entityType: "BATCH",
          entityId: batchNumber,
          batchNumber,
          action: "PROVISIONAL_BATCH_HOLD",
          reason: reason || "Consumer safety report triaged by IncidentAgent.",
          actor: "IncidentAgent-v2 (Rule-Based Triage)",
          newStatus: "PROVISIONAL_HOLD"
        });
      }
    });

    // 2. Observer: Legacy / definitive quarantine
    const unsubQuarantine = this.bus.subscribe("BATCH_QUARANTINED", (evt) => {
      const { batchNumber, reason } = evt.payload;
      if (batchNumber) {
        this.repo.updateProductBatchStatus(batchNumber, "QUARANTINED");
        this.repo.addAuditRecord({
          id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          eventType: "BATCH_QUARANTINED",
          entityType: "BATCH",
          entityId: batchNumber,
          batchNumber,
          action: "BATCH_QUARANTINED",
          reason: reason || "Confirmed regulatory or critical contamination action.",
          actor: "Quality Director",
          newStatus: "QUARANTINED"
        });
      }
    });

    // 3. Observer: Batch hold released
    const unsubRelease = this.bus.subscribe("BATCH_HOLD_RELEASED", (evt) => {
      const { batchNumber, newStatus, reason, reviewer } = evt.payload;
      if (batchNumber) {
        this.repo.updateProductBatchStatus(batchNumber, newStatus || "APPROVED");
        this.repo.addAuditRecord({
          id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          timestamp: new Date().toISOString(),
          eventType: "HOLD_RELEASED",
          entityType: "BATCH",
          entityId: batchNumber,
          batchNumber,
          action: "BATCH_HOLD_RELEASED",
          reason: reason || "Provisional safety review completed and approved.",
          actor: reviewer || "Authorized Quality Reviewer",
          previousStatus: "PROVISIONAL_HOLD",
          newStatus: newStatus || "APPROVED"
        });
      }
    });

    this.unsubs.push(unsubHold, unsubQuarantine, unsubRelease);
  }

  destroy(): void {
    this.unsubs.forEach(u => u());
    this.unsubs = [];
  }

  getAllProducts(): Product[] {
    return this.repo.getProducts();
  }

  getProductById(id: string): Product | undefined {
    return this.getAllProducts().find(p => p.id === id);
  }

  createProduct(input: {
    name: string;
    category: ProductCategory;
    brand?: string;
    ingredients: string[];
    shelfLifeMonths?: number;
    packagingType?: string;
    netWeight?: string;
    description?: string;
    nutrition?: Partial<Product["nutrition"]>;
  }): Product {
    if (!input.name?.trim()) {
      throw new Error("Validation Error: Product name is required.");
    }
    if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) {
      throw new Error("Validation Error: At least one ingredient is required.");
    }

    const allergens = this.compliance.extractAllergens(input.ingredients);
    const audit = this.compliance.audit(input.category, input.ingredients);

    const randId = Math.floor(1000 + Math.random() * 9000);
    const sku = `${input.category.substring(0, 3).toUpperCase()}-${input.name.substring(0, 4).replace(/[^a-zA-Z]/g, "").toUpperCase()}-${randId}`;

    const product: Product = {
      id: `prod-${Date.now()}`,
      sku,
      name: input.name.trim(),
      category: input.category,
      brand: input.brand?.trim() || "NutriTrace Labs",
      batchNumber: `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      shelfLifeMonths: input.shelfLifeMonths || 12,
      packagingType: input.packagingType || "Standard Recyclable",
      netWeight: input.netWeight || "250g",
      description: input.description || `Formulation for ${input.name}`,
      ingredients: input.ingredients,
      allergens,
      status: audit.isGloballyCompliant ? "APPROVED" : "REVIEW_REQUIRED",
      nutrition: {
        servingSize: input.nutrition?.servingSize || "100g",
        calories: input.nutrition?.calories ?? 120,
        totalFat: input.nutrition?.totalFat ?? 2,
        sodium: input.nutrition?.sodium ?? 80,
        totalCarbs: input.nutrition?.totalCarbs ?? 15,
        sugars: input.nutrition?.sugars ?? 5,
        protein: input.nutrition?.protein ?? 4
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const saved = this.repo.saveProduct(product);

    this.repo.addAuditRecord({
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      eventType: "PRODUCT_CREATED",
      entityType: "PRODUCT",
      entityId: saved.id,
      batchNumber: saved.batchNumber,
      action: "CREATE_PRODUCT_MASTER",
      reason: `New product formulation created in catalog. Compliance score: ${audit.averageScore}/100.`,
      actor: "Catalog Manager",
      newStatus: saved.status
    });

    this.bus.publish("PRODUCT_CREATED", saved);
    return saved;
  }

  updateProduct(id: string, updates: Partial<{
    name: string;
    category: ProductCategory;
    brand: string;
    ingredients: string[];
    shelfLifeMonths: number;
    packagingType: string;
    netWeight: string;
    description: string;
    status: ProductStatus;
  }>): Product {
    const existing = this.getProductById(id);
    if (!existing) {
      throw new Error(`Product with ID '${id}' not found.`);
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error("Validation Error: Product name cannot be empty.");
    }

    const updatedIngredients = updates.ingredients || existing.ingredients;
    if (updatedIngredients.length === 0) {
      throw new Error("Validation Error: Ingredients list cannot be empty.");
    }

    const category = updates.category || existing.category;
    const allergens = this.compliance.extractAllergens(updatedIngredients);
    const audit = this.compliance.audit(category, updatedIngredients);

    // Keep provisional hold or quarantined status if batch is held, otherwise auto-calculate status
    let newStatus = updates.status || existing.status;
    if (existing.status !== "PROVISIONAL_HOLD" && existing.status !== "QUARANTINED") {
      newStatus = audit.isGloballyCompliant ? "APPROVED" : "REVIEW_REQUIRED";
    }

    const updatedProduct: Product = {
      ...existing,
      name: updates.name?.trim() || existing.name,
      category,
      brand: updates.brand?.trim() || existing.brand,
      ingredients: updatedIngredients,
      allergens,
      shelfLifeMonths: updates.shelfLifeMonths ?? existing.shelfLifeMonths,
      packagingType: updates.packagingType || existing.packagingType,
      netWeight: updates.netWeight || existing.netWeight,
      description: updates.description || existing.description,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    this.repo.saveProduct(updatedProduct);

    this.repo.addAuditRecord({
      id: `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      eventType: "PRODUCT_UPDATED",
      entityType: "PRODUCT",
      entityId: updatedProduct.id,
      batchNumber: updatedProduct.batchNumber,
      action: "UPDATE_PRODUCT_RECORD",
      reason: `Product updated. Re-evaluated compliance score: ${audit.averageScore}/100.`,
      actor: "Regulatory Specialist",
      previousStatus: existing.status,
      newStatus: updatedProduct.status
    });

    this.bus.publish("PRODUCT_UPDATED", updatedProduct);
    return updatedProduct;
  }
}

export const productService = new ProductService();
