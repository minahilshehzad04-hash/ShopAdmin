"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewCustomerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/customers?action=new");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Opening new customer form...
    </div>
  );
}
