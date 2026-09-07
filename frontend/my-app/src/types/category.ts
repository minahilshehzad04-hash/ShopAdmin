export type Category = { id: number; name: string; description?: string | null; product_count?: number; created_at?: string; updated_at?: string };
export type CategoryInput = Omit<Category, "id" | "created_at" | "updated_at">;
