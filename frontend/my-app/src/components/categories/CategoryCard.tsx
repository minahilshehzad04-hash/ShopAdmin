import type { Category } from "@/types/category";
export function CategoryCard({ category }: { category: Category }) { return <div className="management-stat"><small>Category #{category.id}</small><strong>{category.name}</strong><span>{category.description || "No description"}</span></div>; }
