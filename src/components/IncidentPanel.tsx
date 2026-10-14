import React, { useState } from "react";
import { Incident } from "../domain/incident";
import { 
  AlertCircle, CheckCircle2, Unlock, ChevronDown, ChevronUp, Info, 
  FileInput, Cpu, ShieldAlert, FlaskConical, CheckCheck 
} from "lucide-react";

interface IncidentPanelProps {
  incidents: Incident[];
  onSubmitIncident: (input: { batchNumber: string; title: string; description: string; reportedBy: string }) => void;
  onReleaseHold: (batchNumber: string, review: { reviewer: string; decisionNote: string }) => void;
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({
  incidents,
  onSubmitIncident,
  onReleaseHold
}) => {
  const [batchNumber, setBatchNumber] = useState("BATCH-2026-904");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const [activeStepFilter, setActiveStepFilter] = useState<number | null>(null);

  // Review & Release Modal State
  const [releaseModalBatch, setReleaseModalBatch] = useState<string | null>(null);
  const [reviewerName, setReviewerName] = useState("Dr. Elena Vance (VP Quality & Safety)");
  const [reviewNote, setReviewNote] = useState("Analytical chromatography assays of retention sample confirmed no contamination; provisional hold cleared for distribution.");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const applyPreset = (preset: "allergy" | "foreign_material" | "label" | "quality") => {
    if (preset === "allergy") {
      setBatchNumber("BATCH-2026-904");
      setTitle("Suspected Undeclared Tree Nut Cross-Contact");
      setDescription("Consumer reported hives and facial swelling after consuming batch BATCH-2026-904; suspected cross-contact with almond packaging line.");
    } else if (preset === "foreign_material") {
      setBatchNumber("BATCH-2026-881");
      setTitle("Suspected Glass Fragment in Shake Bottle");
      setDescription("Customer returned bottle stating transparent rigid foreign shard was identified inside liquid container.");
    } else if (preset === "label") {
      setBatchNumber("BATCH-2026-319");
      setTitle("Missing EU Statutory Red 40 Warning Label");
      setDescription("Rotterdam customs audit noted carton lacked statutory child hyperactivity warning advisory required under EU 1333/2008.");
    } else if (preset === "quality") {
      setBatchNumber("BATCH-2026-402");
      setTitle("Phase Separation & Off-Color in Cream");
      setDescription("Retailer customer complaint: topical cream displayed visible oil separation and granular texture.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !batchNumber.trim()) return;

    onSubmitIncident({
      batchNumber: batchNumber.trim(),
      title: title.trim(),
      description: description.trim(),
      reportedBy: "Customer Support Portal"
    });

    setTitle("");
    setDescription("");
  };

  const handleConfirmRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalBatch) return;
    if (!reviewerName.trim()) {
      setReviewError("Reviewer credentials are required.");
      return;
    }
    if (!reviewNote.trim()) {
      setReviewError("A formal review justification note is mandatory to clear a hold.");
      return;
    }

    onReleaseHold(releaseModalBatch, {
      reviewer: reviewerName.trim(),
      decisionNote: reviewNote.trim()
    });

    setReleaseModalBatch(null);
    setReviewError(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Information Banner */}
      <div style={{
        background: "rgba(99, 102, 241, 0.05)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
        borderRadius: "10px",
        padding: "14px 18px",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        <Info color="#818cf8" size={18} style={{ flexShrink: 0, marginTop: "2px" }} />
        <div style={{ fontSize: "12.5px", color: "#94a3b8", lineHeight: "1.5" }}>
          <strong style={{ color: "#f8fafc" }}>Rule-Based Safety Triage:</strong> Consumer reports are evaluated against defined safety thresholds. Severe reports place affected batches on a reversible <strong style={{ color: "#f43f5e" }}>Provisional Hold</strong> with neutral causality phrasing pending laboratory assays. Repeated reports for the same open batch are automatically deduplicated into an occurrence timeline.
        </div>
      </div>

      {/* Safety Governance Lifecycle Stepper */}
      <div style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        padding: "18px 20px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <h4 style={{ fontSize: "13.5px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
              Batch Safety Governance & Hold Lifecycle Pipeline
            </h4>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              Click any stage below to inspect the governance protocol or filter active records
            </span>
          </div>
          {activeStepFilter !== null && (
            <button
              onClick={() => setActiveStepFilter(null)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#cbd5e1",
                padding: "3px 8px",
                borderRadius: "5px",
                fontSize: "11px",
                cursor: "pointer"
              }}
            >
              Show All Stages
            </button>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "8px",
          position: "relative"
        }}>
          {/* Step 1 */}
          <div
            onClick={() => setActiveStepFilter(activeStepFilter === 1 ? null : 1)}
            style={{
              background: activeStepFilter === 1 ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeStepFilter === 1 ? "1px solid #818cf8" : "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(99, 102, 241, 0.2)",
                color: "#818cf8",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                1
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#f8fafc" }}>Ingest</span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              Consumer / Retailer complaint received with batch #
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#818cf8", fontWeight: 600 }}>
              {incidents.length} Ingested
            </div>
          </div>

          {/* Step 2 */}
          <div
            onClick={() => setActiveStepFilter(activeStepFilter === 2 ? null : 2)}
            style={{
              background: activeStepFilter === 2 ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeStepFilter === 2 ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(56, 189, 248, 0.2)",
                color: "#38bdf8",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                2
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#f8fafc" }}>Triage</span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              Deterministic keywords & deduplication check
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#38bdf8", fontWeight: 600 }}>
              Rule Engine
            </div>
          </div>

          {/* Step 3 */}
          <div
            onClick={() => setActiveStepFilter(activeStepFilter === 3 ? null : 3)}
            style={{
              background: activeStepFilter === 3 ? "rgba(244, 63, 94, 0.18)" : "rgba(244, 63, 94, 0.04)",
              border: activeStepFilter === 3 ? "1px solid #f43f5e" : "1px solid rgba(244, 63, 94, 0.2)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(244, 63, 94, 0.2)",
                color: "#f43f5e",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                3
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#fca5a5" }}>Provisional Hold</span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              Reversible distribution halt with neutral causality
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#f43f5e", fontWeight: 700 }}>
              {incidents.filter(i => i.status === "PROVISIONAL_HOLD" || i.status === "QUARANTINED").length} Active Hold
            </div>
          </div>

          {/* Step 4 */}
          <div
            onClick={() => setActiveStepFilter(activeStepFilter === 4 ? null : 4)}
            style={{
              background: activeStepFilter === 4 ? "rgba(245, 158, 11, 0.15)" : "rgba(255, 255, 255, 0.02)",
              border: activeStepFilter === 4 ? "1px solid #fbbf24" : "1px solid rgba(255, 255, 255, 0.06)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.2)",
                color: "#fbbf24",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                4
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#f8fafc" }}>QA Lab Assay</span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              Chromatography assay of retention sample
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#fbbf24", fontWeight: 600 }}>
              Lab Verification
            </div>
          </div>

          {/* Step 5 */}
          <div
            onClick={() => setActiveStepFilter(activeStepFilter === 5 ? null : 5)}
            style={{
              background: activeStepFilter === 5 ? "rgba(16, 185, 129, 0.18)" : "rgba(16, 185, 129, 0.04)",
              border: activeStepFilter === 5 ? "1px solid #34d399" : "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 150ms ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                fontSize: "10.5px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                5
              </div>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#a7f3d0" }}>Hold Cleared</span>
            </div>
            <div style={{ fontSize: "10px", color: "#64748b", lineHeight: "1.3" }}>
              Reviewer credentials & justification in audit trail
            </div>
            <div style={{ marginTop: "6px", fontSize: "10px", color: "#34d399", fontWeight: 700 }}>
              {incidents.filter(i => i.status === "RESOLVED").length} Released
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "20px" }}>
        {/* Log Incident Form */}
        <div style={{
          background: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "10px",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", margin: "0 0 12px 0" }}>
            Log Quality Incident or Consumer Feedback
          </h3>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
              SIMULATED TEST SCENARIOS:
            </span>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => applyPreset("allergy")}
                style={{
                  fontSize: "11px",
                  background: "rgba(244, 63, 94, 0.08)",
                  border: "1px solid rgba(244, 63, 94, 0.2)",
                  color: "#fda4af",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Suspected Allergen
              </button>
              <button
                type="button"
                onClick={() => applyPreset("foreign_material")}
                style={{
                  fontSize: "11px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Foreign Material
              </button>
              <button
                type="button"
                onClick={() => applyPreset("label")}
                style={{
                  fontSize: "11px",
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "#fde68a",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Packaging / Label
              </button>
              <button
                type="button"
                onClick={() => applyPreset("quality")}
                style={{
                  fontSize: "11px",
                  background: "rgba(56, 189, 248, 0.08)",
                  border: "1px solid rgba(56, 189, 248, 0.2)",
                  color: "#7dd3fc",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Quality Anomaly
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target Batch Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Issue Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g. Reported allergic rash after consumption..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Description Details *</label>
              <textarea
                rows={3}
                required
                placeholder="Consumer feedback narrative..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "6px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "#4f46e5",
                border: "none",
                color: "#fff",
                padding: "9px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: "4px",
                transition: "background 150ms ease"
              }}
            >
              Run Incident Triage
            </button>
          </form>
        </div>

        {/* Protocol Summary Card */}
        <div style={{
          background: "#111827",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "10px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#f8fafc", margin: 0 }}>
            Safety & Deduplication Protocol
          </h3>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
            <strong style={{ color: "#38bdf8", display: "block", marginBottom: "3px" }}>Idempotent Deduplication</strong>
            Submitting multiple reports for the same batch and category updates the occurrence counter (`OccurrenceCount + 1`) and appends to the report timeline rather than creating duplicate open tickets.
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
            <strong style={{ color: "#fbbf24", display: "block", marginBottom: "3px" }}>Neutral Causation Standard</strong>
            Adverse reactions are recorded as consumer allegations requiring urgent review. Batches are placed under provisional hold for safety without declaring conclusive product failure until analytical lab assays are completed.
          </div>

          <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#94a3b8", lineHeight: "1.5" }}>
            <strong style={{ color: "#34d399", display: "block", marginBottom: "3px" }}>Reversible Batch Hold</strong>
            Provisional holds can be released by an authorized Quality Reviewer upon entering credentials and a formal sign-off justification note, creating a permanent audit trail entry.
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        overflowX: "auto"
      }}>
        {(() => {
          const displayedIncidents = incidents.filter(inc => {
            if (activeStepFilter === 1 || activeStepFilter === 2) return true;
            if (activeStepFilter === 3) return inc.status === "PROVISIONAL_HOLD" || inc.status === "QUARANTINED";
            if (activeStepFilter === 4) return inc.status === "INVESTIGATING";
            if (activeStepFilter === 5) return inc.status === "RESOLVED";
            return true;
          });

          return (
            <>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                    Incident Records & Active Holds ({displayedIncidents.length})
                  </h4>
                  {activeStepFilter !== null && (
                    <span style={{
                      fontSize: "10.5px",
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "#818cf8",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 600
                    }}>
                      Stage {activeStepFilter} Filter Active
                    </span>
                  )}
                </div>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Select an incident to review details or release a hold</span>
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>ID / OCCURRENCES</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>PRIORITY</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>BATCH #</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>TITLE & SUMMARY</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>AUTO-ACTION</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>STATUS</th>
                    <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px", textAlign: "right" }}>REVIEW ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIncidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#64748b", fontSize: "12.5px" }}>
                        No records match the selected pipeline stage.
                      </td>
                    </tr>
                  ) : displayedIncidents.map(inc => {
              const isExpanded = expandedIncidentId === inc.id;
              const hasActiveHold = inc.status === "PROVISIONAL_HOLD" || inc.status === "QUARANTINED";

              return (
                <React.Fragment key={inc.id}>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px" }}>
                      <span style={{ color: "#818cf8", display: "block" }}>{inc.id}</span>
                      {inc.occurrenceCount > 1 && (
                        <span style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          background: "rgba(245, 158, 11, 0.12)",
                          color: "#fbbf24",
                          padding: "1px 5px",
                          borderRadius: "4px"
                        }}>
                          {inc.occurrenceCount} Reports
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: inc.priority === "CRITICAL" ? "rgba(244, 63, 94, 0.15)" : (inc.priority === "HIGH" ? "rgba(245, 158, 11, 0.15)" : "rgba(99, 102, 241, 0.15)"),
                        color: inc.priority === "CRITICAL" ? "#f43f5e" : (inc.priority === "HIGH" ? "#fbbf24" : "#818cf8")
                      }}>
                        {inc.priority}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#f8fafc" }}>
                      {inc.batchNumber}
                    </td>
                    <td style={{ padding: "10px 14px", maxWidth: "300px" }}>
                      <strong style={{ display: "block", color: "#f8fafc", fontSize: "12.5px" }}>{inc.title}</strong>
                      <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginTop: "1px" }}>{inc.description}</span>
                      {inc.reportsHistory && inc.reportsHistory.length > 1 && (
                        <button
                          onClick={() => setExpandedIncidentId(isExpanded ? null : inc.id)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#38bdf8",
                            fontSize: "10.5px",
                            cursor: "pointer",
                            padding: "3px 0 0 0",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px"
                          }}
                        >
                          {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          {isExpanded ? "Hide history" : `${inc.reportsHistory.length} reports history`}
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <code style={{ fontSize: "11px", color: "#38bdf8" }}>{inc.autoAction}</code>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        background: inc.status === "RESOLVED" ? "rgba(16,185,129,0.12)" : (hasActiveHold ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.12)"),
                        color: inc.status === "RESOLVED" ? "#34d399" : (hasActiveHold ? "#f43f5e" : "#fbbf24")
                      }}>
                        {inc.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      {hasActiveHold ? (
                        <button
                          onClick={() => setReleaseModalBatch(inc.batchNumber)}
                          style={{
                            background: "rgba(16, 185, 129, 0.12)",
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            color: "#34d399",
                            padding: "5px 10px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          <Unlock size={12} /> Release Hold
                        </button>
                      ) : inc.reviewDecision ? (
                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                          Cleared by {inc.reviewDecision.reviewer.split(" ")[0]}
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#475569" }}>—</span>
                      )}
                    </td>
                  </tr>

                  {/* Recurrence History Drawer */}
                  {isExpanded && inc.reportsHistory && (
                    <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                      <td colSpan={7} style={{ padding: "10px 16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", marginBottom: "4px" }}>
                          Report history timeline ({inc.reportsHistory.length} occurrences):
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {inc.reportsHistory.map((rep, idx) => (
                            <div key={rep.reportId || idx} style={{ background: "rgba(255,255,255,0.03)", padding: "5px 8px", borderRadius: "4px", fontSize: "11px" }}>
                              <span style={{ color: "#818cf8", fontFamily: "JetBrains Mono, monospace" }}>
                                {new Date(rep.timestamp).toLocaleString()}:
                              </span>{" "}
                              <span style={{ color: "#cbd5e1" }}>{rep.description}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </>
    );
  })()}
</div>

      {/* Review & Release Modal */}
      {releaseModalBatch && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(3px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            width: "100%",
            maxWidth: "500px",
            padding: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <Unlock size={20} color="#34d399" />
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                  Release Batch Safety Hold
                </h3>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Target Batch: <strong style={{ color: "#38bdf8" }}>{releaseModalBatch}</strong></span>
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#94a3b8", lineHeight: "1.4", margin: "0 0 14px 0" }}>
              Releasing this provisional hold clears the safety flag across catalog SKUs and resolves active incidents. A formal justification note is permanently recorded in the audit trail.
            </p>

            {reviewError && (
              <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.25)", color: "#fda4af", padding: "8px 10px", borderRadius: "6px", fontSize: "11.5px", marginBottom: "10px" }}>
                {reviewError}
              </div>
            )}

            <form onSubmit={handleConfirmRelease} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>Authorized Reviewer *</label>
                <input
                  type="text"
                  required
                  value={reviewerName}
                  onChange={(e) => { setReviewerName(e.target.value); setReviewError(null); }}
                  style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11.5px", color: "#94a3b8", display: "block", marginBottom: "3px" }}>QA Release Justification Note *</label>
                <textarea
                  rows={3}
                  required
                  value={reviewNote}
                  onChange={(e) => { setReviewNote(e.target.value); setReviewError(null); }}
                  style={{ width: "100%", padding: "7px 10px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "6px", color: "#f8fafc", fontSize: "12.5px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setReleaseModalBatch(null)}
                  style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "7px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: "#10b981", border: "none", color: "#fff", padding: "7px 14px", borderRadius: "6px", fontWeight: 600, cursor: "pointer", fontSize: "12px" }}
                >
                  Confirm & Release Hold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
