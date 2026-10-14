import React from "react";
import { Package, ShieldAlert, Bot, Scale, Layers } from "lucide-react";

export type TabId = "catalog" | "auditor" | "incidents" | "regulations" | "architecture";

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  incidentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, incidentCount }) => {
  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "catalog", label: "Master Catalog", icon: <Package size={18} /> },
    { id: "auditor", label: "Agentic Auditor", icon: <Bot size={18} /> },
    { id: "incidents", label: "Incident & Triage", icon: <ShieldAlert size={18} />, badge: incidentCount },
    { id: "regulations", label: "Regulatory Matrix", icon: <Scale size={18} /> },
    { id: "architecture", label: "Design Patterns", icon: <Layers size={18} /> }
  ];

  return (
    <aside style={{
      width: "260px",
      background: "#080d1a",
      borderRight: "1px solid rgba(255,255,255,0.08)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", padding: "0 8px" }}>
        <div style={{
          fontSize: "24px",
          background: "rgba(99, 102, 241, 0.15)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          padding: "8px",
          borderRadius: "10px"
        }}>🥗</div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>NutriTrace</h1>
            <span style={{
              fontSize: "8.5px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              color: "#fff",
              padding: "2px 6px",
              borderRadius: "9999px"
            }}>AGENTIC</span>
          </div>
          <p style={{ fontSize: "11px", color: "#94a3b8" }}>Enterprise Regulatory PIM</p>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                background: isActive ? "rgba(99, 102, 241, 0.14)" : "transparent",
                border: isActive ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid transparent",
                color: isActive ? "#818cf8" : "#94a3b8",
                borderRadius: "10px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s ease"
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span style={{
                  background: "#f43f5e",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: "9999px"
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{
        marginTop: "auto",
        padding: "12px",
        background: "rgba(16, 185, 129, 0.08)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <div style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#10b981",
          boxShadow: "0 0 8px #10b981"
        }} />
        <div>
          <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#a7f3d0" }}>IncidentAgent v2</div>
          <div style={{ fontSize: "10px", color: "#94a3b8" }}>Autonomous Audit Loop Active</div>
        </div>
      </div>
    </aside>
  );
};
