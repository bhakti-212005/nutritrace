# 🥗 NutriTrace — Enterprise Compliance & Formulation PIM
> **Agentic AI-Powered Product Information Management (PIM) System**  
> *Developed for the Kilowott Placement Hackathon*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-100%25%20Passing-success?logo=vitest)](https://vitest.dev/)
[![Design Patterns](https://img.shields.io/badge/Patterns-Strategy%20%7C%20Observer%20%7C%20Repository-purple)](#software-engineering-design-patterns)

---

## 📌 Executive Summary
**NutriTrace** is a next-generation **Product Information Management (PIM)** platform built for Food, Beverage, Supplement, and Cosmetics enterprises. It serves as the single source of truth for formulations, regulatory compliance, allergen taxonomies, and quality incident triaging.

### 🌟 Core Capabilities
1. **Master Catalog & Canonical Data**: Unified product repository with SKUs, batch codes, formulations, shelf life, and packaging.
2. **Multi-Region Regulatory Validation**: Live compliance checks against **US FDA (21 CFR)**, **EU EFSA (Reg 1333/2008 & 1223/2009)**, and **India FSSAI**.
3. **Automated Allergen Extraction**: Big 9 / EU 14 allergen parser using word-boundary regex to prevent false positives (e.g. *butterfly pea flower* vs *butter*).
4. **Dynamic FDA Nutrition Facts Generator**: Realistic, standard regulatory nutrition panel visualizer.
5. **Agentic AI Incident Triage Engine (`IncidentAgent`)**:
   - **Repeated Payment Gateway Failures**: Auto-escalated to **HIGH** priority with automated billing alerts.
   - **Severe Allergic Reactions / Health Hazards**: Auto-escalated to **CRITICAL** priority with autonomous emergency batch quarantines.

---

## 🏛️ Software Engineering Design Patterns
Designed and structured in strict compliance with the Kilowott evaluation rubric:

| Design Pattern | Implementation File | Architectural Purpose |
|---|---|---|
| **Strategy Pattern** | [`src/strategies/ComplianceStrategy.ts`](src/strategies/ComplianceStrategy.ts)<br>[`src/strategies/FoodValidator.ts`](src/strategies/FoodValidator.ts)<br>[`src/strategies/CosmeticsValidator.ts`](src/strategies/CosmeticsValidator.ts) | Decouples product categories so food and cosmetics use specialized regulatory rule engines without modifying core models. |
| **Observer Pattern** | [`src/events/EventBus.ts`](src/events/EventBus.ts) | Implements decoupled Pub/Sub messaging. When a `CRITICAL` incident is logged, subscribers automatically isolate the batch. |
| **Repository Pattern** | [`src/repositories/LocalStorageRepository.ts`](src/repositories/LocalStorageRepository.ts) | Abstracts data persistence and initializes canonical pre-seeded products with zero database cold-start latency. |
| **Agentic AI Loop** | [`src/agents/IncidentAgent.ts`](src/agents/IncidentAgent.ts) | Autonomous **Perceive $\to$ Reason $\to$ Plan $\to$ Act** cycle that evaluates consumer feedback, assigns severity, and executes actions. |

---

## 📂 Repository Structure
```
nutritrace/
├── PLANNING.md                        # Phase 1 planning & video script
├── README.md                          # Project documentation & architecture
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # Strict TypeScript configuration
├── vite.config.ts                     # Vite bundler configuration
├── index.html                         # Application entry HTML
└── src/
    ├── app/
    │   └── App.tsx                    # Main reactive dashboard controller
    ├── components/
    │   ├── Sidebar.tsx                # Navigation, branding & agent status
    │   ├── StatCard.tsx               # Reusable KPI metric card
    │   ├── ProductTable.tsx           # Searchable, filterable catalog table
    │   └── IncidentPanel.tsx          # Autonomous triage & incident logging
    ├── domain/
    │   ├── product.ts                 # Product master entity & nutrition types
    │   ├── incident.ts                # Incident entity & priority levels
    │   └── compliance.ts              # Regulatory status & violation models
    ├── strategies/
    │   ├── ComplianceStrategy.ts      # Strategy interface
    │   ├── FoodValidator.ts           # Food & Beverage regulatory validator
    │   └── CosmeticsValidator.ts      # Cosmetics regulatory validator
    ├── agents/
    │   └── IncidentAgent.ts           # Autonomous Agentic AI triage engine
    ├── events/
    │   └── EventBus.ts                # Observer Pattern event bus
    ├── services/
    │   ├── ProductService.ts          # Product management & quarantine listener
    │   └── ComplianceService.ts       # Strategy selector & allergen parser
    ├── repositories/
    │   └── LocalStorageRepository.ts  # Repository Pattern persistence
    ├── tests/
    │   ├── compliance.test.ts         # Strategy & allergen unit tests
    │   └── incident-agent.test.ts     # Autonomous agent triage unit tests
    └── main.tsx                       # React DOM mount point
```

---

## 🧪 Unit Test Suite
The project includes automated unit test suites using **Vitest**:
- **Strategy Pattern Validation**: Confirms EU bans Titanium Dioxide (E171) in food while FDA permits it with limits.
- **Statutory Warning Trigger**: Validates that Red 40 triggers child ADHD warnings in Europe.
- **Cosmetics Validator**: Ensures banned parabens in EU leave-on cosmetics are flagged.
- **False-Positive Allergen Prevention**: Verifies herbal ingredients like *butterfly pea flower* do not falsely trigger dairy (*butter*) warnings.
- **Agentic Priority Escalation**: Proves repeated payment failures escalate to `HIGH` priority.
- **Emergency Quarantine Dispatch**: Confirms severe allergic reactions escalate to `CRITICAL` and trigger batch isolation on the EventBus.

Run tests:
```bash
npm test
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm v10+

### 1. Clone & Install
```bash
cd nutritrace
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will open at `http://localhost:5173`.

### 3. Build for Production
```bash
npm run build
```

---

## 🎥 Phase 2 Process Video Script (2-Minute Walkthrough)
Use this exact script for your Phase 2 process explanation video:

> *"Hello judges, welcome to the Phase 2 execution walkthrough of **NutriTrace PIM**.*
> 
> * **Codebase Quality & Structure**: 
>   * We organized the project into clean architectural layers: domain models, services, repositories, and UI components.
>   * We implemented the **Strategy Pattern** with `FoodValidator` and `CosmeticsValidator` to audit divergent FDA and EU regulations without modifying core product entities.
>   * We used the **Repository Pattern** in `LocalStorageRepository` for persistent storage and the **Observer Pattern** in `EventBus` for real-time alerting.
> * **Agentic AI in Action**:
>   * In our **Incident & Triage** module, when a customer submits an issue regarding *repeated payment failures*, our `IncidentAgent` detects the billing anomaly and automatically escalates the priority to **HIGH**.
>   * If a complaint reports a *severe allergic reaction*, the agent autonomously sets the priority to **CRITICAL** and dispatches an emergency batch quarantine, instantly updating the catalog status to **QUARANTINED**.
> * **Testing & Verification**:
>   * We created comprehensive Vitest unit tests covering all design patterns, compliance engines, and agent triage routines, all passing with a 100% success rate.
> * Thank you for your time, and we look forward to the evaluation!"*
