// src/pages/auth/SignInPage.tsx
import React, { useState } from "react";
import { InputField } from "../../components/actions/InputField";
import { SocialButton } from "../../components/actions/SocialButton";
import googleIcon from "../../assets/icons/google-icon-svgrepo-com.svg";
import microsoftIcon from "../../assets/icons/microsoft-svgrepo-com.svg";

import { toTailwindColorClasses } from "../../utils/colorHelpers";
import { ColorTheme } from "../../models/ColorTheme";

// If you have: import { useAuthConfig } from "../../context/AuthConfigContext";
// or if config is passed as props, either approach is valid
import { useAuthConfig } from "../../context/AuthConfigContext";
import { useAuthState } from "../../context/AuthStateContext";
import { AlertTriangle } from "lucide-react";
import { InlineError } from "../../components/InlineError";
// import { useHasRole } from "../../hooks/useAbility";


// The props you might be using (adjust as needed):
export interface SignInPageProps {
  // If you prefer to read brandName/colors from context, you might not need these props at all
  brandName?: string;
  colors?: ColorTheme;
  logoUrl?: string;
  oauthProviders?: string[];
}

/**
 * SignInPage:
 * - Renders your original sign-in UI
 * - If the user submits the form => calls useAuthState().login({ email, password })
 */
export const SignInPage: React.FC<SignInPageProps> = (props) => {
  // If you store brandName / colors / logoUrl in AuthConfigContext:
  const {
    brandName = "MyBrand",
    colors = { bg: "bg-sky-500", text: "text-white" },
    logoUrl,
    oauthProviders = [],
  } = useAuthConfig();
  // or = props if you prefer passing them directly

  // We also get login from the AuthStateContext:
  const { login } = useAuthState();

  // We'll store input fields in local state:
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build your social providers from oauthProviders
  const allProvidersData = {
    google: {
      icon: googleIcon,
      label: "Sign in with Google",
    },
    microsoft: {
      icon: microsoftIcon,
      label: "Sign in with Microsoft",
    },
  };

  const providerButtons = oauthProviders
    .filter((p) => allProvidersData[p as keyof typeof allProvidersData])
    .map((p) => {
      const { icon, label } = allProvidersData[p as keyof typeof allProvidersData];
      return { icon, label };
    });

  // Convert color theme => tailwind classes
  const { bgClass, textClass, borderClass } = toTailwindColorClasses(colors);
  const gradientClass = `${bgClass} bg-gradient-to-r from-white/10 via-white/0 to-white/0`;

  // The submit => call login
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;            // guard double‐clicks
    setError(null);
    setPending(true);
    try {
      // call login with email/password
      await login({ email, password });
      // on success, your AuthProvider sees isAuthenticated => shows children
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError('Incorrect email or password.');
      } else {
        setError('Unable to sign in. Please try again.');
      }
      // optionally show a UI error message
    } finally {
      setPending(false);
    }
  }

  const spinner = (
    <svg
      className="h-4 w-4 animate-spin stroke-current"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 018-8"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${gradientClass}`}>
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side */}
        <div className={`hidden md:flex md:w-1/2 p-12 flex-col justify-between text-white ${bgClass}`}>
          <div className={bgClass}>
            <div className="p-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Brand Logo" className="h-8 md:h-22 rounded-lg" />
              ) : (
                <h2 className="text-sm md:text-2xl font-bold">{brandName}</h2>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-8 mt-6 px-4" style={{ background: "inherit" }}>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold leading-tight">
                Join Our Developer Community
              </h3>
              <p className="text-base leading-relaxed opacity-90">
                Unlock your potential with our powerful development tools and resources.
                Join thousands of developers already building amazing applications.
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/35ba84b8335fda2819c3a14ea3d00321a0fd0e79e571caa31108468010868ca5?placeholderIfAbsent=true&apiKey=a460e9a46e514356ac1106eada03046c"
                className="max-w-sm w-full mx-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"
                alt="Sign in illustration"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full md:w-1/2 p-4 md:p-8 m-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left w-full md:w-auto mb-4 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Brand Logo"
                    className={`h-22 md:hidden rounded-full border ${borderClass}`}
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-sky-500 md:hidden">{brandName}</h2>
                )}
              </div>
              <p className="text-sm md:text-lg">
                Welcome to{" "}
                <span className={`font-semibold ${textClass}`}>
                  {brandName}
                </span>
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Sign in</h1>
            </div>
            <div className="text-sm text-gray-500 text-center md:text-right">
              No Account?
              <br />
              <button className={`${textClass}`}>
                Sign up
              </button>
            </div>
          </div>

          {error && (
            <div className="flex justify-center mb-6">
              <InlineError message={error} />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* If we have any providerButtons, show them */}
            {providerButtons.length > 0 && (
              <div className="flex gap-3 mb-6 justify-center md:justify-start">
                {providerButtons.map((btnData, idx) => (
                  <SocialButton key={idx} icon={btnData.icon} label={btnData.label} />
                ))}
              </div>
            )}

            <div>
              {/* Email Field */}
              <InputField
                label="Enter your username or email address"
                type="email"
                placeholder="Username or email address"
                color={`${borderClass}`}
                value={email}
                onChange={(val) => setEmail(val)}
              />
              {/* Password Field */}
              <InputField
                label="Enter your Password"
                type="password"
                placeholder="Password"
                color={`${borderClass}`}
                value={password}
                onChange={(val) => setPassword(val)}
              />
              <div className="text-right">
                <button className={`text-sm ${textClass}`}>Forgot Password?</button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className={`relative flex w-full items-center justify-center gap-2 py-3
                rounded-lg font-medium transition-colors
                ${pending ? 'opacity-60 cursor-not-allowed' : ''}
                ${bgClass} text-white`}
            >
              {pending && spinner}
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

