//src/contexts/AuthConfigContext.ts
import React from "react";
import { AuthConfig } from "../models/AuthConfig";

/**
 * The shape of your config context. We'll store the entire AuthConfig
 * so that anywhere in your library can read it.
 */
export const AuthConfigContext = React.createContext<AuthConfig | null>(null);

/**
 * A small helper to let components easily consume the AuthConfigContext
 */
export function useAuthConfig(): AuthConfig {
  const config = React.useContext(AuthConfigContext);
  if (!config) {
    throw new Error("useAuthConfig must be used within an AuthConfigProvider");
  }
  return config;
}