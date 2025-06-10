"use client";

import { ReactNode } from "react";

// This is a mock EdgeStore provider until we properly integrate EdgeStore
// In a real implementation, we would use the official EdgeStore provider
export function EdgeStoreProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
