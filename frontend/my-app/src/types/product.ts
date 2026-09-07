export type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  sku: string;
  image_url?: string | null;
  status: string;
  category_id: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductInput = Omit<Product, "id" | "created_at" | "updated_at">;
