//src/models/AuthConfig.ts
import { ColorTheme } from './ColorTheme';

export interface CustomField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select';
  placeholder?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
  defaultValue?: string;
}

// src/models/AuthConfig.ts
export interface AuthConfigProps {
  /** The base URL for your authentication API. */
  baseUrl: string;

  /** Branding / Theming */
  brandName?: string;
  logoUrl?: string;
  colors: ColorTheme;
  /** Social or OAuth providers that you want to display. */
  oauthProviders?: string[];
  illustrationUrl?: string; // Add this new prop
  communityContent?: {
    title: string;
    description: string;
  };

  /** Custom sign up URL to navigate to from SignInPage */
  customSignUpUrl?: string;

  /** Optional custom fields to add to the registration form */
  signUpCustomFields?: CustomField[];
  /** Override the default signup API endpoint */
  signUpEndpoint?: string;
  /** Format the outgoing payload before sending it to the signup endpoint */
  signUpTransformPayload?: (data: Record<string, unknown>) => Record<string, unknown>;
}
