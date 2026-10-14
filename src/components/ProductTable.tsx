import React, { useState } from "react";
import { Product } from "../domain/product";
import { Search, Eye, Edit3, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onSelectProduct,
  onEditProduct
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const totalCount = products.length;
  const approvedCount = products.filter(p => p.status === "APPROVED").length;
  const reviewCount = products.filter(p => p.status === "REVIEW_REQUIRED").length;
  const holdCount = products.filter(p => p.status === "PROVISIONAL_HOLD" || p.status === "QUARANTINED").length;

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchStat = statusFilter === "All" || p.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.batchNumber.toLowerCase().includes(q) ||
      p.ingredients.some(i => i.toLowerCase().includes(q));

    return matchCat && matchStat && matchSearch;
  });

  const filterTabs = [
    { id: "All", label: "All Formulations", count: totalCount },
    { id: "APPROVED", label: "Approved", count: approvedCount, color: "#34d399" },
    { id: "REVIEW_REQUIRED", label: "Review Required", count: reviewCount, color: "#fbbf24" },
    { id: "PROVISIONAL_HOLD", label: "Safety Holds", count: holdCount, color: "#f43f5e" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* 1-Click Quick Filter Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
        {filterTabs.map(tab => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                background: isActive ? "rgba(99, 102, 241, 0.15)" : "rgba(17, 24, 39, 0.7)",
                border: `1px solid ${isActive ? "rgba(99, 102, 241, 0.35)" : "rgba(255, 255, 255, 0.07)"}`,
                color: isActive ? "#c7d2fe" : "#94a3b8",
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 150ms ease"
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: "10.5px",
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: "9999px",
                background: isActive ? "rgba(99, 102, 241, 0.25)" : "rgba(255, 255, 255, 0.05)",
                color: tab.color || (isActive ? "#fff" : "#64748b")
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Category Filter */}
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search by SKU, Product Name, Batch #, or Ingredient..."
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
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
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Beverage">Beverage</option>
          <option value="Cosmetics">Cosmetics</option>
          <option value="Supplement">Supplement</option>
        </select>
      </div>

      {/* Table */}
      <div style={{
        background: "#111827",
        border: "1px solid rgba(255, 255, 255, 0.07)",
        borderRadius: "10px",
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255, 255, 255, 0.07)" }}>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>SKU</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>PRODUCT NAME</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>CATEGORY</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>BATCH #</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>ALLERGENS</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px" }}>COMPLIANCE STATUS</th>
              <th style={{ padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: "11.5px", textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#64748b" }}>
                  No matching formulations found in catalog.
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                let badgeStyle = { bg: "rgba(16,185,129,0.12)", text: "#34d399", border: "rgba(16,185,129,0.25)", label: "APPROVED" };
                if (p.status === "REVIEW_REQUIRED") {
                  badgeStyle = { bg: "rgba(245,158,11,0.12)", text: "#fbbf24", border: "rgba(245,158,11,0.25)", label: "REVIEW REQUIRED" };
                } else if (p.status === "PROVISIONAL_HOLD") {
                  badgeStyle = { bg: "rgba(244,63,94,0.15)", text: "#f43f5e", border: "rgba(244,63,94,0.3)", label: "PROVISIONAL HOLD" };
                } else if (p.status === "QUARANTINED") {
                  badgeStyle = { bg: "rgba(244,63,94,0.2)", text: "#f43f5e", border: "rgba(244,63,94,0.4)", label: "QUARANTINED" };
                }

                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                    <td style={{ padding: "11px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "11px", color: "#818cf8" }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontWeight: 600, color: "#f8fafc", display: "block" }}>{p.name}</span>
                      <span style={{ fontSize: "11px", color: "#64748b" }}>{p.brand}</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: "#cbd5e1" }}>{p.category}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "JetBrains Mono, monospace", fontSize: "11.5px", color: "#94a3b8" }}>
                      {p.batchNumber}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {p.allergens.length > 0 ? (
                          p.allergens.map(a => (
                            <span key={a.id} style={{
                              fontSize: "10.5px",
                              background: "rgba(255,255,255,0.04)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              padding: "1px 6px",
                              borderRadius: "4px",
                              color: "#cbd5e1"
                            }}>
                              {a.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "11px", color: "#475569" }}>None</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: "9999px",
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        {p.status === "PROVISIONAL_HOLD" && <ShieldAlert size={10} />}
                        {badgeStyle.label}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(p)}
                            style={{
                              background: "transparent",
                              border: "1px solid rgba(255,255,255,0.1)",
                              color: "#cbd5e1",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              fontSize: "11.5px"
                            }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                        )}
                        <button
                          onClick={() => onSelectProduct(p)}
                          style={{
                            background: "rgba(99, 102, 241, 0.1)",
                            border: "1px solid rgba(99, 102, 241, 0.2)",
                            color: "#c7d2fe",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "11.5px"
                          }}
                        >
                          <Eye size={12} /> Spec
                        </button>
                      </div>
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
