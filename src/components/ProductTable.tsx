import React, { useState } from "react";
import { Product } from "../domain/product";
import { Search, Eye, AlertTriangle } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onSelectProduct }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchStat = statusFilter === "All" || p.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.ingredients.some(i => i.toLowerCase().includes(q));

    return matchCat && matchStat && matchSearch;
  });

  return (
    <div>
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
          <input
            type="text"
            placeholder="Search by SKU, Product Name, or Ingredient (e.g. Red 40, Almond)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              background: "rgba(18, 25, 43, 0.75)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "13.5px",
              outline: "none"
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "rgba(18, 25, 43, 0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            color: "#f8fafc",
            fontSize: "13.5px",
            outline: "none"
          }}
        >
          <option value="All">All Categories</option>
          <option value="Food">Food</option>
          <option value="Beverage">Beverage</option>
          <option value="Cosmetics">Cosmetics</option>
          <option value="Supplement">Supplement</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            background: "rgba(18, 25, 43, 0.75)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            color: "#f8fafc",
            fontSize: "13.5px",
            outline: "none"
          }}
        >
          <option value="All">All Statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="REVIEW_REQUIRED">Review Required</option>
          <option value="QUARANTINED">Quarantined</option>
        </select>
      </div>

      <div style={{
        background: "rgba(18, 25, 43, 0.75)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "14px",
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>SKU</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>Product Name</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>Category</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>Batch #</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>Identified Allergens</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "14px 18px", color: "#94a3b8", fontWeight: 600, textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "30px", textAlign: "center", color: "#64748b" }}>
                  No matching formulations found in PIM master records.
                </td>
              </tr>
            ) : (
              filtered.map(p => {
                let badgeStyle = { bg: "rgba(16,185,129,0.15)", text: "#34d399", border: "rgba(16,185,129,0.3)" };
                if (p.status === "REVIEW_REQUIRED") {
                  badgeStyle = { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", border: "rgba(245,158,11,0.3)" };
                } else if (p.status === "QUARANTINED") {
                  badgeStyle = { bg: "rgba(244,63,94,0.2)", text: "#f43f5e", border: "rgba(244,63,94,0.4)" };
                }

                return (
                  <tr
                    key={p.id}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer" }}
                    onClick={() => onSelectProduct(p)}
                  >
                    <td style={{ padding: "14px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: "11.5px", color: "#818cf8" }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: "14px 18px", fontWeight: 600, color: "#f8fafc" }}>
                      {p.name}
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b" }}>{p.brand}</span>
                    </td>
                    <td style={{ padding: "14px 18px", color: "#cbd5e1" }}>{p.category}</td>
                    <td style={{ padding: "14px 18px", fontFamily: "JetBrains Mono, monospace", fontSize: "12px", color: "#cbd5e1" }}>
                      {p.batchNumber}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {p.allergens.length > 0 ? (
                          p.allergens.map(a => (
                            <span key={a.id} style={{
                              fontSize: "11px",
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid rgba(255,255,255,0.1)",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              color: "#e2e8f0"
                            }}>
                              {a.icon} {a.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "11px", color: "#64748b" }}>None</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        fontSize: "10.5px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "9999px",
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        textTransform: "uppercase"
                      }}>
                        {p.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectProduct(p); }}
                        style={{
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "#94a3b8",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px"
                        }}
                      >
                        <Eye size={13} /> View Spec
                      </button>
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
