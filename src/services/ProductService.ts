import { Product, ProductCategory } from "../domain/product";
import { repository, LocalStorageRepository } from "../repositories/LocalStorageRepository";
import { complianceService, ComplianceService } from "./ComplianceService";
import { globalEventBus } from "../events/EventBus";

export class ProductService {
  constructor(
    private repo: LocalStorageRepository = repository,
    private compliance: ComplianceService = complianceService
  ) {
    // Observer pattern: automatically quarantine batch products when a critical incident fires
    globalEventBus.subscribe("BATCH_QUARANTINED", (evt) => {
      const { batchNumber } = evt.payload;
      if (batchNumber) {
        this.repo.updateProductBatchStatus(batchNumber, "QUARANTINED");
      }
    });
  }

  getAllProducts(): Product[] {
    return this.repo.getProducts();
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
    globalEventBus.publish("PRODUCT_CREATED", saved);
    return saved;
  }
}

export const productService = new ProductService();
