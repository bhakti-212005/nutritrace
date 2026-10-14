import { ComplianceStrategy } from "./ComplianceStrategy";
import { RegionalAuditReport, ComplianceViolation } from "../domain/compliance";

export class CosmeticsValidator implements ComplianceStrategy {
  readonly strategyName = "Cosmetics & Skincare Regulatory Validator";

  validate(ingredients: string[]): RegionalAuditReport[] {
    const lower = ingredients.map(i => i.toLowerCase().trim());

    const euViolations: ComplianceViolation[] = [];
    let euScore = 100;

    if (lower.some(i => i.includes("propylparaben") || i.includes("butylparaben"))) {
      euViolations.push({
        substance: "Propylparaben / Butylparaben",
        severity: "CRITICAL",
        status: "BANNED",
        message: "Banned in leave-on cosmetic products intended for children under EU Reg 358/2014."
      });
      euScore -= 50;
    }

    if (lower.some(i => i.includes("formaldehyde") || i.includes("dmdm hydantoin"))) {
      euViolations.push({
        substance: "Formaldehyde / Formaldehyde Releasers",
        severity: "CRITICAL",
        status: "BANNED",
        message: "Annex II prohibited substance under EU Cosmetic Regulation 1223/2009."
      });
      euScore -= 60;
    }

    const fdaViolations: ComplianceViolation[] = [];
    let fdaScore = 100;
    if (lower.some(i => i.includes("propylparaben"))) {
      fdaViolations.push({
        substance: "Propylparaben",
        severity: "MODERATE",
        status: "RESTRICTED",
        message: "CIR (Cosmetic Ingredient Review) safe concentration threshold < 0.8%."
      });
      fdaScore -= 15;
    }

    return [
      {
        region: "US_FDA",
        regionName: "United States (FDA Cosmetics)",
        status: fdaViolations.some(v => v.severity === "CRITICAL") ? "NON_COMPLIANT" : fdaViolations.length ? "WARNING" : "COMPLIANT",
        score: Math.max(0, fdaScore),
        violations: fdaViolations
      },
      {
        region: "EU_EFSA",
        regionName: "European Union (EU Reg 1223/2009)",
        status: euViolations.some(v => v.severity === "CRITICAL") ? "NON_COMPLIANT" : euViolations.length ? "WARNING" : "COMPLIANT",
        score: Math.max(0, euScore),
        violations: euViolations
      },
      {
        region: "IN_FSSAI",
        regionName: "India (CDSCO Cosmetics)",
        status: "COMPLIANT",
        score: 100,
        violations: []
      }
    ];
  }
}
