import React, { useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon?: React.ReactNode;
  statusColor?: "default" | "success" | "warning" | "danger";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  statusColor = "default"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const statusStyles = {
    default: {
      accent: "#818cf8",
      subtleBg: "rgba(99, 102, 241, 0.08)",
      border: "rgba(255, 255, 255, 0.07)",
      hoverBorder: "rgba(99, 102, 241, 0.3)"
    },
    success: {
      accent: "#34d399",
      subtleBg: "rgba(16, 185, 129, 0.08)",
      border: "rgba(16, 185, 129, 0.2)",
      hoverBorder: "rgba(16, 185, 129, 0.4)"
    },
    warning: {
      accent: "#fbbf24",
      subtleBg: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.2)",
      hoverBorder: "rgba(245, 158, 11, 0.4)"
    },
    danger: {
      accent: "#f43f5e",
      subtleBg: "rgba(244, 63, 94, 0.08)",
      border: "rgba(244, 63, 94, 0.2)",
      hoverBorder: "rgba(244, 63, 94, 0.4)"
    }
  };

  const style = statusStyles[statusColor];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "rgba(17, 24, 39, 0.75)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${isHovered ? style.hoverBorder : style.border}`,
        borderRadius: "10px",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: "96px",
        transition: "border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease",
        transform: isHovered ? "translateY(-1px)" : "none",
        boxShadow: isHovered ? "0 6px 20px rgba(0, 0, 0, 0.25)" : "none",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "12px", fontWeight: 500, color: "#94a3b8", letterSpacing: "0.2px" }}>
          {title}
        </span>
        {icon && (
          <span style={{
            color: style.accent,
            display: "inline-flex",
            alignItems: "center",
            padding: "5px",
            background: style.subtleBg,
            borderRadius: "6px"
          }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{ marginTop: "6px" }}>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#f8fafc", lineHeight: 1.1 }}>
          {value}
        </div>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};
