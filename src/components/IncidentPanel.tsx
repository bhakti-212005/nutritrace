import React, { useState } from "react";
import { Incident } from "../domain/incident";
import { incidentAgent } from "../agents/IncidentAgent";
import { ShieldAlert, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

interface IncidentPanelProps {
  incidents: Incident[];
  onIncidentAdded: (newIncident: Incident) => void;
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({ incidents, onIncidentAdded }) => {
  const [batchNumber, setBatchNumber] = useState("BATCH-2026-881");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recentTriaged, setRecentTriaged] = useState<Incident | null>(null);

  const applyPreset = (preset: "payment" | "allergy" | "packaging") => {
    if (preset === "payment") {
      setBatchNumber("BATCH-2026-881");
      setTitle("Checkout Gateway Timeout Loop");
      setDescription("Customer encountered repeated payment failures and double billing charges during checkout.");
    } else if (preset === "allergy") {
      setBatchNumber("BATCH-2026-904");
      setTitle("Severe Undeclared Allergen Reaction");
      setDescription("Consumer suffered acute allergic reaction, facial swelling, and hives after consuming product.");
    } else if (preset === "packaging") {
      setBatchNumber("BATCH-2026-319");
      setTitle("Weeping Aluminum Can Seal");
      setDescription("Retailer shipment arrived with damaged crimp seams on 4 cans.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    // Execute Agentic AI Triage Loop
    const triaged = incidentAgent.triage({
      batchNumber,
      title,
      description,
      reportedBy: "Customer Support Portal"
    });

    onIncidentAdded(triaged);
    setRecentTriaged(triaged);
    setTitle("");
    setDescription("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Banner */}
      <div style={{
        background: "rgba(99, 102, 241, 0.1)",
        border: "1px solid rgba(99, 102, 241, 0.3)",
        borderRadius: "12px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px"
      }}>
        <Zap color="#818cf8" size={24} />
        <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
          <strong style={{ color: "#f8fafc" }}>Agentic Autonomous Triage Active:</strong> Complaints referencing repeated payment failures auto-escalate to <span style={{ background: "#f59e0b", color: "#000", fontWeight: 700, padding: "2px 6px", borderRadius: "4px" }}>HIGH</span>. Health, contamination, or acute allergen emergencies auto-escalate to <span style={{ background: "#f43f5e", color: "#fff", fontWeight: 700, padding: "2px 6px", borderRadius: "4px" }}>CRITICAL</span> and trigger instantaneous batch quarantines.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Log Incident Form */}
        <div style={{
          background: "rgba(18, 25, 43, 0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "24px",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldAlert size={18} color="#f43f5e" /> Log Quality Incident or Complaint
          </h3>

          <div style={{ marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "8px" }}>
              QUICK TEST CASE PRESETS:
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => applyPreset("payment")}
                style={{
                  fontSize: "11px",
                  background: "rgba(245, 158, 11, 0.15)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#fde68a",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                💳 Repeated Payment Failures
              </button>
              <button
                type="button"
                onClick={() => applyPreset("allergy")}
                style={{
                  fontSize: "11px",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fecdd3",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                ⚠️ Allergen Emergency
              </button>
              <button
                type="button"
                onClick={() => applyPreset("packaging")}
                style={{
                  fontSize: "11px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#cbd5e1",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                📦 Packaging Defect
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Target Batch Number *</label>
              <input
                type="text"
                required
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Issue Summary *</label>
              <input
                type="text"
                required
                placeholder="e.g. Gateway transaction failure..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Description Details *</label>
              <textarea
                rows={3}
                required
                placeholder="Detailed consumer description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "13px"
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                background: "linear-gradient(135deg, #f43f5e, #e11d48)",
                border: "none",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                marginTop: "6px"
              }}
            >
              ⚡ Triage with IncidentAgent
            </button>
          </form>
        </div>

        {/* Live Triage Output / Feedback */}
        <div style={{
          background: "rgba(18, 25, 43, 0.75)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "24px"
        }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px" }}>
            🤖 Agentic Decision Trace
          </h3>

          {recentTriaged ? (
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              padding: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#818cf8" }}>{recentTriaged.id}</span>
                <span style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: recentTriaged.priority === "CRITICAL" ? "#f43f5e" : (recentTriaged.priority === "HIGH" ? "#f59e0b" : "#6366f1"),
                  color: "#fff"
                }}>
                  {recentTriaged.priority} PRIORITY
                </span>
              </div>
              <h4 style={{ fontSize: "14px", color: "#f8fafc", marginBottom: "6px" }}>{recentTriaged.title}</h4>
              <p style={{ fontSize: "12.5px", color: "#94a3b8", marginBottom: "12px" }}>{recentTriaged.description}</p>
              
              <div style={{ fontSize: "11.5px", color: "#38bdf8", marginBottom: "8px" }}>
                <strong>Autonomous Action:</strong> <code>{recentTriaged.autoAction}</code>
              </div>

              <div style={{
                background: "rgba(0,0,0,0.2)",
                padding: "10px",
                borderRadius: "6px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "#a5b4fc"
              }}>
                {recentTriaged.reasoning.map((r, i) => (
                  <div key={i}>&gt; {r}</div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
              <AlertCircle size={36} style={{ margin: "0 auto 12px", display: "block" }} />
              Submit or test an incident to see real-time reasoning and priority assignment.
            </div>
          )}
        </div>
      </div>

      {/* Incident Log Table */}
      <div style={{
        background: "rgba(18, 25, 43, 0.75)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>ID</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>Priority</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>Batch #</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>Title & Description</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>Action</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map(inc => (
              <tr key={inc.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "14px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#818cf8" }}>{inc.id}</td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: inc.priority === "CRITICAL" ? "#f43f5e" : (inc.priority === "HIGH" ? "#f59e0b" : "#6366f1"),
                    color: "#fff"
                  }}>
                    {inc.priority}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>{inc.batchNumber}</td>
                <td style={{ padding: "14px 18px" }}>
                  <strong style={{ display: "block", color: "#f8fafc", fontSize: "13px" }}>{inc.title}</strong>
                  <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>{inc.description}</span>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <code style={{ fontSize: "11px", color: "#38bdf8" }}>{inc.autoAction}</code>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <span style={{
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "9999px",
                    background: inc.status === "QUARANTINED" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.15)",
                    color: inc.status === "QUARANTINED" ? "#f43f5e" : "#34d399",
                    border: `1px solid ${inc.status === "QUARANTINED" ? "rgba(244,63,94,0.4)" : "rgba(16,185,129,0.3)"}`
                  }}>
                    {inc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
