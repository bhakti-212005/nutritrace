# Phase 1: Planning Document - NutriTrace PIM
**Project**: NutriTrace — Enterprise Compliance & Formulation Product Information Management (PIM) System  
**Organization / Event**: Kilowott Placement Hackathon  
**Timeline**: 4 Hours (Phase 1: Planning | Phase 2: Execution | Phase 3: Submission)

---

## 1. Executive Summary & Problem Scope
Modern food, beverage, and cosmetics brands face fragmented and contradictory international regulatory standards:
- **Additive Banning**: Titanium Dioxide (E171) is banned in the European Union under Regulation (EU) 2022/63, but permitted by the US FDA.
- **Mandatory Warning Labels**: Synthetic dyes like Red 40 (Allura Red) require statutory child hyperactivity warning labels in Europe.
- **Allergen Contamination Risks**: Late-stage incident reports can cause costly recalls and brand damage if not prioritized instantaneously.

**NutriTrace** is an **Agentic AI-Powered Regulatory PIM** engineered to solve these challenges with automated cross-market compliance validation, allergen parsing, dynamic nutrition fact generation, and autonomous incident escalation.

---

## 2. System Architecture & Software Engineering Design Patterns
To achieve top scores across Kilowott's evaluation rubric, the solution is architected with strict adherence to classical software engineering design patterns:

```
┌────────────────────────────────────────────────────────┐
│                   NutriTrace React UI                  │
│       (Sidebar, StatCard, ProductTable, IncidentPanel) │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Service Layer                       │
│       - ProductService       - ComplianceService       │
└───────┬───────────────────┬───────────────────┬────────┘
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌───────▼────────┐
│Strategy Pattern│  │Observer Pattern│  │Repository Pat. │
│FoodValidator & │  │ GlobalEventBus │  │ LocalStorage   │
│CosmeticsValid. │  │ Pub / Sub      │  │ Repository     │
└───────┬────────┘  └───────┬────────┘  └───────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Agentic AI: IncidentAgent                │
│       Perceive ──> Reason ──> Plan ──> Dispatch        │
│  - Repeated Payment Gateway Failures ──> HIGH Priority │
│  - Acute Health / Allergen Hazards  ──> CRITICAL &     │
│    Autonomous Emergency Batch Quarantine               │
└────────────────────────────────────────────────────────┘
```

### Applied Design Patterns:
1. **Strategy Pattern (`src/strategies/`)**: Defines an interchangeable `ComplianceStrategy` contract with concrete implementations `FoodValidator` and `CosmeticsValidator`.
2. **Observer Pattern (`src/events/`)**: Implements `EventBus` pub/sub for decoupling incident escalations and automated batch quarantines.
3. **Repository Pattern (`src/repositories/`)**: Implements `LocalStorageRepository` to abstract data access and pre-seed canonical product formulations.
4. **Agentic ReAct Loop (`src/agents/`)**: `IncidentAgent` perceives raw complaint feedback, identifies hazard sentiment, reasons over severity, and autonomously executes actions.

---

## 3. Assumptions & Operational Boundaries
- **Regulatory Frameworks**: Modeled against US FDA 21 CFR, EU EFSA Regulation (EC) No 1333/2008 & 1223/2009, and India FSSAI.
- **Data Persistence**: Offline-first reactive local storage with zero cloud cold-starts.
- **Target Platforms**: Modern evergreen web browsers (Chrome, Edge, Firefox, Safari).

---

## 4. Phase 1 Video Recording Script (60–90 Seconds)
*(Record this video for Phase 1 submission)*:

> *"Hello judges, my name is [Your Name], and this is my Phase 1 Plan for the Kilowott Hackathon.*
> 
> * **Project Scope**: I am building **NutriTrace**, an enterprise Product Information Management (PIM) system for food, beverage, and cosmetics companies, powered by **Agentic AI**.*
> * **The Core Problem**: Cross-border brands face conflicting international regulations. For example, Titanium Dioxide is banned in the European Union but allowed by the FDA. Manual compliance is slow and leads to severe recall risks.*
> * **Architecture & Software Engineering Best Practices**:
>   * We apply the **Strategy Pattern** to separate Food vs Cosmetics compliance validations.
>   * We use the **Observer Pattern** with an EventBus to broadcast real-time quality alerts.
>   * We implement the **Repository Pattern** for reliable data persistence.
> * **Agentic AI Integration**: Our autonomous **IncidentAgent** analyzes incoming customer and retail complaints, escalates repeated payment failures to High Priority, and flags allergen health hazards as Critical with automated batch quarantines.
> * **Quality Standards**: The project is written in TypeScript, tested with comprehensive Vitest unit tests, and structured cleanly for GitHub publication.
> * I am now proceeding with Phase 2 execution to complete the implementation and verify all test suites. Thank you!"*
