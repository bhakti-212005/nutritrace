import { ComplianceStrategy } from "./ComplianceStrategy";
import { RegionalAuditReport, ComplianceViolation, RegulatoryRegion } from "../domain/compliance";
import { COMPLIANCE_RULES, DeclarativeComplianceRule } from "./complianceRules";

export class FoodValidator implements ComplianceStrategy {
  readonly strategyName = "Food & Beverage Regulatory Validator";

  validate(ingredients: string[]): RegionalAuditReport[] {
    const lower = ingredients.map(i => i.toLowerCase().trim());
    const textJoined = lower.join(" ");

    const regions: { region: RegulatoryRegion; regionName: string }[] = [
      { region: "US_FDA", regionName: "United States (FDA 21 CFR)" },
      { region: "EU_EFSA", regionName: "European Union (EFSA Reg 1333/2008)" },
      { region: "IN_FSSAI", regionName: "India (FSSAI Regulations)" }
    ];

    const foodRules = COMPLIANCE_RULES.filter(
      r => r.productCategory === "Food"
    );

    return regions.map(({ region, regionName }) => {
      const violations: ComplianceViolation[] = [];
      let score = 100;

      const applicableRules = foodRules.filter(r => r.region === region);
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
        ? "All tested ingredients conform to configured illustrative regulatory thresholds."
        : `Score deducted by ${100 - Math.max(0, score)} points due to ${violations.length} flagged rule condition(s). Demonstrative score only.`;

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
