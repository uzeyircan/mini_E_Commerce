<<<<<<< HEAD
import { useState } from "react";
import ProductForm from "@/components/ProductForm";
import ProductTable from "@/components/ProductTable";
import { Product } from "@/store/product";

export default function AdminDashboard() {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <div style={{maxWidth: 1120, margin: "24px auto", padding: "0 16px", display:"grid", gap:16}}>
      <h1>Admin Panel</h1>
      <div className="grid" style={{gridTemplateColumns:"1fr 2fr"}}>
        <ProductForm edit={editing} onDone={()=>setEditing(null)} />
        <ProductTable onEdit={(p)=>setEditing(p)} />
      </div>
=======

export default function AdminDashboard() {
  return (
    <div style={{maxWidth: 1120, margin: "24px auto", padding: "0 16px"}}>
      <h1>Admin Panel</h1>
      <p>Buraya ürün yönetimi, sipariş yönetimi vb. gelecek.</p>
>>>>>>> f489b90958e10f90b9b84f4c2316ca6e24e6f448
    </div>
  );
}
