import { describe, it, expect } from "vitest";
import { FoodValidator } from "../strategies/FoodValidator";
import { CosmeticsValidator } from "../strategies/CosmeticsValidator";
import { ComplianceService } from "../services/ComplianceService";

describe("STRATEGY PATTERN: Regulatory Compliance Validators", () => {
  const foodValidator = new FoodValidator();
  const cosmeticsValidator = new CosmeticsValidator();
  const complianceService = new ComplianceService();

  it("FoodValidator: Rejects Titanium Dioxide in EU food formulations", () => {
    const ingredients = ["Water", "Sugar", "Titanium Dioxide", "Flavor"];
    const reports = foodValidator.validate(ingredients);

    const euReport = reports.find(r => r.region === "EU_EFSA");
    expect(euReport).toBeDefined();
    expect(euReport?.status).toBe("NON_COMPLIANT");
    expect(euReport?.violations.some(v => v.substance.includes("Titanium Dioxide"))).toBe(true);
  });

  it("FoodValidator: Flags Red 40 for required behavioral warning in EU", () => {
    const ingredients = ["Carbonated water", "Cane sugar", "Red 40"];
    const reports = foodValidator.validate(ingredients);

    const euReport = reports.find(r => r.region === "EU_EFSA");
    expect(euReport?.status).toBe("WARNING");
    expect(euReport?.violations.some(v => v.status === "WARNING_REQUIRED")).toBe(true);
  });

  it("CosmeticsValidator: Banned Parabens in EU leave-on cosmetics", () => {
    const ingredients = ["Water", "Glycerin", "Propylparaben", "Niacinamide"];
    const reports = cosmeticsValidator.validate(ingredients);

    const euReport = reports.find(r => r.region === "EU_EFSA");
    expect(euReport?.status).toBe("NON_COMPLIANT");
  });

  it("ComplianceService: Accurately identifies allergens and prevents false positives", () => {
    // "butter" is dairy, but "butterfly pea flower" is an herbal flower
    const ingredients = ["Butterfly pea flower tea", "Raw almonds", "Oats"];
    const allergens = complianceService.extractAllergens(ingredients);

    const ids = allergens.map(a => a.id);
    expect(ids).toContain("tree_nuts");
    expect(ids).toContain("wheat");
    expect(ids).not.toContain("milk");
  });
});
