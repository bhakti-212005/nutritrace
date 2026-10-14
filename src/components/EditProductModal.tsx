import React, { useState } from "react";
import { Product, ProductCategory } from "../domain/product";
import { X, Check, Save } from "lucide-react";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: any) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState<ProductCategory>(product.category);
  const [brand, setBrand] = useState(product.brand);
  const [ingredientsText, setIngredientsText] = useState(product.ingredients.join(", "));
  const [shelfLifeMonths, setShelfLifeMonths] = useState(product.shelfLifeMonths);
  const [packagingType, setPackagingType] = useState(product.packagingType);
  const [netWeight, setNetWeight] = useState(product.netWeight);
  const [description, setDescription] = useState(product.description);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }
    const ingList = ingredientsText.split(",").map(i => i.trim()).filter(Boolean);
    if (ingList.length === 0) {
      setError("At least one ingredient is required.");
      return;
    }

    try {
      onSave(product.id, {
        name: name.trim(),
        category,
        brand: brand.trim(),
        ingredients: ingList,
        shelfLifeMonths: Number(shelfLifeMonths) || 12,
        packagingType: packagingType.trim(),
        netWeight: netWeight.trim(),
        description: description.trim()
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px"
    }}>
      <div style={{
        background: "#111827",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <span style={{ fontSize: "11px", fontFamily: "JetBrains Mono, monospace", color: "#818cf8" }}>{product.sku}</span>
            <h3 style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 0 0" }}>Edit Product Formulation</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fecdd3", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null); }}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
              >
                <option value="Beverage">Beverage</option>
                <option value="Food">Food</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Supplement">Supplement</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
              Ingredients (Comma separated) *
            </label>
            <textarea
              rows={3}
              required
              value={ingredientsText}
              onChange={(e) => { setIngredientsText(e.target.value); setError(null); }}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
            />
            <span style={{ fontSize: "11px", color: "#64748b" }}>Editing ingredients automatically triggers multi-region compliance re-evaluation and allergen re-parsing.</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Shelf Life (Months)</label>
              <input
                type="number"
                min={1}
                value={shelfLifeMonths}
                onChange={(e) => setShelfLifeMonths(Number(e.target.value))}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Packaging Type</label>
              <input
                type="text"
                value={packagingType}
                onChange={(e) => setPackagingType(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>Product Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#f8fafc", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "8px 14px", borderRadius: "8px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: "8px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Save size={15} /> Save & Re-Audit Formulation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
