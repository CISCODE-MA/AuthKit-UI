import React, { useState } from "react";
import { useT } from "@ciscode/ui-translate-core";
import { useNavigate } from "react-router-dom";
import { InputField } from "../../components/actions/InputField";
import { InlineError } from "../../components/InlineError";
import { useAuthConfig } from "../../context/AuthConfigContext";
import { useAuthState } from "../../context/AuthStateContext";
import { toTailwindColorClasses } from "../../utils/colorHelpers";
import { extractHttpErrorMessage } from "../../utils/errorHelpers";

export const ForgotPasswordPage: React.FC = () => {
  const t = useT("authLib");
  const navigate = useNavigate();
  const { colors, brandName = t("brandName", { defaultValue: "MyBrand" }), logoUrl } = useAuthConfig();
  const { api } = useAuthState();

  const { bgClass, textClass, borderClass } = toTailwindColorClasses(colors);
  const gradientClass = `${bgClass} bg-gradient-to-r from-white/10 via-white/0 to-white/0`;

  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);
    setPending(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      // Always show generic success regardless of user existence
      setSent(true);
    } catch (err) {
      // Show backend error details.message via InlineError
      const msg = extractHttpErrorMessage(err);
      setError(msg);
      setSent(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${gradientClass}`}>
      <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            {logoUrl ? (
              <img
                loading="lazy"
                src={logoUrl}
                alt="Brand Logo"
                className={`h-10 rounded-lg border ${borderClass}`}
              />
            ) : (
              <h2 className="text-xl font-bold">{brandName}</h2>
            )}
            <button type="button" onClick={() => navigate("/login")} className={`text-sm ${textClass}`}>
              {t("ForgotPasswordPage.backToLogin", { defaultValue: "Back to Sign In" })}
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t("ForgotPasswordPage.title", { defaultValue: "Forgot your password?" })}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("ForgotPasswordPage.subtitle", { defaultValue: "Enter your email to receive a reset link." })}
          </p>

          {error && <InlineError message={error} />} 

          {sent ? (
            <div className="mt-6 rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 text-sm">
              {t("ForgotPasswordPage.sent", {
                defaultValue: "If the email exists, we’ve sent a reset link. Please check your inbox."
              })}
            </div>
          ) : (
            <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
              <InputField
                label={t("form.emailLabel")}
                type="email"
                placeholder={t("form.emailPlaceholder")}
                color={borderClass}
                value={email}
                onChange={setEmail}
              />
              <button
                type="submit"
                disabled={pending || !email}
                className={`relative flex w-full items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  pending ? "opacity-60 cursor-not-allowed" : ""
                } ${bgClass} text-white`}
              >
                {pending && (
                  <svg className="h-4 w-4 animate-spin stroke-current" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )}
                {t("ForgotPasswordPage.sendLink", { defaultValue: "Send Reset Link" })}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
