"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewOrderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/orders?action=new");
  }, [router]);

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
      Opening new order form...
    </div>
  );
}
