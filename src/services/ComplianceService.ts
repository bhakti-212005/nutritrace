import { ComplianceStrategy } from "../strategies/ComplianceStrategy";
import { FoodValidator } from "../strategies/FoodValidator";
import { CosmeticsValidator } from "../strategies/CosmeticsValidator";
import { ProductCategory, AllergenTag } from "../domain/product";
import { ProductComplianceResult, RegionalAuditReport, RegulatoryRegion, ComplianceViolation } from "../domain/compliance";

const ALLERGEN_RULES: { id: string; name: string; icon: string; keywords: string[] }[] = [
  { id: "milk", name: "Milk / Dairy", icon: "🥛", keywords: ["milk", "dairy", "whey", "casein", "butter", "cheese"] },
  { id: "tree_nuts", name: "Tree Nuts", icon: "🌰", keywords: ["almond", "walnut", "cashew", "pistachio", "pecan", "hazelnut"] },
  { id: "peanuts", name: "Peanuts", icon: "🥜", keywords: ["peanut", "groundnut"] },
  { id: "soy", name: "Soybeans", icon: "🌱", keywords: ["soy", "soya", "soybean", "soy lecithin", "edamame"] },
  { id: "wheat", name: "Wheat & Gluten", icon: "🌾", keywords: ["wheat", "gluten", "barley", "rye", "oats", "flour"] },
  { id: "eggs", name: "Eggs", icon: "🥚", keywords: ["egg", "albumin", "yolk", "mayonnaise"] },
  { id: "fish", name: "Fish", icon: "🐟", keywords: ["fish", "salmon", "tuna", "cod", "anchovy"] },
  { id: "crustacean", name: "Crustaceans", icon: "🦐", keywords: ["shrimp", "crab", "lobster", "prawn"] },
  { id: "sesame", name: "Sesame", icon: "🥯", keywords: ["sesame", "tahini"] }
];

export class ComplianceService {
  private foodValidator = new FoodValidator();
  private cosmeticsValidator = new CosmeticsValidator();

  getStrategy(category: ProductCategory): ComplianceStrategy {
    if (category === "Cosmetics") {
      return this.cosmeticsValidator;
    }
    return this.foodValidator;
  }

  audit(category: ProductCategory, ingredients: string[]): ProductComplianceResult {
    const strategy = this.getStrategy(category);
    const reportsList = strategy.validate(ingredients);

    const reports = {} as Record<RegulatoryRegion, RegionalAuditReport>;
    let totalScore = 0;
    let anyNeedsReview = false;

    for (const rep of reportsList) {
      reports[rep.region] = rep;
      totalScore += rep.score;
      if (rep.status === "NEEDS_REVIEW" || rep.violations.some(v => v.requiresHumanReview)) {
        anyNeedsReview = true;
      }
    }

    const averageScore = Math.round(totalScore / reportsList.length);
    const isGloballyCompliant = reportsList.every(r => r.status === "COMPLIANT");

    return {
      averageScore,
      isGloballyCompliant,
      requiresHumanReview: anyNeedsReview,
      reports
    };
  }

  getViolationsList(result: ProductComplianceResult): ComplianceViolation[] {
    const list: ComplianceViolation[] = [];
    const seen = new Set<string>();

    Object.values(result.reports).forEach(rep => {
      rep.violations.forEach(v => {
        if (!seen.has(v.ruleId)) {
          seen.add(v.ruleId);
          list.push(v);
        }
      });
    });

    return list;
  }

  extractAllergens(ingredients: string[]): AllergenTag[] {
    const text = ingredients.join(" ").toLowerCase();
    const detected: AllergenTag[] = [];

    for (const rule of ALLERGEN_RULES) {
      const match = rule.keywords.some(kw => new RegExp(`\\b${kw}s?\\b`, "i").test(text));
      if (match) {
        detected.push({ id: rule.id, name: rule.name, icon: rule.icon });
      }
    }

    return detected;
  }
}

export const complianceService = new ComplianceService();
