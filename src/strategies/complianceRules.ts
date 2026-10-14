import { ComplianceViolation, FindingClassification, RegulatoryRegion } from "../domain/compliance";
import { ProductCategory } from "../domain/product";

export interface DeclarativeComplianceRule {
  id: string;
  substance: string;
  keywords: string[];
  productCategory: ProductCategory;
  region: RegulatoryRegion;
  jurisdiction: string;
  classification: FindingClassification;
  severity: "CRITICAL" | "WARNING" | "MODERATE" | "INFO";
  status: "BANNED" | "WARNING_REQUIRED" | "RESTRICTED" | "NEEDS_REVIEW";
  message: string;
  sourceRef: string;
  isDemoRule: boolean;
  requiresHumanReview: boolean;
  scoreDeduction: number;
  recommendedAction?: string;
  suggestedSubstitute?: string;
}

export const COMPLIANCE_RULES: DeclarativeComplianceRule[] = [
  // 1. Food: Titanium Dioxide in EU
  {
    id: "RULE-EU-E171",
    substance: "Titanium Dioxide (E171)",
    keywords: ["titanium dioxide", "e171", "e-171"],
    productCategory: "Food",
    region: "EU_EFSA",
    jurisdiction: "European Union (EFSA)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "Banned as a food additive across the EU under Commission Regulation (EU) 2022/63 due to genotoxicity concerns.",
    sourceRef: "Regulation (EU) 2022/63 (Official Journal L 11/1)",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 60,
    recommendedAction: "Reformulate formulation to remove Titanium Dioxide.",
    suggestedSubstitute: "Calcium Carbonate (E170) or Rice Starch"
  },
  // 2. Food: Red 40 in EU
  {
    id: "RULE-EU-E129",
    substance: "Red 40 (Allura Red / E129)",
    keywords: ["red 40", "allura red", "e129", "fd&c red no. 40"],
    productCategory: "Food",
    region: "EU_EFSA",
    jurisdiction: "European Union (EFSA)",
    classification: "STATUTORY_WARNING",
    severity: "WARNING",
    status: "WARNING_REQUIRED",
    message: "Permitted but requires mandatory statutory label: 'May have an adverse effect on activity and attention in children.'",
    sourceRef: "Regulation (EC) No 1333/2008, Annex V",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 20,
    recommendedAction: "Apply mandatory packaging warning label or switch to natural coloring.",
    suggestedSubstitute: "Beetroot juice extract (E162) or Anthocyanins (E163)"
  },
  // 3. Food: Potassium Bromate in EU & India
  {
    id: "RULE-EU-E924",
    substance: "Potassium Bromate (E924)",
    keywords: ["potassium bromate", "e924"],
    productCategory: "Food",
    region: "EU_EFSA",
    jurisdiction: "European Union (EFSA)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "Prohibited food additive in the EU based on IARC classification as Group 2B carcinogen.",
    sourceRef: "EFSA Scientific Opinion / EU Directive 95/2/EC",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 60,
    recommendedAction: "Remove Potassium Bromate entirely from baking formulation.",
    suggestedSubstitute: "Ascorbic acid (Vitamin C) dough conditioner"
  },
  {
    id: "RULE-FSSAI-E924",
    substance: "Potassium Bromate",
    keywords: ["potassium bromate", "e924"],
    productCategory: "Food",
    region: "IN_FSSAI",
    jurisdiction: "India (FSSAI)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "Prohibited as a flour treatment agent by FSSAI since June 2016.",
    sourceRef: "FSSAI Notification No. 11/09/Reg/Harmoniztn/2014",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 50,
    recommendedAction: "Remove Potassium Bromate from Indian market SKU.",
    suggestedSubstitute: "Ascorbic acid or fungal enzymes"
  },
  // 4. Food: Potassium Bromate in US FDA (Restriction Limit / Missing Concentration)
  {
    id: "RULE-FDA-E924",
    substance: "Potassium Bromate (FDA Limits)",
    keywords: ["potassium bromate"],
    productCategory: "Food",
    region: "US_FDA",
    jurisdiction: "United States (US FDA)",
    classification: "RESTRICTION_LIMIT",
    severity: "MODERATE",
    status: "RESTRICTED",
    message: "Permitted in flour only up to 50 ppm (21 CFR 137.155). Exact dosage required for compliance verification.",
    sourceRef: "21 CFR 137.155 (illustrative demonstration limit)",
    isDemoRule: true,
    requiresHumanReview: true,
    scoreDeduction: 15,
    recommendedAction: "Verify analytical certificate of analysis confirms finished product residue < 50 ppm.",
    suggestedSubstitute: "Ascorbic acid"
  },
  // 5. Food: BVO in US FDA
  {
    id: "RULE-FDA-BVO",
    substance: "Brominated Vegetable Oil (BVO)",
    keywords: ["brominated vegetable oil", "bvo"],
    productCategory: "Food",
    region: "US_FDA",
    jurisdiction: "United States (US FDA)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "FDA revoked the regulation authorizing the use of BVO in food effective August 2024.",
    sourceRef: "89 FR 55044 (US FDA Final Rule 2024)",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 60,
    recommendedAction: "Reformulate beverage emulsion to eliminate BVO.",
    suggestedSubstitute: "Glycerol ester of wood rosin (ester gum)"
  },
  // 6. Cosmetics: Parabens in EU
  {
    id: "RULE-COS-EU-PARABEN",
    substance: "Propylparaben / Butylparaben",
    keywords: ["propylparaben", "butylparaben"],
    productCategory: "Cosmetics",
    region: "EU_EFSA",
    jurisdiction: "European Union (EU Cosmetics)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "Banned in leave-on cosmetic products designed for the diaper area of children under 3; restricted to max 0.14% in general cosmetics.",
    sourceRef: "Regulation (EU) No 358/2014 amending Regulation (EC) No 1223/2009",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 50,
    recommendedAction: "Replace long-chain parabens with preservative alternatives.",
    suggestedSubstitute: "Sodium benzoate, Potassium sorbate, or Phenoxyethanol"
  },
  // 7. Cosmetics: Formaldehyde releasers in EU
  {
    id: "RULE-COS-EU-FORMALDEHYDE",
    substance: "Formaldehyde / Formaldehyde Releasers",
    keywords: ["formaldehyde", "dmdm hydantoin", "quaternium-15", "imidazolidinyl urea"],
    productCategory: "Cosmetics",
    region: "EU_EFSA",
    jurisdiction: "European Union (EU Cosmetics)",
    classification: "CONFIGURED_VIOLATION",
    severity: "CRITICAL",
    status: "BANNED",
    message: "Prohibited under Annex II of EU Cosmetic Regulation (EC) No 1223/2009 in leave-on applications.",
    sourceRef: "Regulation (EC) No 1223/2009, Annex II Entry 1577",
    isDemoRule: false,
    requiresHumanReview: false,
    scoreDeduction: 60,
    recommendedAction: "Substitute formaldehyde-donor preservative systems.",
    suggestedSubstitute: "Ethylhexylglycerin or Benzyl alcohol"
  },
  // 8. Cosmetics: Propylparaben in US FDA (Needs concentration review)
  {
    id: "RULE-COS-FDA-PARABEN",
    substance: "Propylparaben (CIR Concentration Guideline)",
    keywords: ["propylparaben"],
    productCategory: "Cosmetics",
    region: "US_FDA",
    jurisdiction: "United States (FDA / CIR)",
    classification: "NEEDS_HUMAN_REVIEW",
    severity: "MODERATE",
    status: "RESTRICTED",
    message: "Cosmetic Ingredient Review (CIR) safe use threshold is < 0.8% total paraben concentration. Requires lab verification.",
    sourceRef: "CIR Safety Assessment (Illustrative Demo Guideline)",
    isDemoRule: true,
    requiresHumanReview: true,
    scoreDeduction: 15,
    recommendedAction: "Submit QA formulation batch assay confirming paraben concentration is below CIR limits."
  }
];
