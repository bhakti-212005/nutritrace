import { Product } from "../domain/product";
import { Incident } from "../domain/incident";

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
    title: "EU Import Regulatory Hold (Red 40 Warning)",
    description: "Port authority customs requested secondary inspection for Red 40 color additive child hyperactivity label.",
    reportedBy: "EU Customs Broker",
    priority: "HIGH",
    status: "INVESTIGATING",
    autoAction: "AUTO_ESCALATE_BILLING_ALERT",
    reasoning: ["EU Regulation (EC) No 1333/2008 requires statutory warning label for Red 40."],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  }
];

/**
 * REPOSITORY PATTERN: LocalStorageRepository
 * Abstracts data persistence with automatic seeding and synchronization.
 */
export class LocalStorageRepository {
  private readonly PRODUCTS_KEY = "nutritrace_products_v1";
  private readonly INCIDENTS_KEY = "nutritrace_incidents_v1";

  getProducts(): Product[] {
    try {
      const data = localStorage.getItem(this.PRODUCTS_KEY);
      if (!data) {
        this.saveProducts(INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(this.PRODUCTS_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to LocalStorage", e);
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
    const updated = list.map(p => p.batchNumber === batchNumber ? { ...p, status } : p);
    this.saveProducts(updated);
  }

  getIncidents(): Incident[] {
    try {
      const data = localStorage.getItem(this.INCIDENTS_KEY);
      if (!data) {
        this.saveIncidents(INITIAL_INCIDENTS);
        return INITIAL_INCIDENTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_INCIDENTS;
    }
  }

  saveIncidents(incidents: Incident[]): void {
    try {
      localStorage.setItem(this.INCIDENTS_KEY, JSON.stringify(incidents));
    } catch (e) {
      console.error("Failed to save incidents to LocalStorage", e);
    }
  }

  addIncident(incident: Incident): Incident {
    const list = this.getIncidents();
    list.unshift(incident);
    this.saveIncidents(list);
    return incident;
  }
}

export const repository = new LocalStorageRepository();
