/**
 * Hook để record page view
 * Tự động gọi khi component mount
 */

"use client";

import { useEffect } from "react";
import { recordPageView } from "@/utils/firestore";

export function usePageView() {
  useEffect(() => {
    // Record page view khi component mount
    recordPageView().catch((error) => {
      console.error("Error recording page view:", error);
    });
  }, []);
}







