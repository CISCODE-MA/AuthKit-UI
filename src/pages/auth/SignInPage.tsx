import React, { useState } from "react";
import { InputField } from "../../components/actions/InputField";
import { SocialButton } from "../../components/actions/SocialButton";
import googleIcon from "../../assets/icons/google-icon-svgrepo-com.svg";
import microsoftIcon from "../../assets/icons/microsoft-svgrepo-com.svg";
import { toTailwindColorClasses } from "../../utils/colorHelpers";
import { useAuthConfig } from "../../context/AuthConfigContext";
import { useAuthState } from "../../context/AuthStateContext";
import { InlineError } from "../../components/InlineError";
import { AuthConfigProps } from "../../models/AuthConfig";
import { useT } from "@ciscode-template-model/translate-core";
import { useNavigate, useLocation } from "react-router";

export const SignInPage: React.FC<AuthConfigProps> = () => {
  const t = useT("authLib");
  const navigate = useNavigate();
  const location = useLocation();

  const {
    brandName = t("brandName", { defaultValue: "MyBrand" }),
    colors = { bg: "bg-sky-500", text: "text-white", border: "border-sky-500" },
    logoUrl,
    oauthProviders = [],
    illustrationUrl = t("community.illustrationUrl", {
      defaultValue:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/35ba84b8335fda2819c3a14ea3d00321a0fd0e79e571caa31108468010868ca5?placeholderIfAbsent=true&apiKey=a460e9a46e514356ac1106eada03046c",
    }),
    communityContent = {
      title: t("community.title"),
      description: t("community.description"),
    },
    baseUrl, // IMPORTANT: used for Google OAuth redirect
  } = useAuthConfig();

  const { login } = useAuthState();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allProvidersData = {
    google: { icon: googleIcon, label: "social.google" },
    microsoft: { icon: microsoftIcon, label: "social.microsoft" },
  } as const;

  const providerButtons = oauthProviders
    .filter((p) => p in allProvidersData)
    .map((p) => ({
      id: p,
      icon: allProvidersData[p as keyof typeof allProvidersData].icon,
      label: allProvidersData[p as keyof typeof allProvidersData].label,
    }));

  const { bgClass, textClass, borderClass } = toTailwindColorClasses(colors);
  const gradientClass = `${bgClass} bg-gradient-to-r from-white/10 via-white/0 to-white/0`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await login({ email, password });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        setError(t("errors.invalidCredentials"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setPending(false);
    }
  }

  function handleProviderClick(providerId: string) {
    if (!baseUrl) {
      console.error("Auth baseUrl is not configured.");
      return;
    }

    // Where to go AFTER successful OAuth login.
    // If user was redirected here from a protected page, use that;
    // otherwise, default to root "/".
    const from =
      (location.state as any)?.from?.pathname ||
      (location.state as any)?.from ||
      "/";

    // Save post-login redirect so callback route can restore it.
    sessionStorage.setItem("postLoginRedirect", from);

    if (providerId === "google") {
      const callbackPath = "/oauth/google/callback";
      const callbackUrl = `${window.location.origin}${callbackPath}`;

      const url = new URL(`${baseUrl}/auth/google`);
      url.searchParams.set("redirect", callbackUrl);

      // Full redirect to backend → Google → backend → frontend callback
      window.location.href = url.toString();
      return;
    }

    if (providerId === "microsoft") {
      const callbackPath = "/oauth/microsoft/callback";
      const callbackUrl = `${window.location.origin}${callbackPath}`;
  
      const url = new URL(`${baseUrl}/auth/microsoft`);
      url.searchParams.set("redirect", callbackUrl);
  
      window.location.href = url.toString();
      return;
    }
  }

  const spinner = (
    <svg
      className="h-4 w-4 animate-spin stroke-current"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
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
        {/* Left Illustration Panel */}
        <div className={`hidden md:flex md:w-1/2 p-12 flex-col justify-between text-white ${bgClass}`}>
          <div>
            {logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  loading="lazy"
                  src={logoUrl}
                  alt="Brand Logo"
                  className="bg-white h-8 md:h-22 rounded-lg"
                />
                <h2 className="text-sm md:text-2xl font-bold uppercase">{brandName}</h2>
              </div>
            ) : (
              <h2 className="text-sm md:text-2xl font-bold">{brandName}</h2>
            )}
          </div>
          <div className="flex-1 space-y-4 mt-6 py-4">
            <h3 className="text-2xl font-semibold leading-tight">{communityContent.title}</h3>
            <p className="text-base leading-relaxed opacity-90 ltr:text-left rtl:text-right">
              {communityContent.description}
            </p>
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <img
                loading="lazy"
                src={illustrationUrl}
                alt="Sign in illustration"
                className="max-w-sm w-full mx-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 p-6"
              />
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-4 md:p-8 m-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            {/* Logo for small screens (hidden MD+) */}
            <div className="flex items-center justify-center md:hidden mb-5">
              {logoUrl ? (
                <img
                  loading="lazy"
                  src={logoUrl}
                  alt="Brand Logo"
                  className={`h-22 rounded-full border ${borderClass}`}
                />
              ) : (
                <h2 className="text-2xl font-bold">{brandName}</h2>
              )}
            </div>

            {/* Welcome */}
            <div className="w-full md:w-auto mb-4 md:mb-0 text-center md:text-left ltr:text-center rtl:text-center md:ltr:text-left md:rtl:text-right">
              <p className="text-sm md:text-lg">
                {t("SignInPage.welcome")}{" "}
                <span className={`font-semibold ${textClass} uppercase`}>
                  {brandName}
                </span>
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                {t("SignInPage.signIn")}
              </h1>
            </div>

            {/* Sign-up prompt */}
            <div className="text-sm text-gray-500 text-center md:text-right">
              {t("SignInPage.noAccount")}
              <br />
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className={textClass}
              >
                {t("SignInPage.signUp")}
              </button>
            </div>
          </div>

          {error && <InlineError message={error} />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <InputField
              label={t("form.emailLabel")}
              type="email"
              placeholder={t("form.emailPlaceholder")}
              color={borderClass}
              value={email}
              onChange={setEmail}
            />
            <InputField
              label={t("form.passwordLabel")}
              type="password"
              placeholder={t("form.passwordPlaceholder")}
              color={borderClass}
              value={password}
              onChange={setPassword}
            />
            <div className="ltr:text-right rtl:text-left">
              <button className={`text-sm ${textClass}`}>
                {t("SignInPage.forgotPassword")}
              </button>
            </div>
            <button
              type="submit"
              disabled={pending}
              className={`relative flex w-full items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                pending ? "opacity-60 cursor-not-allowed" : ""
              } ${bgClass} text-white`}
            >
              {pending && spinner}
              {pending ? t("SignInPage.signInSubmitting") : t("SignInPage.signIn")}
            </button>

            {providerButtons.length > 0 && (
              <>
                <div className="flex items-center pt-2">
                  <div className={`flex-grow h-px ${bgClass}`} />
                  <span className={`${textClass} mx-3 text-sm`}>
                    {t("SignInPage.orLoginWith")}
                  </span>
                  <div className={`flex-grow h-px ${bgClass}`} />
                </div>
                <div className="flex gap-3 mb-6 justify-center md:justify-start">
                  {providerButtons.map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => handleProviderClick(btn.id)}
                      className="flex-1"
                    >
                      <SocialButton icon={btn.icon} label={btn.label} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};