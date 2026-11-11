
import type { JwtPayload } from "../types/auth.types";

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("[decodeJwt] token malformado, partes:", parts.length);
      return null;
    }

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    const pad = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(pad);

    return JSON.parse(atob(padded)) as JwtPayload;
  } catch (e) {
    console.error("[decodeJwt] error:", e);
    return null;
  }
}