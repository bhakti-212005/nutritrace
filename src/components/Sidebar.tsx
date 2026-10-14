import React from "react";
import { LayoutDashboard, Package, ShieldCheck, AlertTriangle, History, Scale } from "lucide-react";

export type TabId = "overview" | "catalog" | "auditor" | "incidents" | "audit" | "regulations";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  incidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, incidentCount }) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
    { id: "catalog", label: "Product Catalog", icon: <Package size={17} /> },
    { id: "auditor", label: "Compliance Auditor", icon: <ShieldCheck size={17} /> },
    { id: "incidents", label: "Incident & Safety Triage", icon: <AlertTriangle size={17} />, badge: incidentCount },
    { id: "audit", label: "Audit Trail", icon: <History size={17} /> },
    { id: "regulations", label: "Regulatory Matrix", icon: <Scale size={17} /> }
  ];

  return (
    <aside style={{
      width: "250px",
      background: "#0c111d",
      borderRight: "1px solid rgba(255, 255, 255, 0.06)",
      padding: "20px 14px",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    }}>
      {/* Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px", padding: "0 8px" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontWeight: 800,
          fontSize: "15px"
        }}>
          N
        </div>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: 0, letterSpacing: "-0.2px" }}>
            NutriTrace
          </h1>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "1px 0 0 0" }}>
            Compliance & Formulation PIM
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                background: isActive ? "rgba(99, 102, 241, 0.1)" : "transparent",
                border: "1px solid",
                borderColor: isActive ? "rgba(99, 102, 241, 0.25)" : "transparent",
                color: isActive ? "#c7d2fe" : "#94a3b8",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "background 150ms ease, color 150ms ease, border-color 150ms ease"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", color: isActive ? "#818cf8" : "#64748b" }}>
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: "rgba(244, 63, 94, 0.2)",
                  color: "#f43f5e",
                  border: "1px solid rgba(244, 63, 94, 0.35)",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: "9999px"
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div style={{
        marginTop: "auto",
        padding: "10px 12px",
        background: "rgba(255, 255, 255, 0.02)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        <div className="pulse-dot" style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: "#10b981",
          boxShadow: "0 0 8px rgba(16, 185, 129, 0.6)"
        }} />
        <div style={{ fontSize: "11px", color: "#64748b" }}>
          IncidentAgent v2 Active
        </div>
      </div>
    </aside>
  );
};
