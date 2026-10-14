import React, { useState } from "react";
import { AuditRecord, AuditEventType } from "../domain/audit";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";

interface AuditTrailProps {
  records: AuditRecord[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  const filtered = records.filter(r => {
    const matchType = typeFilter === "ALL" || r.eventType === typeFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !searchTerm ||
      r.id.toLowerCase().includes(q) ||
      r.action.toLowerCase().includes(q) ||
      r.reason.toLowerCase().includes(q) ||
      r.actor.toLowerCase().includes(q) ||
      (r.batchNumber && r.batchNumber.toLowerCase().includes(q)) ||
      r.entityId.toLowerCase().includes(q);

    return matchType && matchSearch;
  });

  const getEventBadge = (type: AuditEventType) => {
    switch (type) {
      case "PROVISIONAL_HOLD_APPLIED":
      case "BATCH_QUARANTINED":
        return { bg: "rgba(244, 63, 94, 0.12)", text: "#f43f5e", border: "rgba(244, 63, 94, 0.25)" };
      case "HOLD_RELEASED":
        return { bg: "rgba(16, 185, 129, 0.12)", text: "#34d399", border: "rgba(16, 185, 129, 0.25)" };
      case "INCIDENT_RECURRENCE_RECORDED":
        return { bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.25)" };
      case "PRODUCT_CREATED":
        return { bg: "rgba(99, 102, 241, 0.12)", text: "#818cf8", border: "rgba(99, 102, 241, 0.25)" };
      case "PRODUCT_UPDATED":
        return { bg: "rgba(56, 189, 248, 0.12)", text: "#38bdf8", border: "rgba(56, 189, 248, 0.25)" };
      default:
        return { bg: "rgba(255, 255, 255, 0.05)", text: "#94a3b8", border: "rgba(255, 255, 255, 0.1)" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search and Filters Bar */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search audit events by batch #, entity ID, action, or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              background: "#111827",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "13px",
              outline: "none"
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "#111827",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: "13px",
            outline: "none"
          }}
        >
          <option value="ALL">All Event Types</option>
          <option value="PRODUCT_CREATED">Product Created</option>
          <option value="PRODUCT_UPDATED">Product Updated</option>
          <option value="INCIDENT_LOGGED">Incident Logged</option>
          <option value="INCIDENT_RECURRENCE_RECORDED">Recurrence Recorded</option>
          <option value="PROVISIONAL_HOLD_APPLIED">Provisional Hold Applied</option>
          <option value="HOLD_RELEASED">Hold Released</option>
          <option value="BATCH_QUARANTINED">Batch Quarantined</option>
        </select>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          color: "#94a3b8",
          padding: "7px 12px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          borderRadius: "8px",
          whiteSpace: "nowrap"
        }}>
          <ShieldCheck size={14} color="#34d399" />
          <span>{filtered.length} Persistent Event{filtered.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>TIMESTAMP</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>EVENT TYPE</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>ENTITY / BATCH</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>ACTION & REASON</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>STATUS TRANSITION</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>ACTOR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                  No audit trail events match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map(rec => {
                const badge = getEventBadge(rec.eventType);
                const dateStr = new Date(rec.timestamp).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <tr key={rec.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                      {dateStr}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: "4px",
                        background: badge.bg,
                        color: badge.text,
                        border: `1px solid ${badge.border}`
                      }}>
                        {rec.eventType}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "11.5px" }}>
                      <span style={{ color: "#f8fafc", fontWeight: 600 }}>{rec.batchNumber || rec.entityId}</span>
                      <span style={{ display: "block", fontSize: "10px", color: "#64748b" }}>{rec.entityType}: {rec.entityId}</span>
                    </td>
                    <td style={{ padding: "10px 14px", maxWidth: "340px" }}>
                      <div style={{ fontWeight: 600, color: "#f8fafc", fontSize: "12px" }}>{rec.action}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "1px", lineHeight: "1.3" }}>{rec.reason}</div>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {rec.previousStatus || rec.newStatus ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                          {rec.previousStatus && (
                            <span style={{ color: "#64748b" }}>{rec.previousStatus}</span>
                          )}
                          {rec.previousStatus && rec.newStatus && (
                            <ArrowRight size={11} color="#475569" />
                          )}
                          {rec.newStatus && (
                            <span style={{
                              fontWeight: 600,
                              color: rec.newStatus === "PROVISIONAL_HOLD" ? "#fbbf24" : (rec.newStatus === "APPROVED" ? "#34d399" : "#f43f5e")
                            }}>
                              {rec.newStatus}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: "11px", color: "#475569" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: "11px", color: "#94a3b8" }}>
                      {rec.actor}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
