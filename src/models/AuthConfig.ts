//src/models/AuthConfig.ts
import { ColorTheme } from "./ColorTheme";

// src/models/AuthConfig.ts
export interface AuthConfigProps {
    /** The base URL for your authentication API. */
    baseUrl: string;

    /** Branding / Theming */
    brandName?: string;
    logoUrl?: string;
    colors: ColorTheme
    /** Social or OAuth providers that you want to display. */
    oauthProviders?: string[];
    illustrationUrl?: string; // Add this new prop
    communityContent?: {
        title: string;
        description: string;
    };
}
