import React, { useState, useEffect } from "react";
import { Sidebar, TabId } from "../components/Sidebar";
import { StatCard } from "../components/StatCard";
import { ProductTable } from "../components/ProductTable";
import { IncidentPanel } from "../components/IncidentPanel";
import { AuditTrail } from "../components/AuditTrail";
import { EditProductModal } from "../components/EditProductModal";
import { Product } from "../domain/product";
import { Incident } from "../domain/incident";
import { AuditRecord } from "../domain/audit";
import { ComplianceViolation } from "../domain/compliance";
import { productService } from "../services/ProductService";
import { incidentService } from "../services/IncidentService";
import { repository } from "../repositories/LocalStorageRepository";
import { complianceService } from "../services/ComplianceService";
import { globalEventBus } from "../events/EventBus";
import { 
  Plus, X, Printer, Bot, AlertTriangle, ShieldCheck, 
  Package, ShieldAlert, ArrowRight, ArrowUpRight, Eye, Edit3, History, Globe
} from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Formulation Auditor State
  const [auditorInput, setAuditorInput] = useState("");
  const [auditorResult, setAuditorResult] = useState<{
    tokens: string[];
    allergens: any[];
    audit: any;
    violations: ComplianceViolation[];
  } | null>(null);

  // Create Product Form State
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<any>("Beverage");
  const [newProdBrand, setNewProdBrand] = useState("Vitalize Organics");
  const [newProdIngredients, setNewProdIngredients] = useState("Water, Almond milk, Raw agave, Cinnamon");
  const [createError, setCreateError] = useState<string | null>(null);

  const refreshData = () => {
    setProducts(productService.getAllProducts());
    setIncidents(incidentService.getAllIncidents());
    setAuditRecords(repository.getAuditRecords());
  };

  // OBSERVER PATTERN: Subscribe to EventBus with proper cleanup
  useEffect(() => {
    refreshData();

    const unsubs = [
      globalEventBus.subscribe("PRODUCT_CREATED", () => refreshData()),
      globalEventBus.subscribe("PRODUCT_UPDATED", () => refreshData()),
      globalEventBus.subscribe("INCIDENT_TRIAGED", () => refreshData()),
      globalEventBus.subscribe("INCIDENT_RECURRENCE_RECORDED", () => refreshData()),
      globalEventBus.subscribe("BATCH_HOLD_APPLIED", () => refreshData()),
      globalEventBus.subscribe("BATCH_HOLD_RELEASED", () => refreshData()),
      globalEventBus.subscribe("BATCH_QUARANTINED", () => refreshData())
    ];

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      setCreateError("Product name is required.");
      return;
    }

    try {
      const ingList = newProdIngredients.split(",").map(i => i.trim()).filter(Boolean);
      const created = productService.createProduct({
        name: newProdName,
        category: newProdCategory,
        brand: newProdBrand,
        ingredients: ingList
      });

      setIsCreateOpen(false);
      setNewProdName("");
      setCreateError(null);
      setSelectedProduct(created);
    } catch (err: any) {
      setCreateError(err.message || "Failed to create product formulation.");
    }
  };

  const handleUpdateProduct = (id: string, updates: any) => {
    productService.updateProduct(id, updates);
  };

  const handleIncidentSubmit = (input: { batchNumber: string; title: string; description: string; reportedBy: string }) => {
    incidentService.logIncident(input);
  };

  const handleReleaseHold = (batchNumber: string, review: { reviewer: string; decisionNote: string }) => {
    incidentService.releaseBatchHold(batchNumber, review);
  };

  const runAgentAudit = () => {
    if (!auditorInput.trim()) return;
    const tokens = auditorInput.split(",").map(t => t.trim()).filter(Boolean);
    const allergens = complianceService.extractAllergens(tokens);
    const audit = complianceService.audit("Food", tokens);
    const violations = complianceService.getViolationsList(audit);

    setAuditorResult({
      tokens,
      allergens,
      audit,
      violations
    });
  };

  // KPIs
  const totalProducts = products.length;
  const compliantCount = products.filter(p => p.status === "APPROVED").length;
  const compliantPercent = totalProducts > 0 ? Math.round((compliantCount / totalProducts) * 100) : 0;
  const flaggedCount = products.filter(p => p.status === "REVIEW_REQUIRED").length;
  const heldCount = products.filter(p => p.status === "PROVISIONAL_HOLD" || p.status === "QUARANTINED").length;

  // Products needing attention (Review required or Provisional hold)
  const productsNeedingAttention = products.filter(
    p => p.status === "REVIEW_REQUIRED" || p.status === "PROVISIONAL_HOLD"
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0b0f19", color: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        incidentCount={incidents.filter(i => i.priority === "CRITICAL" || i.priority === "HIGH").length}
      />

      <main style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxWidth: "1380px" }}>
        {/* Topbar Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#f8fafc", letterSpacing: "-0.2px" }}>
              {activeTab === "overview" && "Overview"}
              {activeTab === "catalog" && "Product Catalog"}
              {activeTab === "auditor" && "Compliance Auditor"}
              {activeTab === "incidents" && "Incident & Safety Triage"}
              {activeTab === "audit" && "Audit Trail"}
              {activeTab === "regulations" && "Regulatory Matrix"}
            </h2>
            <p style={{ fontSize: "12.5px", color: "#64748b", margin: "3px 0 0 0" }}>
              {activeTab === "overview" && "Monitor products, compliance, and quality incidents."}
              {activeTab === "catalog" && "Search, filter, and manage master formulations."}
              {activeTab === "auditor" && "Test ingredient formulations against EU, FDA, and FSSAI rules."}
              {activeTab === "incidents" && "Review consumer safety feedback and manage provisional batch holds."}
              {activeTab === "audit" && "Immutable log of catalog changes, hold applications, and reviewer decisions."}
              {activeTab === "regulations" && "Codified ingredient restriction standards across major jurisdictions."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("auditor")}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#cbd5e1",
                padding: "7px 12px",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "background 150ms ease"
              }}
            >
              <Bot size={14} color="#818cf8" /> Quick Compliance Audit
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              style={{
                background: "#4f46e5",
                border: "none",
                color: "#fff",
                padding: "7px 14px",
                borderRadius: "7px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "background 150ms ease"
              }}
            >
              <Plus size={15} /> New Product
            </button>
          </div>
        </div>

        {/* Compact Summary Metrics Bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          <StatCard
            title="Active Products"
            value={totalProducts}
            subtitle="In master catalog"
            icon={<Package size={15} />}
            statusColor="default"
          />
          <StatCard
            title="Compliance Rate"
            value={`${compliantPercent}%`}
            subtitle="Passing all configured rules"
            icon={<ShieldCheck size={15} />}
            statusColor="success"
          />
          <StatCard
            title="Review Required"
            value={flaggedCount}
            subtitle="Label or concentration check"
            icon={<AlertTriangle size={15} />}
            statusColor={flaggedCount > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Active Safety Holds"
            value={heldCount}
            subtitle="Provisional hold active"
            icon={<ShieldAlert size={15} />}
            statusColor={heldCount > 0 ? "danger" : "default"}
          />
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Jurisdictional Compliance & Harmonization Overview */}
            <div style={{
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "10px",
              padding: "18px 22px",
              display: "grid",
              gridTemplateColumns: "1.4fr 0.9fr",
              gap: "24px",
              alignItems: "center"
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <Globe size={16} color="#818cf8" />
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                    Multi-Jurisdictional Regulatory Alignment
                  </h3>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "#a5b4fc"
                  }}>
                    US / EU / IN
                  </span>
                </div>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 16px 0", lineHeight: "1.4" }}>
                  Real-time validation of active master formulations against regional statutory directives. Formulations compliant under FDA may require packaging warnings or ingredient reformulations under EU EFSA standards.
                </p>

                {/* Progress Bars for Regions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                      <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                        <strong style={{ color: "#34d399" }}>US FDA</strong> (21 CFR Parts 101 & 700)
                      </span>
                      <span style={{ color: "#34d399", fontWeight: 700 }}>100% Compliant (4/4 Products)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "100%", height: "100%", background: "#10b981", borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                      <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                        <strong style={{ color: "#38bdf8" }}>India FSSAI</strong> (FSS Packaging & Labelling 2020)
                      </span>
                      <span style={{ color: "#38bdf8", fontWeight: 700 }}>75% Compliant (3/4 Products)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "75%", height: "100%", background: "#0284c7", borderRadius: "3px" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", marginBottom: "4px" }}>
                      <span style={{ color: "#cbd5e1", fontWeight: 500 }}>
                        <strong style={{ color: "#fbbf24" }}>EU EFSA</strong> (Reg 1333/2008 & 2022/63 E171 Ban)
                      </span>
                      <span style={{ color: "#fbbf24", fontWeight: 700 }}>50% Advisory Needed (2/4 Products)</span>
                    </div>
                    <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: "50%", height: "100%", background: "#f59e0b", borderRadius: "3px" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Circular Gauge / Harmonization Index */}
              <div style={{
                background: "rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center"
              }}>
                <div style={{ position: "relative", width: "90px", height: "90px", marginBottom: "8px" }}>
                  <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#818cf8"
                      strokeWidth="8"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - 0.75)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{ fontSize: "19px", fontWeight: 800, color: "#f8fafc" }}>75%</span>
                    <span style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>GLOBAL</span>
                  </div>
                </div>

                <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#cbd5e1", marginBottom: "3px" }}>
                  Harmonized Export Readiness
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "10px" }}>
                  2 formulations need EU packaging label update
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => setActiveTab("auditor")}
                    style={{
                      background: "rgba(99, 102, 241, 0.12)",
                      border: "1px solid rgba(99, 102, 241, 0.25)",
                      color: "#c7d2fe",
                      padding: "4px 8px",
                      borderRadius: "5px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Test Formulation
                  </button>
                  <button
                    onClick={() => setActiveTab("regulations")}
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      padding: "4px 8px",
                      borderRadius: "5px",
                      fontSize: "11px",
                      cursor: "pointer"
                    }}
                  >
                    View Rules
                  </button>
                </div>
              </div>
            </div>

            {/* Two-Column Operations Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "18px" }}>
              {/* Left Column: Products Needing Attention */}
              <div style={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                      Products Needing Attention ({productsNeedingAttention.length})
                    </h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Formulations requiring packaging adjustments or safety holds
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("catalog")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#818cf8",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px"
                    }}
                  >
                    View catalog <ArrowRight size={12} />
                  </button>
                </div>

                {productsNeedingAttention.length === 0 ? (
                  <div style={{ padding: "28px", textAlign: "center", color: "#64748b", fontSize: "12.5px" }}>
                    <ShieldCheck size={28} color="#10b981" style={{ margin: "0 auto 8px", display: "block" }} />
                    All catalog formulations meet configured compliance standards.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {productsNeedingAttention.map(p => {
                      const isHeld = p.status === "PROVISIONAL_HOLD" || p.status === "QUARANTINED";
                      let reasonNote = "Requires statutory label check or concentration verification.";
                      if (p.ingredients.some(i => i.toLowerCase().includes("red 40"))) {
                        reasonNote = "EU statutory child hyperactivity advisory label required on packaging.";
                      } else if (p.ingredients.some(i => i.toLowerCase().includes("titanium dioxide"))) {
                        reasonNote = "Titanium Dioxide (E171) prohibited in EU under Regulation 2022/63.";
                      } else if (p.ingredients.some(i => i.toLowerCase().includes("propylparaben"))) {
                        reasonNote = "Propylparaben restricted in EU leave-on cosmetics.";
                      } else if (isHeld) {
                        reasonNote = "Provisional safety hold active pending laboratory investigation.";
                      }

                      return (
                        <div
                          key={p.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>{p.name}</span>
                              <span style={{
                                fontSize: "9.5px",
                                fontWeight: 600,
                                padding: "1px 6px",
                                borderRadius: "4px",
                                background: isHeld ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.15)",
                                color: isHeld ? "#f43f5e" : "#fbbf24"
                              }}>
                                {p.status.replace("_", " ")}
                              </span>
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              SKU: {p.sku} | Batch: {p.batchNumber} — {reasonNote}
                            </div>
                          </div>

                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              onClick={() => setEditingProduct(p)}
                              style={{
                                background: "transparent",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#cbd5e1",
                                padding: "4px 8px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                            >
                              <Edit3 size={11} /> Edit
                            </button>
                            <button
                              onClick={() => setSelectedProduct(p)}
                              style={{
                                background: "rgba(99, 102, 241, 0.08)",
                                border: "1px solid rgba(99, 102, 241, 0.2)",
                                color: "#c7d2fe",
                                padding: "4px 8px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px"
                              }}
                            >
                              <Eye size={11} /> Spec
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Recent Safety Incidents */}
              <div style={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                      Recent Safety Incidents ({incidents.length})
                    </h3>
                    <span style={{ fontSize: "11px", color: "#64748b" }}>
                      Triaged reports and batch containment status
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab("incidents")}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#818cf8",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "3px"
                    }}
                  >
                    Open triage <ArrowRight size={12} />
                  </button>
                </div>

                {incidents.length === 0 ? (
                  <div style={{ padding: "28px", textAlign: "center", color: "#64748b", fontSize: "12.5px" }}>
                    No safety incidents logged.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {incidents.slice(0, 4).map(inc => {
                      const isCritical = inc.priority === "CRITICAL";
                      return (
                        <div
                          key={inc.id}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.05)",
                            borderRadius: "8px",
                            padding: "10px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{
                                fontSize: "9.5px",
                                fontWeight: 700,
                                padding: "1px 5px",
                                borderRadius: "3px",
                                background: isCritical ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.15)",
                                color: isCritical ? "#f43f5e" : "#fbbf24"
                              }}>
                                {inc.priority}
                              </span>
                              <strong style={{ fontSize: "12.5px", color: "#f8fafc" }}>{inc.title}</strong>
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                              Batch: {inc.batchNumber} | Action: {inc.autoAction}
                            </div>
                          </div>

                          <div>
                            <span style={{
                              fontSize: "10px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "9999px",
                              background: inc.status === "RESOLVED" ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.15)",
                              color: inc.status === "RESOLVED" ? "#34d399" : "#f43f5e"
                            }}>
                              {inc.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Section: Recent Audit Trail Activity */}
            <div style={{
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "10px",
              padding: "18px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                    Recent Compliance & Audit Events
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Latest persistent state transitions across formulations and batches
                  </span>
                </div>
                <button
                  onClick={() => setActiveTab("audit")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#818cf8",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px"
                  }}
                >
                  Full audit trail <ArrowRight size={12} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {auditRecords.slice(0, 4).map(rec => (
                  <div
                    key={rec.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(255,255,255,0.015)",
                      borderRadius: "6px",
                      fontSize: "12px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{
                        fontSize: "9.5px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: "rgba(255,255,255,0.05)",
                        color: "#94a3b8"
                      }}>
                        {rec.eventType}
                      </span>
                      <span style={{ color: "#f8fafc", fontWeight: 500 }}>{rec.action}</span>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>({rec.reason})</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", color: "#64748b" }}>
                      <span>Actor: {rec.actor}</span>
                      <span style={{ fontFamily: "JetBrains Mono, monospace" }}>
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT CATALOG */}
        {activeTab === "catalog" && (
          <ProductTable
            products={products}
            onSelectProduct={setSelectedProduct}
            onEditProduct={setEditingProduct}
          />
        )}

        {/* TAB 3: FORMULATION AUDITOR */}
        {activeTab === "auditor" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 6px 0", color: "#f8fafc" }}>
                Formulation Analysis Input
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 14px 0" }}>
                Test any ingredient formulation against codified US FDA, EU EFSA, and India FSSAI standards.
              </p>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setAuditorInput("Water, Glycerin, Titanium Dioxide, Propylparaben, Squalane")}
                  style={{ fontSize: "11px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", padding: "4px 8px", borderRadius: "5px", cursor: "pointer" }}
                >
                  Titanium Dioxide (EU Banned)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditorInput("Carbonated water, Cane sugar, Citric acid, Red 40, Flavor")}
                  style={{ fontSize: "11px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", padding: "4px 8px", borderRadius: "5px", cursor: "pointer" }}
                >
                  Red 40 (EU Warning)
                </button>
                <button
                  type="button"
                  onClick={() => setAuditorInput("Organic oats, Almond butter, Honey, Pea protein, Chia seeds")}
                  style={{ fontSize: "11px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "#cbd5e1", padding: "4px 8px", borderRadius: "5px", cursor: "pointer" }}
                >
                  Clean Oat Shake (Compliant)
                </button>
              </div>

              <textarea
                rows={5}
                value={auditorInput}
                onChange={(e) => setAuditorInput(e.target.value)}
                placeholder="e.g. Water, Cane sugar, Titanium Dioxide, Soy lecithin, Red 40..."
                style={{ width: "100%", padding: "10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px", marginBottom: "12px" }}
              />

              <button
                onClick={runAgentAudit}
                style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "8px 16px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, cursor: "pointer" }}
              >
                Execute Compliance Audit
              </button>
            </div>

            <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 12px 0", color: "#f8fafc" }}>
                Compliance Findings & Recommendations
              </h3>

              {auditorResult ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <span style={{ fontSize: "12.5px", color: "#94a3b8" }}>Calculated Score:</span>
                    <span style={{ fontSize: "18px", fontWeight: 700, color: auditorResult.audit.isGloballyCompliant ? "#34d399" : "#fbbf24" }}>
                      {auditorResult.audit.averageScore} / 100
                    </span>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <span style={{ fontSize: "11px", color: "#64748b", display: "block", marginBottom: "4px" }}>DETECTED ALLERGENS:</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {auditorResult.allergens.length > 0 ? (
                        auditorResult.allergens.map((a: any) => (
                          <span key={a.id} style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: "4px", color: "#cbd5e1" }}>
                            {a.icon} {a.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: "11px", color: "#475569" }}>None detected</span>
                      )}
                    </div>
                  </div>

                  {auditorResult.violations.length > 0 ? (
                    <div>
                      <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                        FINDINGS ({auditorResult.violations.length}):
                      </span>
                      {auditorResult.violations.map((v, idx) => (
                        <div key={v.ruleId || idx} style={{
                          background: v.severity === "CRITICAL" ? "rgba(244,63,94,0.06)" : "rgba(245,158,11,0.06)",
                          borderLeft: `3px solid ${v.severity === "CRITICAL" ? "#f43f5e" : "#f59e0b"}`,
                          padding: "8px 10px",
                          borderRadius: "0 6px 6px 0",
                          marginBottom: "8px",
                          fontSize: "12px"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <strong style={{ color: "#f8fafc" }}>{v.substance}</strong>
                            <span style={{ fontSize: "10px", color: "#818cf8" }}>{v.jurisdiction}</span>
                          </div>
                          <p style={{ color: "#cbd5e1", margin: "2px 0" }}>{v.message}</p>
                          {v.suggestedSubstitute && (
                            <p style={{ color: "#34d399", fontSize: "11px", margin: "2px 0" }}>
                              Substitute: <strong>{v.suggestedSubstitute}</strong>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: "rgba(16,185,129,0.08)", color: "#34d399", padding: "10px", borderRadius: "6px", fontSize: "12px" }}>
                      No prohibited additives or restricted substances detected.
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#64748b", fontSize: "12px" }}>
                  Run an audit on the left to inspect regional findings.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: INCIDENT & SAFETY TRIAGE */}
        {activeTab === "incidents" && (
          <IncidentPanel
            incidents={incidents}
            onSubmitIncident={handleIncidentSubmit}
            onReleaseHold={handleReleaseHold}
          />
        )}

        {/* TAB 5: AUDIT TRAIL */}
        {activeTab === "audit" && (
          <AuditTrail records={auditRecords} />
        )}

        {/* TAB 6: REGULATORY MATRIX */}
        {activeTab === "regulations" && (
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                  Codified Multi-Region Regulatory Matrix
                </h3>
                <p style={{ fontSize: "12px", color: "#64748b", margin: "3px 0 0 0" }}>
                  Declarative rules modeling US FDA, European Union EFSA, and India FSSAI guidelines.
                </p>
              </div>
              <span style={{ fontSize: "10.5px", color: "#94a3b8", background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: "5px" }}>
                Illustrative Rules
              </span>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#64748b" }}>
                  <th style={{ padding: "8px 10px" }}>SUBSTANCE / CATEGORY</th>
                  <th style={{ padding: "8px 10px" }}>US FDA</th>
                  <th style={{ padding: "8px 10px" }}>EU EFSA</th>
                  <th style={{ padding: "8px 10px" }}>INDIA FSSAI</th>
                  <th style={{ padding: "8px 10px" }}>CITATION</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600, color: "#f8fafc" }}>Titanium Dioxide (E171) [Food]</td>
                  <td style={{ padding: "10px", color: "#34d399" }}>Permitted (&lt; 1%)</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned (Genotoxicity)</td>
                  <td style={{ padding: "10px", color: "#34d399" }}>Permitted in confections</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#94a3b8" }}>Regulation (EU) 2022/63</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600, color: "#f8fafc" }}>Potassium Bromate (E924) [Food]</td>
                  <td style={{ padding: "10px", color: "#fbbf24" }}>Restricted (&lt; 50 ppm)</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned (Carcinogen)</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned since 2016</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#94a3b8" }}>21 CFR 137.155 / FSSAI 2016</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600, color: "#f8fafc" }}>Red 40 (Allura Red / E129) [Food]</td>
                  <td style={{ padding: "10px", color: "#34d399" }}>Certified Food Color</td>
                  <td style={{ padding: "10px", color: "#fbbf24" }}>Warning Required (ADHD)</td>
                  <td style={{ padding: "10px", color: "#34d399" }}>Permitted (&lt; 100 ppm)</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#94a3b8" }}>Reg (EC) No 1333/2008 Annex V</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600, color: "#f8fafc" }}>Brominated Vegetable Oil (BVO) [Food]</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned (Revoked 2024)</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#94a3b8" }}>89 FR 55044 (FDA 2024 Final Rule)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "10px", fontWeight: 600, color: "#f8fafc" }}>Propylparaben / Butylparaben [Cosmetics]</td>
                  <td style={{ padding: "10px", color: "#fbbf24" }}>CIR Threshold &lt; 0.8%</td>
                  <td style={{ padding: "10px", color: "#f43f5e" }}>Banned in leave-on (&lt;3 yrs)</td>
                  <td style={{ padding: "10px", color: "#34d399" }}>Standard Preservative</td>
                  <td style={{ padding: "10px", fontSize: "11px", color: "#94a3b8" }}>Regulation (EU) No 358/2014</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DETAIL MODAL WITH FDA NUTRITION FACTS LABEL */}
      {selectedProduct && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto", padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#818cf8" }}>{selectedProduct.sku}</span>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "2px 0 0 0" }}>{selectedProduct.name}</h3>
              </div>
              <button onClick={() => setSelectedProduct(null)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
              <div>
                <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "14px" }}>{selectedProduct.description}</p>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block" }}>INGREDIENTS:</span>
                  <p style={{ fontSize: "12.5px", color: "#cbd5e1", margin: "2px 0 0 0" }}>{selectedProduct.ingredients.join(", ")}</p>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block" }}>BATCH & EXPIRY:</span>
                  <p style={{ fontSize: "12.5px", color: "#cbd5e1", margin: "2px 0 0 0" }}>Batch: {selectedProduct.batchNumber} | Shelf Life: {selectedProduct.shelfLifeMonths} Months</p>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block" }}>STATUS:</span>
                  <span style={{
                    fontSize: "10.5px",
                    fontWeight: 600,
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: selectedProduct.status === "PROVISIONAL_HOLD" ? "rgba(244,63,94,0.15)" : (selectedProduct.status === "APPROVED" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"),
                    color: selectedProduct.status === "PROVISIONAL_HOLD" ? "#f43f5e" : (selectedProduct.status === "APPROVED" ? "#34d399" : "#fbbf24")
                  }}>
                    {selectedProduct.status.replace("_", " ")}
                  </span>
                </div>
              </div>

              {/* FDA NUTRITION FACTS */}
              <div style={{ background: "#fff", color: "#000", padding: "14px", border: "2px solid #000", fontFamily: "Helvetica, Arial, sans-serif" }}>
                <h2 style={{ fontSize: "24px", fontWeight: 900, lineHeight: 1, margin: 0 }}>Nutrition Facts</h2>
                <div style={{ height: "4px", background: "#000", margin: "4px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span>Serving Size</span>
                  <strong>{selectedProduct.nutrition.servingSize}</strong>
                </div>
                <div style={{ height: "2px", background: "#000", margin: "3px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 800, fontSize: "12px" }}>Calories</span>
                  <span style={{ fontSize: "22px", fontWeight: 800 }}>{selectedProduct.nutrition.calories}</span>
                </div>
                <div style={{ height: "1px", background: "#888", margin: "3px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span><strong>Total Fat</strong> {selectedProduct.nutrition.totalFat}g</span>
                  <strong>{Math.round((selectedProduct.nutrition.totalFat / 78) * 100)}%</strong>
                </div>
                <div style={{ height: "1px", background: "#888", margin: "3px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span><strong>Sodium</strong> {selectedProduct.nutrition.sodium}mg</span>
                  <strong>{Math.round((selectedProduct.nutrition.sodium / 2300) * 100)}%</strong>
                </div>
                <div style={{ height: "1px", background: "#888", margin: "3px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span><strong>Total Carbs</strong> {selectedProduct.nutrition.totalCarbs}g</span>
                  <strong>{Math.round((selectedProduct.nutrition.totalCarbs / 275) * 100)}%</strong>
                </div>
                <div style={{ height: "1px", background: "#888", margin: "3px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
                  <span><strong>Protein</strong> {selectedProduct.nutrition.protein}g</span>
                </div>
                <div style={{ height: "3px", background: "#000", margin: "3px 0" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "12px" }}>
              <button onClick={() => window.print()} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#f8fafc", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "12px" }}>
                <Printer size={13} /> Export Spec Sheet
              </button>
              <button onClick={() => setSelectedProduct(null)} style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={true}
          onClose={() => setEditingProduct(null)}
          onSave={handleUpdateProduct}
        />
      )}

      {/* CREATE PRODUCT MODAL */}
      {isCreateOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", width: "100%", maxWidth: "520px", padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Create Product Formulation</h3>
              <button onClick={() => { setIsCreateOpen(false); setCreateError(null); }} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.25)", color: "#fda4af", padding: "7px 10px", borderRadius: "6px", fontSize: "11.5px", marginBottom: "12px" }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden Turmeric Shake"
                  value={newProdName}
                  onChange={(e) => { setNewProdName(e.target.value); setCreateError(null); }}
                  style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                  >
                    <option value="Beverage">Beverage</option>
                    <option value="Food">Food</option>
                    <option value="Cosmetics">Cosmetics</option>
                    <option value="Supplement">Supplement</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>Brand</label>
                  <input
                    type="text"
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>Ingredients (Comma separated) *</label>
                <textarea
                  rows={3}
                  required
                  value={newProdIngredients}
                  onChange={(e) => { setNewProdIngredients(e.target.value); setCreateError(null); }}
                  placeholder="Water, Almond milk, Raw agave, Cinnamon..."
                  style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" onClick={() => { setIsCreateOpen(false); setCreateError(null); }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "7px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>
                  Cancel
                </button>
                <button type="submit" style={{ background: "#4f46e5", border: "none", color: "#fff", padding: "7px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}>
                  Create Formulation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
