/**
 * Page View Tracker Component
 * Tự động record page view khi trang được load
 */

"use client";

import { useEffect } from "react";
import { recordPageView } from "@/utils/firestore";

export function PageViewTracker() {
  useEffect(() => {
    // Record page view khi component mount
    recordPageView().catch((error) => {
      console.error("Error recording page view:", error);
    });
  }, []);

  return null; // Component không render gì
}







