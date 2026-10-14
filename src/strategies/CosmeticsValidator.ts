import { ComplianceStrategy } from "./ComplianceStrategy";
import { RegionalAuditReport, ComplianceViolation, RegulatoryRegion } from "../domain/compliance";
import { COMPLIANCE_RULES } from "./complianceRules";

export class CosmeticsValidator implements ComplianceStrategy {
  readonly strategyName = "Cosmetics & Skincare Regulatory Validator";

  validate(ingredients: string[]): RegionalAuditReport[] {
    const lower = ingredients.map(i => i.toLowerCase().trim());
    const textJoined = lower.join(" ");

    const regions: { region: RegulatoryRegion; regionName: string }[] = [
      { region: "US_FDA", regionName: "United States (FDA Cosmetics / MoCRA)" },
      { region: "EU_EFSA", regionName: "European Union (EU Reg 1223/2009)" },
      { region: "IN_FSSAI", regionName: "India (CDSCO Cosmetics Rules)" }
    ];

    const cosmeticsRules = COMPLIANCE_RULES.filter(
      r => r.productCategory === "Cosmetics"
    );

    return regions.map(({ region, regionName }) => {
      const violations: ComplianceViolation[] = [];
      let score = 100;

      const applicableRules = cosmeticsRules.filter(r => r.region === region);
      for (const rule of applicableRules) {
        const matches = rule.keywords.some(kw => textJoined.includes(kw));
        if (matches) {
          violations.push({
            ruleId: rule.id,
            substance: rule.substance,
            classification: rule.classification,
            severity: rule.severity,
            status: rule.status,
            message: rule.message,
            jurisdiction: rule.jurisdiction,
            sourceRef: rule.sourceRef,
            isDemoRule: rule.isDemoRule,
            requiresHumanReview: rule.requiresHumanReview,
            recommendedAction: rule.recommendedAction,
            suggestedSubstitute: rule.suggestedSubstitute
          });
          score -= rule.scoreDeduction;
        }
      }

      const hasCritical = violations.some(v => v.severity === "CRITICAL");
      const hasReview = violations.some(v => v.requiresHumanReview);
      const hasWarning = violations.some(v => v.severity === "WARNING" || v.severity === "MODERATE");

      const status = hasCritical
        ? "NON_COMPLIANT"
        : hasReview
        ? "NEEDS_REVIEW"
        : hasWarning
        ? "WARNING"
        : "COMPLIANT";

      const scoringRationale = violations.length === 0
        ? "Compliant with illustrative cosmetics guidelines for this jurisdiction."
        : `Score adjusted to reflect ${violations.length} restriction(s). Concentrated lab assays required for definitive legal classification.`;

      return {
        region,
        regionName,
        status,
        score: Math.max(0, score),
        scoringRationale,
        violations
      };
    });
  }
}
