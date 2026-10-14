import { ComplianceStrategy } from "./ComplianceStrategy";
import { RegionalAuditReport, ComplianceViolation } from "../domain/compliance";

export class FoodValidator implements ComplianceStrategy {
  readonly strategyName = "Food & Beverage Regulatory Validator";

  validate(ingredients: string[]): RegionalAuditReport[] {
    const lower = ingredients.map(i => i.toLowerCase().trim());

    // 1. US FDA Evaluation
    const fdaViolations: ComplianceViolation[] = [];
    let fdaScore = 100;

    if (lower.some(i => i.includes("brominated vegetable oil") || i.includes("bvo"))) {
      fdaViolations.push({
        substance: "Brominated Vegetable Oil (BVO)",
        severity: "CRITICAL",
        status: "BANNED",
        message: "FDA revoked authorization in 2024 due to bioaccumulation."
      });
      fdaScore -= 60;
    }
    if (lower.some(i => i.includes("potassium bromate"))) {
      fdaViolations.push({
        substance: "Potassium Bromate",
        severity: "MODERATE",
        status: "RESTRICTED",
        message: "Permitted under strict residue limits (<50 ppm) in flour."
      });
      fdaScore -= 15;
    }

    // 2. EU EFSA Evaluation
    const euViolations: ComplianceViolation[] = [];
    let euScore = 100;

    if (lower.some(i => i.includes("titanium dioxide") || i.includes("e171"))) {
      euViolations.push({
        substance: "Titanium Dioxide (E171)",
        severity: "CRITICAL",
        status: "BANNED",
        message: "Strictly banned as food additive across EU under Reg (EU) 2022/63."
      });
      euScore -= 60;
    }
    if (lower.some(i => i.includes("potassium bromate") || i.includes("e924"))) {
      euViolations.push({
        substance: "Potassium Bromate (E924)",
        severity: "CRITICAL",
        status: "BANNED",
        message: "Classified carcinogen banned across Europe."
      });
      euScore -= 60;
    }
    if (lower.some(i => i.includes("red 40") || i.includes("allura red") || i.includes("e129"))) {
      euViolations.push({
        substance: "Red 40 (E129)",
        severity: "WARNING",
        status: "WARNING_REQUIRED",
        message: "Mandatory EU warning: 'May have adverse effect on activity and attention in children'."
      });
      euScore -= 20;
    }

    // 3. India FSSAI Evaluation
    const fssaiViolations: ComplianceViolation[] = [];
    let fssaiScore = 100;
    if (lower.some(i => i.includes("potassium bromate"))) {
      fssaiViolations.push({
        substance: "Potassium Bromate",
        severity: "CRITICAL",
        status: "BANNED",
        message: "Prohibited by FSSAI since 2016."
      });
      fssaiScore -= 50;
    }

    return [
      {
        region: "US_FDA",
        regionName: "United States (FDA 21 CFR)",
        status: fdaViolations.some(v => v.severity === "CRITICAL") ? "NON_COMPLIANT" : fdaViolations.length ? "WARNING" : "COMPLIANT",
        score: Math.max(0, fdaScore),
        violations: fdaViolations
      },
      {
        region: "EU_EFSA",
        regionName: "European Union (EFSA Reg 1333/2008)",
        status: euViolations.some(v => v.severity === "CRITICAL") ? "NON_COMPLIANT" : euViolations.length ? "WARNING" : "COMPLIANT",
        score: Math.max(0, euScore),
        violations: euViolations
      },
      {
        region: "IN_FSSAI",
        regionName: "India (FSSAI Regulations)",
        status: fssaiViolations.some(v => v.severity === "CRITICAL") ? "NON_COMPLIANT" : fssaiViolations.length ? "WARNING" : "COMPLIANT",
        score: Math.max(0, fssaiScore),
        violations: fssaiViolations
      }
    ];
  }
}
