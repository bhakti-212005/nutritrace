# Phase 1: Planning Document - NutriTrace PIM
**Project**: NutriTrace — Compliance & Formulation Product Information Management (PIM) System  
**Organization / Event**: Kilowott Placement Hackathon  
**Target Domain**: Food, Beverage, and Cosmetics Manufacturing Enterprises

---

## 1. Executive Summary & Problem Scope
Consumer packaged goods (CPG) brands face fragmented and contradictory international regulatory standards:
- **Additive Restrictions**: Titanium Dioxide (E171) is prohibited in the European Union under Regulation (EU) 2022/63 due to genotoxicity concerns, but permitted in food by the US FDA (21 CFR 73.575) and India FSSAI.
- **Mandatory Warning Labels**: Synthetic dyes like Red 40 (Allura Red) require statutory child hyperactivity warning labels in Europe under Regulation (EC) No 1333/2008 Annex V.
- **Consumer Safety Incident Triaging**: Late-stage consumer complaints regarding suspected allergen cross-contact or foreign matter require immediate provisional containment without asserting unverified legal causation prior to lab assays.

**NutriTrace** is a **Compliance-Focused Product Information Management (PIM)** platform engineered to provide:
1. Master catalog formulation management with product creation and editing.
2. Declarative cross-market compliance auditing using the Strategy Pattern.
3. Automated Big 9 and EU 14 allergen parsing with word-boundary false-positive prevention.
4. Rule-based incident triage with idempotent deduplication and neutral causality language.
5. Reversible provisional batch holds with authorized reviewer justification and persistent audit logging.

---

## 2. System Architecture & Software Engineering Design Patterns

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NutriTrace React UI                           │
│  (Catalog, Formulation Auditor, Incident Panel, Audit Trail, Matrix)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                             Service Layer                              │
│       - ProductService       - ComplianceService    - IncidentService  │
└───────┬───────────────────────────┬───────────────────────────┬────────┘
        │                           │                           │
┌───────▼────────┐          ┌───────▼────────┐          ┌───────▼────────┐
│Strategy Pattern│          │Observer Pattern│          │Repository Pat. │
│FoodValidator & │          │ GlobalEventBus │          │ LocalStorage   │
│CosmeticsValid. │          │ Pub / Sub      │          │ Repository     │
│(Declarative)   │          │ (Clean unsubs) │          │ (Audit Persist)│
└───────┬────────┘          └───────┬────────┘          └───────┬────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    IncidentAgent (Rule-Based Triage)                   │
│   Classify Category ──> Stable Matching Deduplication ──> Plan & Act │
│   - Severe Adverse Reactions  ──> CRITICAL & Provisional Batch Hold   │
│   - Packaging Label Mismatches ──> HIGH Priority Inspection            │
│   - Repeated Quality Reports   ──> Occurrence Count + 1 & Escalation   │
└────────────────────────────────────────────────────────────────────────┘
```

### Applied Design Patterns:
1. **Strategy Pattern (`src/strategies/`)**: Defines interchangeable `ComplianceStrategy` implementations (`FoodValidator` and `CosmeticsValidator`) driven by declarative rule definitions in `complianceRules.ts`.
2. **Observer Pattern (`src/events/`)**: Implements `EventBus` pub/sub with typed events (`BATCH_HOLD_APPLIED`, `BATCH_HOLD_RELEASED`, `PRODUCT_UPDATED`, etc.) and leak-free subscription cleanup.
3. **Repository Pattern (`src/repositories/`)**: Implements `LocalStorageRepository` to abstract data access, provide fallback recovery on malformed data, and persist immutable audit trail records across reloads.
4. **Safety Triage & Deduplication Engine (`src/agents/`)**: Evaluates incoming reports, applies neutral medical phrasing ("Consumer reported an adverse reaction — urgent safety review required"), places batches on provisional hold, and suppresses duplicate incident IDs.

---

## 3. Assumptions & Operational Boundaries
- **Regulatory Frameworks**: Evaluated against illustrative rules derived from US FDA (21 CFR), EU EFSA (Regulation EC 1333/2008 & 1223/2009), and India FSSAI. Rules are clearly marked as demonstrative guidelines and do not claim live statutory database feeds.
- **Data Persistence**: Offline-first reactive local storage with zero cloud cold-starts.
- **Target Platforms**: Modern evergreen web browsers (Chrome, Edge, Firefox, Safari).

---

## 4. Phase 1 Video Pitch Script (60–90 Seconds)

> *"Hello judges, my name is [Your Name], and this is my Phase 1 Plan for the Kilowott Hackathon.*
> 
> * **Project Scope**: I am building **NutriTrace**, an enterprise Product Information Management (PIM) system for food, beverage, and cosmetics companies, designed to audit cross-market compliance and triage product safety incidents.*
> * **The Core Problem**: International food and cosmetics brands face conflicting statutory standards. Titanium Dioxide is banned in the EU but permitted by the FDA. When consumer complaints occur, teams often struggle to isolate affected batches without jumping to unverified causation claims.*
> * **Architecture & Software Engineering Design Patterns**:
>   * We apply the **Strategy Pattern** to separate Food and Cosmetics regulatory validators using declarative rule definitions.
>   * We use the **Observer Pattern** with a typed EventBus to broadcast real-time safety holds and updates across the application.
>   * We implement the **Repository Pattern** with persistent audit trail logging and corrupted-storage recovery.
> * **Safety Incident Triage & Deduplication**:
>   * Our rule-based **IncidentAgent** detects severe adverse reactions, applies neutral phrasing ('Consumer reported adverse reaction — urgent review required'), and places batches under a provisional hold.
>   * Repeated submissions for the same batch are automatically deduplicated into an occurrence timeline rather than creating duplicate hold events.
>   * Authorized reviewers can release holds with mandatory review notes, recorded permanently in the audit trail.
> * **Verification**: The project is written in strict TypeScript, validated with 16 automated Vitest unit and integration tests, and compiles cleanly with Vite.*
> * Thank you, and I look forward to presenting the live demo!"*
