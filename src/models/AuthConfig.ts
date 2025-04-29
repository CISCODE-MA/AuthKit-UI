//src/models/AuthConfig.ts
import { ColorTheme } from "./ColorTheme";

// src/models/AuthConfig.ts
export interface AuthConfig {
    /** The base URL for your authentication API. */
    baseUrl: string;

    /** Branding / Theming */
    brandName?: string;
    logoUrl?: string;
    colors: ColorTheme
    /** Social or OAuth providers that you want to display. */
    oauthProviders?: string[];

    // Add any other flags, toggles, or parameters you need
}
