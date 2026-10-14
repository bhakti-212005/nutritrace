export type ProductCategory = "Food" | "Beverage" | "Cosmetics" | "Supplement";
export type ProductStatus = "APPROVED" | "REVIEW_REQUIRED" | "QUARANTINED";

export interface NutritionInfo {
  servingSize: string;
  calories: number;
  totalFat: number;
  sodium: number;
  totalCarbs: number;
  sugars: number;
  protein: number;
}

export interface AllergenTag {
  id: string;
  name: string;
  icon: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  brand: string;
  batchNumber: string;
  shelfLifeMonths: number;
  packagingType: string;
  netWeight: string;
  description: string;
  ingredients: string[];
  allergens: AllergenTag[];
  status: ProductStatus;
  nutrition: NutritionInfo;
  createdAt: string;
  updatedAt: string;
}
