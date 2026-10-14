import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  accentColor?: "indigo" | "emerald" | "amber" | "rose";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = "indigo"
}) => {
  const colorMap = {
    indigo: { border: "rgba(99, 102, 241, 0.2)", text: "#818cf8" },
    emerald: { border: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
    amber: { border: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
    rose: { border: "rgba(244, 63, 94, 0.2)", text: "#fb7185" }
  };

  const c = colorMap[accentColor];

  return (
    <div style={{
      background: "rgba(18, 25, 43, 0.75)",
      border: `1px solid ${c.border}`,
      borderRadius: "14px",
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(12px)"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>{title}</span>
        <span style={{ fontSize: "18px" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "28px", fontWeight: 800, color: "#f8fafc", marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "11px", fontWeight: 500, color: c.text }}>
        {subtitle}
      </div>
    </div>
  );
};
