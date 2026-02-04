import React, { useState } from "react";
import { InputField } from "../../components/actions/InputField";
import { SocialButton } from "../../components/actions/SocialButton";
import googleIcon from "../../assets/icons/google-icon-svgrepo-com.svg";
import microsoftIcon from "../../assets/icons/microsoft-svgrepo-com.svg";
import { toTailwindColorClasses } from "../../utils/colorHelpers";
import { useAuthConfig } from "../../context/AuthConfigContext";
import { useAuthState } from "../../context/AuthStateContext";
import { InlineError } from "../../components/InlineError";
import { extractHttpErrorMessage } from "../../utils/errorHelpers";
import { useT } from "@ciscode/ui-translate-core";
import { useNavigate, useLocation } from "react-router-dom";

export const SignUpPage: React.FC = () => {
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
    baseUrl, // IMPORTANT: used for OAuth redirect (same as SignIn)
  } = useAuthConfig();

  const { api } = useAuthState();

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  const allProvidersData = {
    google: { icon: googleIcon, label: t("social.google") },
    microsoft: { icon: microsoftIcon, label: t("social.microsoft") },
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
      // 1) Register the user
      const { data } = await api.post("/api/auth/register", {
        fullname: { fname, lname },
        username,
        email,
        password,
      });

      // 2) Redirect to verify email page (no auto-login)
      if (data?.emailSent) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
        return;
      }
      // Fallback: still guide user to verify page
      navigate(`/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
      return;
    } catch (err: any) {
      const msg = extractHttpErrorMessage(err);
      setError(msg);
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
    const from =
      (location.state as any)?.from?.pathname ||
      (location.state as any)?.from ||
      "/";

    // Save post-login redirect so callback route can restore it.
    sessionStorage.setItem("postLoginRedirect", from);

    if (providerId === "google") {
      const callbackPath = "/api/oauth/google/callback";
      const callbackUrl = `${window.location.origin}${callbackPath}`;

      const url = new URL(`${baseUrl}/api/auth/google`);
      url.searchParams.set("redirect", callbackUrl);

      window.location.href = url.toString();
      return;
    }

    if (providerId === "microsoft") {
      const callbackPath = "/api/oauth/microsoft/callback";
      const callbackUrl = `${window.location.origin}${callbackPath}`;

      const url = new URL(`${baseUrl}/api/auth/microsoft`);
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
                <h2 className="text-sm md:text-2xl font-bold uppercase">
                  {brandName}
                </h2>
              </div>
            ) : (
              <h2 className="text-sm md:text-2xl font-bold">{brandName}</h2>
            )}
          </div>
          <div className="flex-1 space-y-4 mt-6 py-4">
            <h3 className="text-2xl font-semibold leading-tight">
              {communityContent.title}
            </h3>
            <p className="text-base leading-relaxed opacity-90 ltr:text-left rtl:text-right">
              {communityContent.description}
            </p>
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <img
                loading="lazy"
                src={illustrationUrl}
                alt="Sign up illustration"
                className="max-w-sm w-full mx-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 p-6"
              />
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-4 md:p-8 m-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            {/* Logo for small screens */}
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

            {/* Title / subtitle */}
            <div className="w-full md:w-auto mb-4 md:mb-0 text-center md:text-left ltr:text-center rtl:text-center md:ltr:text-left md:rtl:text-right">
              <p className="text-sm md:text-lg">
                {t("SignUpPage.welcome", { defaultValue: "Join" })}{" "}
                <span className={`font-semibold ${textClass} uppercase`}>
                  {brandName}
                </span>
              </p>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
                {t("SignUpPage.signUp", { defaultValue: "Sign up" })}
              </h1>
            </div>

            {/* Sign-in prompt */}
            <div className="text-sm text-gray-500 text-center md:text-right">
              {t("SignUpPage.alreadyHaveAccount", {
                defaultValue: "Already have an account?",
              })}
              <br />
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={textClass}
              >
                {t("SignUpPage.signIn", { defaultValue: "Sign in" })}
              </button>
            </div>
          </div>

          {error && <InlineError message={error} />}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <InputField
                label={t("form.fnameLabel", { defaultValue: "First Name" })}
                type="text"
                placeholder={t("form.fnamePlaceholder", { defaultValue: "Enter your first name" })}
                color={borderClass}
                value={fname}
                onChange={setFname}
              />
              <InputField
                label={t("form.lnameLabel", { defaultValue: "Last Name" })}
                type="text"
                placeholder={t("form.lnamePlaceholder", { defaultValue: "Enter your last name" })}
                color={borderClass}
                value={lname}
                onChange={setLname}
              />
            </div>
            <InputField
              label={t("form.usernameLabel", { defaultValue: "Username" })}
              type="text"
              placeholder={t("form.usernamePlaceholder", { defaultValue: "Choose a username" })}
              color={borderClass}
              value={username}
              onChange={setUsername}
            />
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


            <div className="flex items-center gap-2">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="form-checkbox"
              />
              <label htmlFor="agree" className="text-sm">
                I agree to the <span className="underline cursor-pointer">terms and conditions</span> (placeholder)
              </label>
            </div>

            <button
              type="submit"
              disabled={pending}
              className={`relative flex w-full items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${pending ? "opacity-60 cursor-not-allowed" : ""} ${bgClass} text-white`}
            >
              {pending && spinner}
              {pending
                ? t("SignUpPage.signUpSubmitting", {
                  defaultValue: "Creating account...",
                })
                : t("SignUpPage.signUp", { defaultValue: "Sign up" })}
            </button>

            {providerButtons.length > 0 && (
              <>
                <div className="flex items-center pt-2">
                  <div className={`flex-grow h-px ${bgClass}`} />
                  <span className={`${textClass} mx-3 text-sm`}>
                    {t("SignUpPage.orContinueWith", {
                      defaultValue: "Or continue with",
                    })}
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