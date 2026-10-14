# 🥗 NutriTrace — Compliance & Formulation Product Information Management (PIM)
> **Enterprise Regulatory Compliance, Formulation Audit, and Safety Triage System**  
> *Developed for the Kilowott Placement Hackathon*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-17%2F17%20Passing-success?logo=vitest)](https://vitest.dev/)
[![Design Patterns](https://img.shields.io/badge/Patterns-Strategy%20%7C%20Observer%20%7C%20Repository-purple)](#software-engineering-design-patterns)

---

## 📌 Executive Summary
**NutriTrace** is a **Product Information Management (PIM)** platform built for Food, Beverage, and Cosmetics enterprises. It serves as the single source of truth for product master formulations, cross-market regulatory auditing, Big 9 / EU 14 allergen classification, safety incident triage, and persistent compliance audit trails.

### 🌟 Core Capabilities
1. **Master Formulation Catalog & CRUD**: Full product master record management with SKU generation, shelf-life, batch numbers, dynamic allergen parsing, product creation, and **product formulation editing**.
2. **Strategy Pattern Compliance Auditing**: Multi-region compliance auditing against illustrative rules modeled on **US FDA (21 CFR)**, **EU EFSA (Regulation EC 1333/2008 & 1223/2009)**, and **India FSSAI**.
3. **Automated Allergen Extraction**: Big 9 and EU 14 allergen detection using word-boundary regex to prevent false positives (e.g. *butterfly pea flower* vs *butter*).
4. **Dynamic FDA Nutrition Facts Generator**: Realistic, standard regulatory nutrition panel visualizer with dynamic Daily Value calculations.
5. **Rule-Based Safety Triage Engine (`IncidentAgent`)**:
   - **Neutral Causation Phrasing**: Severe complaints are recorded with objective medical framing (*"Consumer reported an adverse reaction — urgent safety review required"*), avoiding premature legal claims of product causation.
   - **Provisional Batch Holds**: High-severity adverse events place affected batches on a reversible `PROVISIONAL_HOLD` status.
   - **Idempotent Deduplication**: Repeated consumer submissions for the same open batch and category increment an occurrence counter and append to the report timeline rather than creating duplicate open incidents or triggering redundant batch holds.
   - **Authorized Hold Release Workflow**: Authorized quality reviewers can release or clear a provisional hold by providing credentials and a mandatory review justification note.
6. **Persistent Audit Trail**: Comprehensive, persistent record of all catalog creations, edits, compliance checks, incident triages, deduplication increments, provisional holds, and hold releases stored in `localStorage` across page reloads.

---

## 🏛️ Software Engineering Design Patterns

| Design Pattern | Implementation Files | Architectural Purpose |
|---|---|---|
| **Strategy Pattern** | [`src/strategies/ComplianceStrategy.ts`](src/strategies/ComplianceStrategy.ts)<br>[`src/strategies/FoodValidator.ts`](src/strategies/FoodValidator.ts)<br>[`src/strategies/CosmeticsValidator.ts`](src/strategies/CosmeticsValidator.ts)<br>[`src/strategies/complianceRules.ts`](src/strategies/complianceRules.ts) | Decouples category-specific compliance checking so food and cosmetics use specialized regulatory rule engines driven by declarative rule definitions. |
| **Observer Pattern** | [`src/events/EventBus.ts`](src/events/EventBus.ts) | Decoupled Pub/Sub event bus. React components and service listeners subscribe to events (`BATCH_HOLD_APPLIED`, `BATCH_HOLD_RELEASED`, `PRODUCT_UPDATED`) and properly clean up on unmount. |
| **Repository Pattern** | [`src/repositories/LocalStorageRepository.ts`](src/repositories/LocalStorageRepository.ts) | Abstracts data persistence for products, incidents, and audit records with automatic seeding and graceful recovery from malformed or corrupted storage. |
| **Rule-Based Triage Agent** | [`src/agents/IncidentAgent.ts`](src/agents/IncidentAgent.ts) | Evaluates consumer feedback, assigns domain categories, applies neutral causation phrasing, triggers provisional holds, and deduplicates repeated reports. |

---

## 📂 Repository Structure
```
nutritrace/
├── PLANNING.md                        # Phase 1 planning & pitch video script
├── README.md                          # Project documentation & architecture
├── package.json                       # Dependencies & npm scripts
├── tsconfig.json                      # Strict TypeScript configuration
├── vite.config.ts                     # Vite bundler configuration
├── index.html                         # Entry HTML
└── src/
    ├── app/
    │   └── App.tsx                    # Main dashboard controller with EventBus observer subscriptions
    ├── components/
    │   ├── Sidebar.tsx                # Navigation, branding & status indicator
    │   ├── StatCard.tsx               # Reusable KPI metric card
    │   ├── ProductTable.tsx           # Catalog table with Edit and View Spec actions
    │   ├── EditProductModal.tsx       # Product formulation editing modal with validation
    │   ├── IncidentPanel.tsx          # Safety triage, deduplication drawer, and hold release modal
    │   └── AuditTrail.tsx             # Persistent audit trail table with filters and status transitions
    ├── domain/
    │   ├── product.ts                 # Product master entity & nutrition models
    │   ├── incident.ts                # Incident entity, category, report history & review decisions
    │   ├── audit.ts                   # Audit record schema & event types
    │   └── compliance.ts              # Compliance violation models & finding classifications
    ├── strategies/
    │   ├── ComplianceStrategy.ts      # Strategy interface
    │   ├── complianceRules.ts         # Declarative regulatory rules & citations
    │   ├── FoodValidator.ts           # Food & Beverage regulatory validator
    │   └── CosmeticsValidator.ts      # Cosmetics regulatory validator
    ├── agents/
    │   └── IncidentAgent.ts           # Rule-based safety triage & deduplication engine
    ├── events/
    │   └── EventBus.ts                # Observer Pattern pub/sub event bus
    ├── services/
    │   ├── ProductService.ts          # Product management & batch hold observer listeners
    │   ├── IncidentService.ts         # Incident logging, deduplication & hold release workflow
    │   └── ComplianceService.ts       # Strategy selector & allergen parser
    ├── repositories/
    │   └── LocalStorageRepository.ts  # Repository Pattern persistence & audit store
    ├── tests/
    │   ├── compliance.test.ts         # Strategy pattern & allergen unit tests
    │   ├── incident-agent.test.ts     # Triage & deduplication unit tests
    │   ├── provisional-hold-workflow.test.ts # End-to-end integration & audit tests
    │   └── all-features-e2e.test.ts   # Comprehensive master lifecycle integration test
    └── main.tsx                       # React DOM mount point
```

---

## 🧪 Unit & Integration Test Suite

The project includes 17 automated tests executed via **Vitest**:
- **Comprehensive Master Lifecycle**: Tests end-to-end flow combining Strategy auditing, EventBus observer notifications, IncidentAgent triage, idempotent deduplication, reversible hold releases, and audit records in one sequence.
- **Declarative Rule Validation**: Confirms EU bans Titanium Dioxide (E171) in food while US FDA permits it with limits.
- **Statutory Warning Trigger**: Validates that Red 40 triggers child hyperactivity warnings in Europe under Regulation (EC) No 1333/2008 Annex V.
- **Cosmetics Validator**: Ensures banned parabens in EU leave-on cosmetics are flagged.
- **False-Positive Allergen Prevention**: Verifies herbal ingredients like *butterfly pea flower* do not falsely trigger dairy (*butter*) warnings.
- **Deduplication & Idempotency**: Proves repeated complaint submissions for the same batch increment occurrence count without creating duplicate incident IDs or redundant batch hold events.
- **Neutral Causation Phrasing**: Verifies safety reports use objective language without asserting conclusive product failure.
- **Provisional Hold & Release Workflow**: Validates end-to-end lifecycle from complaint triage $\to$ provisional hold $\to$ authorized reviewer release with mandatory justification note.
- **Audit Trail Persistence**: Verifies all consequential state changes produce permanent audit records.
- **Storage Error Recovery**: Proves `LocalStorageRepository` gracefully handles malformed or corrupted JSON without crashing.

Run tests:
```bash
npm test
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` (or the port displayed in terminal) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🎥 Phase 2 Process Video Script (2-Minute Walkthrough)

> *"Hello judges, welcome to the Phase 2 execution walkthrough of **NutriTrace PIM**.*
> 
> * **Codebase Quality & Software Architecture**: 
>   * We organized the project into clean architectural layers: domain models, services, repositories, and UI components.
>   * We implemented the **Strategy Pattern** with `FoodValidator` and `CosmeticsValidator` driven by declarative rule definitions, allowing multi-region audits (FDA, EU EFSA, India FSSAI) without modifying core product entities.
>   * We implemented the **Repository Pattern** in `LocalStorageRepository` with automatic error recovery and persistent audit trail storage.
>   * We implemented the **Observer Pattern** with a typed `EventBus`, ensuring that React components and service listeners react seamlessly to batch holds and catalog updates.
> * **Product Master Catalog & Formulation Editing**:
>   * Users can create new formulations and edit existing product records. Any ingredient change immediately triggers compliance re-auditing and allergen re-parsing, with every modification permanently tracked in the **Audit Trail**.
> * **Safety Incident Triage & Deduplication**:
>   * In our **Incident & Safety Triage** module, when a consumer reports a suspected allergen cross-contact or foreign matter contamination, our rule-based `IncidentAgent` triages the report using neutral medical phrasing ('Consumer reported adverse reaction — urgent safety review required').
>   * The affected batch is automatically placed on a **Provisional Hold**.
>   * If another consumer submits a complaint for the same batch, our deduplication engine increments the occurrence count and appends to the report timeline rather than creating a duplicate incident.
>   * An authorized Quality Reviewer can inspect the batch and **Release the Hold** by providing reviewer credentials and a mandatory justification note, automatically restoring the catalog status and recording the decision in the audit trail.
> * **Verification**:
>   * We backed the application with 16 automated Vitest tests covering all patterns, deduplication, and hold workflows, all passing with a 100% success rate.
> * Thank you for your time!"*
